/**
 * マークダウンビューアーアプリ
 * 
 * @class MarkdownViewerApp
 * @description リアルタイムでマークダウンをプレビューするアプリケーション
 */
class MarkdownViewerApp {
    constructor() {
        this.storageKey = 'markdown-viewer-content';
        this.elements = {};
        this.state = {
            content: ''
        };
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.configureMarked();
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.initResizer();
        this.initDragAndDrop();
    }
    
    /**
     * Marked.js の設定
     */
    configureMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true, // 改行を<br>に変換
                gfm: true, // GitHub Flavored Markdown を有効化
                highlight: (code, lang) => {
                    // コードのシンタックスハイライト
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.error('Highlight error:', err);
                        }
                    }
                    return typeof hljs !== 'undefined' ? hljs.highlightAuto(code).value : code;
                }
            });
        }
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            markdownInput: document.getElementById('markdownInput'),
            preview: document.getElementById('preview'),
            charCount: document.getElementById('charCount'),
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
            clearBtn: document.getElementById('clearBtn'),
            copyBtn: document.getElementById('copyBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            leftPanel: document.getElementById('leftPanel'),
            rightPanel: document.getElementById('rightPanel'),
            resizer: document.getElementById('resizer')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // マークダウン入力
        this.elements.markdownInput?.addEventListener('input', () => {
            this.updatePreview();
        });
        
        // アップロードボタン
        this.elements.uploadBtn?.addEventListener('click', () => {
            this.elements.fileInput?.click();
        });
        
        // ファイル選択
        this.elements.fileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
        
        // クリアボタン
        this.elements.clearBtn?.addEventListener('click', () => {
            this.handleClear();
        });
        
        // コピーボタン
        this.elements.copyBtn?.addEventListener('click', () => {
            this.handleCopy();
        });
        
        // ダウンロードボタン
        this.elements.downloadBtn?.addEventListener('click', () => {
            this.handleDownload();
        });
        
        // 全画面表示ボタン
        this.elements.fullscreenBtn?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // ESCキーで全画面を解除
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.preview?.classList.contains('fullscreen')) {
                this.toggleFullscreen();
            }
        });
    }
    
    /**
     * プレビューを更新
     */
    updatePreview() {
        const markdownText = this.elements.markdownInput?.value || '';
        
        // マークダウンをHTMLに変換
        if (typeof marked !== 'undefined') {
            const html = marked.parse(markdownText);
            if (this.elements.preview) {
                this.elements.preview.innerHTML = html;
            }
        }
        
        // 文字数を更新
        if (this.elements.charCount) {
            this.elements.charCount.textContent = `${markdownText.length} 文字`;
        }
        
        // 状態を更新して保存
        this.state.content = markdownText;
        this.saveToStorage();
    }
    
    /**
     * ファイルアップロードのハンドラ
     */
    handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // ファイルタイプをチェック
        const validTypes = ['text/plain', 'text/markdown'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['txt', 'md'];
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            alert('txtまたはmdファイルのみアップロードできます。');
            return;
        }
        
        // ファイルサイズチェック（10MB以下）
        if (file.size > 10 * 1024 * 1024) {
            alert('ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。');
            return;
        }
        
        // ファイルを読み込む
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string' && this.elements.markdownInput) {
                this.elements.markdownInput.value = content;
                this.updatePreview();
                
                // フィードバック
                if (this.elements.uploadBtn) {
                    const originalText = this.elements.uploadBtn.innerHTML;
                    this.elements.uploadBtn.innerHTML = '✅ 読み込み完了';
                    this.elements.uploadBtn.style.backgroundColor = '#10b981';
                    
                    setTimeout(() => {
                        this.elements.uploadBtn.innerHTML = originalText;
                        this.elements.uploadBtn.style.backgroundColor = '';
                    }, 2000);
                }
            }
        };
        
        reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました。');
        };
        
        reader.readAsText(file, 'UTF-8');
        
        // ファイル入力をリセット（同じファイルを再度選択できるように）
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
    }
    
    /**
     * クリアボタンのハンドラ
     */
    handleClear() {
        if (confirm('入力内容をクリアしますか？')) {
            if (this.elements.markdownInput) {
                this.elements.markdownInput.value = '';
            }
            this.updatePreview();
        }
    }
    
    /**
     * コピーボタンのハンドラ
     */
    async handleCopy() {
        const markdownText = this.elements.markdownInput?.value || '';
        
        try {
            // AppUtilsを使用してコピー
            const success = await AppUtils.copyToClipboard(markdownText);
            
            if (success && this.elements.copyBtn) {
                // ボタンのフィードバック
                const originalText = this.elements.copyBtn.textContent;
                this.elements.copyBtn.textContent = 'コピーしました！';
                this.elements.copyBtn.style.backgroundColor = '#10b981';
                
                setTimeout(() => {
                    this.elements.copyBtn.textContent = originalText;
                    this.elements.copyBtn.style.backgroundColor = '';
                }, 2000);
            } else {
                alert('テキストのコピーに失敗しました');
            }
        } catch (err) {
            console.error('コピーエラー:', err);
            alert('テキストのコピーに失敗しました');
        }
    }
    
    /**
     * ダウンロードボタンのハンドラ
     */
    handleDownload() {
        const markdownText = this.elements.markdownInput?.value || '';
        
        if (!markdownText.trim()) {
            alert('ダウンロードする内容がありません');
            return;
        }
        
        // ファイル名を生成（yyyymmdd_markdown.md）
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const fileName = `${year}${month}${day}_markdown.md`;
        
        // Blobを作成
        const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
        
        // ダウンロードリンクを作成して自動クリック
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // URLを解放
        URL.revokeObjectURL(link.href);
        
        // ボタンのフィードバック
        if (this.elements.downloadBtn) {
            const originalText = this.elements.downloadBtn.textContent;
            this.elements.downloadBtn.textContent = 'ダウンロードしました！';
            this.elements.downloadBtn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                this.elements.downloadBtn.textContent = originalText;
                this.elements.downloadBtn.style.backgroundColor = '';
            }, 2000);
        }
    }
    
    /**
     * 全画面表示の切り替え
     */
    toggleFullscreen() {
        if (!this.elements.preview || !this.elements.fullscreenBtn) return;
        
        this.elements.preview.classList.toggle('fullscreen');
        
        // アイコンの切り替え
        if (this.elements.preview.classList.contains('fullscreen')) {
            this.elements.fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
            `;
            this.elements.fullscreenBtn.title = '通常表示';
        } else {
            this.elements.fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
            `;
            this.elements.fullscreenBtn.title = '全画面表示';
        }
    }
    
    /**
     * ドラッグ&ドロップの初期化
     */
    initDragAndDrop() {
        const dropZone = this.elements.markdownInput;
        if (!dropZone) return;
        
        // ドラッグオーバー時の処理
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.backgroundColor = '#e0e7ff';
            dropZone.style.borderColor = '#818cf8';
        });
        
        // ドラッグリーブ時の処理
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '';
        });
        
        // ドロップ時の処理
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '';
            
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                this.handleDroppedFile(files[0]);
            }
        });
    }
    
    /**
     * ドロップされたファイルを処理
     */
    handleDroppedFile(file) {
        // ファイルタイプをチェック
        const validTypes = ['text/plain', 'text/markdown'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['txt', 'md'];
        
        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
            alert('txtまたはmdファイルのみアップロードできます。');
            return;
        }
        
        // ファイルサイズチェック（10MB以下）
        if (file.size > 10 * 1024 * 1024) {
            alert('ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。');
            return;
        }
        
        // ファイルを読み込む
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string' && this.elements.markdownInput) {
                this.elements.markdownInput.value = content;
                this.updatePreview();
                
                // 通知を表示
                this.showNotification(`📄 ${file.name} を読み込みました`);
            }
        };
        
        reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました。');
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    /**
     * 通知を表示
     */
    showNotification(message) {
        // 既存の通知があれば削除
        const existing = document.querySelector('.file-notification');
        if (existing) {
            existing.remove();
        }
        
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = 'file-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // アニメーション後に削除
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * リサイザーの初期化
     */
    initResizer() {
        if (!this.elements.resizer || !this.elements.leftPanel) return;
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        // マウスダウン
        this.elements.resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = this.elements.leftPanel.offsetWidth;
            
            // リサイズ中のスタイル
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
        });
        
        // マウスムーブ
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const containerWidth = this.elements.leftPanel.parentElement.offsetWidth;
            const deltaX = e.clientX - startX;
            const newWidth = startWidth + deltaX;
            
            // 最小幅と最大幅を制限（20% ~ 80%）
            const minWidth = containerWidth * 0.2;
            const maxWidth = containerWidth * 0.8;
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                const percentage = (newWidth / containerWidth) * 100;
                this.elements.leftPanel.style.width = `${percentage}%`;
            }
        });
        
        // マウスアップ
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    
    /**
     * データの保存
     */
    saveToStorage() {
        AppUtils.saveToStorage(this.storageKey, this.state.content);
    }
    
    /**
     * データの読み込み
     */
    loadFromStorage() {
        const savedContent = AppUtils.loadFromStorage(this.storageKey, '');
        
        if (savedContent && this.elements.markdownInput) {
            this.elements.markdownInput.value = savedContent;
            this.state.content = savedContent;
            this.updatePreview();
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewerApp();
});
