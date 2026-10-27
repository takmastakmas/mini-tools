/**
 * 株式リンクジェネレーター
 * 銘柄コードから主要な投資情報サイトへのリンクを生成するアプリケーション
 * @class StockLinkGenerator
 */
class StockLinkGenerator {
  /**
   * コンストラクタ
   * アプリケーションを初期化
   */
  constructor() {
    this.HISTORY_KEY = 'stockCodeHistory';
    this.MAX_HISTORY = 5;
    this.init();
  }

  /**
   * 初期化処理
   */
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadAndDisplayHistory();
  }

  /**
   * DOM要素をキャッシュ
   */
  cacheDOM() {
    this.stockCodeInput = document.getElementById('stockCodeInput');
    this.executeBtn = document.getElementById('executeBtn');
    this.resultSection = document.getElementById('resultSection');
    this.displayCode = document.getElementById('displayCode');
    this.shikihoLink = document.getElementById('shikihoLink');
    this.yahooLink = document.getElementById('yahooLink');
    this.minkabuLink = document.getElementById('minkabuLink');
    this.kabutanLink = document.getElementById('kabutanLink');
    this.kabumapLink = document.getElementById('kabumapLink');
    this.ulletLink = document.getElementById('ulletLink');
    this.kabuyohoLink = document.getElementById('kabuyohoLink');
    this.historySection = document.getElementById('historySection');
    this.historyButtons = document.getElementById('historyButtons');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
  }

  /**
   * イベントリスナーをバインド
   */
  bindEvents() {
    // 実行ボタンのクリック
    this.executeBtn.addEventListener('click', () => this.handleExecute());
    
    // Enterキーで実行
    this.stockCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleExecute();
      }
    });
    
    // 入力時に数字のみ受け付ける
    this.stockCodeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // 履歴削除ボタンのクリック
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // キーボードショートカット（Ctrl+K または Cmd+K）
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.stockCodeInput.focus();
        this.stockCodeInput.select();
      }
    });
  }

  /**
   * 実行処理
   * 入力された銘柄コードを検証し、リンクを生成する
   */
  handleExecute() {
    const stockCode = this.stockCodeInput.value.trim();
    
    // 入力検証
    if (stockCode === '') {
      AppUtils.showToast('銘柄コードを入力してください', 3000);
      this.stockCodeInput.focus();
      return;
    }
    
    if (stockCode.length !== 4) {
      AppUtils.showToast('4桁の銘柄コードを入力してください', 3000);
      this.stockCodeInput.focus();
      return;
    }
    
    // 履歴に追加
    this.addToHistory(stockCode);
    
    // リンク生成
    this.generateLinks(stockCode);
    
    // 結果セクションを表示
    this.displayResult(stockCode);
  }

  /**
   * 各投資情報サイトへのリンクを生成
   * @param {string} code - 4桁の銘柄コード
   */
  generateLinks(code) {
    // 四季報のURL
    const shikihoUrl = `https://shikiho.toyokeizai.net/stocks/${code}`;
    this.shikihoLink.href = shikihoUrl;
    
    // Yahoo!ファイナンスのURL
    const yahooUrl = `https://finance.yahoo.co.jp/quote/${code}.T`;
    this.yahooLink.href = yahooUrl;
    
    // みんかぶのURL
    const minkabuUrl = `https://minkabu.jp/stock/${code}`;
    this.minkabuLink.href = minkabuUrl;
    
    // 株探（決算）のURL
    const kabutanUrl = `https://kabutan.jp/stock/finance?code=${code}`;
    this.kabutanLink.href = kabutanUrl;
    
    // 株マップのURL（テクニカルページ）
    const kabumapUrl = `https://jp.kabumap.com/servlets/kabumap/Action?SRC=techBunseki/base&codetext=${code}`;
    this.kabumapLink.href = kabumapUrl;
    
    // UlletのURL
    const ulletUrl = `https://www.ullet.com/${code}.html`;
    this.ulletLink.href = ulletUrl;
    
    // 株予報proのURL
    const kabuyohoUrl = `https://kabuyoho.jp/reportTop?bcode=${code}`;
    this.kabuyohoLink.href = kabuyohoUrl;
  }

  /**
   * 結果セクションを表示
   * @param {string} code - 4桁の銘柄コード
   */
  displayResult(code) {
    this.displayCode.textContent = code;
    this.resultSection.style.display = 'block';
    
    // スムーズスクロール
    setTimeout(() => {
      this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  /**
   * 履歴をLocalStorageから取得
   * @returns {Array<string>} 銘柄コードの履歴配列
   */
  getHistory() {
    return AppUtils.loadFromStorage(this.HISTORY_KEY, []);
  }

  /**
   * 履歴をLocalStorageに保存
   * @param {Array<string>} history - 銘柄コードの履歴配列
   */
  saveHistory(history) {
    const success = AppUtils.saveToStorage(this.HISTORY_KEY, history);
    if (!success) {
      console.error('履歴の保存に失敗しました');
    }
  }

  /**
   * 履歴に銘柄コードを追加
   * @param {string} code - 4桁の銘柄コード
   */
  addToHistory(code) {
    let history = this.getHistory();
    
    // 既存の同じコードを削除（重複を避ける）
    history = history.filter(item => item !== code);
    
    // 先頭に追加
    history.unshift(code);
    
    // 最大5件まで
    if (history.length > this.MAX_HISTORY) {
      history = history.slice(0, this.MAX_HISTORY);
    }
    
    // 保存
    this.saveHistory(history);
    
    // 表示を更新
    this.displayHistory(history);
  }

  /**
   * 履歴を画面に表示
   * @param {Array<string>} history - 銘柄コードの履歴配列
   */
  displayHistory(history) {
    // 履歴が空の場合は非表示
    if (history.length === 0) {
      this.historySection.style.display = 'none';
      return;
    }
    
    // 履歴セクションを表示
    this.historySection.style.display = 'flex';
    
    // ボタンをクリア
    this.historyButtons.innerHTML = '';
    
    // 履歴ボタンを生成
    history.forEach(code => {
      const button = document.createElement('button');
      button.className = 'history-code-btn';
      button.textContent = code;
      button.addEventListener('click', () => {
        this.stockCodeInput.value = code;
        this.handleExecute();
      });
      this.historyButtons.appendChild(button);
    });
  }

  /**
   * 履歴を読み込んで表示
   */
  loadAndDisplayHistory() {
    const history = this.getHistory();
    this.displayHistory(history);
  }

  /**
   * 履歴をすべて削除
   */
  clearHistory() {
    // 空の配列を保存
    this.saveHistory([]);
    
    // 履歴セクションを非表示
    this.historySection.style.display = 'none';
    
    // Toast通知を表示
    AppUtils.showToast('履歴を削除しました', 3000);
  }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
  new StockLinkGenerator();
});
