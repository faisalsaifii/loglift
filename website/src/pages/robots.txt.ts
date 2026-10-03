import type { APIRoute } from 'astro';

/**
 * `robots.txt`, generated rather than dropped into `public/`.
 *
 * A hand-written file would hard-code the origin and the sitemap path, which
 * means two more places to remember when the domain changes — and a robots.txt
 * advertising a sitemap that is not served from that domain is the usual reason a
 * sitemap goes unnoticed. Reading `site` out of `astro.config.mjs` instead makes
 * that failure mode impossible: the origin can only ever be the one the sitemap
 * is generated from.
 *
 * `max-image-preview:large` is repeated here rather than left only to the
 * `<meta name="robots">` in `Base.astro`, so it still applies to crawlers that
 * read this file and no other.
 *
 * `SITEMAP_PATH` tracks the `filenameBase` in `astro.config.mjs`. Change one,
 * change both.
 */

const SITEMAP_PATH = '/sitemap-index.xml';

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL(SITEMAP_PATH, site);

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};