import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import en from '../../../messages/en.json';
import ja from '../../../messages/ja.json';
import zhTW from '../../../messages/zh-TW.json';
import { resolveEditorLocale } from '../../../public/direct-pdf-editor/i18n.js';

const keys = JSON.parse(readFileSync(join(process.cwd(), 'public/direct-pdf-editor/translation-keys.json'), 'utf8'));
const catalogs = { en, ja, 'zh-TW': zhTW };
describe('embedded editor UI boundary', () => {
  it.each([['zh-TW', 'zh-TW'], ['zh-Hant', 'zh-TW'], ['ja-JP', 'ja'], ['en-US', 'en'], ['zh-CN', 'zh'], ['xx-YY', 'en']])('resolves %s as %s', (input, expected) => {
    expect(resolveEditorLocale(input)).toBe(expected);
  });
  it.each(['en', 'ja', 'zh-TW'] as const)('has catalog text for all marked HTML controls and controller labels in %s', locale => {
    const document = new DOMParser().parseFromString(readFileSync(join(process.cwd(), 'public/direct-pdf-editor/index.html'), 'utf8'), 'text/html');
    for (const attribute of ['data-i18n', 'data-i18n-title', 'data-i18n-placeholder']) {
      for (const element of document.querySelectorAll(`[${attribute}]`)) {
        const key = keys.attributes[element.getAttribute(attribute)!] as keyof typeof en.directEditor;
        expect(typeof catalogs[locale].directEditor[key], element.getAttribute(attribute)!).toBe('string');
      }
    }
    for (const key of Object.values(keys.main) as (keyof typeof en.directEditor)[]) expect(typeof catalogs[locale].directEditor[key]).toBe('string');
  });
});
