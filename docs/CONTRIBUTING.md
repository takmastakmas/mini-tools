# Contributing Guide（コントリビューションガイド）

> 📌 **現状について**: このプロジェクトは現時点でGitリポジトリではなく、GitHub上での公開・Issueトラッカー・プルリクエスト受付も行っていません。以下はGit管理・GitHub公開を将来行う場合を想定したフロー・規約です。今すぐの実運用を約束するものではありません。

Webアプリ集へのコントリビュートに興味を持っていただき、ありがとうございます！このガイドでは、（将来Git管理・公開した場合の）プロジェクトへの貢献方法を説明します。

## 📋 目次

- [行動規範](#行動規範)
- [貢献の種類](#貢献の種類)
- [開発の流れ](#開発の流れ)
- [コーディング規約](#コーディング規約)
- [コミットメッセージ](#コミットメッセージ)
- [プルリクエスト](#プルリクエスト)
- [レビュープロセス](#レビュープロセス)

## 🤝 行動規範

### 基本原則

- **尊重**: すべてのコントリビューターを尊重する
- **建設的**: 批判は建設的に、提案は具体的に
- **協力的**: チームワークを大切に
- **オープン**: 質問や議論を歓迎

### 禁止事項

- ハラスメント、差別的発言
- 個人攻撃や侮辱
- プライバシーの侵害
- 不適切なコンテンツ

違反行為を発見した場合は、プロジェクトメンテナーに報告してください。

## 🎯 貢献の種類

### 1. バグ報告

バグを見つけた場合:

1. [既存のIssue](#)を検索
2. 重複がなければ、新しいIssueを作成
3. 以下の情報を含める:

```markdown
## バグの説明
[簡潔な説明]

## 再現手順
1. ...
2. ...
3. ...

## 期待される動作
[期待される結果]

## 実際の動作
[実際に起こること]

## 環境
- OS: [例: Windows 11]
- ブラウザ: [例: Chrome 120]
- バージョン: [例: v2.0.0]

## スクリーンショット
[あれば添付]

## 追加情報
[その他の関連情報]
```

### 2. 機能リクエスト

新機能を提案する場合:

```markdown
## 機能の概要
[機能の説明]

## 動機・背景
[なぜこの機能が必要か]

## 提案する実装方法
[具体的なアイデア]

## 代替案
[他に考えられる方法]

## 優先度
- [ ] 高
- [ ] 中
- [ ] 低
```

### 3. ドキュメント改善

- タイポ修正
- 説明の追加・改善
- 翻訳
- サンプルコードの追加

ドキュメントの改善も大歓迎です！

### 4. コードコントリビュート

- バグ修正
- 新機能実装
- パフォーマンス改善
- リファクタリング

## 🔄 開発の流れ

### ステップ1: Issue の作成

まず、Issue で議論を開始してください:

```markdown
## 提案
[何を実装したいか]

## 実装計画
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 懸念事項
[あれば記載]
```

### ステップ2: フォークとクローン

```bash
# 1. GitHubでリポジトリをフォーク

# 2. フォークしたリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/tools_refactored.git
cd tools_refactored

# 3. アップストリームを設定
git remote add upstream https://github.com/ORIGINAL_OWNER/tools_refactored.git

# 4. 最新の状態を取得
git fetch upstream
git checkout main
git merge upstream/main
```

### ステップ3: ブランチ作成

```bash
# 機能ブランチを作成
git checkout -b feature/your-feature-name

# または、バグ修正の場合
git checkout -b fix/bug-description
```

ブランチ命名規則:
- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント
- `refactor/` - リファクタリング
- `test/` - テスト追加
- `chore/` - その他の変更

### ステップ4: 開発

```bash
# 開発サーバーを起動
python -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

変更を加えながら、頻繁にコミット:

```bash
git add .
git commit -m "feat: add new feature"
```

### ステップ5: テスト

- すべての機能が動作することを確認
- ブラウザのコンソールエラーを確認
- 複数のブラウザでテスト
- レスポンシブデザインを確認

### ステップ6: コミットとプッシュ

```bash
# 最新の変更を取得
git fetch upstream
git rebase upstream/main

# プッシュ
git push origin feature/your-feature-name
```

### ステップ7: プルリクエスト作成

GitHubでプルリクエストを作成:

```markdown
## 概要
[変更の概要]

## 変更内容
- 変更1
- 変更2
- 変更3

## 関連Issue
Closes #123

## テスト
- [ ] 手動テスト完了
- [ ] ブラウザ互換性確認
- [ ] レスポンシブデザイン確認

## スクリーンショット
[あれば添付]

## チェックリスト
- [ ] コードがコーディング規約に従っている
- [ ] ドキュメントを更新した
- [ ] 既存の機能が壊れていない
- [ ] 自分でレビューした
```

## 📝 コーディング規約

### JavaScript

```javascript
// ✅ Good
class MyApp {
    constructor() {
        this.storageKey = 'myapp_data';  // キャメルケース
        this.state = {};
    }
    
    /**
     * データを保存する
     * @param {Object} data - 保存するデータ
     */
    saveData(data) {
        AppUtils.saveToStorage(this.storageKey, data);
    }
}

// ❌ Bad
class my_app {  // スネークケース避ける
    constructor() {
        this.StorageKey = 'data';  // 大文字で始めない
    }
    
    save(d) {  // 説明的な名前を使う
        localStorage.setItem(this.StorageKey, JSON.stringify(d));
    }
}
```

### HTML

```html
<!-- ✅ Good: セマンティックHTML -->
<header>
    <h1>タイトル</h1>
    <nav>
        <ul>
            <li><a href="#">リンク</a></li>
        </ul>
    </nav>
</header>

<main>
    <article>
        <h2>見出し</h2>
        <p>本文</p>
    </article>
</main>

<!-- ❌ Bad: div soup -->
<div class="header">
    <div class="title">タイトル</div>
    <div class="nav">
        <div class="link">リンク</div>
    </div>
</div>
```

### CSS

```css
/* ✅ Good: BEM命名規則 */
.card { }
.card__header { }
.card__body { }
.card--highlighted { }

/* ✅ Good: CSS変数 */
:root {
    --primary-color: #007bff;
    --spacing-unit: 1rem;
}

.button {
    background-color: var(--primary-color);
    padding: var(--spacing-unit);
}

/* ❌ Bad: 深いネスト */
.container .content .article .paragraph .link {
    /* 避ける（3階層まで） */
}
```

### ファイル構造

```
newapp/
├── index.html          # アプリのHTML
├── css/
│   └── style.css       # アプリのスタイル
└── js/
    └── app.js          # アプリのロジック
```

## 💬 コミットメッセージ

### フォーマット

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット（コード動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: ビルド、ツール関連

### 例

```bash
# 良い例
git commit -m "feat(notepad): add auto-save feature"
git commit -m "fix(timer): correct countdown calculation"
git commit -m "docs(readme): update installation guide"

# 悪い例
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### 詳細なコミット

```
feat(notepad): add auto-save feature

- Implement debounced auto-save (500ms)
- Add visual indicator for save status
- Store timestamp with data

Closes #123
```

## 🔍 プルリクエスト

### チェックリスト

プルリクエストを作成する前に:

- [ ] 最新の main ブランチと同期している
- [ ] コードがコーディング規約に従っている
- [ ] 新しいコードにコメントを追加した
- [ ] ドキュメントを更新した
- [ ] すべての機能が動作する
- [ ] ブラウザのコンソールエラーがない
- [ ] 既存の機能が壊れていない

### レビュー対応

- レビューコメントには丁寧に返信
- 提案を検討して実装または説明
- 変更を追加コミットで対応
- フォースプッシュは避ける

### マージ後

- ローカルブランチを削除

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 👀 レビュープロセス

### レビュー基準

- **機能性**: 正しく動作するか
- **コード品質**: 読みやすく保守しやすいか
- **パフォーマンス**: 効率的か
- **セキュリティ**: 脆弱性はないか
- **互換性**: 既存機能に影響ないか

### レビュー時間

- 小さな変更: 1-2日
- 中規模の変更: 3-5日
- 大きな変更: 1週間以上

## 🎓 学習リソース

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)

## 💡 ヒント

### 初めてのコントリビュート

- 小さな変更から始める（タイポ修正、ドキュメント改善など）
- わからないことは質問する
- 既存のコードを参考にする

### コミュニケーション

- Issueやプルリクエストで積極的にコミュニケーション
- 不明点は早めに質問
- 進捗を定期的に報告

### コードレビュー

- レビューを学びの機会として活用
- フィードバックを前向きに受け止める
- 他の人のプルリクエストもレビューしてみる

## 📞 サポート

質問や相談がある場合:

1. [FAQ](FAQ.md) を確認
2. [Issue](#) で質問
3. [Discussions](#) で議論

---

**あなたのコントリビュートを楽しみにしています！ 🎉**
