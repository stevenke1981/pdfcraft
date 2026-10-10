import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) });

export default [
  { ignores: ['node_modules/**', '.next/**', 'out/**', 'public/**', 'scratch/**', 'test-results/**', 'playwright-report/**', 'src-tauri/target/**'] },
  ...compat.extends('next/core-web-vitals'),
  // Existing source uses TypeScript rule directives; register their plugin.
  { plugins: { '@typescript-eslint': typescriptPlugin } },
];
