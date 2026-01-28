// article.js - 单篇文章页面
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // 加载文章数据
        const response = await fetch('articles.json');
        const data = await response.json();
        const article = data.articles.find(a => a.id == articleId);
        
        if (!article) {
            document.getElementById('article-content').innerHTML = `
                <div class="no-posts-message">
                    <h3>文章不存在</h3>
                    <p>抱歉，找不到这篇文章。</p>
                    <a href="index.html" class="action-button">返回首页</a>
                </div>
            `;
            return;
        }
        
        // 渲染文章
        renderArticle(article);
        
    } catch (error) {
        console.error('加载文章失败:', error);
    }
});

function renderArticle(article) {
    const container = document.getElementById('article-content');
    
    // 如果有单独的MD文件，加载它
    if (article.file) {
        fetch(article.file)
            .then(response => response.text())
            .then(markdown => {
                container.innerHTML = createArticleHTML(article, markdown);
            })
            .catch(() => {
                // 如果文件加载失败，使用JSON中的content
                container.innerHTML = createArticleHTML(article, article.content);
            });
    } else {
        container.innerHTML = createArticleHTML(article, article.content);
    }
}

function createArticleHTML(article, content) {
    return `
        <article class="article-post">
            <header class="post-header">
                <h1 class="post-title">${article.title}</h1>
                <div class="post-meta">
                    <span class="post-date">
                        <i class="far fa-calendar"></i> ${formatDate(article.date)}
                    </span>
                    <span class="post-category">
                        <i class="fas fa-folder"></i> ${article.category}
                    </span>
                    <span class="post-readtime">
                        <i class="far fa-clock"></i> ${article.readTime}
                    </span>
                </div>
            </header>
            <div class="post-content article-content">
                ${marked.parse(content)}
            </div>
            <div class="post-footer">
                <div class="post-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="index.html" class="read-more">
                    <i class="fas fa-arrow-left"></i> 返回文章列表
                </a>
            </div>
        </article>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
