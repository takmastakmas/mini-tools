/**
 * プログレスバーウィンドウ
 * 
 * @class ProgressBarWindow
 * @description プレゼンテーション用プログレスバー表示ウィンドウ
 */
class ProgressBarWindow {
    constructor() {
        // タイマー状態
        this.timer = {
            totalSeconds: 1200,
            remainingSeconds: 1200,
            isRunning: false
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
        this.broadcastChannel = null;
        this.updateInterval = null;
        
        // 初期化
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.initBroadcastChannel();
        this.loadStateFromLocalStorage();
        this.requestSyncFromMain();
        this.startUpdateLoop();
        this.attachEventListeners();
        // applySettings()はloadStateFromLocalStorage()内で呼ばれるので、ここでは不要
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            container: document.getElementById('progress-bar-container'),
            fill: document.getElementById('progress-bar-fill'),
            timeDisplay: document.getElementById('time-display')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        // ウィンドウがフォーカスを得た時
        window.addEventListener('focus', () => {
            this.loadStateFromLocalStorage();
            this.requestSyncFromMain();
            this.updateProgressBar();
        });
        
        // ウィンドウが閉じられる時
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // ストレージ変更を監視（他のタブからの更新を検知）
        window.addEventListener('storage', (e) => {
            if (e.key === 'timerState' || e.key === 'settings') {
                this.loadStateFromLocalStorage();
                this.updateProgressBar();
            }
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // 右クリックメニューを無効化（プレゼンテーション用）
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // ダブルクリックでフルスクリーン切り替え
        document.addEventListener('dblclick', () => {
            this.toggleFullscreen();
        });
    }
    
    /**
     * BroadcastChannelの初期化
     */
    initBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('timer-channel');
            this.broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'timer-update') {
                    this.updateFromBroadcast(event.data);
                }
            };
        } else {
            // BroadcastChannelがサポートされていない場合はLocalStorageをポーリング
            setInterval(() => this.loadStateFromLocalStorage(), 500);
        }
    }
    
    /**
     * メイン画面に同期リクエストを送信
     */
    requestSyncFromMain() {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'request-sync' });
        }
    }
    
    /**
     * BroadcastChannelからの更新
     */
    updateFromBroadcast(data) {
        if (data.timer) {
            this.timer = { ...data.timer };
            
            // タイマー実行中の場合、startTimeベースで残り時間を再計算
            if (this.timer.isRunning && this.timer.startTime) {
                const elapsed = Math.floor((Date.now() - this.timer.startTime) / 1000);
                this.timer.remainingSeconds = Math.max(0, this.timer.totalSeconds - elapsed);
            }
        }
        if (data.settings) {
            this.settings = { ...data.settings };
            this.applySettings();
        }
        this.updateProgressBar();
    }
    
    /**
     * LocalStorageから状態読み込み
     */
    loadStateFromLocalStorage() {
        try {
            // 現在のタイマー実行状態を保存
            const wasRunning = this.timer.isRunning;
            const currentStartTime = this.timer.startTime;
            
            // まずBroadcastChannelで送られてくるtimerStateから読み込み
            const savedState = localStorage.getItem('timerState');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.timer) {
                    this.timer = { ...state.timer };
                    
                    // タイマー実行中の場合、startTimeベースで残り時間を再計算
                    // これにより古いremainingSecondsの値を使わない
                    if (this.timer.isRunning && this.timer.startTime) {
                        const elapsed = Math.floor((Date.now() - this.timer.startTime) / 1000);
                        this.timer.remainingSeconds = Math.max(0, this.timer.totalSeconds - elapsed);
                    }
                }
                if (state.settings) {
                    this.settings = { ...state.settings };
                }
            }
            
            // AppUtils.saveToStorageで保存されたデータも読み込む
            let appData;
            if (typeof AppUtils !== 'undefined') {
                appData = AppUtils.loadFromStorage('progressbar_app');
            } else {
                const stored = localStorage.getItem('progressbar_app');
                appData = stored ? JSON.parse(stored) : null;
            }
            
            if (appData) {
                if (appData.timer) {
                    this.timer = { ...this.timer, ...appData.timer };
                    
                    // タイマー実行中の場合、startTimeベースで残り時間を再計算
                    if (this.timer.isRunning && this.timer.startTime) {
                        const elapsed = Math.floor((Date.now() - this.timer.startTime) / 1000);
                        this.timer.remainingSeconds = Math.max(0, this.timer.totalSeconds - elapsed);
                    }
                }
                if (appData.settings) {
                    this.settings = { ...this.settings, ...appData.settings };
                }
            }
            
            // 旧バージョンの個別設定も読み込む（後方互換性）
            const legacySettings = localStorage.getItem('settings');
            if (legacySettings) {
                this.settings = { ...this.settings, ...JSON.parse(legacySettings) };
            }
            
            // 設定を適用（データが見つかっても見つからなくても）
            this.applySettings();
            
        } catch (error) {
            console.error('Error loading state:', error);
            // エラーが発生してもデフォルト値を適用
            this.applySettings();
        }
    }
    
    /**
     * 設定を適用
     */
    applySettings() {
        if (!this.elements.container || !this.elements.timeDisplay) {
            return;
        }
        
        // バーの高さを設定
        this.elements.container.style.height = this.settings.barHeight + 'px';
        
        // 時間表示の表示/非表示
        if (this.settings.showTime) {
            this.elements.timeDisplay.style.display = 'block';
        } else {
            this.elements.timeDisplay.style.display = 'none';
        }
        
        // フォントサイズを高さに応じて調整
        const fontSize = Math.max(12, Math.min(32, this.settings.barHeight * 0.7));
        this.elements.timeDisplay.style.fontSize = fontSize + 'px';
    }
    
    /**
     * 更新ループ開始
     */
    startUpdateLoop() {
        // 100msごとに更新
        this.updateInterval = setInterval(() => {
            if (this.timer.isRunning) {
                // 実行中の場合、経過時間から残り時間を計算
                const elapsed = Math.floor((Date.now() - this.timer.startTime) / 1000);
                this.timer.remainingSeconds = Math.max(0, this.timer.totalSeconds - elapsed);
            }
            this.updateProgressBar();
        }, 100);
    }
    
    /**
     * プログレスバー更新
     */
    updateProgressBar() {
        if (!this.elements.fill || !this.elements.timeDisplay) return;
        
        // 進行状況を計算（0-100%）
        const progress = this.timer.totalSeconds > 0 
            ? ((this.timer.totalSeconds - this.timer.remainingSeconds) / this.timer.totalSeconds) * 100 
            : 0;
        
        // 残り時間のパーセンテージを計算
        const remainingPercent = 100 - progress;
        
        // プログレスバーの幅を更新
        this.elements.fill.style.width = progress + '%';
        
        // 色を更新
        const color = this.getColorByProgress(remainingPercent);
        this.elements.fill.style.background = color;
        
        // 点滅効果
        if (this.settings.enableBlink && remainingPercent <= 10) {
            this.elements.fill.classList.add('blink-animation');
        } else {
            this.elements.fill.classList.remove('blink-animation');
        }
        
        // 時間表示を更新
        if (this.settings.showTime) {
            this.elements.timeDisplay.textContent = this.formatTime(this.timer.remainingSeconds);
        }
        
        // タイトルにも残り時間を表示
        document.title = `残り ${this.formatTime(this.timer.remainingSeconds)} - プログレスバー`;
    }
    
    /**
     * 進行状況に応じた色を取得
     */
    getColorByProgress(remainingPercent) {
        if (remainingPercent >= 30) {
            return this.settings.normalColor;
        } else if (remainingPercent >= 10) {
            return this.settings.attentionColor;
        } else {
            return this.settings.dangerColor;
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
     * キーボードショートカット処理
     */
    handleKeyDown(e) {
        // F11でフルスクリーン切り替え
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }
        
        // Escapeでウィンドウを閉じる
        if (e.key === 'Escape' && !document.fullscreenElement) {
            window.close();
        }
    }
    
    /**
     * フルスクリーン切り替え
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new ProgressBarWindow();
});
