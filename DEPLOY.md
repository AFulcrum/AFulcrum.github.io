# AFulcrum 终端博客部署脚本

## 本地开发服务器

### 使用 Python

```bash
cd AFulcrum.github.io
python -m http.server 8000
# 访问 http://localhost:8000
```

### 使用 Node.js

```bash
npx http-server AFulcrum.github.io
# 访问 http://localhost:8080
```

### 使用 Live Server (VS Code 扩展)

在 VS Code 中右键 index.html -> "Open with Live Server"

## GitHub Pages 部署

1. 提交所有更改到 GitHub 仓库

```bash
git add .
git commit -m "优化终端博客设计和功能"
git push origin main
```

2. 在 GitHub 仓库设置中启用 Pages

   - 进入仓库 Settings -> Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - 文件夹选择 "/ (root)"

3. 等待几分钟后访问：https://afulcrum.github.io

## 添加新文章

1. 在 `Document/` 目录下创建分类文件夹
2. 添加 `.md` 格式的文章文件
3. 更新 `js/articleLoader.js` 中的文章列表
4. 重新部署

## 自定义配置

### 修改主题色彩

编辑 `css/index.css` 中的 CSS 变量：

```css
:root {
  --primary-green: #00ff41;
  --blue: #58a6ff;
  --yellow: #f1e05a;
  /* ... */
}
```

### 添加新命令

在 `js/index.js` 的 `commands` 对象中添加：

```javascript
newcommand: { desc: '新命令描述', usage: 'newcommand [参数]' }
```

然后在 `executeCommand` 方法中添加对应的 case。

### 修改欢迎信息

编辑 `index.html` 中的 `.welcome-message` 部分。

## 维护建议

1. 定期更新文章内容
2. 检查响应式设计在不同设备上的表现
3. 优化加载速度和性能
4. 收集用户反馈进行改进

## 故障排除

### 文章无法加载

- 检查文件路径是否正确
- 确认文件名和扩展名匹配
- 检查服务器配置

### 样式异常

- 清除浏览器缓存
- 检查 CSS 文件是否正确加载
- 验证 CSS 语法

### 命令不工作

- 检查 JavaScript 控制台错误
- 确认命令拼写正确
- 验证 JavaScript 逻辑
