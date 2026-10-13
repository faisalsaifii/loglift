import type { Food, Nutrients } from '@/data/foods';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEALS: readonly { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
];

/**
 * One logged food. Nutrition is stored as the totals for the amount eaten, so
 * editing or deleting a custom food later never rewrites what was already logged.
 */
export type FoodEntry = Nutrients & {
  id: string;
  /** Local calendar day, `YYYY-MM-DD`. */
  day: string;
  meal: MealType;
  name: string;
  grams: number;
  /** ISO timestamp, for ordering within a meal. */
  loggedAt: string;
};

export type DietGoals = {
  calories: number;
  protein: number;
};

export const DEFAULT_GOALS: DietGoals = { calories: 2000, protein: 100 };

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** A local-time day key. `toISOString` would shift late-evening meals to the next day. */
export function dayKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDay(key: string, days: number): string {
  const date = parseDayKey(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

export function formatDay(key: string): string {
  const today = dayKey();
  if (key === today) {
    return 'Today';
  }
  if (key === shiftDay(today, -1)) {
    return 'Yesterday';
  }
  if (key === shiftDay(today, 1)) {
    return 'Tomorrow';
  }
  const date = parseDayKey(key);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

const ZERO: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

export function sumNutrients(entries: readonly Nutrients[]): Nutrients {
  return entries.reduce<Nutrients>(
    (total, entry) => ({
      kcal: total.kcal + entry.kcal,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat,
      fiber: total.fiber + entry.fiber,
    }),
    ZERO
  );
}

/** Calories to the nearest whole number; macros to one decimal, trimming a trailing `.0`. */
export function formatKcal(value: number): string {
  return String(Math.round(value));
}

export function formatGrams(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} g`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function nonNegative(value: unknown): number {
  return isFiniteNumber(value) && value > 0 ? value : 0;
}

const MEAL_VALUES = new Set<string>(MEALS.map((meal) => meal.value));

export function sanitiseNutrients(value: Partial<Nutrients> | undefined): Nutrients {
  return {
    kcal: nonNegative(value?.kcal),
    protein: nonNegative(value?.protein),
    carbs: nonNegative(value?.carbs),
    fat: nonNegative(value?.fat),
    fiber: nonNegative(value?.fiber),
  };
}

export function sanitiseFoodLog(value: unknown, createId: () => string): FoodEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const entries: FoodEntry[] = [];
  for (const raw of value as Partial<FoodEntry>[]) {
    if (
      !raw ||
      typeof raw !== 'object' ||
      typeof raw.name !== 'string' ||
      !raw.name.trim() ||
      typeof raw.day !== 'string' ||
      !DAY_PATTERN.test(raw.day) ||
      !isFiniteNumber(raw.grams) ||
      raw.grams <= 0
    ) {
      continue;
    }
    entries.push({
      ...sanitiseNutrients(raw),
      id: typeof raw.id === 'string' ? raw.id : createId(),
      day: raw.day,
      meal: typeof raw.meal === 'string' && MEAL_VALUES.has(raw.meal) ? raw.meal : 'snack',
      name: raw.name.trim().slice(0, 80),
      grams: raw.grams,
      loggedAt:
        typeof raw.loggedAt === 'string' && !Number.isNaN(new Date(raw.loggedAt).getTime())
          ? raw.loggedAt
          : new Date(0).toISOString(),
    });
  }
  return entries;
}

export function sanitiseCustomFoods(value: unknown, createId: () => string): Food[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const foods: Food[] = [];
  for (const raw of value as Partial<Food>[]) {
    if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string' || !raw.name.trim()) {
      continue;
    }
    const per100g = sanitiseNutrients(raw.per100g);
    const servingGrams = raw.serving?.grams;
    foods.push({
      id: typeof raw.id === 'string' ? raw.id : createId(),
      name: raw.name.trim().slice(0, 80),
      category: 'My foods',
      per100g,
      serving: {
        label: '1 serving',
        grams: isFiniteNumber(servingGrams) && servingGrams > 0 ? servingGrams : 100,
      },
      custom: true,
    });
  }
  return foods;
}

export function sanitiseGoals(value: unknown): DietGoals {
  const candidate = (value && typeof value === 'object' ? value : {}) as Partial<DietGoals>;
  return {
    calories:
      isFiniteNumber(candidate.calories) && candidate.calories > 0
        ? candidate.calories
        : DEFAULT_GOALS.calories,
    protein:
      isFiniteNumber(candidate.protein) && candidate.protein > 0
        ? candidate.protein
        : DEFAULT_GOALS.protein,
  };
}
