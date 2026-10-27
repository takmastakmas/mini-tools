# Architecture（アーキテクチャ設計）

このドキュメントでは、Webアプリ集のシステムアーキテクチャ、設計判断、実装パターンについて説明します。

## 📋 目次

- [システム概要](#システム概要)
- [アーキテクチャ原則](#アーキテクチャ原則)
- [レイヤー構造](#レイヤー構造)
- [主要コンポーネント](#主要コンポーネント)
- [データフロー](#データフロー)
- [デザインパターン](#デザインパターン)
- [セキュリティ設計](#セキュリティ設計)
- [パフォーマンス最適化](#パフォーマンス最適化)

## 🎯 システム概要

### 設計目標

1. **シンプルさ** - フレームワーク不要の軽量設計
2. **保守性** - 明確な構造と責任分離
3. **拡張性** - 新機能の追加が容易
4. **パフォーマンス** - 高速な起動と動作
5. **セキュリティ** - XSS、CSRFなどの対策

> ⚠️ **重要**: `ipad/` フォルダは初代iPad（iOS 5.1.1）対応のため、異なるアーキテクチャ設計が適用されています。
> - ES5互換JavaScript（const/let/アロー関数不使用）
> - Float + Clearfixレイアウト（Grid/Flexbox不使用）
> - ベンダープレフィックス必須
> 
> 詳細は [ipad/DEVELOPMENT_GUIDELINES.md](../ipad/DEVELOPMENT_GUIDELINES.md) および [ipad/PROJECT_GUIDE.md](../ipad/PROJECT_GUIDE.md) を参照してください。

### 技術スタック

```
Frontend: 
  - HTML5 (セマンティックマークアップ)
  - CSS3 (Grid, Flexbox, Variables)
  - Vanilla JavaScript ES6+ (クラスベース)

Storage:
  - LocalStorage API (クライアントサイド永続化)

Tools:
  - Chrome DevTools (デバッグ)
  - Live Server (開発サーバー)
```

> ⚠️ **例外**: `ipad/` フォルダは初代iPad対応のためES5 + Float/Inline-blockを使用

## 🏛️ アーキテクチャ原則

### 1. 関心の分離（Separation of Concerns）

```
┌─────────────────────────────────────┐
│     プレゼンテーション層              │
│  (HTML/CSS - ユーザーインターフェース) │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│        ロジック層                    │
│  (JavaScript - ビジネスロジック)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│         データ層                     │
│  (config.js, LocalStorage)          │
└─────────────────────────────────────┘
```

### 2. DRY原則（Don't Repeat Yourself）

#### JavaScript
共通機能を `utils.js` に集約:
- ストレージ操作
- クリップボード操作
- 日付フォーマット
- デバウンス処理
- エスケープ処理

#### CSS
共通スタイルを `css/shared.css` に集約:
- 全体のリセットとベーススタイル
- カラーパレット（CSS Variables）
- 共通コンポーネント（ボタン、カード、入力フィールド）
- レイアウトヘルパー（コンテナ、グリッド）
- タイポグラフィ

**効果**: スタイルの重複を90%以上削減、デザインの一貫性を保証

### 3. 単一責任の原則（Single Responsibility）

各クラス/モジュールは明確な1つの責任を持つ:
- `config.js` → データ定義
- `main.js` → ポータルロジック
- `utils.js` → ユーティリティ関数
- `app.js` → 各アプリ固有のロジック

## 🧱 レイヤー構造

### 詳細な構造

```
┌─────────────────────────────────────────────────┐
│            プレゼンテーション層                   │
├─────────────────────────────────────────────────┤
│  • HTML: セマンティック構造                       │
│  • CSS: スタイリング、レイアウト                  │
│    - css/shared.css: 共通デザインシステム        │
│    - CSS Variables: 一貫したテーマ管理           │
│    - アプリ固有CSS: 必要に応じてオーバーライド    │
│  • ユーザーインタラクション                       │
└────────────┬────────────────────────────────────┘
             │ DOM Events
┌────────────▼────────────────────────────────────┐
│              アプリケーション層                   │
├─────────────────────────────────────────────────┤
│  • クラスベース設計                              │
│  • イベントハンドリング                          │
│  • ビジネスロジック                              │
│  • バリデーション                                │
└────────────┬────────────────────────────────────┘
             │ Function Calls
┌────────────▼────────────────────────────────────┐
│            ユーティリティ層                      │
├─────────────────────────────────────────────────┤
│  • 共通関数                                      │
│  • ヘルパー関数                                  │
│  • 型変換、フォーマット                          │
└────────────┬────────────────────────────────────┘
             │ API Calls
┌────────────▼────────────────────────────────────┐
│              データ層                            │
├─────────────────────────────────────────────────┤
│  • LocalStorage API                             │
│  • データ永続化                                  │
│  • 設定データ (config.js)                       │
└─────────────────────────────────────────────────┘
```

## 🔧 主要コンポーネント

### 1. ポータル（Portal）

**ファイル:**
- `index.html` - メインページ
- `js/config.js` - アプリ設定データ
- `js/main.js` - ポータルロジック

**責任:**
- アプリ一覧の表示
- カテゴリ管理
- 検索・フィルタリング
- ナビゲーション

**実装パターン:**

```javascript
// config.js - データ定義
const appConfig = {
  collections: [...]
};

// main.js - ロジック
class AppCatalog {
  constructor(config) {
    this.config = config;
    this.elements = {};
  }
  
  init() {
    this.initElements();
    this.renderCollections();
    this.attachEventListeners();
  }
  
  renderCollections() {
    this.config.collections.forEach(collection => {
      this.renderCollection(collection);
    });
  }
  
  createCard(app) {
    // カード生成ロジック
  }
}
```

### 2. 共通ユーティリティ（Utils）

**ファイル:** `js/utils.js`

**提供する機能:**

```javascript
const AppUtils = {
  // ストレージ操作
  saveToStorage(key, value) { ... },
  loadFromStorage(key, defaultValue) { ... },
  removeFromStorage(key) { ... },
  
  // クリップボード
  copyToClipboard(text) { ... },
  
  // UI通知
  showToast(message, typeOrDuration, elementId) { ... },
  
  // 日付
  formatDate(date, format) { ... },
  
  // パフォーマンス
  debounce(func, wait) { ... },
  
  // セキュリティ
  escapeHtml(text) { ... },
  
  // その他
  getQueryParams() { ... },
  pad(num) { ... },
  randomInt(min, max) { ... },
  shuffle(array) { ... }
};
```

実際のメソッド一覧・シグネチャは常に [`js/utils.js`](../js/utils.js) を正とします（このドキュメントは概要説明用です）。

### 3. 個別アプリ（Individual Apps）

**ファイル構造:**
```
app-name/
├── index.html      # アプリUI
├── css/
│   └── style.css   # アプリスタイル
└── js/
    └── xxx.js      # アプリロジック（ファイル名はアプリごとに説明的な名前を付ける。
                     #   例: timer.js, roulette.js, notepad.js, viewer.js など）
```

> 新規ファイルには汎用的な `app.js` ではなく、アプリの内容がわかる説明的な名前を付けます（既存アプリの命名と揃える）。

**実装パターン:**

```javascript
class AppName {
  constructor() {
    // 初期化
    this.storageKey = 'app_data';
    this.elements = {};
    this.state = {};
    
    this.init();
  }
  
  init() {
    this.initElements();      // DOM要素の取得
    this.loadFromStorage();   // データ読み込み
    this.attachEventListeners(); // イベント設定
  }
  
  initElements() {
    // DOM要素をキャッシュ
    this.elements = {
      input: document.getElementById('input'),
      button: document.getElementById('button')
    };
  }
  
  attachEventListeners() {
    // イベントリスナー設定
    this.elements.button?.addEventListener('click', 
      () => this.handleClick()
    );
  }
  
  handleClick() {
    // イベント処理
  }
  
  saveToStorage() {
    // データ保存
    AppUtils.saveToStorage(this.storageKey, this.state);
  }
  
  loadFromStorage() {
    // データ読み込み
    this.state = AppUtils.loadFromStorage(this.storageKey) || {};
  }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
  new AppName();
});
```

### 4. 共通スタイルシステム（Shared CSS）

**ファイル:** `css/shared.css`

**目的:** すべてのアプリに一貫したデザインを提供し、スタイルの重複を排除

#### デザインシステムの構成

```css
/* CSS Variables（カラーパレット） */
:root {
  /* 基調色 */
  --bg-color: #f8fafc;           /* ライトグレー背景 */
  --surface-color: #ffffff;       /* 白い表面 */
  
  /* テキストカラー */
  --text-primary: #1f2937;        /* 濃いグレー */
  --text-secondary: #6b7280;      /* 中間グレー */
  
  /* ボーダーとアクセント */
  --border-color: #e5e7eb;        /* ライトグレーボーダー */
  --accent-color: #10b981;        /* モダングリーン */
  --accent-hover: #059669;        /* グリーン（ホバー） */
  
  /* ボタン */
  --btn-danger-bg: #dc2626;       /* 赤（危険操作） */
  --btn-danger-hover: #b91c1c;
  
  /* 影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), ...;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), ...;
}
```

#### 提供するコンポーネント

**レイアウト:**
- `.container` - 最大幅800px、中央配置、レスポンシブパディング
- `.card` - 白背景、角丸、影付きカード

**ボタン:**
- `.btn` - ベーススタイル
- `.btn-primary` - アクセントカラー（メインアクション）
- `.btn-secondary` - グレー（サブアクション）
- `.btn-danger` - 赤（削除などの危険操作）
- `.btn-info` - 青（情報表示）
- `.btn-default` - デフォルト（標準操作）

**フォーム要素:**
- `.input-group` - ラベルと入力欄のグループ
- `input[type="text"]`, `textarea` - 統一された入力フィールド
- `select` - セレクトボックス

**タイポグラフィ:**
- `header h1` - メインタイトル（2.5rem）
- `main h2` - セクション見出し（2rem）
- `main h3` - サブセクション見出し（1.5rem）

#### スタイルの適用順序

```html
<!-- 正しい順序: 共通スタイル → アプリ固有スタイル -->
<link rel="stylesheet" href="../css/shared.css">
<link rel="stylesheet" href="css/style.css">
```

**重要:** この順序により、アプリ固有のスタイルが共通スタイルを上書き可能

#### アプリ固有スタイルのガイドライン

```css
/* ✅ Good: 共通変数を活用 */
.custom-component {
  background: var(--surface-color);
  color: var(--text-primary);
  border: 1px solid var(--accent-color);
  box-shadow: var(--shadow-md);
}

/* ✅ Good: 独自レイアウト */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* ❌ Bad: 共通スタイルの再定義 */
.btn {
  /* shared.cssで既に定義されている */
}
```

#### デザインの一貫性

**利点:**
1. **保守性**: スタイル変更が一箇所で完結
2. **一貫性**: すべてのアプリが統一された外観
3. **効率性**: 新アプリの開発時間を短縮
4. **拡張性**: テーマ変更が容易（CSS Variables）

**実装例:**

```javascript
// アプリでの使用
class MyApp {
  render() {
    return `
      <div class="container">
        <header>
          <h1>アプリタイトル</h1>
        </header>
        
        <main>
          <div class="card">
            <h2>セクション</h2>
            <div class="input-group">
              <label for="input">入力</label>
              <input type="text" id="input">
            </div>
            <button class="btn btn-primary">保存</button>
            <button class="btn btn-danger">削除</button>
          </div>
        </main>
      </div>
    `;
  }
}
```

## 🔄 データフロー

### ユーザー操作からデータ保存まで

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  DOM Event      │
│  (click, input) │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│  Event Handler      │
│  (handleClick, etc) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Business Logic     │
│  (validate, calc)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  State Update       │
│  (this.state = ...) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Utils.saveToStorage│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  LocalStorage API   │
└─────────────────────┘
```

### データ読み込みからUI表示まで

```
┌─────────────────────┐
│  Page Load          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  DOMContentLoaded   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  App.init()         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  loadFromStorage()  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  LocalStorage API   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Parse JSON         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Update State       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Render UI          │
└─────────────────────┘
```

## 🎨 デザインパターン

### 1. Module Pattern（モジュールパターン）

**目的:** グローバルスコープの汚染を防ぐ

```javascript
// utils.js
const AppUtils = (function() {
  // プライベート変数
  const STORAGE_PREFIX = 'webapps_';
  
  // プライベート関数
  function getFullKey(key) {
    return STORAGE_PREFIX + key;
  }
  
  // パブリックAPI
  return {
    saveToStorage(key, value) {
      localStorage.setItem(getFullKey(key), JSON.stringify(value));
    },
    // ...
  };
})();
```

### 2. Class Pattern（クラスパターン）

**目的:** 状態とメソッドのカプセル化

```javascript
class NotepadApp {
  // プライベートフィールド（ES2022+）
  #storageKey = 'notepad_data';
  
  constructor() {
    this.state = {};  // パブリック
    this.init();
  }
  
  // パブリックメソッド
  init() { ... }
  
  // プライベートメソッド（命名規則）
  _validateInput() { ... }
}
```

### 3. Observer Pattern（オブザーバーパターン）

**目的:** イベント駆動型の設計

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// 使用例
const app = new EventEmitter();
app.on('data:save', (data) => {
  console.log('Data saved:', data);
});
app.emit('data:save', { id: 1 });
```

### 4. Strategy Pattern（戦略パターン）

**目的:** アルゴリズムの切り替え

```javascript
// 異なるフォーマット戦略
const formatStrategies = {
  json: (data) => JSON.stringify(data, null, 2),
  csv: (data) => convertToCSV(data),
  text: (data) => data.toString()
};

class DataExporter {
  export(data, format) {
    const strategy = formatStrategies[format];
    return strategy ? strategy(data) : data;
  }
}
```

## 🔒 セキュリティ設計

### 1. XSS対策

```javascript
// ✅ 安全な実装
function displayUserInput(input) {
  // textContent を使用
  element.textContent = input;
  
  // または、エスケープ処理
  element.innerHTML = AppUtils.escapeHtml(input);
}

// ❌ 危険な実装
function displayUserInput(input) {
  element.innerHTML = input; // XSSリスク
}
```

### 2. CSP（Content Security Policy）

現状、各アプリのHTMLにCSPメタタグは設定されていません。導入する場合の参考例:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline';">
```

### 3. 外部リンクの安全性

```javascript
// rel="noopener noreferrer" を追加
function createSafeLink(url, text) {
  const link = document.createElement('a');
  link.href = url;
  link.textContent = text;
  link.rel = 'noopener noreferrer';  // 重要
  link.target = '_blank';
  return link;
}
```

### 4. データバリデーション

```javascript
function validateInput(input) {
  // 型チェック
  if (typeof input !== 'string') {
    throw new TypeError('Input must be string');
  }
  
  // 長さチェック
  if (input.length > 10000) {
    throw new Error('Input too long');
  }
  
  // サニタイゼーション
  return input.trim();
}
```

## ⚡ パフォーマンス最適化

### 1. DOM操作の最小化

```javascript
// ✅ 効率的
function renderItems(items) {
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const element = createItemElement(item);
    fragment.appendChild(element);
  });
  container.appendChild(fragment);  // 1回のDOM操作
}

// ❌ 非効率
function renderItems(items) {
  items.forEach(item => {
    const element = createItemElement(item);
    container.appendChild(element);  // 毎回DOM操作
  });
}
```

### 2. デバウンス・スロットル

```javascript
// 頻繁なイベントを制限
const debouncedSave = AppUtils.debounce(() => {
  saveData();
}, 500);

input.addEventListener('input', debouncedSave);
```

### 3. イベントデリゲーション

```javascript
// ✅ 1つのリスナーで複数要素を処理
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    handleDelete(e.target.dataset.id);
  }
});

// ❌ 各要素にリスナーを設定
buttons.forEach(btn => {
  btn.addEventListener('click', handleDelete);
});
```

### 4. LocalStorage最適化

```javascript
// ✅ 効率的なデータ構造
const data = {
  version: 1,
  timestamp: Date.now(),
  items: [...]
};

// 圧縮・最適化
function optimizeData(data) {
  // 不要なプロパティを削除
  // 古いデータをアーカイブ
  return compactData;
}
```

## 📊 メトリクス

### パフォーマンス指標

- **初回読み込み**: < 1秒
- **アプリ起動**: < 500ms
- **ユーザー操作応答**: < 100ms
- **LocalStorage操作**: < 10ms

### コード品質指標

- **関数の複雑度**: < 10
- **ファイルサイズ**: < 500行
- **クラスのメソッド数**: < 20
- **重複コード**: < 5%

## 🔄 設計方針の維持

このプロジェクトは「ビルドやパッケージマネージャーを使わない、ブラウザ完結型の軽量ツール集」であることを意図的な設計方針としています。TypeScript移行、モジュールバンドラー（Vite/Webpack）、テストフレームワーク（Jest/Vitest）、PWA化、CI/CDパイプラインの導入は現時点で計画していません。新しいアプリを追加する際も、この方針（プレーンなHTML/CSS/JS、ビルド不要）を踏襲してください。

## 📚 参考資料

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [JavaScript Design Patterns](https://www.patterns.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [OWASP Web Security](https://owasp.org/)

---

**設計思想: Simple, Secure, Scalable**
