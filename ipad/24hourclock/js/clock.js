// 初代iPad Safari対応 - ES5以前の構文のみ使用
// アロー関数、const/let、テンプレートリテラルなどは使用しない

// 2桁ゼロパディング関数
function zeroPad(num) {
    return (num < 10 ? '0' : '') + num;
}

// 曜日配列
var weekdays = ['日', '月', '火', '水', '木', '金', '土'];

// 時刻を更新する関数
function updateClock() {
    var now = new Date();
    
    // 時刻の取得（秒は不要）
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
        // 初回表示
        updateClock();
        
        // 1分ごとに更新
        setInterval(updateClock, 60000);
    }, false);
} else if (window.attachEvent) {
    // IE8以下対応（念のため）
    window.attachEvent('onload', function() {
        updateClock();
        setInterval(updateClock, 60000);
    });
}
