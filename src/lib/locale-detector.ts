import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';

export const LOCALE_STORAGE_KEY = 'NEXT_LOCALE';
export const LANGUAGE_PREFERENCE_KEY = 'pdfcraft-language-preference';

/** Resolve browser BCP 47 tags without losing Traditional Chinese script. */
export function normalizeLocale(input: string): Locale | null {
  const lower = input.trim().replace(/_/g, '-').toLowerCase();
  const exactMatch = locales.find((locale) => locale.toLowerCase() === lower);
  if (exactMatch) return exactMatch;
  const parts = lower.split('-');
  if (parts[0] === 'zh') {
    if (parts.includes('hant')) return 'zh-TW';
    if (parts.includes('hans')) return 'zh';
    return parts.some((part) => ['tw', 'hk', 'mo'].includes(part)) ? 'zh-TW' : 'zh';
  }
  return locales.find((locale) => locale.toLowerCase() === parts[0]) ?? null;
}

export function getSavedClientLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  for (const key of [LANGUAGE_PREFERENCE_KEY, LOCALE_STORAGE_KEY]) {
    try {
      const saved = window.localStorage.getItem(key);
      const locale = saved ? normalizeLocale(saved) : null;
      if (locale) return locale;
    } catch {
      // Storage can be blocked in private browsing or embedded viewers.
    }
  }
  try {
    const cookie = document.cookie.split(';').find((part) => part.trim().startsWith(`${LOCALE_STORAGE_KEY}=`));
    if (cookie) return normalizeLocale(decodeURIComponent(cookie.trim().slice(LOCALE_STORAGE_KEY.length + 1)));
  } catch {
    // A blocked or malformed cookie must not prevent navigation.
  }
  return null;
}

export function getClientLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const saved = getSavedClientLocale();
  if (saved) return saved;
  for (const language of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const locale = normalizeLocale(language);
    if (locale) return locale;
  }
  return defaultLocale;
}

export function setClientLocale(locale: string): Locale {
  const resolvedLocale = normalizeLocale(locale) ?? defaultLocale;
  if (typeof window === 'undefined') return resolvedLocale;
  for (const key of [LANGUAGE_PREFERENCE_KEY, LOCALE_STORAGE_KEY]) {
    try {
      window.localStorage.setItem(key, resolvedLocale);
    } catch {
      // Switching still works when persistence is unavailable.
    }
  }
  try {
    document.cookie = `${LOCALE_STORAGE_KEY}=${resolvedLocale};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    // Some embedded environments disable cookies as well as localStorage.
  }
  return resolvedLocale;
}
