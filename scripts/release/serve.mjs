import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.wasm': 'application/wasm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

function contentHeaders(file) {
  // Chunked gzip streams are reassembled by the browser. Each part must stay raw.
  if (/\.part_\d+$/.test(file)) return { 'Content-Type': 'application/octet-stream' };
  const gzip = /\.(?:wasm|data)(?:\.bin)?\.gz$/.test(file);
  const uncompressed = gzip ? file.slice(0, -3) : file;
  const type = /\.wasm(?:\.bin)?$/.test(uncompressed)
    ? 'application/wasm'
    : (mimeTypes[path.extname(uncompressed)] || 'application/octet-stream');
  return { 'Content-Type': type, ...(gzip ? { 'Content-Encoding': 'gzip' } : {}) };
}

function byteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  let start = Number(match[1]);
  let end = match[2] ? Number(match[2]) : size - 1;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null;
  return { start, end: Math.min(end, size - 1) };
}

/** Serve an already built export. No dependencies, uploads, or network listeners beyond loopback. */
export function createStaticServer(siteDirectory) {
  const root = fs.realpathSync(siteDirectory);
  const insideRoot = file => file === root || file.startsWith(root + path.sep);
  return http.createServer(async (request, response) => {
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Cache-Control', 'no-store');
    const end = (status, message) => {
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : message);
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      end(405, 'Method not allowed');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent((request.url || '/').split('?')[0]);
    } catch {
      end(400, 'Invalid URL');
      return;
    }
    if (!pathname.startsWith('/') || /[\\\0]/.test(pathname) || pathname.split('/').includes('..')) {
      end(403, 'Forbidden');
      return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (!insideRoot(file)) { end(403, 'Forbidden'); return; }
    try {
      let stat = await fs.promises.stat(file);
      if (stat.isDirectory()) {
        file = path.join(file, 'index.html');
        stat = await fs.promises.stat(file);
      }
      if (!stat.isFile()) { end(404, 'Not found'); return; }
      file = await fs.promises.realpath(file);
      if (!insideRoot(file)) { end(403, 'Forbidden'); return; }
      for (const [name, value] of Object.entries(contentHeaders(file))) response.setHeader(name, value);
      response.setHeader('Accept-Ranges', 'bytes');
      let range;
      if (request.headers.range) {
        range = byteRange(request.headers.range, stat.size);
        if (!range) {
          response.setHeader('Content-Range', `bytes */${stat.size}`);
          end(416, 'Range not satisfiable');
          return;
        }
        response.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${stat.size}`);
      }
      response.setHeader('Content-Length', range ? range.end - range.start + 1 : stat.size);
      response.writeHead(range ? 206 : 200);
      if (request.method === 'HEAD') { response.end(); return; }
      const stream = fs.createReadStream(file, range || undefined);
      stream.on('error', () => response.destroy());
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    } catch (error) {
      if (!response.headersSent) end(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500, 'File unavailable');
      else response.destroy();
    }
  });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  if (Number(process.versions.node.split('.')[0]) < 22) {
    console.error('PDFCraft requires Node.js 22 or newer.');
    process.exit(1);
  }
  const port = Number(process.env.PDFCRAFT_PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PDFCRAFT_PORT must be a port number from 1 to 65535.');
    process.exit(1);
  }
  const site = path.join(path.dirname(fileURLToPath(import.meta.url)), 'site');
  try {
    const server = createStaticServer(site);
    server.on('error', error => {
      console.error(error.code === 'EADDRINUSE' ? 'Port is busy. Choose another PDFCRAFT_PORT.' : 'Unable to start PDFCraft.');
      process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => console.log(`PDFCraft: http://127.0.0.1:${port}\nPress Ctrl+C to stop.`));
  } catch {
    console.error('Missing site directory. Extract the complete release ZIP before starting PDFCraft.');
    process.exitCode = 1;
  }
}
