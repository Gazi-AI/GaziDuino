// locales/ar.js
window.translations = window.translations || {};
window.appMessages = window.appMessages || {};

window.translations.ar = {
    'html':{lang:'ar', dir:'rtl'},
    //'body':{dir:'rtl'},
    '[data-label="file"]': { textContent: 'ملف' },
    '[data-action="new-sketch"] span:first-child': { textContent: 'مشروع جديد' },
    '[data-action="new-cloud-sketch"] span:first-child': { textContent: 'مشروع سحابي جديد' },
    '[data-action="open"] span:first-child': { textContent: 'فتح...' },
    '[data-label="open-recent"]': { textContent: 'الملفات الأخيرة' },
    '[data-label="sketchbook"]': { textContent: 'دفتر المشاريع' },
    '[data-label="examples"]': { textContent: 'أمثلة' },
    '[data-action="close-sketch"] span:first-child': { textContent: 'إغلاق' },
    '[data-action="save"] span:first-child': { textContent: 'حفظ' },
    '[data-action="save-as"] span:first-child': { textContent: 'حفظ باسم...' },
    '[data-action="preferences"] span:first-child': { textContent: 'التفضيلات...' },
    '[data-label="advanced"]': { textContent: 'متقدم' },
    '[data-action="adv-keyboard"]': { textContent: 'اختصارات لوحة المفاتيح' },
    '[data-action="exit"] span:first-child': { textContent: 'خروج' },

    '[data-label="edit"]': { textContent: 'تعديل' },
    '[data-action="undo"] span:first-child': { textContent: 'تراجع' },
    '[data-action="redo"] span:first-child': { textContent: 'إعادة' },
    '[data-action="cut"] span:first-child': { textContent: 'قص' },
    '[data-action="copy"] span:first-child': { textContent: 'نسخ' },
    '[data-action="copy-markdown"] span:first-child': { textContent: 'نسخ للمنتدى (Markdown)' },
    '[data-action="paste"] span:first-child': { textContent: 'لصق' },
    '[data-action="select-all"] span:first-child': { textContent: 'تحديد الكل' },
    '[data-action="goto-line"] span:first-child': { textContent: 'الانتقال إلى سطر/عمود...' },
    '[data-action="toggle-comment"] span:first-child': { textContent: 'تبديل التعليق' },
    '[data-action="increase-indent"] span:first-child': { textContent: 'زيادة المسافة البادئة' },
    '[data-action="decrease-indent"] span:first-child': { textContent: 'إنقاص المسافة البادئة' },
    '[data-action="auto-format"] span:first-child': { textContent: 'تنسيق تلقائي' },
    '[data-action="find-replace"] span:first-child': { textContent: 'استبدال في الملفات' },
    '[data-action="zoom-in"] span:first-child': { textContent: 'تكبير حجم الخط' },
    '[data-action="zoom-out"] span:first-child': { textContent: 'تصغير حجم الخط' },
    '[data-action="find"] span:first-child': { textContent: 'بحث' },
    '[data-action="find-next"] span:first-child': { textContent: 'البحث عن التالي' },
    '[data-action="find-prev"] span:first-child': { textContent: 'البحث عن السابق' },
    '[data-action="find-selection"] span:first-child': { textContent: 'البحث عن المحدد' },

    '[data-label="sketch"]': { textContent: 'مشروع' },
    '[data-action="verify"] span:first-child': { textContent: 'تحقق / تجميع' },
    '[data-action="upload"] span:first-child': { textContent: 'رفع' },
    '[data-action="upload-programmer"] span:first-child': { textContent: 'رفع باستخدام المبرمجة' },
    '[data-action="export-compiled"] span:first-child': { textContent: 'تصدير الملف البرمجي المجمع' },

    '[data-label="tools"]': { textContent: 'أدوات' },
    '[data-action="archive-sketch"] span:first-child': { textContent: 'أرشفة المشروع' },
    '[data-action="manage-libraries"] span:first-child': { textContent: 'إدارة المكتبات...' },
    '[data-action="serial-monitor"] span:first-child': { textContent: 'شاشة المنفذ التسلسلي' },
    '[data-action="serial-plotter"] span:first-child': { textContent: 'راسم المنفذ التسلسلي' },
    '#menuBoardSubmenu .no-boards': { textContent: 'يرجى تثبيت حزمة لوحة من مدير اللوحات.' },
    '#btnSelectWebPort': { textContent: 'اختر المنفذ من المتصفح (WebUSB/Serial)' },
    '[data-action="reload-board"] span:first-child': { textContent: 'إعادة تحميل معلومات اللوحة' },
    '[data-action="get-board-info"] span:first-child': { textContent: 'الحصول على معلومات اللوحة' },

    '[data-label="help"]': { textContent: 'مساعدة' },
    '[data-action="help-getting-started"]': { textContent: 'البدء' },
    '[data-action="help-ref"]': { textContent: 'المرجع' },
    '[data-action="help-about"]': { textContent: 'حول Arduino IDE' },

    '#btnVerify': { title: 'تحقق (تدقيق)' },
    '#btnUpload': { title: 'رفع' },
    '#btnToolbarSerial': { title: 'شاشة المنفذ التسلسلي' },
    '#boardSearchInput': { placeholder: 'بحث عن لوحة...' },

    '[data-panel="panel-sketchbook"]': { title: 'دفتر المشاريع' },
    '[data-panel="panel-boards"]': { title: 'مدير اللوحات' },
    '[data-panel="panel-libraries"]': { title: 'مدير المكتبات' },
    '[data-panel="panel-debug"]': { title: 'منقح الأخطاء' },
    '[data-panel="panel-ai"]': { title: 'مساعد الذكاء الاصطناعي' },
    '[data-panel="panel-search"]': { title: 'بحث' },
    '#btnSettings': { title: 'إعدادات المستخدم' },

    '#panel-sketchbook .panel-title': { textContent: 'ملفات المشروع' },
    '#btnNewFile': { title: 'ملف جديد' },
    '#btnNewFolder': { title: 'مجلد جديد' },
    '#btnRefreshTree': { title: 'تحديث' },

    '#panel-boards .panel-title': { textContent: 'مدير اللوحات' },
    '#panelBoardSearch': { placeholder: 'تصفية البحث...' },
    '#panel-boards .panel-filter-bar label': { textContent: 'النوع:' },
    '#boardTypeFilter option[value="all"]': { textContent: 'الكل' },
    '#boardTypeFilter option[value="installed"]': { textContent: 'المثبتة' },
    '#boardTypeFilter option[value="not-installed"]': { textContent: 'غير المثبتة' },

    '#panel-libraries .panel-title': { textContent: 'مدير المكتبات' },
    '#panelLibSearch': { placeholder: 'بحث عن مكتبة...' },
    '#panel-libraries .panel-filter-bar label': { textContent: 'النوع:' },
    '#libTypeFilter option[value="all"]': { textContent: 'الكل' },
    '#libTypeFilter option[value="installed"]': { textContent: 'المثبتة' },
    '#libTypeFilter option[value="not-installed"]': { textContent: 'غير المثبتة' },

    '#panel-debug .panel-title': { textContent: 'تصحيح الأخطاء' },
    '#panel-debug .debug-placeholder p': { textContent: 'اختر لوحة مدعومة لاستخدام منقح الأخطاء.' },
    '#panel-debug .debug-start-btn': { textContent: 'بدء تصحيح الأخطاء' },

    '#panel-ai .panel-title': { textContent: '✨ مساعد الذكاء الاصطناعي' },
    '#btnAiHistory': { title: 'سجل المحادثات' },
    '#btnNewAiChat': { title: 'محادثة جديدة' },
    '#btnAiSettings': { title: 'إعدادات الذكاء الاصطناعي' },
    '#btnAiClear': { title: 'مسح المحادثة' },
    '#panel-ai .ai-history-header': { textContent: 'المحادثات السابقة' },
    '#panel-ai .ai-bubble': {
      fn: (el) => {
        el.innerHTML = `مرحباً! أنا مساعد GaziDuino للذكاء الاصطناعي. يمكنني مساعدتك في برمجة أردوينو وتصميم الدوائر وتصحيح الأخطاء. 🤖<br><br><small style="opacity:0.7">أدخل مفتاح API في الإعدادات للبدء.</small>`;
      }
    },
    '#aiInput': { placeholder: 'اسأل شيئاً عن أردوينو...' },
    '#btnAiSend': { title: 'إرسال' },
    '#panel-ai .ai-context-toggle': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' إرسال الكود إلى الذكاء الاصطناعي'));
      }
    },

    '#panel-search .panel-title': { textContent: 'بحث' },
    '#searchQueryInput': { placeholder: 'كلمة البحث...' },
    '#panel-search .search-options label': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' مطابقة حالة الأحرف'));
      }
    },
    '#btnSearchTrigger': { textContent: 'بحث' },

    '#tabOutputBtn': { textContent: 'المخرجات' },
    '#tabSerialBtn': {
      fn: (el) => {
        const span = el.querySelector('.close-serial-tab');
        el.innerHTML = 'شاشة المنفذ التسلسلي ';
        if (span) el.appendChild(span);
      }
    },
    '#copyConsoleBtn': { title: 'نسخ' },
    '#clearConsoleBtn': { title: 'مسح' },
    '#toggleConsoleHeight': { title: 'ملء الشاشة / استعادة' },
    '#closeConsoleBtn': { title: 'إغلاق' },

    '#serialWarningBanner': { textContent: 'غير متصل. اختر لوحة ومؤنساً للاتصال تلقائياً.' },
    '#btnWebSerial': {
      fn: (el) => {
        el.innerHTML = '🌐 الاتصال عبر Web Serial';
        el.title = 'يتصل مباشرة عبر متصفح Android OTG أو USB المكتب';
      }
    },
    '#serialMessageInput': { placeholder: 'اضغط Enter لإرسال الرسالة' },
    '#serialLineEnding option[value="nl"]': { textContent: 'سطر جديد' },
    '#serialLineEnding option[value="none"]': { textContent: 'بدون نهاية سطر' },
    '#serialLineEnding option[value="cr"]': { textContent: 'Carriage Return' },
    '#serialLineEnding option[value="both"]': { textContent: 'كلاهما (NL & CR)' },
    '#paneSerial label[for="chkAutoscroll"]': { textContent: 'تمرير تلقائي' },
    '#paneSerial label[for="chkTimestamp"]': { textContent: 'إظهار الطابع الزمني' },

    '#cursorPosition': { textContent: 'السطر 1، العمود 1' },
    '#progressMessage': { textContent: 'جاري تجميع المشروع...' },
    '#btnCancelProgress': { textContent: 'إلغاء' },

    '[data-action="ctx-new-file"]': { textContent: '📄 ملف جديد' },
    '[data-action="ctx-new-folder"]': { textContent: '📁 مجلد جديد' },
    '[data-action="ctx-rename"]': { textContent: '✏️ إعادة تسمية' },
    '[data-action="ctx-delete"]': { textContent: '🗑 حذف' },

    '#aiSettingsOverlay .ai-settings-header h3': { textContent: '✨ إعدادات مساعد الذكاء الاصطناعي' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(1) label': { textContent: 'مفتاح API (Google AI Studio)' },
    '#aiSettingsOverlay .ai-setting-hint': {
      fn: (el) => {
        el.innerHTML = `يمكنك الحصول على مفتاح API مجاني من <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#00979d">Google AI Studio</a>.`;
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(2) label': { textContent: 'النموذج' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) label': {
      fn: (el) => {
        const span = el.querySelector('#aiTempVal');
        el.textContent = 'درجة الحرارة (Temperature): ';
        if (span) el.appendChild(span);
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) .ai-setting-hint': {
      textContent: 'منخفض = إجابات متسقة، مرتفع = إجابات إبداعية'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(4) label': { textContent: 'الحد الأقصى للرموز (Tokens)' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(5) label': { textContent: 'لغة الإجابة' },
    '#aiLanguage option[value="tr"]': { textContent: 'التركية' },
    '#aiLanguage option[value="en"]': { textContent: 'الإنكليزية' },
    '#aiLanguage option[value="auto"]': { textContent: 'تلقائي' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) span': { textContent: 'كتابة وتشغيل تلقائي (Auto Run)' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) .ai-setting-hint': {
      textContent: 'عند التفعيل، يطبق الذكاء الاصطناعي الكود المنشأ مباشرة على المشروع ويشغله دون انتظار التأكيد.'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(7) label': { textContent: 'تعليمات النظام (اختياري)' },
    '#aiSystemPrompt': { placeholder: 'تعليمات إضافية... (مثال: "أضف تعليقات دائماً للشفرة")' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) label': { textContent: 'السجل' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) .ai-setting-hint': { textContent: 'يتم حفظ سجل المحادثات في المتصفح' },
    '#btnClearHistory': { textContent: 'مسح السجل' },
    '#aiSettingsCancel': { textContent: 'إلغاء' },
    '#aiSettingsSave': { textContent: 'حفظ' }
};

window.appMessages.ar = {
    exit_confirm: "هل أنت تأكد من أنك تريد الخروج؟",
    cloud_sketch_notice: "ملاحظة: ميزة المسودة السحابية غير مدعومة في المشروع المحلي، تم إنشاء مسودة محلية جديدة.",
    file_opened: "تم فتح الملف: {file}",
    close_sketch_confirm: "هل أنت تأكد من أنك تريد إغلاق المسودة؟",
    sketch_saved: "تم حفظ المسودة.",
    modal_shortcuts_title: "اختصارات لوحة المفاتيح",
    sc_new_sketch: "مسودة جديدة",
    sc_open_file: "فتح ملف",
    sc_save: "حفظ",
    sc_save_as: "حفظ باسم",
    sc_undo: "تراجع",
    sc_redo: "إعادة",
    sc_verify_compile: "تحقق / تجميع",
    sc_upload_board: "رفع إلى اللوحة",
    sc_auto_format: "تنسيق تلقائي",
    sc_find: "بحث",
    sc_go_to_line: "الانتقال إلى السطر",
    sc_serial_monitor: "شاشة المنفذ التسلسلي",
    sc_font_size: "تكبير/تصغير حجم الخط",
    btn_close: "إغلاق",
    firmware_checking: "محدث البرامج الثابتة: جاري التحقق من معلومات البرامج الثابتة للوحة المتصلة...",
    ssl_unsupported: "مُحمل شهادات SSL غير مدعوم في هذه البيئة.",
    board_info_reloaded: "تم إعادة تحميل معلومات اللوحة.",
    about_clone_info: "استنسخ Arduino IDE 2.3.11-nightly-20260629",
    about_web_env: "بيئة تطوير أردوينو قائمة على الويب",
    btn_ok: "موافق",
    replace_code_confirm: "سيتم استبدال الكود الحالي بهذا المثال. المتابعة؟",
    recent_searching: "الملف الأخير: {file} (جاري البحث في دفتر المسودات المحلي...)",
    sketchbook_already_open: "دفتر المسودات: {file} مفتوح بالفعل.",
    err_file_tree_failed: "تعذر تحميل شجرة الملفات.",
    err_file_read_failed: "تعذر قراءة الملف: {err}",
    err_file_open_failed: "تعذر فتح الملف: {err}",
    err_unknown: "خطأ غير معروف",
    prompt_new_file: "اسم الملف الجديد (مع الامتداد):",
    err_file_create_failed: "تعذر إنشاء الملف: {err}",
    err_generic: "خطأ: {err}",
    prompt_new_folder: "اسم المجلد الجديد:",
    err_folder_create_failed: "تعذر إنشاء المجلد: {err}",
    prompt_rename: "الاسم الجديد:",
    err_rename_failed: "تعذر إعادة التسمية: {err}",
    confirm_delete: 'هل تريد حذف "{name}"؟ لا يمكن التراجع عن هذا الإجراء.',
    err_delete_failed: "تعذر الحذف: {err}",
};
