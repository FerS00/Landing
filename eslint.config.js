import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'design-system/',
      'docs/',
      'playwright-report/',
      'test-results/',
      '.wrangler/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    files: ['*.config.js', '*.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
