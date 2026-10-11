import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { createStaticServer } from './serve.mjs';

let temp, server, port;
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path: url, ...options }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}
before(async () => {
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'pdfcraft-launcher-'));
  await fs.mkdir(path.join(temp, 'site', 'ja'), { recursive: true });
  await fs.writeFile(path.join(temp, 'site', 'ja', 'index.html'), '<h1>日本語</h1>');
  await fs.writeFile(path.join(temp, 'secret'), 'outside site');
  await fs.writeFile(path.join(temp, 'site', 'engine.wasm.bin'), '0123456789');
  await fs.writeFile(path.join(temp, 'site', 'engine.wasm.bin.gz'), gzipSync('0123456789'));
  await fs.writeFile(path.join(temp, 'site', 'engine.wasm.bin.gz.part_0'), gzipSync('0123456789'));
  await fs.writeFile(path.join(temp, 'site', 'font.ttf'), 'font');
  await fs.writeFile(path.join(temp, 'site', 'worker.mjs'), 'export default 1;');
  // Junction creation needs no symbolic-link privilege on Windows.
  await fs.symlink(temp, path.join(temp, 'site', 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  server = createStaticServer(path.join(temp, 'site'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (temp) await fs.rm(temp, { recursive: true, force: true });
});
test('serves localized directories and isolation headers, and HEAD has no body', async () => {
  const html = await request('/ja/?lang=ja');
  assert.equal(html.status, 200);
  assert.match(html.body.toString(), /日本語/);
  assert.equal(html.headers['cross-origin-opener-policy'], 'same-origin');
  assert.equal(html.headers['cross-origin-embedder-policy'], 'require-corp');
  assert.equal(html.headers['x-content-type-options'], 'nosniff');
  const head = await request('/ja/', { method: 'HEAD' });
  assert.equal(head.body.length, 0);
  assert.equal(Number(head.headers['content-length']), html.body.length);
});
test('uses WASM, font, worker and full gzip MIME without decompressing chunk pieces', async () => {
  assert.equal((await request('/engine.wasm.bin')).headers['content-type'], 'application/wasm');
  const compressed = await request('/engine.wasm.bin.gz');
  assert.equal(compressed.headers['content-type'], 'application/wasm');
  assert.equal(compressed.headers['content-encoding'], 'gzip');
  const chunk = await request('/engine.wasm.bin.gz.part_0');
  assert.equal(chunk.headers['content-encoding'], undefined);
  assert.equal(chunk.headers['content-type'], 'application/octet-stream');
  assert.equal((await request('/font.ttf')).headers['content-type'], 'font/ttf');
  assert.match((await request('/worker.mjs')).headers['content-type'], /javascript/);
});
test('supports bounded and suffix ranges, rejects invalid or multiple ranges', async () => {
  const partial = await request('/engine.wasm.bin', { headers: { range: 'bytes=2-4' } });
  assert.equal(partial.status, 206);
  assert.equal(partial.body.toString(), '234');
  assert.equal(partial.headers['content-range'], 'bytes 2-4/10');
  assert.equal((await request('/engine.wasm.bin', { headers: { range: 'bytes=-2' } })).body.toString(), '89');
  for (const range of ['bytes=10-', 'bytes=4-2', 'bytes=0-1,4-5', 'bytes=-0', 'bytes=9007199254740993-']) {
    assert.equal((await request('/engine.wasm.bin', { headers: { range } })).status, 416);
  }
});
test('rejects traversal, malformed URLs, symlink escapes, uploads and absent files', async () => {
  for (const url of ['/../secret', '/%2e%2e/secret', '/%5c..%5csecret', '/%00', '/escape/secret']) {
    assert.equal((await request(url)).status, 403, url);
  }
  assert.equal((await request('/%ZZ')).status, 400);
  assert.equal((await request('/absent')).status, 404);
  assert.equal((await request('/ja/', { method: 'POST' })).status, 405);
});
