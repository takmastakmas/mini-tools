# iPad Clock Apps

iPadのフルスクリーン表示に最適化された、さまざまな時計アプリケーション集のランディングページです。

## 🎯 プロジェクト概要

このプロジェクトは、**元のモダンなデザインを完全に維持**しながら、初代iPad（iOS 5.1.1）から最新のiOS/iPadOSデバイスまで幅広く対応することを目指して作成されています。時計アプリケーションのコレクションへのナビゲーションを提供します。

## ✨ 主な機能

- **10種類の時計アプリ**へのリンク集
- **元のデザインを完全再現**：色使い、レイアウト、フォントサイズを維持
- **レスポンシブデザイン**：スマートフォン、タブレット、デスクトップに対応
- **カードベースUI**：各アプリを視覚的に分かりやすく表示
- **新しいタブで開く**：リンクをクリックすると新しいタブで開きます

## 🎨 デザインの特徴

元のCSSデザインを完全に維持しています：

### カラーパレット
- **背景グラデーション**: `#f5f7fa` → `#c3cfe2`（淡いブルーグレー）
- **ヘッダー文字**: `#1a202c`（ダークグレー）
- **サブテキスト**: `#4a5568`（ミディアムグレー）
- **カードタイトル**: `#2c5282`（ブルー）
- **カード背景**: ホワイト
- **フッター**: `#718096`（グレー）

### レイアウト
- **デスクトップ**: 3列グリッド
- **タブレット**: 2列グリッド
- **スマートフォン**: 1列グリッド
- **最大幅**: 1200px
- **カード間隔**: 20px

### タイポグラフィ
- **メインタイトル**: 2.5rem (40px) / 太字
- **セクションタイトル**: 2rem (32px)
- **カードタイトル**: 1.25rem (20px)
- **本文**: 0.95rem - 1.1rem

## 📱 対応デバイス

### ✅ 完全動作確認済み
- **初代iPad**（iOS 5.1.1、Safari Mobile 5.1）
- **iPhone 3GS / 4 / 4S**（iOS 5-9）
- **iPad 2 / 3 / 4 / mini**（iOS 5-9）
- **それ以降のすべてのiOS/iPadOSデバイス**

## 🛠 互換性のための技術的対応

### CSS変換（元のデザインを維持）

#### ❌ 削除した機能 → ✅ 代替手法
- ❌ `display: grid` → ✅ `float: left` + clearfix
- ❌ `grid-template-columns` → ✅ `width: calc(33.333% - 20px)`
- ❌ `display: flex` → ✅ `display: block`
- ❌ `flex-direction: column` → ✅ 通常のブロックレイアウト
- ❌ `gap: 20px` → ✅ `margin` による間隔調整

#### ✅ 追加した互換性対応
- **ベンダープレフィックス**:
  - `-webkit-box-sizing`
  - `-webkit-border-radius`
  - `-webkit-box-shadow`
  - `-webkit-transition`
  - `-webkit-transform`
  - `-webkit-linear-gradient`
  - `-webkit-gradient()` (iOS 5用)
  
- **Clearfix テクニック**:
  ```css
  .card-grid:before,
  .card-grid:after {
      content: "";
      display: table;
  }
  .card-grid:after {
      clear: both;
  }
  ```

- **Calcのフォールバック**:
  ```css
  width: 100%;
  width: -webkit-calc(33.333% - 20px);
  width: calc(33.333% - 20px);
  ```

- **Remのフォールバック**:
  ```css
  font-size: 2.5rem;
  font-size: 40px; /* フォールバック */
  ```

### JavaScript（ES5互換）
- ❌ `const` / `let` → ✅ `var`
- ❌ アロー関数 `() => {}` → ✅ `function() {}`
- ❌ テンプレートリテラル → ✅ 文字列連結
- ✅ `forEach`, `querySelector`, `addEventListener`（iOS 5+でサポート）

### HTML追加メタタグ
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

## 📂 ファイル構成

```
/
├── index.html                   # メインページ（ES5互換JavaScript）
├── README.md                    # このファイル（プロジェクト概要）
├── PROJECT_GUIDE.md            # 📘 プロジェクト完全ガイド（技術詳細・使い方）
├── DEVELOPMENT_GUIDELINES.md   # 🔴 開発者必読：開発ガイドライン
├── QUICK_REFERENCE.md          # ⚡ クイックリファレンス
├── DOCUMENTATION_INDEX.md      # 📚 ドキュメント索引
├── css/
│   ├── style.css               # レガシーブラウザ対応CSS（使用中）
│   └── style-original.css      # 元のCSS（参考用）
└── [時計アプリディレクトリ]/   # 各時計アプリ（開発ガイドライン遵守必須）
```

### 🔴 重要：開発者の方へ

**このプロジェクトまたはサブディレクトリに新しいアプリを追加する場合は、必ず `DEVELOPMENT_GUIDELINES.md` を読んでください。**

初代iPad（iOS 5.1.1）対応のため、使用禁止技術や必須パターンが定義されています。

### 📚 ドキュメントガイド

- **PROJECT_GUIDE.md** - プロジェクトの完全ガイド（概要、技術詳細、ビジュアル比較、使い方）
- **DEVELOPMENT_GUIDELINES.md** - 開発ガイドライン（コーディング前に必読）
- **QUICK_REFERENCE.md** - クイックリファレンス（開発中に参照）
- **DOCUMENTATION_INDEX.md** - ドキュメント全体の索引

## 🔗 収録されている時計アプリ

| アプリ名 | 説明 | パス |
|---------|------|------|
| 12 Hour Clock | シンプルな12時間表示のアナログ風時計 | `12hourclock/` |
| 12 Hour Clock v2 | アイコンで午前/午後を表示する12時間時計 | `12hourclock2/` |
| 24 Hour Clock | シンプルな24時間表示のデジタル時計 | `24hourclock/` |
| API Clock | WorldTimeAPIと同期する正確な24時間時計 | `apiclock/` |
| Chrono Panel 1 | 計器盤風のアナログ＆デジタル時計 | `chrono1/` |
| Chrono Panel 2 | 秒針サブダイヤル付きのクロノグラフ風時計 | `chrono2/` |
| Chrono Panel 3 | 洗練されたUIのクロノグラフ風タイムダッシュボード | `chrono3/` |
| Date Display | 年月日（曜日）を大きく表示するシンプルなアプリ | `date/` |
| 1440 Tiles Clock | 1日の1440分をタイルで可視化する時計 | `tileclock/` |
| 1440 Tiles Clock v2 | スタイルを微調整したタイル時計の別バージョン | `tileclock2/` |

## 🚀 使い方

1. ブラウザで`index.html`を開く
2. 表示されたカードから使いたい時計アプリを選択
3. カードをクリックすると新しいタブでアプリが開きます

## ⚠️ 注意事項

### 古いデバイスでの使用について

このランディングページは初代iPadや古いiPhoneでも**元のデザインを完全に維持したまま**動作するように最適化されていますが、**リンク先の各時計アプリが同様に互換性を持っているかは保証されません**。

### 🔴 開発者の方へ：時計アプリの開発

各時計アプリも古いデバイスで動作させたい場合は、**`DEVELOPMENT_GUIDELINES.md`を必ず参照してください**。以下の対応が必須です：

#### 必須対応項目
- ✅ ES5互換のJavaScriptコード（`const`/`let`/アロー関数禁止）
- ✅ すべてのCSS3プロパティにベンダープレフィックス
- ✅ Grid/Flexboxを避けたレイアウト（Floatベース推奨）
- ✅ グラデーションに古い構文とフォールバック
- ✅ Canvas APIの互換性確認（使用する場合）
- ✅ `requestAnimationFrame`のポリフィル（アニメーション使用時）

#### 開発前チェックリスト
- [ ] `DEVELOPMENT_GUIDELINES.md`を読んだ
- [ ] 使用禁止技術リストを確認した
- [ ] 必須パターンを理解した
- [ ] コードレビューチェックリストを確認した

詳細は **`DEVELOPMENT_GUIDELINES.md`** を参照してください。

## 🔍 デザイン比較

### 元のCSS（モダンブラウザ向け）
```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.card {
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
}
```

### レガシー対応版（同じ見た目を実現）
```css
.card-grid {
    zoom: 1; /* Clearfix */
    margin: 0 -10px;
}

.card {
    float: left;
    width: calc(33.333% - 20px);
    -webkit-transition: -webkit-transform 0.3s ease;
}
```

## 📝 今後の改善案

- [ ] 各時計アプリのサムネイル画像を追加
- [ ] カテゴリ別フィルタリング機能
- [ ] お気に入り機能（LocalStorage使用）
- [ ] ダークモード対応（iOS 5でも動作する切り替え機能）
- [ ] 各時計アプリの互換性情報の表示

## 🛠 技術スタック

- **HTML5**
- **CSS3**（レガシーブラウザ対応、元のデザイン維持）
- **JavaScript (ES5)**
- **レスポンシブデザイン**（Media Queries）
- **Float + Clearfix レイアウト**（Grid/Flexboxの代替）

## 📄 ライセンス

© 2026 taktak apps

---

**作成日**: 2026年1月2日  
**対象ブラウザ**: Safari Mobile 5.1+ / iOS 5.1.1+  
**デザイン**: 元のモダンなデザインを完全維持
