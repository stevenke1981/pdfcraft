import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import en from '../../../messages/en.json';
import ja from '../../../messages/ja.json';
import zhTW from '../../../messages/zh-TW.json';
import { auditTranslationCalls } from '../../../scripts/i18n-source-audit.mjs';

type Entry = { id: number | string; category: string; resolution: string; messageKey?: string };
const report = JSON.parse(readFileSync(join(process.cwd(), 'docs/i18n-hardcoded-classification.json'), 'utf8'));
const catalogs = { en, ja, 'zh-TW': zhTW };
const lookup = (messages: unknown, key: string): unknown => key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, messages);

describe('reviewed UI coverage', () => {
  it('keeps all original 414 candidates and explicitly retains the 76 technical constants', () => {
    const original: Entry[] = report.entries.filter((entry: Entry) => typeof entry.id === 'number');
    expect(original.map(entry => entry.id)).toEqual(Array.from({ length: 414 }, (_, index) => index + 1));
    expect(original.filter(entry => entry.category === 'owned-visible')).toHaveLength(338);
    expect(original.filter(entry => entry.category === 'technical')).toHaveLength(76);
    expect(original.every(entry => entry.resolution === (entry.category === 'technical' ? 'retained' : 'localized'))).toBe(true);
  });
  it.each(['en', 'ja', 'zh-TW'] as const)('resolves every reviewed UI entry and embedded attribute in %s', locale => {
    const entries: Entry[] = [...report.entries, ...report.additionalFeedbackEntries, ...report.dynamicFeedbackEntries, ...report.additionalProgressProps, ...report.embeddedEditor.entries];
    for (const entry of entries.filter(entry => entry.category === 'owned-visible')) {
      expect(entry.messageKey, JSON.stringify(entry)).toBeTruthy();
      expect(typeof lookup(catalogs[locale], entry.messageKey!), entry.messageKey).toBe('string');
    }
  });
  it('resolves literal translation calls in their actual component namespaces', () => {
    const calls = auditTranslationCalls(process.cwd(), en);
    expect(calls.staticCalls).toBeGreaterThan(3000);
    expect(calls.missing).toEqual([]);
  }, 30_000);
});
