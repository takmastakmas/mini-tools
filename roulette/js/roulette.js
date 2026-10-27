/**
 * ランダム抽選ルーレットアプリケーション
 * 
 * @class RouletteApp
 * @description 参加者の発表順などをランダムに決定するルーレットアプリ
 * 最大30名まで対応し、重複なしで1から人数分の番号を割り当てる
 */
class RouletteApp {
    /**
     * コンストラクタ
     */
    constructor() {
        // ストレージキー
        this.storageKey = 'roulette_names';
        this.fixedNumbersStorageKey = 'roulette_fixed_numbers';

        // 設定用ポップアップウィンドウの参照
        this.settingsWindow = null;

        // DOM要素
        this.elements = {
            nameInputs: null,
            rouletteNumbers: null,
            nameCount: null,
            settingsBtn: null,
            startBtn: null,
            stopBtn: null,
            copyBtn: null,
            clearResultBtn: null,
            clearAllBtn: null,
            flashOverlay: null
        };
        
        // 状態管理
        this.state = {
            names: [],
            isSpinning: false,
            spinInterval: null,
            spinSpeed: 50,
            slowDownStartTime: 0,
            assignedNumbers: [],
            spinCount: 0
        };
        
        // 初期化
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.updateNameCount();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            nameInputs: document.querySelectorAll('.name-input'),
            rouletteNumbers: document.querySelectorAll('.roulette-number'),
            nameCount: document.getElementById('nameCount'),
            settingsBtn: document.getElementById('settingsBtn'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            copyBtn: document.getElementById('copyBtn'),
            clearResultBtn: document.getElementById('clearResultBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            flashOverlay: document.getElementById('flashOverlay')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // 名前入力時（デバウンス付き自動保存）
        this.elements.nameInputs.forEach(input => {
            input.addEventListener('input', AppUtils.debounce(() => {
                this.updateNameCount();
                this.saveToStorage();
            }, 500));
        });
        
        // ボタンイベント
        this.elements.settingsBtn?.addEventListener('click', () => this.openSettingsWindow());
        this.elements.startBtn?.addEventListener('click', () => this.startRoulette());
        this.elements.stopBtn?.addEventListener('click', () => this.stopRoulette());
        this.elements.copyBtn?.addEventListener('click', () => this.copyResults());
        this.elements.clearResultBtn?.addEventListener('click', () => this.clearResult());
        this.elements.clearAllBtn?.addEventListener('click', () => this.clearAll());
    }
    
    /**
     * 名前数をカウントして更新
     */
    updateNameCount() {
        this.state.names = [];
        this.elements.nameInputs.forEach((input, index) => {
            // XSS対策: エスケープ処理
            const name = AppUtils.escapeHtml(input.value.trim());
            
            // 入力検証
            if (name !== '' && this.validateInput(name, input)) {
                this.state.names.push({ index: index, name: name });
            }
        });
        
        if (this.elements.nameCount) {
            this.elements.nameCount.textContent = this.state.names.length;
        }
    }
    
    /**
     * 入力値の検証
     * @param {string} name - 検証する名前
     * @param {HTMLInputElement} input - 入力要素
     * @returns {boolean} 検証結果
     */
    validateInput(name, input) {
        // 長さチェック
        if (name.length > 50) {
            AppUtils.showToast('名前は50文字以内で入力してください', 'warning');
            input.value = name.substring(0, 50);
            return false;
        }
        
        return true;
    }
    
    /**
     * 順番指定設定画面を別ウィンドウで開く
     * 既に開いている場合はフォーカスするだけで、新たに開き直さない
     */
    openSettingsWindow() {
        if (this.settingsWindow && !this.settingsWindow.closed) {
            this.settingsWindow.focus();
            return;
        }

        const width = 820;
        const height = 480;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        this.settingsWindow = window.open(
            'settings.html',
            'rouletteSettings',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no`
        );

        if (!this.settingsWindow) {
            AppUtils.showToast('ポップアップがブロックされました。ブラウザの設定を確認してください', 'error');
        }
    }

    /**
     * 設定画面で保存された固定番号を読み込み、現在の参加者数に対して安全な形に整形する
     * 範囲外の番号・重複した番号は無視する（無視された参加者はランダム抽選扱いになる）
     * @param {number} totalNumbers - 現在の参加者数
     * @returns {Map<number, number>} 詰めた名前配列内の位置 -> 固定番号
     */
    getSanitizedFixedAssignments(totalNumbers) {
        const result = new Map();
        const data = AppUtils.loadFromStorage(this.fixedNumbersStorageKey);

        if (!data || !Array.isArray(data.assignments)) {
            return result;
        }

        const usedNumbers = new Set();
        data.assignments.forEach((value, index) => {
            if (index >= totalNumbers) return;
            if (value === null || value === undefined || value === '') return;

            const num = Number(value);
            if (!Number.isInteger(num) || num < 1 || num > totalNumbers) return;
            if (usedNumbers.has(num)) return;

            usedNumbers.add(num);
            result.set(index, num);
        });

        return result;
    }

    /**
     * ルーレットを開始する
     */
    startRoulette() {
        this.updateNameCount();

        if (this.state.names.length === 0) {
            AppUtils.showToast('名前を入力してください', 'warning');
            return;
        }

        // ボタン状態の更新
        this.elements.startBtn.disabled = true;
        this.elements.settingsBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.elements.copyBtn.disabled = true;
        this.elements.nameInputs.forEach(input => input.disabled = true);
        
        // 状態初期化
        this.state.isSpinning = true;
        this.state.spinSpeed = 50;
        this.state.spinCount = 0;
        this.state.assignedNumbers = [];
        
        // すべてのルーレット番号をクリア
        this.elements.rouletteNumbers.forEach(num => {
            num.textContent = '';
            num.classList.remove('stopped', 'first', 'last', 'middle');
        });
        
        // ルーレット開始
        this.spinNumbers();
    }
    
    /**
     * 数字をランダムに回転させる
     */
    spinNumbers() {
        if (!this.state.isSpinning) return;
        
        const totalNumbers = this.state.names.length;
        const availableNumbers = Array.from({length: totalNumbers}, (_, i) => i + 1);
        
        // シャッフル（共通ユーティリティを使用）
        const shuffled = AppUtils.shuffle([...availableNumbers]);
        
        let shuffledIndex = 0;
        this.state.names.forEach((nameObj) => {
            const numberSpan = this.elements.rouletteNumbers[nameObj.index];
            if (!numberSpan.classList.contains('stopped')) {
                numberSpan.textContent = shuffled[shuffledIndex % shuffled.length];
                numberSpan.classList.add('spinning');
                shuffledIndex++;
            }
        });
        
        this.state.spinInterval = setTimeout(() => this.spinNumbers(), this.state.spinSpeed);
    }
    
    /**
     * ルーレットを停止する（徐々に減速）
     */
    stopRoulette() {
        this.elements.stopBtn.disabled = true;
        this.state.slowDownStartTime = Date.now();
        this.state.spinCount = 0;
        this.slowDownAndStop();
    }
    
    /**
     * 減速して停止（段階的な演出）
     */
    slowDownAndStop() {
        if (this.state.spinInterval) {
            clearTimeout(this.state.spinInterval);
        }
        
        const elapsed = Date.now() - this.state.slowDownStartTime;
        const normalSlowDownDuration = 2500; // フェーズ1: 通常の減速 2.5秒
        
        // フェーズ1: 通常の減速（2.5秒）
        if (elapsed < normalSlowDownDuration) {
            const progress = elapsed / normalSlowDownDuration;
            this.state.spinSpeed = 50 + (progress * 350); // 50ms → 400ms
            
            this.updateSpinningNumbers();
            this.state.spinCount++;
            
            setTimeout(() => this.slowDownAndStop(), this.state.spinSpeed);
        }
        // フェーズ2: 500ms間隔で5回
        else if (this.state.spinCount < 5) {
            this.state.spinSpeed = 500;
            
            this.updateSpinningNumbers();
            this.state.spinCount++;
            
            setTimeout(() => this.slowDownAndStop(), this.state.spinSpeed);
        }
        // フェーズ3: 800ms間隔で2回
        else if (this.state.spinCount < 7) {
            this.state.spinSpeed = 800;
            
            this.updateSpinningNumbers();
            this.state.spinCount++;
            
            setTimeout(() => this.slowDownAndStop(), this.state.spinSpeed);
        }
        // フェーズ4: 1秒で1回
        else if (this.state.spinCount === 7) {
            this.state.spinSpeed = 1000;
            
            this.updateSpinningNumbers();
            this.state.spinCount++;
            
            setTimeout(() => this.slowDownAndStop(), this.state.spinSpeed);
        }
        // フェーズ5: 1秒で1回
        else if (this.state.spinCount === 8) {
            this.state.spinSpeed = 1000;
            
            this.updateSpinningNumbers();
            this.state.spinCount++;
            
            setTimeout(() => this.slowDownAndStop(), this.state.spinSpeed);
        }
        // フェーズ6: 確定
        else {
            this.finalizeResults();
        }
    }
    
    /**
     * スピニング中の数字更新（重複なし）
     */
    updateSpinningNumbers() {
        const totalNumbers = this.state.names.length;
        const availableNumbers = Array.from({length: totalNumbers}, (_, i) => i + 1);
        
        // シャッフル（共通ユーティリティを使用）
        const shuffled = AppUtils.shuffle([...availableNumbers]);
        
        let shuffledIndex = 0;
        this.state.names.forEach((nameObj) => {
            const numberSpan = this.elements.rouletteNumbers[nameObj.index];
            if (!numberSpan.classList.contains('stopped')) {
                numberSpan.textContent = shuffled[shuffledIndex % shuffled.length];
                shuffledIndex++;
            }
        });
    }
    
    /**
     * 最終結果を確定
     */
    finalizeResults() {
        this.state.isSpinning = false;

        const totalNumbers = this.state.names.length;

        // 設定画面で固定された番号を取得（範囲外・重複は自動的に除外済み）
        const fixedAssignments = this.getSanitizedFixedAssignments(totalNumbers);
        const usedNumbers = new Set(fixedAssignments.values());

        // 固定されていない番号だけをシャッフル（共通ユーティリティを使用）
        const remainingPool = AppUtils.shuffle(
            Array.from({length: totalNumbers}, (_, i) => i + 1).filter(n => !usedNumbers.has(n))
        );

        let poolIndex = 0;
        this.state.names.forEach((nameObj, index) => {
            const numberSpan = this.elements.rouletteNumbers[nameObj.index];
            numberSpan.classList.remove('spinning');
            numberSpan.classList.add('stopped');

            const assignedNumber = fixedAssignments.has(index)
                ? fixedAssignments.get(index)
                : remainingPool[poolIndex++];
            numberSpan.textContent = assignedNumber;

            // 1番と最終番号は濃いオレンジ、間の番号は淡いオレンジ
            if (assignedNumber === 1 || assignedNumber === totalNumbers) {
                numberSpan.classList.add('first');
            } else {
                numberSpan.classList.add('middle');
            }
        });

        // 画面フラッシュ演出
        this.triggerFlashEffect();

        // ボタン状態の更新
        this.elements.startBtn.disabled = false;
        this.elements.settingsBtn.disabled = false;
        this.elements.copyBtn.disabled = false;
        this.elements.nameInputs.forEach(input => input.disabled = false);
        
        // 成功メッセージ
        AppUtils.showToast('抽選が完了しました！', 'success');
    }
    
    /**
     * 画面フラッシュ演出
     */
    triggerFlashEffect() {
        if (!this.elements.flashOverlay) return;
        
        this.elements.flashOverlay.classList.add('active');
        
        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            this.elements.flashOverlay.classList.remove('active');
        }, 600);
    }
    
    /**
     * 結果をコピー（タブ区切り）
     */
    async copyResults() {
        // 入力されている名前と番号を取得
        if (this.state.names.length === 0) {
            AppUtils.showToast('まだ抽選結果がありません', 'warning');
            return;
        }
        
        // 停止しているかチェック
        const hasStoppedNumbers = Array.from(this.elements.rouletteNumbers).some(num => 
            num.classList.contains('stopped')
        );
        
        if (!hasStoppedNumbers) {
            AppUtils.showToast('まだ抽選結果がありません', 'warning');
            return;
        }
        
        let resultText = '';
        this.state.names.forEach((nameObj) => {
            const numberSpan = this.elements.rouletteNumbers[nameObj.index];
            if (numberSpan.classList.contains('stopped')) {
                const number = numberSpan.textContent;
                resultText += `${nameObj.name}\t${number}\n`;
            }
        });
        
        // クリップボードにコピー（共通ユーティリティを使用）
        try {
            await AppUtils.copyToClipboard(resultText.trim());
            
            // 成功メッセージ
            const originalText = this.elements.copyBtn.innerHTML;
            this.elements.copyBtn.innerHTML = '<span class="btn-icon">✅</span> コピーしました！';
            this.elements.copyBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            
            setTimeout(() => {
                this.elements.copyBtn.innerHTML = originalText;
                this.elements.copyBtn.style.background = '';
            }, 2000);
            
            AppUtils.showToast('結果をクリップボードにコピーしました', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            AppUtils.showToast('コピーに失敗しました', 'error');
        }
    }
    
    /**
     * 結果のクリア（名前は残す）
     */
    clearResult() {
        if (this.state.isSpinning) {
            AppUtils.showToast('ルーレット中はクリアできません', 'warning');
            return;
        }
        
        // 停止しているかチェック
        const hasStoppedNumbers = Array.from(this.elements.rouletteNumbers).some(num => 
            num.classList.contains('stopped')
        );
        
        if (!hasStoppedNumbers) {
            AppUtils.showToast('クリアする結果がありません', 'warning');
            return;
        }
        
        // 結果の番号だけをクリア（名前は残す）
        this.elements.rouletteNumbers.forEach(num => {
            num.textContent = '';
            num.classList.remove('spinning', 'stopped', 'first', 'last', 'middle');
        });
        
        this.elements.copyBtn.disabled = true;
        
        AppUtils.showToast('結果をクリアしました', 'info');
    }
    
    /**
     * すべてクリア
     */
    clearAll() {
        if (this.state.isSpinning) {
            AppUtils.showToast('ルーレット中はクリアできません', 'warning');
            return;
        }
        
        if (this.state.names.length === 0) {
            return;
        }
        
        if (confirm('入力内容と結果、順番設定をすべてクリアしますか？')) {
            this.elements.nameInputs.forEach(input => input.value = '');
            this.elements.rouletteNumbers.forEach(num => {
                num.textContent = '';
                num.classList.remove('spinning', 'stopped', 'first', 'last', 'middle');
            });
            this.state.names = [];
            this.elements.nameCount.textContent = '0';
            this.elements.copyBtn.disabled = true;

            // ストレージもクリア
            AppUtils.removeFromStorage(this.storageKey);
            AppUtils.removeFromStorage(this.fixedNumbersStorageKey);

            AppUtils.showToast('すべてクリアしました', 'info');
        }
    }
    
    /**
     * データの保存
     */
    saveToStorage() {
        try {
            const names = Array.from(this.elements.nameInputs)
                .map(input => AppUtils.escapeHtml(input.value.trim()))
                .filter(name => name !== '');
            
            AppUtils.saveToStorage(this.storageKey, {
                names,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Save to storage failed:', error);
        }
    }
    
    /**
     * データの読み込み
     */
    loadFromStorage() {
        try {
            const data = AppUtils.loadFromStorage(this.storageKey);
            if (data && data.names && Array.isArray(data.names)) {
                data.names.forEach((name, index) => {
                    if (this.elements.nameInputs[index]) {
                        // エスケープ解除して表示（既にエスケープ済みのため）
                        this.elements.nameInputs[index].value = name;
                    }
                });
                this.updateNameCount();
            }
        } catch (error) {
            console.error('Load from storage failed:', error);
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new RouletteApp();
});
