import { test, expect } from '@playwright/test';

test('extracted Web release serves engines, worker and fonts with correct headers', async ({ request, page }) => {
  const assets: [string, string][] = [
    ['/qpdf.wasm', 'application/wasm'],
    ['/pymupdf-wasm/pyodide.asm.wasm', 'application/wasm'],
    ['/direct-pdf-editor/editcore.wasm', 'application/wasm'],
    ['/workers/pdf.worker.min.mjs', 'javascript'],
    ['/fonts/NotoSansSC-Regular.ttf', 'font/ttf'],
  ];
  for (const [url, mime] of assets) {
    const response = await request.head(url);
    expect(response.status(), url).toBe(200);
    expect(response.headers()['content-type'], url).toContain(mime);
    expect(Number(response.headers()['content-length']), url).toBeGreaterThan(0);
  }
  const manifest = await request.get('/libreoffice-wasm/soffice.wasm.bin.gz.manifest.json');
  expect(manifest.ok()).toBe(true);
  const chunks = await manifest.json();
  expect(chunks.filename).toBe('soffice.wasm.bin.gz');
  for (let index = 0; index < chunks.chunks; index++) {
    const chunk = await request.head(`/libreoffice-wasm/soffice.wasm.bin.gz.part_${index}`);
    expect(chunk.status()).toBe(200);
    expect(chunk.headers()['content-type']).toBe('application/octet-stream');
    expect(chunk.headers()['content-encoding']).toBeUndefined();
  }
  const range = await request.get('/qpdf.wasm', { headers: { Range: 'bytes=0-7' } });
  expect(range.status()).toBe(206);
  expect((await range.body()).subarray(0, 4).toString('hex')).toBe('0061736d');
  await page.goto('/zh-TW/');
  expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
});
