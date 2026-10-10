import { catalogs, keys } from './translations.js';

export function resolveEditorLocale(value) {
  const normalized = (value || '').replaceAll('_', '-').toLowerCase();
  if (/^zh-(?:tw|hk|mo|hant)(?:-|$)/.test(normalized) || /^zh-.*-hant(?:-|$)/.test(normalized)) return 'zh-TW';
  return Object.keys(catalogs).find(locale => locale.toLowerCase() === normalized) ||
    Object.keys(catalogs).find(locale => locale === normalized.split('-')[0]) || 'en';
}

export const editorLocale = resolveEditorLocale(new URLSearchParams(window.location.search).get('lang') || navigator.language);
const catalog = catalogs[editorLocale] || catalogs.en;
export const editorMessages = {
  main: Object.fromEntries(Object.entries(keys.main).map(([name, key]) => [name, catalog[key] || catalogs.en[key]])),
};

export function translateEditorText(text) {
  const key = keys.byEnglish[text];
  return key ? (catalog[key] || catalogs.en[key]) : text;
}

export function localizeEditorUI(document) {
  document.documentElement.lang = editorLocale;
  document.documentElement.dir = editorLocale === 'ar' ? 'rtl' : 'ltr';
  for (const [attribute, target] of [['data-i18n', 'text'], ['data-i18n-title', 'title'], ['data-i18n-placeholder', 'placeholder']]) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      const key = keys.attributes[element.getAttribute(attribute)], value = catalog[key] || catalogs.en[key];
      if (value === undefined) continue;
      // UI labels are plain text. PDF content, input values and HTML are never translated.
      if (target === 'text') element.textContent = value;
      else {
        element.setAttribute(target, value);
        if (target === 'title' && element.matches('button, label, select, input')) element.setAttribute('aria-label', value);
      }
    }
  }
}
