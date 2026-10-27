/**
 * Zoom表示名設定済リンクジェネレーター
 * 
 * @class ZoomLinkGeneratorApp
 * @description Zoomミーティングに好きな表示名で参加できるリンクを生成するアプリ
 */
class ZoomLinkGeneratorApp {
    constructor() {
        // ストレージキー
        this.storageKey = 'zoomDisplayNameHistory';
        this.maxHistory = 5;
        
        // DOM要素
        this.elements = {};
        
        // 初期化
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.renderHistory();
        this.attachEventListeners();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            zoomUrlInput: document.getElementById('zoomUrl'),
            displayNameInput: document.getElementById('displayName'),
            generateBtn: document.getElementById('generateBtn'),
            resultSection: document.getElementById('resultSection'),
            generatedLinkInput: document.getElementById('generatedLink'),
            copyBtn: document.getElementById('copyBtn'),
            joinBtn: document.getElementById('joinBtn'),
            copyMessage: document.getElementById('copyMessage'),
            historySection: document.getElementById('historySection'),
            historyButtons: document.getElementById('historyButtons'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // リンク生成ボタン
        this.elements.generateBtn?.addEventListener('click', 
            () => this.generateZoomLink()
        );
        
        // コピーボタン
        this.elements.copyBtn?.addEventListener('click', 
            () => this.copyToClipboard()
        );
        
        // 入室ボタン
        this.elements.joinBtn?.addEventListener('click', 
            () => this.joinZoom()
        );
        
        // 履歴クリアボタン
        this.elements.clearHistoryBtn?.addEventListener('click', 
            () => this.clearHistory()
        );
        
        // Enterキーでリンク生成
        this.elements.zoomUrlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateZoomLink();
            }
        });
        
        this.elements.displayNameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateZoomLink();
            }
        });
        
        // 入力時にコピーメッセージを非表示
        this.elements.zoomUrlInput?.addEventListener('input', () => {
            if (this.elements.copyMessage) {
                this.elements.copyMessage.style.display = 'none';
            }
        });
        
        this.elements.displayNameInput?.addEventListener('input', () => {
            if (this.elements.copyMessage) {
                this.elements.copyMessage.style.display = 'none';
            }
        });
    }
    
    /**
     * Zoomリンク生成
     */
    generateZoomLink() {
        const zoomUrl = this.elements.zoomUrlInput?.value.trim() || '';
        const displayName = this.elements.displayNameInput?.value.trim() || '';
        
        // バリデーション
        if (!zoomUrl) {
            this.showToast('Zoomミーティングのアドレスを入力してください', 'warning');
            this.elements.zoomUrlInput?.focus();
            return;
        }
        
        if (!displayName) {
            this.showToast('表示名を入力してください', 'warning');
            this.elements.displayNameInput?.focus();
            return;
        }
        
        // ZoomのURL形式をチェック
        if (!zoomUrl.includes('zoom.us')) {
            this.showToast('有効なZoomミーティングのアドレスを入力してください', 'error');
            this.elements.zoomUrlInput?.focus();
            return;
        }
        
        // 表示名をURLエンコード
        const encodedName = encodeURIComponent(displayName);
        
        // URLの構築
        let finalUrl;
        if (zoomUrl.includes('?')) {
            // すでにクエリパラメータがある場合
            finalUrl = `${zoomUrl}&uname=${encodedName}`;
        } else {
            // クエリパラメータがない場合
            finalUrl = `${zoomUrl}?uname=${encodedName}`;
        }
        
        // 生成されたリンクを表示
        if (this.elements.generatedLinkInput) {
            this.elements.generatedLinkInput.value = finalUrl;
        }
        
        if (this.elements.resultSection) {
            this.elements.resultSection.style.display = 'block';
        }
        
        // 履歴に追加
        this.addToHistory(displayName);
        
        // 結果セクションまでスムーズスクロール
        this.elements.resultSection?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
        
        // コピーメッセージを非表示にする
        if (this.elements.copyMessage) {
            this.elements.copyMessage.style.display = 'none';
        }
        
        // 成功メッセージ
        this.showToast('リンクを生成しました！', 'success');
    }
    
    /**
     * クリップボードにコピー
     */
    async copyToClipboard() {
        const link = this.elements.generatedLinkInput?.value || '';
        
        if (!link) {
            this.showToast('コピーするリンクがありません', 'warning');
            return;
        }
        
        try {
            await AppUtils.copyToClipboard(link);
            
            // コピー成功メッセージを表示
            if (this.elements.copyMessage) {
                this.elements.copyMessage.style.display = 'block';
            }
            
            // 3秒後に非表示
            setTimeout(() => {
                if (this.elements.copyMessage) {
                    this.elements.copyMessage.style.display = 'none';
                }
            }, 3000);
            
            this.showToast('クリップボードにコピーしました！', 'success');
            
        } catch (error) {
            console.error('コピーエラー:', error);
            this.showToast('コピーに失敗しました', 'error');
        }
    }
    
    /**
     * すぐに入室
     */
    joinZoom() {
        const link = this.elements.generatedLinkInput?.value || '';
        
        if (!link) {
            this.showToast('入室するリンクがありません', 'warning');
            return;
        }
        
        window.open(link, '_blank', 'noopener,noreferrer');
        this.showToast('新しいタブでZoomを開きました', 'info');
    }
    
    /**
     * 履歴を読み込む
     */
    loadHistory() {
        return AppUtils.loadFromStorage(this.storageKey, []);
    }
    
    /**
     * 履歴を保存する
     */
    saveHistory(history) {
        AppUtils.saveToStorage(this.storageKey, history);
    }
    
    /**
     * 履歴に表示名を追加
     */
    addToHistory(displayName) {
        let history = this.loadHistory();
        
        // 既存の同じ名前を削除
        history = history.filter(name => name !== displayName);
        
        // 先頭に追加
        history.unshift(displayName);
        
        // 最大件数まで
        if (history.length > this.maxHistory) {
            history = history.slice(0, this.maxHistory);
        }
        
        this.saveHistory(history);
        this.renderHistory();
    }
    
    /**
     * 履歴ボタンを表示
     */
    renderHistory() {
        const history = this.loadHistory();
        
        if (!this.elements.historySection || !this.elements.historyButtons) {
            return;
        }
        
        if (history.length === 0) {
            this.elements.historySection.style.display = 'none';
            return;
        }
        
        this.elements.historySection.style.display = 'block';
        this.elements.historyButtons.innerHTML = '';
        
        history.forEach(name => {
            const button = document.createElement('button');
            button.className = 'history-btn';
            button.textContent = name;
            
            // アイコンを追加
            const icon = document.createElement('i');
            icon.className = 'fas fa-user';
            button.insertBefore(icon, button.firstChild);
            button.insertBefore(document.createTextNode(' '), button.childNodes[1]);
            
            button.addEventListener('click', () => {
                if (this.elements.displayNameInput) {
                    this.elements.displayNameInput.value = name;
                    this.elements.displayNameInput.focus();
                }
            });
            
            this.elements.historyButtons.appendChild(button);
        });
    }
    
    /**
     * 履歴をクリア
     */
    clearHistory() {
        if (confirm('履歴をすべて削除しますか？')) {
            AppUtils.removeFromStorage(this.storageKey);
            this.renderHistory();
            this.showToast('履歴をクリアしました', 'info');
        }
    }
    
    /**
     * トースト通知を表示
     */
    showToast(message, type = 'info') {
        // 既存の通知を削除
        const existing = document.getElementById('toast-notification');
        if (existing) {
            existing.remove();
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
        notification.id = 'toast-notification';
        notification.className = `toast-notification toast-${type}`;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${AppUtils.escapeHtml(message)}</span>
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
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new ZoomLinkGeneratorApp();
});
