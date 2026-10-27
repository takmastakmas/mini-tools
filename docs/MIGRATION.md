# Migration Guide（マイグレーションガイド）

> 📌 **このガイドは過去（2026年1月1日）に完了したv1.x→v2.0移行の記録です。** 現在すべてのアプリはv2.0以降の構成に統一されており、これから新たに移行作業を行う対象はありません。過去の設計判断を振り返る参考資料として残しています。

このガイドでは、旧バージョン（v1.x）から新バージョン（v2.0）への移行方法を説明します。

## 📋 目次

- [概要](#概要)
- [主な変更点](#主な変更点)
- [移行前の準備](#移行前の準備)
- [段階的移行手順](#段階的移行手順)
- [Breaking Changes](#breaking-changes)
- [データの移行](#データの移行)
- [トラブルシューティング](#トラブルシューティング)

## 🎯 概要

### なぜ移行が必要か

v2.0では、以下の大幅な改善が行われています:

| 項目 | v1.x | v2.0 | 改善 |
|------|------|------|------|
| index.html行数 | 122行 | 36行 | **-70%** |
| コード重複 | 多数 | ほぼゼロ | **-90%+** |
| アーキテクチャ | 手続き型 | クラスベース | **改善** |
| 保守性 | 低 | 高 | **⬆⬆** |
| テスト容易性 | 困難 | 容易 | **改善** |

### 移行にかかる時間

- **小規模カスタマイズ**: 1-2時間
- **中規模カスタマイズ**: 半日
- **大規模カスタマイズ**: 1-2日

## 🔄 主な変更点

### 1. ファイル構造の変更

#### Before (v1.x)
```
tools/
├── index.html (122行 - JS埋め込み)
├── css/
│   ├── style.css
│   └── shared.css
└── simplenotepad/
    ├── index.html
    ├── css/style.css
    └── js/script.js (220行 - 手続き型)
```

#### After (v2.0)
```
tools_refactored/
├── index.html (36行 - シンプル)
├── css/
│   ├── style.css
│   └── shared.css
├── js/ ⭐ NEW
│   ├── config.js (データ層)
│   ├── main.js (ロジック層)
│   └── utils.js (ユーティリティ)
└── simplenotepad/
    ├── index.html
    ├── css/style.css
    └── js/notepad.js (205行 - クラスベース)
```

### 2. コード構造の変更

#### Before: HTMLにJS埋め込み
```html
<script>
    const appCollections = [
      { name: 'アプリ1', path: 'app1/' },
      { name: 'アプリ2', path: 'app2/' }
    ];

    function createCard(app) {
        // 100行以上のコード...
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // 初期化処理...
    });
</script>
```

#### After: 外部ファイルに分離
```html
<script src="js/config.js"></script>
<script src="js/main.js"></script>
```

```javascript
// config.js - データのみ
const appConfig = {
  collections: [...]
};

// main.js - ロジックのみ
class AppCatalog {
  constructor(config) { ... }
  init() { ... }
}
```

### 3. アプリの実装方法の変更

#### Before: 手続き型
```javascript
// script.js
let title = '';
let content = '';

const titleInput = document.getElementById('title');
const contentTextarea = document.getElementById('content');

function saveToStorage() {
    localStorage.setItem('title', title);
    localStorage.setItem('content', content);
}

function loadFromStorage() {
    title = localStorage.getItem('title') || '';
    content = localStorage.getItem('content') || '';
}

titleInput.addEventListener('input', (e) => {
    title = e.target.value;
    saveToStorage();
});
```

#### After: クラスベース
```javascript
// notepad.js
class SimpleNotepad {
    constructor() {
        this.storageKey = 'notepad_data';
        this.elements = {};
        this.init();
    }
    
    init() {
        this.initElements();
        this.loadFromStorage();
        this.attachEventListeners();
    }
    
    initElements() {
        this.elements = {
            title: document.getElementById('title'),
            content: document.getElementById('content')
        };
    }
    
    attachEventListeners() {
        this.elements.title?.addEventListener('input', 
            AppUtils.debounce(() => this.saveToStorage(), 500)
        );
    }
    
    saveToStorage() {
        const data = {
            title: this.elements.title.value,
            content: this.elements.content.value
        };
        AppUtils.saveToStorage(this.storageKey, data);
    }
    
    loadFromStorage() {
        const data = AppUtils.loadFromStorage(this.storageKey);
        if (data) {
            this.elements.title.value = data.title || '';
            this.elements.content.value = data.content || '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimpleNotepad();
});
```

## 📝 移行前の準備

### 1. バックアップの作成

```bash
# プロジェクト全体をバックアップ
cp -r tools/ tools_backup_$(date +%Y%m%d)

# または、Gitでコミット
git add .
git commit -m "Backup before migration to v2.0"
git tag v1.x-backup
```

### 2. 現在のカスタマイズを文書化

```markdown
## カスタマイズ一覧

1. アプリ追加
   - アプリ名: カスタムアプリ
   - ファイル: customapp/
   - 機能: ...

2. スタイル変更
   - ファイル: css/style.css
   - 変更内容: ...

3. 機能追加
   - ファイル: ...
   - 内容: ...
```

### 3. データのエクスポート

重要なデータをエクスポート:

```javascript
// ブラウザのコンソールで実行
const allData = {};
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    allData[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(allData, null, 2));
// コピーしてファイルに保存
```

## 🚀 段階的移行手順

### フェーズ1: 新バージョンのセットアップ

```bash
# 1. 新バージョンをダウンロード
unzip tools_refactored.zip

# 2. 別ディレクトリに配置
mv tools_refactored tools_v2

# 3. 動作確認
cd tools_v2
python -m http.server 8000
# http://localhost:8000 でアクセス
```

### フェーズ2: カスタムアプリの移行

#### ステップ1: ファイル構造を作成

```bash
# 旧プロジェクトからコピー
cd tools_v2
cp -r ../tools/customapp ./

# 新構造に整理
mkdir -p customapp/{css,js}
mv customapp/style.css customapp/css/
mv customapp/script.js customapp/js/app.js
```

#### ステップ2: クラスベースに書き換え

**旧コード（手続き型）:**
```javascript
// customapp/script.js
let data = [];

function init() {
    loadData();
    setupEventListeners();
}

function loadData() {
    const saved = localStorage.getItem('customapp_data');
    data = saved ? JSON.parse(saved) : [];
}

function saveData() {
    localStorage.setItem('customapp_data', JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', init);
```

**新コード（クラスベース）:**
```javascript
// customapp/js/app.js
class CustomApp {
    constructor() {
        this.storageKey = 'customapp_data';
        this.state = {
            data: []
        };
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.attachEventListeners();
    }
    
    loadFromStorage() {
        this.state.data = AppUtils.loadFromStorage(this.storageKey) || [];
    }
    
    saveToStorage() {
        AppUtils.saveToStorage(this.storageKey, this.state.data);
    }
    
    attachEventListeners() {
        // イベントリスナー設定
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CustomApp();
});
```

#### ステップ3: config.js に追加

```javascript
// js/config.js
const appConfig = {
  collections: [
    {
      id: 'custom',
      title: 'カスタムアプリ',
      subcategories: [
        {
          name: 'マイアプリ',
          apps: [
            {
              name: 'カスタムアプリ',
              description: 'カスタマイズしたアプリ',
              path: 'customapp/',
              icon: '🔧'
            }
          ]
        }
      ]
    }
  ]
};
```

### フェーズ3: スタイルの移行

```css
/* 旧: style.css（グローバルに影響） */
.button {
    background: blue;
}

/* 新: customapp/css/style.css（スコープ制限） */
.customapp .button {
    background: blue;
}

/* または、CSS変数を活用 */
:root {
    --custom-primary: blue;
}

.customapp .button {
    background: var(--custom-primary);
}
```

### フェーズ4: データの移行

```javascript
// データ構造の変更がある場合は、移行スクリプトを作成
class DataMigrator {
    static migrateV1ToV2(oldData) {
        // v1.x のデータ構造
        // { title: '...', content: '...' }
        
        // v2.0 のデータ構造に変換
        // { version: 2, data: { title: '...', content: '...' }, timestamp: ... }
        
        return {
            version: 2,
            data: oldData,
            timestamp: Date.now(),
            migrated: true
        };
    }
    
    static autoMigrate(storageKey) {
        const oldData = localStorage.getItem(storageKey);
        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);
                
                // バージョンチェック
                if (!parsed.version || parsed.version === 1) {
                    const newData = this.migrateV1ToV2(parsed);
                    AppUtils.saveToStorage(storageKey, newData);
                    console.log('Data migrated successfully');
                }
            } catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }
}

// 使用例
document.addEventListener('DOMContentLoaded', () => {
    DataMigrator.autoMigrate('customapp_data');
    new CustomApp();
});
```

### フェーズ5: テストと検証

```markdown
## テストチェックリスト

- [ ] すべてのアプリが表示される
- [ ] カスタムアプリが正常に起動する
- [ ] データの保存・読み込みが動作する
- [ ] スタイルが正しく適用される
- [ ] ブラウザのコンソールにエラーがない
- [ ] レスポンシブデザインが維持されている
- [ ] ローカルストレージのデータが移行されている
```

## ⚠️ Breaking Changes

### 1. グローバル変数の変更

```javascript
// ❌ v1.x で動作していたコード
window.myGlobalVar = 'value';

// ✅ v2.0 での対応
class MyApp {
    constructor() {
        this.myVar = 'value'; // クラス内で管理
    }
}
```

### 2. LocalStorageのキー名変更

```javascript
// v1.x
localStorage.setItem('title', value);

// v2.0（プレフィックス付き）
AppUtils.saveToStorage('app_title', value);
// 内部的には 'webapps_app_title' として保存
```

**マイグレーション:**
```javascript
// 古いキーから新しいキーへコピー
const oldValue = localStorage.getItem('title');
if (oldValue) {
    AppUtils.saveToStorage('app_title', oldValue);
    localStorage.removeItem('title'); // 旧キーを削除
}
```

### 3. イベントハンドラーの変更

```javascript
// v1.x
button.onclick = function() { ... };

// v2.0
button.addEventListener('click', () => { ... });
```

### 4. 共通関数の名前空間

```javascript
// v1.x
function copyToClipboard(text) { ... }

// v2.0
AppUtils.copyToClipboard(text);
```

## 💾 データの移行

### LocalStorageデータの確認

```javascript
// ブラウザコンソールで実行
console.table(
    Object.keys(localStorage).map(key => ({
        key,
        value: localStorage.getItem(key)
    }))
);
```

### 一括移行スクリプト

```javascript
// migration.js
class BulkMigration {
    static run() {
        const migrations = [
            { old: 'title', new: 'notepad_title' },
            { old: 'content', new: 'notepad_content' },
            { old: 'timer_end', new: 'timer_endTime' }
        ];
        
        migrations.forEach(({ old, new: newKey }) => {
            const value = localStorage.getItem(old);
            if (value) {
                AppUtils.saveToStorage(newKey, value);
                localStorage.removeItem(old);
                console.log(`Migrated: ${old} → ${newKey}`);
            }
        });
        
        console.log('Migration completed!');
    }
}

// 実行
BulkMigration.run();
```

## 🔧 トラブルシューティング

### 問題1: アプリが表示されない

**原因:** `config.js` に追加していない

**解決策:**
```javascript
// js/config.js にアプリ情報を追加
{
  name: 'アプリ名',
  description: '説明',
  path: 'appname/'
}
```

### 問題2: データが読み込めない

**原因:** ストレージキーの変更

**解決策:**
```javascript
// 旧キーから読み込んで新キーで保存
const oldData = localStorage.getItem('old_key');
if (oldData && !AppUtils.loadFromStorage('new_key')) {
    AppUtils.saveToStorage('new_key', JSON.parse(oldData));
}
```

### 問題3: スタイルが崩れる

**原因:** CSS変数が定義されていない

**解決策:**
```css
/* shared.css または app/css/style.css に追加 */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
}
```

### 問題4: エラー「AppUtils is not defined」

**原因:** `utils.js` が読み込まれていない

**解決策:**
```html
<!-- HTMLに追加 -->
<script src="../js/utils.js"></script>
<script src="js/app.js"></script>
```

## ✅ 移行完了チェックリスト

```markdown
## 移行完了確認

### コード
- [ ] すべてのアプリがクラスベースになっている
- [ ] グローバル変数が削除されている
- [ ] 共通機能がAppUtilsを使用している
- [ ] config.jsにすべてのアプリが登録されている

### 機能
- [ ] すべてのアプリが正常に動作する
- [ ] データの保存・読み込みが機能する
- [ ] エラーが発生しない

### ドキュメント
- [ ] カスタマイズ内容を文書化している
- [ ] 移行手順を記録している

### クリーンアップ
- [ ] 旧ファイルを削除またはアーカイブ
- [ ] バックアップを保存
- [ ] 不要なコードを削除
```

## 📚 参考資料

- [Development Guide](DEVELOPMENT.md) - 開発ガイド
- [Architecture](ARCHITECTURE.md) - アーキテクチャ設計
- [CHANGELOG](../CHANGELOG.md) - 変更履歴

## 🆘 サポート

移行で問題が発生した場合:

1. [FAQ](FAQ.md) を確認
2. [Issue Tracker](#) で検索
3. 新しいIssueを作成

---

**移行成功を祈ります！ 🚀**
