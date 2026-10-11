import { defineConfig } from '@playwright/test';
import path from 'node:path';

const extracted = process.env.PDFCRAFT_RELEASE_DIRECTORY;
if (!extracted) throw new Error('PDFCRAFT_RELEASE_DIRECTORY must identify a freshly extracted release ZIP.');

export default defineConfig({
  testDir: './e2e',
  testMatch: ['localization.spec.ts', 'release-assets.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/release-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', headless: true,
    screenshot: 'only-on-failure', trace: 'retain-on-failure', serviceWorkers: 'block',
  },
  webServer: {
    command: 'node serve.mjs', cwd: path.resolve(extracted),
    url: 'http://127.0.0.1:4173', reuseExistingServer: false,
  },
});
