// locales/tr.js
window.translations = window.translations || {};
window.appMessages = window.appMessages || {};

window.translations.tr = {
    'html':{lang:'tr', dir:'ltr'},
    '[data-label="file"]': { textContent: 'Dosya' },
    '[data-action="new-sketch"] span:first-child': { textContent: 'Yeni Eskiz' },
    '[data-action="new-cloud-sketch"] span:first-child': { textContent: 'Yeni Bulut Eskiz' },
    '[data-action="open"] span:first-child': { textContent: 'Aç...' },
    '[data-label="open-recent"]': { textContent: 'Yakın Geçmiş' },
    '[data-label="sketchbook"]': { textContent: 'Eskiz Defteri' },
    '[data-label="examples"]': { textContent: 'Örnekler' },
    '[data-action="close-sketch"] span:first-child': { textContent: 'Kapat' },
    '[data-action="save"] span:first-child': { textContent: 'Kaydet' },
    '[data-action="save-as"] span:first-child': { textContent: 'Farklı Kaydet...' },
    '[data-action="preferences"] span:first-child': { textContent: 'Tercihler...' },
    '[data-label="advanced"]': { textContent: 'Gelişmiş' },
    '[data-action="adv-keyboard"]': { textContent: 'Klavye Kısayolları' },
    '[data-action="exit"] span:first-child': { textContent: 'Çıkış' },

    '[data-label="edit"]': { textContent: 'Düzenle' },
    '[data-action="undo"] span:first-child': { textContent: 'Geri al' },
    '[data-action="redo"] span:first-child': { textContent: 'Yinele' },
    '[data-action="cut"] span:first-child': { textContent: 'Kes' },
    '[data-action="copy"] span:first-child': { textContent: 'Kopyala' },
    '[data-action="copy-markdown"] span:first-child': { textContent: 'Forum için Kopyala (Markdown)' },
    '[data-action="paste"] span:first-child': { textContent: 'Yapıştır' },
    '[data-action="select-all"] span:first-child': { textContent: 'Tümünü Seç' },
    '[data-action="goto-line"] span:first-child': { textContent: 'Satıra/Sütuna Git...' },
    '[data-action="toggle-comment"] span:first-child': { textContent: 'Yorum yap/Yorumu kaldır' },
    '[data-action="increase-indent"] span:first-child': { textContent: 'Girintiyi Artır' },
    '[data-action="decrease-indent"] span:first-child': { textContent: 'Girintiyi Azalt' },
    '[data-action="auto-format"] span:first-child': { textContent: 'Otomatik Biçimlendir' },
    '[data-action="find-replace"] span:first-child': { textContent: 'Dosyalarda Değiştir' },
    '[data-action="zoom-in"] span:first-child': { textContent: 'Yazı Tipi Boyutunu Büyüt' },
    '[data-action="zoom-out"] span:first-child': { textContent: 'Yazı Tipi Boyutunu Küçült' },
    '[data-action="find"] span:first-child': { textContent: 'Bul' },
    '[data-action="find-next"] span:first-child': { textContent: 'Sonrakini Bul' },
    '[data-action="find-prev"] span:first-child': { textContent: 'Öncekini Bul' },
    '[data-action="find-selection"] span:first-child': { textContent: 'Seçimle Bul' },

    '[data-label="sketch"]': { textContent: 'Eskiz' },
    '[data-action="verify"] span:first-child': { textContent: 'Doğrula/Derle' },
    '[data-action="upload"] span:first-child': { textContent: 'Yükle' },
    '[data-action="upload-programmer"] span:first-child': { textContent: 'Programlayıcı kullanarak yükle' },
    '[data-action="export-compiled"] span:first-child': { textContent: 'Derlenmiş İkili Dosyayı Çıkart' },

    '[data-label="tools"]': { textContent: 'Araçlar' },
    '[data-action="archive-sketch"] span:first-child': { textContent: 'Eskizi Arşivle' },
    '[data-action="manage-libraries"] span:first-child': { textContent: 'Kütüphaneleri Yönet...' },
    '[data-action="serial-monitor"] span:first-child': { textContent: 'Seri Port Ekranı' },
    '[data-action="serial-plotter"] span:first-child': { textContent: 'Seri Çizici' },
    '#menuBoardSubmenu .no-boards': { textContent: 'Lütfen Kart Yöneticisinden bir kart paketi kurun.' },
    '#btnSelectWebPort': { textContent: 'Tarayıcıdan Port Seç (WebUSB/Serial)' },
    '[data-action="reload-board"] span:first-child': { textContent: 'Kart Bilgisini Yeniden Yükle' },
    '[data-action="get-board-info"] span:first-child': { textContent: 'Kart Bilgisini Al' },

    '[data-label="help"]': { textContent: 'Yardım' },
    '[data-action="help-getting-started"]': { textContent: 'Başlarken' },
    '[data-action="help-ref"]': { textContent: 'Referans' },
    '[data-action="help-about"]': { textContent: 'Arduino IDE Hakkında' },

    '#btnVerify': { title: 'Kontrol Et (Doğrula)' },
    '#btnUpload': { title: 'Yükle' },
    '#btnToolbarSerial': { title: 'Seri Port Ekranı' },
    '#boardSearchInput': { placeholder: 'Kart ara...' },

    '[data-panel="panel-sketchbook"]': { title: 'Eskiz Defteri' },
    '[data-panel="panel-boards"]': { title: 'Kart Yöneticisi' },
    '[data-panel="panel-libraries"]': { title: 'Kütüphane Yöneticisi' },
    '[data-panel="panel-debug"]': { title: 'Hata Ayıkla' },
    '[data-panel="panel-ai"]': { title: 'AI Asistan' },
    '[data-panel="panel-search"]': { title: 'Ara' },
    '#btnSettings': { title: 'Kullanıcı Ayarları' },

    '#panel-sketchbook .panel-title': { textContent: 'PROJE DOSYALARI' },
    '#btnNewFile': { title: 'Yeni Dosya' },
    '#btnNewFolder': { title: 'Yeni Klasör' },
    '#btnRefreshTree': { title: 'Yenile' },

    '#panel-boards .panel-title': { textContent: 'KART YÖNETİCİSİ' },
    '#panelBoardSearch': { placeholder: 'Aramayı Filtrele...' },
    '#panel-boards .panel-filter-bar label': { textContent: 'Tür:' },
    '#boardTypeFilter option[value="all"]': { textContent: 'Tümü' },
    '#boardTypeFilter option[value="installed"]': { textContent: 'Kurulu' },
    '#boardTypeFilter option[value="not-installed"]': { textContent: 'Kurulu Değil' },

    '#panel-libraries .panel-title': { textContent: 'KÜTÜPHANE YÖNETİCİSİ' },
    '#panelLibSearch': { placeholder: 'Kütüphane ara...' },
    '#panel-libraries .panel-filter-bar label': { textContent: 'Tür:' },
    '#libTypeFilter option[value="all"]': { textContent: 'Tümü' },
    '#libTypeFilter option[value="installed"]': { textContent: 'Kurulu' },
    '#libTypeFilter option[value="not-installed"]': { textContent: 'Kurulu Değil' },

    '#panel-debug .panel-title': { textContent: 'HATA AYIKLA' },
    '#panel-debug .debug-placeholder p': { textContent: 'Hata ayıklayıcıyı kullanmak için desteklenen bir kart seçin.' },
    '#panel-debug .debug-start-btn': { textContent: 'Hata Ayıklamayı Başlat' },

    '#panel-ai .panel-title': { textContent: '✨ AI ASİSTAN' },
    '#btnAiHistory': { title: 'Geçmiş Sohbetler' },
    '#btnNewAiChat': { title: 'Yeni Sohbet' },
    '#btnAiSettings': { title: 'AI Ayarları' },
    '#btnAiClear': { title: 'Sohbeti Temizle' },
    '#panel-ai .ai-history-header': { textContent: 'Eski Sohbetler' },
    '#panel-ai .ai-bubble': {
      fn: (el) => {
        el.innerHTML = `Merhaba! Ben GaziDuino AI Asistanıyım. Arduino programlama, devre tasarımı ve hata ayıklama konularında sana yardımcı olabilirim. 🤖<br><br><small style="opacity:0.7">Başlamak için ayarlardan API anahtarınızı girin.</small>`;
      }
    },
    '#aiInput': { placeholder: 'Arduino hakkında bir şey sor...' },
    '#btnAiSend': { title: 'Gönder' },
    '#panel-ai .ai-context-toggle': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Kodu AI\'ya gönder'));
      }
    },

    '#panel-search .panel-title': { textContent: 'ARA' },
    '#searchQueryInput': { placeholder: 'Aranacak kelime...' },
    '#panel-search .search-options label': {
      fn: (el) => {
        const checkbox = el.querySelector('input');
        el.innerHTML = '';
        el.appendChild(checkbox);
        el.appendChild(document.createTextNode(' Harf Duyarlı'));
      }
    },
    '#btnSearchTrigger': { textContent: 'Bul' },

    '#tabOutputBtn': { textContent: 'Çıkış' },
    '#tabSerialBtn': {
      fn: (el) => {
        const span = el.querySelector('.close-serial-tab');
        el.innerHTML = 'Seri Port Ekranı ';
        if (span) el.appendChild(span);
      }
    },
    '#copyConsoleBtn': { title: 'Kopyala' },
    '#clearConsoleBtn': { title: 'Temizle' },
    '#toggleConsoleHeight': { title: 'Tam Ekran Yap / Küçült' },
    '#closeConsoleBtn': { title: 'Kapat' },

    '#serialWarningBanner': { textContent: 'Bağlı değil. Otomatik olarak bağlanacak bir kart ve bir port seçin.' },
    '#btnWebSerial': {
      fn: (el) => {
        el.innerHTML = '🌐 Web Serial Bağlan';
        el.title = 'Tarayıcı üzerinden doğrudan Android OTG veya masaüstü USB bağlantısı kurar';
      }
    },
    '#serialMessageInput': { placeholder: 'Mesaj göndermek için Enter\'a basın' },
    '#serialLineEnding option[value="nl"]': { textContent: 'Yeni Satır' },
    '#serialLineEnding option[value="none"]': { textContent: 'Satır Sonu Yok' },
    '#serialLineEnding option[value="cr"]': { textContent: 'Carriage Return' },
    '#serialLineEnding option[value="both"]': { textContent: 'Her İkisi (NL & CR)' },
    '#paneSerial label[for="chkAutoscroll"]': { textContent: 'Otomatik kaydır' },
    '#paneSerial label[for="chkTimestamp"]': { textContent: 'Zaman damgası göster' },

    '#cursorPosition': { textContent: 'Satır 1, Sütun 1' },
    '#progressMessage': { textContent: 'Eskiz derleniyor...' },
    '#btnCancelProgress': { textContent: 'İPTAL' },

    '[data-action="ctx-new-file"]': { textContent: '📄 Yeni Dosya' },
    '[data-action="ctx-new-folder"]': { textContent: '📁 Yeni Klasör' },
    '[data-action="ctx-rename"]': { textContent: '✏️ Yeniden Adlandır' },
    '[data-action="ctx-delete"]': { textContent: '🗑 Sil' },

    '#aiSettingsOverlay .ai-settings-header h3': { textContent: '✨ AI Asistan Ayarları' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(1) label': { textContent: 'API Anahtarı (Google AI Studio)' },
    '#aiSettingsOverlay .ai-setting-hint': {
      fn: (el) => {
        el.innerHTML = `<a href="https://aistudio.google.com/apikey" target="_blank" style="color:#00979d">Google AI Studio</a>'dan ücretsiz API key alabilirsiniz.`;
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(2) label': { textContent: 'Model' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) label': {
      fn: (el) => {
        const span = el.querySelector('#aiTempVal');
        el.textContent = 'Sıcaklık (Temperature): ';
        if (span) el.appendChild(span);
      }
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(3) .ai-setting-hint': {
      textContent: 'Düşük = tutarlı yanıtlar, Yüksek = yaratıcı yanıtlar'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(4) label': { textContent: 'Maksimum Token Sayısı' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(5) label': { textContent: 'Yanıt Dili' },
    '#aiLanguage option[value="tr"]': { textContent: 'Türkçe' },
    '#aiLanguage option[value="en"]': { textContent: 'English' },
    '#aiLanguage option[value="auto"]': { textContent: 'Otomatik' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) span': { textContent: 'Otomatik Yaz & Çalıştır (Auto Run)' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(6) .ai-setting-hint': {
      textContent: 'Etkinleştirildiğinde, AI ürettiği kodları doğrudan onay beklemeden skeçe yazar ve çalıştırır.'
    },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(7) label': { textContent: 'Sistem Promptu (Opsiyonel)' },
    '#aiSystemPrompt': { placeholder: 'Ek talimatlar... (ör: \'Her zaman kod açıklamaları ekle\')' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) label': { textContent: 'Geçmiş' },
    '#aiSettingsOverlay .ai-setting-group:nth-of-type(8) .ai-setting-hint': { textContent: 'Sohbet geçmişi tarayıcıda saklanır' },
    '#btnClearHistory': { textContent: 'Geçmişi Temizle' },
    '#aiSettingsCancel': { textContent: 'İptal' },
    '#aiSettingsSave': { textContent: 'Kaydet' }
};

window.appMessages.tr = {
    exit_confirm: "Uygulamadan çıkmak istediğinizden emin misiniz?",
    cloud_sketch_notice: "Not: Bulut eskiz özelliği yerel projede desteklenmez, yerel yeni eskiz oluşturuldu.",
    file_opened: "Dosya açıldı: {file}",
    close_sketch_confirm: "Eskizi kapatmak istediğinizden emin misiniz?",
    sketch_saved: "Eskiz kaydedildi.",
    modal_shortcuts_title: "Klavye Kısayolları",
    sc_new_sketch: "Yeni Eskiz",
    sc_open_file: "Dosya Aç",
    sc_save: "Kaydet",
    sc_save_as: "Farklı Kaydet",
    sc_undo: "Geri Al",
    sc_redo: "Yinele",
    sc_verify_compile: "Doğrula/Derle",
    sc_upload_board: "Karta Yükle",
    sc_auto_format: "Otomatik Biçimlendir",
    sc_find: "Bul",
    sc_go_to_line: "Satıra Git",
    sc_serial_monitor: "Seri Port Ekranı",
    sc_font_size: "Yazı Boyutu Büyüt/Küçült",
    btn_close: "Kapat",
    firmware_checking: "Firmware güncelleyici: Bağlı kartın firmware bilgisi kontrol ediliyor...",
    ssl_unsupported: "SSL sertifika yükleyicisi bu ortamda desteklenmiyor.",
    board_info_reloaded: "Kart bilgisi yeniden yüklendi.",
    about_clone_info: "Arduino IDE 2.3.11-nightly-20260629 Klonu",
    about_web_env: "Web tabanlı Arduino geliştirme ortamı",
    btn_ok: "Tamam",
    replace_code_confirm: "Mevcut kod bu örnekle değiştirilecek. Devam?",
    recent_searching: "Yakın geçmiş dosyası: {file} (yerel eskiz defterinde aranıyor...)",
    sketchbook_already_open: "Eskiz defteri: {file} zaten açık.",
    err_file_tree_failed: "Dosya ağacı yüklenemedi.",
    err_file_read_failed: "Dosya okunamadı: {err}",
    err_file_open_failed: "Dosya açılamadı: {err}",
    err_unknown: "Bilinmeyen hata",
    prompt_new_file: "Yeni dosya adı (uzantı dahil):",
    err_file_create_failed: "Dosya oluşturulamadı: {err}",
    err_generic: "Hata: {err}",
    prompt_new_folder: "Yeni klasör adı:",
    err_folder_create_failed: "Klasör oluşturulamadı: {err}",
    prompt_rename: "Yeni ad:",
    err_rename_failed: "Yeniden adlandırılamadı: {err}",
    confirm_delete: '"{name}" silinsin mi? Bu işlem geri alınamaz.',
    err_delete_failed: "Silinemedi: {err}",
};
