// メインページのロジック
class AppCatalog {
  constructor(config) {
    this.config = config;
  }

  /**
   * カードHTMLを生成
   */
  createCard(app) {
    const card = document.createElement('a');
    card.href = `${app.path}index.html`;
    card.className = 'card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    
    card.innerHTML = `
      <h3>${this.escapeHtml(app.name)}</h3>
      <p>${this.escapeHtml(app.description)}</p>
    `;
    
    return card;
  }

  /**
   * サブカテゴリブロックを生成
   */
  createSubcategoryBlock(subcategory) {
    const block = document.createElement('div');
    block.className = 'subcategory-block';

    const title = document.createElement('h3');
    title.textContent = subcategory.name;
    title.className = 'subcategory-title';
    block.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    
    subcategory.apps.forEach(app => {
      grid.appendChild(this.createCard(app));
    });
    
    block.appendChild(grid);
    return block;
  }

  /**
   * アプリコレクションをレンダリング
   */
  renderCollections() {
    this.config.collections.forEach(collection => {
      const section = document.querySelector(`#${collection.id}`);
      if (!section) return;
      
      collection.subcategories.forEach(subcategory => {
        section.appendChild(this.createSubcategoryBlock(subcategory));
      });
    });
  }

  /**
   * 特別なコレクション（iPad Appsなど）をレンダリング
   */
  renderSpecialCollections() {
    const section = document.querySelector('#app-collections');
    if (!section) return;

    const grid = section.querySelector('.card-grid') || this.createGridElement();
    
    this.config.specialCollections.forEach(collection => {
      const card = document.createElement('a');
      card.href = collection.path;
      card.className = 'card';
      
      card.innerHTML = `
        <h3>${this.escapeHtml(collection.name)}</h3>
        <p>${this.escapeHtml(collection.description)}</p>
      `;
      
      grid.appendChild(card);
    });

    if (!section.querySelector('.card-grid')) {
      section.appendChild(grid);
    }
  }

  /**
   * グリッド要素を作成
   */
  createGridElement() {
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    return grid;
  }

  /**
   * HTMLエスケープ処理
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 初期化処理
   */
  init() {
    this.renderCollections();
    this.renderSpecialCollections();
  }
}

// DOMロード完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  const catalog = new AppCatalog(appConfig);
  catalog.init();
});
