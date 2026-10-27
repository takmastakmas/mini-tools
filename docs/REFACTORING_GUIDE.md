# 新規アプリのリファクタリングガイド

## 📋 目次

- [概要](#概要)
- [リファクタリングの基本方針](#リファクタリングの基本方針)
- [ステップバイステップガイド](#ステップバイステップガイド)
- [アプリ固有のデザイン制約への対処](#アプリ固有のデザイン制約への対処)
- [チェックリスト](#チェックリスト)
- [参考事例](#参考事例)

---

## 📖 概要

このドキュメントは、既存のアプリや外部から取得したアプリをプロジェクトの開発方針に準拠させるためのリファクタリング手順を説明します。

### 対象読者
- 新しいアプリをプロジェクトに追加する開発者
- 既存アプリをリファクタリングする開発者
- プロジェクトの標準に従いたい開発者

### 前提知識
- HTML、CSS、JavaScriptの基本知識
- ES6+のクラス構文
- プロジェクトのアーキテクチャ原則（[ARCHITECTURE.md](ARCHITECTURE.md)参照）

---

## 🎯 リファクタリングの基本方針

### プロジェクト開発方針の3つの柱

1. **クラスベース設計**
   - すべてのアプリは単一のクラスで実装
   - グローバル変数・関数を排除
   - 状態管理の一元化

2. **共通スタイルの活用**
   - `css/shared.css`を必ず読み込む
   - CSS変数を活用してテーマを統一
   - アプリ固有のスタイルは最小限に

3. **標準的なファイル構成**
   - `<説明的な名前>.js` - アプリのロジック（例: `timer.js`, `roulette.js`。既存アプリはいずれも `app.js` という汎用名を使っていないため、新規アプリもアプリ内容が分かる名前を付ける）
   - `style.css` - アプリ固有のスタイル
   - `index.html` - UIテンプレート

---

## 📝 ステップバイステップガイド

### Step 1: プロジェクト構造の確認

アプリを追加する前に、現在のプロジェクト構造を確認します。

```bash
# プロジェクトルートで実行
ls -la

# 期待される構造
your-project/
├── css/
│   └── shared.css        # 共通スタイル
├── js/
│   ├── config.js         # アプリ設定
│   ├── main.js          # ポータルロジック
│   └── utils.js         # 共通ユーティリティ（オプション）
├── docs/
│   └── ARCHITECTURE.md   # アーキテクチャドキュメント
└── [app-name]/          # 各アプリ
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── xxx.js        # 説明的な名前（例: counter.js）
```

---

### Step 2: アプリディレクトリの作成

```bash
mkdir -p your-app/{css,js}
touch your-app/index.html
touch your-app/css/style.css
touch your-app/js/your-app.js
```

---

### Step 3: クラスベース設計への移行

#### ❌ Before（手続き型プログラミング）

```javascript
// グローバル変数とグローバル関数
let data = [];
let config = {};

const button = document.getElementById('button');

function handleClick() {
    // 処理
}

document.addEventListener('DOMContentLoaded', () => {
    button.addEventListener('click', handleClick);
});
```

#### ✅ After（クラスベース設計）

```javascript
/**
 * Your App
 * @class YourApp
 * @description アプリの説明
 */
class YourApp {
    constructor() {
        // ストレージキー
        this.storageKey = 'your_app_data';
        
        // DOM要素
        this.elements = {};
        
        // 状態管理
        this.state = {
            data: [],
            config: {}
        };
        
        // 初期化
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.render();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            button: document.getElementById('button'),
            input: document.getElementById('input'),
            output: document.getElementById('output')
            // ... 他の要素
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        this.elements.button?.addEventListener('click', 
            () => this.handleClick()
        );
    }
    
    /**
     * ボタンクリックハンドラ
     */
    handleClick() {
        // 処理
    }
    
    /**
     * データの保存
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.error('保存に失敗:', error);
        }
    }
    
    /**
     * データの読み込み
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('読み込みに失敗:', error);
        }
    }
    
    /**
     * UIの描画
     */
    render() {
        // UI更新処理
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new YourApp();
});
```

---

### Step 4: DOM要素の取得を標準化

#### 重要なポイント

1. **すべてのDOM要素を`initElements()`で取得**
2. **`this.elements`オブジェクトに格納**
3. **オプショナルチェーン（`?.`）を使用**

```javascript
initElements() {
    this.elements = {
        // フォーム要素
        input: document.getElementById('input'),
        textarea: document.getElementById('textarea'),
        select: document.getElementById('select'),
        
        // ボタン
        submitBtn: document.getElementById('submitBtn'),
        resetBtn: document.getElementById('resetBtn'),
        
        // 表示エリア
        outputArea: document.getElementById('outputArea'),
        messageArea: document.getElementById('messageArea')
    };
}

// 使用例
attachEventListeners() {
    // オプショナルチェーンで安全にアクセス
    this.elements.submitBtn?.addEventListener('click', 
        () => this.handleSubmit()
    );
}
```

---

### Step 5: イベントリスナーの標準化

#### 重要なポイント

1. **すべてのイベントリスナーを`attachEventListeners()`で設定**
2. **アロー関数でthisコンテキストを維持**
3. **オプショナルチェーンで存在確認**

```javascript
attachEventListeners() {
    // ボタンイベント
    this.elements.submitBtn?.addEventListener('click', 
        () => this.handleSubmit()
    );
    
    this.elements.resetBtn?.addEventListener('click', 
        () => this.handleReset()
    );
    
    // 入力イベント（デバウンス推奨）
    this.elements.input?.addEventListener('input', 
        this.debounce(() => this.handleInput(), 300)
    );
    
    // イベントデリゲーション
    this.elements.outputArea?.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            this.handleDelete(e.target.dataset.id);
        }
    });
}

// デバウンスユーティリティ
debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

---

### Step 6: インラインCSSの外部ファイル化

#### ❌ Before（インラインCSS）

```html
<head>
    <link rel="stylesheet" href="../css/shared.css">
    <style>
        /* 200行以上のインラインCSS */
        .container { max-width: 800px; }
        .card { padding: 20px; }
        /* ... */
    </style>
</head>
```

#### ✅ After（外部CSS）

**index.html:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your App - Webアプリ集</title>
    
    <!-- Shared CSS（必ず最初に読み込む） -->
    <link rel="stylesheet" href="../css/shared.css">
    
    <!-- App Specific CSS -->
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Font Awesome（必要な場合） -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
```

**css/style.css:**
```css
/* your-app/css/style.css */

/* アプリ固有のスタイル定義 */
.custom-component {
    background: var(--surface-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

/* 共通変数を活用 */
.highlight {
    background-color: var(--accent-color);
    color: var(--accent-text);
}
```

---

### Step 7: ファイル名の標準化

#### 命名規則

| ファイル | 標準名 | 説明 |
|---------|--------|------|
| JavaScriptファイル | アプリ内容が分かる説明的な名前 | 例: `timer.js`, `roulette.js`, `notepad.js`, `viewer.js` |
| CSSファイル | `style.css` | アプリ固有のスタイル |
| HTMLファイル | `index.html` | アプリのUI |

このプロジェクトの既存アプリはすべて説明的なJSファイル名を使っており、汎用的な`app.js`は使われていません。既存の慣習に合わせてください。

#### ❌ 非推奨

```
your-app/
├── js/
│   └── script.js       ❌ 曖昧な名前
│   └── main.js         ❌ ポータル（js/main.js）と混同
│   └── app.js          ❌ 内容が分からない汎用名
```

#### ✅ 推奨

```
your-app/
├── js/
│   └── counter.js      ✅ アプリの内容が分かる名前
```

既存ファイルをリファクタリングする場合は、無理にファイル名を変更する必要はありません（大規模な依存関係がある場合など）。その場合はREADME.mdに理由を明記してください。

---

### Step 8: 通知システムの統一

#### ❌ Before（alert()使用）

```javascript
alert('エラーが発生しました');
alert('保存しました');
```

#### ✅ After（統一された通知システム）

```javascript
/**
 * トースト通知表示
 */
showToast(message, type = 'info') {
    // 既存の通知を削除
    const existing = document.getElementById('notification');
    if (existing) {
        existing.remove();
    }
    
    // アイコンマッピング
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i> ${message}
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 3秒後に消す
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 使用例
this.showToast('保存しました', 'success');
this.showToast('エラーが発生しました', 'error');
this.showToast('注意してください', 'warning');
this.showToast('処理中...', 'info');
```

**CSS（style.css）:**
```css
/* 通知スタイル */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s;
}

.notification.show {
    opacity: 1;
    transform: translateY(0);
}

.notification-success {
    background: var(--accent-color);
    color: white;
}

.notification-error {
    background: #ef4444;
    color: white;
}

.notification-warning {
    background: #f59e0b;
    color: white;
}

.notification-info {
    background: #3b82f6;
    color: white;
}
```

---

## 🎨 アプリ固有のデザイン制約への対処

### 基本原則

プロジェクトでは`css/shared.css`による統一デザインを採用していますが、アプリの特性上、一部のスタイルを変更する必要がある場合があります。

### よくあるケース

#### ケース1: containerの幅を変更したい

**理由の例:**
- テーブルに多数の列を表示する必要がある
- 横並びレイアウトでスペースが必要
- ダッシュボード形式で広い表示領域が必要

**対処方法:**

**css/style.css:**
```css
/* 
 * アプリ固有のデザイン設定
 * 理由: このアプリは大量のテーブル表示のため、containerの幅を拡大
 * - グループ、名前、カウンターA/B、メモ、削除ボタンを含む
 * - デフォルトの800pxでは表示が窮屈
 */
.container {
    max-width: 1200px; /* デフォルト800px → 1200px */
}
```

**重要なポイント:**
1. **コメントで理由を明記**する
2. **デフォルト値を記載**する
3. **具体的な用途を説明**する

---

#### ケース2: 入力欄のサイズを小さくしたい

**理由の例:**
- 短い入力（名前、番号など）
- 横並びで多数の入力欄を配置
- コンパクトなUIが必要

**対処方法:**

**css/style.css:**
```css
/* 
 * カウンター名入力欄
 * shared.cssのデフォルト（width: 100%, padding: 12px 16px）を上書き
 */
.counter-name-input {
    width: 140px !important;
    padding: 6px 12px !important;
    font-size: 0.875rem !important;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: border-color 0.2s;
}
```

**注意点:**
- `!important`を使用する理由をコメントで説明
- shared.cssの値を明記
- 必要最小限の使用に留める

---

#### ケース3: 独自のカラースキームを使いたい

**理由の例:**
- アプリの機能に応じた色分け（カウンターA/B、優先度など）
- 視覚的な区別が重要
- ブランディング要件

**対処方法:**

**css/style.css:**
```css
/* 
 * カウンターの色分け
 * カウンターAとカウンターBを視覚的に区別するための独自カラー
 */
:root {
    --counter-a-color: #3b82f6;  /* 青系 */
    --counter-b-color: #10b981;  /* 緑系 */
}

.counter-group-a {
    background-color: #eff6ff; /* 薄い青 */
}

.counter-group-b {
    background-color: #f0fdf4; /* 薄い緑 */
}

.counter-btn-a {
    background-color: var(--counter-a-color);
    color: white;
}

.counter-btn-b {
    background-color: var(--counter-b-color);
    color: white;
}
```

**推奨事項:**
- 可能な限り共通のCSS変数（`var(--accent-color)`など）を使用
- 独自変数を定義する場合は`:root`に記述
- 色の選択理由をコメントで説明

---

#### ケース4: 特殊なレイアウトが必要

**理由の例:**
- グリッドレイアウト
- マルチカラムレイアウト
- ダッシュボード形式

**対処方法:**

**css/style.css:**
```css
/* 
 * 4分割レイアウト
 * このアプリは4つの独立したエリアを表示するため
 */
.grid-layout {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

@media (max-width: 768px) {
    .grid-layout {
        grid-template-columns: 1fr; /* モバイルは1カラム */
    }
}
```

---

### デザイン変更の判断基準

#### ✅ 変更してもよい場合

1. **機能要件上必須**
   - テーブルの列数が多く、幅が必要
   - 複雑なレイアウトが必要
   - 特殊な入力フォーマット

2. **ユーザビリティの向上**
   - 視認性の改善
   - 操作性の向上
   - アクセシビリティの改善

3. **明確な理由がある**
   - データ量が多い
   - 特殊な表示形式
   - 既存の制約では対応困難

#### ❌ 変更すべきでない場合

1. **単なる好み**
   - 「この色の方が好き」
   - 「もう少し大きい方がいい」

2. **代替手段がある**
   - shared.cssの既存クラスで対応可能
   - CSS変数を活用すれば実現可能

3. **一貫性を損なう**
   - プロジェクト全体のデザインと大きく異なる
   - 他のアプリとの統一感を失う

---

### デザイン変更のドキュメント化

アプリ固有のデザイン変更を行った場合、以下のドキュメントに記載します。

**README.md:**
```markdown
## デザインに関する特記事項

### containerの幅拡大

このアプリは以下の理由により、containerの幅を1200pxに設定しています：

- グループ、名前、カウンターA、カウンターB、メモ、削除ボタンを含む
- 合計6列以上の情報を横並びで表示
- デフォルトの800pxでは表示が窮屈で操作性が低下

### カウンターの色分け

カウンターAとカウンターBを視覚的に区別するため、独自のカラースキームを採用：

- カウンターA: 青系（#3b82f6）
- カウンターB: 緑系（#10b981）

ユーザーが2つのカウンターを瞬時に識別できるようにするための設計です。
```

---

## ✅ チェックリスト

リファクタリング完了前に、以下の項目を確認してください。

### 必須項目

- [ ] クラスベース設計に移行
  - [ ] グローバル変数を排除
  - [ ] すべての機能がクラスメソッドとして実装
  - [ ] 状態管理が`this.state`に一元化

- [ ] DOM要素の取得を標準化
  - [ ] `initElements()`メソッドを実装
  - [ ] すべてのDOM要素が`this.elements`に格納
  - [ ] オプショナルチェーン（`?.`）を使用

- [ ] イベントリスナーの標準化
  - [ ] `attachEventListeners()`メソッドを実装
  - [ ] アロー関数でthisコンテキストを維持
  - [ ] オプショナルチェーンで存在確認

- [ ] インラインCSSの外部ファイル化
  - [ ] すべてのインラインスタイルを削除
  - [ ] `css/style.css`に移動
  - [ ] `shared.css`を先に読み込み

- [ ] ファイル名の標準化
  - [ ] JavaScriptファイルをアプリ内容が分かる説明的な名前に命名（`app.js`のような汎用名は避ける）
  - [ ] CSSファイルを`style.css`に命名
  - [ ] HTMLファイルを`index.html`に命名

- [ ] 通知システムの統一
  - [ ] `alert()`を`showToast()`に置換
  - [ ] 通知タイプ（success, error, warning, info）を実装

### 推奨項目

- [ ] エラーハンドリングの実装
  - [ ] try-catchでLocalStorage操作をラップ
  - [ ] エラーメッセージをユーザーに表示

- [ ] JSDocコメントの追加
  - [ ] クラスとメソッドに説明を追加
  - [ ] パラメータと戻り値を明記

- [ ] デバウンス処理の実装
  - [ ] 頻繁に発生するイベントにデバウンスを適用
  - [ ] 自動保存などのパフォーマンス最適化

### デザイン関連

- [ ] 共通スタイルの活用
  - [ ] CSS変数を使用
  - [ ] 共通クラス（`.btn`, `.card`など）を活用

- [ ] アプリ固有のデザイン変更
  - [ ] 変更理由をコメントで明記
  - [ ] README.mdに記載
  - [ ] 必要最小限に留める

### ドキュメント

- [ ] README.mdの更新
  - [ ] 機能説明
  - [ ] 使い方
  - [ ] デザインの特記事項（該当する場合）

- [ ] コメントの追加
  - [ ] 複雑なロジックに説明を追加
  - [ ] 独自の実装に理由を記載

### 動作確認

- [ ] すべての機能が正常に動作
- [ ] LocalStorageの保存・読み込みが動作
- [ ] レスポンシブデザインが機能
- [ ] エラーハンドリングが適切
- [ ] 通知システムが正常に表示

---

## 📚 参考事例

### 完全準拠の模範例

#### Register with Counter アプリ

**主な成果:**
- グローバル変数32個 → 0個
- 保守性スコア 30 → 95
- HTMLファイルを37%軽量化
- アーキテクチャ準拠度 30% → 95%

**特徴:**
- クラスベース設計の完全実装
- インラインCSS（360行）を外部ファイル化
- アプリ固有のデザイン制約（container幅）を適切に処理
- 通知システムの統一実装

**参考コード:**
```javascript
// registerwithcounter/js/register.js
class RegisterWithCounterApp {
    constructor() {
        this.storageKey = 'participantCounters';
        this.elements = {};
        this.state = {
            counters: [],
            rowLabel: '',
            counterNames: { A: 'カウンターA', B: 'カウンターB' },
            sortConfig: { key: null, direction: 'asc' }
        };
        this.init();
    }
    
    init() {
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
        this.render();
    }
    
    // ... 他のメソッド
}
```

---

### Progress Bar アプリ

**主な成果:**
- クラスベース設計の実装
- 高さ計算ロジックの最適化
- リアルタイム同期機能

**学べるポイント:**
- 複雑な状態管理の実装
- URLパラメータの処理
- リアルタイム更新の実装

---

## 🔗 関連ドキュメント

- [ARCHITECTURE.md](ARCHITECTURE.md) - システムアーキテクチャ設計
- [DEVELOPMENT.md](DEVELOPMENT.md) - 開発環境とコーディング規約
- [MIGRATION.md](MIGRATION.md) - 旧バージョンからの移行

---

## 💡 よくある質問

### Q1: グローバル変数は絶対に使えませんか？

**A:** 基本的には使用を避けてください。すべての状態は`this.state`で管理します。ただし、以下の場合は例外として許容されます：

- アプリ起動時のみ使用する一時変数
- DOMContentLoadedイベントリスナーの登録

```javascript
// ✅ 許容される例
document.addEventListener('DOMContentLoaded', () => {
    new YourApp();
});

// ❌ 避けるべき例
let globalData = [];
function processData() {
    globalData.push(...);
}
```

---

### Q2: shared.cssのスタイルを上書きしたい場合は？

**A:** 以下の順序で対処してください：

1. **CSS変数を活用できないか確認**
2. **共通クラスで対応できないか確認**
3. **アプリ固有のクラスを作成**
4. **どうしても必要な場合のみ`!important`を使用**

```css
/* ✅ Good: CSS変数を活用 */
.custom-button {
    background-color: var(--accent-color);
}

/* ⚠️ 注意: !importantを使用する場合はコメント必須 */
.counter-name-input {
    width: 140px !important; /* shared.cssのwidth: 100%を上書き */
}
```

---

### Q3: ファイル名を変更したくない場合は？

**A:** リファクタリング対象の既存アプリで、JSファイル名（例: `counter.js`, `viewer.js`）を維持したい場合は、無理に変更する必要はありません。ファイル名よりもクラスベース設計・共通ユーティリティの活用など中身の準拠を優先してください。

- 既存のアプリで大規模な依存関係がある
- 外部ツールとの連携で変更が困難

このような場合、README.mdに理由を明記してください。

---

### Q4: リファクタリングにどのくらい時間がかかりますか？

**A:** アプリの規模によりますが、目安は以下の通りです：

| アプリ規模 | JavaScript行数 | 推定時間 |
|-----------|--------------|---------|
| 小規模 | ~500行 | 2-4時間 |
| 中規模 | 500-1500行 | 4-8時間 |
| 大規模 | 1500行以上 | 8-16時間 |

**Register with Counter アプリの実績:**
- コード行数: 約920行
- リファクタリング時間: 約6時間
- すべての機能を維持しながら完全リファクタリング達成

---

### Q5: リファクタリング中にバグが発生したら？

**A:** 以下の手順で対処してください：

1. **元のコードと比較**する
2. **段階的にリファクタリング**する（一度にすべて変更しない）
3. **各ステップで動作確認**する
4. **Gitでコミット**を細かく分ける
5. **問題があれば前のコミットに戻す**

---

## 🎯 まとめ

### リファクタリングの3つの原則

1. **段階的に進める** - 一度にすべて変更せず、ステップバイステップで
2. **動作確認を怠らない** - 各ステップで必ず動作確認
3. **ドキュメントを残す** - 変更理由と判断基準を記録

### 成功のポイント

- ✅ プロジェクトのアーキテクチャ原則を理解する
- ✅ 参考事例（Register with Counter など）を活用する
- ✅ アプリ固有の制約を適切に処理する
- ✅ コメントとドキュメントを充実させる

### 最終目標

**プロジェクト内のすべてのアプリが一貫した設計と品質を保ち、保守性の高いコードベースを実現する**

---

**このガイドに関する質問や提案があれば、プロジェクトのIssueで議論してください。**

**最終更新:** 2026年1月2日  
**バージョン:** 1.0.0  
**作成者:** Development Team
