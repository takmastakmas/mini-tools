/**
 * ルーレット順番設定ウィンドウ
 *
 * @class RouletteSettingsWindow
 * @description メイン画面（roulette.js）が保存した参加者名を読み込み、
 * 参加者ごとに固定の抽選番号（1〜参加者数）を設定してLocalStorageに保存する
 */
class RouletteSettingsWindow {
    constructor() {
        this.namesStorageKey = 'roulette_names';
        this.fixedNumbersStorageKey = 'roulette_fixed_numbers';

        this.elements = {
            assignmentList: null,
            emptyState: null,
            staleWarning: null,
            saveBtn: null,
            resetBtn: null
        };

        this.state = {
            names: [],       // 現在の参加者名（詰めた順序、roulette_namesと同じ並び）
            rawAssignments: [] // LocalStorageに保存されていた生の固定番号（表示の初期値用）
        };

        this.init();
    }

    init() {
        this.initElements();
        this.loadNames();
        this.loadAssignments();
        this.render();
        this.attachEventListeners();
    }

    initElements() {
        this.elements = {
            assignmentList: document.getElementById('assignmentList'),
            emptyState: document.getElementById('emptyState'),
            staleWarning: document.getElementById('staleWarning'),
            saveBtn: document.getElementById('saveBtn'),
            resetBtn: document.getElementById('resetBtn')
        };
    }

    attachEventListeners() {
        this.elements.saveBtn?.addEventListener('click', () => this.save());
        this.elements.resetBtn?.addEventListener('click', () => this.resetAll());
        this.elements.assignmentList?.addEventListener('input', () => this.validateAll());

        // メイン画面での参加者リストの変更をリアルタイムに反映
        window.addEventListener('storage', (e) => this.handleStorageEvent(e));
    }

    handleStorageEvent(e) {
        if (e.key === this.namesStorageKey) {
            this.loadNames();
            this.loadAssignments();
            this.render();
        } else if (e.key === this.fixedNumbersStorageKey) {
            this.loadAssignments();
            this.render();
        }
    }

    /**
     * 現在の参加者名をLocalStorageから読み込む
     */
    loadNames() {
        const data = AppUtils.loadFromStorage(this.namesStorageKey);
        this.state.names = (data && Array.isArray(data.names)) ? data.names : [];
    }

    /**
     * 保存済みの固定番号設定を読み込む（サニタイズはせず、生の値のまま保持）
     */
    loadAssignments() {
        const data = AppUtils.loadFromStorage(this.fixedNumbersStorageKey);
        this.state.rawAssignments = (data && Array.isArray(data.assignments)) ? data.assignments : [];
        this.state.savedNamesSnapshot = (data && Array.isArray(data.names)) ? data.names : null;
    }

    /**
     * 画面全体を再描画する
     */
    render() {
        const totalNumbers = this.state.names.length;

        this.elements.emptyState.classList.toggle('hidden', totalNumbers > 0);
        this.elements.assignmentList.classList.toggle('hidden', totalNumbers === 0);
        this.elements.assignmentList.innerHTML = '';

        this.state.names.forEach((name, index) => {
            const row = document.createElement('div');
            row.className = 'assignment-row';
            row.dataset.index = String(index);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'assignment-name';
            nameSpan.textContent = name;

            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'assignment-input';
            input.min = '1';
            input.max = String(totalNumbers);
            input.placeholder = 'ランダム';
            input.dataset.index = String(index);

            const rawValue = this.state.rawAssignments[index];
            if (rawValue !== null && rawValue !== undefined && Number.isFinite(Number(rawValue))) {
                input.value = rawValue;
            }

            const errorSpan = document.createElement('span');
            errorSpan.className = 'assignment-error hidden';

            row.appendChild(nameSpan);
            row.appendChild(input);
            row.appendChild(errorSpan);
            this.elements.assignmentList.appendChild(row);
        });

        this.updateStaleWarning();
        this.validateAll();
    }

    /**
     * 保存済みスナップショットと現在の参加者名を比較し、古い設定である旨を警告表示する
     */
    updateStaleWarning() {
        const snapshot = this.state.savedNamesSnapshot;
        if (!snapshot) {
            this.elements.staleWarning.classList.add('hidden');
            return;
        }

        const current = this.state.names;
        const same = snapshot.length === current.length && snapshot.every((n, i) => n === current[i]);
        this.elements.staleWarning.classList.toggle('hidden', same);
    }

    /**
     * 全行の入力値を検証し、範囲外・重複にエラー表示を行う
     * @returns {boolean} 全体として保存可能かどうか
     */
    validateAll() {
        const totalNumbers = this.state.names.length;
        const rows = Array.from(this.elements.assignmentList.querySelectorAll('.assignment-row'));

        // 有効な値の出現回数をカウント（重複検出用）
        const counts = new Map();
        rows.forEach(row => {
            const input = row.querySelector('.assignment-input');
            const raw = input.value.trim();
            if (raw === '') return;

            const num = Number(raw);
            if (Number.isInteger(num) && num >= 1 && num <= totalNumbers) {
                counts.set(num, (counts.get(num) || 0) + 1);
            }
        });

        let hasError = false;
        rows.forEach(row => {
            const input = row.querySelector('.assignment-input');
            const errorSpan = row.querySelector('.assignment-error');
            const raw = input.value.trim();

            let message = '';
            if (raw !== '') {
                const num = Number(raw);
                if (!Number.isInteger(num) || num < 1 || num > totalNumbers) {
                    message = `1〜${totalNumbers}の整数で入力してください`;
                } else if (counts.get(num) > 1) {
                    message = '番号が重複しています';
                }
            }

            row.classList.toggle('has-error', message !== '');
            errorSpan.textContent = message;
            errorSpan.classList.toggle('hidden', message === '');

            if (message !== '') hasError = true;
        });

        const canSave = totalNumbers > 0 && !hasError;
        this.elements.saveBtn.disabled = !canSave;

        return canSave;
    }

    /**
     * 現在の入力内容をLocalStorageに保存する
     */
    save() {
        if (!this.validateAll()) {
            AppUtils.showToast('入力内容にエラーがあります', 'error');
            return;
        }

        const inputs = Array.from(this.elements.assignmentList.querySelectorAll('.assignment-input'));
        const assignments = inputs.map(input => {
            const raw = input.value.trim();
            return raw === '' ? null : Number(raw);
        });

        AppUtils.saveToStorage(this.fixedNumbersStorageKey, {
            assignments,
            names: [...this.state.names],
            timestamp: Date.now()
        });

        this.loadAssignments();
        this.updateStaleWarning();

        AppUtils.showToast('設定を保存しました', 'success');
    }

    /**
     * 固定番号設定をすべてクリアする
     */
    resetAll() {
        if (!confirm('固定番号設定をすべてクリアしますか？')) {
            return;
        }

        AppUtils.removeFromStorage(this.fixedNumbersStorageKey);
        this.state.rawAssignments = [];
        this.state.savedNamesSnapshot = null;
        this.render();

        AppUtils.showToast('固定番号設定をクリアしました', 'info');
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new RouletteSettingsWindow();
});
