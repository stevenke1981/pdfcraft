import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../messages/en.json';
import ja from '../../../../messages/ja.json';
import zhTW from '../../../../messages/zh-TW.json';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { LocaleDocument } from '@/components/common/LocaleDocument';
import { type Locale, locales } from '@/lib/i18n/config';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/en/tools/merge-pdf/' }));
const catalogs = { en, ja, 'zh-TW': zhTW };
function show(locale: 'en' | 'ja' | 'zh-TW') {
  return render(<NextIntlClientProvider locale={locale} messages={catalogs[locale]}><LanguageSelector currentLocale={locale} /></NextIntlClientProvider>);
}
beforeEach(() => {
  push.mockClear();
  localStorage.clear();
  window.history.replaceState(null, '', '/en/tools/merge-pdf/?source=test#options');
});
describe('language selector', () => {
  it.each(['en', 'ja', 'zh-TW'] as const)('provides a localized accessible control in %s', (locale) => {
    show(locale);
    const button = screen.getByRole('button', { name: catalogs[locale].common.buttons.selectLanguage });
    fireEvent.click(button);
    expect(screen.getAllByRole('option')).toHaveLength(locales.length);
    expect(screen.getByRole('option', { name: /繁體中文/ })).toHaveAttribute('lang', 'zh-TW');
  });
  it('saves the selection and keeps the current tool, query and fragment', () => {
    show('en');
    fireEvent.click(screen.getByRole('button', { name: en.common.buttons.selectLanguage }));
    fireEvent.click(screen.getByRole('option', { name: /日本語/ }));
    expect(push).toHaveBeenCalledWith('/ja/tools/merge-pdf/?source=test#options');
    expect(localStorage.getItem('NEXT_LOCALE')).toBe('ja');
    expect(localStorage.getItem('pdfcraft-language-preference')).toBe('ja');
  });
  it('supports keyboard navigation and restores trigger focus on Escape', () => {
    show('en');
    const trigger = screen.getByRole('button', { name: en.common.buttons.selectLanguage });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0], { key: 'ArrowDown' });
    expect(options[1]).toHaveFocus();
    fireEvent.keyDown(options[1], { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('updates document language and direction after locale navigation', () => {
    const result = render(<LocaleDocument locale={'zh-TW' as Locale} />);
    expect(document.documentElement.lang).toBe('zh-TW');
    result.rerender(<LocaleDocument locale="ja" />);
    expect(document.documentElement.lang).toBe('ja');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
