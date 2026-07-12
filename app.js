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
    let currentPort = "Yok";
    let globalWebPort = null; // Stored WebUSB/Serial port
    let isConsoleMaximized = false;
    let uploadProgressInterval = null;
    let isCompilingOrUploading = false;
    let editorFontSize = 14; // px
    let undoStack = [];
    let redoStack = [];
    let lastSavedCode = "";

    // --- Localization ---
    let currentLang = localStorage.getItem("gaziLang") || "tr";
    const i18n = {
        tr: {
            "btnSettings": "Kullanıcı Ayarları",
            "settingsTitle": "⚙ Kullanıcı Ayarları",
            "fontSize": "Yazı Tipi Boyutu",
            "theme": "Tema",
            "autoSave": "Otomatik Kaydetme",
            "language": "Dil",
            "btnApply": "Uygula",
            "btnClose": "Kapat",
            "active": "Aktif",
            "panelSketchbook": "PROJE DOSYALARI",
            "panelBoards": "KART YÖNETİCİSİ",
            "panelLibraries": "KÜTÜPHANE YÖNETİCİSİ",
            "panelDebug": "HATA AYIKLA",
            "panelAi": "AI ASİSTAN",
            "panelSearch": "ARA",
            "newFile": "Yeni Dosya",
            "newFolder": "Yeni Klasör",
            "refresh": "Yenile"
        },
        en: {
            "btnSettings": "User Settings",
            "settingsTitle": "⚙ User Settings",
            "fontSize": "Font Size",
            "theme": "Theme",
            "autoSave": "Auto Save",
            "language": "Language",
            "btnApply": "Apply",
            "btnClose": "Close",
            "active": "Active",
            "panelSketchbook": "PROJECT FILES",
            "panelBoards": "BOARDS MANAGER",
            "panelLibraries": "LIBRARY MANAGER",
            "panelDebug": "DEBUG",
            "panelAi": "AI ASSISTANT",
            "panelSearch": "SEARCH",
            "newFile": "New File",
            "newFolder": "New Folder",
            "refresh": "Refresh"
        }
    };

    function translateUi() {
        const dict = i18n[currentLang];
        if (!dict) return;
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (dict[key]) {
                if (el.tagName === "INPUT" && el.type === "placeholder") {
                    el.placeholder = dict[key];
                } else if (el.hasAttribute("title")) {
                    el.title = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });
        
        // Settings panel specific
        const btnSettings = document.getElementById("btnSettings");
        if(btnSettings) btnSettings.title = dict["btnSettings"];
    }

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
                    const dict = i18n[currentLang];
                    settingsModal = document.createElement("div");
                    settingsModal.id = "settingsModal";
                    settingsModal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;";
                    settingsModal.innerHTML = `
                        <div style="background:#1e1e1e;border:1px solid #3c3c3c;border-radius:8px;padding:24px;width:420px;max-height:80vh;overflow-y:auto;color:#ccc;font-family:Inter,sans-serif;">
                            <h3 style="margin:0 0 16px;color:#00979d;" data-i18n="settingsTitle">${dict.settingsTitle}</h3>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;" data-i18n="fontSize">${dict.fontSize}</label>
                                <input type="range" min="10" max="24" value="${editorFontSize}" id="settingsFontSize" style="width:100%;">
                                <span id="settingsFontSizeVal">${editorFontSize}px</span>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;" data-i18n="theme">Tema</label>
                                <select id="settingsTheme" style="width:100%;padding:6px;background:#2d2d2d;color:#ccc;border:1px solid #555;border-radius:4px;">
                                    <option value="dark" selected>Koyu Tema</option>
                                    <option value="light">Açık Tema (yakında)</option>
                                </select>
                            </div>
                            <div style="margin-bottom:12px;">
                                <label style="display:block;margin-bottom:4px;font-size:12px;" data-i18n="language">Dil / Language</label>
                                <select id="settingsLang" style="width:100%;padding:6px;background:#2d2d2d;color:#ccc;border:1px solid #555;border-radius:4px;">
                                    <option value="tr" ${currentLang === 'tr' ? 'selected' : ''}>Türkçe</option>
                                    <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
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
                        
                        const newLang = settingsModal.querySelector("#settingsLang").value;
                        if (newLang !== currentLang) {
                            currentLang = newLang;
                            localStorage.setItem("gaziLang", currentLang);
                            translateUi();
                        }
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

    // Dynamic Port detection using WebUSB/WebSerial
    const activePortLabel = document.getElementById("activePortLabel");
    const btnSelectWebPort = document.getElementById("btnSelectWebPort");

    if (btnSelectWebPort) {
        btnSelectWebPort.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                if ("usb" in navigator) {
                    const usbDevice = await navigator.usb.requestDevice({ filters: [] });
                    globalWebPort = new CP2102SerialPort(usbDevice);
                    currentPort = `WebUSB (${usbDevice.productName || 'Cihaz'})`;
                } else if ("serial" in navigator) {
                    globalWebPort = await navigator.serial.requestPort();
                    currentPort = "Web Serial Cihazı";
                } else {
                    alert("Tarayıcınız WebUSB veya Web Serial desteklemiyor.");
                    return;
                }
                
                activePortLabel.textContent = currentPort;
                statusBoardText.textContent = `${currentBoard} - ${currentPort} [bağlı]`;
                
                // Hide dropdown hack
                const parentDropdown = btnSelectWebPort.closest('.dropdown-menu');
                if (parentDropdown) {
                    parentDropdown.style.display = 'none';
                    setTimeout(() => parentDropdown.style.display = '', 150);
                }
                
                addConsoleLog(`Port başarıyla seçildi: ${currentPort}`, "success");
            } catch (err) {
                console.error("Port seçimi başarısız:", err);
                addConsoleLog("Port seçimi iptal edildi veya başarısız oldu: " + err.message, "error");
            }
        });
    }

    // Default UI state
    activePortLabel.textContent = "Yok";
    statusBoardText.textContent = `${currentBoard} - Port Seçilmedi`;


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

        // DEBUG: Detailed system info
        const hasNativeSerial = "serial" in navigator;
        const hasWebUSB = "usb" in navigator;
        const isSecure = window.isSecureContext;
        const proto = window.location.protocol;
        const host = window.location.hostname;
        addConsoleLog(`[DEBUG] Secure: ${isSecure}, Proto: ${proto}, Host: ${host}, Serial: ${hasNativeSerial}, USB: ${hasWebUSB}`, "info");

        // If board is ESP, ALWAYS use web flasher
        if (currentBoard && (currentBoard.includes("ESP") || currentBoard.includes("esp"))) {
            addConsoleLog(`Web Yükleyici aktif!`, "info");
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

    // ===== Custom CP2102 WebUSB Serial Driver =====
    // The web-serial-polyfill only supports CDC-ACM (class 2) devices.
    // CP2102 uses vendor-specific USB protocol, so we implement our own driver.
    class CP2102SerialPort {
        constructor(device) {
            this.device_ = device;
            this.interfaceNumber_ = -1;
            this.endpointIn_ = -1;
            this.endpointOut_ = -1;
            this.readable = null;
            this.writable = null;
        }

        getInfo() {
            return {
                usbVendorId: this.device_.vendorId,
                usbProductId: this.device_.productId
            };
        }

        async open({ baudRate }) {
            await this.device_.open();
            if (this.device_.configuration === null) {
                await this.device_.selectConfiguration(1);
            }

            // Find vendor-specific interface with bulk endpoints
            for (const iface of this.device_.configuration.interfaces) {
                for (const alt of iface.alternates) {
                    if (alt.interfaceClass === 0xFF || alt.endpoints.length >= 2) {
                        this.interfaceNumber_ = iface.interfaceNumber;
                        for (const ep of alt.endpoints) {
                            if (ep.direction === 'in' && ep.type === 'bulk') this.endpointIn_ = ep.endpointNumber;
                            if (ep.direction === 'out' && ep.type === 'bulk') this.endpointOut_ = ep.endpointNumber;
                        }
                        if (this.endpointIn_ >= 0 && this.endpointOut_ >= 0) break;
                    }
                }
                if (this.endpointIn_ >= 0 && this.endpointOut_ >= 0) break;
            }

            if (this.interfaceNumber_ < 0 || this.endpointIn_ < 0 || this.endpointOut_ < 0) {
                throw new Error("CP2102 arayüzü veya endpoint bulunamadı.");
            }

            await this.device_.claimInterface(this.interfaceNumber_);

            // IFC_ENABLE: Enable the interface
            await this.device_.controlTransferOut({
                requestType: 'vendor', recipient: 'interface',
                request: 0x00, value: 0x0001, index: this.interfaceNumber_
            });

            // SET_BAUDRATE
            await this.setBaudRate_(baudRate);

            // SET_LINE_CTL: 8 data bits, no parity, 1 stop bit (0x0800)
            await this.device_.controlTransferOut({
                requestType: 'vendor', recipient: 'interface',
                request: 0x03, value: 0x0800, index: this.interfaceNumber_
            });

            // PURGE: Clear read and write buffers
            await this.device_.controlTransferOut({
                requestType: 'vendor', recipient: 'interface',
                request: 0x12, value: 0x000F, index: this.interfaceNumber_
            });

            // Set up readable stream
            const device = this.device_;
            const epIn = this.endpointIn_;
            let keepReading = true;
            this._keepReading = { value: true };
            const keepReadingRef = this._keepReading;

            this.readable = new ReadableStream({
                pull: async (controller) => {
                    if (!keepReadingRef.value) { controller.close(); return; }
                    try {
                        const result = await device.transferIn(epIn, 64);
                        if (result.data && result.data.byteLength > 0) {
                            controller.enqueue(new Uint8Array(result.data.buffer));
                        }
                    } catch (e) {
                        if (keepReadingRef.value) controller.error(e);
                    }
                }
            });

            // Set up writable stream
            const epOut = this.endpointOut_;
            this.writable = new WritableStream({
                write: async (chunk) => {
                    await device.transferOut(epOut, chunk);
                }
            });
        }

        async setBaudRate_(baudRate) {
            const data = new ArrayBuffer(4);
            const view = new DataView(data);
            view.setUint32(0, baudRate, true);
            await this.device_.controlTransferOut({
                requestType: 'vendor', recipient: 'interface',
                request: 0x1E, value: 0, index: this.interfaceNumber_
            }, data);
        }

        async setSignals({ dataTerminalReady, requestToSend }) {
            let value = 0;
            if (dataTerminalReady !== undefined) {
                value |= 0x0100;
                if (dataTerminalReady) value |= 0x0001;
            }
            if (requestToSend !== undefined) {
                value |= 0x0200;
                if (requestToSend) value |= 0x0002;
            }
            await this.device_.controlTransferOut({
                requestType: 'vendor', recipient: 'interface',
                request: 0x07, value: value, index: this.interfaceNumber_
            });
        }

        async close() {
            this._keepReading.value = false;
            try {
                await this.device_.controlTransferOut({
                    requestType: 'vendor', recipient: 'interface',
                    request: 0x00, value: 0x0000, index: this.interfaceNumber_
                });
                await this.device_.releaseInterface(this.interfaceNumber_);
                await this.device_.close();
            } catch (e) { console.warn("CP2102 close warning:", e); }
        }
    }
    async function handleWebUpload() {
        let port = globalWebPort;
        if (!port) {
            try {
                if ("usb" in navigator) {
                    addConsoleLog("Lütfen açılan pencereden ESP cihazınızı seçin...", "info");
                    const usbDevice = await navigator.usb.requestDevice({ filters: [] });
                    addConsoleLog("USB Cihaz bulundu: " + usbDevice.productName + " (VID:" + usbDevice.vendorId + ")", "info");
                    
                    port = new CP2102SerialPort(usbDevice);
                    globalWebPort = port;
                    currentPort = `WebUSB (${usbDevice.productName || 'Cihaz'})`;
                    document.getElementById("activePortLabel").textContent = currentPort;
                    document.getElementById("statusBoardText").textContent = `${currentBoard} - ${currentPort} [bağlı]`;
                    addConsoleLog("CP2102 sürücüsü hazır!", "info");
                } else if ("serial" in navigator) {
                    addConsoleLog("Lütfen açılan pencereden ESP cihazınızı seçin...", "info");
                    port = await navigator.serial.requestPort();
                    globalWebPort = port;
                    currentPort = "Web Serial Cihazı";
                    document.getElementById("activePortLabel").textContent = currentPort;
                    document.getElementById("statusBoardText").textContent = `${currentBoard} - ${currentPort} [bağlı]`;
                } else {
                    addConsoleLog("Bu tarayıcı ne Web Serial ne de WebUSB destekliyor.", "error");
                    return;
                }
            } catch (err) {
                console.error("Port seçilmedi veya iptal edildi:", err);
                addConsoleLog("Port seçilmedi veya donanım desteklemiyor: " + err.message, "error");
                return;
            }
        } else {
            addConsoleLog("Daha önce seçilen port kullanılıyor...", "info");
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

            // 3. Dynamically import esptool-js and connect to Web Serial
            addConsoleLog("esptool-js yükleniyor...", "");
            const esptoolModule = await import('https://unpkg.com/esptool-js/bundle.js');
            addConsoleLog("esptool exports: " + Object.keys(esptoolModule).join(", "), "info");
            const ESPLoader = esptoolModule.ESPLoader;
            const Transport = esptoolModule.Transport;
            addConsoleLog("Transport: " + typeof Transport + ", ESPLoader: " + typeof ESPLoader, "info");
            addConsoleLog("port.getInfo: " + typeof port.getInfo, "info");

            addConsoleLog("Tarayıcıdan ESP'ye bağlanılıyor...", "");
            transport = new Transport(port, true);

            const terminal = {
                clean: () => { },
                writeLine: (msg) => { console.log(msg); addConsoleLog(msg, "info"); },
                write: (msg) => { console.log(msg); }
            };

            const baudrate = parseInt(serialBaudrate.value, 10) || 115200;
            const esploader = new ESPLoader({
                transport: transport,
                baudrate: baudrate,
                terminal: terminal
            });

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

    // --- Console Resizer Logic ---
    const consoleResizer = document.getElementById("consoleResizer");
    let isResizingConsole = false;

    if (consoleResizer && consolePanel) {
        const startResize = (e) => {
            isResizingConsole = true;
            consolePanel.classList.add("no-transition"); // Disable transition during drag for smoothness
            document.body.style.cursor = "ns-resize";
            // e.preventDefault(); // Don't prevent default on touch, it might block scrolling or tap if we're not careful, but for resizer it's fine
        };

        const doResize = (e) => {
            if (!isResizingConsole) return;
            // Get clientY from either mouse or touch event
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            // Calculate new height: from the bottom of the window to the cursor position
            const newHeight = window.innerHeight - clientY;
            if (newHeight >= 32 && newHeight <= window.innerHeight - 50) { // Keep within bounds
                consolePanel.style.height = `${newHeight}px`;
            }
        };

        const stopResize = () => {
            if (isResizingConsole) {
                isResizingConsole = false;
                consolePanel.classList.remove("no-transition");
                document.body.style.cursor = "default";
            }
        };

        // Mouse Events
        consoleResizer.addEventListener("mousedown", (e) => { e.preventDefault(); startResize(e); });
        document.addEventListener("mousemove", doResize);
        document.addEventListener("mouseup", stopResize);

        // Touch Events (for Android/Tablets)
        consoleResizer.addEventListener("touchstart", (e) => { e.preventDefault(); startResize(e); }, { passive: false });
        document.addEventListener("touchmove", doResize, { passive: false });
        document.addEventListener("touchend", stopResize);
    }

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
    let BOARD_PACKAGES = [];
    let LIBRARIES = [];

    async function loadPackages() {
        try {
            const boardRes = await fetch("/boards.json");
            if (boardRes.ok) BOARD_PACKAGES = await boardRes.json();
        } catch (e) { console.error("Kart listesi yüklenemedi:", e); }
        
        try {
            const libRes = await fetch("/libraries.json");
            if (libRes.ok) LIBRARIES = await libRes.json();
        } catch (e) { console.error("Kütüphane listesi yüklenemedi:", e); }

        renderBoardPackages();
        renderLibraries();
        updateBoardMenu();
    }

    function updateBoardMenu() {
        const boardMenu = document.getElementById("menuBoardSubmenu");
        if (!boardMenu) return;

        let hasBoards = false;
        boardMenu.innerHTML = "";

        BOARD_PACKAGES.forEach(pkg => {
            if (pkg.installed && pkg.boards && pkg.boards.length > 0) {
                hasBoards = true;

                const parentDiv = document.createElement("div");
                parentDiv.className = "menu-row parent";
                
                const spanName = document.createElement("span");
                spanName.textContent = pkg.name;
                parentDiv.appendChild(spanName);

                const spanArrow = document.createElement("span");
                spanArrow.className = "arrow";
                spanArrow.textContent = "▶";
                parentDiv.appendChild(spanArrow);

                const submenu = document.createElement("div");
                submenu.className = "submenu";

                pkg.boards.forEach(board => {
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
                    submenu.appendChild(div);
                });

                parentDiv.appendChild(submenu);
                boardMenu.appendChild(parentDiv);
            }
        });

        if (!hasBoards) {
            boardMenu.innerHTML = '<div class="menu-row no-boards">Lütfen Kart Yöneticisinden bir kart paketi kurun.</div>';
        }
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
        let renderedCount = 0;
        for (let idx = 0; idx < LIBRARIES.length; idx++) {
            if (renderedCount >= 100) {
                // Add a small message at the bottom
                const msg = document.createElement("div");
                msg.style.padding = "10px";
                msg.style.textAlign = "center";
                msg.style.color = "#888";
                msg.innerHTML = "Daha fazla sonuç için aramayı daraltın...";
                container.appendChild(msg);
                break;
            }
            
            const lib = LIBRARIES[idx];
            if (q && !lib.name.toLowerCase().includes(q) && !lib.desc.toLowerCase().includes(q) && !lib.author.toLowerCase().includes(q)) continue;
            if (typeFilter === "installed" && !lib.installed) continue;
            if (typeFilter === "not-installed" && lib.installed) continue;

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
            renderedCount++;
        }
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
    loadPackages();

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
        if (globalWebPort && globalWebPort.close) {
            globalWebPort.close().catch(() => { });
            globalWebPort = null;
        }

        fetch("/api/serial/disconnect", { method: "POST" }).catch(err => console.error("Disconnect error:", err));
    }

    async function connectSerial() {
        disconnectSerial();

        let port = globalWebPort;
        if (!port) {
            try {
                if ("usb" in navigator) {
                    const usbDevice = await navigator.usb.requestDevice({ filters: [] });
                    port = new CP2102SerialPort(usbDevice);
                    globalWebPort = port;
                    currentPort = `WebUSB (${usbDevice.productName || 'Cihaz'})`;
                } else if ("serial" in navigator) {
                    port = await navigator.serial.requestPort();
                    globalWebPort = port;
                    currentPort = "Web Serial Cihazı";
                } else {
                    alert("Tarayıcınız WebUSB veya Web Serial desteklemiyor.");
                    return;
                }
                document.getElementById("activePortLabel").textContent = currentPort;
                document.getElementById("statusBoardText").textContent = `${currentBoard} - ${currentPort} [bağlı]`;
            } catch (err) {
                console.error("Port seçimi başarısız:", err);
                serialWarningBanner.style.display = "block";
                serialContentArea.classList.remove("connected");
                return;
            }
        }

        try {
            const baud = parseInt(serialBaudrate.value, 10) || 115200;
            
            if (!port.readable) {
                await port.open({ baudRate: baud });
            }

            // Reset ESP32 so it restarts and we catch the first Serial prints
            if (port.setSignals) {
                try {
                    await port.setSignals({ dataTerminalReady: false, requestToSend: true });
                    await new Promise(r => setTimeout(r, 100)); // wait 100ms
                    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
                } catch(e) {
                    console.warn("DTR/RTS reset failed:", e);
                }
            }

            serialWarningBanner.style.display = "none";
            serialContentArea.classList.add("connected");
            serialMessageInput.placeholder = `Mesaj ('${currentPort}'’a mesaj göndermek için Enter'a basın)`;
            serialTerminal.innerHTML = `--- ${currentPort} portu açıldı (Hız: ${baud}) ---\n`;

            const decoder = new TextDecoderStream();
            const inputDone = port.readable.pipeTo(decoder.writable);
            webSerialReader = decoder.readable.getReader();

            const encoder = new TextEncoderStream();
            const outputDone = encoder.readable.pipeTo(port.writable);
            webSerialWriter = encoder.writable.getWriter();

            readWebSerialLoop();
        } catch (err) {
            console.error("Seri Port Bağlantı Hatası:", err);
            serialTerminal.innerHTML += "\n[Bağlantı açılamadı: " + err.message + "]\n";
            disconnectSerial();
        }
    }

    async function readWebSerialLoop() {
        try {
            while (true) {
                const { value, done } = await webSerialReader.read();
                if (done) break;
                if (value) {
                    let data = value;
                    if (chkTimestamp.checked) {
                        const timeStr = new Date().toLocaleTimeString();
                        data = data.split('\n').map(l => l ? `[${timeStr}] ${l}` : l).join('\n');
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
            console.error("Seri okuma hatası:", e);
            disconnectSerial();
        }
    }

    const btnWebSerial = document.getElementById("btnWebSerial");
    if (btnWebSerial) {
        btnWebSerial.addEventListener("click", connectSerial);
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
                                hasStartedResponse = true; // Prevent overwriting with "AI yanıt üretemedi"
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
                    if (data.error) {
                        bubble.innerHTML = "❌ **Hata:** " + data.error;
                        hasStartedResponse = true;
                    }
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

    // Perform initial translation
    translateUi();
});
