/**
 * ブラウザメモ帳
 */
class SimpleNotepad {
  constructor() {
    this.STORAGE_KEY_TITLE = 'notepad_title';
    this.STORAGE_KEY_CONTENT = 'notepad_content';
    
    this.initElements();
    this.initEventListeners();
    this.loadFromStorage();
  }

  /**
   * DOM要素を初期化
   */
  initElements() {
    this.titleInput = document.getElementById('title');
    this.contentTextarea = document.getElementById('content');
    this.charCountSpan = document.getElementById('charCount');
    this.lineCountSpan = document.getElementById('lineCount');
    this.copyBtn = document.getElementById('copyBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.fileFormatSelect = document.getElementById('fileFormat');
    this.timestampBtn = document.getElementById('timestampBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.notification = document.getElementById('notification');
  }

  /**
   * イベントリスナーを設定
   */
  initEventListeners() {
    this.titleInput.addEventListener('input', () => this.saveToStorage());
    this.contentTextarea.addEventListener('input', () => {
      this.updateStats();
      this.saveToStorage();
    });
    
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.downloadBtn.addEventListener('click', () => this.downloadFile());
    this.timestampBtn.addEventListener('click', () => this.insertTimestamp());
    this.clearBtn.addEventListener('click', () => this.clearAll());
  }

  /**
   * ローカルストレージからデータを読み込む
   */
  loadFromStorage() {
    const savedTitle = AppUtils.loadFromStorage(this.STORAGE_KEY_TITLE, '');
    const savedContent = AppUtils.loadFromStorage(this.STORAGE_KEY_CONTENT, '');
    
    this.titleInput.value = savedTitle;
    this.contentTextarea.value = savedContent;
    this.updateStats();
  }

  /**
   * ローカルストレージに保存
   */
  saveToStorage() {
    AppUtils.saveToStorage(this.STORAGE_KEY_TITLE, this.titleInput.value);
    AppUtils.saveToStorage(this.STORAGE_KEY_CONTENT, this.contentTextarea.value);
  }

  /**
   * 統計情報を更新
   */
  updateStats() {
    const text = this.contentTextarea.value;
    const charCount = text.length;
    const lineCount = text.length > 0 ? text.split('\n').length : 0;
    
    this.charCountSpan.textContent = charCount;
    this.lineCountSpan.textContent = lineCount;
  }

  /**
   * 通知を表示
   */
  showNotification(message, type = 'success') {
    this.notification.textContent = message;
    this.notification.className = `notification show ${type}`;
    
    setTimeout(() => {
      this.notification.className = 'notification';
    }, 2000);
  }

  /**
   * クリップボードにコピー
   */
  async copyToClipboard() {
    const title = this.titleInput.value;
    const content = this.contentTextarea.value;
    
    let textToCopy = '';
    if (title) {
      textToCopy += title + '\n\n';
    }
    textToCopy += content;
    
    if (!textToCopy.trim()) {
      this.showNotification('コピーする内容がありません', 'error');
      return;
    }
    
    const success = await AppUtils.copyToClipboard(textToCopy);
    if (success) {
      this.showNotification('✓ クリップボードにコピーしました！');
    } else {
      this.showNotification('コピーに失敗しました', 'error');
    }
  }

  /**
   * ファイル名をサニタイズ
   */
  sanitizeFilename(filename) {
    return filename.replace(/[\\/:*?"<>|]/g, '_');
  }

  /**
   * ファイルをダウンロード
   */
  downloadFile() {
    const title = this.titleInput.value.trim();
    const content = this.contentTextarea.value;
    const format = this.fileFormatSelect.value;
    
    if (!content.trim() && !title) {
      this.showNotification('ダウンロードする内容がありません', 'error');
      return;
    }
    
    // ファイル内容の作成
    let fileContent = '';
    if (format === 'md' && title) {
      fileContent = `# ${title}\n\n${content}`;
    } else if (title) {
      fileContent = `${title}\n\n${content}`;
    } else {
      fileContent = content;
    }
    
    // ファイル名の生成
    const dateStr = AppUtils.formatDate(new Date(), 'YYYYMMDD');
    let filename;
    if (title) {
      const sanitizedTitle = this.sanitizeFilename(title);
      filename = `${dateStr}_${sanitizedTitle}.${format}`;
    } else {
      filename = `${dateStr}_memo.${format}`;
    }
    
    // ダウンロード実行
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification(`✓ ${filename} をダウンロードしました！`);
  }

  /**
   * タイムスタンプを挿入
   */
  insertTimestamp() {
    const timestamp = AppUtils.formatDate(new Date(), 'YYYY/MM/DD HH:mm');
    
    const startPos = this.contentTextarea.selectionStart;
    const endPos = this.contentTextarea.selectionEnd;
    const currentText = this.contentTextarea.value;
    
    // タイムスタンプを挿入
    const newText = currentText.substring(0, startPos) + timestamp + currentText.substring(endPos);
    this.contentTextarea.value = newText;
    
    // カーソルをタイムスタンプの後ろに移動
    const newCursorPos = startPos + timestamp.length;
    this.contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
    this.contentTextarea.focus();
    
    // 統計を更新して保存
    this.updateStats();
    this.saveToStorage();
    
    this.showNotification('✓ タイムスタンプを挿入しました');
  }

  /**
   * 全てクリア
   */
  clearAll() {
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.updateStats();
    this.saveToStorage();
    this.showNotification('✓ クリアしました');
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  new SimpleNotepad();
});
