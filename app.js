document.addEventListener("DOMContentLoaded", () => {
    // Global Error Overlay for Debugging
    window.addEventListener('error', function (e) {
        let errDiv = document.getElementById('debug-error-overlay');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'debug-error-overlay';
            errDiv.style.position = 'fixed';
            errDiv.style.bottom = '30px';
            errDiv.style.left = '10px';
            errDiv.style.background = 'rgba(255, 0, 0, 0.95)';
            errDiv.style.color = '#ffffff';
            errDiv.style.padding = '15px';
            errDiv.style.zIndex = '999999';
            errDiv.style.fontFamily = 'monospace';
            errDiv.style.fontSize = '12px';
            errDiv.style.borderRadius = '5px';
            errDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            errDiv.style.maxHeight = '200px';
            errDiv.style.overflow = 'auto';
            document.body.appendChild(errDiv);
        }
        errDiv.innerHTML += `<div style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">❌ Hata: ${e.message}<br><small style="color: #ccc;">Dosya: ${e.filename.split('/').pop()} | Satır: ${e.lineno}</small></div>`;
    });

    // --- State Elements ---
    let currentBoard = "ESP32 Dev Module";
    let currentPort = "COM4";
    let isConsoleMaximized = false;
    let uploadProgressInterval = null;
    let isCompilingOrUploading = false;
    let editorFontSize = 14; // px
    let undoStack = [];
    let redoStack = [];
    let lastSavedCode = "";

    // Board Options State & Maps
    let boardOptions = {
        EraseFlash: "none",
        EventsCore: "1",
        FlashFreq: "80",
        FlashMode: "qio",
        FlashSize: "4M",
        JTAGAdapter: "default",
        LoopCore: "1",
        PartitionScheme: "default",
        PSRAM: "disabled",
        UploadSpeed: "921600",
        ZigbeeMode: "default",
        DebugLevel: "none"
    };

    const OPTION_KEY_MAP = {
        "Core Debug Level": "DebugLevel",
        "Erase All Flash Before Sketch Upload": "EraseFlash",
        "Events Run On": "EventsCore",
        "Flash Frequency": "FlashFreq",
        "Flash Mode": "FlashMode",
        "Flash Size": "FlashSize",
        "JTAG Adapter": "JTAGAdapter",
        "Arduino Runs On": "LoopCore",
        "Partition Scheme": "PartitionScheme",
        "PSRAM": "PSRAM",
        "Upload Speed": "UploadSpeed",
        "Zigbee Mode": "ZigbeeMode"
    };

    // Generic handler for submenu options (EraseFlash, PSRAM, etc.)
    document.querySelectorAll(".submenu").forEach(submenu => {
        if (submenu.id === "menuBoardSubmenu" || submenu.id === "menuPortSubmenu") return;

        submenu.querySelectorAll(".menu-row").forEach(row => {
            row.addEventListener("click", (e) => {
                e.stopPropagation();
                const valText = row.textContent.trim();
                const parent = submenu.closest(".parent");
                if (!parent) return;

                const labelSpan = parent.querySelector("span");
                if (!labelSpan) return;

                const valSpan = labelSpan.querySelector(".opt-val");
                if (valSpan) {
                    valSpan.textContent = valText;
                }

                const labelTextFull = labelSpan.textContent;
                const labelName = labelTextFull.split(":")[0].trim();

                const optKey = OPTION_KEY_MAP[labelName];
                let optVal = valText;

                // Specific value mappings per key to prevent flat lookup collisions
                if (optKey === "DebugLevel") {
                    const debugMap = { "None": "none", "Error": "err", "Warning": "warn", "Info": "info", "Debug": "dbg", "Verbose": "verbose" };
                    optVal = debugMap[valText] || valText.toLowerCase();
                } else if (optKey === "EraseFlash") {
                    optVal = (valText === "Enabled") ? "all" : "none";
                } else if (optKey === "EventsCore") {
                    optVal = (valText === "Core 0") ? "0" : "1";
                } else if (optKey === "FlashFreq") {
                    optVal = valText.replace("MHz", "");
                } else if (optKey === "FlashMode") {
                    optVal = valText.toLowerCase();
                } else if (optKey === "FlashSize") {
                    const sizeMap = { "2MB (16Mb)": "2M", "4MB (32Mb)": "4M", "8MB (64Mb)": "8M", "16MB (128Mb)": "16M" };
                    optVal = sizeMap[valText] || valText;
                } else if (optKey === "JTAGAdapter") {
                    optVal = (valText === "Integrated USB JTAG") ? "integrated" : "default";
                } else if (optKey === "LoopCore") {
                    optVal = (valText === "Core 0") ? "0" : "1";
                } else if (optKey === "PartitionScheme") {
                    const partMap = {
                        "Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)": "default",
                        "Default 4MB with ffat (1.2MB APP/1.5MB FATFS)": "default_ffat",
                        "Minimal (1.3MB APP/700KB SPIFFS)": "minimal",
                        "No OTA (2MB APP/2MB SPIFFS)": "no_ota",
                        "Huge APP (3MB No OTA/1MB SPIFFS)": "huge_app",
                        "Minimal SPIFFS (1.9MB APP/190KB SPIFFS)": "min_spiffs"
                    };
                    optVal = partMap[valText] || valText;
                } else if (optKey === "PSRAM") {
                    const psramMap = { "Disabled": "disabled", "QSPI": "enabled", "OPI": "opi", "Enabled": "enabled", "OPI PSRAM": "opi" };
                    optVal = psramMap[valText] || "disabled";
                } else if (optKey === "UploadSpeed") {
                    optVal = valText;
                } else if (optKey === "ZigbeeMode") {
                    const zigbeeMap = { "Disabled": "default", "ED (Zigbee End Device)": "ed", "ZCZR (Zigbee Coordinator/Router)": "zczr" };
                    optVal = zigbeeMap[valText] || "default";
                }

                if (optKey) {
                    boardOptions[optKey] = optVal;
                    console.log(`[Ayarlar] ${optKey} ayarı ${optVal} olarak güncellendi.`);
                }

                // Hide dropdown
                const parentDropdown = submenu.closest(".dropdown-menu");
                if (parentDropdown) {
                    parentDropdown.style.display = "none";
                    setTimeout(() => parentDropdown.style.display = "", 150);
                }
            });
        });
    });


    // Global selectBoard function for all board selection elements
    window.selectBoard = function (boardName) {
        currentBoard = boardName;
        const activeBoardLabel = document.getElementById("activeBoardLabel");
        if (activeBoardLabel) activeBoardLabel.textContent = boardName;

        const statusBoardText = document.getElementById("statusBoardText");
        if (statusBoardText) statusBoardText.textContent = `${currentBoard} - ${currentPort || "Port Seçilmedi"} [bağlı]`;

        const toolbarBoardText = document.getElementById("toolbarBoardText");
        if (toolbarBoardText) toolbarBoardText.textContent = boardName;

        // Debug visual flash to confirm execution
        document.body.style.border = '5px solid #00ff00';
        setTimeout(() => {
            document.body.style.border = '';
        }, 500);

        console.log(`[Sistem] Kart seçildi: ${boardName}`);
    };

    // --- DOM Elements ---
    const codeTextarea = document.getElementById("codeTextarea");
    const highlightOverlay = document.getElementById("highlightOverlay");
    const lineNumbers = document.getElementById("lineNumbers");

    const toolbarBoardText = document.getElementById("toolbarBoardText");
    const activeBoardLabel = document.getElementById("activeBoardLabel");

    // Board dropdown elements
    const boardDropdownTrigger = document.getElementById("boardDropdownTrigger");
    const boardDropdownMenu = document.getElementById("boardDropdownMenu");
    const boardSearchInput = document.getElementById("boardSearchInput");
    const boardList = document.getElementById("boardList");

    // Console elements
    const consolePanel = document.getElementById("consolePanel");
    const consoleLogContent = document.getElementById("consoleLogContent");
    const copyConsoleBtn = document.getElementById("copyConsoleBtn");
    const clearConsoleBtn = document.getElementById("clearConsoleBtn");
    const toggleConsoleHeight = document.getElementById("toggleConsoleHeight");
    const closeConsoleBtn = document.getElementById("closeConsoleBtn");

    // Sidebar panels
    const sidebarTabs = document.querySelectorAll(".sidebar-tab");
    const sidebarPanelContainer = document.getElementById("sidebarPanelContainer");
    const panelContents = document.querySelectorAll(".panel-content");

    // Modal elements
    const compileProgressModal = document.getElementById("compileProgressModal");
    const progressMessage = document.getElementById("progressMessage");
    const progressFill = document.getElementById("progressFill");
    const btnCancelProgress = document.getElementById("btnCancelProgress");

    // Toolbar buttons
    const btnVerify = document.getElementById("btnVerify");
    const btnUpload = document.getElementById("btnUpload");
    const btnToolbarSerial = document.getElementById("btnToolbarSerial");

    // Status bar Elements
    const cursorPosition = document.getElementById("cursorPosition");
    const statusBoardText = document.getElementById("statusBoardText");

    // --- 1. Load Sketch on Start ---
    async function loadSketch() {
        console.log("[API] Sketch yükleniyor...");
        try {
            const res = await fetch("/api/sketch");
            const data = await res.json();
            if (data.code) {
                codeTextarea.value = data.code;
                lastSavedCode = data.code;
                updateEditor();
            }
        } catch (err) {
            console.error("Sketch yüklenemedi:", err);
        }
    }
    loadSketch();

    // --- 2. Auto-save / Save Functionality ---
    async function saveSketch() {
        console.log("[API] Sketch kaydediliyor...");
        try {
            const res = await fetch("/api/sketch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeTextarea.value })
            });
            const data = await res.json();
            if (data.success) {
                console.log("[API] Sketch başarıyla kaydedildi.");
            }
        } catch (err) {
            console.error("Sketch kaydedilemedi:", err);
        }
    }

    // --- 3. Code Editor Syntax Highlighting & Line Numbers ---
    function escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function highlightC(code) {
        let escaped = escapeHTML(code);
        const placeholders = [];

        // 1. Extract comments & strings to placeholders to avoid regex overlapping
        escaped = escaped.replace(/(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, (match) => {
            const id = `___PLACEHOLDER_${placeholders.length}___`;
            placeholders.push({ id, content: match });
            return id;
        });

        // 2. Replace keywords, types, and builtins in a single word match pass
        const keywords = new Set(["void", "if", "else", "for", "while", "return", "class", "struct", "switch", "case", "break", "continue", "const"]);
        const types = new Set(["int", "float", "double", "char", "bool", "unsigned", "long", "short", "string"]);
        const builtins = new Set(["pinMode", "digitalWrite", "digitalRead", "analogRead", "analogWrite", "delay", "Serial", "begin", "println", "print", "setup", "loop"]);

        escaped = escaped.replace(/\b[a-zA-Z_]\w*\b/g, (word) => {
            if (keywords.has(word)) {
                return `<span class="hl-keyword">${word}</span>`;
            } else if (types.has(word)) {
                return `<span class="hl-type">${word}</span>`;
            } else if (builtins.has(word)) {
                return `<span class="hl-builtin">${word}</span>`;
            }
            return word;
        });

        // 5. Restore comments/strings wrapped in spans
        placeholders.forEach(item => {
            let wrapped = item.content;
            if (item.content.startsWith("//") || item.content.startsWith("/*")) {
                wrapped = `<span class="hl-comment">${item.content}</span>`;
            } else if (item.content.startsWith('"') || item.content.startsWith("'")) {
                wrapped = `<span class="hl-string">${item.content}</span>`;
            }
            escaped = escaped.replace(item.id, wrapped);
        });

        return escaped;
    }

    function updateEditor() {
        const text = codeTextarea.value;

        // Highlight overlay
        highlightOverlay.innerHTML = highlightC(text) + "\n"; // extra newline to match height

        // Line Numbers
        const lines = text.split("\n");
        let lineNumsHTML = "";
        for (let i = 1; i <= Math.max(lines.length, 10); i++) {
            lineNumsHTML += `<div>${i}</div>`;
        }
        lineNumbers.innerHTML = lineNumsHTML;

        // Match scroll position
        highlightOverlay.scrollTop = codeTextarea.scrollTop;
        highlightOverlay.scrollLeft = codeTextarea.scrollLeft;

        updateCursorPos();
    }

    function updateCursorPos() {
        const text = codeTextarea.value;
        const selStart = codeTextarea.selectionStart;
        const sub = text.substring(0, selStart);
        const lines = sub.split("\n");
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        cursorPosition.textContent = `Satır ${line}, Sütun ${col}`;
    }

    codeTextarea.addEventListener("input", () => {
        // Push to undo stack before each change
        undoStack.push(lastSavedCode);
        if (undoStack.length > 100) undoStack.shift();
        redoStack = [];
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch(); // Auto-save on type
    });

    codeTextarea.addEventListener("scroll", () => {
        highlightOverlay.scrollTop = codeTextarea.scrollTop;
        highlightOverlay.scrollLeft = codeTextarea.scrollLeft;
        lineNumbers.scrollTop = codeTextarea.scrollTop;
    });

    ["click", "keyup", "keydown", "focus"].forEach(evt => {
        codeTextarea.addEventListener(evt, updateCursorPos);
    });

    // --- 4. Sidebar Panels Toggle ---
    sidebarTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            console.log(`[UI] Sidebar tab tıklandı: ${tab.title || tab.id}`);

            if (tab.id === "btnSettings") {
                // Toggle settings modal
                let settingsModal = document.getElementById("settingsModal");
                if (!settingsModal) {
                    settingsModal = document.createElement("div");
                    settingsModal.id = "settingsModal";
                    settingsModal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;";
                    settingsModal.innerHTML = `
                        <div style="background:#1e1e1e;border:1px solid #3c3c3c;border-radius:8px;padding:24px;width:420px;max-height:80vh;overflow-y:auto;color:#ccc;font-family:Inter,sans-serif;">
                            <h3 style="margin:0 0 16px;color:#00979d;">⚙ Kullanıcı Ayarları</h3>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;">Yazı Tipi Boyutu</label>
                                <input type="range" min="10" max="24" value="${editorFontSize}" id="settingsFontSize" style="width:100%;">
                                <span id="settingsFontSizeVal">${editorFontSize}px</span>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;">Tema</label>
                                <select id="settingsTheme" style="width:100%;padding:6px;background:#2d2d2d;color:#ccc;border:1px solid #555;border-radius:4px;">
                                    <option value="dark" selected>Koyu Tema</option>
                                    <option value="light">Açık Tema (yakında)</option>
                                </select>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;">Otomatik Kaydetme</label>
                                <label style="font-size:12px;"><input type="checkbox" id="settingsAutoSave" checked> Aktif</label>
                            </div>
                            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
                                <button id="settingsClose" style="padding:6px 16px;background:#3c3c3c;color:#ccc;border:none;border-radius:4px;cursor:pointer;">Kapat</button>
                                <button id="settingsApply" style="padding:6px 16px;background:#00979d;color:#fff;border:none;border-radius:4px;cursor:pointer;">Uygula</button>
                            </div>
                        </div>`;
                    document.body.appendChild(settingsModal);

                    settingsModal.querySelector("#settingsClose").addEventListener("click", () => settingsModal.remove());
                    settingsModal.addEventListener("click", (e) => { if (e.target === settingsModal) settingsModal.remove(); });
                    settingsModal.querySelector("#settingsFontSize").addEventListener("input", (e) => {
                        settingsModal.querySelector("#settingsFontSizeVal").textContent = e.target.value + "px";
                    });
                    settingsModal.querySelector("#settingsApply").addEventListener("click", () => {
                        editorFontSize = parseInt(settingsModal.querySelector("#settingsFontSize").value);
                        codeTextarea.style.fontSize = editorFontSize + "px";
                        highlightOverlay.style.fontSize = editorFontSize + "px";
                        settingsModal.remove();
                    });
                }
                return;
            }

            const targetPanelId = tab.getAttribute("data-panel");
            const targetPanel = document.getElementById(targetPanelId);

            if (tab.classList.contains("active")) {
                // If clicking active tab, collapse the panel
                tab.classList.remove("active");
                sidebarPanelContainer.classList.add("hidden");
            } else {
                // Activate clicked panel
                sidebarTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                sidebarPanelContainer.classList.remove("hidden");

                panelContents.forEach(p => p.classList.remove("active"));
                targetPanel.classList.add("active");
            }
        });
    });

    // --- 5. Board Selector sync ---
    function selectBoard(boardName) {
        console.log(`[Board] Kart seçildi: ${boardName}`);
        currentBoard = boardName;
        toolbarBoardText.textContent = boardName;
        activeBoardLabel.textContent = boardName;
        statusBoardText.textContent = `${boardName} - ${currentPort} [bağlı değil]`;

        // Mark active item in list
        document.querySelectorAll(".board-item, .board-option").forEach(el => {
            if (el.getAttribute("data-board") === boardName) {
                el.classList.add("active");
            } else {
                el.classList.remove("active");
            }
        });
    }

    boardDropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("[UI] Toolbar Kart Seçimi açıldı.");
        boardDropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        boardDropdownMenu.classList.remove("show");
    });

    boardDropdownMenu.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Board search filter
    boardSearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(".board-item").forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });

    // Click items inside board lists
    document.querySelectorAll(".board-item").forEach(item => {
        item.addEventListener("click", () => {
            window.selectBoard(item.getAttribute("data-board"));
            boardDropdownMenu.classList.remove("show");
        });
    });

    document.querySelectorAll(".board-option").forEach(option => {
        option.addEventListener("click", () => {
            window.selectBoard(option.getAttribute("data-board"));
        });
    });

    // Dynamic Port detection
    const activePortLabel = document.getElementById("activePortLabel");
    const menuPortSubmenu = document.getElementById("menuPortSubmenu");

    async function updatePortsList() {
        try {
            const res = await fetch("/api/ports");
            const data = await res.json();
            const ports = data.ports || [];

            if (ports.length === 0) {
                activePortLabel.textContent = "Yok";
                menuPortSubmenu.innerHTML = '<div class="menu-row no-ports">Bağlı port bulunamadı</div>';
                currentPort = "";
                statusBoardText.textContent = `${currentBoard} - Port Seçilmedi`;
            } else {
                const portNames = ports.map(p => p.port);
                if (!portNames.includes(currentPort)) {
                    currentPort = portNames[0];
                }
                activePortLabel.textContent = currentPort;
                statusBoardText.textContent = `${currentBoard} - ${currentPort} [bağlı]`;

                menuPortSubmenu.innerHTML = "";
                ports.forEach(p => {
                    const row = document.createElement("div");
                    row.className = `menu-row port-option ${p.port === currentPort ? 'active' : ''}`;
                    row.setAttribute("data-port", p.port);
                    row.innerHTML = `<span>${p.port} (${p.board})</span>`;

                    row.addEventListener("click", (e) => {
                        e.stopPropagation();
                        currentPort = p.port;
                        activePortLabel.textContent = currentPort;
                        statusBoardText.textContent = `${currentBoard} - ${currentPort} [bağlı]`;
                        updatePortsList();

                        // Hide dropdown hack
                        const parentDropdown = row.closest('.dropdown-menu');
                        if (parentDropdown) {
                            parentDropdown.style.display = 'none';
                            setTimeout(() => parentDropdown.style.display = '', 150);
                        }
                    });

                    menuPortSubmenu.appendChild(row);
                });
            }
        } catch (err) {
            console.error("Portlar yüklenemedi:", err);
        }
    }

    updatePortsList();
    setInterval(updatePortsList, 3000);


    // --- 6. Compile & Upload Simulation & Logs ---
    function addConsoleLog(text, type = "") {
        const div = document.createElement("div");
        div.textContent = text;
        if (type === "error") div.classList.add("log-error");
        if (type === "success") div.classList.add("log-success");
        consoleLogContent.appendChild(div);
        consoleLogContent.scrollTop = consoleLogContent.scrollHeight;
    }

    async function handleCompile() {
        if (isCompilingOrUploading) return;
        isCompilingOrUploading = true;

        console.log("[Compile] Derleme başlatıldı.");
        consolePanel.style.height = "220px";
        consoleLogContent.innerHTML = "";

        progressMessage.textContent = "Eskiz derleniyor...";
        progressFill.style.width = "0%";
        compileProgressModal.classList.add("show");

        let progress = 0;
        uploadProgressInterval = setInterval(() => {
            if (progress < 90) {
                progress += 5;
                progressFill.style.width = `${progress}%`;
            }
        }, 150);

        try {
            const res = await fetch("/api/compile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: codeTextarea.value,
                    board: currentBoard,
                    board_options: boardOptions
                })
            });
            const data = await res.json();

            clearInterval(uploadProgressInterval);
            progressFill.style.width = "100%";

            setTimeout(() => {
                compileProgressModal.classList.remove("show");
                isCompilingOrUploading = false;

                if (data.log) {
                    data.log.forEach(line => {
                        addConsoleLog(line, data.success ? "" : "error");
                    });
                }
                if (data.success) {
                    addConsoleLog("Derleme başarıyla tamamlandı.", "success");
                } else {
                    addConsoleLog("Derleme sırasında hata oluştu.", "error");
                }
            }, 500);

        } catch (err) {
            clearInterval(uploadProgressInterval);
            compileProgressModal.classList.remove("show");
            isCompilingOrUploading = false;
            addConsoleLog("Hata: Sunucu ile iletişim kurulamadı.", "error");
        }
    }

    async function handleUpload() {
        if (isCompilingOrUploading) return;

        // If board is ESP, use web flasher if possible
        if (currentBoard && currentBoard.includes("ESP") && "serial" in navigator && typeof window.esptooljs !== 'undefined') {
            await handleWebUpload();
            return;
        }

        isCompilingOrUploading = true;
        disconnectSerial();

        console.log("[Upload] Yükleme başlatıldı (Arka Plan).");
        consolePanel.style.height = "220px";
        consoleLogContent.innerHTML = "";

        progressMessage.textContent = "Karta yükleniyor...";
        progressFill.style.width = "0%";
        compileProgressModal.classList.add("show");

        let progress = 0;
        uploadProgressInterval = setInterval(() => {
            if (progress < 90) {
                progress += 5;
                progressFill.style.width = `${progress}%`;
            }
        }, 150);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: codeTextarea.value,
                    board: currentBoard,
                    port: currentPort,
                    board_options: boardOptions
                })
            });
            const data = await res.json();

            clearInterval(uploadProgressInterval);
            progressFill.style.width = "100%";

            setTimeout(() => {
                compileProgressModal.classList.remove("show");
                isCompilingOrUploading = false;

                if (data.log) {
                    data.log.forEach(line => {
                        addConsoleLog(line, data.success ? "" : "error");
                    });
                }
                if (data.success) {
                    addConsoleLog("Yükleme tamamlandı!", "success");
                } else {
                    addConsoleLog("Yükleme sırasında hata oluştu.", "error");
                }

                // Reconnect serial monitor after upload completes
                if (paneSerial.classList.contains("active")) {
                    connectSerial();
                }
            }, 500);

        } catch (err) {
            clearInterval(uploadProgressInterval);
            compileProgressModal.classList.remove("show");
            isCompilingOrUploading = false;
            addConsoleLog("Hata: Yükleme sunucu hatası.", "error");

            // Reconnect serial monitor on connection error
            if (paneSerial.classList.contains("active")) {
                connectSerial();
            }
        }
    }

    async function handleWebUpload() {
        let port;
        try {
            // Android Kernel often lacks CH340/CP2102 drivers, making navigator.serial list empty.
            // In this case, we use the WebUSB polyfill (exposed globally as 'serial') to bypass the kernel.
            if (navigator.userAgent.includes("Android") && typeof serial !== 'undefined') {
                console.log("[Web Upload] Android tespit edildi, WebUSB polyfill kullanılıyor...");
                port = await serial.requestPort();
            } else {
                port = await navigator.serial.requestPort();
            }
        } catch (err) {
            console.error("Port seçilmedi veya iptal edildi:", err);
            addConsoleLog("Port seçilmedi veya donanım desteklemiyor.", "error");
            return;
        }

        isCompilingOrUploading = true;
        disconnectSerial();
        console.log("[Web Upload] Derleme başlatılıyor...");
        consolePanel.style.height = "220px";
        consoleLogContent.innerHTML = "";

        progressMessage.textContent = "Derleniyor (Web Yükleme Öncesi)...";
        progressFill.style.width = "0%";
        compileProgressModal.classList.add("show");

        let progress = 0;
        uploadProgressInterval = setInterval(() => {
            if (progress < 40) {
                progress += 5;
                progressFill.style.width = `${progress}%`;
            }
        }, 300);

        let transport = null;
        try {
            // 1. Compile and get binary name
            const res = await fetch("/api/export-binary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: codeTextarea.value,
                    board: currentBoard,
                    board_options: boardOptions
                })
            });
            const data = await res.json();

            if (data.log) {
                data.log.forEach(line => addConsoleLog(line, data.success ? "" : "error"));
            }

            if (!data.success || !data.filename) {
                throw new Error("Derleme başarısız oldu.");
            }

            progressMessage.textContent = "İkili dosya indiriliyor...";
            progressFill.style.width = "50%";

            // 2. Fetch the binary ArrayBuffer
            const binRes = await fetch(`/api/download-binary?file=${data.filename}`);
            if (!binRes.ok) throw new Error("Derlenmiş dosya alınamadı.");
            const binBuffer = await binRes.arrayBuffer();
            const firmwareData = new Uint8Array(binBuffer);

            compileProgressModal.classList.remove("show");

            // 3. Connect to Web Serial
            addConsoleLog("Tarayıcıdan ESP'ye bağlanılıyor...", "");
            transport = new window.esptooljs.Transport(port);

            const terminal = {
                clean: () => { },
                writeLine: (msg) => { console.log(msg); addConsoleLog(msg, "info"); },
                write: (msg) => { console.log(msg); }
            };

            const baudrate = parseInt(serialBaudrate.value, 10) || 115200;
            const esploader = new window.esptooljs.ESPLoader(transport, baudrate, terminal);

            progressMessage.textContent = "ESP'ye bağlanılıyor...";
            progressFill.style.width = "60%";
            compileProgressModal.classList.add("show");

            await esploader.main();

            let flashOffset = 0x10000;
            if (currentBoard.includes("ESP8266")) {
                flashOffset = 0x0;
            }

            progressMessage.textContent = `Yazdırılıyor (Adres: 0x${flashOffset.toString(16)})...`;
            progressFill.style.width = "75%";

            addConsoleLog(`Flash işlemi başladı (Offset: 0x${flashOffset.toString(16)}), lütfen bekleyin...`, "info");

            await esploader.flashBegin(firmwareData.length, flashOffset);

            let currentOffset = flashOffset;
            let dataOffset = 0;
            const flashWriteSize = esploader.flash_write_size || 0x4000;

            while (dataOffset < firmwareData.length) {
                const chunkLen = Math.min(flashWriteSize, firmwareData.length - dataOffset);
                const chunk = firmwareData.slice(dataOffset, dataOffset + chunkLen);
                await esploader.flashBlock(chunk, currentOffset);
                currentOffset += chunkLen;
                dataOffset += chunkLen;
                const percent = Math.floor((dataOffset / firmwareData.length) * 100);
                progressMessage.textContent = `Yazdırılıyor: %${percent}`;
                progressFill.style.width = `${75 + (percent * 0.25)}%`;
            }

            progressFill.style.width = "100%";
            addConsoleLog("Yükleme Tamamlandı! ESP yeniden başlatılıyor...", "success");

            await esploader.after("hard_reset");

        } catch (err) {
            console.error("Web Upload Hatası:", err);
            addConsoleLog("Web Upload Hatası: " + err.message, "error");
        } finally {
            if (transport) {
                try { await transport.disconnect(); } catch (e) { }
            }
            clearInterval(uploadProgressInterval);
            compileProgressModal.classList.remove("show");
            isCompilingOrUploading = false;
        }
    }

    btnVerify.addEventListener("click", handleCompile);
    btnUpload.addEventListener("click", handleUpload);

    btnCancelProgress.addEventListener("click", () => {
        console.log("[Compile/Upload] İşlem iptal edildi.");
        clearInterval(uploadProgressInterval);
        compileProgressModal.classList.remove("show");
        isCompilingOrUploading = false;
        addConsoleLog("İşlem kullanıcı tarafından iptal edildi.", "error");
    });

    // --- 7. Console Controls ---
    copyConsoleBtn.addEventListener("click", () => {
        let textToCopy = "";
        if (paneOutput.classList.contains("active")) {
            textToCopy = consoleLogContent.innerText;
        } else if (paneSerial.classList.contains("active")) {
            // Remove the status lines if needed, or copy raw text
            textToCopy = serialTerminal.innerText;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            console.log("[Console] İçerik panoya kopyalandı.");
            copyConsoleBtn.textContent = "✅";
            setTimeout(() => {
                copyConsoleBtn.textContent = "📋";
            }, 1500);
        }).catch(err => {
            console.error("Kopyalama başarısız:", err);
        });
    });

    clearConsoleBtn.addEventListener("click", () => {
        consoleLogContent.innerHTML = "";
        console.log("[Console] Çıkış ekranı temizlendi.");
    });

    closeConsoleBtn.addEventListener("click", () => {
        consolePanel.style.height = "32px";
        console.log("[Console] Çıkış ekranı kapatıldı.");
    });

    toggleConsoleHeight.addEventListener("click", () => {
        if (!isConsoleMaximized) {
            consolePanel.style.height = "80vh";
            isConsoleMaximized = true;
        } else {
            consolePanel.style.height = "220px";
            isConsoleMaximized = false;
        }
    });

    // --- 8. Real Menu Bar action implementations ---

    // Helper: Undo
    function editorUndo() {
        codeTextarea.focus();
        document.execCommand("undo");
    }

    // Helper: Redo
    function editorRedo() {
        codeTextarea.focus();
        document.execCommand("redo");
    }

    // Helper: Toggle comment on selected lines
    function toggleComment() {
        const start = codeTextarea.selectionStart;
        const end = codeTextarea.selectionEnd;
        const text = codeTextarea.value;
        const before = text.substring(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const after = text.substring(end);
        const lineEnd = after.indexOf("\n");
        const selectedBlock = text.substring(lineStart, lineEnd === -1 ? text.length : end + lineEnd);
        const lines = selectedBlock.split("\n");
        const allCommented = lines.every(l => l.trimStart().startsWith("//"));
        const newLines = lines.map(l => {
            if (allCommented) {
                return l.replace(/^(\s*)\/\/\s?/, "$1");
            } else {
                return "// " + l;
            }
        });
        const newBlock = newLines.join("\n");
        undoStack.push(codeTextarea.value);
        redoStack = [];
        codeTextarea.value = text.substring(0, lineStart) + newBlock + text.substring(lineEnd === -1 ? text.length : end + lineEnd);
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
    }

    // Helper: Increase indent on selected lines
    function increaseIndent() {
        const start = codeTextarea.selectionStart;
        const end = codeTextarea.selectionEnd;
        const text = codeTextarea.value;
        const before = text.substring(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const after = text.substring(end);
        const lineEnd = after.indexOf("\n");
        const selectedBlock = text.substring(lineStart, lineEnd === -1 ? text.length : end + lineEnd);
        const newBlock = selectedBlock.split("\n").map(l => "  " + l).join("\n");
        undoStack.push(codeTextarea.value);
        redoStack = [];
        codeTextarea.value = text.substring(0, lineStart) + newBlock + text.substring(lineEnd === -1 ? text.length : end + lineEnd);
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
    }

    // Helper: Decrease indent on selected lines
    function decreaseIndent() {
        const start = codeTextarea.selectionStart;
        const end = codeTextarea.selectionEnd;
        const text = codeTextarea.value;
        const before = text.substring(0, start);
        const lineStart = before.lastIndexOf("\n") + 1;
        const after = text.substring(end);
        const lineEnd = after.indexOf("\n");
        const selectedBlock = text.substring(lineStart, lineEnd === -1 ? text.length : end + lineEnd);
        const newBlock = selectedBlock.split("\n").map(l => l.replace(/^  /, "")).join("\n");
        undoStack.push(codeTextarea.value);
        redoStack = [];
        codeTextarea.value = text.substring(0, lineStart) + newBlock + text.substring(lineEnd === -1 ? text.length : end + lineEnd);
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
    }

    // Helper: Auto-format (basic C indent formatter)
    function autoFormat() {
        undoStack.push(codeTextarea.value);
        redoStack = [];
        let lines = codeTextarea.value.split("\n");
        let indent = 0;
        let formatted = [];
        for (let line of lines) {
            let trimmed = line.trim();
            if (trimmed.startsWith("}") || trimmed.startsWith(")")) {
                indent = Math.max(0, indent - 1);
            }
            formatted.push("  ".repeat(indent) + trimmed);
            if (trimmed.endsWith("{") || trimmed.endsWith("(")) {
                indent++;
            }
        }
        codeTextarea.value = formatted.join("\n");
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
        addConsoleLog("Kod otomatik biçimlendirildi.", "success");
        consolePanel.style.height = "220px";
    }

    // Helper: Go to line
    function goToLine() {
        const input = prompt("Satır numarası:");
        if (!input) return;
        const lineNum = parseInt(input);
        if (isNaN(lineNum) || lineNum < 1) return;
        const lines = codeTextarea.value.split("\n");
        if (lineNum > lines.length) return;
        let pos = 0;
        for (let i = 0; i < lineNum - 1; i++) {
            pos += lines[i].length + 1;
        }
        codeTextarea.focus();
        codeTextarea.setSelectionRange(pos, pos);
        // Scroll to line
        const lineHeight = parseInt(getComputedStyle(codeTextarea).lineHeight) || 20;
        codeTextarea.scrollTop = (lineNum - 5) * lineHeight;
        updateCursorPos();
    }

    // Helper: Find in code
    function openFind() {
        let findBar = document.getElementById("findBar");
        if (findBar) { findBar.remove(); return; }
        findBar = document.createElement("div");
        findBar.id = "findBar";
        findBar.style.cssText = "position:absolute;top:0;right:0;background:#252526;border:1px solid #3c3c3c;padding:6px 10px;z-index:100;display:flex;gap:6px;align-items:center;border-radius:0 0 0 6px;";
        findBar.innerHTML = `
            <input type="text" id="findInput" placeholder="Bul..." style="padding:4px 8px;background:#1e1e1e;color:#ccc;border:1px solid #555;border-radius:3px;font-size:12px;width:180px;">
            <input type="text" id="replaceInput" placeholder="Değiştir..." style="padding:4px 8px;background:#1e1e1e;color:#ccc;border:1px solid #555;border-radius:3px;font-size:12px;width:140px;">
            <button id="findNextBtn" style="padding:3px 8px;background:#00979d;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">Sonraki</button>
            <button id="replaceBtn" style="padding:3px 8px;background:#555;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">Değiştir</button>
            <button id="replaceAllBtn" style="padding:3px 8px;background:#555;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">Tümünü</button>
            <button id="closeFindBar" style="padding:3px 6px;background:transparent;color:#ccc;border:none;cursor:pointer;font-size:14px;">×</button>`;
        document.querySelector(".code-viewport").style.position = "relative";
        document.querySelector(".code-viewport").appendChild(findBar);

        const findInput = findBar.querySelector("#findInput");
        const replaceInput = findBar.querySelector("#replaceInput");
        findInput.focus();

        findBar.querySelector("#closeFindBar").addEventListener("click", () => findBar.remove());

        findBar.querySelector("#findNextBtn").addEventListener("click", () => {
            const query = findInput.value;
            if (!query) return;
            const text = codeTextarea.value;
            const startPos = codeTextarea.selectionEnd || 0;
            let idx = text.indexOf(query, startPos);
            if (idx === -1) idx = text.indexOf(query, 0); // wrap around
            if (idx !== -1) {
                codeTextarea.focus();
                codeTextarea.setSelectionRange(idx, idx + query.length);
            }
        });

        findBar.querySelector("#replaceBtn").addEventListener("click", () => {
            const query = findInput.value;
            const replacement = replaceInput.value;
            if (!query) return;
            const selStart = codeTextarea.selectionStart;
            const selEnd = codeTextarea.selectionEnd;
            const selectedText = codeTextarea.value.substring(selStart, selEnd);
            if (selectedText === query) {
                undoStack.push(codeTextarea.value);
                redoStack = [];
                codeTextarea.value = codeTextarea.value.substring(0, selStart) + replacement + codeTextarea.value.substring(selEnd);
                lastSavedCode = codeTextarea.value;
                updateEditor();
                saveSketch();
            }
        });

        findBar.querySelector("#replaceAllBtn").addEventListener("click", () => {
            const query = findInput.value;
            const replacement = replaceInput.value;
            if (!query) return;
            undoStack.push(codeTextarea.value);
            redoStack = [];
            codeTextarea.value = codeTextarea.value.split(query).join(replacement);
            lastSavedCode = codeTextarea.value;
            updateEditor();
            saveSketch();
        });
    }

    // Helper: New sketch
    function newSketch() {
        if (!confirm("Mevcut eskiz kaybolacak. Yeni eskiz oluşturmak istediğinizden emin misiniz?")) return;
        undoStack.push(codeTextarea.value);
        redoStack = [];
        codeTextarea.value = `void setup() {\n  // put your setup code here, to run once:\n\n}\n\nvoid loop() {\n  // put your main code here, to run repeatedly:\n\n}`;
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
        addConsoleLog("Yeni eskiz oluşturuldu.", "success");
        consolePanel.style.height = "220px";
    }

    // Helper: Save As (download)
    function saveAs() {
        const blob = new Blob([codeTextarea.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sketch.ino";
        a.click();
        URL.revokeObjectURL(url);
        addConsoleLog("Eskiz dosya olarak indirildi.", "success");
        consolePanel.style.height = "220px";
    }

    // Helper: Export compiled binary
    async function exportBinary() {
        addConsoleLog("Derlenmiş ikili dosya dışa aktarılıyor...", "");
        consolePanel.style.height = "220px";
        try {
            const res = await fetch("/api/export-binary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeTextarea.value, board: currentBoard, board_options: boardOptions })
            });
            const data = await res.json();
            if (data.success && data.filename) {
                // Download the binary
                const a = document.createElement("a");
                a.href = "/api/download-binary?file=" + encodeURIComponent(data.filename);
                a.download = data.filename;
                a.click();
                addConsoleLog("İkili dosya başarıyla dışa aktarıldı: " + data.filename, "success");
            } else {
                addConsoleLog("İkili dosya dışa aktarılamadı.", "error");
                if (data.log) data.log.forEach(l => addConsoleLog(l, "error"));
            }
        } catch (err) {
            addConsoleLog("Hata: Sunucuya bağlanılamadı.", "error");
        }
    }

    // Helper: Archive sketch as ZIP
    async function archiveSketch() {
        addConsoleLog("Eskiz arşivleniyor...", "");
        consolePanel.style.height = "220px";
        try {
            const res = await fetch("/api/archive");
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sketch_jul6a.zip";
                a.click();
                URL.revokeObjectURL(url);
                addConsoleLog("Eskiz arşiv olarak indirildi.", "success");
            } else {
                addConsoleLog("Arşivleme sırasında hata oluştu.", "error");
            }
        } catch (err) {
            addConsoleLog("Hata: Sunucuya bağlanılamadı.", "error");
        }
    }

    // Helper: Zoom in/out
    function zoomIn() {
        editorFontSize = Math.min(editorFontSize + 2, 32);
        codeTextarea.style.fontSize = editorFontSize + "px";
        highlightOverlay.style.fontSize = editorFontSize + "px";
    }
    function zoomOut() {
        editorFontSize = Math.max(editorFontSize - 2, 8);
        codeTextarea.style.fontSize = editorFontSize + "px";
        highlightOverlay.style.fontSize = editorFontSize + "px";
    }

    // Helper: Copy code as Markdown for forums
    function copyAsMarkdown() {
        const md = "```cpp\n" + codeTextarea.value + "\n```";
        navigator.clipboard.writeText(md).then(() => {
            addConsoleLog("Kod Markdown formatında panoya kopyalandı.", "success");
            consolePanel.style.height = "220px";
        });
    }

    // Helper: Get board info from arduino-cli
    async function getBoardInfo() {
        addConsoleLog("Kart bilgisi alınıyor...", "");
        consolePanel.style.height = "220px";
        try {
            const res = await fetch("/api/board-info?port=" + encodeURIComponent(currentPort));
            const data = await res.json();
            if (data.info) {
                data.info.forEach(line => addConsoleLog(line, ""));
            } else {
                addConsoleLog("Kart bilgisi alınamadı.", "error");
            }
        } catch (err) {
            addConsoleLog("Hata: Sunucuya bağlanılamadı.", "error");
        }
    }

    // Load example code templates
    const EXAMPLES = {
        "example-blink": `// Blink - Temel LED yanıp sönme örneği\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`,
        "example-analog": `// ReadAnalogVoltage - Analog voltaj okuma örneği\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int sensorValue = analogRead(A0);\n  float voltage = sensorValue * (3.3 / 4095.0);\n  Serial.print("Voltaj: ");\n  Serial.println(voltage);\n  delay(500);\n}`
    };

    // Menu action dispatcher
    const menuActions = {
        "new-sketch": () => newSketch(),
        "new-cloud-sketch": () => { newSketch(); addConsoleLog("Not: Bulut eskiz özelliği yerel projede desteklenmez, yerel yeni eskiz oluşturuldu.", ""); },
        "open": () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".ino,.cpp,.c,.h,.txt";
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    undoStack.push(codeTextarea.value);
                    redoStack = [];
                    codeTextarea.value = ev.target.result;
                    lastSavedCode = codeTextarea.value;
                    updateEditor();
                    saveSketch();
                    addConsoleLog(`Dosya açıldı: ${file.name}`, "success");
                    consolePanel.style.height = "220px";
                };
                reader.readAsText(file);
            };
            input.click();
        },
        "close-sketch": () => {
            if (confirm("Eskizi kapatmak istediğinizden emin misiniz?")) {
                codeTextarea.value = "";
                updateEditor();
                saveSketch();
            }
        },
        "save": () => { saveSketch(); addConsoleLog("Eskiz kaydedildi.", "success"); consolePanel.style.height = "220px"; },
        "save-as": () => saveAs(),
        "exit": () => { if (confirm("Uygulamadan çıkmak istediğinizden emin misiniz?")) window.close(); },
        "preferences": () => document.getElementById("btnSettings").click(),
        "adv-keyboard": () => {
            let modal = document.createElement("div");
            modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;";
            modal.innerHTML = `<div style="background:#1e1e1e;border:1px solid #3c3c3c;border-radius:8px;padding:24px;width:480px;max-height:70vh;overflow-y:auto;color:#ccc;font-family:Inter,sans-serif;">
                <h3 style="margin:0 0 12px;color:#00979d;">⌨ Klavye Kısayolları</h3>
                <table style="width:100%;font-size:12px;border-collapse:collapse;">
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+N</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Yeni Eskiz</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+O</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Dosya Aç</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+S</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Kaydet</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+Shift+S</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Farklı Kaydet</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+Z</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Geri Al</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+Y</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Yinele</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+R</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Doğrula/Derle</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+U</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Karta Yükle</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+T</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Otomatik Biçimlendir</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+F</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Bul</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+L</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Satıra Git</td></tr>
                    <tr><td style="padding:4px 8px;border-bottom:1px solid #333;">Ctrl+Shift+M</td><td style="padding:4px 8px;border-bottom:1px solid #333;">Seri Port Ekranı</td></tr>
                    <tr><td style="padding:4px 8px;">Ctrl++/-</td><td style="padding:4px 8px;">Yazı Boyutu Büyüt/Küçült</td></tr>
                </table>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top:12px;padding:6px 16px;background:#00979d;color:#fff;border:none;border-radius:4px;cursor:pointer;float:right;">Kapat</button>
            </div>`;
            modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
            document.body.appendChild(modal);
        },
        "undo": () => editorUndo(),
        "redo": () => editorRedo(),
        "cut": () => { document.execCommand("cut"); },
        "copy": () => { document.execCommand("copy"); },
        "paste": () => { codeTextarea.focus(); document.execCommand("paste"); },
        "copy-markdown": () => copyAsMarkdown(),
        "select-all": () => { codeTextarea.focus(); codeTextarea.select(); },
        "goto-line": () => goToLine(),
        "toggle-comment": () => toggleComment(),
        "increase-indent": () => increaseIndent(),
        "decrease-indent": () => decreaseIndent(),
        "auto-format": () => autoFormat(),
        "find-replace": () => openFind(),
        "find": () => openFind(),
        "find-next": () => {
            const findInput = document.getElementById("findInput");
            if (findInput) document.getElementById("findNextBtn").click();
            else openFind();
        },
        "find-prev": () => {
            // Search backwards
            const findInput = document.getElementById("findInput");
            if (!findInput) { openFind(); return; }
            const query = findInput.value;
            if (!query) return;
            const text = codeTextarea.value;
            const endPos = codeTextarea.selectionStart;
            const idx = text.lastIndexOf(query, endPos - 1);
            if (idx !== -1) {
                codeTextarea.focus();
                codeTextarea.setSelectionRange(idx, idx + query.length);
            }
        },
        "find-selection": () => {
            const sel = codeTextarea.value.substring(codeTextarea.selectionStart, codeTextarea.selectionEnd);
            if (sel) {
                openFind();
                setTimeout(() => {
                    const fi = document.getElementById("findInput");
                    if (fi) fi.value = sel;
                }, 50);
            }
        },
        "zoom-in": () => zoomIn(),
        "zoom-out": () => zoomOut(),
        "verify": () => handleCompile(),
        "upload": () => handleUpload(),
        "upload-programmer": () => handleUpload(), // Same as upload for this environment
        "export-compiled": () => exportBinary(),
        "serial-monitor": () => showConsoleTab("serial"),
        "serial-plotter": () => {
            openSerialPlotter();
        },
        "manage-libraries": () => {
            // Open library manager sidebar panel
            sidebarTabs.forEach(t => t.classList.remove("active"));
            const libTab = document.querySelector('[data-panel="panel-libraries"]');
            if (libTab) { libTab.classList.add("active"); }
            sidebarPanelContainer.classList.remove("hidden");
            panelContents.forEach(p => p.classList.remove("active"));
            document.getElementById("panel-libraries").classList.add("active");
        },
        "archive-sketch": () => archiveSketch(),
        "firmware-updater": () => { addConsoleLog("Firmware güncelleyici: Bağlı kartın firmware bilgisi kontrol ediliyor...", ""); consolePanel.style.height = "220px"; getBoardInfo(); },
        "ssl-uploader": () => { addConsoleLog("SSL sertifika yükleyicisi bu ortamda desteklenmiyor.", "error"); consolePanel.style.height = "220px"; },
        "reload-board": () => { updatePortsList(); addConsoleLog("Kart bilgisi yeniden yüklendi.", "success"); consolePanel.style.height = "220px"; },
        "get-board-info": () => getBoardInfo(),
        "help-getting-started": () => window.open("https://docs.arduino.cc/learn/starting-guide/getting-started-arduino", "_blank"),
        "help-android": () => {
            const modal = document.getElementById("androidOTGModal");
            if (modal) modal.style.display = "block";
        },
        "help-ref": () => window.open("https://www.arduino.cc/reference/en/", "_blank"),
        "help-about": () => {
            let modal = document.createElement("div");
            modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;";
            modal.innerHTML = `<div style="background:#1e1e1e;border:1px solid #3c3c3c;border-radius:8px;padding:28px;width:380px;color:#ccc;font-family:Inter,sans-serif;text-align:center;">
                <div style="font-size:36px;margin-bottom:12px;">∞</div>
                <h3 style="margin:0 0 8px;color:#00979d;">GaziDuino IDE</h3>
                <p style="font-size:12px;margin:4px 0;">Arduino IDE 2.3.11-nightly-20260629 Klonu</p>
                <p style="font-size:11px;color:#888;margin:4px 0;">Web tabanlı Arduino geliştirme ortamı</p>
                <p style="font-size:11px;color:#888;margin:4px 0;">Flask + Arduino CLI</p>
                <hr style="border:none;border-top:1px solid #333;margin:16px 0;">
                <p style="font-size:11px;color:#666;">© 2026 GaziDuino Projesi</p>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top:12px;padding:6px 20px;background:#00979d;color:#fff;border:none;border-radius:4px;cursor:pointer;">Tamam</button>
            </div>`;
            modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
            document.body.appendChild(modal);
        },
        "example-blink": () => {
            if (!confirm("Mevcut kod bu örnekle değiştirilecek. Devam?")) return;
            undoStack.push(codeTextarea.value);
            redoStack = [];
            codeTextarea.value = EXAMPLES["example-blink"];
            lastSavedCode = codeTextarea.value;
            updateEditor();
            saveSketch();
        },
        "example-analog": () => {
            if (!confirm("Mevcut kod bu örnekle değiştirilecek. Devam?")) return;
            undoStack.push(codeTextarea.value);
            redoStack = [];
            codeTextarea.value = EXAMPLES["example-analog"];
            lastSavedCode = codeTextarea.value;
            updateEditor();
            saveSketch();
        },
        "recent-1": () => addConsoleLog("Yakın geçmiş dosyası: sketch_jul05a (yerel eskiz defterinde aranıyor...)", ""),
        "recent-2": () => addConsoleLog("Yakın geçmiş dosyası: Blink_LED (yerel eskiz defterinde aranıyor...)", ""),
        "sketchbook-1": () => addConsoleLog("Eskiz defteri: sketch_jul6a zaten açık.", "success"),
        "sketchbook-2": () => addConsoleLog("Eskiz defteri: ESP32_WiFi_Scanner (yerel eskiz defterinde aranıyor...)", ""),
    };

    document.querySelectorAll(".menu-row").forEach(row => {
        row.addEventListener("click", (e) => {
            if (row.classList.contains("parent") || row.classList.contains("separator")) {
                e.stopPropagation();
                return;
            }
            const action = row.getAttribute("data-action");
            const label = row.querySelector("span") ? row.querySelector("span").textContent : row.textContent.trim();
            console.log(`[Menu Click] '${label}' (Action: ${action})`);

            if (action && menuActions[action]) {
                menuActions[action]();
            } else if (action) {
                console.log(`[Menu] Bilinmeyen aksiyon: ${action}`);
            }
        });
    });

    // --- Keyboard Shortcuts ---
    document.addEventListener("keydown", (e) => {
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        if (ctrl && !shift && e.key === "n") { e.preventDefault(); newSketch(); }
        if (ctrl && !shift && e.key === "o") { e.preventDefault(); menuActions["open"](); }
        if (ctrl && !shift && e.key === "s") { e.preventDefault(); menuActions["save"](); }
        if (ctrl && shift && e.key === "S") { e.preventDefault(); saveAs(); }
        if (ctrl && !shift && e.key === "r") { e.preventDefault(); handleCompile(); }
        if (ctrl && !shift && e.key === "u") { e.preventDefault(); handleUpload(); }
        if (ctrl && !shift && e.key === "t") { e.preventDefault(); autoFormat(); }
        if (ctrl && !shift && e.key === "f") { e.preventDefault(); openFind(); }
        if (ctrl && !shift && e.key === "l") { e.preventDefault(); goToLine(); }
        if (ctrl && !shift && e.key === "g") { e.preventDefault(); const fi = document.getElementById("findInput"); if (fi) document.getElementById("findNextBtn").click(); }
        if (ctrl && shift && e.key === "M") { e.preventDefault(); showConsoleTab("serial"); }
        if (ctrl && shift && e.key === "L") { e.preventDefault(); openSerialPlotter(); }
        if (ctrl && shift && e.key === "C") { e.preventDefault(); copyAsMarkdown(); }
        if (ctrl && e.key === "+") { e.preventDefault(); zoomIn(); }
        if (ctrl && e.key === "=") { e.preventDefault(); zoomIn(); }
        if (ctrl && e.key === "-") { e.preventDefault(); zoomOut(); }
    });

    // --- Window controls ---
    const winMin = document.getElementById("winMinimize");
    if (winMin) {
        winMin.addEventListener("click", () => {
            window.blur();
        });
    }
    const winMax = document.getElementById("winMaximize");
    if (winMax) {
        winMax.addEventListener("click", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen().catch(() => { });
            }
        });
    }
    const winCls = document.getElementById("winClose");
    if (winCls) {
        winCls.addEventListener("click", () => {
            if (confirm("Uygulamayı kapatmak istediğinizden emin misiniz?")) {
                window.close();
            }
        });
    }
    btnToolbarSerial.addEventListener("click", () => showConsoleTab("serial"));


    // --- 10. Board & Library Managers (Real Data + Rendering) ---
    const BOARD_PACKAGES = [
        { name: "Arduino AVR Boards", author: "Arduino", installed: true, installedVer: "1.8.6", versions: ["1.8.6", "1.8.5", "1.8.4", "1.8.3"], desc: "Arduino Yún, Arduino UNO, Arduino UNO Mini, Arduino Mega ADK, Arduino Mega 2560, Arduino Leonardo, Arduino Micro, Arduino Nano, Arduino Esplora, Arduino Mini, Arduino Ethernet, Arduino Fio, Arduino BT, Arduino LilyPad USB, Arduino LilyPad, Arduino Pro, Arduino Gemma, Arduino Robot Control, Arduino Robot Motor.", core: "arduino:avr", url: "", boards: ["Arduino Uno", "Arduino Nano", "Arduino Mega 2560", "Arduino Leonardo", "Arduino Micro", "Arduino Pro Mini"] },
        { name: "Arduino ESP32 Boards", author: "Espressif Systems", installed: true, installedVer: "3.0.2", versions: ["3.0.2", "3.0.1", "3.0.0", "2.0.17", "2.0.16", "2.0.15", "2.0.14"], desc: "ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP32-C6, ESP32-H2 tabanlı tüm kartlar.", core: "esp32:esp32", url: "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json", boards: ["ESP32 Dev Module", "NodeMCU-32S", "WEMOS LOLIN32", "ESP32 Wrover Module", "ESP32C3 Dev Module", "ESP32S3 Dev Module"] },
        { name: "Arduino Mbed OS Nano Boards", author: "Arduino", installed: false, installedVer: "", versions: ["4.1.5", "4.1.4", "4.1.3", "4.0.10"], desc: "Arduino Nano 33 BLE, Arduino Nano 33 BLE Sense, Arduino Nano RP2040 Connect.", core: "arduino:mbed_nano", url: "", boards: ["Arduino Nano 33 BLE", "Arduino Nano 33 BLE Sense", "Arduino Nano RP2040 Connect"] },
        { name: "Arduino SAMD Boards", author: "Arduino", installed: false, installedVer: "", versions: ["1.8.14", "1.8.13", "1.8.12", "1.8.11"], desc: "Arduino MKR WiFi 1010, Arduino MKR Zero, Arduino MKR 1000, Arduino Zero, Arduino Nano 33 IoT, Arduino MKR FOX 1200, Arduino MKR WAN 1300, Arduino MKR WAN 1310, Arduino MKR NB 1500, Arduino MKR GSM 1400.", core: "arduino:samd", url: "", boards: ["Arduino Zero", "Arduino MKR WiFi 1010", "Arduino Nano 33 IoT", "Arduino MKR1000"] },
        { name: "Arduino megaAVR Boards", author: "Arduino", installed: false, installedVer: "", versions: ["1.8.8", "1.8.7", "1.8.6"], desc: "Arduino Uno WiFi Rev2, Arduino Nano Every.", core: "arduino:megaavr", url: "", boards: ["Arduino Uno WiFi Rev2", "Arduino Nano Every"] },
        { name: "Arduino Mbed OS Edge Boards", author: "Arduino", installed: false, installedVer: "", versions: ["4.6.0", "4.5.0", "4.4.0"], desc: "Arduino Edge Control.", core: "arduino:mbed_edge", url: "", boards: ["Arduino Edge Control"] },
        { name: "Arduino Renesas UNO R4 Boards", author: "Arduino", installed: false, installedVer: "", versions: ["1.2.0", "1.1.0", "1.0.5", "1.0.4"], desc: "Arduino UNO R4 Minima, Arduino UNO R4 WiFi.", core: "arduino:renesas_uno", url: "", boards: ["Arduino UNO R4 Minima", "Arduino UNO R4 WiFi"] },
        { name: "esp8266", author: "ESP8266 Community", installed: false, installedVer: "", versions: ["3.1.2", "3.1.1", "3.1.0", "3.0.2"], desc: "NodeMCU 1.0, WeMos D1 Mini, WeMos D1 R2, Generic ESP8266 Module, Adafruit Feather HUZZAH ESP8266.", core: "esp8266:esp8266", url: "https://arduino.esp8266.com/stable/package_esp8266com_index.json", boards: ["NodeMCU 1.0 (ESP-12E Module)", "Generic ESP8266 Module", "WeMos D1 R1", "WeMos D1 mini"] },
        { name: "Raspberry Pi Pico/RP2040", author: "Earle Philhower", installed: false, installedVer: "", versions: ["3.9.5", "3.9.4", "3.9.3", "3.9.2"], desc: "Raspberry Pi Pico, Raspberry Pi Pico W, Adafruit Feather RP2040, SparkFun ProMicro RP2040.", core: "rp2040:rp2040", url: "https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json", boards: ["Raspberry Pi Pico", "Raspberry Pi Pico W", "Adafruit Feather RP2040"] },
        { name: "STM32 MCU based boards", author: "STMicroelectronics", installed: false, installedVer: "", versions: ["2.7.1", "2.7.0", "2.6.0", "2.5.0"], desc: "Nucleo-64, Nucleo-144, Discovery, Blue Pill (STM32F103C8), Black Pill (STM32F401CC).", core: "STMicroelectronics:stm32", url: "https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json", boards: ["Generic STM32F1 series", "Generic STM32F4 series", "Nucleo-64"] },
        { name: "Adafruit SAMD Boards", author: "Adafruit", installed: false, installedVer: "", versions: ["1.7.13", "1.7.12", "1.7.11"], desc: "Adafruit Feather M0, Metro M4, ItsyBitsy M4, Trinket M0, Circuit Playground Express.", core: "adafruit:samd", url: "https://adafruit.github.io/arduino-board-index/package_adafruit_index.json", boards: ["Adafruit Feather M0", "Adafruit Circuit Playground Express", "Adafruit Trinket M0", "Adafruit Metro M4"] },
        { name: "Seeed Studio XIAO", author: "Seeed Studio", installed: false, installedVer: "", versions: ["2.9.1", "2.9.0", "2.8.4", "2.8.3"], desc: "XIAO ESP32S3, XIAO ESP32C3, XIAO nRF52840, XIAO nRF52840 Sense, XIAO RP2040, XIAO SAMD21.", core: "Seeeduino:samd", url: "https://files.seeedstudio.com/arduino/package_seeeduino_boards_index.json", boards: ["Seeed XIAO BLE Sense", "Seeed XIAO RP2040", "Seeed XIAO ESP32C3"] },
        { name: "SparkFun Boards", author: "SparkFun Electronics", installed: false, installedVer: "", versions: ["2.0.8", "2.0.7", "2.0.6"], desc: "SparkFun ESP32 Thing, SparkFun Thing Plus, SparkFun MicroMod, SparkFun RedBoard Turbo.", core: "SparkFun:esp32", url: "https://raw.githubusercontent.com/sparkfun/Arduino_Boards/main/IDE_Board_Manager/package_sparkfun_index.json", boards: ["SparkFun ESP32 Thing", "SparkFun RedBoard Turbo", "SparkFun MicroMod SAMD51"] },
        { name: "Teensy", author: "PJRC", installed: false, installedVer: "", versions: ["1.59.0", "1.58.1", "1.58.0"], desc: "Teensy 4.1, Teensy 4.0, Teensy 3.6, Teensy 3.5, Teensy 3.2, Teensy LC.", core: "teensy:avr", url: "https://www.pjrc.com/teensy/package_teensy_index.json", boards: ["Teensy 4.1", "Teensy 4.0", "Teensy 3.6", "Teensy 3.2", "Teensy LC"] }, ,
    ];

    const LIBRARIES = [
        { name: "Adafruit NeoPixel", author: "Adafruit", installed: false, installedVer: "", versions: ["1.12.0", "1.11.0", "1.10.7"], desc: "Arduino library for controlling single-wire-based LED pixels and strip such as the Adafruit 60 LED/meter Digital LED strip, the Adafruit FLORA RGB Smart Pixel, the Adafruit Breadboard-friendly RGB Smart Pixel, the Adafruit NeoPixel Stick, and the Adafruit NeoPixel Shield." },
        { name: "DHT sensor library", author: "Adafruit", installed: false, installedVer: "", versions: ["1.4.6", "1.4.5", "1.4.4"], desc: "Arduino library for DHT11, DHT22, etc. Temperature & Humidity Sensors." },
        { name: "ArduinoJson", author: "Benoit Blanchon", installed: false, installedVer: "", versions: ["7.0.4", "7.0.3", "6.21.5", "6.21.4"], desc: "A simple and efficient JSON library for embedded C++. It supports JSON serialization, JSON deserialization, MessagePack, streams, and fixed memory allocation." },
        { name: "FastLED", author: "Daniel Garcia", installed: false, installedVer: "", versions: ["3.6.0", "3.5.0", "3.4.0", "3.3.3"], desc: "A library for easily & efficiently controlling a wide variety of LED chipsets, like the ones sold by Adafruit (NeoPixel, DotStar, LPD8806), SparkFun (WS2801), and others." },
        { name: "Servo", author: "Arduino", installed: false, installedVer: "", versions: ["1.2.1", "1.2.0", "1.1.8"], desc: "Allows Arduino/Genuino boards to control a variety of servo motors." },
        { name: "LiquidCrystal", author: "Arduino", installed: false, installedVer: "", versions: ["1.0.7", "1.0.6", "1.0.5"], desc: "Allows communication with alphanumerical liquid crystal displays (LCDs)." },
        { name: "SD", author: "Arduino", installed: false, installedVer: "", versions: ["1.2.4", "1.2.3", "1.2.2"], desc: "Enables reading and writing on SD cards. The communication between the microcontroller and the SD card uses SPI." },
        { name: "PubSubClient", author: "Nick O'Leary", installed: false, installedVer: "", versions: ["2.8.0", "2.7.0", "2.6.0"], desc: "A client library for MQTT messaging. Lightweight Arduino client for MQTT message sending and receiving." },
        { name: "Adafruit GFX Library", author: "Adafruit", installed: false, installedVer: "", versions: ["1.11.9", "1.11.8", "1.11.7"], desc: "Adafruit GFX graphics core library, this is the 'core' class that all our other graphics libraries derive from." },
        { name: "Adafruit SSD1306", author: "Adafruit", installed: false, installedVer: "", versions: ["2.5.9", "2.5.8", "2.5.7"], desc: "SSD1306 oled driver library for 'monochrome' 128x64 and 128x32 OLEDs." },
        { name: "OneWire", author: "Jim Studt, Tom Pollard", installed: false, installedVer: "", versions: ["2.3.7", "2.3.6", "2.3.5"], desc: "Access 1-wire temperature sensors, memory and other chips." },
        { name: "DallasTemperature", author: "Miles Burton", installed: false, installedVer: "", versions: ["3.9.0", "3.8.1", "3.8.0"], desc: "Arduino Library for Dallas Temperature ICs. Supports DS18B20, DS18S20, DS1822, DS1820." },
        { name: "IRremote", author: "Armin Joachimsmeyer", installed: false, installedVer: "", versions: ["4.3.0", "4.2.0", "4.1.0", "4.0.0"], desc: "Send and receive infrared signals with multiple protocols." },
        { name: "AccelStepper", author: "Mike McCauley", installed: false, installedVer: "", versions: ["1.64.0", "1.63.0", "1.62.0"], desc: "An object-oriented, multi-instance stepper motor acceleration/deceleration library." },
        { name: "ESP32Servo", author: "Kevin Harrington, John Bennett", installed: false, installedVer: "", versions: ["1.1.1", "1.1.0", "1.0.3"], desc: "Allows ESP32 boards to control servo motors using the LEDC peripheral." },
        { name: "WiFiManager", author: "tzapu", installed: false, installedVer: "", versions: ["2.0.17", "2.0.16", "2.0.15"], desc: "ESP8266/ESP32 WiFi Connection manager with web captive portal." },
        { name: "TFT_eSPI", author: "Bodmer", installed: false, installedVer: "", versions: ["2.5.34", "2.5.33", "2.5.32"], desc: "A fast TFT library for ESP8266 and ESP32 processors, supporting a wide range of display driver chips." },
        { name: "U8g2", author: "oliver", installed: false, installedVer: "", versions: ["2.35.9", "2.35.7", "2.34.22"], desc: "Monochrome LCD, OLED and eInk Library. Successor of U8glib. Supports more than 50 display controllers." },
        { name: "Blynk", author: "Volodymyr Shymanskyy", installed: false, installedVer: "", versions: ["1.3.2", "1.3.1", "1.3.0"], desc: "Build a smartphone app for your project in minutes. Blynk library for embedded hardware." },
        { name: "Adafruit BME280 Library", author: "Adafruit", installed: false, installedVer: "", versions: ["2.2.4", "2.2.3", "2.2.2"], desc: "Arduino library for BME280 sensors with I2C and SPI interfaces. Pressure, temperature, humidity." },
        { name: "AsyncTCP", author: "dvarrel", installed: false, installedVer: "", versions: ["1.1.4", "1.1.3", "1.1.1"], desc: "Async TCP Library for ESP32 Arduino." },
        { name: "ESPAsyncWebServer", author: "lacamera", installed: false, installedVer: "", versions: ["3.1.0", "2.10.8", "1.2.7"], desc: "Async Web Server for ESP8266 and ESP32." },
        { name: "Stepper", author: "Arduino", installed: false, installedVer: "", versions: ["1.1.3", "1.1.2", "1.1.1"], desc: "Allows Arduino boards to control a variety of stepper motors." },
        { name: "LiquidCrystal I2C", author: "Frank de Brabander", installed: false, installedVer: "", versions: ["1.1.2", "1.1.1", "1.1.0"], desc: "Library for the LiquidCrystal I2C displays." },
        { name: "MFRC522", author: "GithubCommunity", installed: false, installedVer: "", versions: ["1.4.10", "1.4.9", "1.4.8"], desc: "Arduino RFID Library for MFRC522." },
        { name: "Keypad", author: "Mark Stanley, Alexander Brevig", installed: false, installedVer: "", versions: ["3.1.1", "3.1.0"], desc: "A library for using matrix style keypads with the Arduino." },
        { name: "TinyGPSPlus", author: "Mikal Hart", installed: false, installedVer: "", versions: ["1.0.3", "1.0.2"], desc: "A new, full-featured GPS parsing library for Arduino." },
        { name: "RTClib", author: "Adafruit", installed: false, installedVer: "", versions: ["2.1.1", "2.1.0", "2.0.3"], desc: "A fork of Jeelabs' fantastic RTC library for DS1307, DS3231, PCF8523." },
        { name: "Time", author: "Michael Margolis", installed: false, installedVer: "", versions: ["1.6.1", "1.6.0"], desc: "Timekeeping library for Arduino." },
        { name: "Encoder", author: "Paul Stoffregen", installed: false, installedVer: "", versions: ["1.4.2", "1.4.1"], desc: "Quadrature Encoder Library for Arduino." },
        { name: "ModbusMaster", author: "Doc Walker", installed: false, installedVer: "", versions: ["2.0.1", "2.0.0"], desc: "Arduino library for communicating with Modbus slaves over RS485/RS232." },
        { name: "RadioHead", author: "Mike McCauley", installed: false, installedVer: "", versions: ["1.122", "1.121"], desc: "Packet Radio library for Arduino." },
        { name: "Ethernet", author: "Arduino", installed: false, installedVer: "", versions: ["2.0.2", "2.0.1", "2.0.0"], desc: "Allows Arduino boards to connect to the Internet using the Arduino Ethernet Shield." },
        { name: "RF24", author: "TMRh20", installed: false, installedVer: "", versions: ["1.4.7", "1.4.6"], desc: "OSI Layer 2 driver for nRF24L01 on Arduino & Raspberry Pi/Linux Devices." },
        { name: "LoRa", author: "Sandeep Mistry", installed: false, installedVer: "", versions: ["0.8.0", "0.7.2"], desc: "An Arduino library for sending and receiving data using LoRa radios." },
        { name: "WebSockets", author: "Markus Sattler", installed: false, installedVer: "", versions: ["2.3.6", "2.3.5"], desc: "WebSockets server and client for Arduino." },
        { name: "ArduinoOTA", author: "Juergen Skrotzky", installed: false, installedVer: "", versions: ["1.0.9", "1.0.8"], desc: "Library for updating ESP8266 and ESP32 over the air." },
        { name: "MD_MAX72XX", author: "majicDesigns", installed: false, installedVer: "", versions: ["3.3.1", "3.3.0"], desc: "Library for MAX7219 and MAX7221 led matrix displays." },
        { name: "LedControl", author: "Eberhard Fahle", installed: false, installedVer: "", versions: ["1.0.6", "1.0.5"], desc: "A library for the MAX7219 and MAX7221 Led display drivers." },
        { name: "TaskScheduler", author: "Anatoliy Kuznetsov", installed: false, installedVer: "", versions: ["3.7.0", "3.6.0"], desc: "Cooperative multitasking for Arduino microcontrollers." },
        { name: "Bounce2", author: "Thomas O Fredericks", installed: false, installedVer: "", versions: ["2.71", "2.70"], desc: "Debouncing library for Arduino and Wiring." },
        { name: "PID", author: "Brett Beauregard", installed: false, installedVer: "", versions: ["1.2.1", "1.2.0"], desc: "PID Controller library for Arduino." },
        { name: "NTPClient", author: "Fabrice Weinberg", installed: false, installedVer: "", versions: ["3.2.1", "3.2.0"], desc: "An NTPClient to connect to a time server." },
        { name: "Adafruit MQTT Library", author: "Adafruit", installed: false, installedVer: "", versions: ["2.5.4", "2.5.3"], desc: "MQTT library for Arduino, specifically tailored for Adafruit IO." },
        { name: "Arduino_JSON", author: "Arduino", installed: false, installedVer: "", versions: ["0.2.0", "0.1.0"], desc: "Official Arduino JSON Library." },
        { name: "Firebase ESP32 Client", author: "Mobizt", installed: false, installedVer: "", versions: ["4.3.19", "4.3.18"], desc: "Firebase RTDB, Cloud Firestore, Firebase Storage & Cloud Messaging for ESP32." },
        { name: "Firebase ESP8266 Client", author: "Mobizt", installed: false, installedVer: "", versions: ["4.3.19", "4.3.18"], desc: "Firebase RTDB, Cloud Firestore, Firebase Storage & Cloud Messaging for ESP8266." },
        { name: "TMCStepper", author: "Teemu Mäntykallio", installed: false, installedVer: "", versions: ["0.7.3", "0.7.2"], desc: "Library for Trinamic stepper drivers." },
        { name: "Adafruit Motor Shield V2 Library", author: "Adafruit", installed: false, installedVer: "", versions: ["1.1.1", "1.1.0"], desc: "Library for the Adafruit Motor Shield V2." },
        { name: "Arduino_LSM9DS1", author: "Arduino", installed: false, installedVer: "", versions: ["1.1.1", "1.1.0"], desc: "Allows you to read the accelerometer, magnetometer and gyroscope." },
        { name: "WiFi101", author: "Arduino", installed: false, installedVer: "", versions: ["0.16.1", "0.16.0"], desc: "Network driver for Arduino WiFi 101 shield." },
        { name: "Adafruit_Sensor", author: "Adafruit", installed: false, installedVer: "", versions: ["1.1.14", "1.1.13"], desc: "Common sensor library." },
        { name: "SimpleTimer", author: "Schallbert", installed: false, installedVer: "", versions: ["1.0.0"], desc: "A simple timer library for calling functions at a set interval." }
    ];

    function updateBoardMenu() {
        const boardMenu = document.getElementById("menuBoardSubmenu");
        if (!boardMenu) return;

        let availableBoards = [];
        BOARD_PACKAGES.forEach(pkg => {
            if (pkg.installed && pkg.boards) {
                availableBoards = availableBoards.concat(pkg.boards);
            }
        });

        boardMenu.innerHTML = "";

        if (availableBoards.length === 0) {
            boardMenu.innerHTML = '<div class="menu-row no-boards">Lütfen Kart Yöneticisinden bir kart paketi kurun.</div>';
            return;
        }

        availableBoards.forEach(board => {
            const div = document.createElement("div");
            div.className = "menu-row board-option";
            div.setAttribute("data-board", board);
            div.textContent = board;
            div.addEventListener("click", (e) => {
                e.stopPropagation();
                window.selectBoard(board);

                // Hide dropdown hack to resolve "menu stuck open"
                const parentDropdown = div.closest('.dropdown-menu');
                if (parentDropdown) {
                    parentDropdown.style.display = 'none';
                    setTimeout(() => parentDropdown.style.display = '', 150);
                }
            });
            boardMenu.appendChild(div);
        });
    }

    function renderBoardPackages(filter = "", typeFilter = "all") {
        const container = document.getElementById("boardPackageList");
        if (!container) return;
        container.innerHTML = "";
        const q = filter.toLowerCase();
        BOARD_PACKAGES.forEach((pkg, idx) => {
            if (q && !pkg.name.toLowerCase().includes(q) && !pkg.desc.toLowerCase().includes(q)) return;
            if (typeFilter === "installed" && !pkg.installed) return;
            if (typeFilter === "not-installed" && pkg.installed) return;

            const div = document.createElement("div");
            div.className = "board-package-item";
            const versOpts = pkg.versions.map(v => `<option value="${v}">${v}</option>`).join("");
            div.innerHTML = `
                <div class="pkg-title-row">
                    <div><span class="pkg-name">${pkg.name}</span> - <span class="pkg-author">${pkg.author}</span></div>
                </div>
                ${pkg.installed ? `<span class="pkg-installed-badge">${pkg.installedVer} kuruldu</span>` : ""}
                <div class="pkg-boards-text">Boards included in this package:<br>${pkg.desc}</div>
                <a class="pkg-more-info" href="#" onclick="return false">Daha fazla bilgi</a>
                <div class="pkg-actions">
                    <select class="pkg-version-select">${versOpts}</select>
                    ${pkg.installed
                    ? `<button class="btn-pkg-remove" data-idx="${idx}">KALDIR</button>`
                    : `<button class="btn-pkg-install" data-idx="${idx}">KUR</button>`}
                </div>`;
            container.appendChild(div);
        });
        // Bind install/remove buttons
        container.querySelectorAll(".btn-pkg-install").forEach(btn => {
            btn.addEventListener("click", async () => {
                const i = parseInt(btn.getAttribute("data-idx"));
                const pkg = BOARD_PACKAGES[i];
                const ver = btn.closest(".pkg-actions").querySelector(".pkg-version-select").value;
                btn.textContent = "Yükleniyor...";
                btn.disabled = true;
                try {
                    const res = await fetch("/api/core/install", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ core: pkg.core, url: pkg.url || "" })
                    });
                    const data = await res.json();
                    if (data.success) {
                        pkg.installed = true;
                        pkg.installedVer = ver;
                        addConsoleLog(`${pkg.name} başarıyla kuruldu.`, "success");
                        updateBoardMenu();
                    } else {
                        addConsoleLog(`${pkg.name} kurulamadı.`, "error");
                        if (data.log) data.log.forEach(l => addConsoleLog(l, "error"));
                    }
                } catch (e) { addConsoleLog("Hata: Sunucuya bağlanılamadı.", "error"); }
                consolePanel.style.height = "220px";
                renderBoardPackages(document.getElementById("panelBoardSearch").value, document.getElementById("boardTypeFilter").value);
            });
        });
        container.querySelectorAll(".btn-pkg-remove").forEach(btn => {
            btn.addEventListener("click", async () => {
                const i = parseInt(btn.getAttribute("data-idx"));
                const pkg = BOARD_PACKAGES[i];
                if (!confirm(`${pkg.name} kaldırılsın mı?`)) return;
                btn.textContent = "Kaldırılıyor...";
                btn.disabled = true;
                try {
                    const res = await fetch("/api/core/uninstall", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ core: pkg.core })
                    });
                    const data = await res.json();
                    if (data.success) {
                        pkg.installed = false;
                        pkg.installedVer = "";
                        addConsoleLog(`${pkg.name} kaldırıldı.`, "success");
                        updateBoardMenu();
                    } else {
                        addConsoleLog(`${pkg.name} kaldırılamadı.`, "error");
                    }
                } catch (e) { addConsoleLog("Hata.", "error"); }
                consolePanel.style.height = "220px";
                renderBoardPackages(document.getElementById("panelBoardSearch").value, document.getElementById("boardTypeFilter").value);
            });
        });
    }

    function renderLibraries(filter = "", typeFilter = "all") {
        const container = document.getElementById("libraryList");
        if (!container) return;
        container.innerHTML = "";
        const q = filter.toLowerCase();
        LIBRARIES.forEach((lib, idx) => {
            if (q && !lib.name.toLowerCase().includes(q) && !lib.desc.toLowerCase().includes(q) && !lib.author.toLowerCase().includes(q)) return;
            if (typeFilter === "installed" && !lib.installed) return;
            if (typeFilter === "not-installed" && lib.installed) return;

            const div = document.createElement("div");
            div.className = "library-item";
            const versOpts = lib.versions.map(v => `<option value="${v}">${v}</option>`).join("");
            div.innerHTML = `
                <div class="lib-title-row">
                    <div><span class="lib-name">${lib.name}</span> - <span class="lib-author">${lib.author}</span></div>
                </div>
                ${lib.installed ? `<span class="lib-installed-badge">${lib.installedVer} kuruldu</span>` : ""}
                <div class="lib-desc">${lib.desc}</div>
                <a class="lib-more-info" href="#" onclick="return false">Daha fazla bilgi</a>
                <div class="lib-actions">
                    <select class="lib-version-select">${versOpts}</select>
                    ${lib.installed
                    ? `<button class="btn-pkg-remove" data-idx="${idx}">KALDIR</button>`
                    : `<button class="btn-pkg-install" data-idx="${idx}">KUR</button>`}
                </div>`;
            container.appendChild(div);
        });
        // Bind install/remove buttons
        container.querySelectorAll(".btn-pkg-install").forEach(btn => {
            btn.addEventListener("click", async () => {
                const i = parseInt(btn.getAttribute("data-idx"));
                const lib = LIBRARIES[i];
                const ver = btn.closest(".lib-actions").querySelector(".lib-version-select").value;
                btn.textContent = "Yükleniyor...";
                btn.disabled = true;
                try {
                    const res = await fetch("/api/library/install", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ library: lib.name, version: ver })
                    });
                    const data = await res.json();
                    if (data.success) {
                        lib.installed = true;
                        lib.installedVer = ver;
                        addConsoleLog(`${lib.name} kütüphanesi başarıyla kuruldu.`, "success");
                    } else {
                        addConsoleLog(`${lib.name} kurulamadı.`, "error");
                        if (data.log) data.log.forEach(l => addConsoleLog(l, "error"));
                    }
                } catch (e) { addConsoleLog("Hata: Sunucuya bağlanılamadı.", "error"); }
                consolePanel.style.height = "220px";
                renderLibraries(document.getElementById("panelLibSearch").value, document.getElementById("libTypeFilter").value);
            });
        });
        container.querySelectorAll(".btn-pkg-remove").forEach(btn => {
            btn.addEventListener("click", async () => {
                const i = parseInt(btn.getAttribute("data-idx"));
                const lib = LIBRARIES[i];
                if (!confirm(`${lib.name} kaldırılsın mı?`)) return;
                btn.textContent = "Kaldırılıyor...";
                btn.disabled = true;
                try {
                    const res = await fetch("/api/library/uninstall", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ library: lib.name })
                    });
                    const data = await res.json();
                    if (data.success) {
                        lib.installed = false;
                        lib.installedVer = "";
                        addConsoleLog(`${lib.name} kaldırıldı.`, "success");
                    } else { addConsoleLog(`Kaldırma başarısız.`, "error"); }
                } catch (e) { addConsoleLog("Hata.", "error"); }
                consolePanel.style.height = "220px";
                renderLibraries(document.getElementById("panelLibSearch").value, document.getElementById("libTypeFilter").value);
            });
        });
    }

    // Board search + filter
    document.getElementById("panelBoardSearch").addEventListener("input", (e) => {
        renderBoardPackages(e.target.value, document.getElementById("boardTypeFilter").value);
    });
    document.getElementById("boardTypeFilter").addEventListener("change", (e) => {
        renderBoardPackages(document.getElementById("panelBoardSearch").value, e.target.value);
    });
    // Library search + filter
    document.getElementById("panelLibSearch").addEventListener("input", (e) => {
        renderLibraries(e.target.value, document.getElementById("libTypeFilter").value);
    });
    document.getElementById("libTypeFilter").addEventListener("change", (e) => {
        renderLibraries(document.getElementById("panelLibSearch").value, e.target.value);
    });
    // Initial render
    renderBoardPackages();
    renderLibraries();
    updateBoardMenu();

    // Mock search box bulb
    const btnSearchTrigger = document.getElementById("btnSearchTrigger");
    const searchQueryInput = document.getElementById("searchQueryInput");
    const searchResults = document.getElementById("searchResults");
    btnSearchTrigger.addEventListener("click", () => {
        const query = searchQueryInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = "Aranacak kelime girin.";
            return;
        }
        console.log(`[Search] Arama terimi: ${query}`);
        const code = codeTextarea.value.toLowerCase();
        let matches = 0;
        let index = code.indexOf(query);
        while (index !== -1) {
            matches++;
            index = code.indexOf(query, index + 1);
        }
        searchResults.innerHTML = `<div class="search-match-item">${matches} adet eşleşme bulundu.</div>`;
    });

    // --- 9. Console Tabs & Serial Monitor Control ---
    const tabOutputBtn = document.getElementById("tabOutputBtn");
    const tabSerialBtn = document.getElementById("tabSerialBtn");
    const paneOutput = document.getElementById("paneOutput");
    const paneSerial = document.getElementById("paneSerial");
    const serialWarningBanner = document.getElementById("serialWarningBanner");
    const serialContentArea = document.getElementById("serialContentArea");
    const serialTerminal = document.getElementById("serialTerminal");
    const serialBaudrate = document.getElementById("serialBaudrate");
    const serialLineEnding = document.getElementById("serialLineEnding");
    const serialMessageInput = document.getElementById("serialMessageInput");
    const chkAutoscroll = document.getElementById("chkAutoscroll");
    const chkTimestamp = document.getElementById("chkTimestamp");

    let serialEventSource = null;
    let serialPlotterWindow = null;

    function showConsoleTab(tab) {
        consolePanel.style.height = "220px";
        if (tab === "output") {
            tabOutputBtn.classList.add("active");
            tabSerialBtn.classList.remove("active");
            paneOutput.classList.add("active");
            paneSerial.classList.remove("active");
        } else if (tab === "serial") {
            tabSerialBtn.style.display = "inline-flex";
            tabSerialBtn.classList.add("active");
            tabOutputBtn.classList.remove("active");
            paneSerial.classList.add("active");
            paneOutput.classList.remove("active");
            connectSerial();
        }
    }

    tabOutputBtn.addEventListener("click", () => showConsoleTab("output"));
    tabSerialBtn.addEventListener("click", () => showConsoleTab("serial"));

    document.querySelector(".close-serial-tab").addEventListener("click", (e) => {
        e.stopPropagation();
        disconnectSerial();
        tabSerialBtn.style.display = "none";
        showConsoleTab("output");
    });

    let webSerialPort = null;
    let webSerialReader = null;
    let webSerialWriter = null;

    function disconnectSerial() {
        if (serialEventSource) {
            console.log("[Serial] Bağlantı kesiliyor...");
            serialEventSource.close();
            serialEventSource = null;
        }

        if (webSerialReader) {
            webSerialReader.cancel().catch(() => { });
            webSerialReader = null;
        }
        if (webSerialWriter) {
            webSerialWriter.close().catch(() => { });
            webSerialWriter = null;
        }
        if (webSerialPort) {
            webSerialPort.close().catch(() => { });
            webSerialPort = null;
        }

        fetch("/api/serial/disconnect", { method: "POST" }).catch(err => console.error("Disconnect error:", err));
    }

    function connectSerial() {
        disconnectSerial();

        if (!currentPort) {
            serialWarningBanner.style.display = "block";
            serialContentArea.classList.remove("connected");
            return;
        }

        serialWarningBanner.style.display = "none";
        serialContentArea.classList.add("connected");

        const baud = serialBaudrate.value;
        console.log(`[Serial] ${currentPort} portuna ${baud} baud hızında bağlanılıyor...`);

        // Update placeholder
        serialMessageInput.placeholder = `Mesaj ('${currentBoard}' - '${currentPort}'’a mesaj göndermek için Enter'a basın)`;

        serialTerminal.innerHTML = `--- ${currentPort} portu açıldı (Hız: ${baud}) ---\n`;

        serialEventSource = new EventSource(`/api/serial/stream?port=${currentPort}&baud=${baud}`);

        serialEventSource.onmessage = (event) => {
            let data = event.data;
            if (chkTimestamp.checked) {
                const timeStr = new Date().toLocaleTimeString();
                data = `[${timeStr}] ${data}`;
            }
            serialTerminal.innerHTML += data + "\n";
            if (chkAutoscroll.checked) {
                serialTerminal.scrollTop = serialTerminal.scrollHeight;
            }
            // Feed data to plotter if open
            if (serialPlotterWindow && !serialPlotterWindow.closed && serialPlotterWindow.addPlotData) {
                serialPlotterWindow.addPlotData(event.data);
            }
        };

        serialEventSource.onerror = (err) => {
            console.error("[Serial] Akış hatası:", err);
            serialTerminal.innerHTML += "\n[Serial bağlantı hatası veya cihaz ayrıldı]\n";
            disconnectSerial();
        };
    }

    async function connectWebSerial() {
        if (!("serial" in navigator)) {
            alert("Web Serial API bu tarayıcıda desteklenmiyor. Lütfen güncel Chrome, Edge veya Opera kullanın.");
            return;
        }
        try {
            disconnectSerial();
            webSerialPort = await navigator.serial.requestPort();
            const baud = parseInt(serialBaudrate.value, 10);
            await webSerialPort.open({ baudRate: baud });

            serialWarningBanner.style.display = "none";
            serialContentArea.classList.add("connected");
            serialMessageInput.placeholder = "Mesaj (Web Serial Bağlantısı ile)";
            serialTerminal.innerHTML = `--- Web Serial ile Bağlanıldı (Hız: ${baud}) ---\n`;

            const decoder = new TextDecoderStream();
            const inputDone = webSerialPort.readable.pipeTo(decoder.writable);
            webSerialReader = decoder.readable.getReader();

            const encoder = new TextEncoderStream();
            const outputDone = encoder.readable.pipeTo(webSerialPort.writable);
            webSerialWriter = encoder.writable.getWriter();

            readWebSerialLoop();
        } catch (err) {
            console.error("Web Serial Bağlantı Hatası:", err);
        }
    }

    async function readWebSerialLoop() {
        try {
            while (true) {
                const { value, done } = await webSerialReader.read();
                if (done) {
                    webSerialReader.releaseLock();
                    break;
                }
                if (value) {
                    let data = value;
                    if (chkTimestamp.checked) {
                        const timeStr = new Date().toLocaleTimeString();
                        data = `[${timeStr}] ${data}`;
                    }
                    serialTerminal.innerHTML += data;
                    if (chkAutoscroll.checked) {
                        serialTerminal.scrollTop = serialTerminal.scrollHeight;
                    }
                    if (serialPlotterWindow && !serialPlotterWindow.closed && serialPlotterWindow.addPlotData) {
                        serialPlotterWindow.addPlotData(value);
                    }
                }
            }
        } catch (e) {
            console.error("Web Serial okuma hatası:", e);
            disconnectSerial();
        }
    }

    const btnWebSerial = document.getElementById("btnWebSerial");
    if (btnWebSerial) {
        btnWebSerial.addEventListener("click", connectWebSerial);
    }

    // Serial Send Message
    serialMessageInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const msg = serialMessageInput.value;
            if (!msg) return;

            let finalMsg = msg;
            if (serialLineEnding.value === "nl") finalMsg += "\n";
            else if (serialLineEnding.value === "cr") finalMsg += "\r";
            else if (serialLineEnding.value === "both") finalMsg += "\r\n";

            if (webSerialWriter) {
                try {
                    await webSerialWriter.write(finalMsg);
                    serialMessageInput.value = "";
                } catch (err) {
                    console.error("Web Serial gönderme hatası:", err);
                }
            } else {
                try {
                    await fetch("/api/serial/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: msg, lineEnding: serialLineEnding.value })
                    });
                    serialMessageInput.value = "";
                } catch (err) {
                    console.error("Serial gönderme hatası:", err);
                }
            }
        }
    });

    serialBaudrate.addEventListener("change", () => {
        if (paneSerial.classList.contains("active")) {
            connectSerial();
        }
    });

    // --- Serial Plotter (popup window) ---
    function openSerialPlotter() {
        if (serialPlotterWindow && !serialPlotterWindow.closed) {
            serialPlotterWindow.focus();
            return;
        }

        // Ensure serial is connected
        if (!serialEventSource && currentPort) {
            connectSerial();
        }

        const plotterHTML = `<!DOCTYPE html>
<html><head><title>Seri Çizici - ${currentPort || 'COM?'}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#1e1e1e; color:#ccc; font-family:Inter,sans-serif; display:flex; flex-direction:column; height:100vh; }
.top-bar { display:flex; align-items:center; justify-content:space-between; padding:8px 16px; background:#252526; border-bottom:1px solid #333; }
.top-bar .title { font-size:13px; color:#00979d; font-weight:600; }
.controls { display:flex; align-items:center; gap:12px; }
.controls label { font-size:12px; }
.btn-stop { padding:4px 16px; background:#e74c3c; color:#fff; border:none; border-radius:4px; font-weight:700; font-size:12px; cursor:pointer; }
.btn-stop.running { background:#2ecc71; }
canvas { flex:1; background:#fff; }
.bottom-bar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#252526; border-top:1px solid #333; }
.bottom-bar input { flex:1; padding:5px 10px; background:#2d2d2d; color:#ccc; border:1px solid #3c3c3c; border-radius:3px; font-size:12px; }
.bottom-bar .btn-send { padding:5px 14px; background:#00979d; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer; }
.bottom-bar select { padding:4px 6px; background:#2d2d2d; color:#ccc; border:1px solid #3c3c3c; border-radius:3px; font-size:11px; }
</style></head><body>
<div class="top-bar">
    <span class="title">∞ ${currentPort || 'COM?'}</span>
    <div class="controls">
        <label>Interpolate <input type="checkbox" id="interpolateChk" checked></label>
        <button class="btn-stop running" id="btnPlotStop">STOP</button>
    </div>
</div>
<canvas id="plotCanvas"></canvas>
<div class="bottom-bar">
    <input type="text" id="plotMsg" placeholder="Type Message">
    <button class="btn-send" id="plotSend">SEND</button>
    <select id="plotLineEnd"><option value="nl" selected>New Line</option><option value="none">No Line Ending</option><option value="cr">Carriage Return</option><option value="both">Both NL & CR</option></select>
    <select id="plotBaud"><option value="115200" selected>115200 baud</option><option value="9600">9600 baud</option></select>
</div>
<script>
const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');
let dataPoints = [];
const MAX_POINTS = 200;
let running = true;
let minY = -0.2, maxY = 1.2;
const colors = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22'];

function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; draw(); }
window.addEventListener('resize', resize);
setTimeout(resize, 50);

window.addPlotData = function(rawLine) {
    if (!running) return;
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    const nums = trimmed.split(/[,\t\s]+/).map(Number).filter(n => !isNaN(n));
    if (nums.length === 0) return;
    dataPoints.push(nums);
    if (dataPoints.length > MAX_POINTS) dataPoints.shift();
    // Auto-scale Y
    let allNums = dataPoints.flat();
    minY = Math.min(...allNums) - 0.2;
    maxY = Math.max(...allNums) + 0.2;
    if (minY === maxY) { minY -= 1; maxY += 1; }
    draw();
};

function draw() {
    const w = canvas.width, h = canvas.height;
    const pad = { left: 50, right: 20, top: 20, bottom: 30 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    // Grid
    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = pad.top + (ph / 5) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        const val = maxY - ((maxY - minY) / 5) * i;
        ctx.fillStyle = '#666'; ctx.font = '10px Inter'; ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), pad.left - 5, y + 3);
    }
    for (let i = 0; i <= 5; i++) {
        const x = pad.left + (pw / 5) * i;
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, h - pad.bottom); ctx.stroke();
    }
    if (dataPoints.length < 2) return;
    const interpolate = document.getElementById('interpolateChk').checked;
    const numChannels = Math.max(...dataPoints.map(d => d.length));
    for (let ch = 0; ch < numChannels; ch++) {
        ctx.strokeStyle = colors[ch % colors.length]; ctx.lineWidth = 2;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i < dataPoints.length; i++) {
            const val = dataPoints[i][ch] !== undefined ? dataPoints[i][ch] : 0;
            const x = pad.left + (i / (MAX_POINTS - 1)) * pw;
            const y = pad.top + ph - ((val - minY) / (maxY - minY)) * ph;
            if (first) { ctx.moveTo(x, y); first = false; } 
            else if (interpolate) { ctx.lineTo(x, y); }
            else { const px = pad.left + ((i-1)/(MAX_POINTS-1))*pw; ctx.lineTo(px, y); ctx.lineTo(x, y); }
        }
        ctx.stroke();
    }
}

document.getElementById('btnPlotStop').addEventListener('click', function() {
    running = !running;
    this.textContent = running ? 'STOP' : 'START';
    this.className = running ? 'btn-stop running' : 'btn-stop';
});

document.getElementById('plotSend').addEventListener('click', async () => {
    const msg = document.getElementById('plotMsg').value;
    if (!msg) return;
    try {
        await fetch('/api/serial/send', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ message: msg, lineEnding: document.getElementById('plotLineEnd').value })
        });
        document.getElementById('plotMsg').value = '';
    } catch(e) {}
});
document.getElementById('plotMsg').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('plotSend').click();
});
<\/script></body></html>`;

        serialPlotterWindow = window.open('', 'SerialPlotter', 'width=900,height=500,resizable=yes,scrollbars=no');
        serialPlotterWindow.document.write(plotterHTML);
        serialPlotterWindow.document.close();
    }

    // --- Init update ---
    updateEditor();

    // =============================================
    //  FILE TREE SYSTEM
    // =============================================
    let currentFilePath = "sketch_jul6a.ino"; // currently open file rel path
    const fileTreeEl = document.getElementById("fileTree");
    const contextMenu = document.getElementById("contextMenu");
    let ctxTargetPath = "";
    let ctxTargetType = "";

    function getFileIcon(name, ext, isFolder, isOpen) {
        if (isFolder) return isOpen ? "📂" : "📁";
        const icons = {
            ".ino": "⚡", ".cpp": "📘", ".c": "📗", ".h": "📕",
            ".txt": "📝", ".md": "📝", ".json": "📋", ".csv": "📊",
            ".py": "🐍", ".js": "📜", ".css": "🎨", ".html": "🌐"
        };
        return icons[ext] || "📄";
    }

    function getFileIconClass(ext, isFolder, isOpen) {
        if (isFolder) return isOpen ? "folder-open" : "folder";
        return (ext || "").replace(".", "") || "txt";
    }

    function renderTree(items, container, depth = 0) {
        items.forEach(item => {
            const treeItem = document.createElement("div");
            treeItem.className = "tree-item";

            const row = document.createElement("div");
            row.className = "tree-row";
            if (item.path === currentFilePath) row.classList.add("active");
            row.setAttribute("data-path", item.path);
            row.setAttribute("data-type", item.type);

            // Indentation
            for (let i = 0; i < depth; i++) {
                const indent = document.createElement("span");
                indent.className = "tree-indent";
                row.appendChild(indent);
            }

            // Chevron (for folders)
            const chevron = document.createElement("span");
            chevron.className = "tree-chevron" + (item.type === "folder" ? "" : " placeholder");
            chevron.textContent = "▶";
            row.appendChild(chevron);

            // Icon
            const icon = document.createElement("span");
            icon.className = "tree-icon " + getFileIconClass(item.ext, item.type === "folder", false);
            icon.textContent = getFileIcon(item.name, item.ext, item.type === "folder", false);
            row.appendChild(icon);

            // Label
            const label = document.createElement("span");
            label.className = "tree-label";
            label.textContent = item.name;
            row.appendChild(label);

            treeItem.appendChild(row);

            if (item.type === "folder" && item.children) {
                const childContainer = document.createElement("div");
                childContainer.className = "tree-children";
                renderTree(item.children, childContainer, depth + 1);
                treeItem.appendChild(childContainer);

                row.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isOpen = childContainer.classList.toggle("open");
                    chevron.classList.toggle("open", isOpen);
                    icon.textContent = getFileIcon(item.name, item.ext, true, isOpen);
                    icon.className = "tree-icon " + getFileIconClass(item.ext, true, isOpen);
                });
            } else {
                row.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openFileInEditor(item.path);
                });
            }

            // Right-click context menu
            row.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                e.stopPropagation();
                ctxTargetPath = item.path;
                ctxTargetType = item.type;
                contextMenu.style.left = e.clientX + "px";
                contextMenu.style.top = e.clientY + "px";
                contextMenu.classList.add("show");
            });

            container.appendChild(treeItem);
        });
    }

    async function loadFileTree() {
        try {
            const res = await fetch("/api/files");
            const data = await res.json();
            fileTreeEl.innerHTML = "";
            renderTree(data.tree || [], fileTreeEl);
        } catch (err) {
            fileTreeEl.innerHTML = '<div style="color:#999;font-size:11px;padding:8px">Dosya ağacı yüklenemedi.</div>';
        }
    }

    async function openFileInEditor(path, saveCurrent = true) {
        // Normalize path for comparison
        const normalizedPath = path.replace(/\\/g, '/');
        const normalizedCurrentPath = (currentFilePath || '').replace(/\\/g, '/');

        // Save current file first if requested and it is a different file
        if (saveCurrent && normalizedPath !== normalizedCurrentPath) {
            try {
                await fetch("/api/files/write", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: currentFilePath, content: codeTextarea.value })
                });
            } catch (e) { }
        }

        // Load new file (always reload when saveCurrent=false, i.e. AI tool trigger)
        try {
            const res = await fetch("/api/files/read?path=" + encodeURIComponent(path));
            const data = await res.json();
            if (data.content !== undefined) {
                codeTextarea.value = data.content;
                lastSavedCode = data.content;
                currentFilePath = path;
                updateEditor();

                // Update tab label
                const tabLabel = document.querySelector(".editor-tab.active .tab-label");
                if (tabLabel) tabLabel.textContent = data.name || path;

                // Update active row
                document.querySelectorAll(".tree-row").forEach(r => r.classList.remove("active"));
                const activeRow = document.querySelector(`.tree-row[data-path="${path}"]`);
                if (activeRow) activeRow.classList.add("active");
            } else {
                addConsoleLog("Dosya okunamadı: " + (data.error || "Bilinmeyen hata"), "error");
            }
        } catch (err) {
            addConsoleLog("Dosya açılamadı: " + err, "error");
        }
    }

    // Context menu actions
    document.addEventListener("click", () => contextMenu.classList.remove("show"));

    contextMenu.querySelectorAll(".ctx-item").forEach(item => {
        item.addEventListener("click", async (e) => {
            e.stopPropagation();
            const action = item.getAttribute("data-action");
            contextMenu.classList.remove("show");

            const parentPath = ctxTargetType === "folder" ? ctxTargetPath : ctxTargetPath.split("/").slice(0, -1).join("/");

            if (action === "ctx-new-file") {
                const name = prompt("Yeni dosya adı (uzantı dahil):", "yeni_dosya.h");
                if (!name) return;
                const newPath = parentPath ? parentPath + "/" + name : name;
                try {
                    const res = await fetch("/api/files/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ path: newPath, type: "file" })
                    });
                    const data = await res.json();
                    if (data.success) { loadFileTree(); openFileInEditor(newPath); }
                    else addConsoleLog("Dosya oluşturulamadı: " + (data.error || ""), "error");
                } catch (e) { addConsoleLog("Hata: " + e, "error"); }
            } else if (action === "ctx-new-folder") {
                const name = prompt("Yeni klasör adı:", "yeni_klasor");
                if (!name) return;
                const newPath = parentPath ? parentPath + "/" + name : name;
                try {
                    const res = await fetch("/api/files/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ path: newPath, type: "folder" })
                    });
                    const data = await res.json();
                    if (data.success) loadFileTree();
                    else addConsoleLog("Klasör oluşturulamadı: " + (data.error || ""), "error");
                } catch (e) { addConsoleLog("Hata: " + e, "error"); }
            } else if (action === "ctx-rename") {
                const oldName = ctxTargetPath.split("/").pop();
                const newName = prompt("Yeni ad:", oldName);
                if (!newName || newName === oldName) return;
                try {
                    const res = await fetch("/api/files/rename", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ oldPath: ctxTargetPath, newName: newName })
                    });
                    const data = await res.json();
                    if (data.success) {
                        if (ctxTargetPath === currentFilePath) {
                            const newPath = ctxTargetPath.split("/").slice(0, -1).concat(newName).join("/") || newName;
                            currentFilePath = newPath;
                            const tabLabel = document.querySelector(".editor-tab.active .tab-label");
                            if (tabLabel) tabLabel.textContent = newName;
                        }
                        loadFileTree();
                    } else addConsoleLog("Yeniden adlandırılamadı: " + (data.error || ""), "error");
                } catch (e) { addConsoleLog("Hata: " + e, "error"); }
            } else if (action === "ctx-delete") {
                const name = ctxTargetPath.split("/").pop();
                if (!confirm(`"${name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
                try {
                    const res = await fetch("/api/files/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ path: ctxTargetPath })
                    });
                    const data = await res.json();
                    if (data.success) {
                        loadFileTree();
                        if (ctxTargetPath === currentFilePath) {
                            currentFilePath = "sketch_jul6a.ino";
                            openFileInEditor(currentFilePath);
                        }
                    } else addConsoleLog("Silinemedi: " + (data.error || ""), "error");
                } catch (e) { addConsoleLog("Hata: " + e, "error"); }
            }
        });
    });

    // Top action buttons
    document.getElementById("btnNewFile").addEventListener("click", async () => {
        const name = prompt("Yeni dosya adı (uzantı dahil):", "yeni_dosya.ino");
        if (!name) return;
        try {
            const res = await fetch("/api/files/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: name, type: "file" })
            });
            const data = await res.json();
            if (data.success) { loadFileTree(); openFileInEditor(name); }
            else addConsoleLog("Dosya oluşturulamadı: " + (data.error || ""), "error");
        } catch (e) { addConsoleLog("Hata: " + e, "error"); }
    });

    document.getElementById("btnNewFolder").addEventListener("click", async () => {
        const name = prompt("Yeni klasör adı:", "lib");
        if (!name) return;
        try {
            const res = await fetch("/api/files/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: name, type: "folder" })
            });
            const data = await res.json();
            if (data.success) loadFileTree();
            else addConsoleLog("Klasör oluşturulamadı: " + (data.error || ""), "error");
        } catch (e) { addConsoleLog("Hata: " + e, "error"); }
    });

    document.getElementById("btnRefreshTree").addEventListener("click", loadFileTree);

    // Also update the saveSketch function to write to current file path
    const origSaveSketch = saveSketch;
    saveSketch = async function () {
        try {
            await fetch("/api/files/write", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: currentFilePath, content: codeTextarea.value })
            });
        } catch (e) { }
    };

    loadFileTree();

    // =============================================
    //  AI ASSISTANT
    // =============================================
    const aiChatMessages = document.getElementById("aiChatMessages");
    const aiInput = document.getElementById("aiInput");
    const btnAiSend = document.getElementById("btnAiSend");
    const aiModelBadge = document.getElementById("aiModelBadge");
    const aiSendContext = document.getElementById("aiSendContext");
    const aiSettingsOverlay = document.getElementById("aiSettingsOverlay");
    const aiApiKeyInput = document.getElementById("aiApiKey");
    const aiModelSelect = document.getElementById("aiModel");
    const aiTemperatureInput = document.getElementById("aiTemperature");
    const aiTempVal = document.getElementById("aiTempVal");
    const aiMaxTokensSelect = document.getElementById("aiMaxTokens");
    const aiLanguageSelect = document.getElementById("aiLanguage");
    const aiSystemPromptInput = document.getElementById("aiSystemPrompt");
    const aiAutoRunCheckbox = document.getElementById("aiAutoRun");

    let aiChatHistory = []; // {role, content}
    let aiIsProcessing = false;
    let aiChats = []; // Array of {id, title, messages: []}
    let currentChatId = null;

    // Load AI settings from localStorage
    function loadAiSettings() {
        const saved = localStorage.getItem("gaziduino_ai_settings");
        if (saved) {
            try {
                const s = JSON.parse(saved);
                if (s.apiKey) aiApiKeyInput.value = s.apiKey;
                if (s.model) aiModelSelect.value = s.model;
                if (s.temperature !== undefined) {
                    aiTemperatureInput.value = s.temperature;
                    aiTempVal.textContent = s.temperature;
                }
                if (s.maxTokens) aiMaxTokensSelect.value = s.maxTokens;
                if (s.language) aiLanguageSelect.value = s.language;
                if (s.systemPrompt) aiSystemPromptInput.value = s.systemPrompt;
                if (s.autoRun !== undefined && aiAutoRunCheckbox) aiAutoRunCheckbox.checked = s.autoRun;
                updateModelBadge();
            } catch (e) { }
        }
        // Load chat history list
        loadChats();
    }

    function saveAiSettings() {
        const settings = {
            apiKey: aiApiKeyInput.value,
            model: aiModelSelect.value,
            temperature: aiTemperatureInput.value,
            maxTokens: aiMaxTokensSelect.value,
            language: aiLanguageSelect.value,
            systemPrompt: aiSystemPromptInput.value,
            autoRun: aiAutoRunCheckbox ? aiAutoRunCheckbox.checked : false
        };
        localStorage.setItem("gaziduino_ai_settings", JSON.stringify(settings));
        updateModelBadge();
    }

    function loadChats() {
        const saved = localStorage.getItem("gaziduino_ai_chats");
        if (saved) {
            try {
                aiChats = JSON.parse(saved);
            } catch (e) {
                aiChats = [];
            }
        }
        if (aiChats.length > 0) {
            selectChat(aiChats[0].id);
        } else {
            // Check legacy chat
            const chatSaved = localStorage.getItem("gaziduino_ai_chat");
            if (chatSaved) {
                try {
                    const messages = JSON.parse(chatSaved);
                    if (messages && messages.length > 0) {
                        const title = messages[0].content.substring(0, 20) + "...";
                        aiChats = [{ id: Date.now(), title: title, messages: messages }];
                        localStorage.setItem("gaziduino_ai_chats", JSON.stringify(aiChats));
                        selectChat(aiChats[0].id);
                    }
                } catch (e) { }
            }
        }
        renderHistoryList();
    }

    function saveChats() {
        localStorage.setItem("gaziduino_ai_chats", JSON.stringify(aiChats));
    }

    function renderHistoryList() {
        const container = document.getElementById("aiHistoryList");
        if (!container) return;
        container.innerHTML = "";
        if (aiChats.length === 0) {
            container.innerHTML = "<div style='padding:8px;color:#888;text-align:center;font-size:11px;'>Geçmiş sohbet bulunmuyor.</div>";
            return;
        }
        aiChats.forEach(chat => {
            const item = document.createElement("div");
            item.className = "ai-history-item" + (chat.id === currentChatId ? " active" : "");
            item.textContent = chat.title || "Sohbet";
            item.title = chat.title;
            item.addEventListener("click", () => {
                selectChat(chat.id);
            });
            container.appendChild(item);
        });
    }

    function selectChat(id) {
        const chat = aiChats.find(c => c.id === id);
        if (!chat) return;
        currentChatId = id;
        aiChatHistory = chat.messages || [];

        // Render messages
        const welcome = aiChatMessages.querySelector(".ai-welcome");
        aiChatMessages.innerHTML = "";
        if (welcome) aiChatMessages.appendChild(welcome);

        aiChatHistory.forEach(msg => {
            appendChatMessage(msg.role, msg.content, false);
        });

        renderHistoryList();
    }

    function updateModelBadge() {
        const modelNames = {
            "gemini-3.5-flash": "Gemini 3.5 Flash ⭐",
            "gemini-3.0-flash": "Gemini 3.0 Flash",
            "gemini-3.1-pro": "Gemini 3.1 Pro",
            "gemini-2.5-flash": "Gemini 2.5 Flash",
            "gemini-2.5-pro": "Gemini 2.5 Pro",
            "gemini-2.0-flash": "Gemini 2.0 Flash",
            "gemini-2.0-flash-lite": "Gemini 2.0 Flash Lite"
        };
        aiModelBadge.textContent = modelNames[aiModelSelect.value] || aiModelSelect.value;
    }

    // Simple markdown to HTML converter
    function markdownToHTML(text) {
        let html = text;
        // Escape HTML first
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Code blocks with language
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
            const btnId = "insertCode_" + Math.random().toString(36).substr(2, 6);
            return `<pre><code class="lang-${lang}">${code.trim()}</code><button class="btn-insert-code" data-code-id="${btnId}" onclick="window._insertAiCode(this)">Koda Ekle</button></pre>`;
        });
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    // Insert code from AI response into editor
    window._insertAiCode = function (btn) {
        const pre = btn.closest("pre");
        if (!pre) return;
        const codeEl = pre.querySelector("code");
        if (!codeEl) return;
        const code = codeEl.textContent;
        undoStack.push(codeTextarea.value);
        redoStack = [];
        const pos = codeTextarea.selectionStart;
        codeTextarea.value = codeTextarea.value.substring(0, pos) + code + codeTextarea.value.substring(pos);
        lastSavedCode = codeTextarea.value;
        updateEditor();
        saveSketch();
        btn.textContent = "✅ Eklendi";
        btn.style.background = "#2ecc71";
        setTimeout(() => { btn.textContent = "Koda Ekle"; btn.style.background = ""; }, 2000);
    };

    function appendChatMessage(role, content, animate = true) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "ai-message" + (role === "user" ? " user-msg" : "");

        const avatar = document.createElement("div");
        avatar.className = "ai-avatar";
        avatar.textContent = role === "user" ? "Sen" : "✨";

        const bubble = document.createElement("div");
        bubble.className = "ai-bubble";

        if (role === "user") {
            bubble.textContent = content;
        } else {
            bubble.innerHTML = markdownToHTML(content);
        }

        if (!animate) msgDiv.style.animation = "none";

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);
        aiChatMessages.appendChild(msgDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const div = document.createElement("div");
        div.className = "ai-message";
        div.id = "aiTypingIndicator";
        div.innerHTML = `<div class="ai-avatar">✨</div><div class="ai-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
        aiChatMessages.appendChild(div);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById("aiTypingIndicator");
        if (el) el.remove();
    }

    async function sendAiMessage() {
        const text = aiInput.value.trim();
        if (!text || aiIsProcessing) return;

        const apiKey = aiApiKeyInput.value.trim();
        if (!apiKey) {
            appendChatMessage("assistant", "⚠️ API anahtarı ayarlanmamış. Sol alttaki ⚙ butonuna tıklayarak AI Ayarlarına gidin ve Google AI Studio API anahtarınızı girin.");
            return;
        }

        aiIsProcessing = true;
        btnAiSend.disabled = true;
        aiInput.value = "";

        if (!currentChatId) {
            currentChatId = Date.now();
            const title = text.substring(0, 20) + (text.length > 20 ? "..." : "");
            aiChats.unshift({ id: currentChatId, title: title, messages: [] });
            saveChats();
            renderHistoryList();
        }

        const activeChat = aiChats.find(c => c.id === currentChatId);
        if (activeChat) {
            activeChat.messages.push({ role: "user", content: text });
            aiChatHistory = activeChat.messages;
            saveChats();
        }

        // Add user message visually
        appendChatMessage("user", text);

        showTypingIndicator();

        // Create empty assistant message bubble to fill during stream
        const msgDiv = document.createElement("div");
        msgDiv.className = "ai-message";
        const avatar = document.createElement("div");
        avatar.className = "ai-avatar";
        avatar.textContent = "✨";
        const bubble = document.createElement("div");
        bubble.className = "ai-bubble";
        bubble.innerHTML = "<div class='ai-typing'><span></span><span></span><span></span></div>";
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);

        let streamText = "";
        let hasStartedResponse = false;

        try {
            const codeContext = aiSendContext.checked ? codeTextarea.value : "";
            let langInstr = "";
            if (aiLanguageSelect.value === "tr") langInstr = "Yanıtlarını Türkçe ver.";
            else if (aiLanguageSelect.value === "en") langInstr = "Respond in English.";

            const systemPrompt = (aiSystemPromptInput.value.trim() || "") + (langInstr ? "\n" + langInstr : "");

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: apiKey,
                    model: aiModelSelect.value,
                    messages: aiChatHistory,
                    temperature: parseFloat(aiTemperatureInput.value),
                    maxTokens: parseInt(aiMaxTokensSelect.value),
                    systemPrompt: systemPrompt,
                    codeContext: codeContext,
                    autoRun: aiAutoRunCheckbox ? aiAutoRunCheckbox.checked : false
                })
            });

            removeTypingIndicator();

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                bubble.innerHTML = "❌ **Hata:** " + (errData.error || "Sunucu hatası oluştu.");
                aiChatMessages.appendChild(msgDiv);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                aiIsProcessing = false;
                btnAiSend.disabled = false;
                return;
            }

            // Append response container
            aiChatMessages.appendChild(msgDiv);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                // Save last potentially incomplete line back to buffer
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.error) {
                                bubble.innerHTML = "❌ **Hata:** " + data.error;
                            } else {
                                if (data.reloadTree) {
                                    loadFileTree();
                                }
                                if (data.reloadEditor) {
                                    openFileInEditor(data.reloadEditor, false);
                                }
                                if (data.text) {
                                    if (!hasStartedResponse) {
                                        bubble.innerHTML = "";
                                        hasStartedResponse = true;
                                    }
                                    streamText += data.text;
                                    bubble.innerHTML = markdownToHTML(streamText);
                                    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
                                }
                            }
                        } catch (e) {
                            // JSON parsing error (incomplete chunk)
                        }
                    }
                }
            }

            // Process any remaining buffer
            if (buffer && buffer.startsWith("data: ")) {
                try {
                    const data = JSON.parse(buffer.substring(6));
                    if (data.reloadTree) {
                        loadFileTree();
                    }
                    if (data.reloadEditor) {
                        openFileInEditor(data.reloadEditor, false);
                    }
                    if (data.text) {
                        if (!hasStartedResponse) {
                            bubble.innerHTML = "";
                            hasStartedResponse = true;
                        }
                        streamText += data.text;
                        bubble.innerHTML = markdownToHTML(streamText);
                    }
                } catch (e) { }
            }

            if (!hasStartedResponse && !streamText) {
                bubble.innerHTML = "AI yanıt üretemedi.";
            } else {
                const activeChat = aiChats.find(c => c.id === currentChatId);
                if (activeChat) {
                    activeChat.messages.push({ role: "assistant", content: streamText });
                    saveChats();
                }
                renderHistoryList();
            }

        } catch (err) {
            removeTypingIndicator();
            if (!hasStartedResponse) {
                bubble.innerHTML = "❌ **Bağlantı hatası:** " + err.message;
                if (!msgDiv.parentNode) aiChatMessages.appendChild(msgDiv);
            } else {
                bubble.innerHTML += "<br><br>❌ *Yayın kesildi:* " + err.message;
            }
        }

        aiIsProcessing = false;
        btnAiSend.disabled = false;
        aiInput.focus();
    }

    // AI Event Listeners
    btnAiSend.addEventListener("click", sendAiMessage);
    aiInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendAiMessage();
        }
    });

    // AI Settings Modal
    document.getElementById("btnAiSettings").addEventListener("click", () => {
        aiSettingsOverlay.classList.add("show");
    });

    document.getElementById("aiSettingsClose").addEventListener("click", () => {
        aiSettingsOverlay.classList.remove("show");
    });

    document.getElementById("aiSettingsCancel").addEventListener("click", () => {
        aiSettingsOverlay.classList.remove("show");
    });

    aiSettingsOverlay.addEventListener("click", (e) => {
        if (e.target === aiSettingsOverlay) aiSettingsOverlay.classList.remove("show");
    });

    document.getElementById("aiSettingsSave").addEventListener("click", () => {
        saveAiSettings();
        aiSettingsOverlay.classList.remove("show");
        addConsoleLog("AI ayarları kaydedildi.", "success");
    });

    aiTemperatureInput.addEventListener("input", (e) => {
        aiTempVal.textContent = e.target.value;
    });

    document.getElementById("btnToggleKey").addEventListener("click", () => {
        aiApiKeyInput.type = aiApiKeyInput.type === "password" ? "text" : "password";
    });

    document.getElementById("btnNewAiChat").addEventListener("click", () => {
        currentChatId = null;
        aiChatHistory = [];
        const welcome = aiChatMessages.querySelector(".ai-welcome");
        aiChatMessages.innerHTML = "";
        if (welcome) aiChatMessages.appendChild(welcome);
        aiInput.value = "";
        aiInput.focus();
        renderHistoryList();
    });

    document.getElementById("btnAiClear").addEventListener("click", () => {
        if (!currentChatId) return;
        if (!confirm("Bu sohbet silinsin mi?")) return;
        aiChats = aiChats.filter(c => c.id !== currentChatId);
        saveChats();
        if (aiChats.length > 0) {
            selectChat(aiChats[0].id);
        } else {
            currentChatId = null;
            aiChatHistory = [];
            const welcome = aiChatMessages.querySelector(".ai-welcome");
            aiChatMessages.innerHTML = "";
            if (welcome) aiChatMessages.appendChild(welcome);
            renderHistoryList();
        }
    });

    document.getElementById("btnClearHistory").addEventListener("click", () => {
        if (!confirm("Tüm sohbet geçmişi silinsin mi?")) return;
        aiChats = [];
        saveChats();
        currentChatId = null;
        aiChatHistory = [];
        const welcome = aiChatMessages.querySelector(".ai-welcome");
        aiChatMessages.innerHTML = "";
        if (welcome) aiChatMessages.appendChild(welcome);
        renderHistoryList();
    });

    document.getElementById("btnAiHistory").addEventListener("click", () => {
        const histContainer = document.getElementById("aiHistoryContainer");
        if (histContainer) {
            const isHidden = histContainer.style.display === "none";
            histContainer.style.display = isHidden ? "block" : "none";
        }
    });

    // --- System Resource Polling ---
    const topCpuVal = document.getElementById("topCpuVal");
    const topGpuItem = document.getElementById("topGpuItem");
    const topGpuVal = document.getElementById("topGpuVal");

    async function updateSystemUsage() {
        try {
            const res = await fetch("/api/system-usage");
            if (!res.ok) return;
            const data = await res.json();

            // CPU
            if (data.cpu !== undefined) {
                const cpuStr = data.cpu.toFixed(1) + "%";
                if (topCpuVal) topCpuVal.textContent = cpuStr;
            }

            // GPU
            if (data.gpu !== null && data.gpu !== undefined) {
                const gpuStr = data.gpu.toFixed(1) + "%";
                if (topGpuItem) topGpuItem.style.display = "inline";
                if (topGpuVal) topGpuVal.textContent = gpuStr;
            } else {
                if (topGpuItem) topGpuItem.style.display = "none";
            }
        } catch (e) {
            console.error("Sistem kaynak kullanımı alınamadı:", e);
        }
    }

    // Poll every 2 seconds
    setInterval(updateSystemUsage, 2000);
    updateSystemUsage(); // Immediate initial update

    // Load settings on startup
    loadAiSettings();

    // Android OTG Guide Modal Close
    const androidOTGModal = document.getElementById("androidOTGModal");
    const closeAndroidOTGModal = document.getElementById("closeAndroidOTGModal");
    if (closeAndroidOTGModal && androidOTGModal) {
        closeAndroidOTGModal.addEventListener("click", () => {
            androidOTGModal.style.display = "none";
        });
        window.addEventListener("click", (e) => {
            if (e.target === androidOTGModal) {
                androidOTGModal.style.display = "none";
            }
        });
    }

});
