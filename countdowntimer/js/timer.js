/**
 * カウントダウンタイマー 設定画面
 * 終了時刻または経過分数と色設定を指定し、別ウインドウでカウントダウンを開始する
 */
class CountdownTimer {
  constructor() {
    this.initElements();
    this.initEventListeners();
  }

  /**
   * DOM要素を初期化
   */
  initElements() {
    // ボタン
    this.startButton = document.getElementById('start-button');

    // 設定画面の要素
    this.modeRadios = document.querySelectorAll('input[name="mode"]');
    this.endTimeInput = document.getElementById('endtime-input');
    this.durationInput = document.getElementById('duration-input');
    this.endTimeField = document.getElementById('end-time');
    this.minutesField = document.getElementById('minutes');
    this.secondsField = document.getElementById('seconds');

    // 色設定の要素
    this.colorModeButtons = document.querySelectorAll('.color-mode-btn');
    this.customColorInput = document.getElementById('custom-color-input');
    this.bgColorInput = document.getElementById('bg-color');
    this.textColorInput = document.getElementById('text-color');
  }

  /**
   * イベントリスナーを初期化
   */
  initEventListeners() {
    // モード切り替え
    this.modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => this.handleModeChange(e));
    });

    // 色モード切り替え
    this.colorModeButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleColorModeChange(e));
    });

    // ボタンイベント
    this.startButton.addEventListener('click', () => this.startTimer());
  }

  /**
   * モード変更ハンドラー
   */
  handleModeChange(e) {
    if (e.target.value === 'endtime') {
      this.endTimeInput.classList.add('active');
      this.durationInput.classList.remove('active');
    } else {
      this.endTimeInput.classList.remove('active');
      this.durationInput.classList.add('active');
    }
  }

  /**
   * 色モード変更ハンドラー
   */
  handleColorModeChange(e) {
    // すべてのボタンからactiveクラスを削除
    this.colorModeButtons.forEach(btn => btn.classList.remove('active'));
    // クリックされたボタンにactiveクラスを追加
    e.target.classList.add('active');

    const mode = e.target.dataset.mode;
    if (mode === 'custom') {
      this.customColorInput.classList.add('active');
    } else {
      this.customColorInput.classList.remove('active');
    }
  }

  /**
   * タイマー開始（別ウインドウで表示）
   */
  startTimer() {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;

    // 終了時刻を計算
    let endTimeStamp;
    if (selectedMode === 'endtime') {
      const timeValue = this.endTimeField.value;
      if (!timeValue) {
        alert('終了時刻を入力してください');
        return;
      }
      endTimeStamp = this.getEndTimeFromClock(timeValue);
    } else {
      const minutes = parseInt(this.minutesField.value) || 0;
      const seconds = parseInt(this.secondsField.value) || 0;

      if (minutes === 0 && seconds === 0) {
        alert('時間を入力してください（0より大きい値）');
        return;
      }

      endTimeStamp = this.getEndTimeFromDuration(minutes, seconds);
    }

    // 現在時刻より過去の場合はエラー
    if (endTimeStamp <= Date.now()) {
      alert('終了時刻は現在時刻より後に設定してください');
      return;
    }

    // 色モードを取得
    const selectedButton = document.querySelector('.color-mode-btn.active');
    const colorMode = selectedButton ? selectedButton.dataset.mode : 'light';

    // 表示ウインドウ用のクエリパラメータを組み立て
    const params = new URLSearchParams();
    params.set('end', String(endTimeStamp));
    params.set('color', colorMode);
    if (colorMode === 'custom') {
      params.set('bg', this.bgColorInput.value);
      params.set('text', this.textColorInput.value);
    }

    // 同じ名前のウインドウを使うことで、既存の表示ウインドウがあれば
    // 新しい設定で上書きし、多重に開かないようにする
    const displayWindow = window.open(
      `timer-display.html?${params.toString()}`,
      'countdownTimerDisplay',
      'width=1000,height=600,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no,status=no'
    );

    if (displayWindow) {
      displayWindow.focus();
    } else {
      alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
    }
  }

  /**
   * 時刻指定から終了時刻を計算
   */
  getEndTimeFromClock(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);

    const endTime = new Date();
    endTime.setHours(hours);
    endTime.setMinutes(minutes);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    // もし指定時刻が現在時刻より前なら、翌日とする
    if (endTime <= now) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return endTime.getTime();
  }

  /**
   * 分数指定から終了時刻を計算
   */
  getEndTimeFromDuration(minutes, seconds) {
    const totalMilliseconds = (minutes * 60 + seconds) * 1000;
    return Date.now() + totalMilliseconds;
  }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new CountdownTimer();
});
