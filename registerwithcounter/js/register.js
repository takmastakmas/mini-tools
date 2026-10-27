/**
 * Register with Counter App
 * 参加者カウンター管理アプリケーション
 * 
 * @class RegisterWithCounterApp
 * @description 参加者ごとの発言回数や行動回数をカウント管理するアプリ
 */
class RegisterWithCounterApp {
    constructor() {
        // ストレージキー
        this.storageKey = 'participantCounters';
        
        // DOM要素
        this.elements = {};
        
        // 状態管理
        this.state = {
            counters: [],
            rowLabel: '',
            counterNames: { A: 'カウンターA', B: 'カウンターB' },
            sortConfig: { key: null, direction: 'asc' },
            currentMemoId: null
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
        this.render();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            participantInput: document.getElementById('participantInput'),
            createCountersBtn: document.getElementById('createCountersBtn'),
            clearInputBtn: document.getElementById('clearInputBtn'),
            resetAllBtn: document.getElementById('resetAllBtn'),
            deleteAllBtn: document.getElementById('deleteAllBtn'),
            downloadCsvBtn: document.getElementById('downloadCsvBtn'),
            uploadCsvBtnTop: document.getElementById('uploadCsvBtnTop'),
            csvFileInputTop: document.getElementById('csvFileInputTop'),
            updateCounterNamesBtn: document.getElementById('updateCounterNamesBtn'),
            counterAName: document.getElementById('counterAName'),
            counterBName: document.getElementById('counterBName'),
            countersArea: document.getElementById('countersArea'),
            emptyMessage: document.getElementById('emptyMessage'),
            controlArea: document.getElementById('controlArea'),
            participantCount: document.getElementById('participantCount'),
            useFirstRowAsLabel: document.getElementById('useFirstRowAsLabel'),
            memoModal: document.getElementById('memoModal'),
            closeMemoModal: document.getElementById('closeMemoModal'),
            cancelMemoBtn: document.getElementById('cancelMemoBtn'),
            saveMemoBtn: document.getElementById('saveMemoBtn'),
            memoTargetName: document.getElementById('memoTargetName'),
            memoTextarea: document.getElementById('memoTextarea')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // メインボタン
        this.elements.createCountersBtn?.addEventListener('click', () => this.createCounters());
        this.elements.clearInputBtn?.addEventListener('click', () => this.clearInput());
        this.elements.resetAllBtn?.addEventListener('click', () => this.resetAllCounters());
        this.elements.deleteAllBtn?.addEventListener('click', () => this.deleteAllCounters());
        this.elements.updateCounterNamesBtn?.addEventListener('click', () => this.updateCounterNames());
        this.elements.downloadCsvBtn?.addEventListener('click', () => this.downloadCsv());
        this.elements.uploadCsvBtnTop?.addEventListener('click', () => this.elements.csvFileInputTop.click());
        this.elements.csvFileInputTop?.addEventListener('change', (e) => this.uploadCsv(e));
        
        // メモモーダル
        this.elements.closeMemoModal?.addEventListener('click', () => this.closeMemoModal());
        this.elements.cancelMemoBtn?.addEventListener('click', () => this.closeMemoModal());
        this.elements.saveMemoBtn?.addEventListener('click', () => this.saveMemoAction());
        
        // モーダル背景クリックで閉じる
        this.elements.memoModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.memoModal) {
                this.closeMemoModal();
            }
        });
    }
    
    /**
     * カウンターの作成
     */
    createCounters() {
        const input = this.elements.participantInput?.value.trim();
        
        if (!input) {
            this.showToast('参加者名を入力してください', 'warning');
            return;
        }
        
        // 改行で分割
        let lines = input.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        if (lines.length === 0) {
            this.showToast('有効な参加者名が見つかりません', 'warning');
            return;
        }
        
        // 1行目をラベルとして使用するかチェック
        if (this.elements.useFirstRowAsLabel?.checked && lines.length > 0) {
            this.state.rowLabel = lines[0];
            lines = lines.slice(1);
        } else {
            this.state.rowLabel = '';
        }
        
        if (lines.length === 0) {
            this.showToast('参加者名が見つかりません（1行目のみが入力されています）', 'warning');
            return;
        }
        
        // 重複チェックと新規追加
        let addedCount = 0;
        lines.forEach(line => {
            let name, group;
            
            // タブ区切りかどうかをチェック
            if (line.includes('\t')) {
                const parts = line.split('\t').map(p => p.trim()).filter(p => p.length > 0);
                if (parts.length >= 2) {
                    group = parts[0];
                    name = parts[1];
                } else if (parts.length === 1) {
                    name = parts[0];
                    group = '';
                } else {
                    return;
                }
            } else {
                name = line;
                group = '';
            }
            
            // すでに存在する名前はスキップ
            const exists = this.state.counters.some(counter => 
                counter.name === name && counter.group === group
            );
            
            if (!exists && name) {
                this.state.counters.push({
                    id: Date.now() + Math.random(),
                    name: name,
                    group: group,
                    countA: 0,
                    countB: 0,
                    memo: ''
                });
                addedCount++;
            }
        });
        
        if (addedCount === 0) {
            this.showToast('すべての参加者はすでに追加されています', 'info');
        } else {
            this.render();
            this.elements.participantInput.value = '';
            this.saveToStorage();
            this.showToast(`${addedCount}人の参加者を追加しました`, 'success');
        }
    }
    
    /**
     * カウンターの表示（テーブル形式）
     */
    renderCounters() {
        if (!this.elements.countersArea) return;
        
        this.elements.countersArea.innerHTML = '';
        
        if (this.state.counters.length === 0) {
            this.elements.emptyMessage?.classList.remove('hidden');
            this.elements.controlArea?.classList.add('hidden');
            this.elements.countersArea?.classList.add('hidden');
            return;
        }
        
        this.elements.emptyMessage?.classList.add('hidden');
        this.elements.controlArea?.classList.remove('hidden');
        this.elements.countersArea?.classList.remove('hidden');
        
        // 統計情報の更新
        this.updateStats();
        
        // グループが存在するかチェック
        const hasGroups = this.state.counters.some(c => c.group && c.group.length > 0);
        
        // テーブルを作成
        const table = document.createElement('table');
        table.className = 'counter-table';
        
        // テーブルヘッダー
        table.appendChild(this.createTableHeader(hasGroups));
        
        // テーブルボディ
        const tbody = document.createElement('tbody');
        const sortedCounters = this.getSortedCounters();
        
        sortedCounters.forEach((counter) => {
            const row = this.createCounterRow(counter, hasGroups);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        this.elements.countersArea.appendChild(table);
    }
    
    /**
     * テーブルヘッダーの作成
     */
    createTableHeader(hasGroups) {
        const thead = document.createElement('thead');
        
        if (hasGroups) {
            let groupLabel = 'グループ';
            let nameLabel = '名前';
            
            if (this.state.rowLabel && this.state.rowLabel.includes('\t')) {
                const labels = this.state.rowLabel.split('\t').map(l => l.trim());
                if (labels.length >= 2) {
                    groupLabel = labels[0] || 'グループ';
                    nameLabel = labels[1] || '名前';
                }
            } else if (this.state.rowLabel) {
                nameLabel = this.state.rowLabel;
            }
            
            thead.innerHTML = `
                <tr>
                    <th class="sortable" data-sort="group">
                        ${groupLabel} ${this.getSortIcon('group')}
                    </th>
                    <th class="sortable" data-sort="name">
                        ${nameLabel} ${this.getSortIcon('name')}
                    </th>
                    <th colspan="3" class="sortable" data-sort="countA">
                        ${this.state.counterNames.A} ${this.getSortIcon('countA')}
                    </th>
                    <th colspan="3" class="sortable" data-sort="countB">
                        ${this.state.counterNames.B} ${this.getSortIcon('countB')}
                    </th>
                    <th>メモ</th>
                    <th>削除</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th class="sortable" data-sort="name">
                        ${this.state.rowLabel || '名前'} ${this.getSortIcon('name')}
                    </th>
                    <th colspan="3" class="sortable" data-sort="countA">
                        ${this.state.counterNames.A} ${this.getSortIcon('countA')}
                    </th>
                    <th colspan="3" class="sortable" data-sort="countB">
                        ${this.state.counterNames.B} ${this.getSortIcon('countB')}
                    </th>
                    <th>メモ</th>
                    <th>削除</th>
                </tr>
            `;
        }
        
        // ソートイベントを設定
        thead.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortKey = th.getAttribute('data-sort');
                this.sortTable(sortKey);
            });
        });
        
        return thead;
    }
    
    /**
     * カウンター行の作成
     */
    createCounterRow(counter, hasGroups) {
        const row = document.createElement('tr');
        
        let rowHTML = '';
        
        // グループ列
        if (hasGroups) {
            rowHTML += `
                <td>
                    <input 
                        type="text" 
                        value="${counter.group || ''}" 
                        data-field="group"
                        data-id="${counter.id}"
                    />
                </td>
            `;
        }
        
        // 名前列
        rowHTML += `
            <td>
                <input 
                    type="text" 
                    value="${counter.name}" 
                    data-field="name"
                    data-id="${counter.id}"
                />
            </td>
        `;
        
        // カウンターA
        rowHTML += this.createCounterGroup(counter, 'A');
        
        // カウンターB
        rowHTML += this.createCounterGroup(counter, 'B');
        
        // メモボタン
        rowHTML += `
            <td>
                <button 
                    class="counter-btn counter-btn-memo ${counter.memo ? 'has-memo' : ''}"
                    data-action="memo"
                    data-id="${counter.id}"
                    title="${counter.memo ? 'メモ: ' + counter.memo : 'メモを追加'}"
                >
                    <i class="fas fa-sticky-note"></i>
                </button>
            </td>
        `;
        
        // 削除ボタン
        rowHTML += `
            <td>
                <button 
                    class="counter-btn counter-btn-delete"
                    data-action="delete"
                    data-id="${counter.id}"
                    title="削除"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        row.innerHTML = rowHTML;
        
        // イベントリスナーを追加
        row.querySelectorAll('button[data-action]').forEach(button => {
            button.addEventListener('click', (e) => this.handleCounterAction(e));
        });
        
        row.querySelectorAll('input[data-field]').forEach(input => {
            input.addEventListener('change', (e) => this.handleFieldChange(e));
            input.addEventListener('blur', (e) => this.handleFieldChange(e));
        });
        
        return row;
    }
    
    /**
     * カウンターグループの作成
     */
    createCounterGroup(counter, type) {
        const count = type === 'A' ? counter.countA : counter.countB;
        const cssClass = type === 'A' ? 'counter-group-a' : 'counter-group-b';
        const btnClass = type === 'A' ? 'counter-btn-a' : 'counter-btn-b';
        
        return `
            <td colspan="3">
                <div class="counter-group ${cssClass}">
                    <button 
                        class="counter-btn counter-btn-main ${btnClass}"
                        data-action="increment${type}"
                        data-id="${counter.id}"
                    >
                        <span class="count-display" id="count${type}-${counter.id}">${count}</span>
                    </button>
                    <button 
                        class="counter-btn counter-btn-small counter-btn-minus"
                        data-action="decrement${type}"
                        data-id="${counter.id}"
                        title="カウンター${type} -1"
                    >
                        <i class="fas fa-minus"></i>
                    </button>
                    <button 
                        class="counter-btn counter-btn-small counter-btn-reset"
                        data-action="reset${type}"
                        data-id="${counter.id}"
                        title="カウンター${type}リセット"
                    >
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </td>
        `;
    }
    
    /**
     * フィールド変更のハンドラー
     */
    handleFieldChange(event) {
        const field = event.target.getAttribute('data-field');
        const id = event.target.getAttribute('data-id');
        const value = event.target.value.trim();
        
        const counter = this.state.counters.find(c => c.id == id);
        if (counter) {
            if (field === 'name') {
                counter.name = value || '名前なし';
            } else if (field === 'group') {
                counter.group = value;
            }
            this.saveToStorage();
        }
    }
    
    /**
     * カウンターアクションのハンドラー
     */
    handleCounterAction(event) {
        const action = event.currentTarget.getAttribute('data-action');
        const id = event.currentTarget.getAttribute('data-id');
        
        switch(action) {
            case 'incrementA':
                this.incrementCounter(id, 'A');
                break;
            case 'incrementB':
                this.incrementCounter(id, 'B');
                break;
            case 'decrementA':
                this.decrementCounter(id, 'A');
                break;
            case 'decrementB':
                this.decrementCounter(id, 'B');
                break;
            case 'resetA':
                this.resetCounterSingle(id, 'A');
                break;
            case 'resetB':
                this.resetCounterSingle(id, 'B');
                break;
            case 'memo':
                this.openMemoDialog(id);
                break;
            case 'delete':
                this.deleteCounter(id);
                break;
        }
    }
    
    /**
     * カウントアップ
     */
    incrementCounter(id, type) {
        const counter = this.state.counters.find(c => c.id == id);
        if (!counter) return;
        
        if (type === 'A') {
            counter.countA++;
        } else {
            counter.countB++;
        }
        
        // カウント表示を更新（アニメーション付き）
        const countDisplay = document.getElementById(`count${type}-${id}`);
        if (countDisplay) {
            countDisplay.textContent = type === 'A' ? counter.countA : counter.countB;
            countDisplay.classList.add('count-animation');
            setTimeout(() => countDisplay.classList.remove('count-animation'), 300);
        }
        
        this.updateStats();
        this.saveToStorage();
    }
    
    /**
     * カウントダウン
     */
    decrementCounter(id, type) {
        const counter = this.state.counters.find(c => c.id == id);
        if (!counter) return;
        
        if (type === 'A') {
            counter.countA = Math.max(0, counter.countA - 1);
        } else {
            counter.countB = Math.max(0, counter.countB - 1);
        }
        
        // カウント表示を更新（アニメーション付き）
        const countDisplay = document.getElementById(`count${type}-${id}`);
        if (countDisplay) {
            countDisplay.textContent = type === 'A' ? counter.countA : counter.countB;
            countDisplay.classList.add('count-animation');
            setTimeout(() => countDisplay.classList.remove('count-animation'), 300);
        }
        
        this.updateStats();
        this.saveToStorage();
    }
    
    /**
     * 個別カウンターのリセット
     */
    resetCounterSingle(id, type) {
        const counter = this.state.counters.find(c => c.id == id);
        if (!counter) return;
        
        if (type === 'A') {
            counter.countA = 0;
        } else {
            counter.countB = 0;
        }
        
        const countDisplay = document.getElementById(`count${type}-${id}`);
        if (countDisplay) {
            countDisplay.textContent = '0';
        }
        
        this.updateStats();
        this.saveToStorage();
    }
    
    /**
     * カウンターを削除
     */
    deleteCounter(id) {
        if (!confirm('この参加者を削除してもよろしいですか？')) {
            return;
        }
        
        this.state.counters = this.state.counters.filter(c => c.id != id);
        this.render();
        this.saveToStorage();
        this.showToast('参加者を削除しました', 'success');
    }
    
    /**
     * 全カウンターのリセット
     */
    resetAllCounters() {
        if (!confirm('全てのカウンターをリセットしてもよろしいですか？')) {
            return;
        }
        
        this.state.counters.forEach(counter => {
            counter.countA = 0;
            counter.countB = 0;
        });
        
        this.render();
        this.saveToStorage();
        this.showToast('全てのカウンターをリセットしました', 'success');
    }
    
    /**
     * 全カウンターの削除
     */
    deleteAllCounters() {
        if (!confirm('全ての参加者データを削除して初期状態に戻しますか？')) {
            return;
        }
        
        this.state.counters = [];
        this.state.rowLabel = '';
        this.state.sortConfig = { key: null, direction: 'asc' };
        
        this.render();
        this.saveToStorage();
        this.showToast('全てのデータを削除しました', 'success');
    }
    
    /**
     * 入力欄をクリア
     */
    clearInput() {
        if (this.elements.participantInput) {
            this.elements.participantInput.value = '';
        }
    }
    
    /**
     * カウンター名を更新
     */
    updateCounterNames() {
        this.state.counterNames.A = this.elements.counterAName?.value.trim() || 'カウンターA';
        this.state.counterNames.B = this.elements.counterBName?.value.trim() || 'カウンターB';
        
        this.render();
        this.saveToStorage();
        this.showToast('カウンター名を更新しました', 'success');
    }
    
    /**
     * カウンター名入力欄の更新
     */
    updateCounterNameInputs() {
        if (this.elements.counterAName) {
            this.elements.counterAName.value = this.state.counterNames.A;
        }
        if (this.elements.counterBName) {
            this.elements.counterBName.value = this.state.counterNames.B;
        }
    }
    
    /**
     * ソート機能
     */
    sortTable(key) {
        if (this.state.sortConfig.key === key) {
            this.state.sortConfig.direction = 
                this.state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortConfig.key = key;
            this.state.sortConfig.direction = 'asc';
        }
        
        this.renderCounters();
    }
    
    /**
     * ソートアイコンを取得
     */
    getSortIcon(key) {
        if (this.state.sortConfig.key !== key) {
            return '<i class="fas fa-sort sort-icon"></i>';
        }
        if (this.state.sortConfig.direction === 'asc') {
            return '<i class="fas fa-sort-up sort-icon active"></i>';
        } else {
            return '<i class="fas fa-sort-down sort-icon active"></i>';
        }
    }
    
    /**
     * ソートされたカウンターデータを取得
     */
    getSortedCounters() {
        if (!this.state.sortConfig.key) {
            return [...this.state.counters];
        }
        
        return [...this.state.counters].sort((a, b) => {
            let aVal, bVal;
            
            switch(this.state.sortConfig.key) {
                case 'group':
                    aVal = (a.group || '').toLowerCase();
                    bVal = (b.group || '').toLowerCase();
                    break;
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'countA':
                    aVal = a.countA;
                    bVal = b.countA;
                    break;
                case 'countB':
                    aVal = a.countB;
                    bVal = b.countB;
                    break;
                default:
                    return 0;
            }
            
            // 数値の場合
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.state.sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            // 文字列の場合
            if (aVal < bVal) {
                return this.state.sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return this.state.sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    /**
     * 統計情報の更新
     */
    updateStats() {
        if (this.elements.participantCount) {
            this.elements.participantCount.textContent = this.state.counters.length;
        }
    }
    
    /**
     * メモダイアログを開く
     */
    openMemoDialog(id) {
        const counter = this.state.counters.find(c => c.id == id);
        if (!counter) return;
        
        this.state.currentMemoId = id;
        
        if (this.elements.memoTargetName) {
            this.elements.memoTargetName.textContent = counter.name;
        }
        if (this.elements.memoTextarea) {
            this.elements.memoTextarea.value = counter.memo || '';
        }
        
        this.elements.memoModal?.classList.add('active');
        this.elements.memoTextarea?.focus();
    }
    
    /**
     * メモモーダルを閉じる
     */
    closeMemoModal() {
        this.elements.memoModal?.classList.remove('active');
        this.state.currentMemoId = null;
    }
    
    /**
     * メモ保存アクション
     */
    saveMemoAction() {
        if (this.state.currentMemoId === null) return;
        
        const counter = this.state.counters.find(c => c.id == this.state.currentMemoId);
        if (!counter) return;
        
        counter.memo = this.elements.memoTextarea?.value || '';
        this.saveToStorage();
        this.renderCounters();
        this.closeMemoModal();
        this.showToast('メモを保存しました', 'success');
    }
    
    /**
     * CSVダウンロード
     */
    downloadCsv() {
        if (this.state.counters.length === 0) {
            this.showToast('ダウンロードするデータがありません', 'warning');
            return;
        }
        
        const hasGroups = this.state.counters.some(c => c.group && c.group.length > 0);
        
        // CSVヘッダー
        let csvContent = '';
        if (hasGroups) {
            csvContent = `グループ,名前,${this.state.counterNames.A},${this.state.counterNames.B},メモ\n`;
        } else {
            csvContent = `名前,${this.state.counterNames.A},${this.state.counterNames.B},メモ\n`;
        }
        
        // データ行
        this.state.counters.forEach(counter => {
            const escapedMemo = counter.memo ? `"${counter.memo.replace(/"/g, '""')}"` : '';
            
            if (hasGroups) {
                csvContent += `${counter.group || ''},${counter.name},${counter.countA},${counter.countB},${escapedMemo}\n`;
            } else {
                csvContent += `${counter.name},${counter.countA},${counter.countB},${escapedMemo}\n`;
            }
        });
        
        // BOM付きUTF-8でダウンロード
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // ファイル名に日時を含める
        const now = new Date();
        const timestamp = now.getFullYear() + 
                        String(now.getMonth() + 1).padStart(2, '0') + 
                        String(now.getDate()).padStart(2, '0') + '_' +
                        String(now.getHours()).padStart(2, '0') + 
                        String(now.getMinutes()).padStart(2, '0');
        
        link.href = url;
        link.download = `counter_data_${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('CSVファイルをダウンロードしました', 'success');
    }
    
    /**
     * CSVアップロード
     */
    uploadCsv(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                
                if (lines.length < 2) {
                    this.showToast('CSVファイルにデータがありません', 'warning');
                    return;
                }
                
                // ヘッダー行を解析
                const headers = lines[0].split(',').map(h => h.trim());
                const hasGroupColumn = headers.length >= 5;
                
                // カウンター名を更新
                if (hasGroupColumn && headers.length >= 5) {
                    this.state.counterNames.A = headers[2] || 'カウンターA';
                    this.state.counterNames.B = headers[3] || 'カウンターB';
                } else if (headers.length >= 4) {
                    this.state.counterNames.A = headers[1] || 'カウンターA';
                    this.state.counterNames.B = headers[2] || 'カウンターB';
                }
                
                // データ行を解析
                const newCounters = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = this.parseCSVLine(lines[i]);
                    
                    if (hasGroupColumn && values.length >= 4) {
                        newCounters.push({
                            id: Date.now() + Math.random(),
                            group: values[0],
                            name: values[1] || '名前なし',
                            countA: parseInt(values[2]) || 0,
                            countB: parseInt(values[3]) || 0,
                            memo: values[4] || ''
                        });
                    } else if (values.length >= 3) {
                        newCounters.push({
                            id: Date.now() + Math.random(),
                            group: '',
                            name: values[0] || '名前なし',
                            countA: parseInt(values[1]) || 0,
                            countB: parseInt(values[2]) || 0,
                            memo: values[3] || ''
                        });
                    }
                }
                
                if (newCounters.length === 0) {
                    this.showToast('有効なデータが見つかりませんでした', 'warning');
                    return;
                }
                
                // 確認ダイアログ
                if (this.state.counters.length > 0) {
                    if (!confirm(`現在のデータ（${this.state.counters.length}人）を上書きして、新しいデータ（${newCounters.length}人）を読み込みますか？`)) {
                        return;
                    }
                }
                
                // データを置き換え
                this.state.counters = newCounters;
                
                // 表示を更新
                this.render();
                this.saveToStorage();
                
                this.showToast(`${newCounters.length}人のデータを読み込みました`, 'success');
                
            } catch (error) {
                console.error('CSVの読み込みエラー:', error);
                this.showToast('CSVファイルの読み込みに失敗しました', 'error');
            }
            
            // ファイル入力をリセット
            event.target.value = '';
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    /**
     * CSV行のパース（ダブルクォート対応）
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    /**
     * データの保存（LocalStorage）
     */
    saveToStorage() {
        try {
            const data = {
                counters: this.state.counters,
                rowLabel: this.state.rowLabel,
                counterNames: this.state.counterNames
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('ローカルストレージへの保存に失敗:', error);
            this.showToast('データの保存に失敗しました', 'error');
        }
    }
    
    /**
     * データの読み込み（LocalStorage）
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.state.counters = data.counters || [];
                this.state.rowLabel = data.rowLabel || '';
                this.state.counterNames = data.counterNames || { A: 'カウンターA', B: 'カウンターB' };
            }
        } catch (error) {
            console.error('ローカルストレージからの読み込みに失敗:', error);
            this.state.counters = [];
            this.state.rowLabel = '';
            this.state.counterNames = { A: 'カウンターA', B: 'カウンターB' };
        }
    }
    
    /**
     * トースト通知表示
     */
    showToast(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.getElementById('notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // アイコンマッピング
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i> ${message}
        `;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 3秒後に消す
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * UIの描画
     */
    render() {
        this.renderCounters();
        this.updateCounterNameInputs();
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new RegisterWithCounterApp();
});
