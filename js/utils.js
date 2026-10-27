/**
 * 共通ユーティリティ関数
 */
const AppUtils = {
  /**
   * ローカルストレージに保存
   */
  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('保存エラー:', e);
      return false;
    }
  },

  /**
   * ローカルストレージから読み込み
   */
  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('読み込みエラー:', e);
      return defaultValue;
    }
  },

  /**
   * ローカルストレージから削除
   */
  removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('削除エラー:', e);
      return false;
    }
  },

  /**
   * クリップボードにコピー
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // フォールバック方式
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return true;
        } catch (e) {
          document.body.removeChild(textArea);
          return false;
        }
      }
    } catch (e) {
      console.error('コピーエラー:', e);
      return false;
    }
  },

  /**
   * トースト通知を表示
   * @param {string} message - 表示するメッセージ
   * @param {string|number} typeOrDuration - 'success', 'error', 'warning', 'info' または表示時間(ms)
   * @param {string|null} elementId - 既存の要素ID (オプション)
   */
  showToast(message, typeOrDuration = 2000, elementId = null) {
    let toast;
    let duration = 2000;
    let type = 'info';
    
    // typeOrDuration の判定
    if (typeof typeOrDuration === 'string') {
      type = typeOrDuration;
      duration = 2000;
    } else if (typeof typeOrDuration === 'number') {
      duration = typeOrDuration;
    }
    
    if (elementId) {
      toast = document.getElementById(elementId);
      if (!toast) return;
      toast.textContent = message;
    } else {
      // 動的にトーストを生成
      toast = document.createElement('div');
      toast.className = `toast toast-dynamic toast-${type}`;
      toast.textContent = message;
      
      // アイコンを追加
      const icon = document.createElement('span');
      icon.className = 'toast-icon';
      switch(type) {
        case 'success':
          icon.textContent = '✓';
          break;
        case 'error':
          icon.textContent = '✕';
          break;
        case 'warning':
          icon.textContent = '⚠';
          break;
        case 'info':
          icon.textContent = 'ℹ';
          break;
      }
      toast.prepend(icon);
      
      document.body.appendChild(toast);
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      if (!elementId) {
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 300);
      }
    }, duration);
  },

  /**
   * 日付フォーマット
   */
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = date instanceof Date ? date : new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * デバウンス関数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * URLからクエリパラメータを取得
   */
  getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const queries = queryString.split('&');
    
    queries.forEach(query => {
      const [key, value] = query.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
    
    return params;
  },

  /**
   * HTMLエスケープ
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 数値を2桁にフォーマット
   */
  pad(num) {
    return String(num).padStart(2, '0');
  },

  /**
   * ランダムな整数を生成
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 配列をシャッフル
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};

// グローバルスコープに公開（オプション）
if (typeof window !== 'undefined') {
  window.AppUtils = AppUtils;
}
