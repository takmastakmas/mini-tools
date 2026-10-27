/**
 * Amazon URL クリーナー
 * Amazon商品URLからトラッキングパラメータとアフィリエイトタグを削除する
 */
class AmazonUrlCleaner {
  constructor() {
    this.initElements();
    this.initEventListeners();
  }

  /**
   * DOM要素を初期化
   */
  initElements() {
    this.amazonUrlInput = document.getElementById('amazonUrl');
    this.convertBtn = document.getElementById('convertBtn');
    this.cleanUrlInput = document.getElementById('cleanUrl');
    this.copyBtn = document.getElementById('copyBtn');
    this.resultSection = document.getElementById('resultSection');
    this.errorSection = document.getElementById('errorSection');
    this.errorMessage = document.getElementById('errorMessage');
    this.copyMessage = document.getElementById('copyMessage');
  }

  /**
   * イベントリスナーを初期化
   */
  initEventListeners() {
    // 変換ボタンのクリック
    this.convertBtn.addEventListener('click', () => this.convertUrl());
    
    // Enterキーで変換
    this.amazonUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.convertUrl();
      }
    });
    
    // コピーボタンのクリック
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
  }

  /**
   * AmazonのURLをクリーンなURLに変換する
   */
  convertUrl() {
    const inputUrl = this.amazonUrlInput.value.trim();
    
    // 入力チェック
    if (!inputUrl) {
      this.showError('URLを入力してください');
      return;
    }
    
    // URLの妥当性チェック
    if (!this.isValidAmazonUrl(inputUrl)) {
      this.showError('有効なAmazon URLを入力してください');
      return;
    }
    
    try {
      const cleanUrl = this.cleanAmazonUrl(inputUrl);
      this.showResult(cleanUrl);
    } catch (error) {
      this.showError('URLの変換に失敗しました: ' + error.message);
    }
  }

  /**
   * Amazon URLかどうかをチェック
   */
  isValidAmazonUrl(url) {
    try {
      const urlObj = new URL(url);
      // Amazonのドメインパターンをチェック
      return /amazon\.(com|co\.jp|co\.uk|de|fr|it|es|ca|com\.mx|com\.br|in|com\.au|cn|sg|ae|nl|se)/.test(urlObj.hostname);
    } catch (e) {
      return false;
    }
  }

  /**
   * Amazon URLをクリーンにする
   */
  cleanAmazonUrl(url) {
    const urlObj = new URL(url);
    
    // 商品IDを抽出
    const productId = this.extractProductId(urlObj);
    
    if (!productId) {
      throw new Error('商品IDが見つかりませんでした');
    }
    
    // クリーンなURLを構築
    const protocol = urlObj.protocol;
    const hostname = urlObj.hostname;
    const cleanUrl = `${protocol}//${hostname}/dp/${productId}`;
    
    return cleanUrl;
  }

  /**
   * URLから商品IDを抽出
   */
  extractProductId(urlObj) {
    const pathname = urlObj.pathname;
    
    // /dp/XXXXXXXXXX 形式
    let match = pathname.match(/\/dp\/([A-Z0-9]{10})/);
    if (match) return match[1];
    
    // /gp/product/XXXXXXXXXX 形式
    match = pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);
    if (match) return match[1];
    
    // /product/XXXXXXXXXX 形式
    match = pathname.match(/\/product\/([A-Z0-9]{10})/);
    if (match) return match[1];
    
    // /XXXXXXXXXX/ 形式（商品ID単体）
    match = pathname.match(/\/([A-Z0-9]{10})\/?/);
    if (match) return match[1];
    
    return null;
  }

  /**
   * 結果を表示
   */
  showResult(cleanUrl) {
    this.cleanUrlInput.value = cleanUrl;
    this.resultSection.classList.remove('hidden');
    this.errorSection.classList.add('hidden');
    this.copyMessage.classList.add('hidden');
    
    // 結果セクションまでスムーズスクロール
    this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * エラーを表示
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorSection.classList.remove('hidden');
    this.resultSection.classList.add('hidden');
  }

  /**
   * クリップボードにコピー（共通ユーティリティを使用）
   */
  async copyToClipboard() {
    const textToCopy = this.cleanUrlInput.value;
    
    // AppUtils の共通関数を使用
    const success = await AppUtils.copyToClipboard(textToCopy);
    
    if (success) {
      this.showCopyMessage();
    } else {
      this.showError('コピーに失敗しました');
    }
  }

  /**
   * コピー成功メッセージを表示
   */
  showCopyMessage() {
    this.copyMessage.classList.remove('hidden');
    
    // 2秒後にメッセージを非表示
    setTimeout(() => {
      this.copyMessage.classList.add('hidden');
    }, 2000);
  }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new AmazonUrlCleaner();
});
