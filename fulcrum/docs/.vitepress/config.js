import { defineConfig } from "vitepress";

// 站点与主题配置（JS 版本）
export default defineConfig({
  lang: "zh-CN",
  title: "Fulcrum 博客",
  description: "记录与分享前端、工程效率与学习笔记",
  head: [
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
    ],
    ["meta", { name: "theme-color", content: "#2e7ad3" }],
    // 站点 favicon（同时也可供部分平台作为 logo 使用）
    ["link", { rel: "icon", href: "/cobra.ico" }],
  ],
  lastUpdated: true,
  // GitHub Pages 上使用 with-subfolders 可减少直链 404（目录索引）
  cleanUrls: "with-subfolders",
  // 不将图片资源目录当作文档页面处理
  srcExclude: [
    // 排除任意 blogs/posts 下的 resources 子目录
    "**/blogs/resources/**",
    // 以及直接位于 博客/resources 下的所有内容
    "blogs/resources/**",
  ],
  // 构建期暂时忽略死链，后续可逐步修复或缩小忽略范围
  ignoreDeadLinks: true,

  themeConfig: {
    logo: { src: "public/cobra.ico"},
    outline: [2, 4],
    nav: [
      { text: "首页", link: "/" },
      { text: "博客", link: "/blogs/" },
      { text: "简历", link: "/resume" },
      { text: "关于", link: "/about" },
    ],
    sidebar: {
      "/blogs/": [
        {
          text: "博客",
          items: [{ text: "文章列表", link: "/blogs/" }],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/AFulcrum/AFulcrum.github.io",
      },
    ],
    footer: {
      message: "基于 VitePress 构建",
      copyright: `© ${new Date().getFullYear()} Fulcrum`,
    },
    // 搜索：alpha.28 内置本地搜索尚不稳定，可后续接入 Algolia DocSearch
    // search: { provider: 'local' },
    editLink: {
      pattern:
        "https://github.com/AFulcrum/AFulcrum.github.io/edit/main/fulcrum/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
  },
  // 统一代码块语言映射，避免 Shiki 未注册语言报错
  markdown: {
    config: (md) => {
      const alias = {
        markdwon: "markdown",
        Markdwon: "markdown",
        md: "markdown",
        yml: "yaml",
        "application.yml": "yaml",
        "application.yaml": "yaml",
        "application.properties": "ini",
        properties: "ini",
        ini: "ini",
        "c++": "cpp",
        cpp: "cpp",
        mysql: "sql",
        csv: "text",
        none: "text",
      };
      const original = md.options.highlight;
      md.options.highlight = (code, lang, attrs) => {
        const raw = (lang || "").trim();
        const lw = raw.toLowerCase();
        const mapped = alias[lw] || lw || "text";
        const safeAttrs = typeof attrs === "string" ? attrs : "";
        return original ? original(code, mapped, safeAttrs) : "";
      };
    },
  },
});
