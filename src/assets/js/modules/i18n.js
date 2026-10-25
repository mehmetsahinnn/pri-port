import { translations } from './translations.js';
import { getItem, setItem } from './storage.js';

const DEFAULT_LANG = 'en';
const LANG_KEY = 'selected-lang';
const OG_LOCALE = { en: 'en_US', tr: 'tr_TR' };

let currentLang = translations[getItem(LANG_KEY)] ? getItem(LANG_KEY) : DEFAULT_LANG;

export function t(key) {
    return translations[currentLang]?.[key] ?? translations[DEFAULT_LANG][key] ?? key;
}

function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', value);
}

// Applies the current language to every marked element.
//   data-i18n="key"                      -> innerHTML (dictionary is trusted, first-party)
//   data-i18n-attr="alt:key;placeholder:key2" -> attributes
export function applyLang() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.innerHTML = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        el.dataset.i18nAttr.split(';').forEach((pair) => {
            const [attr, key] = pair.split(':').map((s) => s.trim());
            if (attr && key) el.setAttribute(attr, t(key));
        });
    });

    document.title = t('meta_title');
    setMeta('meta[name="description"]', t('meta_desc'));
    setMeta('meta[property="og:title"]', t('meta_title'));
    setMeta('meta[property="og:description"]', t('og_desc'));
    setMeta('meta[property="og:locale"]', OG_LOCALE[currentLang]);
    setMeta('meta[name="twitter:title"]', t('meta_title'));
    setMeta('meta[name="twitter:description"]', t('og_desc'));

    const button = document.getElementById('lang-button');
    if (button) button.textContent = currentLang.toUpperCase();
}

export function initI18n() {
    applyLang();

    const button = document.getElementById('lang-button');
    if (!button) return;
    button.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'tr' : 'en';
        setItem(LANG_KEY, currentLang);
        applyLang();
    });
}
