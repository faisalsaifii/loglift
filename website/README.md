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
version: '1.0.0',
downloadUrl:
  'https://github.com/faisalsaifii/loglift/releases/download/v1.0.0/loglift.apk',
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

That value drives `<link rel="canonical">` and the Open Graph URLs.

## Editing the copy

Every string lives in `src/data/content.ts`. Nothing else needs touching for a copy
change: the hero, the feature cards, the numbered steps, the body-part counts and the
closing CTA are all data.

The figures in there are pulled from the app's real data and should stay in sync with
it:

| Figure            | Source                                        |
| ----------------- | --------------------------------------------- |
| `1,292` movements | `bodyParts` summed to `total`                 |
| Body-part counts  | `src/data/exercises.json` grouped by `group`  |
| `135` form cues   | `src/data/form-cues.ts` → `CURATED_CUE_COUNT` |

If those numbers change in the app, change them here too.

## How the phone mockups work

The phones on the page frame **real screenshots**, not HTML rebuilds. The captures live
in `public/screens/` and are full-device Android shots (status bar and gesture pill
included), so `Phone.astro` contributes only a bezel and a contact shadow — and since
the pixels are fixed, the phones need no theme-specific treatment.

Screens are registered once in the `screens` map in `src/data/content.ts`, keyed by a
`ScreenName`, and `Phone.astro` types its `screen` prop against that map. A renamed or
missing file is therefore a build error rather than a broken image on the page. Alt text
lives in the same entry, and the walkthrough copy for each screen is the `showcase`
object just below it.

```astro
<Phone screen="progress" size="sm" />
```

| Prop    | Effect                                                              |
| ------- | ------------------------------------------------------------------- |
| `screen`| Which entry in the `screens` map to frame                            |
| `size`  | `lg` (19rem) for the hero shot, `sm` (15rem) for a walkthrough row   |
| `delay` | Staggers the drift animation when several devices share a section   |
| `eager` | Skips lazy-loading for the likely LCP element (the hero phone)       |

To add a screen: drop the capture into `public/screens/`, add an entry to `screens`, and
if it should appear in the walkthrough, append it to `showcase.items`.

The form demonstrations the app shows come from
[ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB) pinned to
`v1.1.0` — the same source and the same pin the app itself uses. The page used to vendor
a copy; it does not any more, since every phone now frames a screenshot. The attribution
stays in the footer because it still covers the GIFs visible inside the exercise-detail
capture.

## Styling notes

The site is **dark-only**. There is no theme toggle, no `.dark` class on `<html>` and
no `prefers-color-scheme` branch — the palette lives in `:root` in
`src/styles/global.css` and `color-scheme` is set to `dark`. Do not reintroduce a
light palette; add a new token there instead.

Tailwind v4, configured through `@theme inline` in `src/styles/global.css`. The
`inline` option is load-bearing — without it, `bg-surface` freezes the `:root` value
and every `.band-sunken` section further down the page paints the page colour instead
of the inset one.

`.band-sunken` only redefines `background-color`; it leaves the inherited `color`
alone so cards nested inside it stay raised against it.

`data-reveal` animates `transform` on the element it sits on, so it must never share an
element with `.tilt`, which also owns `transform`. Cards wrap one inside the other for
that reason.