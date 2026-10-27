# Development Guide（開発ガイド）

このガイドでは、プロジェクトの開発に参加したい方や、カスタマイズしたい方向けに、開発環境のセットアップから実装方法までを説明します。

## 📋 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [新しいアプリの追加](#新しいアプリの追加)
- [共通ユーティリティの使用](#共通ユーティリティの使用)
- [コーディング規約](#コーディング規約)
- [テストとデバッグ](#テストとデバッグ)
- [ベストプラクティス](#ベストプラクティス)

## 🛠️ 開発環境のセットアップ

### 必須ツール

```bash
# テキストエディタ/IDE（以下のいずれか）
- Visual Studio Code（推奨）
- Sublime Text
- WebStorm
- Vim/Emacs

# Webブラウザ（開発者ツール付き）
- Chrome DevTools（推奨）
- Firefox Developer Edition
```

### 推奨VSCode拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",      // ESLint
    "esbenp.prettier-vscode",      // Prettier
    "ritwickdey.liveserver",       // Live Server
    "formulahendry.auto-rename-tag", // Auto Rename Tag
    "pranaygp.vscode-css-peek"     // CSS Peek
  ]
}
```

### プロジェクトのセットアップ

このプロジェクトはGitリポジトリではありません。ビルドやパッケージマネージャーも使用しないため、セットアップは不要です。

```bash
# 1. Live Serverで起動（VSCodeの場合）
# index.htmlを右クリック → "Open with Live Server"

# 2. または、コマンドラインで起動
python -m http.server 8000
# http://localhost:8000 でアクセス
```

## 📁 プロジェクト構造

```
(プロジェクトルート)/
├── index.html              # メインポータルページ
├── css/
│   ├── style.css          # ポータルページ用スタイル
│   └── shared.css         # 全アプリ共通スタイル
├── js/
│   ├── config.js          # アプリ設定データ（データ層）
│   ├── main.js            # メインロジック（ロジック層）
│   └── utils.js           # 共通ユーティリティ関数
├── docs/                  # ドキュメント
│   ├── GETTING_STARTED.md
│   ├── DEVELOPMENT.md
│   ├── ARCHITECTURE.md
│   └── ...
├── ipad/                  # ⚠️ 初代iPad対応（独自設計方針）
│   ├── DEVELOPMENT_GUIDELINES.md  # 必読！
│   ├── README.md
│   └── ...
├── [app-name]/            # 各アプリディレクトリ
│   ├── index.html         # アプリのHTML
│   ├── css/
│   │   └── style.css      # アプリ固有スタイル
│   └── js/
│       └── xxx.js         # アプリのロジック（説明的なファイル名。例: timer.js, roulette.js）
└── README.md
```

> ⚠️ **重要**: `ipad/` フォルダは初代iPad（iOS 5.1.1）対応のため、プロジェクト全体の設計方針とは異なる規約があります。
> このフォルダ内での開発には [ipad/DEVELOPMENT_GUIDELINES.md](../ipad/DEVELOPMENT_GUIDELINES.md) を**必ず**参照してください。

### 設計原則

このプロジェクトは、以下の設計原則に基づいています:

1. **関心の分離（Separation of Concerns）**
   - データ（config.js）
   - ロジック（main.js、各アプリの説明的な名前のJSファイル）
   - プレゼンテーション（HTML/CSS）

2. **DRY原則（Don't Repeat Yourself）**
   - 共通機能は `utils.js` に集約
   - 重複コードの削除

> ⚠️ **例外**: `ipad/` フォルダは初代iPad対応のため、ES5構文・レガシーレイアウトを使用します。

3. **単一責任の原則（Single Responsibility）**
   - 各クラス/関数は1つの責任のみ

## ➕ 新しいアプリの追加

### ステップ1: ディレクトリ構造を作成

JavaScriptファイル名は汎用的な `app.js` ではなく、アプリの内容が分かる説明的な名前にします（例: `timer.js`, `roulette.js`, `notepad.js`）。既存アプリの命名と揃えてください。

```bash
# アプリディレクトリを作成
mkdir -p newapp/{css,js}

# 必要なファイルを作成
touch newapp/index.html
touch newapp/css/style.css
touch newapp/js/newapp.js
```

### ステップ2: 設定にアプリを追加

`js/config.js` にアプリ情報を追加:

```javascript
const appConfig = {
  collections: [
    {
      id: 'category-id',
      title: 'カテゴリ名',
      subcategories: [
        {
          name: 'サブカテゴリ名',
          apps: [
            // 👇 新しいアプリを追加（name / description / path のみ）
            {
              name: '新アプリ',
              description: 'アプリの説明文',
              path: 'newapp/'
            }
          ]
        }
      ]
    }
  ]
};
```

### ステップ3: HTMLファイルを作成

`newapp/index.html`:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新アプリ - Webアプリ集</title>
    
    <!-- 共通スタイル -->
    <link rel="stylesheet" href="../css/shared.css">
    <!-- アプリ固有スタイル -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>新アプリ</h1>
        </header>
        
        <main>
            <!-- アプリの内容 -->
        </main>
    </div>
    
    <!-- 共通ユーティリティ -->
    <script src="../js/utils.js"></script>
    <!-- アプリのロジック -->
    <script src="js/newapp.js"></script>
</body>
</html>
```

### ステップ4: JavaScriptをクラスベースで実装

`newapp/js/newapp.js`:

```javascript
/**
 * 新アプリクラス
 * 
 * @class NewApp
 * @description アプリの説明
 */
class NewApp {
    constructor() {
        this.storageKey = 'newapp_data';
        this.elements = {};
        this.state = {
            // アプリの状態管理
        };
        
        this.init();
    }
    
    /**
     * 初期化処理
     */
    init() {
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
    }
    
    /**
     * DOM要素の取得
     */
    initElements() {
        this.elements = {
            input: document.getElementById('input'),
            button: document.getElementById('button'),
            output: document.getElementById('output')
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    attachEventListeners() {
        this.elements.button?.addEventListener('click', () => {
            this.handleButtonClick();
        });
        
        // デバウンス処理を使用した自動保存
        this.elements.input?.addEventListener('input', 
            AppUtils.debounce(() => {
                this.saveToStorage();
            }, 500)
        );
    }
    
    /**
     * ボタンクリックハンドラ
     */
    handleButtonClick() {
        try {
            const value = this.elements.input.value;
            // 処理...
            AppUtils.showToast('成功しました！', 'success');
        } catch (error) {
            console.error('Error:', error);
            AppUtils.showToast('エラーが発生しました', 'error');
        }
    }
    
    /**
     * データの保存
     */
    saveToStorage() {
        const data = {
            value: this.elements.input.value,
            timestamp: Date.now()
        };
        AppUtils.saveToStorage(this.storageKey, data);
    }
    
    /**
     * データの読み込み
     */
    loadFromStorage() {
        const data = AppUtils.loadFromStorage(this.storageKey);
        if (data && this.elements.input) {
            this.elements.input.value = data.value || '';
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new NewApp();
});
```

### ステップ5: スタイルの追加

`newapp/css/style.css`:

```css
/* アプリ固有のスタイル */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

/* 必要に応じてスタイルを追加 */
```

### ステップ5: 共通スタイルの適用

**重要**: すべてのアプリは `css/shared.css` を使用して、一貫したデザインを保つ必要があります。

#### 共通スタイルの読み込み順序

HTMLの `<head>` セクションで、**必ず共通スタイルをアプリ固有スタイルより前に配置**してください:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新しいアプリのタイトル</title>
    
    <!-- ✅ 共通スタイルを先に読み込む -->
    <link rel="stylesheet" href="../css/shared.css">
    
    <!-- ✅ アプリ固有スタイルは後で読み込む（上書き可能） -->
    <link rel="stylesheet" href="css/style.css">
</head>
```

**理由**: この順序により、アプリ固有のスタイルが共通スタイルを上書きできます。

#### 共通スタイルのテーマ

`shared.css` は以下のテーマを採用しています:

- **基調色**: ライトグレー/ホワイトのクリーンなデザイン
- **アクセントカラー**: モダンなグリーン (`#10b981`)
- **危険色**: 彩度を落とした赤 (`#dc2626`)
- **タイポグラフィ**: システムフォント優先
- **レイアウト**: カードベース、一貫した余白と影

#### アプリ固有スタイルの調整

`shared.css` を読み込んだ後は、**以下の冗長なCSSを削除**してください:

```css
/* ❌ 削除すべきスタイル（shared.cssで定義済み） */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ...; background: ...; }
.container { max-width: 800px; margin: 0 auto; }
header, header h1 { ... }
.card { background: white; border-radius: ...; }
.btn, .btn-primary, .btn-danger { ... }
input[type="text"], textarea { ... }
```

#### 残すべきアプリ固有のスタイル

```css
/* ✅ 残すべきスタイル */

/* 独自のレイアウト */
.custom-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

/* コンポーネントの微調整 */
.progress-bar-custom {
    height: 30px;
    /* 独自の実装 */
}

/* 共通スタイルのオーバーライド（意図的） */
.btn-primary {
    background-color: var(--custom-color);
}
```

#### 共通クラスの使用

`shared.css` で定義されている便利なクラス:

```html
<!-- コンテナ（最大幅800px、中央配置） -->
<div class="container">
    
    <!-- カード（背景白、角丸、影） -->
    <div class="card">
        <h2>カードタイトル</h2>
        <p>コンテンツ</p>
    </div>
    
    <!-- ボタン -->
    <button class="btn btn-primary">メインアクション</button>
    <button class="btn btn-secondary">セカンダリ</button>
    <button class="btn btn-danger">削除</button>
    <button class="btn btn-info">情報</button>
    <button class="btn btn-default">デフォルト</button>
    
    <!-- 入力グループ -->
    <div class="input-group">
        <label for="name">名前</label>
        <input type="text" id="name" placeholder="入力してください">
    </div>
</div>
```

#### CSS変数の活用

`shared.css` で定義されているCSS変数を使用して、一貫したデザインを維持:

```css
/* アプリ固有のスタイルで変数を活用 */
:root {
    /* カスタム変数（必要に応じて） */
    --app-custom-color: #3b82f6;
}

.custom-element {
    /* 共通テーマの変数を使用 */
    background-color: var(--surface-color);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.custom-button {
    background-color: var(--accent-color);
    color: var(--accent-text);
}

.custom-button:hover {
    background-color: var(--accent-hover);
}
```

#### 利用可能な主なCSS変数

| 変数名 | 説明 | 値（例） |
|--------|------|---------|
| `--bg-color` | 背景の基調色 | `#f8fafc` |
| `--surface-color` | カード・要素の表面色 | `#ffffff` |
| `--text-primary` | 主要テキスト色 | `#1f2937` |
| `--text-secondary` | 二次テキスト色 | `#6b7280` |
| `--border-color` | ボーダー色 | `#e5e7eb` |
| `--accent-color` | アクセントカラー（緑） | `#10b981` |
| `--accent-hover` | アクセントホバー | `#059669` |
| `--accent-text` | アクセント上のテキスト | `#ffffff` |
| `--btn-danger-bg` | 危険ボタン背景 | `#dc2626` |
| `--btn-danger-hover` | 危険ボタンホバー | `#b91c1c` |
| `--shadow-sm` | 小さい影 | `0 1px 2px ...` |
| `--shadow-md` | 中サイズ影 | `0 4px 6px ...` |
| `--shadow-lg` | 大きい影 | `0 10px 15px ...` |

#### 実装例

```css
/* newapp/css/style.css */

/* カスタムカラーパレット（必要に応じて） */
:root {
    --app-highlight: #fbbf24;
}

/* 共通変数を活用した独自コンポーネント */
.timer-display {
    background: var(--surface-color);
    color: var(--text-primary);
    border: 2px solid var(--accent-color);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: var(--shadow-md);
    font-size: 3rem;
    text-align: center;
}

.timer-display.warning {
    border-color: var(--app-highlight);
    color: var(--app-highlight);
}

.timer-display.danger {
    border-color: var(--btn-danger-bg);
    color: var(--btn-danger-bg);
}

/* 独自レイアウト */
.timer-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
}
```

## 🔧 共通ユーティリティの使用

`js/utils.js` には、頻繁に使用される関数が用意されています:

### ローカルストレージ操作

```javascript
// データの保存
AppUtils.saveToStorage('myKey', { name: 'value' });

// データの読み込み（第2引数はデータがない場合のデフォルト値）
const data = AppUtils.loadFromStorage('myKey', null);

// データの削除
AppUtils.removeFromStorage('myKey');
```

### クリップボード操作

```javascript
// テキストをコピー
AppUtils.copyToClipboard('コピーするテキスト')
    .then(() => {
        AppUtils.showToast('コピーしました！', 'success');
    })
    .catch((error) => {
        AppUtils.showToast('コピーに失敗しました', 'error');
    });
```

### トースト通知

```javascript
// 成功メッセージ
AppUtils.showToast('保存しました！', 'success');

// エラーメッセージ
AppUtils.showToast('エラーが発生しました', 'error');

// 情報メッセージ
AppUtils.showToast('処理中...', 'info');

// 警告メッセージ
AppUtils.showToast('注意してください', 'warning');
```

### 日付フォーマット

```javascript
// 日付のフォーマット
const formatted = AppUtils.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
// "2026-01-02 15:30:45"

const dateOnly = AppUtils.formatDate(new Date(), 'YYYY年MM月DD日');
// "2026年01月02日"
```

### デバウンス処理

```javascript
// 頻繁に発生するイベントを制限
const debouncedSave = AppUtils.debounce(() => {
    // 保存処理
    saveData();
}, 500); // 500ms待機

input.addEventListener('input', debouncedSave);
```

### HTMLエスケープ（XSS対策）

```javascript
// ユーザー入力を安全に表示
const userInput = '<script>alert("XSS")</script>';
const safe = AppUtils.escapeHtml(userInput);
// "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"

element.innerHTML = safe; // 安全
```

### URLパラメータ取得

```javascript
// URLから取得: ?name=value&id=123
const params = AppUtils.getQueryParams();
console.log(params.name); // "value"
console.log(params.id);   // "123"
```

### その他のユーティリティ

```javascript
// 数値を2桁ゼロ埋め
AppUtils.pad(5); // "05"

// ランダムな整数（min〜maxの範囲、両端含む）
AppUtils.randomInt(1, 10);

// 配列のシャッフル（Fisher-Yates、元の配列は変更しない）
const shuffled = AppUtils.shuffle([1, 2, 3, 4, 5]);
```

> `js/utils.js` に実装されているメソッドはこれで全てです。ここに載っていない機能（数値のカンマ区切り、ID生成など）が必要な場合はアプリ側で実装してください。

## 📝 コーディング規約

### JavaScript

```javascript
// ✅ Good
class MyApp {
    constructor() {
        this.storageKey = 'myapp_data';  // キャメルケース
    }
    
    handleClick() {  // 動詞で始まる
        // 処理...
    }
}

// ❌ Bad
class my_app {  // スネークケースは避ける
    constructor() {
        this.StorageKey = 'data';  // 定数以外は大文字で始めない
    }
    
    click() {  // 動詞がない
        // 処理...
    }
}
```

### HTML

```html
<!-- ✅ Good: セマンティックHTML -->
<header>
    <h1>タイトル</h1>
    <nav>
        <a href="#">リンク</a>
    </nav>
</header>

<main>
    <article>
        <h2>見出し</h2>
        <p>本文</p>
    </article>
</main>

<!-- ❌ Bad: div だけで構成 -->
<div>
    <div>タイトル</div>
    <div>
        <div>リンク</div>
    </div>
</div>
```

### CSS

```css
/* ✅ Good: BEM命名規則 */
.card {}
.card__header {}
.card__body {}
.card--highlighted {}

/* ✅ Good: CSS変数の使用 */
:root {
    --primary-color: #007bff;
    --spacing-unit: 1rem;
}

.button {
    background-color: var(--primary-color);
    padding: var(--spacing-unit);
}

/* ❌ Bad: 過度にネストしたセレクタ */
.container .content .article .paragraph .link {
    /* 避ける */
}
```

## 🧪 テストとデバッグ

### コンソールでのデバッグ

```javascript
// ユーティリティの確認
console.log(AppUtils);

// 設定の確認
console.log(appConfig);

// ローカルストレージの確認
console.log(localStorage);
```

### Chrome DevToolsの活用

```
F12キーで開く

- Console: エラー確認、変数の出力
- Elements: DOM構造の確認、CSSのデバッグ
- Application > Local Storage: データの確認
- Network: リソースの読み込み確認
- Sources: ブレークポイントの設定
```

### よくあるエラーと解決方法

```javascript
// エラー: Cannot read property 'value' of null
// 原因: 要素が見つからない
// 解決: オプショナルチェーンを使用
const value = element?.value || '';

// エラー: localStorage is not defined
// 原因: プライベートモードまたは無効化されている
// 解決: try-catchで処理
try {
    AppUtils.saveToStorage(key, value);
} catch (error) {
    console.error('Storage error:', error);
}
```

## ✅ ベストプラクティス

### セキュリティ

```javascript
// ✅ ユーザー入力は必ずエスケープ
element.textContent = userInput; // 安全
// または
element.innerHTML = AppUtils.escapeHtml(userInput);

// ❌ 危険
element.innerHTML = userInput; // XSSリスク
```

### パフォーマンス

```javascript
// ✅ デバウンスで処理を制限
input.addEventListener('input', AppUtils.debounce(handler, 300));

// ✅ イベントリスナーのクリーンアップ
class MyApp {
    destroy() {
        // イベントリスナーを削除
        this.elements.button.removeEventListener('click', this.handleClick);
    }
}
```

### アクセシビリティ

```html
<!-- ✅ 適切なaria属性 -->
<button aria-label="メニューを開く">☰</button>

<!-- ✅ キーボード操作可能 -->
<div role="button" tabindex="0" onkeypress="handleKey(event)">
    クリック可能な要素
</div>
```

## 📚 参考リソース

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [CSS-Tricks](https://css-tricks.com/)
- [アーキテクチャドキュメント](ARCHITECTURE.md)

## 🔄 次のステップ

- [🏗️ Architecture](ARCHITECTURE.md) - システム設計の詳細
- [🔄 Migration Guide](MIGRATION.md) - 旧バージョンからの移行
- [❓ FAQ](FAQ.md) - よくある質問

---

**Happy Coding! 🚀**
