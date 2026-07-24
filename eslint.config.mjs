import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    languageOptions: {
      globals: globals.node,
    },
  },
);
