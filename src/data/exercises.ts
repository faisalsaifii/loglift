import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

import type { IconName } from '@/components/icon';
import { MusclePalette } from '@/constants/theme';
import catalog from '@/data/exercises.json';

export type MuscleGroupId = keyof typeof MusclePalette;

export type ExerciseCategory =
  | 'strength'
  | 'stretching'
  | 'plyometrics'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'band'
  | 'kettlebell'
  | 'smith'
  | 'ez-bar'
  | 'lever'
  | 'other';

export type Exercise = {
  /** URL-safe, unique across the catalogue. Doubles as the route param. */
  id: string;
  name: string;
  /** The body part this exercise is filed under in the app. */
  group: MuscleGroupId;
  /** Fine-grained muscle from the source dataset, e.g. `pectorals`. */
  target: string;
  equipment: Equipment;
  category: ExerciseCategory;
  /** Path relative to the catalogue CDN base, e.g. `pectorals/barbell-curl.gif`. */
  gif: string;
  secondary: string[];
  /** Indices into the catalogue's interned `stepTable`. */
  steps: number[];
};

type RawCatalog = {
  version: string;
  cdn: string;
  attribution: string;
  license: string;
  groups: Record<MuscleGroupId, string[]>;
  stepTable: string[];
  exercises: Exercise[];
};

const raw = catalog as unknown as RawCatalog;

export const CATALOG_CDN = raw.cdn;
export const CATALOG_VERSION = raw.version;
export const CATALOG_ATTRIBUTION = raw.attribution;
export const CATALOG_LICENSE = raw.license;

const stepTable = raw.stepTable;
const exercises = raw.exercises;

const byId = new Map<string, Exercise>();
const byGroup = new Map<MuscleGroupId, Exercise[]>();
// Pre-lowercased haystacks so filtering never allocates during a keystroke.
const searchIndex = new Map<string, string>();

function searchable(exercise: Exercise) {
  return [
    exercise.name,
    exercise.equipment,
    exercise.target,
    exercise.group,
    ...exercise.secondary,
  ]
    .join(' ')
    .toLowerCase();
}

for (const [group] of Object.entries(MusclePalette) as [
  MuscleGroupId,
  unknown,
][]) {
  byGroup.set(group, []);
}

for (const exercise of exercises) {
  byId.set(exercise.id, exercise);
  byGroup.get(exercise.group)?.push(exercise);
  searchIndex.set(exercise.id, searchable(exercise));
}

export const ALL_EXERCISES = exercises;

export function getExercise(id: string | undefined): Exercise | undefined {
  return id ? byId.get(id) : undefined;
}

export function getExercisesForGroup(group: MuscleGroupId): Exercise[] {
  return byGroup.get(group) ?? [];
}

export function getGifUrl(exercise: Exercise): string {
  return `${CATALOG_CDN}${exercise.gif}`;
}

/**
 * Ranks `pool` against `needle`: exact name, then name prefix, then any
 * metadata hit (equipment, target, group, secondary muscles).
 */
export function rankMatches(pool: readonly Exercise[], needle: string): Exercise[] {
  const exact: Exercise[] = [];
  const startsWith: Exercise[] = [];
  const contains: Exercise[] = [];

  for (const exercise of pool) {
    const name = exercise.name.toLowerCase();

    if (name === needle) {
      exact.push(exercise);
      continue;
    }

    const haystack = searchIndex.get(exercise.id);
    if (!haystack) {
      continue;
    }

    if (name.startsWith(needle)) {
      startsWith.push(exercise);
    } else if (haystack.includes(needle)) {
      contains.push(exercise);
    }
  }

  return [...exact, ...startsWith, ...contains];
}

/**
 * Returns at most `limit` matches from a single body part, best-first. The cap
 * keeps long lists (Legs has 286 movements) from being a scrolling chore.
 */
export function searchExercises(
  group: MuscleGroupId,
  query: string,
  options?: { limit?: number },
): Exercise[] {
  const pool = getExercisesForGroup(group);
  const needle = query.trim().toLowerCase();

  if (!needle) {
    const limit = options?.limit;
    return limit === undefined ? pool : pool.slice(0, limit);
  }

  const limit = options?.limit ?? 60;
  return rankMatches(pool, needle).slice(0, limit);
}

/**
 * Searches the whole catalogue rather than one body part, so "bench" finds the
 * chest press and the barbell row alike. Ranking is global, so results are not
 * clustered by muscle.
 */
export function searchAllExercises(
  query: string,
  options?: { limit?: number },
): Exercise[] {
  const limit = options?.limit ?? 80;
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return [];
  }

  return rankMatches(exercises, needle).slice(0, limit);
}

/** The catalogue's generic, auto-generated steps for an exercise. */
export function getGenericSteps(exercise: Exercise): string[] {
  return exercise.steps.map((index) => stepTable[index]).filter(Boolean);
}

export const MUSCLE_GROUP_IDS = Object.keys(MusclePalette) as MuscleGroupId[];

export type MuscleGroup = {
  id: MuscleGroupId;
  label: string;
  sf: SFSymbol;
  md: AndroidSymbol;
  light: string;
  dark: string;
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: 'chest',
    label: 'Chest',
    sf: 'heart.fill',
    md: 'favorite',
    light: MusclePalette.chest.light,
    dark: MusclePalette.chest.dark,
  },
  {
    id: 'back',
    label: 'Back',
    sf: 'figure.rower',
    md: 'airline_seat_flat',
    light: MusclePalette.back.light,
    dark: MusclePalette.back.dark,
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    sf: 'figure.strengthtraining.traditional',
    md: 'accessibility_new',
    light: MusclePalette.shoulders.light,
    dark: MusclePalette.shoulders.dark,
  },
  {
    id: 'biceps',
    label: 'Biceps',
    sf: 'bolt.fill',
    md: 'flash_on',
    light: MusclePalette.biceps.light,
    dark: MusclePalette.biceps.dark,
  },
  {
    id: 'triceps',
    label: 'Triceps',
    sf: 'figure.strengthtraining.functional',
    md: 'sports_gymnastics',
    light: MusclePalette.triceps.light,
    dark: MusclePalette.triceps.dark,
  },
  {
    id: 'legs',
    label: 'Legs',
    sf: 'figure.run',
    md: 'hiking',
    light: MusclePalette.legs.light,
    dark: MusclePalette.legs.dark,
  },
  {
    id: 'core',
    label: 'Core',
    sf: 'figure.core.training',
    md: 'self_improvement',
    light: MusclePalette.core.light,
    dark: MusclePalette.core.dark,
  },
];

const muscleGroupById = new Map(
  MUSCLE_GROUPS.map((group) => [group.id, group]),
);

export function getMuscleGroup(
  id: string | undefined,
): MuscleGroup | undefined {
  return id ? muscleGroupById.get(id as MuscleGroupId) : undefined;
}

export type CollectionId = 'full-body' | 'push' | 'pull';

export type ExerciseCollection = {
  id: CollectionId;
  label: string;
  /** `IconName` for the home-page row. */
  icon: IconName;
  /**
   * Anatomical groups the collection spans, or `null` for the whole catalogue.
   * Push and pull are an overlay on the muscle grouping, not a second one: the
   * source data files every movement under exactly one body part, so a
   * collection is the union of the groups it names.
   */
  groups: readonly MuscleGroupId[] | null;
};

export const COLLECTIONS: ExerciseCollection[] = [
  {
    id: 'full-body',
    label: 'Full body',
    icon: 'fullBody',
    groups: null,
  },
  {
    id: 'push',
    label: 'Push',
    icon: 'push',
    groups: ['chest', 'shoulders', 'triceps'],
  },
  {
    id: 'pull',
    label: 'Pull',
    icon: 'pull',
    groups: ['back', 'biceps'],
  },
];

const collectionById = new Map(
  COLLECTIONS.map((collection) => [collection.id, collection]),
);

export function getCollection(
  id: string | undefined,
): ExerciseCollection | undefined {
  return id ? collectionById.get(id as CollectionId) : undefined;
}

/**
 * One pool per collection, built once at module load. Filtering all 1292
 * exercises per collection on every keystroke would otherwise allocate a fresh
 * array for every character typed.
 */
const collectionPool = new Map<CollectionId, Exercise[]>();

for (const collection of COLLECTIONS) {
  const { groups } = collection;
  collectionPool.set(
    collection.id,
    groups === null
      ? exercises
      : exercises.filter((exercise) => groups.includes(exercise.group)),
  );
}

export function getExercisesForCollection(id: CollectionId): Exercise[] {
  return collectionPool.get(id) ?? [];
}

/**
 * Browses a collection as one list. Unlike `searchAllExercises` — which drives a
 * query-first screen and so returns nothing until you type — a blank query
 * returns the whole collection in its bundled (alphabetical) order, because
 * these screens are meant to be browsed before they are searched. Uncapped by
 * default: the caller virtualises the result, whereas the per-muscle screens
 * render a bounded list inside a `ScrollView`.
 */
export function browseCollection(
  id: CollectionId,
  query: string,
  options?: { limit?: number },
): Exercise[] {
  const pool = getExercisesForCollection(id);
  const limit = options?.limit ?? pool.length;
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return pool.slice(0, limit);
  }

  return rankMatches(pool, needle).slice(0, limit);
}

const MUSCLE_LABELS: Record<string, string> = {
  pectorals: 'Pectorals',
  lats: 'Latissimus dorsi',
  'upper-back': 'Upper back',
  traps: 'Trapezius',
  spine: 'Spinal erectors',
  delts: 'Deltoids',
  biceps: 'Biceps',
  forearms: 'Forearms',
  triceps: 'Triceps',
  quads: 'Quadriceps',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
  abs: 'Abdominals',
  'serratus-anterior': 'Serratus anterior',
  'levator-scapulae': 'Levator scapulae',
  cardio: 'Cardio',
};

export function getMuscleLabel(slug: string): string {
  return MUSCLE_LABELS[slug] ?? toTitleCase(slug);
}

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  band: 'Band',
  kettlebell: 'Kettlebell',
  smith: 'Smith machine',
  'ez-bar': 'EZ bar',
  lever: 'Lever machine',
  other: 'Other',
};

export function getEquipmentLabel(equipment: Equipment): string {
  return EQUIPMENT_LABELS[equipment] ?? toTitleCase(equipment);
}

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'Strength',
  stretching: 'Stretching',
  plyometrics: 'Plyometrics',
  cardio: 'Cardio',
};

export function getCategoryLabel(category: ExerciseCategory): string {
  return CATEGORY_LABELS[category] ?? toTitleCase(category);
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Conjunctions and prepositions carry no movement information once the
 * equipment is known, but they do match: "Barbell Bench Press - Narrow Grip"
 * and "Barbell Bench Press" both contain "press with", so leaving them in makes
 * every similarity query drift towards unrelated names.
 */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'by',
  'from',
  'in',
  'of',
  'on',
  'per',
  'the',
  'to',
  'vs',
  'versus',
  'with',
]);

/**
 * Every word that appears in an equipment label, flattened — "Smith machine"
 * contributes both `smith` and `machine`. Names in this catalogue lead with
 * their equipment, so these words are noise in a similarity query.
 */
const EQUIPMENT_WORDS = new Set(
  Object.values(EQUIPMENT_LABELS).flatMap((label) =>
    label.toLowerCase().split(' '),
  ),
);

/**
 * A one-word query like "deadlift" or "curl" is only trusted while it is
 * selective in both directions: 40 matches is most of a body part, and three or
 * fewer says nothing — the target/equipment fallback is the better signal for
 * names like "Air Bike". 40 is roughly the per-body-part browse cap the
 * browsing screens already use.
 */
const BARE_WORD_MIN_MATCHES = 3;
const BARE_WORD_MAX_MATCHES = 40;

/**
 * Movements that share `exercise`'s body part and a name phrase with it, ranked
 * best-first and excluding itself.
 *
 * The query is the exercise name stripped of equipment words, conjunctions and
 * bare numbers — "Barbell Bench Press - Narrow Grip" reduces to "bench press
 * narrow grip", and "3 4 Sit Up" to "sit up", since the leading digits are a rep
 * scheme rather than a movement. Trailing words are then dropped one at a time
 * until the phrase returns a useful handful, so a precise name such as
 * "Barbell Bench Press" still surfaces the other bench presses instead of
 * nothing at all.
 *
 * When no phrase is distinctive enough — "Barbell Deadlift" has a single usable
 * word, and "Air Bike" has nothing left — it falls back to movements filed under
 * the same target muscle with the same equipment, which is what makes them
 * variations of one another.
 */
export function getSimilarExercises(
  exercise: Exercise,
  options?: { limit?: number },
): Exercise[] {
  const limit = options?.limit ?? 6;
  const words = exercise.name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (word) =>
        word &&
        !/^\d+$/.test(word) &&
        !STOP_WORDS.has(word) &&
        !EQUIPMENT_WORDS.has(word),
    );

  const pool = getExercisesForGroup(exercise.group);
  const seen = new Set([exercise.id]);
  const similar: Exercise[] = [];

  const take = (match: Exercise) => {
    if (seen.has(match.id) || similar.length >= limit) {
      return;
    }
    seen.add(match.id);
    similar.push(match);
  };

  for (let end = words.length; end >= 1; end -= 1) {
    const matches = rankMatches(pool, words.slice(0, end).join(' '));
    if (
      end === 1 &&
      (matches.length < BARE_WORD_MIN_MATCHES ||
        matches.length > BARE_WORD_MAX_MATCHES)
    ) {
      break;
    }
    for (const match of matches) {
      take(match);
    }
    if (similar.length >= 3) {
      return similar;
    }
  }

  for (const match of pool) {
    if (
      match.target === exercise.target &&
      match.equipment === exercise.equipment
    ) {
      take(match);
    }
  }

  return similar;
}

// Re-exported so data consumers can type a `MuscleGroupId` from the palette alone.
export { MusclePalette };
