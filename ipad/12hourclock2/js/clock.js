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
    
    // 時刻の取得（12時間表示）
    var hours24 = now.getHours();
    var hours12 = hours24 % 12;
    if (hours12 === 0) {
        hours12 = 12;
    }
    var minutes = zeroPad(now.getMinutes());
    
    // 午前/午後の判定
    var isAM = hours24 < 12;
    var periodIcon = isAM ? '☀' : '🌙';
    var periodText = isAM ? '午前' : '午後';
    
    // 日付の取得
    var year = now.getFullYear();
    var month = zeroPad(now.getMonth() + 1);
    var date = zeroPad(now.getDate());
    var weekday = weekdays[now.getDay()];
    
    // DOM要素の取得と更新
    var timeElement = document.getElementById('time');
    var dateElement = document.getElementById('date');
    var periodElement = document.getElementById('period-icon');
    var periodTextElement = document.getElementById('period-text');
    
    if (timeElement) {
        timeElement.innerHTML = hours12 + ':' + minutes;
    }
    
    if (dateElement) {
        dateElement.innerHTML = year + '年' + month + '月' + date + '日 (' + weekday + ')';
    }
    
    if (periodElement) {
        periodElement.innerHTML = periodIcon;
    }
    
    if (periodTextElement) {
        periodTextElement.innerHTML = periodText;
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
