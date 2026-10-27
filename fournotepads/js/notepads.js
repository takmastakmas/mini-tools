/**
 * 4分割メモ帳
 * 4つの独立したメモ欄を持つメモ帳アプリ
 */
class FourNotepads {
  constructor() {
    this.STORAGE_KEY = 'four_memo_texts';
    this.MEMO_COUNT = 4;
    
    this.initElements();
    this.initEventListeners();
    this.loadTexts();
    this.updateAllCharCounts();
  }

  /**
   * DOM要素を初期化
   */
  initElements() {
    this.memos = [];
    this.countElements = [];
    this.toastElements = [];
    
    for (let i = 1; i <= this.MEMO_COUNT; i++) {
      this.memos[i] = document.getElementById(`memo-${i}`);
      this.countElements[i] = document.getElementById(`count-${i}`);
      this.toastElements[i] = document.getElementById(`toast-${i}`);
    }
    
    // ボタン要素
    this.copyButtons = document.querySelectorAll('[data-action="copy"]');
    this.clearButtons = document.querySelectorAll('[data-action="clear"]');
  }

  /**
   * イベントリスナーを初期化
   */
  initEventListeners() {
    // 各テキストエリアの入力イベント
    for (let i = 1; i <= this.MEMO_COUNT; i++) {
      this.memos[i].addEventListener('input', () => {
        this.updateCharCount(i);
        this.saveTexts();
      });
    }
    
    // コピーボタン
    this.copyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const memoIndex = parseInt(e.currentTarget.dataset.memo);
        this.copyText(memoIndex);
      });
    });
    
    // クリアボタン
    this.clearButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const memoIndex = parseInt(e.currentTarget.dataset.memo);
        this.clearText(memoIndex);
      });
    });
  }

  /**
   * 文字数カウントを更新
   */
  updateCharCount(index) {
    const length = this.memos[index].value.length;
    this.countElements[index].textContent = `${length}文字`;
  }

  /**
   * すべての文字数カウントを更新
   */
  updateAllCharCounts() {
    for (let i = 1; i <= this.MEMO_COUNT; i++) {
      this.updateCharCount(i);
    }
  }

  /**
   * テキストをクリップボードにコピー（共通ユーティリティを使用）
   */
  async copyText(index) {
    const text = this.memos[index].value;
    
    if (!text) {
      this.showToast(index, 'コピーするテキストがありません', 'warning');
      return;
    }
    
    // AppUtils の共通関数を使用
    const success = await AppUtils.copyToClipboard(text);
    
    if (success) {
      this.showToast(index, 'コピーしました！');
    } else {
      this.showToast(index, 'コピーに失敗しました', 'warning');
    }
  }

  /**
   * テキストをクリア
   */
  clearText(index) {
    if (!this.memos[index].value) {
      return;
    }
    
    this.memos[index].value = '';
    this.updateCharCount(index);
    this.saveTexts();
    this.showToast(index, 'クリアしました');
  }

  /**
   * トーストメッセージを表示
   */
  showToast(index, message, type = 'success') {
    const toast = this.toastElements[index];
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  /**
   * すべてのテキストをLocalStorageに保存（共通ユーティリティを使用）
   */
  saveTexts() {
    const texts = {};
    for (let i = 1; i <= this.MEMO_COUNT; i++) {
      texts[`memo-${i}`] = this.memos[i].value;
    }
    
    // AppUtils の共通関数を使用
    AppUtils.saveToStorage(this.STORAGE_KEY, texts);
  }

  /**
   * LocalStorageからテキストを読み込み（共通ユーティリティを使用）
   */
  loadTexts() {
    // AppUtils の共通関数を使用
    const texts = AppUtils.loadFromStorage(this.STORAGE_KEY, {});
    
    for (let i = 1; i <= this.MEMO_COUNT; i++) {
      const key = `memo-${i}`;
      if (texts[key]) {
        this.memos[i].value = texts[key];
      }
    }
  }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new FourNotepads();
});
