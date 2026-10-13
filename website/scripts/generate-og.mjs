/**
 * Generates `public/og.png`, the 1200x630 link-preview card.
 *
 *     pnpm og
 *
 * ## How it works
 *
 * The card is an HTML page set in the same faces and palette as the landing page
 * (poster grotesque, italic serif, hollow Anton, mono), screenshotted by headless
 * Chrome or Edge. An earlier version drew an SVG through librsvg, but librsvg only
 * sees locally installed fonts, so it could never match a page set in webfonts.
 *
 * Every string comes from `src/data/content.ts`, compiled in memory and imported,
 * so the movement count and version on the card cannot disagree with the page.
 * The colours are read out of `src/styles/global.css` for the same reason.
 *
 * ## Requirements
 *
 * A Chromium browser (Chrome, Edge, Chromium) and a network connection, because
 * the fonts are fetched from Google Fonts while the page renders. Set `CHROME_PATH`
 * to use a browser in a non-standard location.
 *
 * ## Output is committed
 *
 * The PNG lives in `public/` and is committed; this only needs to run when copy,
 * the version or the palette change.
 *
 * ## Verification
 *
 * A zero exit code is not proof the card is right. The result is checked for its
 * exact size, and for ink in the headline and footer bands, since a font that
 * failed to load still produces a valid PNG.
 */

import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src', 'data', 'content.ts');
const GLOBAL_CSS = path.join(ROOT, 'src', 'styles', 'global.css');

/** Must match `seo.ogImage` in `src/data/content.ts`. */
const WIDTH = 1200;
const HEIGHT = 630;

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap';

/** Reads a `--token: value;` out of the `:root` block of the site stylesheet. */
async function loadPalette() {
  const css = await readFile(GLOBAL_CSS, 'utf8');
  const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
  const get = (name) => {
    const value = root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
    if (!value) throw new Error(`No --${name} in :root of ${GLOBAL_CSS}`);
    return value;
  };
  return {
    bg: get('bg'),
    fg: get('fg'),
    muted: get('muted'),
    line: get('line'),
    accent: get('accent'),
    onAccent: get('on-accent'),
  };
}

/** Compiles `content.ts` in memory and imports it. */
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

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error('No Chrome/Edge found. Install one or set CHROME_PATH.');
  }
  return found;
}

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

function buildHtml({ c, icon, name, headline, version, footerLeft, footerRight }) {
  const [one, two, three] = headline;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${FONTS_URL}" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: ${c.bg}; }
  body {
    position: relative;
    color: ${c.fg};
    font-family: 'Bricolage Grotesque', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, ${c.line} 1px, transparent 1px),
      linear-gradient(to bottom, ${c.line} 1px, transparent 1px);
    background-size: 60px 60px;
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 35% 40%, #000 15%, transparent 75%);
  }
  .glow {
    position: absolute; right: -180px; top: -220px; width: 760px; height: 760px; border-radius: 50%;
    background: radial-gradient(circle, ${c.accent}66, transparent 65%);
  }
  .wrap { position: absolute; inset: 0; padding: 52px 72px 0; }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand img { width: 52px; height: 52px; border-radius: 12px; }
  .poster {
    font-weight: 800; font-stretch: 75%; font-variation-settings: 'wdth' 75;
    text-transform: uppercase; letter-spacing: -0.035em; line-height: 0.86;
  }
  .brand span { font-size: 34px; }
  .pill {
    display: flex; align-items: center; gap: 12px;
    border: 1px solid ${c.line}; border-radius: 999px; padding: 6px 20px 6px 6px;
    font: 500 17px 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; color: ${c.muted};
  }
  .pill b { background: ${c.accent}; color: ${c.onAccent}; border-radius: 999px; padding: 6px 13px; font-weight: 600; }
  h1 { margin-top: 34px; font-size: 118px; }
  h1 .l { display: block; }
  .serif {
    font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400;
    font-stretch: 100%; font-variation-settings: normal; text-transform: none;
    letter-spacing: -0.02em; color: ${c.accent}; font-size: 1.16em; line-height: 0.92;
  }
  .outline {
    font-family: 'Anton', sans-serif; font-weight: 400; font-stretch: 100%;
    font-variation-settings: normal; letter-spacing: 0.005em;
    color: transparent; -webkit-text-stroke: 2px ${c.fg};
  }
  .foot {
    position: absolute; left: 72px; right: 72px; bottom: 40px;
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 20px; border-top: 1px solid ${c.line};
    font: 500 19px 'JetBrains Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase; color: ${c.muted};
  }
  .foot em { font-style: normal; color: ${c.accent}; }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow"></div>
  <div class="wrap">
    <div class="top">
      <div class="brand">
        <img src="data:image/png;base64,${icon}" alt="" />
        <span class="poster">${esc(name)}</span>
      </div>
      <div class="pill"><b>New</b>v${esc(version)} · Direct APK</div>
    </div>
    <h1 class="poster">
      <span class="l">${esc(one)}</span>
      <span class="l serif">${esc(two)}</span>
      <span class="l outline">${esc(three)}</span>
    </h1>
  </div>
  <div class="foot"><span>${esc(footerLeft)}</span><span><em>●</em> ${esc(footerRight)}</span></div>
</body>
</html>`;
}

const { site, hero, total, bodyParts, seo } = await loadContent();

if (seo.ogImage.width !== WIDTH || seo.ogImage.height !== HEIGHT) {
  throw new Error(
    `Card is ${WIDTH}x${HEIGHT} but seo.ogImage says ` +
      `${seo.ogImage.width}x${seo.ogImage.height}. Change one of them.`,
  );
}

const c = await loadPalette();
const icon = (await readFile(path.join(ROOT, 'public', 'app-icon.png'))).toString('base64');
const html = buildHtml({
  c,
  icon,
  name: site.name,
  headline: hero.title,
  version: site.version,
  footerLeft: `${total.toLocaleString('en-US')} movements · ${bodyParts.length} body parts`,
  footerRight: 'Free · No account · No tracking',
});

const out = path.join(ROOT, 'public', seo.ogImage.file);
const tmp = await mkdtemp(path.join(os.tmpdir(), 'loglift-og-'));
const page = path.join(tmp, 'card.html');
const shot = path.join(tmp, 'card.png');

try {
  await writeFile(page, html);

  const result = spawnSync(
    findBrowser(),
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${HEIGHT + 200}`,
      '--virtual-time-budget=15000',
      `--screenshot=${shot}`,
      pathToFileURL(page).href,
    ],
    { encoding: 'utf8', timeout: 60_000 },
  );
  if (!existsSync(shot)) {
    throw new Error(`Browser produced no screenshot.\n${result.stderr ?? ''}`);
  }

  // Headless window heights are unreliable, so render taller and crop to the card.
  await sharp(shot)
    .extract({ left: 0, top: 0, width: WIDTH, height: HEIGHT })
    .png({ compressionLevel: 9 })
    .toFile(out);
} finally {
  await rm(tmp, { recursive: true, force: true });
}

const meta = await sharp(out).metadata();
if (meta.width !== WIDTH || meta.height !== HEIGHT) {
  throw new Error(`Wrote ${meta.width}x${meta.height}, expected ${WIDTH}x${HEIGHT}`);
}

/** Lit-pixel count in a horizontal band, using the accent-free luminance. */
const { data } = await sharp(out).greyscale().raw().toBuffer({ resolveWithObject: true });
function ink(y0, y1) {
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < WIDTH; x++) if (data[y * WIDTH + x] > 110) count++;
  }
  return count;
}

const bands = { 'headline y150-500': ink(150, 500), 'footer   y560-600': ink(560, 600) };
const blank = Object.entries(bands).filter(([, n]) => n < 500);
if (blank.length > 0) {
  throw new Error(`Card did not come out right — no ink in: ${blank.map(([k]) => k).join(', ')}`);
}

const { size } = await stat(out);
console.log(`public/${seo.ogImage.file}  ${meta.width}x${meta.height}  ${(size / 1024).toFixed(1)} KB`);
for (const [label, n] of Object.entries(bands)) console.log(`  ${label}  ${n} px`);
