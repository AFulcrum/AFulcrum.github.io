# AFulcrum's Terminal Blog

一个独特的终端风格博客，使用 Linux 命令来浏览文章内容。

## 🚀 特性

- **终端界面**: 完全模拟 Linux 终端的外观和体验
- **命令行操作**: 使用熟悉的 Linux 命令浏览博客
- **响应式设计**: 支持桌面端和移动端
- **Markdown 支持**: 文章使用 Markdown 格式编写
- **实时搜索**: 支持文件名和内容搜索
- **命令历史**: 支持上下键浏览命令历史
- **自动补全**: Tab 键自动补全命令和文件名

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **样式**: 自定义 CSS，终端主题
- **文章格式**: Markdown
- **部署**: GitHub Pages

## 📁 项目结构

```
AFulcrum.github.io/
├── index.html              # 主页面
├── css/
│   └── index.css           # 样式文件
├── js/
│   ├── index.js            # 主要功能
│   └── articleLoader.js    # 文章加载器
├── Document/               # 文章目录
│   ├── Blender/           # Blender相关文章
│   └── Obsidian/          # Obsidian相关文章
├── config.json            # 博客配置
└── README.md              # 项目说明
```

## 🎮 使用指南

### 基本命令

| 命令            | 描述           | 示例                  |
| --------------- | -------------- | --------------------- |
| `help`          | 显示帮助信息   | `help`                |
| `ls [目录]`     | 列出文件和目录 | `ls`, `ls Document`   |
| `cd [目录]`     | 切换目录       | `cd Document/Blender` |
| `cat [文件]`    | 查看文件内容   | `cat Blender基础.md`  |
| `pwd`           | 显示当前路径   | `pwd`                 |
| `tree`          | 显示目录树结构 | `tree`                |
| `find [关键词]` | 搜索文件       | `find blender`        |
| `grep [关键词]` | 搜索文章内容   | `grep 教程`           |
| `clear`         | 清空终端       | `clear`               |

### 快捷键

- **↑/↓**: 浏览命令历史
- **Tab**: 自动补全命令
- **Enter**: 执行命令

### 使用示例

```bash
# 查看所有可用命令
help

# 列出根目录内容
ls

# 进入Document目录
cd Document

# 查看Blender目录
ls Blender

# 阅读Blender基础教程
cd Blender
cat Blender基础.md

# 搜索包含"markdown"的文件
find markdown

# 返回根目录
cd ~

# 查看目录树结构
tree
```

## 📝 添加新文章

1. 在 `Document/` 目录下创建或选择分类文件夹
2. 添加 Markdown 格式的文章文件
3. 更新 `js/articleLoader.js` 中的文章列表
4. 文章将自动在博客中可见

### 文章格式要求

- 使用 `.md` 扩展名
- 支持标准 Markdown 语法
- 建议包含标题和清晰的章节结构

## 🎨 自定义主题

编辑 `css/index.css` 文件可以自定义：

- 终端背景色
- 文字颜色
- 光标样式
- 字体设置

编辑 `config.json` 可以配置：

- 博客标题和描述
- 命令列表
- 主题色彩
- 功能开关

## 🚀 部署

### GitHub Pages 部署

1. Fork 此仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 访问 `https://yourusername.github.io/AFulcrum.github.io`

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/AFulcrum/AFulcrum.github.io.git

# 进入项目目录
cd AFulcrum.github.io

# 使用本地服务器启动
# 方法1：使用Python
python -m http.server 8000

# 方法2：使用Node.js
npx http-server

# 访问 http://localhost:8000
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

此项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **作者**: AFulcrum
- **GitHub**: [@AFulcrum](https://github.com/AFulcrum)
- **博客**: [AFulcrum.github.io](https://afulcrum.github.io)

## 🙏 致谢

- 灵感来源于经典的 Linux 终端界面
- 感谢开源社区的贡献
- 特别感谢 Markdown 和 Web 技术的发展

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！

站点: [https://afulcrum.github.io/](https://afulcrum.github.io/)
