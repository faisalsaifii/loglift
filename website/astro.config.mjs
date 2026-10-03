// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static output so the site can be dropped onto any static host
// (GitHub Pages, Netlify, Cloudflare Pages, S3) with no server runtime.
export default defineConfig({
  site: 'https://loglift.app',
  output: 'static',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    tsconfig: './tsconfig.json',
    plugins: [tailwindcss()],
  },
});