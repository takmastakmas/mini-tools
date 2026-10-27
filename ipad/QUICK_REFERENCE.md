# 開発クイックリファレンス - 初代iPad対応

このドキュメントは、**DEVELOPMENT_GUIDELINES.md** の要点をまとめたクイックリファレンスです。

---

## ⚡ 最重要ルール

### 1. JavaScript
```javascript
// ❌ 禁止
const / let / アロー関数 / テンプレートリテラル / クラス / Promise / async/await

// ✅ 使用可能
var / function() {} / 文字列連結 / プロトタイプ / コールバック
```

### 2. CSS
```css
/* ❌ 禁止 */
display: grid;
display: flex; /* 複雑な使用 */

/* ✅ 使用可能 */
float: left; + clearfix
display: block;
```

### 3. ベンダープレフィックス
```css
/* ✅ 必須：すべてのCSS3プロパティ */
-webkit-border-radius: 10px;
-webkit-transform: rotate(45deg);
-webkit-transition: all 0.3s;
/* 常に標準構文も最後に追加 */
```

---

## 📋 コピペ用コードスニペット

### Clearfix
```css
.clearfix {
    zoom: 1;
}
.clearfix:before,
.clearfix:after {
    content: "";
    display: table;
}
.clearfix:after {
    clear: both;
}
```

### Float Grid (3列)
```css
.grid-container {
    zoom: 1;
    margin: 0 -10px;
}
.grid-container:after {
    content: "";
    display: table;
    clear: both;
}
.grid-item {
    float: left;
    width: 100%;
    width: -webkit-calc(33.333% - 20px);
    width: calc(33.333% - 20px);
    margin: 0 10px 20px 10px;
}
```

### グラデーション（完全版）
```css
.gradient-bg {
    background: #c3cfe2; /* フォールバック */
    background: -webkit-gradient(linear, left top, right bottom, 
        from(#f5f7fa), to(#c3cfe2)); /* iOS 5 */
    background: -webkit-linear-gradient(315deg, #f5f7fa 0%, #c3cfe2 100%);
    background: -moz-linear-gradient(315deg, #f5f7fa 0%, #c3cfe2 100%);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
```

### Transform（完全版）
```css
.rotated {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
}
```

### Transition（完全版）
```css
.animated {
    -webkit-transition: all 0.3s ease;
    -moz-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all 0.3s ease;
}
```

### Box Shadow（完全版）
```css
.shadow {
    -webkit-box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    -moz-box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
```

### Border Radius（完全版）
```css
.rounded {
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
}
```

### requestAnimationFrame ポリフィル
```javascript
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        return setTimeout(callback, 1000 / 60);
    };

window.cancelAnimationFrame = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    function(id) {
        clearTimeout(id);
    };
```

### XMLHttpRequest（GET）
```javascript
function getData(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback(new Error('Request failed: ' + xhr.status));
        }
    };
    xhr.onerror = function() {
        callback(new Error('Network error'));
    };
    xhr.send();
}

// 使用例
getData('https://api.example.com/data', function(error, data) {
    if (error) {
        console.error(error);
        return;
    }
    console.log(data);
});
```

### Canvas時計の基本構造
```javascript
var canvas = document.getElementById('clock');
var ctx = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

function draw() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    
    // 描画処理
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 時針
    var hourAngle = (hours % 12 + minutes / 60) * 30 * Math.PI / 180;
    ctx.rotate(hourAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -50);
    ctx.stroke();
    
    ctx.restore();
}

// 60fpsで更新
setInterval(draw, 1000 / 60);
```

---

## 🚨 よくある間違い

### 1. const使用
```javascript
// ❌ NG
const clockDiv = document.getElementById('clock');

// ✅ OK
var clockDiv = document.getElementById('clock');
```

### 2. アロー関数
```javascript
// ❌ NG
setTimeout(() => { update(); }, 1000);

// ✅ OK
setTimeout(function() { update(); }, 1000);
```

### 3. テンプレートリテラル
```javascript
// ❌ NG
var html = `<div class="${className}">${content}</div>`;

// ✅ OK
var html = '<div class="' + className + '">' + content + '</div>';
```

### 4. ベンダープレフィックス忘れ
```css
/* ❌ NG */
.box { transform: rotate(45deg); }

/* ✅ OK */
.box {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    transform: rotate(45deg);
}
```

### 5. Calcのフォールバック忘れ
```css
/* ❌ NG */
.box { width: calc(100% - 20px); }

/* ✅ OK */
.box {
    width: 100%;
    width: -webkit-calc(100% - 20px);
    width: calc(100% - 20px);
}
```

---

## ✅ デプロイ前チェックリスト

```
□ const/let を使っていない（var のみ）
□ アロー関数を使っていない（function() {} のみ）
□ テンプレートリテラルを使っていない（文字列連結）
□ すべてのCSS3プロパティにベンダープレフィックスがある
□ グラデーションに古い構文がある
□ Floatレイアウトでclearfixを使っている
□ calcにフォールバック値がある
□ 初代iPadシミュレータでテストした
□ コンソールにエラーが出ない
□ パフォーマンスが十分（30fps以上）
```

---

## 📱 対応ブラウザ

| ブラウザ | 最小バージョン |
|---------|--------------|
| Safari Mobile | 5.1 (iOS 5.1.1) |
| Safari Desktop | 5.1+ |
| Chrome | 任意（参考） |
| Firefox | 任意（参考） |

**メインターゲット**: Safari Mobile 5.1（初代iPad）

---

## 🔗 関連ドキュメント

- **DEVELOPMENT_GUIDELINES.md** - 完全な開発ガイドライン（必読）
- **CONVERSION_DETAILS.md** - 技術的な変換の詳細
- **ビジュアル比較.md** - 元のデザインとの比較

---

## 💡 ヒント

### デバッグ
```javascript
// 古いデバイス用のログ
console.log('Value:', value); // ✅ 使用可能
console.error('Error:', error); // ✅ 使用可能
```

### パフォーマンス
- Canvas描画を最適化（不要な描画を避ける）
- setIntervalよりもrequestAnimationFrame（ポリフィル使用）
- DOMアクセスを最小限に

### テスト
- Xcodeシミュレータで古いiOSバージョンをテスト
- 実機があれば実機でテスト
- BrowserStackで複数バージョンをテスト

---

**印刷推奨**: このファイルをプリントアウトして手元に置いておくことをお勧めします。

**最終更新**: 2026年1月2日
