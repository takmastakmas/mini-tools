/**
 * プログレスバーアプリケーション
 * 
 * @class ProgressBarApp
 * @description プレゼンテーション用のプログレスバー管理アプリ
 */
class ProgressBarApp {
    constructor() {
        // ストレージキー
        this.storageKey = 'progressbar_app';
        this.legacyTimerKey = 'timer';
        this.legacySettingsKey = 'settings';
        
        // タイマー状態
        this.timer = {
            totalSeconds: 180, // デフォルト3分
            remainingSeconds: 180,
            isRunning: false,
            intervalId: null,
            startTime: null,
            pausedTime: 0
        };
        
        // 設定
        this.settings = {
            barHeight: 20,
            showTime: true,
            normalColor: '#4CAF50',
            attentionColor: '#FF9800',
            dangerColor: '#F44336',
            enableBlink: false
        };
        
        // UI要素
        this.elements = {};
        
        // その他
        this.progressWindow = null;
        this.broadcastChannel = null;
        
        // 初期化
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.loadFromStorage();
        this.initBroadcastChannel();
        this.attachEventListeners();
        this.setDefaultEndTime();
        this.updateDisplay();
        this.updateControlButtons();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            // プリセットボタン
            presetButtons: document.querySelectorAll('.preset-btn'),
            
            // カスタム入力
            customMinutes: document.getElementById('custom-minutes'),
            customSeconds: document.getElementById('custom-seconds'),
            setCustomBtn: document.getElementById('set-custom-btn'),
            
            // 終了時刻
            endHour: document.getElementById('end-hour'),
            endMinute: document.getElementById('end-minute'),
            setEndTimeBtn: document.getElementById('set-endtime-btn'),
            calculatedTime: document.getElementById('calculated-time'),
            
            // コントロール
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            openProgressBtn: document.getElementById('open-progress-btn'),
            
            // 表示
            currentTime: document.getElementById('current-time'),
            totalTime: document.getElementById('total-time'),
            mainProgressFill: document.getElementById('main-progress-fill'),
            progressText: document.getElementById('progress-text'),
            
            // 設定
            barHeight: document.getElementById('bar-height'),
            barHeightValue: document.getElementById('bar-height-value'),
            normalColor: document.getElementById('normal-color'),
            attentionColor: document.getElementById('attention-color'),
            dangerColor: document.getElementById('danger-color'),
            showTime: document.getElementById('show-time'),
            enableBlink: document.getElementById('enable-blink'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            clearSettingsBtn: document.getElementById('clear-settings-btn')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // プリセットボタン
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handlePresetClick(btn));
        });
        
        // カスタム時間
        this.elements.setCustomBtn?.addEventListener('click', 
            () => this.handleCustomTimeSet()
        );
        
        // 終了時刻
        this.elements.setEndTimeBtn?.addEventListener('click', 
            () => this.handleEndTimeSet()
        );
        this.elements.endHour?.addEventListener('input', 
            () => this.calculateRemainingTime()
        );
        this.elements.endMinute?.addEventListener('input', 
            () => this.calculateRemainingTime()
        );
        
        // コントロール
        this.elements.startBtn?.addEventListener('click', 
            () => this.startTimer()
        );
        this.elements.pauseBtn?.addEventListener('click', 
            () => this.pauseTimer()
        );
        this.elements.resetBtn?.addEventListener('click', 
            () => this.resetTimer()
        );
        this.elements.openProgressBtn?.addEventListener('click', 
            () => this.openProgressWindow()
        );
        
        // 設定
        this.elements.barHeight?.addEventListener('input', (e) => {
            if (this.elements.barHeightValue) {
                this.elements.barHeightValue.textContent = e.target.value;
            }
        });
        
        this.elements.saveSettingsBtn?.addEventListener('click', 
            () => this.saveSettings()
        );
        this.elements.clearSettingsBtn?.addEventListener('click', 
            () => this.clearSettings()
        );
        
        // 色設定のリアルタイムプレビュー
        ['normalColor', 'attentionColor', 'dangerColor'].forEach(key => {
            this.elements[key]?.addEventListener('input', 
                () => this.updateProgressBarColor()
            );
        });
        
        // ページ離脱時の処理
        window.addEventListener('beforeunload', () => {
            if (this.timer.isRunning) {
                this.saveToStorage();
            }
        });
    }
    
    /**
     * BroadcastChannelの初期化
     */
    initBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('timer-channel');
            this.broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'request-sync') {
                    this.broadcastTimerState();
                }
            };
        }
    }
    
    /**
     * 終了時刻のデフォルト値を設定
     */
    setDefaultEndTime() {
        if (this.elements.endHour && this.elements.endMinute) {
            this.elements.endHour.value = 17;
            this.elements.endMinute.value = 0;
        }
        this.calculateRemainingTime();
    }
    
    /**
     * 終了時刻から残り時間を計算
     */
    calculateRemainingTime() {
        if (!this.elements.endHour || !this.elements.endMinute || !this.elements.calculatedTime) {
            return;
        }
        
        const endHour = parseInt(this.elements.endHour.value);
        const endMinute = parseInt(this.elements.endMinute.value);
        
        if (isNaN(endHour) || isNaN(endMinute)) {
            this.elements.calculatedTime.textContent = '';
            return;
        }
        
        const now = new Date();
        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);
        
        // 終了時刻が現在時刻より前の場合は翌日とみなす
        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }
        
        const diffMs = endTime - now;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const remainingSeconds = diffSeconds % 60;
        
        this.elements.calculatedTime.textContent = 
            `→ 残り${diffMinutes}分${remainingSeconds}秒`;
    }
    
    /**
     * プリセットボタンクリック処理
     */
    handlePresetClick(button) {
        const minutes = parseInt(button.dataset.minutes);
        this.setTimer(minutes * 60);
        this.updatePresetButtonsState(button);
    }
    
    /**
     * カスタム時間設定
     */
    handleCustomTimeSet() {
        const minutes = parseInt(this.elements.customMinutes?.value) || 0;
        const seconds = parseInt(this.elements.customSeconds?.value) || 0;
        this.setTimer(minutes * 60 + seconds);
        this.updatePresetButtonsState(null);
    }
    
    /**
     * 終了時刻設定
     */
    handleEndTimeSet() {
        if (!this.elements.endHour || !this.elements.endMinute) return;
        
        const endHour = parseInt(this.elements.endHour.value);
        const endMinute = parseInt(this.elements.endMinute.value);
        
        if (isNaN(endHour) || isNaN(endMinute)) {
            if (typeof AppUtils !== 'undefined') {
                AppUtils.showToast('終了時刻を正しく入力してください', 'error');
            } else {
                alert('終了時刻を正しく入力してください');
            }
            return;
        }
        
        const now = new Date();
        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);
        
        // 終了時刻が現在時刻より前の場合は翌日とみなす
        if (endTime <= now) {
            endTime.setDate(endTime.getDate() + 1);
        }
        
        const diffMs = endTime - now;
        const diffSeconds = Math.floor(diffMs / 1000);
        
        if (diffSeconds <= 0) {
            if (typeof AppUtils !== 'undefined') {
                AppUtils.showToast('終了時刻が過去の時刻です', 'error');
            } else {
                alert('終了時刻が過去の時刻です');
            }
            return;
        }
        
        this.setTimer(diffSeconds);
        this.updatePresetButtonsState(null);
    }
    
    /**
     * タイマー設定
     */
    setTimer(seconds) {
        if (this.timer.isRunning) {
            if (!confirm('タイマーが実行中です。リセットしてもよろしいですか?')) {
                return;
            }
            this.pauseTimer();
        }
        
        this.timer.totalSeconds = seconds;
        this.timer.remainingSeconds = seconds;
        this.updateDisplay();
        this.saveToStorage();
        this.broadcastTimerState();
    }
    
    /**
     * タイマー開始
     */
    startTimer() {
        if (this.timer.isRunning) return;
        
        this.timer.isRunning = true;
        this.timer.startTime = Date.now() - this.timer.pausedTime;
        
        this.timer.intervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.timer.startTime) / 1000);
            this.timer.remainingSeconds = Math.max(0, this.timer.totalSeconds - elapsed);
            
            this.updateDisplay();
            this.broadcastTimerState();
            
            if (this.timer.remainingSeconds <= 0) {
                this.pauseTimer();
                this.notifyTimeUp();
            }
        }, 100); // 100msごとに更新して滑らかに
        
        this.updateControlButtons();
        this.saveToStorage();
    }
    
    /**
     * タイマー一時停止
     */
    pauseTimer() {
        if (!this.timer.isRunning) return;
        
        this.timer.isRunning = false;
        this.timer.pausedTime = Date.now() - this.timer.startTime;
        
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        }
        
        this.updateControlButtons();
        this.saveToStorage();
        this.broadcastTimerState();
    }
    
    /**
     * タイマーリセット
     */
    resetTimer() {
        const wasRunning = this.timer.isRunning;
        
        if (wasRunning) {
            this.pauseTimer();
        }
        
        this.timer.remainingSeconds = this.timer.totalSeconds;
        this.timer.pausedTime = 0;
        
        this.updateDisplay();
        this.saveToStorage();
        this.broadcastTimerState();
    }
    
    /**
     * 時間切れ通知
     */
    notifyTimeUp() {
        if (typeof AppUtils !== 'undefined') {
            AppUtils.showToast('時間になりました！', 'info');
        } else {
            alert('時間になりました！');
        }
    }
    
    /**
     * 表示更新
     */
    updateDisplay() {
        // 残り時間表示
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = this.formatTime(this.timer.remainingSeconds);
        }
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = this.formatTime(this.timer.totalSeconds);
        }
        
        // プログレス表示
        const progress = this.timer.totalSeconds > 0 
            ? ((this.timer.totalSeconds - this.timer.remainingSeconds) / this.timer.totalSeconds) * 100 
            : 0;
        
        if (this.elements.mainProgressFill) {
            this.elements.mainProgressFill.style.width = progress + '%';
        }
        if (this.elements.progressText) {
            this.elements.progressText.textContent = Math.round(progress) + '%';
        }
        
        // プログレスバーの色更新
        this.updateProgressBarColor();
    }
    
    /**
     * メイン画面のプログレスバー色更新
     */
    updateProgressBarColor() {
        if (!this.elements.mainProgressFill) return;
        
        const remainingPercent = this.timer.totalSeconds > 0 
            ? (this.timer.remainingSeconds / this.timer.totalSeconds) * 100 
            : 100;
        
        let color;
        if (remainingPercent >= 30) {
            color = this.elements.normalColor?.value || this.settings.normalColor;
        } else if (remainingPercent >= 10) {
            color = this.elements.attentionColor?.value || this.settings.attentionColor;
        } else {
            color = this.elements.dangerColor?.value || this.settings.dangerColor;
        }
        
        this.elements.mainProgressFill.style.background = color;
    }
    
    /**
     * コントロールボタン状態更新
     */
    updateControlButtons() {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = this.timer.isRunning;
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = !this.timer.isRunning;
        }
    }
    
    /**
     * プリセットボタン状態更新
     */
    updatePresetButtonsState(activeBtn) {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    /**
     * 時間フォーマット
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * プログレスバーウィンドウを開く
     */
    openProgressWindow() {
        // 既存のウィンドウがあれば閉じる
        if (this.progressWindow && !this.progressWindow.closed) {
            this.progressWindow.focus();
            return;
        }
        
        // 新しいウィンドウを開く（サブディスプレイ用）
        const width = 800;
        const height = 100;
        const left = window.screen.availLeft + (window.screen.availWidth - width) / 2;
        const top = window.screen.availTop + window.screen.availHeight - height;
        
        this.progressWindow = window.open(
            'progress.html',
            'progressBar',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no,status=no`
        );
        
        // ウィンドウが開いたらすぐに状態を送信
        if (this.progressWindow) {
            setTimeout(() => {
                this.broadcastTimerState();
            }, 500);
        }
    }
    
    /**
     * タイマー状態をブロードキャスト
     */
    broadcastTimerState() {
        const state = {
            type: 'timer-update',
            timer: { ...this.timer },
            settings: { ...this.settings }
        };
        
        // BroadcastChannel経由で送信
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(state);
        }
        
        // LocalStorageにも保存（フォールバック）
        localStorage.setItem('timerState', JSON.stringify(state));
    }
    
    /**
     * 設定保存
     */
    saveSettings() {
        this.settings = {
            barHeight: parseInt(this.elements.barHeight?.value) || 20,
            showTime: this.elements.showTime?.checked ?? true,
            normalColor: this.elements.normalColor?.value || '#4CAF50',
            attentionColor: this.elements.attentionColor?.value || '#FF9800',
            dangerColor: this.elements.dangerColor?.value || '#F44336',
            enableBlink: this.elements.enableBlink?.checked ?? false
        };
        
        this.saveToStorage();
        this.broadcastTimerState();
        this.updateProgressBarColor();
        
        if (typeof AppUtils !== 'undefined') {
            AppUtils.showToast('設定を保存しました', 'success');
        } else {
            alert('設定を保存しました');
        }
    }
    
    /**
     * 設定クリア
     */
    clearSettings() {
        if (!confirm('すべての設定をクリアしてデフォルト値に戻します。よろしいですか？')) {
            return;
        }
        
        // デフォルト値に戻す
        this.settings = {
            barHeight: 20,
            showTime: true,
            normalColor: '#4CAF50',
            attentionColor: '#FF9800',
            dangerColor: '#F44336',
            enableBlink: false
        };
        
        // UIに反映
        if (this.elements.barHeight) this.elements.barHeight.value = 20;
        if (this.elements.barHeightValue) this.elements.barHeightValue.textContent = 20;
        if (this.elements.showTime) this.elements.showTime.checked = true;
        if (this.elements.normalColor) this.elements.normalColor.value = '#4CAF50';
        if (this.elements.attentionColor) this.elements.attentionColor.value = '#FF9800';
        if (this.elements.dangerColor) this.elements.dangerColor.value = '#F44336';
        if (this.elements.enableBlink) this.elements.enableBlink.checked = false;
        
        // タイマーをリセット
        this.timer.totalSeconds = 180;
        this.timer.remainingSeconds = 180;
        this.timer.isRunning = false;
        this.timer.pausedTime = 0;
        
        if (this.timer.intervalId) {
            clearInterval(this.timer.intervalId);
            this.timer.intervalId = null;
        }
        
        // LocalStorageをクリア
        if (typeof AppUtils !== 'undefined') {
            AppUtils.removeFromStorage(this.storageKey);
            AppUtils.removeFromStorage(this.legacyTimerKey);
            AppUtils.removeFromStorage(this.legacySettingsKey);
        } else {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.legacyTimerKey);
            localStorage.removeItem(this.legacySettingsKey);
        }
        localStorage.removeItem('timerState');
        
        this.updateDisplay();
        this.updateControlButtons();
        this.broadcastTimerState();
        
        if (typeof AppUtils !== 'undefined') {
            AppUtils.showToast('設定をクリアしました！', 'success');
        } else {
            alert('設定をクリアしました！');
        }
    }
    
    /**
     * データの保存
     */
    saveToStorage() {
        const data = {
            timer: {
                totalSeconds: this.timer.totalSeconds,
                remainingSeconds: this.timer.remainingSeconds,
                isRunning: this.timer.isRunning,
                pausedTime: this.timer.pausedTime
                // intervalIdは保存しない
            },
            settings: this.settings,
            timestamp: Date.now()
        };
        
        if (typeof AppUtils !== 'undefined') {
            AppUtils.saveToStorage(this.storageKey, data);
        } else {
            // Fallback
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
    }
    
    /**
     * データの読み込み
     */
    loadFromStorage() {
        let data;
        
        // 新しいストレージキーから読み込み
        if (typeof AppUtils !== 'undefined') {
            data = AppUtils.loadFromStorage(this.storageKey);
        } else {
            const stored = localStorage.getItem(this.storageKey);
            data = stored ? JSON.parse(stored) : null;
        }
        
        // 旧バージョンのデータも読み込む（マイグレーション）
        if (!data) {
            const legacyTimer = localStorage.getItem(this.legacyTimerKey);
            const legacySettings = localStorage.getItem(this.legacySettingsKey);
            
            if (legacyTimer || legacySettings) {
                data = {};
                if (legacyTimer) {
                    data.timer = JSON.parse(legacyTimer);
                }
                if (legacySettings) {
                    data.settings = JSON.parse(legacySettings);
                }
            }
        }
        
        if (data) {
            if (data.timer) {
                // intervalIdは復元しない、isRunningも復元しない（停止状態で開始）
                this.timer.totalSeconds = data.timer.totalSeconds || this.timer.totalSeconds;
                this.timer.remainingSeconds = data.timer.remainingSeconds || this.timer.remainingSeconds;
                this.timer.pausedTime = data.timer.pausedTime || 0;
                // ページリロード時は停止状態にする
                this.timer.isRunning = false;
            }
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
                this.applySettingsToUI();
            }
        }
    }
    
    /**
     * 設定をUIに反映
     */
    applySettingsToUI() {
        if (this.elements.barHeight) {
            this.elements.barHeight.value = this.settings.barHeight;
        }
        if (this.elements.barHeightValue) {
            this.elements.barHeightValue.textContent = this.settings.barHeight;
        }
        if (this.elements.showTime) {
            this.elements.showTime.checked = this.settings.showTime;
        }
        if (this.elements.normalColor) {
            this.elements.normalColor.value = this.settings.normalColor;
        }
        if (this.elements.attentionColor) {
            this.elements.attentionColor.value = this.settings.attentionColor;
        }
        if (this.elements.dangerColor) {
            this.elements.dangerColor.value = this.settings.dangerColor;
        }
        if (this.elements.enableBlink) {
            this.elements.enableBlink.checked = this.settings.enableBlink;
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new ProgressBarApp();
});
