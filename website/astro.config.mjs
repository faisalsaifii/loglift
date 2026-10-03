// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static output so the site can be dropped onto any static host
// (GitHub Pages, Netlify, Cloudflare Pages, S3) with no server runtime.
export default defineConfig({
  // Every absolute URL the site emits comes from this one value: the canonical
  // link, og:url, og:image, twitter:image, the JSON-LD graph, the sitemap, and
  // the `Sitemap:` line in robots.txt.
  //
  // It must be the origin the site is actually served from. When it was pointed
  // at a different domain, every tag still rendered and the card was still
  // deployed — but link previews asked the wrong host for `og.png`, got a 404,
  // and silently fell back to the favicon. Change it only alongside a real
  // change of domain.
  site: 'https://loglift.faisalsaifi.com',
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