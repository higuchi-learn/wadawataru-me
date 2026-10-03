// @ts-check
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig(
  {
    // .open-next / .wrangler は OpenNext・wrangler が生成するビルド成果物。人が書いたコードではないので対象外にする
    ignores: ['eslint.config.mjs', '.next/**', 'dist/**', '.open-next/**', '.wrangler/**'],
  },
  eslint.configs.recommended,
  ...tslint.configs.recommendedTypeChecked,
  ...compat.extends('next/core-web-vitals'),
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      // next/image の <Image> は画像を変換・縮小して配信する仕組み。このサイト（OpenNext on Cloudflare）では
      // wrangler.jsonc の IMAGES バインディングを通じて Cloudflare Images が変換を担当する
      // ただし変換回数に応じて Cloudflare Images の料金が発生しうるうえ、このサイトの画像は
      // アップロード済みの PNG・ロゴの SVG などが中心で、変換による効果が小さい
      // そのため意図的に素の <img> を使っており、このルールは無効にする
      // （表示速度が問題になったら、<Image> と料金を比較して見直す）
      '@next/next/no-img-element': 'off',
    },
  },
);
