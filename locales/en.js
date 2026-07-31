// locales/en.js
window.translations = window.translations || {};
window.appMessages = window.appMessages || {};

window.translations.en = {
    'html':{lang:'en', dir:'ltr'},
    '[data-label="file"]': { textContent: 'File' },
    '[data-action="new-sketch"] span:first-child': { textContent: 'New Sketch' },
    '[data-action="new-cloud-sketch"] span:first-child': { textContent: 'New Cloud Sketch' },
    '[data-action="open"] span:first-child': { textContent: 'Open...' },
    '[data-label="open-recent"]': { textContent: 'Open Recent' },
    '[data-label="sketchbook"]': { textContent: 'Sketchbook' },
    '[data-label="examples"]': { textContent: 'Examples' },
    '[data-action="close-sketch"] span:first-child': { textContent: 'Close' },
    '[data-action="save"] span:first-child': { textContent: 'Save' },
    '[data-action="save-as"] span:first-child': { textContent: 'Save As...' },
    '[data-action="preferences"] span:first-child': { textContent: 'Preferences...' },
    '[data-label="advanced"]': { textContent: 'Advanced' },
    '[data-action="adv-keyboard"]': { textContent: 'Keyboard Shortcuts' },
    '[data-action="exit"] span:first-child': { textContent: 'Quit' },

    // Edit Menu
    '[data-label="edit"]': { textContent: 'Edit' },
    '[data-action="undo"] span:first-child': { textContent: 'Undo' },
    '[data-action="redo"] span:first-child': { textContent: 'Redo' },
    '[data-action="cut"] span:first-child': { textContent: 'Cut' },
    '[data-action="copy"] span:first-child': { textContent: 'Copy' },
    '[data-action="copy-markdown"] span:first-child': { textContent: 'Copy for Forum (Markdown)' },
    '[data-action="paste"] span:first-child': { textContent: 'Paste' },
    '[data-action="select-all"] span:first-child': { textContent: 'Select All' },
    '[data-action="goto-line"] span:first-child': { textContent: 'Go to Line/Column...' },
    '[data-action="toggle-comment"] span:first-child': { textContent: 'Toggle Comment' },
    '[data-action="increase-indent"] span:first-child': { textContent: 'Increase Indent' },
    '[data-action="decrease-indent"] span:first-child': { textContent: 'Decrease Indent' },
    '[data-action="auto-format"] span:first-child': { textContent: 'Auto Format' },
    '[data-action="find-replace"] span:first-child': { textContent: 'Replace in Files' },
    '[data-action="zoom-in"] span:first-child': { textContent: 'Increase Font Size' },
    '[data-action="zoom-out"] span:first-child': { textContent: 'Decrease Font Size' },
    '[data-action="find"] span:first-child': { textContent: 'Find' },
    '[data-action="find-next"] span:first-child': { textContent: 'Find Next' },
    '[data-action="find-prev"] span:first-child': { textContent: 'Find Previous' },
    '[data-action="find-selection"] span:first-child': { textContent: 'Find Selection' },

    // Sketch Menu
    '[data-label="sketch"]': { textContent: 'Sketch' },
    '[data-action="verify"] span:first-child': { textContent: 'Verify / Compile' },
    '[data-action="upload"] span:first-child': { textContent: 'Upload' },
    '[data-action="upload-programmer"] span:first-child': { textContent: 'Upload Using Programmer' },
    '[data-action="export-compiled"] span:first-child': { textContent: 'Export Compiled Binary' },

    // Tools Menu
    '[data-label="tools"]': { textContent: 'Tools' },
    '[data-action="archive-sketch"] span:first-child': { textContent: 'Archive Sketch' },
    '[data-action="manage-libraries"] span:first-child': { textContent: 'Manage Libraries...' },
    '[data-action="serial-monitor"] span:first-child': { textContent: 'Serial Monitor' },
    '[data-action="serial-plotter"] span:first-child': { textContent: 'Serial Plotter' },
    '#menuBoardSubmenu .no-boards': { textContent: 'Please install a board package from the Boards Manager.' },
    '#btnSelectWebPort': { textContent: 'Select Port from Browser (WebUSB/Serial)' },
    '[data-action="reload-board"] span:first-child': { textContent: 'Reload Board Info' },
    '[data-action="get-board-info"] span:first-child': { textContent: 'Get Board Info' },

    // Help Menu
    '[data-label="help"]': { textContent: 'Help' },
    '[data-action="help-getting-started"]': { textContent: 'Getting Started' },
    '[data-action="help-ref"]': { textContent: 'Reference' },
    '[data-action="help-about"]': { textContent: 'About Arduino IDE' },

    // Toolbar Tooltips & Search
    '#btnVerify': { title: 'Verify' },
    '#btnUpload': { title: 'Upload' },
    '#btnToolbarSerial': { title: 'Serial Monitor' },
    '#boardSearchInput': { placeholder: 'Search board...' },

    // Sidebar Tooltips
    '[data-panel="panel-sketchbook"]': { title: 'Sketchbook' },
    '[data-panel="panel-boards"]': { title: 'Boards Manager' },
    '[data-panel="panel-libraries"]': { title: 'Library Manager' },
    '[data-panel="panel-debug"]': { title: 'Debug' },
    '[data-panel="panel-ai"]': { title: 'AI Assistant' },
    '[data-panel="panel-search"]': { title: 'Search' },
    '#btnSettings': { title: 'User Settings' },

    // Sidebar Panels
    '#panel-sketchbook .panel-title': { textContent: 'PROJECT FILES' },
    '#btnNewFile': { title: 'New File' },
    '#btnNewFolder': { title: 'New Folder' },
    '#btnRefreshTree': { title: 'Refresh' },

    '#panel-boards .panel-title': { textContent: 'BOARDS MANAGER' },
    '#panelBoardSearch': { placeholder: 'Filter search...' },
    '#panel-boards .panel-filter-bar label': { textContent: 'Type:' },
    '#boardTypeFilter option[value="all"]': { textContent: 'All' },
    '#boardTypeFilter option[value="installed"]': { textContent: 'Installed' },
    '#boardTypeFilter option[value="not-installed"]': { textContent: 'Not Installed' },

    '#panel-libraries .panel-title': { textContent: 'LIBRARY MANAGER' },
    '#panelLibSearch': { placeholder: 'Search library...' },
    '#panel-libraries .panel-filter-bar label': { textContent: 'Type:' },
    '#libTypeFilter option[value="all"]': { textContent: 'All' },
    '#libTypeFilter option[value="installed"]': { textContent: 'Installed' },
    '#libTypeFilter option[value="not-installed"]': { textContent: 'Not Installed' },

    '#panel-debug .panel-title': { textContent: 'DEBUG' },
    '#panel-debug .debug-placeholder p': { textContent: 'Select a supported board to use the debugger.' },
    '#panel-debug .debug-start-btn': { textContent: 'Start Debugging' },

    '#panel-ai .panel-title': { textContent: '✨ AI ASSISTANT' },
    '#btnAiHistory': { title: 'Chat History' },
    '#btnNewAiChat': { title: 'New Chat' },
    '#btnAiSettings': { title: 'AI Settings' },
    '#btnAiClear': { title: 'Clear Chat' },
    '#panel-ai .ai-history-header': { textContent: 'Previous Chats' },
    '#panel-ai .ai-bubble': {
      fn: (el) => {
        el.innerHTML = `Hello! I'm GaziDuino AI Assistant. I can help you with Arduino programming, circuit design, and debugging. 🤖<br><br><small style="opacity:0.7">Enter your API key in settings to start.</small>`;
      }
    },
    '#aiInput': { placeholder: 'Ask something about Arduino...' },
    '#btnAiSend': { title: 'Send' },
    '#panel-ai .ai-context-toggle': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Send code to AI'));
      }
    },

    '#panel-search .panel-title': { textContent: 'SEARCH' },
    '#searchQueryInput': { placeholder: 'Search term...' },
    '#panel-search .search-options label': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Match Case'));
      }
    },
    '#btnSearchTrigger': { textContent: 'Find' },

    // Bottom Console
    '#tabOutputBtn': { textContent: 'Output' },
    '#tabSerialBtn': {
      fn: (el) => {
        const span = el.querySelector('.close-serial-tab');
        el.innerHTML = 'Serial Monitor ';
        if (span) el.appendChild(span);
      }
    },
    '#copyConsoleBtn': { title: 'Copy' },
    '#clearConsoleBtn': { title: 'Clear' },
    '#toggleConsoleHeight': { title: 'Toggle Fullscreen / Restore' },
    '#closeConsoleBtn': { title: 'Close' },

    '#serialWarningBanner': { textContent: 'Not connected. Select a board and port to connect automatically.' },
    '#btnWebSerial': {
      fn: (el) => {
        el.innerHTML = '🌐 Connect Web Serial';
        el.title = 'Connects directly via browser OTG or desktop USB';
      }
    },
    '#serialMessageInput': { placeholder: 'Press Enter to send message' },
    '#serialLineEnding option[value="nl"]': { textContent: 'Newline' },
    '#serialLineEnding option[value="none"]': { textContent: 'No line ending' },
    '#serialLineEnding option[value="cr"]': { textContent: 'Carriage Return' },
    '#serialLineEnding option[value="both"]': { textContent: 'Both (NL & CR)' },
    '#paneSerial label[for="chkAutoscroll"]': { textContent: 'Autoscroll' },
    '#paneSerial label[for="chkTimestamp"]': { textContent: 'Show timestamp' },

    // Status Bar & Modal Prompt
    '#cursorPosition': { textContent: 'Line 1, Column 1' },
    '#progressMessage': { textContent: 'Compiling sketch...' },
    '#btnCancelProgress': { textContent: 'CANCEL' },

    // Context Menu
    '[data-action="ctx-new-file"]': { textContent: '📄 New File' },
    '[data-action="ctx-new-folder"]': { textContent: '📁 New Folder' },
    '[data-action="ctx-rename"]': { textContent: '✏️ Rename' },
    '[data-action="ctx-delete"]': { textContent: '🗑 Delete' },

    // AI Settings Modal
    '#aiSettingsOverlay .ai-settings-header h3': { textContent: '✨ AI Assistant Settings' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(1) label': { textContent: 'API Key (Google AI Studio)' },
    '#aiSettingsOverlay .ai-setting-hint': {
      fn: (el) => {
        el.innerHTML = `You can get a free API key from <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#00979d">Google AI Studio</a>.`;
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(2) label': { textContent: 'Model' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) label': {
      fn: (el) => {
        const span = el.querySelector('#aiTempVal');
        el.textContent = 'Temperature: ';
        if (span) el.appendChild(span);
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) .ai-setting-hint': {
      textContent: 'Low = consistent responses, High = creative responses'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(4) label': { textContent: 'Max Tokens' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(5) label': { textContent: 'Response Language' },
    '#aiLanguage option[value="tr"]': { textContent: 'Turkish' },
    '#aiLanguage option[value="en"]': { textContent: 'English' },
    '#aiLanguage option[value="auto"]': { textContent: 'Automatic' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) span': { textContent: 'Auto Write & Run' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) .ai-setting-hint': {
      textContent: 'When enabled, AI automatically applies generated code to the sketch and runs it without asking.'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(7) label': { textContent: 'System Prompt (Optional)' },
    '#aiSystemPrompt': { placeholder: 'Additional instructions... (e.g., "Always add code comments")' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) label': { textContent: 'History' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) .ai-setting-hint': { textContent: 'Chat history is saved in browser' },
    '#btnClearHistory': { textContent: 'Clear History' },
    '#aiSettingsCancel': { textContent: 'Cancel' },
    '#aiSettingsSave': { textContent: 'Save' }
};

window.appMessages.en = {
    exit_confirm: "Are you sure you want to exit?",
    cloud_sketch_notice: "Note: Cloud sketch feature is not supported in local project, local new sketch created.",
    file_opened: "File opened: {file}",
    close_sketch_confirm: "Are you sure you want to close the sketch?",
    sketch_saved: "Sketch saved.",
    modal_shortcuts_title: "Keyboard Shortcuts",
    sc_new_sketch: "New Sketch",
    sc_open_file: "Open File",
    sc_save: "Save",
    sc_save_as: "Save As",
    sc_undo: "Undo",
    sc_redo: "Redo",
    sc_verify_compile: "Verify / Compile",
    sc_upload_board: "Upload to Board",
    sc_auto_format: "Auto Format",
    sc_find: "Find",
    sc_go_to_line: "Go to Line",
    sc_serial_monitor: "Serial Monitor",
    sc_font_size: "Increase/Decrease Font Size",
    btn_close: "Close",
    firmware_checking: "Firmware updater: Checking firmware info of connected board...",
    ssl_unsupported: "SSL certificate uploader is not supported in this environment.",
    board_info_reloaded: "Board info reloaded.",
    about_clone_info: "Arduino IDE 2.3.11-nightly-20260629 Clone",
    about_web_env: "Web-based Arduino development environment",
    btn_ok: "OK",
    replace_code_confirm: "Current code will be replaced with this example. Continue?",
    recent_searching: "Recent file: {file} (searching in local sketchbook...)",
    sketchbook_already_open: "Sketchbook: {file} is already open.",
    err_file_tree_failed: "Failed to load file tree.",
    err_file_read_failed: "Could not read file: {err}",
    err_file_open_failed: "Could not open file: {err}",
    err_unknown: "Unknown error",
    prompt_new_file: "New file name (including extension):",
    err_file_create_failed: "Could not create file: {err}",
    err_generic: "Error: {err}",
    prompt_new_folder: "New folder name:",
    err_folder_create_failed: "Could not create folder: {err}",
    prompt_rename: "New name:",
    err_rename_failed: "Could not rename: {err}",
    confirm_delete: 'Delete "{name}"? This action cannot be undone.',
    err_delete_failed: "Could not delete: {err}",
};
