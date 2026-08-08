// Map language codes to native language names
const languageNames = {
  en: 'English',
  tr: 'Türkçe',
  ar: 'العربية',
  fr: 'Français'
};

window.translations = window.translations || {};
window.appMessages = window.appMessages || {};

// Application function
function loadLocaleScript(lang, callback) {
  const existingScript = document.getElementById('locale-script');
  if (existingScript) {
    existingScript.remove();
  }
  const script = document.createElement('script');
  script.id = 'locale-script';

  script.onload = () => {
    if (callback) callback();
  };

  script.onerror = () => {
    console.error(`Failed to load locale file: locales/${lang}.js`);
  };
  script.src = `locales/${lang}.js`;
  document.head.appendChild(script);
}

function applyTranslation(lang = 'en') {
  loadLocaleScript(lang, () => {
    const dict = window.translations && window.translations[lang];
    if (!dict) return;

    Object.entries(dict).forEach(([selector, config]) => {
      document.querySelectorAll(selector).forEach((el) => {
        for (var prop in config) {
          if (prop === 'fn' && typeof config.fn === 'function') {
            config.fn(el);
          } else {
            el[prop] = config[prop];
          }
        }
      });
    });

    localStorage.setItem('preferred_language', lang);
  });
}
// Dynamically creates the Language selector menu inside <nav class="menu-bar">
function setupLanguageMenu() {
  const menuBar = document.querySelector('nav.menu-bar');
  if (!menuBar || document.getElementById('menuLanguageContainer')) return;

  const currentLang = localStorage.getItem('preferred_language') || 'en';
  // Build options directly from static languageNames keys
  const availableLangs = Object.keys(languageNames);

  // Parent menu item container
  const langMenuItem = document.createElement('div');
  langMenuItem.className = 'menu-item';
  langMenuItem.id = 'menuLanguageContainer';
  langMenuItem.style.display = 'inline-flex';
  langMenuItem.style.alignItems = 'center';
  langMenuItem.style.gap = '6px';

  // Language Icon (🌐 Globe SVG)
  const globeIcon = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>`;

  // Language Select dropdown
  const selectEl = document.createElement('select');
  selectEl.id = 'languageNavSelect';
  selectEl.style.cssText = `
    background: transparent;
    color: inherit;
    border: none;
    font-size: inherit;
    font-family: inherit;
    outline: none;
    cursor: pointer;
    padding: 2px 4px;
  `;

  availableLangs.forEach((code) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = languageNames[code];
    option.style.background = '#1e1e1e';
    option.style.color = '#fff';
    if (code === currentLang) option.selected = true;
    selectEl.appendChild(option);
  });

  selectEl.addEventListener('change', (e) => {
    applyTranslation(e.target.value);
  });

  langMenuItem.innerHTML = globeIcon;
  langMenuItem.appendChild(selectEl);
  menuBar.appendChild(langMenuItem);
}


function getPreferredLanguage() {
  // 1. Check saved choice in localStorage
  const savedLang = localStorage.getItem('preferred_language');
  if (savedLang && languageNames[savedLang]) {
    return savedLang;
  }

  // 2. Check system/browser preferred languages array (e.g. ['fr-FR', 'fr', 'en-US'])
  const userLangs = navigator.languages || [navigator.language || navigator.userLanguage];
  
  for (let fullCode of userLangs) {
    if (!fullCode) continue;
    const baseCode = fullCode.split('-')[0].toLowerCase();
    if (languageNames[baseCode]) {
      return baseCode;
    }
  }

  // 3. Fallback to English
  return 'en';
}

// DomContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
  const lang = getPreferredLanguage();
  
  setupLanguageMenu();
  applyTranslation(lang);
});

function getMsg(key) {
  const lang = localStorage.getItem('preferred_language') //|| 'en';
  return (appMessages[lang] && appMessages[lang][key]) || null;
}
