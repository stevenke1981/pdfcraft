import path from 'node:path';
import { createStaticServer } from './release/serve.mjs';

// Test-only static server for the production export, bound to loopback.
const root = path.resolve('out');
const port = Number(process.env.PDFCRAFT_TEST_PORT || 4173);
// CI exercises the same headers, path validation and range behavior as the release launcher.
createStaticServer(root).listen(port, '127.0.0.1', () => console.log(`PDFCraft test export: http://127.0.0.1:${port}`));
