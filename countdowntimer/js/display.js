/**
 * カウントダウンタイマー 表示ウインドウ
 * 設定ウインドウから window.open() で開かれ、URLクエリパラメータで
 * 受け取った終了時刻・色設定に基づいてカウントダウンを表示する
 */
class CountdownDisplay {
  constructor() {
    // タイマー状態
    this.timerInterval = null;
    this.endTimeStamp = null;
    this.isPaused = false;
    this.pausedTimeRemaining = null;

    // 色設定
    this.currentColorMode = 'light';
    this.customBgColor = '#ffffff';
    this.customTextColor = '#000000';

    // フラッシュフラグ
    this.flashFlags = {
      30: false,
      20: false,
      10: false,
      5: false,
      2: false,
      1: false
    };

    this.initElements();
    this.initEventListeners();
    this.loadFromQueryParams();
    this.startTimer();
  }

  /**
   * DOM要素を初期化
   */
  initElements() {
    this.timerScreen = document.getElementById('timer-screen');
    this.whiteOverlay = document.getElementById('white-overlay');

    this.closeButton = document.getElementById('close-button');
    this.pauseButton = document.getElementById('pause-button');

    this.currentTimeDisplay = document.getElementById('current-time-display');
    this.countdownContent = document.getElementById('countdown-content');
    this.endTimeDisplay = document.getElementById('end-time-display');
  }

  /**
   * イベントリスナーを初期化
   */
  initEventListeners() {
    this.closeButton.addEventListener('click', () => window.close());
    this.pauseButton.addEventListener('click', () => this.togglePause());
  }

  /**
   * URLクエリパラメータから設定を読み込む
   */
  loadFromQueryParams() {
    const params = AppUtils.getQueryParams();

    const endTimeStamp = parseInt(params.end, 10);
    if (!endTimeStamp || Number.isNaN(endTimeStamp)) {
      alert('終了時刻が指定されていません');
      window.close();
      return;
    }
    this.endTimeStamp = endTimeStamp;

    this.currentColorMode = params.color || 'light';
    this.customBgColor = params.bg || '#ffffff';
    this.customTextColor = params.text || '#000000';

    this.applyColorMode();
  }

  /**
   * タイマー開始
   */
  startTimer() {
    if (!this.endTimeStamp) {
      return;
    }
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  /**
   * 一時停止/再開の切り替え
   */
  togglePause() {
    if (this.isPaused) {
      // 再開
      this.isPaused = false;
      this.pauseButton.textContent = '一時停止';
      this.pauseButton.classList.remove('paused');

      // 残り時間から終了時刻を再計算
      this.endTimeStamp = Date.now() + this.pausedTimeRemaining;

      // タイマー再開
      this.updateTimer();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    } else {
      // 一時停止
      this.isPaused = true;
      this.pauseButton.textContent = '再開';
      this.pauseButton.classList.add('paused');

      // 残り時間を保存
      this.pausedTimeRemaining = this.endTimeStamp - Date.now();

      // タイマー停止
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  }

  /**
   * タイマー表示を更新
   */
  updateTimer() {
    const now = Date.now();
    const remaining = this.endTimeStamp - now;

    // 現在時刻の表示（一時停止中でも更新）
    this.currentTimeDisplay.textContent = AppUtils.formatDate(new Date(now), 'HH:mm');

    // 終了予定時刻の表示
    this.endTimeDisplay.textContent = AppUtils.formatDate(new Date(this.endTimeStamp), 'HH:mm');

    // 一時停止中は残り時間の更新をスキップ
    if (this.isPaused) {
      return;
    }

    // カウントダウンが終了した場合
    if (remaining <= 0) {
      clearInterval(this.timerInterval);
      this.showTimeUp();
      return;
    }

    // フラッシュ処理
    this.handleFlash(remaining);

    // カウントダウン表示の更新
    this.updateCountdownDisplay(remaining);
  }

  /**
   * フラッシュ処理
   */
  handleFlash(remaining) {
    const totalSeconds = Math.floor(remaining / 1000);

    const flashTimings = [30, 20, 10, 5, 2, 1];
    flashTimings.forEach(timing => {
      if (totalSeconds === timing && !this.flashFlags[timing]) {
        this.triggerFlash();
        this.flashFlags[timing] = true;
      }
    });
  }

  /**
   * フラッシュ効果を発動
   */
  triggerFlash() {
    this.timerScreen.classList.add('flash');
    setTimeout(() => {
      this.timerScreen.classList.remove('flash');
    }, 500);
  }

  /**
   * カウントダウン表示を更新
   */
  updateCountdownDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // 2分（120秒）を基準に表示を切り替え
    if (totalSeconds >= 120) {
      // 2分以上：「残り XX 分」形式
      this.countdownContent.innerHTML = `
        <span class="label">残り</span>
        <span class="number">${minutes}</span>
        <span class="unit">分</span>
      `;
    } else {
      // 2分未満：「残り X分XX秒」形式
      const secondsStr = String(seconds).padStart(2, '0');
      this.countdownContent.innerHTML = `
        <span class="label">残り</span>
        <span class="time">${minutes}分${secondsStr}秒</span>
      `;
    }

    // カスタムカラーモードの場合、色を再適用
    if (this.currentColorMode === 'custom') {
      this.applyCustomColors();
    }
  }

  /**
   * 時間終了時の表示
   */
  showTimeUp() {
    this.countdownContent.innerHTML = `
      <span class="time">終了</span>
    `;

    // 2秒かけて白くフェードアウト
    this.timerScreen.classList.add('fade-to-white');
    this.whiteOverlay.classList.add('active');

    // 5秒後（フェードアウト2秒 + 白画面保持3秒）にカウントダウン画面に戻る
    setTimeout(() => {
      this.timerScreen.classList.remove('fade-to-white');
      this.whiteOverlay.classList.remove('active');
    }, 5000);
  }

  /**
   * 色モードを適用
   */
  applyColorMode() {
    this.timerScreen.classList.remove('dark-mode');
    this.timerScreen.style.backgroundColor = '';
    this.timerScreen.style.color = '';

    const elements = [
      this.currentTimeDisplay,
      this.endTimeDisplay,
      ...document.querySelectorAll('#countdown-content .label'),
      ...document.querySelectorAll('#countdown-content .unit'),
      ...document.querySelectorAll('#countdown-content .number'),
      ...document.querySelectorAll('#countdown-content .time'),
      ...document.querySelectorAll('.time-label')
    ];

    elements.forEach(el => {
      if (el) {
        el.style.color = '';
      }
    });

    if (this.currentColorMode === 'dark') {
      this.timerScreen.classList.add('dark-mode');
    } else if (this.currentColorMode === 'custom') {
      this.timerScreen.style.backgroundColor = this.customBgColor;
      this.applyCustomColors();
    }
  }

  /**
   * カスタムカラーを適用
   */
  applyCustomColors() {
    const lightLabels = document.querySelectorAll('.time-label, #countdown-content .label, #countdown-content .unit');
    lightLabels.forEach(el => {
      if (el) {
        el.style.color = this.adjustColorOpacity(this.customTextColor, 0.5);
      }
    });

    const mainTexts = [this.currentTimeDisplay, this.endTimeDisplay];
    mainTexts.forEach(el => {
      if (el) {
        el.style.color = this.adjustColorOpacity(this.customTextColor, 0.7);
      }
    });

    const countdownTexts = document.querySelectorAll('#countdown-content .number, #countdown-content .time');
    countdownTexts.forEach(el => {
      if (el) {
        el.style.color = this.customTextColor;
      }
    });
  }

  /**
   * 色の透明度を調整
   */
  adjustColorOpacity(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new CountdownDisplay();
});
