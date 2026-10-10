import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getClientLocale, getSavedClientLocale, normalizeLocale, setClientLocale } from '@/lib/locale-detector';

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'NEXT_LOCALE=;path=/;max-age=0';
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
});
afterEach(() => vi.restoreAllMocks());

describe('locale negotiation', () => {
  it.each([
    ['zh-TW', 'zh-TW'], ['ZH-tw', 'zh-TW'], ['zh_Hant_TW', 'zh-TW'],
    ['zh-Hant', 'zh-TW'], ['zh-HK', 'zh-TW'], ['zh-MO', 'zh-TW'],
    ['zh-Hans-TW', 'zh'], ['zh-CN', 'zh'], ['zh-SG', 'zh'],
    ['ja-JP', 'ja'], ['en-GB', 'en'], ['pl-PL', 'pl'], ['unsupported', null],
  ])('resolves %s to %s', (input, expected) => expect(normalizeLocale(input)).toBe(expected));

  it('tries all browser language preferences before falling back to English', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['xx-XX', 'zh-Hant-HK', 'ja-JP']);
    expect(getClientLocale()).toBe('zh-TW');
  });
  it('uses navigator.language when languages is empty', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP');
    expect(getClientLocale()).toBe('ja');
  });
  it('falls back to English for unsupported browser languages', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['xx-XX']);
    expect(getClientLocale()).toBe('en');
  });
  it('keeps an explicit selection above the browser locale and saves both legacy keys', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ja-JP']);
    setClientLocale('zh-TW');
    expect(getClientLocale()).toBe('zh-TW');
    expect(localStorage.getItem('pdfcraft-language-preference')).toBe('zh-TW');
    expect(localStorage.getItem('NEXT_LOCALE')).toBe('zh-TW');
    expect(document.cookie).toContain('NEXT_LOCALE=zh-TW');
  });
  it('migrates either existing preference format without changing another language', () => {
    localStorage.setItem('NEXT_LOCALE', 'pl-PL');
    expect(getSavedClientLocale()).toBe('pl');
    localStorage.setItem('pdfcraft-language-preference', 'ja');
    expect(getSavedClientLocale()).toBe('ja');
  });
  it('ignores invalid stored preferences and malformed cookies', () => {
    localStorage.setItem('pdfcraft-language-preference', 'no-such-language');
    document.cookie = 'NEXT_LOCALE=%bad;path=/';
    expect(getClientLocale()).toBe('en');
  });
  it('still navigates with blocked storage and can recover the cookie preference', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('blocked'); });
    expect(() => setClientLocale('ja')).not.toThrow();
    expect(getClientLocale()).toBe('ja');
  });
  it('works with cookies and storage both unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(document, 'cookie', 'set').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['zh-TW']);
    expect(setClientLocale('ja')).toBe('ja');
    expect(getClientLocale()).toBe('zh-TW');
  });
});
