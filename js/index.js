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
    this.currentCommand = "";
    this.isTyping = false;

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
      docs: { desc: "浏览文档文章", usage: "docs [category]" },
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
    this.commandDisplay = document.getElementById("commandDisplay");
    this.cursor = document.getElementById("cursor");
    this.promptPath = document.getElementById("promptPath");
    this.output = document.getElementById("output");
    this.suggestionsEl = document.getElementById("suggestions");
    this.sessionTimeEl = document.getElementById("session-time");
    this.commandCountEl = document.getElementById("command-count");
    this.currentPathEl = document.getElementById("current-path");

    // 全局键盘事件监听
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keypress", this.handleKeyPress.bind(this));

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

    // 点击终端区域聚焦
    document.addEventListener("click", (e) => {
      if (!this.suggestionsEl.contains(e.target)) {
        this.hideSuggestions();
      }
    });

    // 初始化显示
    this.updatePrompt();
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
    // 移除旧的聚焦方法，因为不再需要
  }

  handleKeyPress(e) {
    // 只处理可打印字符
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length === 1) {
      this.currentCommand += e.key;
      this.updateDisplay();
      this.showSuggestions();
    }
  }

  updateDisplay() {
    this.commandDisplay.textContent = this.currentCommand;
  }

  handleInput(e) {
    this.showSuggestions();
  }

  showSuggestions() {
    const input = this.currentCommand.toLowerCase().trim();
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
        this.currentCommand = suggestion;
        this.updateDisplay();
        this.hideSuggestions();
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
      this.currentCommand = this.suggestions[this.selectedSuggestion];
      this.updateDisplay();
      this.hideSuggestions();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (this.selectedSuggestion >= 0) {
        this.selectSuggestion();
      } else {
        this.executeCommand(this.currentCommand.trim());
        this.currentCommand = "";
        this.updateDisplay();
        this.hideSuggestions();
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      this.currentCommand = this.currentCommand.slice(0, -1);
      this.updateDisplay();
      this.showSuggestions();
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
        this.currentCommand = this.suggestions[0];
        this.updateDisplay();
        this.hideSuggestions();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.hideSuggestions();
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      this.addOutput("^C", "error");
      this.currentCommand = "";
      this.updateDisplay();
      this.hideSuggestions();
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      this.clearScreen();
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === "up") {
      if (this.historyIndex === -1) {
        this.historyIndex = this.commandHistory.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        this.currentCommand = "";
        this.updateDisplay();
        return;
      }
    }

    if (
      this.historyIndex >= 0 &&
      this.historyIndex < this.commandHistory.length
    ) {
      this.currentCommand = this.commandHistory[this.historyIndex];
      this.updateDisplay();
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
        case "docs":
          this.showDocs(arg);
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
<div class="help-list">
  <div class="help-title">📖 ${specificCommand} - 命令详情</div>
  
  <div class="help-grid">
    <div class="help-section">
      <div class="section-header">📋 命令信息</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name">描述</span>
          <span class="command-desc">${cmd.desc}</span>
        </div>
        <div class="command-row">
          <span class="command-name">用法</span>
          <span class="command-desc">${cmd.usage}</span>
        </div>
        <div class="command-row">
          <span class="command-name">示例</span>
          <span class="command-desc">${
            specificCommand === "cat"
              ? "cat Document/Blender/Blender基础.md"
              : specificCommand === "cd"
              ? "cd Document/Blender"
              : specificCommand === "find"
              ? "find blender"
              : specificCommand === "grep"
              ? "grep 教程"
              : cmd.usage
          }</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="help-footer">💡 输入 "help" 查看所有命令列表</div>
</div>`;
      this.addOutput(helpText, "info");
      return;
    }

    // 列表式help显示，包含命令简介
    const helpText = `
<div class="help-list">
  <div class="help-title">📖 AFulcrum 终端博客 - 命令帮助</div>
  
  <div class="help-grid">
    <div class="help-section">
      <div class="section-header">📁 文件操作</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('ls')">ls</span>
          <span class="command-desc">列出目录内容</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('cd')">cd</span>
          <span class="command-desc">切换目录</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('cat')">cat</span>
          <span class="command-desc">查看文件内容</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('pwd')">pwd</span>
          <span class="command-desc">显示当前路径</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('tree')">tree</span>
          <span class="command-desc">显示目录树结构</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">🔍 搜索功能</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('find')">find</span>
          <span class="command-desc">搜索文件和内容</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('grep')">grep</span>
          <span class="command-desc">在文件中搜索文本</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('articles')">articles</span>
          <span class="command-desc">显示文章列表</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('docs')">docs</span>
          <span class="command-desc">浏览文档文章</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">🎨 系统功能</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('clear')">clear</span>
          <span class="command-desc">清除终端屏幕</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('history')">history</span>
          <span class="command-desc">显示命令历史</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('theme')">theme</span>
          <span class="command-desc">切换主题颜色</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('neofetch')">neofetch</span>
          <span class="command-desc">显示系统信息</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">ℹ️ 信息命令</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('help')">help</span>
          <span class="command-desc">显示命令帮助</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('about')">about</span>
          <span class="command-desc">关于此博客</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('contact')">contact</span>
          <span class="command-desc">联系信息</span>
        </div>
        <div class="command-row">
          <span class="command-name" onclick="terminal.executeCommand('whoami')">whoami</span>
          <span class="command-desc">显示当前用户</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="shortcuts-section">
    <div class="section-header">⌨️ 快捷键</div>
    <div class="shortcut-rows">
      <div class="shortcut-row">
        <span class="shortcut-key">↑↓</span>
        <span class="shortcut-desc">浏览历史命令</span>
      </div>
      <div class="shortcut-row">
        <span class="shortcut-key">Tab</span>
        <span class="shortcut-desc">自动补全</span>
      </div>
      <div class="shortcut-row">
        <span class="shortcut-key">Ctrl+C</span>
        <span class="shortcut-desc">中断命令</span>
      </div>
      <div class="shortcut-row">
        <span class="shortcut-key">Ctrl+L</span>
        <span class="shortcut-desc">清屏</span>
      </div>
    </div>
  </div>
  
  <div class="help-footer">💡 使用 "help [命令]" 获取详细说明 | 点击命令名查看详情</div>
</div>`;
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

    // 列表式文章显示
    const allCategories = Object.keys(articlesData);
    const totalArticles = Object.values(articlesData).reduce(
      (sum, articles) => sum + articles.length,
      0
    );

    let articlesHTML = `
<div class="articles-list-compact">
  <div class="articles-title">📚 可用文章</div>
  <div class="articles-stats">共 ${totalArticles} 篇文章，分布在 ${allCategories.length} 个分类中</div>
  
  <div class="categories-grid">`;

    allCategories.forEach((categoryName) => {
      const articles = articlesData[categoryName];
      articlesHTML += `
    <div class="category-section">
      <div class="category-header">
        <span>${articles[0].icon} ${categoryName}</span>
        <span class="category-count">${articles.length}</span>
      </div>
      <div class="articles-list">`;

      articles.forEach((article) => {
        articlesHTML += `
        <div class="article-item" onclick="terminal.executeCommand('cat ${article.path}')">
          <span class="article-icon">${article.icon}</span>
          <div class="article-info">
            <div class="article-title">${article.title}</div>
            <div class="article-path">${article.path}</div>
          </div>
          <span class="article-type">${article.type}</span>
        </div>`;
      });

      articlesHTML += `
      </div>
    </div>`;
    });

    articlesHTML += `
  </div>
  
  <div class="help-footer">
    💡 点击文章名查看内容 | 使用 "articles [分类]" 查看特定分类
  </div>
</div>`;

    this.addOutput(articlesHTML, "info");
  }

  showDocs(category) {
    // 文档结构定义
    const docsStructure = {
      Blender: {
        icon: "🎨",
        title: "Blender 学习文档",
        color: "var(--blue)",
        description: "3D建模、动画制作相关教程",
        articles: [
          {
            title: "Blender基础入门",
            file: "Blender基础.md",
            path: "Document/Blender/Blender基础.md",
            tags: ["基础", "入门", "3D建模"],
            difficulty: "初级",
            readTime: "15分钟",
            lastUpdate: "2024-01-15",
          },
        ],
      },
      Obsidian: {
        icon: "🔮",
        title: "Obsidian 使用指南",
        color: "var(--purple)",
        description: "知识管理、笔记组织相关文档",
        articles: [
          {
            title: "Dataview插件详解",
            file: "Dataview.md",
            path: "Document/Obsidian/Dataview.md",
            tags: ["插件", "数据查询", "进阶"],
            difficulty: "中级",
            readTime: "20分钟",
            lastUpdate: "2024-01-10",
          },
          {
            title: "Markdown基础语法",
            file: "markdown基础语法.md",
            path: "Document/Obsidian/markdown基础语法.md",
            tags: ["基础", "语法", "写作"],
            difficulty: "初级",
            readTime: "10分钟",
            lastUpdate: "2024-01-08",
          },
          {
            title: "数学公式写法",
            file: "数学块.md",
            path: "Document/Obsidian/数学块.md",
            tags: ["数学", "LaTeX", "公式"],
            difficulty: "中级",
            readTime: "12分钟",
            lastUpdate: "2024-01-05",
          },
        ],
      },
    };

    if (category && docsStructure[category]) {
      // 显示特定分类的文档
      this.showCategoryDocs(category, docsStructure[category]);
      return;
    }

    // 显示所有文档分类
    const categories = Object.keys(docsStructure);
    const totalDocs = Object.values(docsStructure).reduce(
      (sum, cat) => sum + cat.articles.length,
      0
    );

    let docsHTML = `
<div class="help-list">
  <div class="help-title">📚 文档中心</div>
  
  <div style="text-align: center; color: var(--gray); margin-bottom: 20px; padding: 10px; background: rgba(13, 17, 23, 0.5); border-radius: 6px;">
    共有 ${totalDocs} 篇文档，分布在 ${categories.length} 个分类中
  </div>
  
  <div class="help-grid">`;

    categories.forEach((categoryName) => {
      const categoryData = docsStructure[categoryName];
      docsHTML += `
    <div class="help-section">
      <div class="section-header" style="color: ${categoryData.color};">
        ${categoryData.icon} ${categoryData.title}
      </div>
      
      <div style="color: var(--gray); font-size: 12px; margin-bottom: 15px; padding: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px;">
        ${categoryData.description}
      </div>
      
      <div class="command-rows">`;

      categoryData.articles.forEach((article) => {
        const difficultyColor =
          article.difficulty === "初级"
            ? "var(--primary-green)"
            : article.difficulty === "中级"
            ? "var(--yellow)"
            : "var(--red)";

        docsHTML += `
        <div class="command-row" onclick="terminal.executeCommand('cat ${
          article.path
        }')" style="cursor: pointer;">
          <div style="flex: 1;">
            <div class="command-name" style="margin-bottom: 4px;">${
              article.title
            }</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
              ${article.tags
                .map(
                  (tag) =>
                    `<span style="background: rgba(0, 255, 65, 0.2); color: var(--primary-green); padding: 2px 6px; border-radius: 8px; font-size: 9px;">${tag}</span>`
                )
                .join("")}
            </div>
            <div style="display: flex; gap: 15px; font-size: 10px; color: var(--gray);">
              <span>📖 ${article.readTime}</span>
              <span style="color: ${difficultyColor};">⭐ ${
          article.difficulty
        }</span>
              <span>🕒 ${article.lastUpdate}</span>
            </div>
          </div>
        </div>`;
      });

      docsHTML += `
      </div>
      
      <div style="text-align: center; margin-top: 10px;">
        <span class="command-name" onclick="terminal.executeCommand('docs ${categoryName}')" style="cursor: pointer; padding: 6px 12px; background: rgba(0, 255, 65, 0.2); border-radius: 15px; font-size: 11px;">
          查看更多 ${categoryName} 文档
        </span>
      </div>
    </div>`;
    });

    docsHTML += `
  </div>
  
  <div class="help-footer">
    💡 点击文档标题阅读 | 使用 "docs [分类]" 查看特定分类 | "cat [路径]" 直接阅读
  </div>
</div>`;

    this.addOutput(docsHTML, "info");
  }

  showCategoryDocs(categoryName, categoryData) {
    let docsHTML = `
<div class="help-list">
  <div class="help-title" style="color: ${categoryData.color};">
    ${categoryData.icon} ${categoryData.title}
  </div>
  
  <div style="text-align: center; color: var(--gray); margin-bottom: 20px; padding: 12px; background: rgba(13, 17, 23, 0.7); border-radius: 6px; line-height: 1.5;">
    ${categoryData.description}<br>
    <small>共 ${categoryData.articles.length} 篇文档</small>
  </div>
  
  <div class="help-grid">
    <div class="help-section">
      <div class="section-header">📖 文档列表</div>
      <div class="command-rows">`;

    categoryData.articles.forEach((article, index) => {
      const difficultyColor =
        article.difficulty === "初级"
          ? "var(--primary-green)"
          : article.difficulty === "中级"
          ? "var(--yellow)"
          : "var(--red)";

      docsHTML += `
      <div class="command-row" onclick="terminal.executeCommand('cat ${
        article.path
      }')" style="cursor: pointer; animation-delay: ${index * 0.1}s;">
        <div style="flex: 1;">
          <div class="command-name" style="margin-bottom: 6px; color: ${
            categoryData.color
          };">
            📄 ${article.title}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
            ${article.tags
              .map(
                (tag) =>
                  `<span style="background: rgba(0, 255, 65, 0.2); color: ${categoryData.color}; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">${tag}</span>`
              )
              .join("")}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--gray);">
            <div style="display: flex; gap: 15px;">
              <span>📖 ${article.readTime}</span>
              <span style="color: ${difficultyColor};">⭐ ${
        article.difficulty
      }</span>
            </div>
            <span>🕒 ${article.lastUpdate}</span>
          </div>
        </div>
      </div>`;
    });

    docsHTML += `
      </div>
    </div>
  </div>
  
  <div class="help-footer">
    💡 点击文档标题开始阅读 | 输入 "docs" 返回分类列表
  </div>
</div>`;

    this.addOutput(docsHTML, "info");
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
<div class="help-list">
  <div class="help-title">🚀 关于 AFulcrum 的终端博客</div>
  
  <div class="help-grid">
    <div class="help-section">
      <div class="section-header">📋 基本信息</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name">版本</span>
          <span class="command-desc">v2.0 Enhanced</span>
        </div>
        <div class="command-row">
          <span class="command-name">作者</span>
          <span class="command-desc">AFulcrum</span>
        </div>
        <div class="command-row">
          <span class="command-name">技术栈</span>
          <span class="command-desc">HTML5, CSS3, Vanilla JavaScript</span>
        </div>
        <div class="command-row">
          <span class="command-name">主题风格</span>
          <span class="command-desc">Linux 终端模拟</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">✨ 特色功能</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name">终端体验</span>
          <span class="command-desc">真实的Linux命令行操作感受</span>
        </div>
        <div class="command-row">
          <span class="command-name">多主题支持</span>
          <span class="command-desc">绿色/蓝色/紫色/橙色主题切换</span>
        </div>
        <div class="command-row">
          <span class="command-name">响应式设计</span>
          <span class="command-desc">完美适配桌面端和移动端</span>
        </div>
        <div class="command-row">
          <span class="command-name">智能搜索</span>
          <span class="command-desc">快速搜索文章和内容</span>
        </div>
        <div class="command-row">
          <span class="command-name">命令补全</span>
          <span class="command-desc">Tab键智能补全命令和路径</span>
        </div>
        <div class="command-row">
          <span class="command-name">Markdown支持</span>
          <span class="command-desc">完整的Markdown文章渲染</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">🎯 项目介绍</div>
      <div style="color: var(--gray); padding: 15px; background: rgba(13, 17, 23, 0.5); border-radius: 6px; line-height: 1.6; font-size: 13px;">
        这是一个独特的博客项目，完全模拟真实的Linux终端环境。
        技术爱好者可以用熟悉的命令行方式浏览文章内容，
        体验原汁原味的终端操作感受。项目采用纯前端技术栈，
        无需后端支持，部署简单，性能优异。
      </div>
    </div>
  </div>
  
  <div class="help-footer">💡 输入 "contact" 查看联系方式 | "help" 查看命令帮助</div>
</div>`;
    this.addOutput(aboutText, "info");
  }

  showContact() {
    const contactText = `
<div class="help-list">
  <div class="help-title">📞 联系信息</div>
  
  <div class="help-grid">
    <div class="help-section">
      <div class="section-header">� 在线链接</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name">GitHub</span>
          <span class="command-desc">https://github.com/AFulcrum</span>
        </div>
        <div class="command-row">
          <span class="command-name">博客主页</span>
          <span class="command-desc">https://afulcrum.github.io</span>
        </div>
        <div class="command-row">
          <span class="command-name">项目地址</span>
          <span class="command-desc">https://github.com/AFulcrum/AFulcrum.github.io</span>
        </div>
        <div class="command-row">
          <span class="command-name">邮箱联系</span>
          <span class="command-desc">请通过 GitHub 联系</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">🤝 参与贡献</div>
      <div style="color: var(--gray); padding: 15px; background: rgba(13, 17, 23, 0.5); border-radius: 6px; line-height: 1.6; font-size: 13px;">
        欢迎提交 Issue 和 Pull Request！<br>
        如果你喜欢这个项目，请给个 ⭐ Star！<br>
        有任何建议或问题，都可以通过 GitHub 联系我。
      </div>
    </div>
  </div>
  
  <div class="help-footer">💡 感谢你的关注和支持！</div>
</div>`;
    this.addOutput(contactText, "info");
  }

  showNeofetch() {
    const neofetchText = `
<div class="neofetch-list">
  <div class="neofetch-title">💻 系统信息 - neofetch</div>
  
  <div class="system-grid">
    <div class="system-section">
      <div class="system-header">🖥️ 系统信息</div>
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">用户</span>
          <span class="info-value">AFulcrum@terminal-blog</span>
        </div>
        <div class="info-item">
          <span class="info-label">系统</span>
          <span class="info-value">Terminal Blog v2.0</span>
        </div>
        <div class="info-item">
          <span class="info-label">内核</span>
          <span class="info-value">JavaScript Engine</span>
        </div>
        <div class="info-item">
          <span class="info-label">运行时间</span>
          <span class="info-value">${this.getUptime()}</span>
        </div>
      </div>
    </div>
    
    <div class="system-section">
      <div class="system-header">🎨 显示信息</div>
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">分辨率</span>
          <span class="info-value">${window.screen.width}x${
      window.screen.height
    }</span>
        </div>
        <div class="info-item">
          <span class="info-label">主题</span>
          <span class="info-value">${this.currentTheme}</span>
        </div>
        <div class="info-item">
          <span class="info-label">终端</span>
          <span class="info-value">Web Terminal</span>
        </div>
        <div class="info-item">
          <span class="info-label">图标</span>
          <span class="info-value">Terminal Emoji</span>
        </div>
      </div>
    </div>
    
    <div class="system-section">
      <div class="system-header">⚡ 性能信息</div>
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">CPU核心</span>
          <span class="info-value">${
            navigator.hardwareConcurrency || "未知"
          } 核</span>
        </div>
        <div class="info-item">
          <span class="info-label">内存</span>
          <span class="info-value">${navigator.deviceMemory || "未知"} GB</span>
        </div>
        <div class="info-item">
          <span class="info-label">浏览器</span>
          <span class="info-value">${navigator.userAgent.split(" ")[0]}</span>
        </div>
      </div>
    </div>
    
    <div class="system-section">
      <div class="system-header">📊 使用统计</div>
      <div class="system-info">
        <div class="info-item">
          <span class="info-label">会话时间</span>
          <span class="info-value">${this.getUptime()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">执行命令</span>
          <span class="info-value">${this.commandCount}</span>
        </div>
        <div class="info-item">
          <span class="info-label">文章数量</span>
          <span class="info-value">${
            Object.keys(this.articles).length || 5
          }</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="status-footer">
    💡 系统运行正常 | 所有功能可用 | 输入 "help" 查看命令列表
  </div>
</div>`;
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
    if (this.promptPath) {
      this.promptPath.textContent = this.currentPath;
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
