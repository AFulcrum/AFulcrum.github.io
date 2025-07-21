// 终端博客交互功能
class TerminalBlog {
  constructor() {
    this.commandInput = document.querySelector(".command-input");
    this.terminalBody = document.querySelector(".terminal-body");
    this.posts = {
      "vue-learning": {
        title: "Vue学习笔记",
        content: `
# Vue.js 学习心得

## 什么是Vue.js？
Vue.js是一个用于构建用户界面的渐进式JavaScript框架。它的核心库只关注视图层。

## 核心特性
- **响应式数据绑定**: 数据变化时，视图自动更新
- **组件化开发**: 可复用的UI组件
- **虚拟DOM**: 提高渲染性能
- **指令系统**: v-if、v-for、v-model等

## 示例代码
\`\`\`javascript
new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!'
    },
    methods: {
        greet() {
            alert(this.message);
        }
    }
});
\`\`\`

## 学习感悟
Vue.js的设计理念让前端开发变得更加优雅和高效。通过数据驱动的方式，我们可以专注于业务逻辑而不是DOM操作。
                `,
      },
      "web-dev": {
        title: "前端开发心得",
        content: `
# 前端开发心得体会

## 技术栈的选择
在现代前端开发中，选择合适的技术栈至关重要：

### 基础技术
- **HTML5**: 语义化标签，提升可访问性
- **CSS3**: Flexbox、Grid布局，动画效果
- **JavaScript ES6+**: 箭头函数、模块化、异步编程

### 框架选择
- **React**: 组件化思维，生态丰富
- **Vue**: 渐进式框架，学习曲线平缓
- **Angular**: 企业级应用，功能完整

## 开发经验
1. **代码规范**: 使用ESLint、Prettier保持代码一致性
2. **版本控制**: Git工作流程的重要性
3. **性能优化**: 代码分割、懒加载、图片优化
4. **测试驱动**: 单元测试、集成测试的必要性

## 未来展望
前端技术发展迅速，保持学习热情和技术敏感度是关键。
                `,
      },
      "coding-tips": {
        title: "编程技巧分享",
        content: `
# 编程技巧分享

## 代码质量提升
好的代码应该具备以下特质：

### 可读性
- 有意义的变量命名
- 适当的注释
- 合理的代码结构

### 可维护性
- 单一职责原则
- 避免重复代码
- 模块化设计

## 调试技巧
1. **console.log()**: 最简单的调试方法
2. **浏览器开发者工具**: 断点调试
3. **单元测试**: 预防Bug的最佳方式

## 性能优化
- 避免不必要的重渲染
- 使用适当的数据结构
- 异步操作的合理使用

## 学习建议
- 多读优秀的开源代码
- 参与开源项目
- 保持编程练习的习惯
                `,
      },
    };

    this.commandHistory = [];
    this.historyIndex = -1;

    this.initEventListeners();
    this.typeWelcomeMessage();
  }

  initEventListeners() {
    // 命令输入事件
    this.commandInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.executeCommand(this.commandInput.value.trim());
        this.commandInput.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory("down");
      }
    });

    // 文件名点击事件
    document.querySelectorAll(".filename").forEach((filename) => {
      filename.addEventListener("click", () => {
        const postId = filename.dataset.post;
        this.showPost(postId);
      });
    });

    // 点击终端聚焦输入框
    this.terminalBody.addEventListener("click", () => {
      this.commandInput.focus();
    });

    // 页面加载时聚焦输入框
    this.commandInput.focus();
  }

  typeWelcomeMessage() {
    // 模拟打字效果已经在CSS中实现
    setTimeout(() => {
      document.querySelector(".typing-animation").style.borderRight = "none";
    }, 4000);
  }

  executeCommand(command) {
    // 添加到历史记录
    if (command) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
    }

    // 隐藏所有内容区域
    this.hideAllContent();

    // 解析命令
    const parts = command.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        this.showHelp();
        break;
      case "ls":
        this.listFiles();
        break;
      case "cat":
        if (args.length > 0) {
          const filename = args[0];
          const postId = this.getPostIdFromFilename(filename);
          if (postId) {
            this.showPost(postId, `cat ${filename}`);
          } else {
            this.showError(`文件不存在: ${filename}`);
          }
        } else {
          this.showError("cat: 缺少文件名");
        }
        break;
      case "clear":
        this.clearTerminal();
        break;
      case "about":
        this.showAbout();
        break;
      case "contact":
        this.showContact();
        break;
      case "":
        // 空命令，不做任何操作
        break;
      default:
        this.showError(`命令未找到: ${cmd}。输入 'help' 查看可用命令。`);
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === "up" && this.historyIndex > 0) {
      this.historyIndex--;
    } else if (
      direction === "down" &&
      this.historyIndex < this.commandHistory.length - 1
    ) {
      this.historyIndex++;
    } else if (
      direction === "down" &&
      this.historyIndex === this.commandHistory.length - 1
    ) {
      this.historyIndex = this.commandHistory.length;
      this.commandInput.value = "";
      return;
    }

    if (
      this.historyIndex >= 0 &&
      this.historyIndex < this.commandHistory.length
    ) {
      this.commandInput.value = this.commandHistory[this.historyIndex];
    }
  }

  hideAllContent() {
    document.getElementById("post-content").style.display = "none";
    document.getElementById("help-content").style.display = "none";
    document.getElementById("about-content").style.display = "none";
    document.getElementById("contact-content").style.display = "none";
  }

  showPost(postId, command = null) {
    const post = this.posts[postId];
    if (!post) return;

    const postContent = document.getElementById("post-content");
    const currentCommand = document.getElementById("current-command");
    const postText = document.getElementById("post-text");

    currentCommand.textContent =
      command || `cat ${this.getFilenameFromPostId(postId)}`;
    postText.innerHTML = this.formatPostContent(post.content);
    postContent.style.display = "block";

    // 滚动到内容区域
    postContent.scrollIntoView({ behavior: "smooth" });
  }

  showHelp() {
    document.getElementById("help-content").style.display = "block";
    document
      .getElementById("help-content")
      .scrollIntoView({ behavior: "smooth" });
  }

  showAbout() {
    document.getElementById("about-content").style.display = "block";
    document
      .getElementById("about-content")
      .scrollIntoView({ behavior: "smooth" });
  }

  showContact() {
    document.getElementById("contact-content").style.display = "block";
    document
      .getElementById("contact-content")
      .scrollIntoView({ behavior: "smooth" });
  }

  listFiles() {
    // 滚动到文件列表
    document
      .querySelector(".posts-section")
      .scrollIntoView({ behavior: "smooth" });
  }

  clearTerminal() {
    // 隐藏所有内容，只显示基本的终端界面
    this.hideAllContent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "terminal-line";
    errorDiv.innerHTML = `
            <span class="prompt">visitor@AFulcrum-blog:~$</span>
            <span class="command" style="color: #ff5555;">${message}</span>
        `;

    const commandSection = document.querySelector(".command-section");
    commandSection.parentNode.insertBefore(errorDiv, commandSection);

    // 5秒后移除错误信息
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  formatPostContent(content) {
    // 简单的Markdown渲染
    return content
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/^\- (.*$)/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(?!<[h|u|p|l])/gm, "<p>")
      .replace(/(?![h|u|p|l]>)$/gm, "</p>");
  }

  getPostIdFromFilename(filename) {
    const mapping = {
      "vue_学习笔记.md": "vue-learning",
      "前端开发心得.md": "web-dev",
      "编程技巧分享.md": "coding-tips",
    };
    return mapping[filename];
  }

  getFilenameFromPostId(postId) {
    const mapping = {
      "vue-learning": "vue_学习笔记.md",
      "web-dev": "前端开发心得.md",
      "coding-tips": "编程技巧分享.md",
    };
    return mapping[postId];
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  new TerminalBlog();

  // 添加一些终端效果
  const addMatrixEffect = () => {
    const chars = "0123456789ABCDEF";
    const terminalTitle = document.querySelector(".terminal-title");

    setInterval(() => {
      if (Math.random() < 0.1) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        const originalText = terminalTitle.textContent;
        terminalTitle.textContent = originalText.slice(0, -1) + randomChar;

        setTimeout(() => {
          terminalTitle.textContent = originalText;
        }, 100);
      }
    }, 2000);
  };

  addMatrixEffect();
});

// 键盘快捷键
document.addEventListener("keydown", (e) => {
  // Ctrl + L 清屏
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    document.querySelector(".command-input").value = "clear";
    document
      .querySelector(".command-input")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  }
});
