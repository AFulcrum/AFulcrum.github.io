// 文章加载器 - 动态读取Document文件夹内容
class ArticleLoader {
  constructor() {
    this.baseUrl = "./Document/";
    this.articles = new Map();
    this.categories = ["Blender", "Obsidian"];
  }

  async loadArticleContent(category, filename) {
    const cacheKey = `${category}/${filename}`;

    if (this.articles.has(cacheKey)) {
      return this.articles.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}${category}/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      this.articles.set(cacheKey, content);
      return content;
    } catch (error) {
      console.warn(`无法加载文章 ${cacheKey}:`, error);
      return this.getFallbackContent(filename);
    }
  }

  getFallbackContent(filename) {
    return `# ${filename.replace(".md", "")}

抱歉，无法加载此文章内容。

这可能是因为：
1. 文件不存在
2. 网络连接问题  
3. 服务器配置问题

请稍后重试或联系管理员。`;
  }

  async getArticleList(category) {
    // 返回指定分类下的所有文章列表
    const articleLists = {
      Blender: ["Blender基础.md"],
      Obsidian: ["Dataview.md", "markdown基础语法.md", "数学块.md"],
    };

    return articleLists[category] || [];
  }

  getAllCategories() {
    return this.categories;
  }
}

// 导出给主应用使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = ArticleLoader;
}
