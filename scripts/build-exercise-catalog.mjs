/**
 * Regenerates `src/data/exercises.json` — the bundled exercise catalogue.
 *
 *   node scripts/build-exercise-catalog.mjs [--refresh]
 *
 * Source: ExerciseGymGifsDB (static API, no key required), pinned to a tag so the
 * GIF URLs in the app can never break:
 *   https://github.com/JahelCuadrado/ExerciseGymGifsDB
 *
 * Only metadata is bundled — the animation GIFs themselves are streamed from the
 * jsDelivr CDN at runtime by expo-image, which caches them on disk.
 *
 * The dataset ships 19 fine-grained muscles. `--from-file <path>` maps them onto
 * the 7 body parts the app exposes.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DATASET_VERSION = 'v1.1.0';
const CDN_BASE = `https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@${DATASET_VERSION}`;
const REMOTE_URL = `${CDN_BASE}/api/en/exercises.json`;
const CACHE_FILE = path.resolve(import.meta.dirname, '.exercise-cache.json');
const OUTPUT_FILE = path.resolve(import.meta.dirname, '../src/data/exercises.json');

/**
 * The dataset muscle slugs that make up each body part the app shows.
 * `cardio` and `levator-scapulae` are intentionally not exposed.
 */
const MUSCLE_GROUPS = {
  chest: ['pectorals'],
  back: ['lats', 'upper-back', 'traps'],
  shoulders: ['delts'],
  biceps: ['biceps', 'forearms'],
  triceps: ['triceps'],
  legs: ['quads', 'glutes', 'hamstrings', 'calves', 'adductors', 'abductors'],
  core: ['abs', 'spine', 'serratus-anterior'],
};

async function loadRaw({ refresh }) {
  if (existsSync(CACHE_FILE) && !refresh) {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  }

  const response = await fetch(REMOTE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download ${REMOTE_URL} (${response.status} ${response.statusText})`);
  }

  const raw = await response.json();
  await writeFile(CACHE_FILE, JSON.stringify(raw), 'utf8');
  return raw;
}

function buildCatalog(raw) {
  const slugToGroup = new Map();
  for (const [group, muscles] of Object.entries(MUSCLE_GROUPS)) {
    for (const muscle of muscles) {
      slugToGroup.set(muscle, group);
    }
  }

  // Instruction strings repeat across the whole dataset (only ~50 unique), so they
  // are interned into a lookup table and referenced by index. This keeps the
  // bundled catalogue around 200 KB instead of well over a megabyte.
  const stepTable = [];
  const stepIndex = new Map();
  const internStep = (text) => {
    const existing = stepIndex.get(text);
    if (existing !== undefined) {
      return existing;
    }
    const index = stepTable.length;
    stepTable.push(text);
    stepIndex.set(text, index);
    return index;
  };

  const exercises = [];
  const seenSlugs = new Set();
  const skipped = { unknownMuscle: 0, duplicate: 0, noGif: 0 };

  for (const entry of raw.exercises) {
    if (seenSlugs.has(entry.slug)) {
      skipped.duplicate += 1;
      continue;
    }

    const group = slugToGroup.get(entry.muscle);
    if (!group) {
      skipped.unknownMuscle += 1;
      continue;
    }

    const gif = entry.file ?? `${entry.muscle}/${entry.slug}.gif`;
    if (!gif.endsWith('.gif')) {
      skipped.noGif += 1;
      continue;
    }

    seenSlugs.add(entry.slug);
    exercises.push({
      id: entry.slug,
      name: entry.name,
      group,
      target: entry.muscle,
      equipment: entry.equipment,
      category: entry.category,
      gif,
      secondary: entry.secondaryMuscles ?? [],
      steps: (entry.instructions ?? []).map(internStep),
    });
  }

  exercises.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return {
    catalog: {
      version: DATASET_VERSION,
      cdn: `${CDN_BASE}/`,
      attribution: 'Exercise animations: ExerciseGymGifsDB — GIFs © their respective authors.',
      license: 'https://github.com/JahelCuadrado/ExerciseGymGifsDB',
      groups: MUSCLE_GROUPS,
      stepTable,
      exercises,
    },
    skipped,
  };
}

async function main() {
  const refresh = process.argv.includes('--refresh');
  const fromFileIndex = process.argv.indexOf('--from-file');
  const fromFile = fromFileIndex === -1 ? null : process.argv[fromFileIndex + 1];

  let raw;
  if (fromFile) {
    raw = JSON.parse(await readFile(path.resolve(fromFile), 'utf8'));
  } else {
    raw = await loadRaw({ refresh });
  }

  const { catalog, skipped } = buildCatalog(raw);

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(catalog)}\n`, 'utf8');

  const bytes = Buffer.byteLength(JSON.stringify(catalog));
  const perGroup = {};
  for (const exercise of catalog.exercises) {
    perGroup[exercise.group] = (perGroup[exercise.group] ?? 0) + 1;
  }

  console.log(`Wrote ${catalog.exercises.length} exercises -> ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`  size        ${(bytes / 1024).toFixed(0)} KB`);
  console.log(`  step table  ${catalog.stepTable.length} unique strings`);
  console.log(`  per group   ${JSON.stringify(perGroup)}`);
  console.log(`  skipped     ${JSON.stringify(skipped)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
