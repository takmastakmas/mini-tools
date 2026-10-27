# 開発ガイドライン - 初代iPad対応プロジェクト

このドキュメントは、このプロジェクトおよびサブディレクトリに配置する時計アプリを開発する際の**必須ガイドライン**です。初代iPad（iOS 5.1.1）および古いiOSデバイスとの互換性を維持するために、必ず遵守してください。

---

## 🎯 プロジェクトの目的と制約

### 対応デバイス
- **最小サポート**: 初代iPad（iOS 5.1.1、Safari Mobile 5.1）
- **対象デバイス**: iPhone 3GS以降、iPad全モデル、iPod touch
- **ブラウザ**: Mobile Safari 5.1以降

### 互換性の原則
**このプロジェクトでは、初代iPadで動作しないコードは使用禁止です。**

---

## ❌ 使用禁止技術（iOS 5-9で動作しない）

### JavaScript（ES6以降の機能）

#### 変数宣言
```javascript
// ❌ 禁止
const APP_NAME = "Clock";
let counter = 0;

// ✅ 使用可能
var APP_NAME = "Clock";
var counter = 0;
```

#### アロー関数
```javascript
// ❌ 禁止
const updateTime = () => {
    console.log("Update");
};
arr.map(item => item * 2);

// ✅ 使用可能
var updateTime = function() {
    console.log("Update");
};
arr.map(function(item) {
    return item * 2;
});
```

#### テンプレートリテラル
```javascript
// ❌ 禁止
const message = `Hello, ${name}!`;
const html = `<div class="${className}">${content}</div>`;

// ✅ 使用可能
var message = "Hello, " + name + "!";
var html = '<div class="' + className + '">' + content + '</div>';
```

#### デフォルトパラメータ
```javascript
// ❌ 禁止
function greet(name = "Guest") {
    return "Hello, " + name;
}

// ✅ 使用可能
function greet(name) {
    name = name || "Guest";
    return "Hello, " + name;
}
```

#### 分割代入
```javascript
// ❌ 禁止
const { x, y } = point;
const [first, second] = array;

// ✅ 使用可能
var x = point.x;
var y = point.y;
var first = array[0];
var second = array[1];
```

#### クラス構文
```javascript
// ❌ 禁止
class Clock {
    constructor() {
        this.time = new Date();
    }
}

// ✅ 使用可能
function Clock() {
    this.time = new Date();
}
Clock.prototype.update = function() {
    this.time = new Date();
};
```

#### Promise / async / await
```javascript
// ❌ 禁止
async function fetchData() {
    const response = await fetch(url);
    return await response.json();
}

// ✅ 使用可能（コールバックまたはポリフィル使用）
function fetchData(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        callback(JSON.parse(xhr.responseText));
    };
    xhr.send();
}
```

#### その他のES6+機能
```javascript
// ❌ 禁止
const arr = [...oldArr];              // スプレッド構文
const obj = { ...oldObj };            // オブジェクトスプレッド
const sym = Symbol('key');            // Symbol
for (let item of items) {}            // for...of
arr.includes(item);                   // Array.includes (ES7)

// ✅ 使用可能
var arr = oldArr.slice();             // 配列コピー
var obj = Object.assign({}, oldObj);  // オブジェクトコピー（要ポリフィル）
// Symbol は使用不可
for (var i = 0; i < items.length; i++) {  // 従来のfor文
    var item = items[i];
}
arr.indexOf(item) !== -1;             // indexOf使用
```

---

### CSS（モダンレイアウト技術）

#### Grid Layout
```css
/* ❌ 禁止 - iOS 10.3以降のみサポート */
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

/* ✅ 使用可能 - Float + Clearfix */
.container {
    zoom: 1; /* IE用 */
}
.container:after {
    content: "";
    display: table;
    clear: both;
}
.item {
    float: left;
    width: 33.333%;
    width: -webkit-calc(33.333% - 20px);
    width: calc(33.333% - 20px);
    margin: 0 10px;
}
```

#### Flexbox（部分的に禁止）
```css
/* ❌ 禁止 - 複雑なFlexbox（iOS 9以降で完全サポート） */
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

/* ✅ 使用可能 - シンプルなブロックレイアウト */
.container {
    display: block;
}
.item {
    display: block;
    margin: 0 auto; /* 中央寄せ */
}

/* ⚠️ 使用注意 - 古いFlexbox構文（iOS 5-6用） */
.container {
    display: -webkit-box;      /* 古いFlexbox */
    -webkit-box-orient: horizontal;
}
```

#### ベンダープレフィックスなしのCSS3
```css
/* ❌ 禁止 - プレフィックスなし */
.box {
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transform: scale(1.2);
    transition: all 0.3s;
}

/* ✅ 使用可能 - すべてのプレフィックス付き */
.box {
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    
    -webkit-box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    -moz-box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    
    -webkit-transform: scale(1.2);
    -moz-transform: scale(1.2);
    -ms-transform: scale(1.2);
    -o-transform: scale(1.2);
    transform: scale(1.2);
    
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
}
```

#### モダンなグラデーション構文のみ
```css
/* ❌ 禁止 - 新しい構文のみ */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* ✅ 使用可能 - フォールバックと古い構文を含む */
background: #764ba2; /* フォールバック */
background: -webkit-gradient(linear, left top, right bottom, 
    color-stop(0%, #667eea), color-stop(100%, #764ba2)); /* iOS 5用 */
background: -webkit-linear-gradient(315deg, #667eea 0%, #764ba2 100%);
background: -moz-linear-gradient(315deg, #667eea 0%, #764ba2 100%);
background: -o-linear-gradient(315deg, #667eea 0%, #764ba2 100%);
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### CSS Variables (Custom Properties)
```css
/* ❌ 禁止 - iOS 9.3以降のみサポート */
:root {
    --primary-color: #667eea;
    --spacing: 20px;
}
.box {
    color: var(--primary-color);
    padding: var(--spacing);
}

/* ✅ 使用可能 - 直接値を指定 */
.box {
    color: #667eea;
    padding: 20px;
}
```

#### その他の禁止CSS
```css
/* ❌ 禁止 */
@supports (display: grid) {}          /* Feature queries - iOS 9+ */
.box { width: min(100%, 500px); }     /* min/max関数 - iOS 11+ */
.box { aspect-ratio: 16/9; }          /* Aspect ratio - iOS 15+ */
.box { position: sticky; }            /* Sticky positioning - iOS 6.1+（バグあり）*/
.box { filter: blur(5px); }           /* CSS Filters - iOS 6+（-webkit-必須）*/
```

---

### HTML（使用注意）

#### セマンティックHTML5要素
```html
<!-- ⚠️ 使用可能だが注意 - iOS 5でも動作するがCSSリセットが必要 -->
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

<!-- スタイルをリセット -->
<style>
header, nav, main, section, article, aside, footer {
    display: block; /* iOS 5用 */
}
</style>
```

#### 入力タイプ
```html
<!-- ❌ 部分的に非対応 -->
<input type="date">        <!-- iOS 5で部分的サポート -->
<input type="color">       <!-- iOS 12.2以降 -->
<input type="datetime-local"> <!-- iOS 5で非サポート -->

<!-- ✅ 安全に使用可能 -->
<input type="text">
<input type="number">
<input type="email">
<input type="tel">
<input type="url">
```

---

## ✅ 使用可能技術（iOS 5.1.1+でサポート）

### JavaScript

#### DOM操作
```javascript
// ✅ 使用可能
document.getElementById('id');
document.getElementsByClassName('class');
document.querySelector('.class');
document.querySelectorAll('.class');
element.addEventListener('click', function() {});
element.classList.add('active');
element.classList.remove('active');
element.innerHTML = '<p>Text</p>';
element.textContent = 'Text';
```

#### 配列メソッド（ES5）
```javascript
// ✅ 使用可能
arr.forEach(function(item) {});
arr.map(function(item) { return item * 2; });
arr.filter(function(item) { return item > 5; });
arr.reduce(function(acc, item) { return acc + item; }, 0);
arr.indexOf(item);
arr.slice();
arr.splice();
```

#### オブジェクトメソッド（ES5）
```javascript
// ✅ 使用可能
Object.keys(obj);
Object.create(proto);
// Object.assign() は要ポリフィル
```

#### JSON
```javascript
// ✅ 使用可能
JSON.parse(jsonString);
JSON.stringify(object);
```

#### タイマー
```javascript
// ✅ 使用可能
setTimeout(function() {}, 1000);
setInterval(function() {}, 1000);
clearTimeout(timerId);
clearInterval(intervalId);
```

#### Date / Math
```javascript
// ✅ 使用可能
var now = new Date();
now.getTime();
Date.now();
Math.floor(), Math.ceil(), Math.round();
Math.random();
```

#### Canvas API（基本機能）
```javascript
// ✅ 使用可能（iOS 5+でサポート）
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, 100, 100);
ctx.arc(50, 50, 30, 0, Math.PI * 2);
ctx.fillText('Text', 10, 50);
// ただし高度な機能は要確認
```

#### XMLHttpRequest
```javascript
// ✅ 使用可能
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.onload = function() {
    console.log(xhr.responseText);
};
xhr.send();
```

#### LocalStorage / SessionStorage
```javascript
// ✅ 使用可能
localStorage.setItem('key', 'value');
localStorage.getItem('key');
sessionStorage.setItem('key', 'value');
```

---

### CSS

#### 基本的なCSS3プロパティ（ベンダープレフィックス付き）
```css
/* ✅ 使用可能 - 必ずプレフィックスを含める */
-webkit-border-radius: 10px;
-webkit-box-shadow: 0 2px 5px rgba(0,0,0,0.1);
-webkit-transform: rotate(45deg) scale(1.2) translate(10px, 20px);
-webkit-transition: all 0.3s ease;
-webkit-animation: slide 1s infinite;

/* Keyframes */
@-webkit-keyframes slide {
    from { -webkit-transform: translateX(0); }
    to { -webkit-transform: translateX(100px); }
}
@keyframes slide {
    from { transform: translateX(0); }
    to { transform: translateX(100px); }
}
```

#### メディアクエリ
```css
/* ✅ 使用可能 */
@media screen and (max-width: 768px) {
    .box { width: 100%; }
}

@media screen and (orientation: landscape) {
    .box { height: 100vh; }
}
```

#### 擬似要素・擬似クラス
```css
/* ✅ 使用可能 */
.box:hover { background: red; }
.box:active { transform: scale(0.95); }
.box:before { content: ""; display: block; }
.box:after { content: ""; display: table; clear: both; }
```

---

## 🔧 必須の開発パターン

### 1. Clearfix（Floatレイアウト使用時）
```css
/* 必ずこのパターンを使用 */
.clearfix {
    zoom: 1; /* IE対応 */
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

### 2. ベンダープレフィックスの順序
```css
/* 必ずこの順序で記述 */
.box {
    -webkit-property: value;  /* Webkit/Blink（Safari, Chrome） */
    -moz-property: value;     /* Gecko（Firefox） */
    -ms-property: value;      /* Trident（IE） */
    -o-property: value;       /* Presto（旧Opera） */
    property: value;          /* 標準構文（最後に記述） */
}
```

### 3. Calcのフォールバック
```css
/* 必ずフォールバック値を先に記述 */
.box {
    width: 100%;                              /* フォールバック */
    width: -webkit-calc(100% - 20px);        /* iOS 6+ */
    width: -moz-calc(100% - 20px);
    width: calc(100% - 20px);                /* 標準 */
}
```

### 4. Font-sizeのフォールバック
```css
/* remとpxの両方を記述 */
.title {
    font-size: 2.5rem;
    font-size: 40px; /* フォールバック */
}
```

---

## 📱 時計アプリ開発の特別な制約

### Canvas時計の場合

#### 推奨サイズ
```javascript
// ✅ 推奨：固定サイズまたは親要素のサイズに合わせる
var canvas = document.getElementById('clock');
canvas.width = 800;
canvas.height = 800;

// または
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;
```

#### requestAnimationFrame
```javascript
// ❌ 禁止（iOS 6以降）- ポリフィルなしでは使用不可
requestAnimationFrame(draw);

// ✅ 使用可能 - setIntervalまたはポリフィル使用
setInterval(function() {
    draw();
}, 1000 / 60); // 60fps

// ✅ またはポリフィルを追加
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function(callback) {
        return setTimeout(callback, 1000 / 60);
    };
```

#### Canvas描画のベストプラクティス
```javascript
// ✅ 毎フレームcanvasをクリア
ctx.clearRect(0, 0, canvas.width, canvas.height);

// ✅ 座標変換を使用（パフォーマンス向上）
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate(angle);
// 描画処理
ctx.restore();

// ❌ 避ける：過度に複雑な描画（パフォーマンス低下）
```

---

### CSS時計の場合

#### Transform使用時
```css
/* ✅ 必ずベンダープレフィックス */
.hand {
    -webkit-transform-origin: 50% 100%;
    -moz-transform-origin: 50% 100%;
    -ms-transform-origin: 50% 100%;
    -o-transform-origin: 50% 100%;
    transform-origin: 50% 100%;
    
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    -o-transform: rotate(90deg);
    transform: rotate(90deg);
}
```

#### アニメーション
```css
/* ✅ 秒針の滑らかな動き */
@-webkit-keyframes rotate {
    from { -webkit-transform: rotate(0deg); }
    to { -webkit-transform: rotate(360deg); }
}
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.second-hand {
    -webkit-animation: rotate 60s linear infinite;
    animation: rotate 60s linear infinite;
}
```

---

### API使用の制約

#### 時刻API
```javascript
// ✅ 使用可能
var now = new Date();
var hours = now.getHours();
var minutes = now.getMinutes();
var seconds = now.getSeconds();

// ✅ 外部API（WorldTimeAPIなど）
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://worldtimeapi.org/api/timezone/Asia/Tokyo');
xhr.onload = function() {
    var data = JSON.parse(xhr.responseText);
    // 処理
};
xhr.send();

// ❌ 禁止：Fetch API（iOS 10.3以降）- ポリフィルなし
fetch(url).then(response => response.json());
```

#### Geolocation API
```javascript
// ✅ 使用可能（iOS 5+でサポート）
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
    });
}
```

---

## 🧪 テストガイドライン

### 必須テスト環境

1. **iOS 5.1.1** (初代iPad)
   - Safari Mobile 5.1
   
2. **iOS 7.1.2** (iPhone 4)
   - Safari Mobile 7
   
3. **iOS 9.3.5** (iPad mini / iPhone 4S)
   - Safari Mobile 9

4. **最新iOS** (iPhone/iPad最新モデル)
   - Safari最新版

### テスト項目

#### 機能テスト
- [ ] JavaScriptエラーがコンソールに出ない
- [ ] 時刻が正確に表示される
- [ ] アニメーションが滑らかに動作する
- [ ] タップ/クリックイベントが正常に動作する
- [ ] LocalStorageが使用できる（使用している場合）

#### ビジュアルテスト
- [ ] レイアウトが崩れていない
- [ ] フォントサイズが適切
- [ ] 色が正しく表示される
- [ ] グラデーションが表示される
- [ ] シャドウが表示される
- [ ] 角丸が表示される

#### パフォーマンステスト
- [ ] 初代iPadで60fps維持（または最低30fps）
- [ ] メモリリークがない
- [ ] 長時間実行しても重くならない

---

## 📝 コードレビューチェックリスト

新しいファイルを追加・編集する際は、以下を確認してください：

### JavaScript
- [ ] `const` / `let` を使用していない（`var`のみ）
- [ ] アロー関数を使用していない（`function() {}`を使用）
- [ ] テンプレートリテラルを使用していない（文字列連結を使用）
- [ ] ES6+の配列/オブジェクトメソッドを使用していない
- [ ] `Promise` / `async` / `await` を使用していない
- [ ] クラス構文を使用していない

### CSS
- [ ] Grid Layoutを使用していない
- [ ] 複雑なFlexboxを使用していない
- [ ] すべてのCSS3プロパティにベンダープレフィックスがある
- [ ] グラデーションに古い構文とフォールバックがある
- [ ] `calc()`にフォールバック値がある
- [ ] `rem`単位に`px`のフォールバックがある
- [ ] Floatレイアウトでclearfixを使用している

### HTML
- [ ] HTML5セマンティック要素にCSSリセットがある
- [ ] 適切なmetaタグが設定されている
- [ ] viewportの設定が正しい

### パフォーマンス
- [ ] 不要なDOM操作を避けている
- [ ] Canvasの描画が最適化されている
- [ ] タイマーが適切にクリアされている
- [ ] メモリリークの可能性がない

---

## 🚨 よくある間違い

### 1. Modernizr/Babelなしでのモダン構文使用
```javascript
// ❌ NG：トランスパイルなしでES6を使用
const clockApp = {
    init: () => { ... }
};

// ✅ OK：ES5で記述
var clockApp = {
    init: function() { ... }
};
```

### 2. ベンダープレフィックス忘れ
```css
/* ❌ NG */
.clock { transform: rotate(45deg); }

/* ✅ OK */
.clock {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
}
```

### 3. フォールバック忘れ
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

## 📚 参考リソース

### ブラウザサポート確認
- [Can I Use](https://caniuse.com/) - 機能のブラウザサポート状況
- [MDN Web Docs](https://developer.mozilla.org/) - API仕様とブラウザ互換性

### iOS 5-9 サポート情報
- [iOS 5 Safari Features](https://www.webkit.org/blog/1334/)
- [CSS3 Properties Support](https://caniuse.com/?compare=ios_saf+5.0-5.1)

### ポリフィル
必要に応じて以下のポリフィルを使用できます：
- `Object.assign()` ポリフィル
- `Array.prototype.includes()` ポリフィル
- `requestAnimationFrame` ポリフィル

---

## ✅ 最終チェック

新しいアプリをデプロイする前に：

1. [ ] このガイドラインを読み直した
2. [ ] 禁止技術を使用していない
3. [ ] すべての必須パターンを実装した
4. [ ] コードレビューチェックリストを確認した
5. [ ] 初代iPadまたはシミュレータでテストした
6. [ ] パフォーマンステストを実施した
7. [ ] ドキュメントを更新した

---

## 🆘 問題が発生した場合

### デバッグ方法

#### iOS 5-6での確認
1. MacにXcodeをインストール
2. iOS Simulatorで古いiOSバージョンを起動
3. Safari開発メニューでコンソールを確認

#### よくあるエラー
```
"SyntaxError: Unexpected token =" 
→ アロー関数またはデフォルトパラメータを使用している

"ReferenceError: const is not defined"
→ const/letを使用している

"TypeError: undefined is not a function"
→ ES6メソッドまたはAPIを使用している
```

---

## 📞 サポート

このガイドラインに関する質問や、互換性の問題が発生した場合は：
1. `CONVERSION_DETAILS.md` を確認
2. `ビジュアル比較.md` で実装例を確認
3. 既存の時計アプリのコードを参照

---

**重要**: このガイドラインは**必須**です。初代iPadでの動作を保証するために、すべての開発者が遵守してください。

**最終更新**: 2026年1月2日  
**対象**: iOS 5.1.1以降  
**維持管理**: プロジェクト開発者全員
