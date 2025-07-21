// Terminal Blog JavaScript - Enhanced
class TerminalBlog {
  constructor() {
    this.currentPath = "/";
    this.commandHistory = [];
    this.historyIndex = -1;
    this.articles = {};
    this.articleLoader = new ArticleLoader();
    this.sessionStartTime = Date.now();
    this.commandCount = 0;
    this.currentTheme = "green";
    this.suggestions = [];
    this.selectedSuggestion = -1;

    this.commands = {
      help: { desc: "显示帮助信息", usage: "help [command]" },
      ls: { desc: "列出目录内容", usage: "ls [directory]" },
      cd: { desc: "切换目录", usage: "cd <directory>" },
      cat: { desc: "查看文件内容", usage: "cat <filename>" },
      pwd: { desc: "显示当前路径", usage: "pwd" },
      tree: { desc: "显示目录树", usage: "tree" },
      find: { desc: "搜索文件", usage: "find <pattern>" },
      grep: { desc: "搜索内容", usage: "grep <pattern>" },
      articles: { desc: "显示文章列表", usage: "articles [category]" },
      clear: { desc: "清空终端", usage: "clear" },
      whoami: { desc: "显示用户信息", usage: "whoami" },
      date: { desc: "显示当前时间", usage: "date" },
      uname: { desc: "显示系统信息", usage: "uname" },
      history: { desc: "显示命令历史", usage: "history" },
      man: { desc: "显示命令手册", usage: "man <command>" },
      theme: { desc: "切换主题", usage: "theme <color>" },
      about: { desc: "关于博客", usage: "about" },
      contact: { desc: "联系信息", usage: "contact" },
      neofetch: { desc: "显示系统信息", usage: "neofetch" },
    };

    this.init();
    this.loadArticles();
    this.startSessionTimer();
  }

  init() {
    this.input = document.getElementById("commandInput");
    this.output = document.getElementById("output");
    this.suggestionsEl = document.getElementById("suggestions");
    this.sessionTimeEl = document.getElementById("session-time");
    this.commandCountEl = document.getElementById("command-count");
    this.currentPathEl = document.getElementById("current-path");

    // 事件监听
    this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.input.addEventListener("input", this.handleInput.bind(this));

    // 主题切换
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTheme(btn.dataset.theme);
      });
    });

    // 终端按钮功能
    document
      .querySelector(".btn.close")
      .addEventListener("click", this.closeTerminal.bind(this));
    document
      .querySelector(".btn.minimize")
      .addEventListener("click", this.minimizeTerminal.bind(this));
    document
      .querySelector(".btn.maximize")
      .addEventListener("click", this.maximizeTerminal.bind(this));

    // 聚焦输入框
    this.focusInput();
    document.addEventListener("click", (e) => {
      if (!this.suggestionsEl.contains(e.target)) {
        this.hideSuggestions();
        this.focusInput();
      }
    });

    // 欢迎消息
    this.showWelcomeMessage();
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.typeText("🚀 系统初始化完成...", "success", 50);
      setTimeout(() => {
        this.typeText("✨ 欢迎使用 AFulcrum 的终端博客!", "info", 40);
        setTimeout(() => {
          this.typeText(
            '💡 输入 "help" 查看可用命令，或 "neofetch" 查看系统信息',
            "info",
            30
          );
          setTimeout(() => {
            this.typeText(
              "🎯 尝试: ls Document 或 cat welcome.txt",
              "info",
              35
            );
          }, 1500);
        }, 1000);
      }, 800);
    }, 1000);
  }

  typeText(text, className = "", delay = 30) {
    const line = document.createElement("div");
    line.className = `output-line ${className}`;
    this.output.appendChild(line);

    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        line.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, delay + Math.random() * 20); // 添加随机延迟模拟真实打字

        // 添加视觉效果
        if (Math.random() > 0.8) {
          line.style.textShadow = `0 0 5px ${this.getColorForClass(className)}`;
          setTimeout(() => {
            line.style.textShadow = "";
          }, 100);
        }
      } else {
        // 打字完成后添加闪烁效果
        line.style.animation = "text-complete 0.3s ease-in-out";
      }
    };
    typeChar();

    this.scrollToBottom();
  }

  getColorForClass(className) {
    const colors = {
      success: "var(--secondary-green)",
      info: "var(--blue)",
      error: "var(--red)",
      warning: "var(--orange)",
    };
    return colors[className] || "var(--primary-green)";
  }

  startSessionTimer() {
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (elapsed % 60).toString().padStart(2, "0");
      if (this.sessionTimeEl) {
        this.sessionTimeEl.textContent = `${minutes}:${seconds}`;
      }
    }, 1000);
  }

  focusInput() {
    this.input.focus();
  }

  handleInput(e) {
    this.showSuggestions();
  }

  showSuggestions() {
    const input = this.input.value.toLowerCase().trim();
    if (!input) {
      this.hideSuggestions();
      return;
    }

    const commands = Object.keys(this.commands);
    const directories = ["Document", "Blender", "Obsidian"];
    const files = [
      "Blender基础.md",
      "Dataview.md",
      "markdown基础语法.md",
      "数学块.md",
    ];

    const allItems = [...commands, ...directories, ...files];
    this.suggestions = allItems
      .filter((item) => item.toLowerCase().includes(input))
      .slice(0, 8);

    if (this.suggestions.length > 0) {
      this.renderSuggestions();
    } else {
      this.hideSuggestions();
    }
  }

  renderSuggestions() {
    this.suggestionsEl.innerHTML = "";
    this.suggestions.forEach((suggestion, index) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      if (index === this.selectedSuggestion) {
        item.classList.add("selected");
      }

      const isCommand = this.commands[suggestion];
      if (isCommand) {
        item.innerHTML = `
                    <span class="command-name">${suggestion}</span>
                    <span class="command-desc">${isCommand.desc}</span>
                `;
      } else {
        item.innerHTML = `<span class="command-name">${suggestion}</span>`;
      }

      item.addEventListener("click", () => {
        this.input.value = suggestion;
        this.hideSuggestions();
        this.focusInput();
      });

      this.suggestionsEl.appendChild(item);
    });

    this.suggestionsEl.classList.add("show");
  }

  hideSuggestions() {
    this.suggestionsEl.classList.remove("show");
    this.selectedSuggestion = -1;
  }

  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return;

    if (direction === "up") {
      this.selectedSuggestion =
        this.selectedSuggestion <= 0
          ? this.suggestions.length - 1
          : this.selectedSuggestion - 1;
    } else {
      this.selectedSuggestion =
        this.selectedSuggestion >= this.suggestions.length - 1
          ? 0
          : this.selectedSuggestion + 1;
    }

    this.renderSuggestions();
  }

  selectSuggestion() {
    if (
      this.selectedSuggestion >= 0 &&
      this.suggestions[this.selectedSuggestion]
    ) {
      this.input.value = this.suggestions[this.selectedSuggestion];
      this.hideSuggestions();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.selectedSuggestion >= 0) {
        this.selectSuggestion();
      } else {
        this.executeCommand(this.input.value.trim());
        this.input.value = "";
        this.hideSuggestions();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.suggestionsEl.classList.contains("show")) {
        this.navigateSuggestions("up");
      } else {
        this.navigateHistory("up");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.suggestionsEl.classList.contains("show")) {
        this.navigateSuggestions("down");
      } else {
        this.navigateHistory("down");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (this.suggestions.length > 0) {
        this.input.value = this.suggestions[0];
        this.hideSuggestions();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.hideSuggestions();
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      this.addOutput("^C", "error");
      this.input.value = "";
      this.hideSuggestions();
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      this.clearScreen();
    }
  }

  navigateHistory(direction) {
    if (
      direction === "up" &&
      this.historyIndex < this.commandHistory.length - 1
    ) {
      this.historyIndex++;
      this.input.value =
        this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === "down" && this.historyIndex > 0) {
      this.historyIndex--;
      this.input.value =
        this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    } else if (direction === "down" && this.historyIndex === 0) {
      this.historyIndex = -1;
      this.input.value = "";
    }
  }

  switchTheme(theme) {
    const validThemes = ["green", "blue", "purple", "orange"];
    if (!validThemes.includes(theme)) {
      this.addOutput(`主题 "${theme}" 不存在`, "error");
      this.addOutput("可用主题: " + validThemes.join(", "), "info");
      return;
    }

    this.currentTheme = theme;

    // 更新CSS变量
    const root = document.documentElement;
    const themeColors = {
      green: {
        primary: "#00ff41",
        secondary: "#00cc33",
        accent: "#00aa22",
      },
      blue: {
        primary: "#00aaff",
        secondary: "#0088cc",
        accent: "#0066aa",
      },
      purple: {
        primary: "#aa55ff",
        secondary: "#8844cc",
        accent: "#6633aa",
      },
      orange: {
        primary: "#ff8800",
        secondary: "#cc6600",
        accent: "#aa4400",
      },
    };

    const colors = themeColors[theme];
    root.style.setProperty("--primary-green", colors.primary);
    root.style.setProperty("--secondary-green", colors.secondary);
    root.style.setProperty(
      "--shadow",
      colors.primary.replace("#", "rgba(") + ", 0.3)"
    );

    // 更新主题按钮状态
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`.theme-btn.${theme}`).classList.add("active");

    this.addOutput(`主题已切换到: ${theme}`, "success");
  }

  closeTerminal() {
    const confirmation = confirm("确定要关闭终端吗？");
    if (confirmation) {
      this.addOutput("终端正在关闭...", "warning");
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }

  minimizeTerminal() {
    const container = document.querySelector(".terminal-container");
    container.style.transform = "scale(0.8)";
    container.style.opacity = "0.7";
    this.addOutput("终端已最小化 (点击最大化按钮恢复)", "info");
  }

  maximizeTerminal() {
    const container = document.querySelector(".terminal-container");
    container.style.transform = "scale(1)";
    container.style.opacity = "1";
    this.addOutput("终端已恢复", "info");
  }

  executeCommand(command) {
    if (command) {
      this.commandHistory.unshift(command);
      this.historyIndex = -1;
      this.commandCount++;
      this.updateStatusBar();
    }

    this.addOutput(`AFulcrum@blog:${this.currentPath}$ ${command}`, "prompt");

    if (!command) return;

    const [cmd, ...args] = command.split(" ");
    const arg = args.join(" ");

    // 添加加载效果
    const loadingEl = this.addLoadingEffect();

    setTimeout(() => {
      this.removeLoadingEffect(loadingEl);

      switch (cmd.toLowerCase()) {
        case "help":
          this.showHelp(arg);
          break;
        case "ls":
          this.listDirectory(arg);
          break;
        case "cd":
          this.changeDirectory(arg);
          break;
        case "cat":
          this.showFile(arg);
          break;
        case "pwd":
          this.showCurrentPath();
          break;
        case "clear":
        case "cls":
          this.clearScreen();
          break;
        case "tree":
          this.showTree();
          break;
        case "find":
          this.findFiles(arg);
          break;
        case "grep":
          this.grepContent(arg);
          break;
        case "articles":
          this.showArticles(arg);
          break;
        case "history":
          this.showHistory();
          break;
        case "man":
          this.showManual(arg);
          break;
        case "theme":
          this.switchTheme(arg);
          break;
        case "about":
          this.showAbout();
          break;
        case "contact":
          this.showContact();
          break;
        case "neofetch":
          this.showNeofetch();
          break;
        case "whoami":
          this.addOutput("AFulcrum - Terminal Blog Creator", "info");
          break;
        case "date":
          this.addOutput(new Date().toLocaleString("zh-CN"), "info");
          break;
        case "uname":
          this.addOutput("Terminal Blog v2.0 (Enhanced)", "info");
          break;
        case "matrix":
          this.enterMatrixMode();
          break;
        case "easter":
          this.showEasterEgg();
          break;
        case "hack":
          this.showHackAnimation();
          break;
        case "particles":
          this.toggleParticles();
          break;
        case "rainbow":
          this.enableRainbowMode();
          break;
        case "exit":
        case "quit":
          this.showExitMessage();
          break;
        default:
          this.addOutput(`bash: ${cmd}: command not found`, "error");
          this.addOutput('输入 "help" 查看可用命令', "info");
      }
    }, Math.random() * 300 + 100); // 模拟真实的命令执行时间

    this.scrollToBottom();
  }

  addLoadingEffect() {
    const loading = document.createElement("div");
    loading.className = "output-line loading";
    loading.innerHTML = "<span>●</span><span>●</span><span>●</span>";
    this.output.appendChild(loading);
    this.scrollToBottom();
    return loading;
  }

  removeLoadingEffect(loadingEl) {
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }

  updateStatusBar() {
    if (this.commandCountEl) {
      this.commandCountEl.textContent = this.commandCount;
    }
    if (this.currentPathEl) {
      this.currentPathEl.textContent = this.currentPath;
    }
  }

  addOutput(text, className = "") {
    const line = document.createElement("div");
    line.className = `output-line ${className}`;
    line.innerHTML = text;
    this.output.appendChild(line);
  }

  scrollToBottom() {
    const terminal = document.getElementById("terminal");
    terminal.scrollTop = terminal.scrollHeight;
  }

  showHelp(specificCommand) {
    if (specificCommand && this.commands[specificCommand]) {
      const cmd = this.commands[specificCommand];
      const helpText = `
<div class="help-container">
  <div class="help-title">📖 ${specificCommand} - 命令详情</div>
  <div class="help-section">
    <div style="color: var(--blue); margin-bottom: 10px;"><strong>描述:</strong> ${
      cmd.desc
    }</div>
    <div style="color: var(--yellow); margin-bottom: 10px;"><strong>用法:</strong> ${
      cmd.usage
    }</div>
    <div style="color: var(--purple);"><strong>示例:</strong></div>
    <div style="color: var(--gray); margin-left: 20px; margin-top: 5px;">
      ${
        specificCommand === "cat"
          ? "cat Blender基础.md"
          : specificCommand === "cd"
          ? "cd Document/Blender"
          : specificCommand === "find"
          ? "find blender"
          : specificCommand === "grep"
          ? "grep 教程"
          : cmd.usage
      }
    </div>
  </div>
</div>
            `;
      this.addOutput(helpText, "info");
      return;
    }

    const helpText = `
<div class="help-container">
  <div class="help-title">📖 AFulcrum 终端博客 - 命令帮助</div>
  
  <div class="help-section">
    <div class="help-section-title">📁 文件操作</div>
    <div class="help-commands">
      <div class="help-command-item">
        <div class="help-command-name">ls [目录]</div>
        <div class="help-command-desc">列出文件和目录</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">cd [目录]</div>
        <div class="help-command-desc">切换目录</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">cat [文件]</div>
        <div class="help-command-desc">查看文件内容</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">pwd</div>
        <div class="help-command-desc">显示当前路径</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">tree</div>
        <div class="help-command-desc">显示目录树结构</div>
      </div>
    </div>
  </div>

  <div class="help-section">
    <div class="help-section-title">🔍 搜索功能</div>
    <div class="help-commands">
      <div class="help-command-item">
        <div class="help-command-name">find [关键词]</div>
        <div class="help-command-desc">搜索文件名</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">grep [关键词]</div>
        <div class="help-command-desc">搜索文章内容</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">articles [类别]</div>
        <div class="help-command-desc">显示文章列表</div>
      </div>
    </div>
  </div>

  <div class="help-section">
    <div class="help-section-title">🎨 系统功能</div>
    <div class="help-commands">
      <div class="help-command-item">
        <div class="help-command-name">clear</div>
        <div class="help-command-desc">清空终端 (Ctrl+L)</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">history</div>
        <div class="help-command-desc">显示命令历史</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">theme [颜色]</div>
        <div class="help-command-desc">切换主题 (green/blue/purple/orange)</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">neofetch</div>
        <div class="help-command-desc">显示系统信息</div>
      </div>
    </div>
  </div>

  <div class="help-section">
    <div class="help-section-title">ℹ️ 信息命令</div>
    <div class="help-commands">
      <div class="help-command-item">
        <div class="help-command-name">help [命令]</div>
        <div class="help-command-desc">显示帮助 (详细: man [命令])</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">about</div>
        <div class="help-command-desc">关于博客</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">contact</div>
        <div class="help-command-desc">联系信息</div>
      </div>
      <div class="help-command-item">
        <div class="help-command-name">whoami</div>
        <div class="help-command-desc">显示用户信息</div>
      </div>
    </div>
  </div>

  <div class="help-section">
    <div class="help-section-title">⌨️ 快捷键</div>
    <div class="help-shortcuts">
      <div class="help-shortcut-item">
        <div class="help-shortcut-key">↑↓ 键</div>
        <div class="help-shortcut-desc">浏览命令历史</div>
      </div>
      <div class="help-shortcut-item">
        <div class="help-shortcut-key">Tab 键</div>
        <div class="help-shortcut-desc">自动补全</div>
      </div>
      <div class="help-shortcut-item">
        <div class="help-shortcut-key">Ctrl+C</div>
        <div class="help-shortcut-desc">中断命令</div>
      </div>
      <div class="help-shortcut-item">
        <div class="help-shortcut-key">Ctrl+L</div>
        <div class="help-shortcut-desc">清空屏幕</div>
      </div>
    </div>
  </div>

  <div class="help-section">
    <div class="help-section-title">🎮 隐藏功能</div>
    <div class="help-commands">
      <div class="help-command-item">
        <div class="help-command-name">easter</div>
        <div class="help-command-desc">发现彩蛋解锁特殊命令</div>
      </div>
    </div>
    <div style="color: var(--purple); margin-top: 10px; text-align: center; font-style: italic;">
      试试输入一些有趣的命令... 😉
    </div>
  </div>

  <div class="help-footer">
    💡 提示: 输入 "man [命令]" 获取详细帮助
  </div>
</div>
        `;
    this.addOutput(helpText, "info");
  }

  showHistory() {
    this.addOutput("命令历史:", "info");
    if (this.commandHistory.length === 0) {
      this.addOutput("  (空)", "gray");
      return;
    }

    this.commandHistory.slice(0, 20).forEach((cmd, index) => {
      this.addOutput(`  ${this.commandHistory.length - index}: ${cmd}`, "file");
    });
  }

  showManual(command) {
    if (!command) {
      this.addOutput("man: 缺少命令名", "error");
      this.addOutput("用法: man <command>", "info");
      return;
    }

    if (!this.commands[command]) {
      this.addOutput(`man: 没有 ${command} 的手册页`, "error");
      return;
    }

    this.showHelp(command);
  }

  showArticles(category) {
    // 定义文章数据结构
    const articlesData = {
      Blender: [
        {
          title: "Blender基础",
          file: "Blender基础.md",
          path: "Document/Blender/Blender基础.md",
          type: "教程",
          icon: "🎨",
        },
      ],
      Obsidian: [
        {
          title: "Dataview插件使用",
          file: "Dataview.md",
          path: "Document/Obsidian/Dataview.md",
          type: "插件",
          icon: "📊",
        },
        {
          title: "Markdown基础语法",
          file: "markdown基础语法.md",
          path: "Document/Obsidian/markdown基础语法.md",
          type: "语法",
          icon: "📝",
        },
        {
          title: "数学块写法",
          file: "数学块.md",
          path: "Document/Obsidian/数学块.md",
          type: "数学",
          icon: "🧮",
        },
      ],
    };

    if (category && articlesData[category]) {
      // 显示特定类别的文章
      this.showCategoryArticles(category, articlesData[category]);
      return;
    }

    // 显示所有文章
    const allCategories = Object.keys(articlesData);
    const totalArticles = Object.values(articlesData).reduce(
      (sum, articles) => sum + articles.length,
      0
    );

    let articlesHTML = `
<div class="articles-container">
  <div class="articles-title">📚 文章列表 - AFulcrum Blog</div>
  
  <div class="articles-summary">
    <div class="articles-summary-text">共有 ${allCategories.length} 个分类，${totalArticles} 篇文章</div>
    <div class="articles-summary-stats">
      <span class="articles-stat">${allCategories.length} 分类</span>
      <span class="articles-stat">${totalArticles} 文章</span>
    </div>
  </div>
`;

    // 为每个类别显示文章
    allCategories.forEach((categoryName) => {
      const categoryArticles = articlesData[categoryName];
      const categoryIcon = categoryName === "Blender" ? "🎨" : "🔮";

      articlesHTML += `
  <div class="articles-category">
    <div class="articles-category-title">${categoryIcon} ${categoryName} (${categoryArticles.length}篇)</div>
    <div class="articles-list">`;

      categoryArticles.forEach((article, index) => {
        articlesHTML += `
      <div class="article-item" onclick="terminal.executeCommand('cat ${
        article.path
      }')" style="animation-delay: ${index * 0.1}s">
        <div class="article-icon">${article.icon}</div>
        <div class="article-info">
          <div class="article-title">${article.title}</div>
          <div class="article-path">${article.path}</div>
        </div>
        <div class="article-meta">${article.type}</div>
      </div>`;
      });

      articlesHTML += `
    </div>
  </div>`;
    });

    articlesHTML += `
  <div class="articles-footer">
    💡 点击文章标题快速查看内容，或使用 "articles [分类]" 查看特定分类
  </div>
</div>`;

    this.addOutput(articlesHTML, "info");
  }

  showCategoryArticles(categoryName, articles) {
    const categoryIcon = categoryName === "Blender" ? "🎨" : "🔮";

    let articlesHTML = `
<div class="articles-container">
  <div class="articles-title">${categoryIcon} ${categoryName} 分类文章</div>
  
  <div class="articles-summary">
    <div class="articles-summary-text">共有 ${articles.length} 篇文章</div>
  </div>

  <div class="articles-category">
    <div class="articles-list">`;

    articles.forEach((article, index) => {
      articlesHTML += `
      <div class="article-item" onclick="terminal.executeCommand('cat ${
        article.path
      }')" style="animation-delay: ${index * 0.1}s">
        <div class="article-icon">${article.icon}</div>
        <div class="article-info">
          <div class="article-title">${article.title}</div>
          <div class="article-path">${article.path}</div>
        </div>
        <div class="article-meta">${article.type}</div>
      </div>`;
    });

    articlesHTML += `
    </div>
  </div>

  <div class="articles-footer">
    💡 点击文章标题快速查看内容，或使用 "articles" 查看所有分类
  </div>
</div>`;

    this.addOutput(articlesHTML, "info");
  }

  showAbout() {
    const aboutText = `
<span style="color: var(--blue); font-size: 18px;">🚀 AFulcrum 的终端博客</span>

<span style="color: var(--yellow);">版本:</span> v2.0 Enhanced
<span style="color: var(--yellow);">作者:</span> AFulcrum
<span style="color: var(--yellow);">技术栈:</span> HTML5, CSS3, Vanilla JavaScript
<span style="color: var(--yellow);">主题:</span> Linux 终端风格

<span style="color: var(--yellow);">特性:</span>
  ✨ 真实的终端体验
  🎨 多主题支持
  📱 响应式设计
  ⚡ 快速搜索
  🔧 命令补全
  📚 Markdown 文章支持

这是一个独特的博客项目，模拟真实的 Linux 终端环境，
让技术爱好者能够用熟悉的命令行方式浏览文章内容。

<span style="color: var(--gray);">输入 "contact" 查看联系方式</span>
        `;
    this.addOutput(aboutText, "info");
  }

  showContact() {
    const contactText = `
<span style="color: var(--blue); font-size: 16px;">📞 联系信息</span>

<span style="color: var(--yellow);">GitHub:</span> https://github.com/AFulcrum
<span style="color: var(--yellow);">博客:</span> https://afulcrum.github.io
<span style="color: var(--yellow);">邮箱:</span> 请通过 GitHub 联系

<span style="color: var(--yellow);">项目地址:</span> https://github.com/AFulcrum/AFulcrum.github.io

欢迎提交 Issue 和 Pull Request！
如果你喜欢这个项目，请给个 ⭐ Star！
        `;
    this.addOutput(contactText, "info");
  }

  showNeofetch() {
    const neofetchText = `
<span style="color: var(--blue);">                   -\`</span>                <span style="color: var(--yellow);">AFulcrum</span>@<span style="color: var(--blue);">terminal-blog</span>
<span style="color: var(--blue);">                  .o+\`</span>               <span style="color: var(--gray);">─────────────────────────</span>
<span style="color: var(--blue);">                 \`ooo/</span>               <span style="color: var(--yellow);">OS:</span> Terminal Blog v2.0
<span style="color: var(--blue);">                \`+oooo:</span>              <span style="color: var(--yellow);">Host:</span> ${
      navigator.userAgent.split(" ")[0]
    }
<span style="color: var(--blue);">               \`+oooooo:</span>             <span style="color: var(--yellow);">Kernel:</span> JavaScript Engine
<span style="color: var(--blue);">               -+oooooo+:</span>            <span style="color: var(--yellow);">Uptime:</span> ${this.getUptime()}
<span style="color: var(--blue);">             \`/:-:++oooo+:</span>           <span style="color: var(--yellow);">Shell:</span> AFulcrum Terminal
<span style="color: var(--blue);">            \`/++++/+++++++:</span>          <span style="color: var(--yellow);">Resolution:</span> ${
      window.screen.width
    }x${window.screen.height}
<span style="color: var(--blue);">           \`/++++++++++++++:</span>         <span style="color: var(--yellow);">Theme:</span> ${
      this.currentTheme
    }
<span style="color: var(--blue);">          \`/+++ooooooooooooo/\`</span>       <span style="color: var(--yellow);">Icons:</span> Terminal Emoji
<span style="color: var(--blue);">         ./ooosssso++osssssso+\`</span>      <span style="color: var(--yellow);">Terminal:</span> Web Terminal
<span style="color: var(--blue);">        .oossssso-\`\`\`\`/ossssss+\`</span>     <span style="color: var(--yellow);">CPU:</span> ${
      navigator.hardwareConcurrency || "Unknown"
    } cores
<span style="color: var(--blue);">       -osssssso.      :ssssssso.</span>    <span style="color: var(--yellow);">Memory:</span> ${
      navigator.deviceMemory || "Unknown"
    } GB
<span style="color: var(--blue);">      :osssssss/        osssso+++.</span>   <span style="color: var(--yellow);">Articles:</span> ${
      Object.keys(this.articles).length || 5
    }
<span style="color: var(--blue);">     /ossssssss/        +ssssooo/-</span>   <span style="color: var(--yellow);">Commands:</span> ${
      this.commandCount
    }
        `;
    this.addOutput(neofetchText, "info");
  }

  getUptime() {
    const uptime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  showExitMessage() {
    this.addOutput("再见! 感谢使用 AFulcrum 的终端博客 👋", "success");
    this.addOutput("刷新页面重新开始会话", "info");
  }
  listDirectory(path) {
    const targetPath = this.resolvePath(path);
    const structure = this.getDirectoryStructure();

    let current = structure;
    if (targetPath !== "/") {
      const pathParts = targetPath.split("/").filter((p) => p);
      for (const part of pathParts) {
        if (current[part]) {
          current = current[part];
        } else {
          this.addOutput(`ls: 无法访问 '${path}': 没有那个文件或目录`, "error");
          return;
        }
      }
    }

    if (typeof current === "string") {
      this.addOutput(`ls: ${path}: 不是目录`, "error");
      return;
    }

    const items = Object.keys(current);
    if (items.length === 0) {
      this.addOutput("目录为空", "info");
      return;
    }

    items.forEach((item) => {
      const isDirectory = typeof current[item] === "object";
      const className = isDirectory ? "directory" : "file";
      const displayName = isDirectory ? `${item}/` : item;
      this.addOutput(`  ${displayName}`, className);
    });
  }

  changeDirectory(path) {
    if (!path || path === "~") {
      this.currentPath = "/";
      this.updatePrompt();
      return;
    }

    const targetPath = this.resolvePath(path);
    const structure = this.getDirectoryStructure();

    let current = structure;
    if (targetPath !== "/") {
      const pathParts = targetPath.split("/").filter((p) => p);
      for (const part of pathParts) {
        if (current[part] && typeof current[part] === "object") {
          current = current[part];
        } else {
          this.addOutput(`cd: ${path}: 没有那个文件或目录`, "error");
          return;
        }
      }
    }

    this.currentPath = targetPath;
    this.updatePrompt();
  }

  resolvePath(path) {
    if (!path) return this.currentPath;

    if (path.startsWith("/")) {
      return path === "/" ? "/" : path;
    }

    if (path === "..") {
      const parts = this.currentPath.split("/").filter((p) => p);
      parts.pop();
      return parts.length === 0 ? "/" : "/" + parts.join("/");
    }

    if (this.currentPath === "/") {
      return "/" + path;
    } else {
      return this.currentPath + "/" + path;
    }
  }

  updatePrompt() {
    const prompt = document.querySelector(".prompt");
    const inputLine = document.querySelector(".input-line .prompt");
    if (inputLine) {
      inputLine.textContent = `AFulcrum@blog:${this.currentPath}$ `;
    }
  }

  showCurrentPath() {
    this.addOutput(this.currentPath, "info");
  }

  clearScreen() {
    this.output.innerHTML = "";
  }

  showTree() {
    const tree = `
Document/
├── Blender/
│   └── Blender基础.md
└── Obsidian/
    ├── Dataview.md
    ├── markdown基础语法.md
    └── 数学块.md
        `;
    this.addOutput(tree, "info");
  }

  async showFile(filename) {
    if (!filename) {
      this.addOutput("cat: 缺少文件名", "error");
      return;
    }

    const fullPath = this.resolvePath(filename);

    // 检查是否是markdown文件
    if (!filename.endsWith(".md")) {
      this.addOutput(`cat: ${filename}: 不是文本文件`, "error");
      return;
    }

    // 模拟文章内容 - 实际项目中这里应该从服务器获取
    const articles = {
      "Blender基础.md": await this.loadArticleContent(
        "Blender",
        "Blender基础.md"
      ),
      "Dataview.md": await this.loadArticleContent("Obsidian", "Dataview.md"),
      "markdown基础语法.md": await this.loadArticleContent(
        "Obsidian",
        "markdown基础语法.md"
      ),
      "数学块.md": await this.loadArticleContent("Obsidian", "数学块.md"),
    };

    if (articles[filename]) {
      this.addOutput("─".repeat(60), "info");
      this.displayMarkdown(articles[filename]);
      this.addOutput("─".repeat(60), "info");
    } else {
      this.addOutput(`cat: ${filename}: 没有那个文件`, "error");
    }
  }

  async loadArticleContent(category, filename) {
    try {
      return await this.articleLoader.loadArticleContent(category, filename);
    } catch (error) {
      console.error("加载文章失败:", error);
      return `# ${filename}\n\n文章加载失败，请稍后重试。`;
    }
  }

  displayMarkdown(content) {
    // 简单的markdown渲染
    const lines = content.split("\n");
    let html = "";

    for (let line of lines) {
      line = line.trim();

      if (line.startsWith("# ")) {
        html += `<h1>${line.substring(2)}</h1>`;
      } else if (line.startsWith("## ")) {
        html += `<h2>${line.substring(3)}</h2>`;
      } else if (line.startsWith("### ")) {
        html += `<h3>${line.substring(4)}</h3>`;
      } else if (line.startsWith("- ")) {
        html += `<div>• ${line.substring(2)}</div>`;
      } else if (line.match(/^\d+\. /)) {
        html += `<div>${line}</div>`;
      } else if (line.startsWith("```")) {
        html += `<div style="color: #888;">${line}</div>`;
      } else if (line.includes("`") && !line.startsWith("```")) {
        html += `<div>${line.replace(/`([^`]+)`/g, "<code>$1</code>")}</div>`;
      } else if (line) {
        html += `<div>${line}</div>`;
      } else {
        html += "<div></div>";
      }
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "article-content";
    contentDiv.innerHTML = html;
    this.output.appendChild(contentDiv);
  }

  findFiles(query) {
    if (!query) {
      this.addOutput("find: 缺少搜索关键词", "error");
      return;
    }

    const files = [
      "Document/Blender/Blender基础.md",
      "Document/Obsidian/Dataview.md",
      "Document/Obsidian/markdown基础语法.md",
      "Document/Obsidian/数学块.md",
    ];

    const matches = files.filter((file) =>
      file.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
      this.addOutput(`find: 未找到包含 "${query}" 的文件`, "warning");
    } else {
      this.addOutput(`找到 ${matches.length} 个匹配的文件:`, "success");
      matches.forEach((file) => {
        this.addOutput(`  ${file}`, "file");
      });
    }
  }

  grepContent(query) {
    if (!query) {
      this.addOutput("grep: 缺少搜索关键词", "error");
      return;
    }

    this.addOutput(`在文章中搜索 "${query}"...`, "info");
    this.addOutput("搜索结果:", "success");
    this.addOutput("  Document/Blender/Blender基础.md: 找到 2 处匹配", "file");
    this.addOutput(
      "  Document/Obsidian/markdown基础语法.md: 找到 1 处匹配",
      "file"
    );
    this.addOutput("\n使用 cat 命令查看具体文章内容", "info");
  }

  getDirectoryStructure() {
    return {
      Document: {
        Blender: {
          "Blender基础.md": "file",
        },
        Obsidian: {
          "Dataview.md": "file",
          "markdown基础语法.md": "file",
          "数学块.md": "file",
        },
      },
    };
  }

  async loadArticles() {
    // 预加载文章数据
    this.articles = {
      Blender: ["Blender基础.md"],
      Obsidian: ["Dataview.md", "markdown基础语法.md", "数学块.md"],
    };
  }

  // 新增特效方法
  enterMatrixMode() {
    this.addOutput("进入黑客帝国模式...", "success");
    const terminal = document.querySelector(".terminal-container");
    terminal.classList.add("matrix-mode");

    setTimeout(() => {
      this.addOutput("█ █ █ 代码雨已启动 █ █ █", "matrix");
      this.addOutput("01001000 01100001 01100011 01101011", "matrix");
      this.addOutput("输入 'clear' 退出矩阵模式", "info");
    }, 1000);
  }

  showEasterEgg() {
    const eggs = [
      "🥚 恭喜！你发现了彩蛋！",
      "🎮 Achievement Unlocked: Terminal Explorer",
      "🎯 你已经解锁了隐藏功能！",
      "🌟 Welcome to the secret area!",
      "🎊 你找到了程序员的小秘密~",
    ];

    const randomEgg = eggs[Math.floor(Math.random() * eggs.length)];
    this.addOutput(randomEgg, "success");

    setTimeout(() => {
      this.addOutput(
        "隐藏命令已解锁: matrix, hack, particles, rainbow",
        "info"
      );
    }, 1500);
  }

  showHackAnimation() {
    this.addOutput("正在入侵系统...", "error");

    const hackLines = [
      "扫描端口... [████████████] 100%",
      "破解密码... [████████████] 100%",
      "获取权限... [████████████] 100%",
      "下载数据... [████████████] 100%",
      "清除痕迹... [████████████] 100%",
    ];

    hackLines.forEach((line, index) => {
      setTimeout(() => {
        this.addOutput(
          line,
          index === hackLines.length - 1 ? "success" : "info"
        );
        if (index === hackLines.length - 1) {
          setTimeout(() => {
            this.addOutput("🎯 入侵完成！只是开玩笑的~ 😄", "success");
          }, 500);
        }
      }, (index + 1) * 800);
    });
  }

  toggleParticles() {
    const body = document.body;
    const hasParticles = body.classList.contains("particles-active");

    if (hasParticles) {
      body.classList.remove("particles-active");
      this.addOutput("粒子效果已关闭", "info");
    } else {
      body.classList.add("particles-active");
      this.addOutput("粒子效果已启用", "success");
      this.createParticles();
    }
  }

  createParticles() {
    const particleContainer = document.createElement("div");
    particleContainer.className = "particle-container";
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 2 + "s";
        particle.style.animationDuration = Math.random() * 3 + 2 + "s";
        particleContainer.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 5000);
      }, i * 100);
    }

    setTimeout(() => {
      particleContainer.remove();
    }, 6000);
  }

  enableRainbowMode() {
    this.addOutput("🌈 彩虹模式已启用！", "success");
    const terminal = document.querySelector(".terminal-container");
    terminal.classList.add("rainbow-mode");

    setTimeout(() => {
      this.addOutput("输入任何命令查看彩虹效果~", "info");
    }, 1000);

    // 5秒后自动关闭
    setTimeout(() => {
      terminal.classList.remove("rainbow-mode");
      this.addOutput("彩虹模式已关闭", "info");
    }, 10000);
  }
}

// 全局变量，供HTML事件调用
let terminal;

// 初始化终端博客
document.addEventListener("DOMContentLoaded", () => {
  terminal = new TerminalBlog();
});
