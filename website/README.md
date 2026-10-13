# Log Lift — website

The public landing page for the Log Lift Android app. It is a completely separate
project from the Expo app one directory up: its own `package.json`, its own lockfile,
its own `node_modules`, and no shared build. Nothing in `src/` here is imported by the
app, and nothing in the app is imported here.

```bash
pnpm install     # in this directory, not the repo root
pnpm dev         # http://localhost:4321
pnpm build       # static output in dist/
pnpm check       # astro + typescript diagnostics
pnpm og          # regenerate public/og.png — run after copy edits
```

It is deliberately **not** part of the root pnpm workspace, so `pnpm install` at the
repo root cannot disturb the Expo app's dependency tree.

## Distribution: releases, not Play

The app is **not on Google Play**. It ships as an APK attached to a GitHub release, and
every download button on the page links straight at that asset.

Two fields in `src/data/content.ts` describe a release, and they must be bumped
together — the version is printed on the hero badge and the URL has the tag baked
into it:

```ts
version: '1.5.0',
downloadUrl:
  'https://github.com/faisalsaifii/loglift/releases/download/v1.5.0/loglift_v1.5.0.apk',
```

Because the download is a sideload rather than a store install, Android's "allow
installs from this source" prompt is part of the experience. `closing.install` in the
same file exists to say so before the user hits the button rather than after.

When a Play listing does go live, add a `playUrl` field, swap `DownloadBadge.astro`
back to the official Play badge artwork, and update `site` in `astro.config.mjs` for
the canonical domain. Do not point a Play badge or the Play triangle at a GitHub
release APK — the triangle is Google's trademark and the listing would not exist yet.

## Deploying

`astro build` emits a fully static `dist/` — deploy it to GitHub Pages, Netlify,
Cloudflare Pages or any bucket. No server runtime.

Before the first deploy, set the real origin in `astro.config.mjs`:

```js
site: 'https://your-domain.example',
```

That one value drives `<link rel="canonical">`, every Open Graph URL, the
`sitemap-*.xml` files, the `Sitemap:` line in `robots.txt`, and the absolute URLs
inside the JSON-LD. Change it in one place.

## SEO

### What is generated

| File                | Source                                   |
| ------------------- | ---------------------------------------- |
| `robots.txt`        | `src/pages/robots.txt.ts` — prerendered  |
| `sitemap-index.xml` | `@astrojs/sitemap` in `astro.config.mjs` |
| `sitemap-0.xml`     | same                                     |
| `og.png`            | `pnpm og` → `scripts/generate-og.mjs`    |

`robots.txt` is an Astro endpoint rather than a file in `public/` so that it reads
`site` from the config. A hand-written file would hard-code the origin, and a
robots.txt pointing at a sitemap that is not served from that domain is the usual
reason a sitemap goes unnoticed.

The sitemap integration switches off all four optional XML namespaces — the site is
single-language and has no news, video, or image-sitemap entries, so shipping them
would only add empty attributes for crawlers to skip.

### The link-preview card

`public/og.png` is a 1200×630 card, committed to the repo. The app icon is
1000×1000 and a square image in a `summary_large_image` slot gets centre-cropped or
letterboxed depending on the platform, so the icon alone is not a usable card
whatever it is tagged as.

**Run `pnpm og` after editing any copy in `content.ts` that appears on the card.**
The script reads the same module the page renders from, so the movement count in
the card cannot drift from the movement count on the page — but that only holds if
you re-run it.

The card is an HTML page set in the same faces and palette as the landing page (the
fonts load from Google Fonts, the colours are read out of `:root` in `global.css`),
screenshotted by headless Chrome or Edge. It needs a Chromium browser and a network
connection; set `CHROME_PATH` if yours is in a non-standard location.

The script checks the result's exact size and that the headline and footer bands
actually contain ink, which catches a font that failed to load — the PNG would
otherwise still be valid.
`sharp` and `esbuild` are devDependencies for this script alone; neither ships to
the browser or runs during `astro build`.

### Structured data

`structuredData()` in `src/data/content.ts` returns a `@graph` that `Base.astro`
wraps in a JSON-LD `<script>`. Three nodes: `WebSite`, `MobileApplication`,
`Person`. The feature list is read from `features`, so the markup cannot claim something the app does not do.

There is deliberately no `aggregateRating` or `review`. Both are valid on
`SoftwareApplication`, and inventing either would be fabricated review markup —
the app has no store listing to rate and no reviews to carry.

### Editing SEO copy

`seo` in `src/data/content.ts` holds the default title, meta description, robots
directives, `og:locale`, and the card's dimensions and alt text. The description
derives the movement count from `total`, so it cannot drift the way the old
hard-coded copy did.

The `<link rel="canonical">` and `og:url` resolve against `Astro.site` rather than
`Astro.url`, so they stay correct on a dev machine and on preview deploys instead
of advertising `http://localhost:4321` as the canonical URL.

## Known gaps

- **One page.** Every internal link is an anchor (`#how`, `#features`), so there is
  nothing for a crawler to discover beyond the root. A `/privacy` page and a real
  `/download` route would give the site an actual link graph.
- **Thin long-tail coverage.** No FAQ, so nothing targets the questions the page
  only answers implicitly — does it work offline, what happens to my data, is it
  really free. An FAQ section plus `FAQPage` markup is the cheapest next win.

## Editing the copy

Every string lives in `src/data/content.ts`. Nothing else needs touching for a copy
change: the hero, the feature cards, the numbered steps, the body-part counts and
the closing CTA are all data. The one exception is the link-preview card, which
reads the same file but is baked into a PNG — re-run `pnpm og`.

The figures in there are pulled from the app's real data and should stay in sync with
it:

| Figure            | Source                                        |
| ----------------- | --------------------------------------------- |
| `1,292` movements | `bodyParts` summed to `total`                 |
| Body-part counts  | `src/data/exercises.json` grouped by `group`  |
| `135` form cues   | `src/data/form-cues.ts` → `CURATED_CUE_COUNT` |

If those numbers change in the app, change them here too.

## Screenshots

The page deliberately has no app screenshots or phone mockups: they went stale every
time the UI changed and were too much to maintain. The "How it works" section is
text-only (`loop` in `src/data/content.ts`).

The form demonstrations in the app come from
[ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB) pinned to
`v1.1.0`, the same source and pin the app uses. The attribution stays in the footer.

## Styling notes

The site is **dark-only**, set in a "training ledger" language: warm near-black, bone ink and one electric-lime accent (`--accent`) that only marks the primary action or a number worth reading. Three type voices — Bricolage Grotesque (poster headings, `.poster`), Instrument Serif italic (asides, `.aside`) and JetBrains Mono (data, `.mono`) — plus Anton for hollow lettering (`.outline-type`; the variable grotesque's overlapping contours show through a text-stroke). Fonts load from Google Fonts in `Base.astro`.

Palette tokens live in `:root` in `src/styles/global.css`; there is no light palette. Tailwind v4 is configured through `@theme inline` — the `inline` option is load-bearing, otherwise `bg-surface` freezes the `:root` value and `.band-sunken` sections paint the page colour.

Motion lives in `src/scripts/motion.ts` (scroll reveal, pointer spotlight on `.tile`, `data-count` count-up, header state) and respects `prefers-reduced-motion`. `data-reveal` animates `transform`, so never put it on an element that also owns a transform.