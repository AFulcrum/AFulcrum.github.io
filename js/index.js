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
    this.isInputFocused = true; // 添加输入焦点追踪

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

    // 点击终端区域聚焦和建议管理
    document.addEventListener("click", (e) => {
      const inputLine = document.querySelector(".input-line");
      const terminal = document.querySelector(".terminal-body");

      // 检查是否点击在输入区域附近
      if (inputLine && inputLine.contains(e.target)) {
        this.isInputFocused = true;
        if (this.currentCommand.trim()) {
          this.showSuggestions();
        }
      } else if (terminal && terminal.contains(e.target)) {
        this.isInputFocused = true;
      } else {
        this.isInputFocused = false;
        this.hideSuggestions();
      }

      if (!this.suggestionsEl.contains(e.target)) {
        this.hideSuggestions();
      }
    });

    // 鼠标移动事件优化
    document.addEventListener("mousemove", (e) => {
      const inputLine = document.querySelector(".input-line");
      if (inputLine) {
        const rect = inputLine.getBoundingClientRect();
        const distance = Math.min(
          Math.abs(e.clientY - rect.top),
          Math.abs(e.clientY - rect.bottom)
        );

        // 如果鼠标距离输入行太近，暂时隐藏建议
        if (distance < 30 && !inputLine.contains(e.target)) {
          this.hideSuggestions();
        }
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

    // 只有在输入内容且光标在输入框内时才显示建议
    if (!input || input.length < 1) {
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
      .slice(0, 6); // 减少显示数量

    if (this.suggestions.length > 0 && this.isInputFocused) {
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

    // 列表式help显示，包含命令简介和滚动索引
    const commandCategories = {
      文件操作: {
        icon: "📁",
        color: "var(--primary-green)",
        commands: [
          { name: "ls", desc: "列出目录内容" },
          { name: "cd", desc: "切换目录" },
          { name: "cat", desc: "查看文件内容" },
          { name: "pwd", desc: "显示当前路径" },
          { name: "tree", desc: "显示目录树结构" },
        ],
      },
      搜索功能: {
        icon: "🔍",
        color: "var(--blue)",
        commands: [
          { name: "find", desc: "搜索文件和内容" },
          { name: "grep", desc: "在文件中搜索文本" },
          { name: "articles", desc: "显示文章列表" },
          { name: "docs", desc: "浏览文档文章" },
        ],
      },
      系统功能: {
        icon: "🎨",
        color: "var(--yellow)",
        commands: [
          { name: "clear", desc: "清除终端屏幕" },
          { name: "history", desc: "显示命令历史" },
          { name: "theme", desc: "切换主题颜色" },
          { name: "neofetch", desc: "显示系统信息" },
        ],
      },
      信息命令: {
        icon: "ℹ️",
        color: "var(--purple)",
        commands: [
          { name: "help", desc: "显示命令帮助" },
          { name: "about", desc: "关于此博客" },
          { name: "contact", desc: "联系信息" },
          { name: "whoami", desc: "显示当前用户" },
        ],
      },
    };

    const totalCommands = Object.values(commandCategories).reduce(
      (sum, cat) => sum + cat.commands.length,
      0
    );

    const helpText = `
<div class="help-list" id="help-top">
  <div class="help-title">📖 AFulcrum 终端博客 - 命令帮助</div>
  
  <div class="help-grid">
    ${Object.entries(commandCategories)
      .map(
        ([categoryName, categoryData]) => `
    <div class="help-section" id="help-category-${categoryName}">
      <div class="section-header" style="color: ${categoryData.color};">
        ${categoryData.icon} ${categoryName}
      </div>
      <div class="command-rows">
        ${categoryData.commands
          .map(
            (cmd) => `
        <div class="command-row" data-command="${cmd.name}">
          <span class="command-name">${cmd.name}</span>
          <span class="command-desc">${cmd.desc}</span>
        </div>
        `
          )
          .join("")}
      </div>
    </div>
    `
      )
      .join("")}
  </div>
  
  <div class="shortcuts-section" id="help-shortcuts">
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
  
  <div class="help-footer">💡 使用 "help [命令]" 获取详细说明 | 点击命令名直接执行</div>
</div>`;

    // 显示主要内容
    this.addOutput(helpText, "info");

    // 创建浮动索引
    this.createFloatingIndex("help", commandCategories, totalCommands);
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

  createFloatingIndex(type, categories, totalCount) {
    // 移除已存在的浮动索引
    const existingIndex = document.querySelector(".floating-index");
    if (existingIndex) {
      existingIndex.remove();
    }

    // 创建浮动索引容器
    const floatingIndex = document.createElement("div");
    floatingIndex.className = "floating-index";
    floatingIndex.innerHTML = `
      <div class="floating-index-header">
        <div class="floating-index-title">📖 ${
          type === "help" ? "命令导航" : "文档导航"
        }</div>
        <div class="floating-index-close" onclick="this.parentElement.parentElement.remove()">✕</div>
      </div>
      
      <div class="floating-index-stats">
        ${totalCount} 个${type === "help" ? "命令" : "文档"} | ${
      Object.keys(categories).length
    } 个分类
      </div>
      
      <div class="floating-index-content">
        ${Object.entries(categories)
          .map(
            ([categoryName, categoryData]) => `
        <div class="floating-index-category">
          <div class="floating-index-category-title" onclick="document.getElementById('${type}-category-${categoryName}').scrollIntoView({behavior: 'smooth'})" style="color: ${
              categoryData.color
            };">
            ${categoryData.icon} ${
              type === "help" ? categoryName : categoryData.title
            }
          </div>
          <div class="floating-index-items">
            ${(type === "help"
              ? categoryData.commands
              : categoryData.articles || []
            )
              .map(
                (item, index) => `
            <div class="floating-index-item" onclick="${
              type === "help"
                ? `terminal.executeCommand('${item.name}')`
                : `document.getElementById('article-${index}') ? document.getElementById('article-${index}').scrollIntoView({behavior: 'smooth'}) : terminal.executeCommand('cat ${item.path}')`
            }">
              <div class="floating-index-item-name">${
                type === "help" ? item.name : item.title
              }</div>
              <div class="floating-index-item-desc">${
                type === "help"
                  ? item.desc
                  : item.difficulty + " • " + item.readTime
              }</div>
            </div>
            `
              )
              .join("")}
          </div>
        </div>`
          )
          .join("")}
      </div>
      
      <div class="floating-index-actions">
        <div class="floating-index-btn" onclick="document.getElementById('${type}-top').scrollIntoView({behavior: 'smooth'})">
          ⬆️ 回到顶部
        </div>
        ${
          type === "help"
            ? `
        <div class="floating-index-btn" onclick="document.getElementById('${type}-shortcuts').scrollIntoView({behavior: 'smooth'})">
          ⌨️ 快捷键
        </div>
        <div class="floating-index-btn" onclick="terminal.executeCommand('docs')">
          📚 查看文档
        </div>
        `
            : `
        <div class="floating-index-btn" onclick="terminal.executeCommand('help')">
          📖 查看命令
        </div>
        `
        }
      </div>
    `;

    // 添加到页面
    document.body.appendChild(floatingIndex);

    // 添加拖拽功能
    this.makeFloatingIndexDraggable(floatingIndex);
  }

  makeFloatingIndexDraggable(element) {
    const header = element.querySelector(".floating-index-header");
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    // 防止文本选择
    header.style.userSelect = "none";
    header.style.webkitUserSelect = "none";

    header.addEventListener("mousedown", (e) => {
      // 只有点击在空白区域或标题文字上才开始拖拽
      if (e.target.classList.contains("floating-index-close")) {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(window.getComputedStyle(element).left) || 0;
      startTop = parseInt(window.getComputedStyle(element).top) || 0;

      element.style.cursor = "grabbing";
      header.style.cursor = "grabbing";
      element.style.transition = "none";

      // 提高z-index确保在拖拽时处于最顶层
      element.style.zIndex = "10000";

      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const newLeft = startLeft + e.clientX - startX;
      const newTop = startTop + e.clientY - startY;

      // 边界检查 - 留出一些边距
      const margin = 10;
      const maxLeft = window.innerWidth - element.offsetWidth - margin;
      const maxTop = window.innerHeight - element.offsetHeight - margin;

      element.style.left = Math.max(margin, Math.min(newLeft, maxLeft)) + "px";
      element.style.top = Math.max(margin, Math.min(newTop, maxTop)) + "px";

      e.preventDefault();
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = "default";
        header.style.cursor = "grab";
        element.style.transition = "all 0.3s ease";
        element.style.zIndex = "9999";
      }
    });

    // 触摸设备支持
    header.addEventListener("touchstart", (e) => {
      if (e.target.classList.contains("floating-index-close")) {
        return;
      }

      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startY = touch.clientY;
      startLeft = parseInt(window.getComputedStyle(element).left) || 0;
      startTop = parseInt(window.getComputedStyle(element).top) || 0;

      element.style.transition = "none";
      element.style.zIndex = "10000";

      e.preventDefault();
    });

    header.addEventListener("touchmove", (e) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newLeft = startLeft + touch.clientX - startX;
      const newTop = startTop + touch.clientY - startY;

      const margin = 10;
      const maxLeft = window.innerWidth - element.offsetWidth - margin;
      const maxTop = window.innerHeight - element.offsetHeight - margin;

      element.style.left = Math.max(margin, Math.min(newLeft, maxLeft)) + "px";
      element.style.top = Math.max(margin, Math.min(newTop, maxTop)) + "px";

      e.preventDefault();
    });

    header.addEventListener("touchend", () => {
      if (isDragging) {
        isDragging = false;
        element.style.transition = "all 0.3s ease";
        element.style.zIndex = "9999";
      }
    });

    header.style.cursor = "grab";
  }

  addCommandClickHandlers() {
    // 使用事件委托处理所有命令点击
    document.addEventListener("click", (e) => {
      // 处理命令行点击
      const commandRow = e.target.closest(".command-row[data-command]");
      if (commandRow) {
        const command = commandRow.getAttribute("data-command");
        if (command) {
          this.executeCommand(command);
          return;
        }
      }

      // 处理浮动索引中的命令点击
      const floatingItem = e.target.closest(".floating-index-item");
      if (floatingItem) {
        const onclick = floatingItem.getAttribute("onclick");
        if (onclick) {
          // 执行onclick中的命令
          if (onclick.includes("terminal.executeCommand")) {
            const commandMatch = onclick.match(
              /terminal\.executeCommand\(['"]([^'"]+)['"]\)/
            );
            if (commandMatch) {
              this.executeCommand(commandMatch[1]);
            }
          } else if (onclick.includes("scrollIntoView")) {
            // 执行滚动操作
            eval(onclick);
          }
          return;
        }
      }

      // 处理文档和文章点击
      const articleItem = e.target.closest(".article-item[onclick]");
      if (articleItem) {
        const onclick = articleItem.getAttribute("onclick");
        if (onclick && onclick.includes("terminal.executeCommand")) {
          const commandMatch = onclick.match(
            /terminal\.executeCommand\(['"]([^'"]+)['"]\)/
          );
          if (commandMatch) {
            this.executeCommand(commandMatch[1]);
          }
        }
        return;
      }

      // 处理其他带有data-command的元素
      const dataCommand = e.target.closest("[data-command]");
      if (dataCommand) {
        const command = dataCommand.getAttribute("data-command");
        if (command) {
          this.executeCommand(command);
        }
      }
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

    const docsHTML = `
<div class="help-list" id="docs-top">
  <div class="help-title">📚 文档中心</div>
  
  <div style="text-align: center; color: var(--gray); margin-bottom: 20px; padding: 10px; background: rgba(13, 17, 23, 0.5); border-radius: 6px;">
    共有 ${totalDocs} 篇文档，分布在 ${categories.length} 个分类中
  </div>
  
  <div class="help-grid">
    ${categories
      .map((categoryName) => {
        const categoryData = docsStructure[categoryName];
        return `
    <div class="help-section" id="docs-category-${categoryName}">
      <div class="section-header" style="color: ${categoryData.color};">
        ${categoryData.icon} ${categoryData.title}
      </div>
      
      <div style="color: var(--gray); font-size: 12px; margin-bottom: 15px; padding: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px;">
        ${categoryData.description}
      </div>
      
      <div class="command-rows">
        ${categoryData.articles
          .map((article) => {
            const difficultyColor =
              article.difficulty === "初级"
                ? "var(--primary-green)"
                : article.difficulty === "中级"
                ? "var(--yellow)"
                : "var(--red)";

            return `
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
          })
          .join("")}
      </div>
      
      <div style="text-align: center; margin-top: 10px;">
        <span class="command-name" onclick="terminal.executeCommand('docs ${categoryName}')" style="cursor: pointer; padding: 6px 12px; background: rgba(0, 255, 65, 0.2); border-radius: 15px; font-size: 11px;">
          查看更多 ${categoryName} 文档
        </span>
      </div>
    </div>`;
      })
      .join("")}
  </div>
  
  <div class="help-footer">
    💡 点击文档标题阅读 | 使用 "docs [分类]" 查看特定分类 | "cat [路径]" 直接阅读
  </div>
</div>`;

    // 显示主要内容
    this.addOutput(docsHTML, "info");

    // 创建浮动索引
    this.createFloatingIndex("docs", docsStructure, totalDocs);
  }

  showCategoryDocs(categoryName, categoryData) {
    const docsHTML = `
<div class="help-list" id="category-docs-top">
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
      <div class="command-rows">
        ${categoryData.articles
          .map((article, index) => {
            const difficultyColor =
              article.difficulty === "初级"
                ? "var(--primary-green)"
                : article.difficulty === "中级"
                ? "var(--yellow)"
                : "var(--red)";

            return `
      <div class="command-row" id="article-${index}" onclick="terminal.executeCommand('cat ${
              article.path
            }')" style="cursor: pointer; animation-delay: ${
              index * 0.1
            }s; scroll-margin-top: 20px;">
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
          })
          .join("")}
      </div>
    </div>
  </div>
  
  <div class="help-footer">
    💡 点击文档标题开始阅读 | 输入 "docs" 返回分类列表
  </div>
</div>`;

    // 显示主要内容
    this.addOutput(docsHTML, "info");

    // 创建分类专用的浮动索引
    const categoryStructure = { [categoryName]: categoryData };
    this.createFloatingIndex(
      "docs",
      categoryStructure,
      categoryData.articles.length
    );
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
      <div class="section-header">🔗 在线链接</div>
      <div class="command-rows">
        <div class="command-row">
          <span class="command-name">GitHub</span>
          <span class="command-desc contact-link">https://github.com/AFulcrum</span>
        </div>
        <div class="command-row">
          <span class="command-name">博客主页</span>
          <span class="command-desc contact-link">https://afulcrum.github.io</span>
        </div>
        <div class="command-row">
          <span class="command-name">项目地址</span>
          <span class="command-desc contact-link">https://github.com/AFulcrum/AFulcrum.github.io</span>
        </div>
        <div class="command-row">
          <span class="command-name">邮箱联系</span>
          <span class="command-desc">请通过 GitHub 联系</span>
        </div>
      </div>
    </div>
    
    <div class="help-section">
      <div class="section-header">🤝 参与贡献</div>
      <div class="contact-contribution">
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
    // 保存初始的欢迎界面
    const welcomeMessage = `
      <div class="welcome-message">
        <pre class="ascii-art">
    ___    ______      __                          
   /   |  / ____/_  __/ /____________  ______ ___ 
  / /| | / /_  / / / / / ___/ ___/ / / / __  __ \\
 / ___ |/ __/ / /_/ / / /__/ /  / /_/ / / / / / /
/_/  |_/_/    \\__,_/_/\\___/_/   \\__,_/_/ /_/ /_/ 
                                                 
                    Terminal Blog v2.0
        </pre>
        <div class="welcome-text">
          <p class="highlight">🚀 欢迎来到 AFulcrum 的终端博客！</p>
          <p>输入 <span class="command glow">help</span> 查看可用命令</p>
          <p class="tip">
            💡 提示：使用 ↑↓ 键浏览历史，Tab 键自动补全，Ctrl+C 中断，Ctrl+L
            清屏
          </p>
        </div>
        <hr class="separator" />
      </div>
    `;

    // 清除所有内容后重新添加欢迎界面
    this.output.innerHTML = welcomeMessage;

    // 移除任何存在的浮动索引
    const existingIndex = document.querySelector(".floating-index");
    if (existingIndex) {
      existingIndex.remove();
    }
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

    // 处理文件路径，提取实际文件名和分类
    let actualFilename = filename;
    let category = "";

    if (filename.includes("/")) {
      const pathParts = filename.split("/");
      actualFilename = pathParts[pathParts.length - 1];

      // 从路径中提取分类
      if (pathParts.includes("Blender")) {
        category = "Blender";
      } else if (pathParts.includes("Obsidian")) {
        category = "Obsidian";
      }
    }

    // 检查是否是markdown文件
    if (!actualFilename.endsWith(".md")) {
      this.addOutput(`cat: ${filename}: 不是文本文件`, "error");
      return;
    }

    // 文件映射
    const fileMapping = {
      "Blender基础.md": { category: "Blender", filename: "Blender基础.md" },
      "Dataview.md": { category: "Obsidian", filename: "Dataview.md" },
      "markdown基础语法.md": {
        category: "Obsidian",
        filename: "markdown基础语法.md",
      },
      "数学块.md": { category: "Obsidian", filename: "数学块.md" },
    };

    const fileInfo = fileMapping[actualFilename];
    if (!fileInfo) {
      this.addOutput(`cat: ${filename}: 没有那个文件`, "error");
      return;
    }

    try {
      this.addOutput("📖 正在加载文档...", "info");
      const content = await this.loadArticleContent(
        fileInfo.category,
        fileInfo.filename
      );

      this.addOutput("─".repeat(60), "info");
      this.displayMarkdown(content);
      this.addOutput("─".repeat(60), "info");
      this.addOutput(`✅ 文档 ${actualFilename} 加载完成`, "success");
    } catch (error) {
      this.addOutput(`❌ 加载文档失败: ${error.message}`, "error");
      console.error("文档加载错误:", error);
    }
  }

  async loadArticleContent(category, filename) {
    try {
      if (!this.articleLoader) {
        this.articleLoader = new ArticleLoader();
      }

      const content = await this.articleLoader.loadArticleContent(
        category,
        filename
      );
      return content;
    } catch (error) {
      console.error("加载文章失败:", error);
      return this.getFallbackContent(filename, error.message);
    }
  }

  getFallbackContent(filename, errorMessage) {
    return `# ${filename.replace(".md", "")}

⚠️ **文章加载失败**

---

## 🔍 问题详情

**文件名**: ${filename}
**错误信息**: ${errorMessage || "未知错误"}

---

## 💡 可能的解决方案

1. **检查网络连接** - 确保您的网络连接正常
2. **刷新页面** - 尝试刷新浏览器页面重新加载
3. **稍后重试** - 可能是临时的服务器问题
4. **检查文件路径** - 确认文件路径是否正确

---

## 📞 联系支持

如果问题持续存在，请联系技术支持：
- 使用 \`contact\` 命令查看联系方式
- 或者使用 \`help\` 命令查看其他可用选项

---

*系统时间: ${new Date().toLocaleString()}*`;
  }

  displayMarkdown(content) {
    // 改进的markdown渲染
    const lines = content.split("\n");
    let html = "";
    let inCodeBlock = false;
    let codeBlockLanguage = "";

    for (let line of lines) {
      const originalLine = line;
      line = line.trimEnd();

      // 处理代码块
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLanguage = line.substring(3).trim();
          html += `<div class="code-block-start">💻 代码块 ${
            codeBlockLanguage ? `(${codeBlockLanguage})` : ""
          }</div>`;
        } else {
          inCodeBlock = false;
          html += `<div class="code-block-end">📋 代码块结束</div>`;
        }
        continue;
      }

      if (inCodeBlock) {
        html += `<div class="code-line">${this.escapeHtml(line)}</div>`;
        continue;
      }

      // 处理标题
      if (line.startsWith("# ")) {
        html += `<h1 class="markdown-h1">📖 ${line.substring(2)}</h1>`;
      } else if (line.startsWith("## ")) {
        html += `<h2 class="markdown-h2">📝 ${line.substring(3)}</h2>`;
      } else if (line.startsWith("### ")) {
        html += `<h3 class="markdown-h3">🔹 ${line.substring(4)}</h3>`;
      } else if (line.startsWith("#### ")) {
        html += `<h4 class="markdown-h4">▪️ ${line.substring(5)}</h4>`;
      }
      // 处理列表
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        html += `<div class="markdown-list-item">🔸 ${this.processInlineMarkdown(
          line.substring(2)
        )}</div>`;
      } else if (line.match(/^\d+\. /)) {
        const match = line.match(/^(\d+)\. (.+)/);
        if (match) {
          html += `<div class="markdown-ordered-item">📌 ${
            match[1]
          }. ${this.processInlineMarkdown(match[2])}</div>`;
        }
      }
      // 处理引用
      else if (line.startsWith("> ")) {
        html += `<div class="markdown-quote">💬 ${this.processInlineMarkdown(
          line.substring(2)
        )}</div>`;
      }
      // 处理空行
      else if (line.trim() === "") {
        html += `<div class="markdown-spacer"></div>`;
      }
      // 处理普通段落
      else if (line.trim()) {
        html += `<div class="markdown-paragraph">${this.processInlineMarkdown(
          line
        )}</div>`;
      }
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "article-content";
    contentDiv.innerHTML = html;
    this.output.appendChild(contentDiv);
  }

  processInlineMarkdown(text) {
    // 处理行内markdown语法
    return (
      text
        // 代码
        .replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>')
        // 粗体
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="markdown-bold">$1</strong>'
        )
        // 斜体
        .replace(/\*([^*]+)\*/g, '<em class="markdown-italic">$1</em>')
        // 链接
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="markdown-link" target="_blank">🔗 $1</a>'
        )
        // 转义HTML
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    );
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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
  // 初始化全局命令点击处理
  terminal.addCommandClickHandlers();
});
