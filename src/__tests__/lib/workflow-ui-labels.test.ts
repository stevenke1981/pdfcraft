import { describe, expect, it } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '../../../messages/en.json';
import ja from '../../../messages/ja.json';
import zhTW from '../../../messages/zh-TW.json';
import { getNodeSettingsSummary } from '@/lib/workflow-ui-labels';

const catalogs = { en, ja, 'zh-TW': zhTW };
describe.each(['en', 'ja', 'zh-TW'] as const)('workflow summaries in %s', locale => {
  const messages = catalogs[locale], translator = createTranslator({ locale, messages });
  const t = (key: string, values?: Record<string, string | number>) => translator(key as Parameters<typeof translator>[0], values);
  it('localizes default summaries and leaves filenames intact', () => {
    expect(getNodeSettingsSummary('rotate-pdf', undefined, t)).toBe(messages.workflowSummary.defaultRotation);
    expect(getNodeSettingsSummary('compress-pdf', undefined, t)).toBe(messages.workflowSummary.defaultCompression);
    expect(getNodeSettingsSummary('download-pdf', undefined, t)).toContain('output.pdf');
  });
  it('preserves user text and settings while formatting the display', () => {
    const settings = Object.freeze({ text: '<b>SYNTHETIC 原文</b>', watermarkType: 'text', repeat: true });
    const result = getNodeSettingsSummary('add-watermark', settings, t);
    expect(result).toContain(settings.text);
    expect(result).toBe(t('workflowSummary.tiledWatermark', { text: settings.text }));
    expect(settings.text).toBe('<b>SYNTHETIC 原文</b>');
    expect(getNodeSettingsSummary('table-of-contents', { pageSize: 'A4' }, t)).toBe(t('workflowSummary.toc', { title: 'Table of Contents' }));
  });
  it('keeps document template tokens literal and interpolates UI progress values', () => {
    expect(t('interfaceText.eGPagePageOfTotal')).toContain('{page}');
    expect(t('interfaceText.eGPagePageOfTotal')).toContain('{total}');
    const filename = '<b>SYNTHETIC.pdf</b>';
    expect(t('interfaceFeedback.renderingFile', { filename })).toContain(filename);
    expect(t('interfaceFeedback.processingPage', { page: 2, total: 7 })).toContain('7');
    expect(t('interfaceFeedback.positionBounds', { total: 42 })).toContain('42');
  });
});
