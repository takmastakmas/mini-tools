# Webアプリ集

[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](CHANGELOG.md)

> 便利なWebアプリケーションを集めたポータルサイト。各アプリは独立して動作し、ブラウザ上で完結します。

## 🚀 クイックスタート

このプロジェクトはGitリポジトリではなく、ビルドやパッケージマネージャーも使用しません。フォルダをそのまま使うだけで動作します。

```bash
# フォルダのルートで index.html を開く
open index.html  # macOS
# または
start index.html # Windows
```

開発時など、簡易サーバー経由で確認したい場合:

```bash
python -m http.server 8000
# http://localhost:8000 でアクセス
```

詳細な手順は [Getting Started ガイド](docs/GETTING_STARTED.md) をご覧ください。

## 📋 概要

このプロジェクトは、日常業務やプレゼンテーション、会議などで役立つWebアプリケーションのコレクションです。

### ✨ 主な特徴

- 🌐 **ブラウザ完結型** - サーバー不要、インストール不要
- 📱 **レスポンシブ対応** - PC、タブレット、スマートフォンで利用可能
- 💾 **オフライン動作** - ローカルストレージでデータを保存
- 🎨 **モダンなUI** - 使いやすく美しいインターフェース
- 🔒 **プライバシー重視** - データは全てローカルに保存

各アプリはクラスベースのJavaScript（`XxxApp`クラス）で実装され、共通ユーティリティ（`js/utils.js`）と共通デザインシステム（`css/shared.css`）を利用する統一された構成になっています。変更履歴は [CHANGELOG.md](CHANGELOG.md) をご覧ください。

## 📦 含まれるアプリ

### 📝 Notepad（メモ帳）
- **ブラウザメモ帳** - 自動保存機能付きシンプルメモ帳
- **4分割メモ帳** - 4つの独立したメモ欄で整理
- **マークダウンビューアー** - リアルタイムMarkdownプレビュー（シンタックスハイライト、全画面表示対応）

### 🎤 プレゼンツール
- **カウントダウンタイマー** - 終了時刻/分数指定可能
- **プログレスバー** - 視覚的な残り時間表示（フルスクリーン対応、リアルタイム同期、カスタマイズ可能）

### 👥 参加者管理
- **ランダム抽選ルーレット（発表順ルーレット）** - 公平な参加者の番号割り当て（最大30名対応、グループ分け表示、減速演出、結果コピー機能、順番固定機能、自動保存対応）
- **カウンター付き名簿（Register with Counter）** - 参加者ごとの発言回数や行動回数をカウント管理（グループ対応、CSV入出力、メモ機能）

### 💼 Meeting（会議）
- **Zoom表示名ジェネレーター** - カスタム表示名リンク生成

### 🔧 その他ツール
- **Amazon URLクリーナー** - URLから不要なパラメータを削除
- **株式リンクジェネレーター** - 複数の投資情報サイトへのリンク生成

### 📱 iPad Apps
時計・日付表示など10種類のアプリへのランディングページ

> ⚠️ **重要**: `ipad/` フォルダ以下は初代iPad（iOS 5.1.1）対応のため、**独自の設計方針が適用されています**。
> このフォルダ内の開発には、[ipad/DEVELOPMENT_GUIDELINES.md](ipad/DEVELOPMENT_GUIDELINES.md) を必ず参照してください。
> プロジェクト全体の設計方針（ES6+、Grid/Flexbox等）は適用されません。

すべてのアプリの詳細は [アプリ一覧](docs/APPS.md) をご覧ください。

## 🛠️ 技術スタック

- **HTML5** - セマンティックマークアップ
- **CSS3** - Grid/Flexbox、CSS Variables、カスタムアニメーション
  - `css/shared.css` - 全アプリ共通のモダンなデザインシステム
  - CSS Variables による一貫したテーマ管理
- **Vanilla JavaScript** - ES6+クラス構文、モジュールパターン
  - クラスベース設計
  - データとロジックの完全分離
- **LocalStorage API** - クライアントサイドデータ永続化

フレームワークを使用しない軽量設計により、高速な動作とシンプルな保守を実現しています。

> ⚠️ **例外**: `ipad/` フォルダは初代iPad対応のため、ES5構文・Float/Inline-blockレイアウトを使用しています。詳細は [ipad/README.md](ipad/README.md) を参照してください。

### デザインシステム

すべてのアプリは `css/shared.css` を使用して一貫したデザインを保っています:
- **共通テーマ**: モダンなグリーンをアクセントカラーとしたクリーンなデザイン
- **CSS変数**: `--accent-color`、`--text-primary` など、テーマカラーを変数で管理
- **共通コンポーネント**: ボタン、カード、入力フィールドなどの統一されたスタイル

## 📚 ドキュメント

### 👤 ユーザー向け
- [📖 Getting Started](docs/GETTING_STARTED.md) - インストールと基本的な使い方
- [📱 アプリ一覧](docs/APPS.md) - 各アプリの詳細な説明

### 👨‍💻 開発者向け
- [⚙️ Development Guide](docs/DEVELOPMENT.md) - 開発環境のセットアップとコーディング規約
- [🏗️ Architecture](docs/ARCHITECTURE.md) - システム設計とアーキテクチャ
- [🔧 Refactoring Guide](docs/REFACTORING_GUIDE.md) - 新規アプリのリファクタリング手順
- [🔄 Migration Guide](docs/MIGRATION.md) - 旧バージョンからの移行方法

### 📝 その他
- [📋 CHANGELOG](CHANGELOG.md) - バージョン履歴と変更内容
- [❓ FAQ](docs/FAQ.md) - よくある質問
- [📚 Docs Structure](docs/DOCS_STRUCTURE.md) - ドキュメント体系の説明

## 🤝 コントリビューション

現時点ではGitリポジトリ・公開Issueトラッカーを運用していない個人利用のツール集です。将来的にGit管理・公開する場合の方針は [コントリビューションガイド](docs/CONTRIBUTING.md) にまとめています。

## 📄 ライセンス

© 2026 taktak apps - All rights reserved

## 🔗 リンク

- [📖 ドキュメント](docs/)

## 📞 サポート

質問や問題がある場合は、まず [FAQ](docs/FAQ.md) を確認してください。

---

**Made with ❤️ by taktak apps**
