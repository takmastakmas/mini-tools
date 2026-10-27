// 初代iPad Safari対応 - ES5以前の構文のみ使用
// アロー関数、const/let、テンプレートリテラルなどは使用しない

// グローバル変数
var timeOffset = 0; // APIから取得した時刻とローカル時刻の差分（ミリ秒）
var useApiTime = false; // API時刻を使用するかどうか
var lastApiSync = 0; // 最後にAPI同期した時刻（ミリ秒）
var API_SYNC_INTERVAL = 3600000; // 1時間ごとに再同期（ミリ秒）

// 2桁ゼロパディング関数
function zeroPad(num) {
    return (num < 10 ? '0' : '') + num;
}

// 曜日配列
var weekdays = ['日', '月', '火', '水', '木', '金', '土'];

// WorldTimeAPIから正確な時刻を取得する関数
function fetchAccurateTime() {
    try {
        var xhr = new XMLHttpRequest();
        var apiUrl = 'https://worldtimeapi.org/api/timezone/Asia/Tokyo';
        
        xhr.open('GET', apiUrl, true);
        xhr.timeout = 5000; // 5秒でタイムアウト
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        var apiTime = new Date(response.datetime);
                        var localTime = new Date();
                        
                        // 時刻の差分を計算
                        timeOffset = apiTime.getTime() - localTime.getTime();
                        useApiTime = true;
                        lastApiSync = localTime.getTime();
                        
                        console.log('API時刻同期成功: オフセット = ' + timeOffset + 'ms');
                        updateClock();
                    } catch (e) {
                        console.log('APIレスポンスのパースに失敗: ' + e.message);
                        fallbackToLocalTime();
                    }
                } else {
                    console.log('API呼び出し失敗: ステータス ' + xhr.status);
                    fallbackToLocalTime();
                }
            }
        };
        
        xhr.onerror = function() {
            console.log('API接続エラー');
            fallbackToLocalTime();
        };
        
        xhr.ontimeout = function() {
            console.log('APIタイムアウト');
            fallbackToLocalTime();
        };
        
        xhr.send();
    } catch (e) {
        console.log('API呼び出し例外: ' + e.message);
        fallbackToLocalTime();
    }
}

// ローカル時刻にフォールバックする関数
function fallbackToLocalTime() {
    useApiTime = false;
    timeOffset = 0;
    console.log('ローカル時刻を使用します');
    updateClock();
}

// 現在時刻を取得する関数（API時刻またはローカル時刻）
function getCurrentTime() {
    var localTime = new Date();
    
    // API同期から一定時間経過していれば再同期
    if (useApiTime && (localTime.getTime() - lastApiSync > API_SYNC_INTERVAL)) {
        fetchAccurateTime();
    }
    
    // API時刻を使用する場合はオフセットを適用
    if (useApiTime) {
        return new Date(localTime.getTime() + timeOffset);
    } else {
        return localTime;
    }
}

// 時刻を更新する関数
function updateClock() {
    var now = getCurrentTime();
    
    // 時刻の取得
    var hours = zeroPad(now.getHours());
    var minutes = zeroPad(now.getMinutes());
    
    // 日付の取得
    var year = now.getFullYear();
    var month = zeroPad(now.getMonth() + 1);
    var date = zeroPad(now.getDate());
    var weekday = weekdays[now.getDay()];
    
    // DOM要素の取得と更新
    var timeElement = document.getElementById('time');
    var dateElement = document.getElementById('date');
    
    if (timeElement) {
        timeElement.innerHTML = hours + ':' + minutes;
    }
    
    if (dateElement) {
        dateElement.innerHTML = year + '年' + month + '月' + date + '日 (' + weekday + ')';
    }
}

// ページ読み込み完了時に実行
if (window.addEventListener) {
    window.addEventListener('load', function() {
        // 初回はローカル時刻で表示
        updateClock();
        
        // 1分ごとに更新
        setInterval(updateClock, 60000);
        
        // API時刻を取得（非同期）
        fetchAccurateTime();
    }, false);
} else if (window.attachEvent) {
    // IE8以下対応（念のため）
    window.attachEvent('onload', function() {
        updateClock();
        setInterval(updateClock, 60000);
        fetchAccurateTime();
    });
}
