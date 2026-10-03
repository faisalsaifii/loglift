// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static output so the site can be dropped onto any static host
// (GitHub Pages, Netlify, Cloudflare Pages, S3) with no server runtime.
export default defineConfig({
  site: 'https://loglift.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    // Emits `sitemap-index.xml` + `sitemap-0.xml` from the built routes, keyed off
    // `site` above. Every optional namespace is switched off: the site is
    // single-language (`xhtml`), publishes no news or video (`news`, `video`), and
    // has no per-page image sitemap entries to declare (`image`). Leaving them on
    // would only ship empty xmlns attributes for crawlers to skip past.
    sitemap({ namespaces: { news: false, xhtml: false, image: false, video: false } }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    tsconfig: './tsconfig.json',
    plugins: [tailwindcss()],
  },
});