# Log Lift

A strength-training exercise reference and personal-record logger, built with Expo and Expo Router.

Browse a catalogue of 1,292 movements, mark the ones you actually train, and log individual sets to keep a history of your best lifts. No account, no backend — everything is stored locally on the device.

<p align="center">
  <em>Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript</em>
</p>

## Features

- **Exercise catalogue** — 1,292 movements across 7 body parts (chest, back, shoulders, biceps, triceps, legs, core), each with an animated demonstration GIF, equipment, target muscle, and step-by-step instructions.
- **Your library** — mark exercises as the ones you train. They stay front and centre in every browse view.
- **Log a set** — record weight and reps for any exercise. Sets are sorted heaviest-first, so your best set is always the top entry.
- **PR detection** — the log screen shows a banner when the set you're about to save beats your current best, either by weight or by reps at equal weight.
- **Progress** — total sets logged, heaviest lift, a per-body-part breakdown, and a reverse-chronological history of every set you've recorded.
- **Search** — ranked search across names, equipment, target muscle, and secondary muscles.
- **Form cues** — 135 hand-written cue sets for common movements, falling back to the catalogue's own instructions elsewhere.
- **Related movements** — every exercise suggests variations of itself. The query is its name stripped of equipment, conjunctions and rep counts ("Barbell Bench Press" → "bench press"), widened one trailing word at a time until it is specific enough, then falling back to same target muscle and equipment for names with nothing distinctive left.
- **Training stats** — heaviest set, an Epley estimated 1RM, total volume lifted, and a newest-first set history per exercise.
- **kg / lb** — a single unit preference. Weights are always _stored_ in kilograms, so switching the display unit later never rewrites your history.

## Screens

| Route                      | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `/muscles`                 | Home. Collections (full-body, push, pull) and body-part summaries with tracked counts. |
| `/muscle/[muscle]`         | Browse one body part. Toggle between your library and the full catalogue.              |
| `/collection/[collection]` | Full-body, push, or pull browsing.                                                     |
| `/exercise/[id]`           | Exercise detail: GIF, muscles worked, form cues, your records, and related movements. |
| `/search`                  | Global catalogue search.                                                               |
| `/log-pr`                  | Modal form for logging a set.                                                          |
| `/progress`                | Stats, per-body-part breakdown, and set history.                                       |
| `/settings`                | Unit preference, data management, library stats, attribution.                          |

## Getting started

Requires Node.js and pnpm.

```bash
pnpm install
pnpm start
```

Then press `i` for the iOS simulator, `a` for Android, `w` for web, or scan the QR code with Expo Go.

All the native modules this app uses ship with Expo Go, so a development build isn't required. If you add one later (e.g. a library without native support), use `npx expo run:ios` / `npx expo run:android`.

## Scripts

| Command                                  | Description                                                     |
| ---------------------------------------- | --------------------------------------------------------------- |
| `pnpm start`                             | Start the Expo dev server.                                      |
| `pnpm ios` / `pnpm android` / `pnpm web` | Start on a specific platform.                                   |
| `pnpm lint`                              | ESLint via `eslint-config-expo`.                                |
| `pnpm typecheck`                         | `tsc --noEmit`.                                                 |
| `pnpm build:catalog`                     | Regenerate `src/data/exercises.json` from the upstream dataset. |

## Project structure

```
src/
  app/                  Routes — every file is a screen
    (tabs)/             muscles, progress, settings
    collection/[...]/   full-body / push / pull browsing
    exercise/[id].tsx   exercise detail
    muscle/[muscle].tsx per-body-part browsing
    log-pr.tsx          log a set (modal)
    search.tsx          catalogue search
  components/           Design system: Card, Txt, Icons, Segmented, Screen, …
  constants/theme.ts    Colors, spacing, radii, typography
  data/
    exercises.json      Generated catalogue (do not edit by hand)
    exercises.ts        Types, search, collections
    form-cues.ts        Hand-written form cues
  hooks/                useTheme, useColorScheme, useMuscleColor
  store/library.tsx     Library + set-log state, AsyncStorage persistence
  utils/weight.ts       kg/lb conversion and parsing
scripts/                Catalogue build script
```

There's no `ios/` or `android/` directory — the app uses continuous native generation, so native behaviour is configured in `app.json` and config plugins.

## Data and storage

All state lives in a single AsyncStorage key (`loglift.state.v1`) and holds only:

- your display unit (`kg` | `lb`), and
- a map of exercise id → added timestamp → list of logged sets (`weightKg`, `reps`, `date`).

Two consequences worth knowing:

- **Removing an exercise deletes its history.** The library is your list of what you track, not an archive — so the app confirms before it does.
- **Stored weights are always kilograms.** The display unit is a pure conversion at render time.

Stored state is sanitised on load — corrupt JSON returns an empty library instead of throwing, so bad data can't stop the app from booting. **Settings → Clear all data** resets everything, including your unit preference.

## Exercise catalogue

`src/data/exercises.json` is generated and committed to the repo. To rebuild it:

```bash
pnpm build:catalog            # uses the pinned upstream release, caches the download
pnpm build:catalog -- --refresh          # ignore the cache
pnpm build:catalog -- --from-file ./exercises.json   # build from a local copy
```

The script maps the upstream dataset's fine-grained muscles onto the 7 body parts this app uses, drops unsupported entries, interns the instruction strings into a shared table to keep the bundle small, and sorts by name. It requires no API key.

## Design notes

A few deliberate choices:

- **Grayscale UI.** Muscle colours all resolve to black or white so no screen can reintroduce colour by accident. `danger` is the only chromatic colour left.
- **Native chrome first.** Uses `NativeTabs`, `<Stack.SearchBar>`, and `<Stack.Toolbar>` for headers. Screens running on web fall back to in-content search fields and buttons.
- **One icon source of truth.** A single `ICONS` map declares both the SF Symbol and Material Design glyph for each icon, so a bad rename fails at compile time instead of rendering a blank square.
- **GIFs are recycled.** Exercise rows render with a `recyclingKey` and never autoplay, so only visible animations decode. Only the detail screen plays.
- **Card width is capped** at 720px so content stays centred on tablets and web.

## Credits

- Exercise data and GIFs from [ExerciseGymGifsDB](https://github.com/JahelCuadrado/ExerciseGymGifsDB), pinned to `v1.1.0`.
- Form cues written for this project.

## License

MIT — see [LICENSE](./LICENSE).
