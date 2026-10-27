# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-08-16

### ✨ Added

#### ランダム抽選ルーレット機能強化
- **順番固定機能（設定画面）**
  - 「設定」ボタンから別ウィンドウ（`settings.html`）を開き、参加者ごとに固定の抽選番号を指定可能
  - 番号を指定された参加者は抽選結果が必ずその番号になる
  - 未指定の参加者は残りの番号からランダムに割り当て（重複なし）
  - 参加者数の変化・範囲外の値・重複した値は抽選時に自動的に無視され、安全側（ランダム抽選）にフォールバック
  - メイン画面の参加者リスト変更が、開いたままの設定画面にもリアルタイムに反映される

### 🔄 Changed

- LocalStorageキー `roulette_fixed_numbers` を追加
- 「すべてクリア」実行時に順番固定設定も削除するように変更

## [2.0.3] - 2026-01-29

### ✨ Added

#### マークダウンビューアー機能強化
- **ファイルアップロード機能**
  - 「📁 ファイルを開く」ボタンからtxt/mdファイルを選択して読み込み
  - ファイルサイズ制限: 10MB以下
  - ファイルタイプバリデーション（txt/md のみ）
  - 読み込み成功時の視覚的フィードバック（ボタン色変化）
  
- **ドラッグ&ドロップ機能**
  - テキストエリアにtxt/mdファイルをドラッグ&ドロップして読み込み
  - ドラッグオーバー時の視覚的フィードバック（背景色変化）
  - 画面右上にスライドイン通知を表示
  - ドロップされたファイル名を通知に表示

- **リサイズ可能なレイアウト**
  - 左右のパネル幅を中央の仕切り（リサイザー）をドラッグして調整可能
  - デフォルト: 50:50の分割表示
  - リサイズ範囲: 20%〜80%
  - リサイザーのホバーエフェクト（アクセントカラー）
  - ドラッグ中のカーソル変化（`col-resize`）

### 🔄 Changed

#### マークダウンビューアーUI改善
- **独立したスクロール機能**
  - 左側（マークダウン入力）と右側（プレビュー）が別々にスクロール可能
  - 各パネルに `overflow-y: auto` を設定
  
- **レイアウトシステムの変更**
  - Grid Layout → Flexbox Layout に変更
  - よりスムーズなリサイズ動作を実現
  - モバイル表示時は仕切りを非表示にして上下配置

- **CSS改善**
  - テキストエリアにトランジション効果を追加
  - 通知システムのスタイル追加（スライドインアニメーション）
  - リサイザーのスタイル定義

#### ドキュメント更新
- **markdownviewer/README.md** を全面的に更新
  - 新機能（ファイルアップロード、ドラッグ&ドロップ、リサイズ）の説明追加
  - 使い方セクションの拡充
  - 技術スタックの更新（FileReader API、ドラッグ&ドロップAPI）
  - 今後の拡張候補を追加
  - 最終更新日を2026年1月29日に変更

### 🛠️ Technical Details

#### JavaScript実装
- `MarkdownViewerApp`クラスに以下のメソッドを追加:
  - `initDragAndDrop()` - ドラッグ&ドロップの初期化
  - `handleDroppedFile()` - ドロップされたファイルの処理
  - `handleFileUpload()` - ファイル選択ダイアログからの読み込み
  - `showNotification()` - 通知表示システム
  - `initResizer()` - リサイザーの初期化とドラッグ処理
  
- FileReader API を使用したUTF-8ファイル読み込み
- ドラッグ&ドロップイベントハンドリング（`dragover`, `dragleave`, `drop`）
- マウスイベントによるリサイズ処理（`mousedown`, `mousemove`, `mouseup`）

#### HTML変更
- 隠しファイル入力要素（`<input type="file">`）の追加
- ヘッダーに「📁 ファイルを開く」ボタンを追加
- パネルにID属性を追加（`leftPanel`, `rightPanel`）
- リサイザー要素（`<div class="resizer">`）の追加

### 📊 User Experience Improvements

- **3つのファイル読み込み方法**: ボタン選択、ドラッグ&ドロップ、直接入力
- **視覚的フィードバック**: ドラッグ中、読み込み完了時に明確な表示
- **カスタマイズ可能なレイアウト**: ユーザーの好みに応じたパネル幅調整
- **独立したスクロール**: 長文の編集とプレビューが快適に

## [2.0.2] - 2026-01-02

### 🎨 Changed

#### デザイン統一
- **ボタン色の統一** - 全アプリケーションでボタンの色を統一
  - **コピーボタン**: 緑 (`btn-primary`)
    - `roulette/`: 青 → 緑に変更
    - `zoomlink/`: グレー → 緑に変更
  - **クリアボタン**: 赤 (`btn-danger`) - 統一済み
  - **ダウンロードボタン**: 青 (`btn-info`)
    - `simplenotepad/`: 緑 → 青に変更（CSS調整含む）
    - `markdownviewer/`: 緑 → 青に変更
  - **アップロードボタン**: 青 (`btn-info`) - 統一済み

#### ドキュメント
- **docs/APPS.md** を新規作成 - 全アプリの詳細な説明
- **README.md** の更新
  - バージョン番号を 2.0.2 に更新
  - 削除されたレポートへのリンクを削除
  - APPS.mdへの参照を修正
- **docs/DOCS_STRUCTURE.md** の更新
  - APPS.md をドキュメント一覧表に追加
  - REFACTORING_GUIDE.md をドキュメント一覧表に追加
  - 各ドキュメントの詳細説明セクションを拡充
  - 読者別ナビゲーションを更新
  - 統計表とドキュメント更新タイミング表を更新
- **プロジェクト整理**
  - 一時的なレポートファイル22件を削除（リファクタリング完了報告、準拠度検証レポート等）
  - `_old_docs/` フォルダのクリーンアップ

### 📚 Added

#### ドキュメント
- **docs/APPS.md** - 各アプリの詳細なドキュメント
  - 全12アプリ（iPad専用アプリ含む）の機能説明
  - 使い方ガイド
  - 技術スタック
  - ボタンの色ルールの明記

### 🗑️ Removed

- **一時的なレポートファイル（22件）**
  - `_old_docs/` フォルダ内のすべてのファイル（7件）
    - README.md, REFACTORING_GUIDE.md, QUICK_START.md
    - COMPLETION_REPORT.md, REFACTORING_SUMMARY.md
    - CHANGES.md, admin_guide.md
  - 各アプリフォルダ内のREPORT/SUMMARY/COMPLIANCE系ファイル（13件）
    - `roulette/`: 6ファイル（OPERATION_INSPECTION_REPORT.md, REFACTORING_COMPLETION_REPORT.md, INTEGRATION_REPORT.md, COMPLIANCE_INSPECTION_REPORT.md, REFACTORING_SUMMARY.md, COMPLIANCE_SUMMARY.md）
    - `stockinformation/`: 3ファイル（REFACTORING_COMPLETION_REPORT.md, COMPLIANCE_INSPECTION_REPORT.md, REFACTORING_SUMMARY.md）
    - `markdownviewer/`: 1ファイル（REFACTORING_REPORT.md）
    - `zoomlink/`: 2ファイル（REFACTORING_REPORT.md, COMPLIANCE_REVIEW.md）
    - `registerwithcounter/`: 1ファイル（DEPLOYMENT.md）
  - ルートフォルダの検証レポート（2件）
    - PROJECT_VALIDATION_REPORT.md
    - DOCS_SUMMARY.md

## [2.0.1] - 2026-01-02

### ✨ Added

#### 新規アプリ
- **ランダム抽選ルーレット（発表順ルーレット）**（`roulette/`）
  - 参加者の発表順をランダムに決定する機能
  - 最大30名まで対応（6グループ × 5人）
  - グループ分け表示による入力の整理
  - 約3秒の減速演出でドラマチックな停止
  - 結果をタブ区切り形式でコピー（Excel対応）
  - レスポンシブデザイン（PC: 3列、タブレット: 2列、スマホ: 1列）
  - 完全な重複なし抽選アルゴリズム
  - リアルタイム参加者数カウント
  - **自動保存・復元機能**（LocalStorage）
  - **XSS対策**（入力エスケープ処理）
  - **入力検証**（文字数制限）

### 🔄 Changed

#### リファクタリング
- **ランダム抽選ルーレット**を完全リファクタリング
  - クラスベース設計への移行（`RouletteApp`クラス）
  - グローバル変数・関数を完全排除
  - 共通ユーティリティ（`utils.js`）の統合
  - JSDocによる完全なドキュメント化
  - トースト通知の実装
  - データ永続化の実装
  - セキュリティ対策の強化
  - **準拠度スコア**: 45/100 → **100/100** ✅

#### ドキュメント
- README.md: ランダム抽選ルーレットの詳細情報を追加
- CHANGELOG.md: v2.0.1の変更内容を記録

## [2.0.0] - 2026-01-01

### 🎉 Major Refactoring Release

完全なアーキテクチャ刷新により、保守性・拡張性・可読性を大幅に向上しました。

### ✨ Added

#### 新規ファイル・モジュール
- **`js/config.js`** - アプリ設定データの外部化（85行）
- **`js/main.js`** - メインポータルロジック（108行）
- **`js/utils.js`** - 共通ユーティリティライブラリ（161行）
  - `saveToStorage()` / `loadFromStorage()` - ローカルストレージ操作
  - `copyToClipboard()` - クリップボードコピー
  - `showToast()` - トースト通知
  - `formatDate()` - 日付フォーマット
  - `debounce()` - デバウンス処理
  - `escapeHtml()` - XSS対策
  - その他多数のヘルパー関数

#### ドキュメント
- **`README.md`** - プロジェクト概要とクイックスタート
- **`docs/GETTING_STARTED.md`** - ユーザー向け導入ガイド
- **`docs/DEVELOPMENT.md`** - 開発者向けガイド
- **`docs/ARCHITECTURE.md`** - アーキテクチャ設計文書
- **`docs/MIGRATION.md`** - v1.xからの移行ガイド
- **`CHANGELOG.md`** - このファイル

#### 機能
- クラスベースのアプリケーション設計
- デバウンス付き自動保存機能
- エラーハンドリングの強化
- トースト通知システム
- セキュリティ対策の実装（XSS防止）

### 🔄 Changed

#### アーキテクチャ
- **データとロジックの分離**: HTMLからJavaScriptを完全に分離
- **クラスベース設計**: ES6+クラスを使用したモダンな実装
- **モジュール化**: 機能ごとにファイルを分割

#### index.html
- **Before**: 122行（HTML + 埋め込みJS）
- **After**: 36行（HTMLのみ）
- **改善**: -70%の削減、構造の簡素化

#### simplenotepad
- **Before**: `js/script.js` 220行（手続き型）
- **After**: `js/notepad.js` 205行（クラスベース）
- **改善**: カプセル化、保守性向上、共通ユーティリティ活用

#### コーディング規約
- セマンティックHTML の徹底
- BEM命名規則の採用
- CSS Variables の活用
- エラーハンドリングの標準化

### 🐛 Fixed

- グローバル変数の汚染問題を解決
- イベントリスナーのメモリリーク対策
- LocalStorageのエラーハンドリング改善
- レスポンシブデザインの不具合修正

### 🔒 Security

- **XSS対策**: HTMLエスケープ処理の実装
- **安全なリンク**: `rel="noopener noreferrer"` の追加
- **CSP準備**: Content Security Policy対応の準備
- **入力バリデーション**: ユーザー入力の検証強化

### ⚡ Performance

- **DOM操作の最適化**: DocumentFragmentの活用
- **デバウンス処理**: 頻繁なイベントの制限
- **イベントデリゲーション**: イベントリスナーの効率化
- **LocalStorage最適化**: データ構造の改善

### 📊 Metrics

| 指標 | Before (v1.x) | After (v2.0) | 改善率 |
|------|--------------|-------------|--------|
| index.html行数 | 122行 | 36行 | -70% |
| JavaScriptファイル数 | 各1ファイル | 共通3 + 各1 | 統一化 |
| 重複コード | 多数 | ほぼゼロ | -90%+ |
| グローバル変数 | 散在 | カプセル化 | 整理 |
| 関数の再利用性 | 低 | 高 | 改善 |
| テスト容易性 | 困難 | 容易 | 改善 |

### 🗑️ Deprecated

以下の古いパターンは非推奨となりました（v3.0で削除予定）:

- HTMLへの直接JavaScript埋め込み
- グローバル変数の使用
- `innerHTML` への直接代入（エスケープなし）
- 手続き型のアプリ実装

### ⚠️ Breaking Changes

#### 1. ファイル構造の変更
- `index.html` から JavaScript が削除され、外部ファイルに分離

#### 2. グローバル変数の廃止
```javascript
// ❌ v1.x
window.appData = {...};

// ✅ v2.0
class App {
  constructor() {
    this.data = {...};
  }
}
```

#### 3. LocalStorageキーの変更
```javascript
// v1.x
localStorage.getItem('title');

// v2.0
AppUtils.loadFromStorage('app_title');
// 内部的に 'webapps_app_title' として保存
```

#### 4. 関数の名前空間
```javascript
// v1.x
copyToClipboard(text);

// v2.0
AppUtils.copyToClipboard(text);
```

### 📦 Migration Path

v1.xからv2.0への移行については、[Migration Guide](docs/MIGRATION.md) を参照してください。

---

## [1.0.0] - 2025-XX-XX

### Initial Release

#### Added
- ポータルページ（アプリ一覧）
- ブラウザメモ帳
- 4分割メモ帳
- マークダウンビューアー
- カウントダウンタイマー
- プログレスバー
- ランダム抽選ルーレット
- カウンター付き名簿
- Zoom表示名ジェネレーター
- Amazon URLクリーナー
- 株式リンクジェネレーター
- iPad Apps（12種類）
  - 12時間時計
  - 24時間時計
  - 大きい時計
  - タイル時計
  - ストップウォッチ
  - 日付表示
  - その他

#### Features
- LocalStorageによるデータ永続化
- レスポンシブデザイン
- シンプルで直感的なUI
- ブラウザ完結型（サーバー不要）

---

## 🔮 Upcoming

このプロジェクトは「ビルドやパッケージマネージャーを使わない、ブラウザ完結型の軽量ツール集」という方針を維持します。TypeScript移行やビルドシステム、テストフレームワークの導入といった大規模な構成変更は現時点で予定していません。個別アプリの新機能追加は都度このCHANGELOGに記録します。

---

## 📝 Change Types

このChangelogでは、以下のカテゴリを使用しています:

- **Added**: 新機能
- **Changed**: 既存機能の変更
- **Deprecated**: 非推奨化された機能
- **Removed**: 削除された機能
- **Fixed**: バグ修正
- **Security**: セキュリティ関連の変更
- **Performance**: パフォーマンス改善

---

## 🔗 Links

- [Documentation](docs/)
- [Migration Guide](docs/MIGRATION.md)
- [Development Guide](docs/DEVELOPMENT.md)

---

**Note**: v2.0.0は後方互換性を破壊する変更を含みます。詳細は [Migration Guide](docs/MIGRATION.md) を参照してください。
