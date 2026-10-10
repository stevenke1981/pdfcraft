import { test, expect, type Page } from '@playwright/test';
import { PDFDocument, PDFName, PDFString, StandardFonts, PDFRawStream, PDFArray, decodePDFRawStream } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';
import en from '../messages/en.json' with { type: 'json' };
import ja from '../messages/ja.json' with { type: 'json' };
import zhTW from '../messages/zh-TW.json' with { type: 'json' };

const catalogs = { en, ja, 'zh-TW': zhTW };
const evidenceDirectory = path.resolve(process.env.PDFCRAFT_EVIDENCE_DIR || 'test-results/evidence');
const fixtureDirectory = path.resolve('test-results/synthetic');

async function assertFits(page: Page) {
  const horizontal = await page.evaluate(() => ({
    fits: document.documentElement.scrollWidth <= window.innerWidth + 1,
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    overflowing: [...document.querySelectorAll('main div, main canvas')].filter(element => element.getBoundingClientRect().right > window.innerWidth + 1)
      .map(element => ({ tag: element.tagName, className: element.className, width: element.getBoundingClientRect().width })).slice(-12),
  }));
  expect(horizontal.fits, JSON.stringify(horizontal)).toBe(true);
  const clipped = await page.locator('h1, h2, button:not([role="option"]), label').evaluateAll(elements => elements.filter(element => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return bounds.width > 0 && bounds.height > 0 && style.whiteSpace === 'nowrap' && element.scrollWidth > element.clientWidth + 2;
  }).map(element => element.textContent));
  expect(clipped).toEqual([]);
}

async function screenshot(page: Page, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await assertFits(page);
  await page.screenshot({ path: path.join(evidenceDirectory, name + '.png'), fullPage: true, animations: 'disabled' });
  if (name.endsWith('-home') || name.endsWith('-ocr')) {
    await page.screenshot({ path: path.join(evidenceDirectory, name + '-viewport.png'), animations: 'disabled' });
  }
  if (name.endsWith('-controls')) {
    await page.evaluate(() => {
      const tool = document.querySelector('[data-testid="tool-page-interface"]');
      if (tool) window.scrollTo(0, window.scrollY + tool.getBoundingClientRect().top - 90);
    });
    // Scroll events update the translucent fixed banner on the next render.
    // Capture its settled state instead of a transparent intermediate frame.
    await page.waitForFunction(() => {
      const banner = document.querySelector('[role="banner"]');
      return !banner || banner.classList.contains('backdrop-blur-md') === (window.scrollY > 10);
    });
    await page.screenshot({ path: path.join(evidenceDirectory, name + '-viewport.png'), animations: 'disabled' });
  }
}

async function verifyOutput(file: string, pages: number, expectedMarkers: string[]) {
  const pdf = await PDFDocument.load(fs.readFileSync(file));
  expect(pdf.getPageCount()).toBe(pages);
  // Decode the output's content streams to verify original text survives.
  const text = pdf.getPages().flatMap(page => {
    const contents = page.node.Contents();
    const streams = contents instanceof PDFArray ? contents.asArray().map(ref => pdf.context.lookup(ref)) : [contents];
    return streams.filter((stream): stream is PDFRawStream => stream instanceof PDFRawStream).map(stream => Buffer.from(decodePDFRawStream(stream).decode()).toString());
  }).join('\n');
  for (const marker of expectedMarkers) {
    // PDF writers may preserve hex strings or serialize them as literal strings.
    expect(text.includes(marker) || text.includes(Buffer.from(marker).toString('hex').toUpperCase()), marker).toBe(true);
  }
}

test.beforeAll(async () => {
  fs.mkdirSync(evidenceDirectory, { recursive: true });
  fs.mkdirSync(fixtureDirectory, { recursive: true });
  for (const name of ['A', 'B']) {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    for (let page = 1; page <= 2; page++) {
      pdf.addPage([595, 842]).drawText(`SYNTHETIC_${name}${page} Original document content`, { x: 50, y: 700, font, size: 20 });
    }
    pdf.setTitle(`Synthetic fixture ${name}`);
    fs.writeFileSync(path.join(fixtureDirectory, `${name}.pdf`), await pdf.save());
  }
  const layered = await PDFDocument.load(fs.readFileSync(path.join(fixtureDirectory, 'A.pdf')));
  const layer = layered.context.register(layered.context.obj({ Type: 'OCG', Name: PDFString.of('ReviewLayer') }));
  layered.catalog.set(PDFName.of('OCProperties'), layered.context.obj({ OCGs: [layer], D: { Order: [layer], ON: [layer] } }));
  fs.writeFileSync(path.join(fixtureDirectory, 'Layered.pdf'), await layered.save());
});

test.beforeEach(async ({ context }) => {
  // Only this isolated browser is used, and documents may not leave loopback.
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === 'http://127.0.0.1:4173' ? route.continue() : route.abort();
  });
});

for (const locale of ['en', 'zh-TW', 'ja'] as const) {
  const messages = catalogs[locale];
  test(`${locale}: desktop/mobile home, category, tool and empty/error states`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      const device = viewport.width < 600 ? 'mobile' : 'desktop';
      const response = await page.goto(`/${locale}/`);
      expect(await response!.text()).toContain(`<html lang="${locale}"`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await screenshot(page, `${locale}-${device}-home`);
      const languageButton = page.getByRole('button', { name: messages.common.buttons.selectLanguage });
      const bounds = await languageButton.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
      await languageButton.click();
      await expect(page.getByRole('option')).toHaveCount(15);
      await expect(page.getByRole('option', { name: /繁體中文/ })).toBeVisible();
      await expect(page.getByRole('listbox')).toBeInViewport();
      await page.keyboard.press('Escape');
      await expect(languageButton).toBeFocused();
      await page.goto(`/${locale}/tools/category/organize-manage/`);
      await expect(page.getByRole('navigation', { name: messages.common.accessibility.breadcrumb })).toBeVisible();
      await screenshot(page, `${locale}-${device}-category`);
      await page.goto(`/${locale}/tools/?q=zzzzqxvvv884`);
      await expect(page.getByText(messages.toolsPage.noToolsFound, { exact: true })).toBeVisible();
      await screenshot(page, `${locale}-${device}-empty`);
      await page.goto(`/${locale}/tools/merge-pdf/`);
      await screenshot(page, `${locale}-${device}-merge`);
      await page.locator('input[type=file]').setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('synthetic invalid file') });
      await expect(page.getByTestId('tool-page-interface').getByRole('alert')).toContainText(messages.errors.fileTypeInvalid.split('{')[0]);
      await screenshot(page, `${locale}-${device}-error`);
      // Includes long Japanese descriptions and newly localized editor modes.
      await page.goto(`/${locale}/tools/ocr-pdf/`);
      await screenshot(page, `${locale}-${device}-ocr`);
      await page.goto(`/${locale}/tools/edit-pdf/`);
      await expect(page.getByRole('button', { name: new RegExp(messages.tools.editPdf.directMode) })).toBeVisible();
      await screenshot(page, `${locale}-${device}-edit`);
    }
    expect(consoleErrors.filter(message => /MISSING_MESSAGE|INVALID_MESSAGE|FORMATTING_ERROR/.test(message))).toEqual([]);
  });

  test(`${locale}: merge, split and compress synthetic PDFs locally without changing text`, async ({ page }) => {
    const uploads: string[] = [];
    page.on('request', request => { if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url()); });
    await page.goto(`/${locale}/tools/merge-pdf/`);
    await page.locator('input[type=file]').setInputFiles([path.join(fixtureDirectory, 'A.pdf'), path.join(fixtureDirectory, 'B.pdf')]);
    await page.getByRole('button', { name: messages.tools.mergePdf.mergeButton, exact: true }).click();
    await expect(page.getByText(messages.tools.mergePdf.successMessage, { exact: true })).toBeVisible();
    await screenshot(page, `${locale}-desktop-merge-result`);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: new RegExp(messages.common.buttons.download) }).click();
    const download = await downloadPromise;
    const output = path.join(fixtureDirectory, `${locale}-merged.pdf`);
    await download.saveAs(output);
    await verifyOutput(output, 4, ['SYNTHETIC_A1', 'SYNTHETIC_A2', 'SYNTHETIC_B1', 'SYNTHETIC_B2']);
    await page.goto(`/${locale}/tools/split-pdf/`);
    await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'A.pdf'));
    const range = page.getByLabel(messages.tools.splitPdf.rangeInputLabel, { exact: true });
    await range.fill('1');
    await page.getByRole('button', { name: messages.tools.splitPdf.splitButton, exact: true }).click();
    await expect(page.getByText(messages.tools.splitPdf.successMessage, { exact: true })).toBeVisible();
    await screenshot(page, `${locale}-desktop-split-result`);
    const splitPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: new RegExp(messages.common.buttons.download) }).first().click();
    const split = await splitPromise;
    const splitOutput = path.join(fixtureDirectory, `${locale}-split.pdf`);
    await split.saveAs(splitOutput);
    await verifyOutput(splitOutput, 1, ['SYNTHETIC_A1']);
    await page.goto(`/${locale}/tools/compress-pdf/`);
    await page.locator('input[type=file]').setInputFiles([path.join(fixtureDirectory, 'A.pdf'), path.join(fixtureDirectory, 'B.pdf')]);
    await page.getByRole('button', { name: messages.common.compress.standardAlgorithm, exact: true }).click();
    await page.getByRole('button', { name: messages.tools.compressPdf.compressButton, exact: true }).click();
    const compressedDownloads = page.getByRole('button', { name: new RegExp(messages.common.buttons.download) }).filter({ hasNotText: 'ZIP' });
    await expect(compressedDownloads).toHaveCount(2);
    await screenshot(page, `${locale}-desktop-compress-result`);
    const compressedPromise = page.waitForEvent('download');
    await compressedDownloads.first().click();
    const compressed = await compressedPromise;
    const compressedOutput = path.join(fixtureDirectory, `${locale}-compressed.pdf`);
    await compressed.saveAs(compressedOutput);
    await verifyOutput(compressedOutput, 2, ['SYNTHETIC_A1', 'SYNTHETIC_A2']);

    // Single-file comparison uses localized quality names and accessible controls.
    await page.goto(`/${locale}/tools/compress-pdf/`);
    await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'A.pdf'));
    await expect(page.getByRole('img', { name: messages.common.compress.originalPreview, exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: messages.common.compress.compressedPreview, exact: true })).toBeVisible();
    await expect(page.getByText(messages.common.compress.qualityCompare.replace('{quality}', messages.common.compress.qualityMedium), { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: messages.common.buttons.remove, exact: true })).toBeVisible();
    await screenshot(page, `${locale}-desktop-compress-preview`);
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot(page, `${locale}-mobile-compress-preview`);
    expect(uploads).toEqual([]);
  });

  test(`${locale}: owned tool controls, literal document templates and embedded editor`, async ({ page }) => {
    test.setTimeout(90_000);
    const consoleErrors: string[] = [], uploads: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('request', request => { if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url()); });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      const device = viewport.width < 600 ? 'mobile' : 'desktop';
      await page.goto(`/${locale}/tools/header-footer/`);
      await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'A.pdf'));
      await expect(page.getByPlaceholder(messages.interfaceText.eGCompanyName)).toBeVisible();
      await expect(page.locator('input[value="Page {page} of {total}"]')).toBeVisible();
      // Braces are displayed literally in hints; existing document defaults are not localized.
      const hint = messages.interfaceText.eGPagePageOfTotal.replaceAll("'{", '{').replaceAll("}'", '}');
      await expect(page.getByPlaceholder(hint)).toBeVisible();
      await expect(page.getByText(messages.interfaceText.left, { exact: true })).toHaveCount(2);
      await screenshot(page, `${locale}-${device}-header-footer-controls`);
      if (device === 'desktop') {
        await page.getByRole('button', { name: messages.tools.headerFooter.addButton, exact: true }).click();
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: new RegExp(messages.common.buttons.download) }).click();
        const download = await downloadPromise, output = path.join(fixtureDirectory, `${locale}-header-footer.pdf`);
        await download.saveAs(output);
        await verifyOutput(output, 2, ['SYNTHETIC_A1', 'SYNTHETIC_A2', 'Page 1 of 2']);
      }
      await page.goto(`/${locale}/tools/ocg-manager/`);
      await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'Layered.pdf'));
      await expect(page.getByText('ReviewLayer', { exact: true })).toBeVisible();
      await expect(page.getByTitle(messages.interfaceText.renameLayer)).toBeVisible();
      await screenshot(page, `${locale}-${device}-ocg-controls`);
      const dialogPromise = page.waitForEvent('dialog');
      const clickPromise = page.getByTitle(messages.interfaceText.deleteLayer).click();
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe(messages.interfaceFeedback.areYouSureYouWantToDeleteThisLayer);
      await dialog.dismiss();
      await clickPromise;
      await page.goto(`/${locale}/tools/background-color/`);
      await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'A.pdf'));
      await expect(page.getByLabel(messages.interfaceText.backgroundHex)).toHaveValue('#fffde7');
      await expect(page.getByRole('button', { name: messages.interfaceText.addBackground, exact: true })).toBeVisible();
      await screenshot(page, `${locale}-${device}-background-controls`);
      await page.goto(`/${locale}/tools/redact-pdf/`);
      await page.locator('input[type=file]').setInputFiles(path.join(fixtureDirectory, 'A.pdf'));
      await expect(page.getByText(messages.interfaceText.securityAndPrivacyOptions, { exact: true })).toBeVisible();
      await screenshot(page, `${locale}-${device}-redact-controls`);
      await page.goto(`/direct-pdf-editor/index.html?lang=${locale}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('#editLabel')).toHaveText(messages.directEditor.editAll);
      await expect(page.locator('#save')).toHaveAttribute('aria-label', messages.directEditor.exportS);
      await expect(page.locator('#empty .hint')).toHaveText(messages.directEditor.localPrivacy);
      await expect(page.locator('label').filter({ has: page.locator('#spellchk') })).toHaveText(messages.directEditor.spellingLabel);
      await expect(page.locator('label').filter({ has: page.locator('#caseSens') })).toHaveText(messages.directEditor.matchCaseLabel);
      await expect(page.locator('label').filter({ has: page.locator('#fLine') })).toHaveText(messages.directEditor.lineSpacingLabel);
      await screenshot(page, `${locale}-${device}-direct-editor-controls`);
    }
    expect(consoleErrors.filter(message => /MISSING_MESSAGE|INVALID_MESSAGE|FORMATTING_ERROR/.test(message))).toEqual([]);
    expect(uploads).toEqual([]);
  });
}

test('language switch remembers selection, retains route/query/hash and honors explicit URLs', async ({ page }) => {
  await page.goto('/en/tools/merge-pdf/?source=synthetic#options');
  await page.getByRole('button', { name: en.common.buttons.selectLanguage }).click();
  await page.getByRole('option', { name: /繁體中文/ }).click();
  await expect(page).toHaveURL(/\/zh-TW\/tools\/merge-pdf\/?\?source=synthetic#options$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page).toHaveURL(/\/zh-TW\/?$/);
  await page.getByRole('button', { name: zhTW.common.buttons.selectLanguage }).click();
  await page.getByRole('option', { name: /日本語/ }).click();
  await expect(page).toHaveURL(/\/ja\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page).toHaveURL(/\/ja\/?$/);
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

for (const [browserLocale, expected] of [['zh-TW', 'zh-TW'], ['zh-HK', 'zh-TW'], ['ja-JP', 'ja'], ['xx-XX', 'en']]) {
  test(`first visit negotiates ${browserLocale} as ${expected}`, async ({ browser }) => {
    const context = await browser.newContext({ locale: browserLocale });
    await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:4173' ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'commit' });
    await expect(page).toHaveURL(new RegExp(`/${expected}/?$`));
    await context.close();
  });
}
