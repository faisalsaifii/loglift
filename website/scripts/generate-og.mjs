/**
 * Generates `public/og.png`, the link-preview card.
 *
 *     pnpm og
 *
 * ## Why a generated card
 *
 * The card has to be 1200x630. The app icon is 1000x1000, and a square image in a
 * `summary_large_image` slot gets centre-cropped or letterboxed depending on the
 * platform — so the icon alone is not a usable card, whatever it is tagged as.
 *
 * ## Why it is generated rather than drawn by hand
 *
 * Every string on the card is read out of `src/data/content.ts`, the same module
 * the page itself renders from. That is the whole point: the movement count in
 * the card cannot disagree with the movement count on the page, and re-running
 * this after a copy edit keeps it that way. A hand-drawn PNG would be correct
 * once and quietly wrong after the next release.
 *
 * ## Output is committed
 *
 * `dist/` is static and the card is a plain file in `public/`, so there is nothing
 * to gain by generating it during `astro build` — the asset is committed and this
 * script only runs when somebody changes the copy. Run it again after editing
 * anything in `content.ts` that appears on the card.
 *
 * ## Fonts
 *
 * The stack is read out of `src/styles/global.css` at run time and applied to the
 * root `<svg>`, so the card is set in whatever face the page is set in and cannot
 * drift when that changes.
 *
 * The page loads no webfont — `--font-sans` is a system stack, and the browser
 * resolves it per platform (SF Pro on Apple, Segoe UI on Windows, Roboto on
 * Android). librsvg resolves the same list through fontconfig, skipping the two
 * entries that are browser keywords rather than families (`-apple-system`,
 * `BlinkMacSystemFont`) and landing on the first family installed on whichever
 * machine ran this. So the card matches the page for whoever regenerates it, but
 * not necessarily the page for whoever is looking at it — the asset is committed
 * precisely so that only one machine's resolution ever ships.
 *
 * The face cannot be embedded: Segoe UI and SF Pro are licensed for local use
 * only, and vendoring either into a public repo is not an option.
 *
 * ## Verification
 *
 * A successful exit is not evidence the card is right. Two failures are silent:
 * a stack fontconfig cannot resolve renders every string as nothing, and a face
 * with different metrics pushes an absolutely-positioned line past the right
 * margin, where the 1200px frame silently crops it. The card is measured after
 * rasterising and the script fails on either.
 */

import { Buffer } from 'node:buffer';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src', 'data', 'content.ts');
const GLOBAL_CSS = path.join(ROOT, 'src', 'styles', 'global.css');

/** Must match `seo.ogImage` in `src/data/content.ts`. */
const WIDTH = 1200;
const HEIGHT = 630;

/** Page margin. The card has no responsive geometry, so this is literal. */
const M = 88;
const RIGHT = WIDTH - M;

/** Mirrors the `:root` palette in `src/styles/global.css`. */
const C = {
  bg: '#000000',
  fg: '#ffffff',
  muted: '#98989f',
  line: '#38383a',
};

/**
 * The site's `--font-sans`, read out of `global.css` rather than restated here.
 *
 * The card used to carry its own copy of the stack, which is exactly the kind of
 * duplication that rots: a change to the font in the stylesheet would have left
 * the card on the old face with nothing to flag it. There is one declaration now,
 * and the card follows it.
 *
 * The value is spliced in verbatim, so the quirks of a CSS system stack survive
 * intact. `-apple-system` and `BlinkMacSystemFont` are not families fontconfig
 * can resolve — they are keywords the browser maps to the platform UI face — so
 * librsvg skips over them and lands on the same family the page does on the
 * machine doing the rendering. Nothing here needs to reorder or filter them.
 */
async function loadSiteFont() {
  const css = await readFile(GLOBAL_CSS, 'utf8');
  const decl = css.match(/--font-sans:\s*([^;]+);/);
  if (!decl) throw new Error(`No --font-sans declaration in ${GLOBAL_CSS}`);

  // The declaration wraps across lines; collapse to single spaces so the stack is
  // a valid CSS font-family list rather than one with embedded newlines.
  return decl[1].replace(/\s+/g, ' ').trim();
}

/**
 * Compiles `content.ts` in memory and imports it, so this script reads the exact
 * module the page renders from instead of a copy of it. esbuild is a declared
 * devDependency rather than a transitive one, so nothing here depends on which
 * bundler Astro happens to ship.
 */
async function loadContent() {
  const { build } = await import('esbuild');
  const { outputFiles } = await build({
    entryPoints: [CONTENT],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  });
  const code = outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

/** XML text-node escaping. The copy is authored, not user input, but the SVG is. */
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  );

function buildSvg({ icon, font, name, headline, note, footerLeft, footerRight }) {
  // Graph paper at the same 34px pitch as `.grid-tex`, drawn rather than linked so
  // the card needs no second asset and no external fetch during rasterisation.
  const grid = [];
  for (let x = M; x <= RIGHT; x += 34) {
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}"/>`);
  }
  for (let y = 0; y <= HEIGHT; y += 34) {
    grid.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}"/>`);
  }

  // The hero's three beats, one per line, last one in `muted` so it reads as a
  // landing rather than a run-on sentence. Sizes and baselines are literal
  // because the card is a fixed 1200x630 and never reflows.
  const HEAD_SIZE = 58;
  const HEAD_LH = 64;
  const headTop = 254;
  const headLines = headline
    .map(
      (line, i) =>
        `<text x="${M}" y="${headTop + i * HEAD_LH}" font-size="${HEAD_SIZE}" font-weight="600" letter-spacing="-1.8" fill="${
          i === headline.length - 1 ? C.muted : C.fg
        }">${esc(line)}</text>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="${esc(font)}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="rounded"><rect width="${WIDTH}" height="${HEIGHT}" rx="0"/></clipPath>
  </defs>

  <g clip-path="url(#rounded)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${C.bg}"/>
    <g stroke="${C.fg}" stroke-width="1" opacity="0.05">${grid.join('')}</g>
    <rect width="${WIDTH}" height="420" fill="url(#glow)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:overlay"/>

    <image x="${M}" y="82" width="80" height="80" xlink:href="data:image/png;base64,${icon}"/>
    <text x="${M + 80 + 22}" y="136" font-size="32" font-weight="600" letter-spacing="-0.6" fill="${C.fg}">${esc(name)}</text>

    ${headLines}

    <text x="${M}" y="${headTop + headline.length * HEAD_LH + 22}" font-size="22" letter-spacing="0.1" fill="${C.muted}">${esc(note)}</text>

    <line x1="${M}" y1="512.5" x2="${RIGHT}" y2="512.5" stroke="${C.line}" stroke-width="1"/>
    <text x="${M}" y="560" font-size="22" fill="${C.muted}">${esc(footerLeft)}</text>
    <text x="${RIGHT}" y="560" font-size="22" fill="${C.muted}" text-anchor="end">${esc(footerRight)}</text>
  </g>
</svg>`;
}

const { site, hero, total, bodyParts, seo } = await loadContent();

if (seo.ogImage.width !== WIDTH || seo.ogImage.height !== HEIGHT) {
  throw new Error(
    `Card is ${WIDTH}x${HEIGHT} but seo.ogImage says ` +
      `${seo.ogImage.width}x${seo.ogImage.height}. Change one of them.`,
  );
}

const icon = (await readFile(path.join(ROOT, 'public', 'app-icon.png'))).toString('base64');
const font = await loadSiteFont();

const svg = buildSvg({
  icon,
  font,
  name: site.name,
  headline: hero.title,
  note: hero.note,
  footerLeft: `${total.toLocaleString('en-US')} movements · ${bodyParts.length} body parts`,
  footerRight: `Free Android APK · v${site.version}`,
});

const out = path.join(ROOT, 'public', seo.ogImage.file);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);

// Confirm the rasterised result rather than trusting that it wrote a file.
const meta = await sharp(out).metadata();
if (meta.width !== WIDTH || meta.height !== HEIGHT) {
  throw new Error(`Wrote ${meta.width}x${meta.height}, expected ${WIDTH}x${HEIGHT}`);
}

/**
 * Measures the ink instead of trusting the geometry.
 *
 * Two things can go wrong that a successful exit code will not catch. Text can
 * fail to rasterise at all — librsvg resolving no font still writes a perfectly
 * valid, correctly-sized PNG. And a face change moves every metric: the
 * headline and the footer are sized in absolute pixels, so swapping the stack
 * can silently push a line past the right margin, where it is simply cropped by
 * the 1200px frame. Neither is visible without looking, and this script has no
 * way to look.
 *
 * `THRESHOLD` is chosen to sit above the grid (5% white) and the radial glow
 * (15% at its brightest), so only the icon and the type are counted.
 */
const THRESHOLD = 60;

const { data } = await sharp(out)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

/** Lit-pixel extents of a horizontal band, or null if the band is blank. */
function inkIn(y0, y1) {
  let minX = Infinity;
  let maxX = -Infinity;
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (data[y * WIDTH + x] > THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        count++;
      }
    }
  }
  return count === 0 ? null : { minX, maxX, count };
}

const bands = {
  'wordmark   y100-160': inkIn(100, 160),
  'headline   y195-400': inkIn(195, 400),
  'note       y425-465': inkIn(425, 465),
  'footer     y535-575': inkIn(535, 575),
};

const problems = [];

if (!bands['headline   y195-400']) {
  problems.push(
    'the headline rendered no pixels — fontconfig resolved nothing from:\n' +
      `      ${font}`,
  );
}

for (const [label, ink] of Object.entries(bands)) {
  if (!ink) {
    problems.push(`${label} is blank`);
    continue;
  }
  // Right-overflow is the silent one, so it is the one worth failing on. The
  // left is anchored to the margin by construction and only needs reporting.
  if (ink.maxX > RIGHT) {
    problems.push(`${label} overruns the right margin by ${ink.maxX - RIGHT}px`);
  }
}

if (problems.length > 0) {
  throw new Error(`Card did not come out right:\n  - ${problems.join('\n  - ')}`);
}

const { size } = await stat(out);
console.log(`public/${seo.ogImage.file}  ${meta.width}x${meta.height}  ${(size / 1024).toFixed(1)} KB`);
console.log(`font: ${font}`);
for (const [label, ink] of Object.entries(bands)) {
  const rightGap = RIGHT - ink.maxX;
  console.log(
    `  ${label}  x ${String(ink.minX).padStart(4)}..${String(ink.maxX).padStart(4)}` +
      `  ${String(ink.count).padStart(6)} px  ${String(rightGap).padStart(4)}px to margin`,
  );
}