/**
 * Every string on the landing page lives here so the marketing copy can be
 * edited without touching markup. Figures are pulled from the actual app —
 * `src/data/exercises.json`, `src/data/form-cues.ts` and `src/data/exercises.ts`
 * — so the site cannot drift away from the product.
 */

export type IconName = 'catalogue' | 'demo' | 'log' | 'record';

export const site = {
  name: 'Log Lift',
  tagline: 'Strength training reference and personal-record logger',
  /** Bump both of these together on every release — see the README. */
  version: '1.0.0',
  /**
   * The app is not on Google Play yet. Until it is, releases are published as an
   * APK on GitHub and linked straight from here, so the download is the primary
   * call to action on the page rather than a store badge pointing at a 404.
   */
  downloadUrl:
    'https://github.com/faisalsaifii/loglift/releases/download/v1.0.0/loglift.apk',
  repoUrl: 'https://github.com/faisalsaifii/loglift',
  datasetUrl: 'https://github.com/JahelCuadrado/ExerciseGymGifsDB',
  /** Shown in the footer and used as the structured-data author. */
  author: 'faisalsaifii',
  license: 'MIT',
} as const;

/** Counts computed from `src/data/exercises.json`. */
export const bodyParts = [
  { id: 'legs', name: 'Legs', count: 286 },
  { id: 'core', name: 'Core', count: 193 },
  { id: 'biceps', name: 'Biceps', count: 188 },
  { id: 'back', name: 'Back', count: 183 },
  { id: 'chest', name: 'Chest', count: 158 },
  { id: 'shoulders', name: 'Shoulders', count: 143 },
  { id: 'triceps', name: 'Triceps', count: 141 },
] as const;

export const total = bodyParts.reduce((sum, part) => sum + part.count, 0);

export const hero = {
  /** One sentence per array entry; the last is set in `muted`. */
  title: ['Know the movement.', 'Log the set.', 'Beat the record.'],
  lede: `A strength-training reference and personal-record logger. Browse ${total.toLocaleString('en-US')} movements with animated form demos and hand-written cues, then log a set in seconds — all of it stored on your device and nowhere else.`,
  secondary: 'See how it works',
  note: 'Free · No account · No tracking · Works offline',
} as const;

export const featuresIntro = {
  eyebrow: "What's inside",
  title: 'The parts other apps charge for',
  lede: 'No subscription, no account, no unlock tiers — all of it ships in the download, and none of it phones home.',
} as const;

/** The four things the app does that other apps ask you to pay for. */
export const features: readonly {
  title: string;
  body: string;
  icon: IconName;
}[] = [
  {
    title: `${total.toLocaleString('en-US')} movements, bundled`,
    body: `All ${bodyParts.length} body parts ship inside the binary. No account to create, nothing fetched from a server, and it opens with no signal.`,
    icon: 'catalogue',
  },
  {
    title: 'See the form first',
    body: 'A looping demonstration on every movement, plus 135 hand-written cue sets for the lifts people actually train.',
    icon: 'demo',
  },
  {
    title: 'A set takes four seconds',
    body: 'Rep presets, a unit you can type into, and haptics on save. Kilograms stored, pounds displayed, history untouched.',
    icon: 'log',
  },
  {
    title: 'Records that count',
    body: 'A banner tells you a set beats your best before you save it. Then estimated 1RM, volume and full history.',
    icon: 'record',
  },
] as const;

/**
 * Real device captures, one per step of the loop, in `public/screens/`.
 *
 * These are full-screen Android screenshots — status bar and gesture pill
 * included — rather than crops of the app content, so `Phone.astro` can frame
 * them without having to re-draw either. They are keyed by a `ScreenName` and
 * typed against it, so a renamed or missing file is a build error rather than a
 * broken image on the page.
 *
 * The intrinsic size is declared once here rather than on each `<img>`: all five
 * captures come off the same device, so they are all 1206×2622.
 */
export const SCREEN_WIDTH = 1206;
export const SCREEN_HEIGHT = 2622;

export const screens = {
  muscles: {
    file: 'muscles-page.jpeg',
    alt: 'The muscle screen, listing the seven body parts the catalogue is grouped into.',
  },
  exerciseList: {
    file: 'exercise-list-page.jpeg',
    alt: 'The exercise list for one body part, with every movement in that group.',
  },
  exerciseDetail: {
    file: 'exercise-detail-page.jpeg',
    alt: 'An exercise detail screen, with the looping form demonstration and the written cues beneath it.',
  },
  logSet: {
    file: 'log-a-set-page.jpeg',
    alt: 'The log-a-set sheet, with weight and reps entered and a banner confirming the set beats your current best.',
  },
  progress: {
    file: 'progress-page.jpeg',
    alt: 'The progress screen, showing your heaviest set, estimated one-rep max and total volume.',
  },
} as const satisfies Record<string, { file: string; alt: string }>;

export type ScreenName = keyof typeof screens;

/**
 * One card per step of the loop, each paired with the screen that step happens on.
 *
 * This is where "how it works" and "how it looks" are the same content: the copy
 * describes a step, and the phone above it is a capture off the shipped build
 * rather than a mockup. `screen` is typed against `ScreenName`, so a card pointing
 * at a screenshot that was renamed or never captured fails the build.
 *
 * Four items, not five, because the grid is one row of four — a fifth would wrap
 * into a lopsided second row. `exerciseList` is the capture that got folded in
 * here: its point (already sorted, already filtered, no spinner) is now the tail
 * of step one rather than a screen of its own.
 */
const loopItems = [
  {
    screen: 'muscles',
    title: 'Pick a movement',
    body: `Seven body parts, ${total.toLocaleString('en-US')} movements, searchable by name, equipment or muscle. All in the binary, so no signal needed.`,
  },
  {
    screen: 'exerciseDetail',
    title: 'Check the form',
    body: 'Every movement loops its own demo, and 135 of them carry hand-written cues for the lift you are about to load.',
  },
  {
    screen: 'logSet',
    title: 'Log the set',
    body: 'Weight and reps in four seconds. A banner flags a new best before you save it.',
  },
  {
    screen: 'progress',
    title: 'Beat the record',
    body: 'Heaviest set, estimated 1RM, total volume, full history — all computed on device.',
  },
] as const satisfies readonly { screen: ScreenName; title: string; body: string }[];

export const loop = {
  eyebrow: 'How it works',
  title: 'The loop, start to finish',
  lede: `${loopItems.length} steps, each with the screen it happens on. Captures off the shipped build, not mockups.`,
  items: loopItems,
} as const;

export const closing = {
  title: 'Start logging in the next rep',
  lede: 'Free, with no account and no tracking. The whole catalogue is in the app the moment you open it.',
  /**
   * Sideloading is the one thing a store install would have handled for us, so it
   * gets said out loud rather than left as a surprise on the settings screen.
   */
  install: 'Android asks you to allow installs from your browser the first time.',
} as const;

/* ══ Search and social ═════════════════════════════════════════════════════════ */

export const seo = {
  /**
   * The default `<title>` and `og:title`. Short on purpose — it is both the
   * browser-tab label and the first line of a link preview, so the brand leads
   * and the tagline carries the keywords.
   */
  title: `${site.name} — ${site.tagline}`,

  /**
   * The meta description. Lives here rather than in `Base.astro` so the movement
   * count is derived from `total` instead of being typed out again: the old copy
   * hard-coded `1,292` in two places, which is exactly the drift the rest of this
   * file is arranged to prevent.
   */
  description: `A strength-training reference and personal-record logger. Browse ${total.toLocaleString('en-US')} movements with animated form demos and hand-written cues, then log a set in seconds. No account, no backend, no tracking. Free Android APK.`,

  /**
   * `index, follow` is the default and is stated explicitly so the opt-out lives
   * next to the opt-in and cannot be half-removed. The `max-*` directives are not
   * cosmetic: without `max-image-preview:large`, Google and X both fall back to a
   * thumbnail-sized crop of any image on the page, and `-1` on the snippet and
   * video directives lets them show the full text they are entitled to.
   */
  robots:
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',

  /** Matches the `lang` on `<html>`; `og:locale` wants the underscore form. */
  locale: 'en_US',

  /** The link-preview card. See `scripts/generate-og.mjs`. */
  ogImage: {
    file: 'og.png',
    width: 1200,
    height: 630,
    /**
     * Describes what is actually painted on the card, not what the card is "for".
     * Platforms surface this to screen readers and as the fallback when the image
     * itself fails to load, so it has to stand on its own.
     */
    alt: `The Log Lift app icon and name on a black background, with the tagline “${site.tagline}” and the notes “${hero.note}”.`,
  },
} as const;

/**
 * The JSON-LD graph for the landing page.
 *
 * Returned as an array so `Base.astro` can wrap it in a single `@graph` and link
 * the nodes by `@id`. Three nodes earn their place:
 *
 * - `WebSite` names the site and its search target.
 * - `MobileApplication` is the one that matters. It is what lets the page qualify
 *   for app-style results instead of being read as a plain marketing page, and it
 *   is built entirely from data already in this file, so it cannot claim a
 *   feature count the app does not have.
 * - `Person` is the author, shared with the footer.
 *
 * Deliberately absent: `aggregateRating` and `review`. Both are supported by the
 * type, and inventing either would be a fabricated review markup violation — the
 * app has no Play listing to rate and no reviews to carry.
 */
export function structuredData(origin: URL) {
  const abs = (path: string) => new URL(path, origin).href;
  const id = origin.href;

  return [
    {
      '@type': 'WebSite',
      '@id': `${id}#website`,
      url: id,
      name: site.name,
      description: seo.description,
      inLanguage: 'en',
      publisher: { '@id': `${id}#author` },
    },
    {
      '@type': 'MobileApplication',
      '@id': `${id}#app`,
      name: site.name,
      description: seo.description,
      url: id,
      applicationCategory: 'Health & Fitness',
      operatingSystem: 'Android',
      softwareVersion: site.version,
      downloadUrl: site.downloadUrl,
      installUrl: site.downloadUrl,
      license: `https://opensource.org/licenses/${site.license}`,
      author: { '@id': `${id}#author` },
      featureList: features.map((feature) => feature.title),
      screenshot: Object.values(screens).map((screen) => abs(`/screens/${screen.file}`)),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      isAccessibleForFree: true,
    },
    {
      '@type': 'Person',
      '@id': `${id}#author`,
      name: site.author,
      url: site.repoUrl,
    },
  ] as const;
}