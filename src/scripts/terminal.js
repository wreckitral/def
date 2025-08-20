class InteractiveTerminal {
  constructor() {
    if (InteractiveTerminal.instance) {
      return InteractiveTerminal.instance;
    }
    InteractiveTerminal.instance = this;

    this.output = document.getElementById("terminal-output");
    this.input = document.getElementById("terminal-input");
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentDirectory = "~";
    this.isInitialized = false;

    this.fileSystem = {
      "about.txt": { type: "file" },
      "skills.json": { type: "file" },
      "contact.md": { type: "file" },
      "README.md": { type: "file" },
      ".zshrc": { type: "file" },
      ".vimrc": { type: "file" },
      projects: {
        type: "dir",
        contents: {
          "inference-server": { type: "dir", contents: {} },
          "rss-feed-aggregator": { type: "dir", contents: {} },
          "skripsi-lab": { type: "dir", contents: {} },
        },
      },
      dotfiles: {
        type: "dir",
        contents: {
          ".zshrc": { type: "file" },
          "nvim/": {
            type: "dir",
            contents: {
              "init.lua": { type: "file" },
            },
          },
          i3config: { type: "file" },
        },
      },
      scripts: {
        type: "dir",
        contents: {
          "setup.sh": { type: "file" },
          "deploy.sh": { type: "file" },
        },
      },
    };

    this.commands = {
      help: () => this.showHelp(),
      whoami: () => this.whoami(),
      ls: (args) => this.ls(args),
      cd: () => this.cd(),
      pwd: () => this.pwd(),
      cat: (args) => this.cat(args),
      about: () => this.about(),
      skills: () => this.skills(),
      projects: () => this.projects(),
      contact: () => this.contact(),
      clear: () => this.clear(),
      date: () => this.date(),
      uptime: () => this.uptime(),
      neofetch: () => this.neofetch(),
      tree: (args) => this.tree(args),
      echo: (args) => this.echo(args),
      history: () => this.showHistory(),
      theme: () => this.theme(),
    };

    this.init();
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    this.cleanup();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTerminalClick = this.handleTerminalClick.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);

    this.input.addEventListener("keydown", this.handleKeyDown);

    const terminalWindow = document.querySelector(".terminal-window");
    if (terminalWindow) {
      terminalWindow.addEventListener("click", this.handleTerminalClick);
    }

    window.addEventListener("resize", this.handleWindowResize);

    this.input.focus();
    this.isInitialized = true;

    console.log("Terminal initialized successfully");
  }

  cleanup() {
    if (this.input) {
      this.input.removeEventListener("keydown", this.handleKeyDown);
    }

    const terminalWindow = document.querySelector(".terminal-window");
    if (terminalWindow) {
      terminalWindow.removeEventListener("click", this.handleTerminalClick);
    }

    window.removeEventListener("resize", this.handleWindowResize);
  }

  handleTerminalClick() {
    this.input.focus();
  }

  handleWindowResize() {
    this.input.focus();
  }

  handleKeyDown(e) {
    console.log(`Key pressed: ${e.key}`); // debug log

    if (e.key === "Enter") {
      e.preventDefault();
      this.executeCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.navigateHistory(1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.autocomplete();
    }
  }

  executeCommand() {
    const input = this.input.value.trim();
    if (!input) return;

    console.log(`Executing command: ${input}`); // debug log

    if (this.commandHistory[this.commandHistory.length - 1] !== input) {
      this.commandHistory.push(input);
    }
    this.historyIndex = this.commandHistory.length;

    const promptTop = document.createElement("div");
    promptTop.className = "output-line";
    promptTop.style.margin = "0.5rem 0 0 0";
    promptTop.innerHTML = `<span style="color: var(--success); font-weight: 500;">┌──(</span><span style="color: var(--accent-blue); font-weight: 600;">defha</span><span style="color: var(--success); font-weight: 500;">@</span><span style="color: var(--accent-blue); font-weight: 600;">dev-arch</span><span style="color: var(--success); font-weight: 500;">)-[</span><span style="color: var(--text-primary); font-weight: 500;">${this.currentDirectory}</span><span style="color: var(--success); font-weight: 500;">]</span>`;

    const promptBottom = document.createElement("div");
    promptBottom.className = "output-line";
    promptBottom.style.margin = "0";
    promptBottom.innerHTML = `<span style="color: var(--success); font-weight: 500;">└─$ </span><span style="color: var(--text-primary);">${input}</span>`;

    this.output.appendChild(promptTop);
    this.output.appendChild(promptBottom);

    const [command, ...args] = input.split(" ");

    if (this.commands[command]) {
      console.log(`Running command: ${command}`); // debug log
      this.commands[command](args);
    } else {
      this.addOutput(`DefTerm: ${command}: command not found`, "error");
      this.addOutput(`Type 'help' to see available commands`, "command-help");
    }

    this.input.value = "";
    this.scrollToBottom();

    setTimeout(() => {
      this.input.focus();
    }, 50);
  }

  addOutput(text, className = "output-line") {
    const line = document.createElement("div");
    line.className = `output-line ${className}`;

    const cleanText = text.replace(/^\n+|\n+$/g, "").trim();

    if (cleanText.includes("\n")) {
      const lines = cleanText.split("\n");
      lines.forEach((lineText, index) => {
        if (lineText.trim() === "") return;

        if (index === 0) {
          line.innerHTML = lineText;
          this.output.appendChild(line);
        } else {
          const newLine = document.createElement("div");
          newLine.className = `output-line ${className}`;
          newLine.innerHTML = lineText;
          this.output.appendChild(newLine);
        }
      });
    } else {
      line.innerHTML = cleanText;
      this.output.appendChild(line);
    }
  }

  scrollToBottom() {
    this.output.scrollTop = this.output.scrollHeight;

    setTimeout(() => {
      this.input.focus();
      this.input.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }

  navigateHistory(direction) {
    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = "";
      return;
    }

    this.input.value = this.commandHistory[this.historyIndex] || "";
  }

  autocomplete() {
    const input = this.input.value.trim();
    const commands = Object.keys(this.commands);
    const matches = commands.filter((cmd) => cmd.startsWith(input));

    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.addOutput(matches.join("  "), "info");
    }
  }

  showHelp() {
    const helpText = `<div style="margin: 0.5rem 0;">
<span style="color: var(--info); font-weight: 600;">Available commands:</span>
</div>
<div style="margin: 0.8rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">NAVIGATION & INFO</span><br>
<span style="color: var(--text-primary);">help       - Show this help message</span><br>
<span style="color: var(--text-primary);">whoami     - Display current user</span><br>
<span style="color: var(--text-primary);">pwd        - Show current directory</span><br>
<span style="color: var(--text-primary);">ls [dir]   - List directory contents</span><br>
<span style="color: var(--text-primary);">clear      - Clear terminal screen</span><br>
<span style="color: var(--text-primary);">history    - Show command history</span>
</div>
<div style="margin: 0.8rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">PORTFOLIO</span><br>
<span style="color: var(--text-primary);">about      - About me</span><br>
<span style="color: var(--text-primary);">skills     - Technical skills</span><br>
<span style="color: var(--text-primary);">projects   - My projects</span><br>
<span style="color: var(--text-primary);">contact    - Contact information</span><br>
</div>
<div style="margin: 0.8rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">SYSTEM</span><br>
<span style="color: var(--text-primary);">date       - Show current date</span><br>
<span style="color: var(--text-primary);">uptime     - Show system uptime</span><br>
<span style="color: var(--text-primary);">neofetch   - Display system info</span><br>
<span style="color: var(--text-primary);">tree [dir] - Show directory tree</span><br>
<span style="color: var(--text-primary);">theme      - Show theme info</span>
</div>
<div style="margin: 0.8rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">UTILITIES</span><br>
<span style="color: var(--text-primary);">echo [text] - Print text</span><br>
<span style="color: var(--text-primary);">cat [file]  - Display file contents</span>
</div>
<div style="margin: 0.8rem 0;">
<span style="color: var(--command-help); font-style: italic;">Use Tab for autocompletion, ↑↓ for history</span>
</div>`;

    this.addOutput(helpText, "output-line");
  }

  whoami() {
    this.addOutput(
      '<span style="color: var(--success); font-weight: 600;">Defhanaya</span>',
      "output-line",
    );
    this.addOutput(
      '<span style="color: var(--text-primary);">Backend Developer | GPU Enthusiast | Linux & Vim for lyfe<3</span>',
      "output-line",
    );
  }

  findDirectory(dirPath) {
    if (!dirPath || dirPath === "." || dirPath === "~") {
      return this.fileSystem;
    }

    const cleanPath = dirPath.replace(/^\.\//, "");

    if (
      this.fileSystem[cleanPath] &&
      this.fileSystem[cleanPath].type === "dir"
    ) {
      return this.fileSystem[cleanPath].contents;
    }

    return null;
  }

  ls(args) {
    let targetDir = this.fileSystem;

    if (args && args.length > 0) {
      const dirPath = args[0];
      const foundDir = this.findDirectory(dirPath);

      if (foundDir === null) {
        this.addOutput(
          `<span style="color: var(--error);">ls: cannot access '${dirPath}': No such file or directory</span>`,
          "output-line",
        );
        return;
      }

      targetDir = foundDir;
    }

    const items = Object.keys(targetDir).sort();

    if (items.length === 0) {
      this.addOutput(
        '<span style="color: var(--command-help); font-style: italic;">Directory is empty</span>',
        "output-line",
      );
      return;
    }

    items.forEach((item) => {
      const itemData = targetDir[item];
      const isDir = itemData.type === "dir";
      const displayName = isDir ? item + "/" : item;
      const color = isDir ? "var(--accent-blue)" : "var(--text-primary)";

      this.addOutput(
        `<span style="color: ${color};">${displayName}</span>`,
        "output-line",
      );
    });
  }

  cd() {
    this.addOutput(
      `<span style="color: var(--info);">cd: this command is on development</span>`,
      "output-line",
    );
  }

  pwd() {
    this.addOutput(
      `<span style="color: var(--text-primary);">/home/defha${this.currentDirectory === "~" ? "" : this.currentDirectory}</span>`,
      "output-line",
    );
  }

  cat(args) {
    if (!args || args.length === 0) {
      this.addOutput(
        '<span style="color: var(--error);">cat: missing file operand</span>',
        "output-line",
      );
      return;
    }

    this.addOutput(
      '<span style="color: var(--info);">cat: this command is on development</span>',
      "output-line",
    );
  }

  about() {
    this.addOutput(
      `<div style="margin: 0.2rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">About Me</span>
</div>
<div style="color: var(--text-primary); margin: 0.2rem 0;">
Hi, my name is defhanaya but call me depa, im NVIDIA-certified associate: AI Infrastructure and Operations.
i love computer, its been 3 years since i start my developer journey,
i mostly do backend, but lately i've been obsessed with GPU programming,
aside from programming i also play guitar and a gym-rat
</div>
<div style="margin: 0.1rem 0;">
<span style="color: var(--success); font-weight: 600;">Curent Learning:</span><br>
<span style="color: var(--text-primary);">• GPU Programming</span><br>
<span style="color: var(--text-primary);">• HPC</span><br>
<span style="color: var(--text-primary);">• System Design</span><br>
</div>
</div>
<div style="margin: 0.1rem 0;">
<span style="color: var(--success); font-weight: 600;">On Going Research & Project:</span><br>
<span style="color: var(--text-primary);">• PTX optimization on Matrix Multiplication <strong>(research)</strong></span><br>
<span style="color: var(--text-primary);">• Scalable Production-ready Inference Server <strong>(project)</strong></span><br>

<span style="color: var(--command-help); font-style: italic;">more, type "projects" command</span><br>
</div>
</div>
<div style="margin: 0.1rem 0;">
<span style="color: var(--success); font-weight: 600;">Current Tech Stack:</span><br>
<span style="color: var(--text-primary);">• CUDA C/C++</span><br>
<span style="color: var(--text-primary);">• Golang</span><br>
<span style="color: var(--text-primary);">• Python</span><br>
</div>

<div style="color: var(--text-primary); margin: 0.5rem 0;">
When I'm not coding, you'll find me customizing my Linux setup,
read a book, or building a split keyboard.
</div>`,
      "output-line",
    );
  }

  skills() {
    this.addOutput(
      `<span style="color: var(--info);">skills: this command is on development</span>`,
      "output-line",
    );
  }

  projects() {
    this.addOutput(
      `<span style="color: var(--info);">projects: this command is on development</span>`,
      "output-line",
    );
  }

  contact() {
    this.addOutput(
      `
<div style="margin: 0.2rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">Get In Touch</span>
</div>

<div style="margin: 0.2rem 0;">
<span style="color: var(--text-primary);">📧 <span style="color: var(--success); font-weight: 600;">Email:</span>     defhanayasofhiea@gmail.com</span><br>
<span style="color: var(--text-primary);">🐱 <span style="color: var(--success); font-weight: 600;">GitHub:</span>    github.com/wrecktiral</span><br>
<span style="color: var(--text-primary);">💼 <span style="color: var(--success); font-weight: 600;">LinkedIn:</span>  linkedin.com/in/defhanaya</span><br>
<span style="color: var(--text-primary);">🐦 <span style="color: var(--success); font-weight: 600;">Twitter:</span>   @_scramblecode</span>
</div>

<div style="margin: 0.8rem 0;">
<span style="color: var(--warning);">$ echo "Hit me up! Yap with me! Anything!"</span>
</div>`,
      "output-line",
    );
  }

  clear() {
    this.output.innerHTML = "";

    this.addOutput(
      '<span style="color: var(--info); font-weight: 500;">DefTerm</span>',
      "output-line",
    );
    this.addOutput(
      "<span style=\"color: var(--command-help); font-style: italic;\">Type 'help' to see available commands</span>",
      "output-line",
    );
    this.addOutput(
      '<span style="color: var(--text-primary);">─────────────────────────────────────────────────</span>',
      "output-line",
    );
  }

  date() {
    const now = new Date();
    this.addOutput(
      `<span style="color: var(--text-primary);">${now.toString()}</span>`,
      "output-line",
    );
  }

  uptime() {
    const uptime = performance.now() / 1000;
    const minutes = Math.floor(uptime / 60);
    const seconds = Math.floor(uptime % 60);
    this.addOutput(
      `<span style="color: var(--text-primary);">Portfolio has been running for ${minutes}m ${seconds}s</span>`,
      "output-line",
    );
  }

  neofetch() {
    const uptime = performance.now() / 1000;
    const minutes = Math.floor(uptime / 60);
    const seconds = Math.floor(uptime % 60);

    this.addOutput(
      `
<div style="margin: 0.5rem 0;">
<span style="color: var(--accent-blue);">                   -\`               defha@dev-arch</span><br>
<span style="color: var(--accent-blue);">                  .o+\`              ──────────────────</span><br>
<span style="color: var(--accent-blue);">                 \`ooo/              OS: Arch Linux x86_64</span><br>
<span style="color: var(--accent-blue);">                \`+oooo:             Kernel: Portfolio v2025</span><br>
<span style="color: var(--accent-blue);">               \`+oooooo:            Shell: Defterm</span><br>
<span style="color: var(--accent-blue);">               -+oooooo+:           Terminal: Faliux</span><br>
<span style="color: var(--accent-blue);">             \`/:-:++oooo+:          CPU: NVIDIA Grace</span><br>
<span style="color: var(--accent-blue);">            \`/++++/+++++++:         Memory: Optimized</span><br>
<span style="color: var(--accent-blue);">           \`/++++++++++++++:        Theme: Tokyo Night</span><br>
<span style="color: var(--accent-blue);">          \`/+++ooooooooooooo/\`      Font: JetBrains Mono</span><br>
<span style="color: var(--accent-blue);">         ./ooosssso++osssssso+\`     Colors: Grey & LED Blue</span><br>
<span style="color: var(--accent-blue);">        .oossssso-\`\`\`\`/ossssss+\`    Uptime: ${minutes} minutes, ${seconds} seconds</span>
</div>`,
      "output-line preserve-format",
    );
  }

  renderTree(contents, prefix = "") {
    let output = "";
    const items = Object.keys(contents).sort();
    const totalItems = items.length;

    items.forEach((item, index) => {
      const isLast = index === totalItems - 1;
      const itemData = contents[item];
      const isDir = itemData.type === "dir";

      const connector = isLast ? "└── " : "├── ";
      const displayName = isDir ? item + "/" : item;
      const color = isDir ? "var(--accent-blue)" : "var(--success)";

      output += `<span style="color: var(--text-primary);">${prefix}${connector}<span style="color: ${color};">${displayName}</span></span><br>\n`;

      if (
        isDir &&
        itemData.contents &&
        Object.keys(itemData.contents).length > 0
      ) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        output += this.renderTree(itemData.contents, newPrefix);
      }
    });

    return output;
  }

  tree(args) {
    let targetContents = this.fileSystem;
    let displayPath = "~";

    if (args && args.length > 0) {
      const dirPath = args[0];
      const foundDir = this.findDirectory(dirPath);

      if (foundDir === null) {
        this.addOutput(
          `<span style="color: var(--error);">tree: cannot access '${dirPath}': No such file or directory</span>`,
          "output-line",
        );
        return;
      }

      targetContents = foundDir;
      displayPath = dirPath === "." || dirPath === "~" ? "~" : `~/${dirPath}`;
    }

    let treeOutput = '<div style="margin: 0.1rem 0;">\n';
    treeOutput += `<span style="color: var(--accent-blue);">${displayPath}</span><br>\n`;
    treeOutput += this.renderTree(targetContents);
    treeOutput += "</div>";

    this.addOutput(treeOutput, "output-line");
  }

  echo(args) {
    if (args && args.length > 0) {
      const text = args.join(" ");
      this.addOutput(
        `<span style="color: var(--text-primary);">${text}</span>`,
        "output-line",
      );
    } else {
      this.addOutput(`<br>`, "output-line");
    }
  }

  showHistory() {
    console.log(`History called. Commands: ${this.commandHistory.length}`); // debug log

    if (this.commandHistory.length === 0) {
      this.addOutput(
        '<span style="color: var(--command-help); font-style: italic;">No commands in history</span>',
        "output-line",
      );
      return;
    }

    this.commandHistory.forEach((cmd, index) => {
      this.addOutput(
        `<span style="color: var(--text-primary);">${index + 1}  ${cmd}</span>`,
        "output-line",
      );
    });
  }

  theme() {
    this.addOutput(
      `
<div style="margin: 0.5rem 0;">
<span style="color: var(--accent-blue); font-weight: 600;">Current Theme: Linux Ricing</span>
</div>

<div style="margin: 0.8rem 0;">
<span style="color: var(--success); font-weight: 600;">Colors:</span><br>
<span style="color: var(--text-primary);">├── Primary BG:   #0d1117 (GitHub Dark)</span><br>
<span style="color: var(--text-primary);">├── Secondary BG: #161b22</span><br>
<span style="color: var(--text-primary);">├── Accent:       #58a6ff (LED Blue)</span><br>
<span style="color: var(--text-primary);">├── Success:      #238636 (Terminal Green)</span><br>
<span style="color: var(--text-primary);">└── Warning:      #d29922 (Terminal Yellow)</span>
</div>

<div style="margin: 0.8rem 0;">
<span style="color: var(--success); font-weight: 600;">Font:</span><br>
<span style="color: var(--text-primary);">└── JetBrains Mono (Monospace)</span>
</div>

<div style="margin: 0.8rem 0;">
<span style="color: var(--success); font-weight: 600;">Inspiration:</span><br>
<span style="color: var(--text-primary);">└── Linux terminal aesthetics & ricing community</span>
</div>`,
      "output-line",
    );
  }

  static getInstance() {
    if (!InteractiveTerminal.instance) {
      new InteractiveTerminal();
    }
    return InteractiveTerminal.instance;
  }

  destroy() {
    this.cleanup();
    InteractiveTerminal.instance = null;
  }
}

let terminalInitialized = false;

function initTerminal() {
  if (terminalInitialized) {
    console.log("Terminal already initialized");
    return;
  }

  const terminalOutput = document.getElementById("terminal-output");
  const terminalInput = document.getElementById("terminal-input");

  if (!terminalOutput || !terminalInput) {
    console.error("Terminal elements not found");
    return;
  }

  console.log("Initializing terminal...");
  new InteractiveTerminal();
  terminalInitialized = true;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTerminal);
} else {
  initTerminal();
}

window.addEventListener("load", () => {
  if (!terminalInitialized) {
    initTerminal();
  }
});

window.InteractiveTerminal = InteractiveTerminal;
