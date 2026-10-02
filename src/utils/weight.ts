export type WeightUnit = 'kg' | 'lb';

export const WEIGHT_UNITS: readonly WeightUnit[] = ['kg', 'lb'];

export const UNIT_LABELS: Record<WeightUnit, string> = {
  kg: 'kg',
  lb: 'lb',
};

export const UNIT_NAMES: Record<WeightUnit, string> = {
  kg: 'Kilograms',
  lb: 'Pounds',
};

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) {
    return weight;
  }
  return from === 'kg' ? kgToLb(weight) : lbToKg(weight);
}

/**
 * Weights are stored as kilograms — the SI base — so switching the display unit
 * is a pure conversion and never drifts the history.
 */
export function toKg(weight: number, unit: WeightUnit): number {
  return unit === 'kg' ? weight : lbToKg(weight);
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}

/** Plate-friendly rounding: whole numbers, 0.5 steps below 20, 0.1 below 10. */
export function roundWeight(weight: number): number {
  if (weight >= 20) {
    return Math.round(weight);
  }
  if (weight >= 10) {
    return Math.round(weight * 2) / 2;
  }
  return Math.round(weight * 10) / 10;
}

export function formatWeight(weight: number, unit: WeightUnit): string {
  const rounded = roundWeight(weight);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} ${unit}`;
}

/**
 * Volume is a sum over every logged set, so it runs into four figures where
 * `roundWeight`'s 0.1/0.5 steps would print noise. Whole units past 1,000.
 */
export function formatVolume(volumeKg: number, unit: WeightUnit): string {
  const converted = fromKg(volumeKg, unit);
  const rounded = Math.abs(converted) >= 1000 ? Math.round(converted) : Math.round(converted * 10) / 10;
  return `${rounded.toLocaleString()} ${unit}`;
}

/**
 * Epley's one-rep-max estimate for a single set: `weight × (1 + reps / 30)`.
 *
 * The app records no RPE, so this is the only strength signal it can derive
 * beyond raw weight, and it is most accurate in the 3–10 rep range — which is
 * why every surface that shows it labels it an estimate.
 */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (!(weightKg > 0) || !(reps > 0)) {
    return 0;
  }
  return weightKg * (1 + reps / 30);
}

/** Parses user input that may or may not carry a unit suffix (`"80"`, `"80kg"`). */
export function parseWeight(input: string, fallbackUnit: WeightUnit): number | null {
  const cleaned = input.trim().toLowerCase().replace(/,/g, '.');
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(kg|kgs|lb|lbs)?$/);
  if (!match) {
    return null;
  }
  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  const unit: WeightUnit = match[2]?.startsWith('k') ? 'kg' : match[2] ? 'lb' : fallbackUnit;
  return { kg: value, lb: lbToKg(value) }[unit];
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  return formatDate(iso);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
