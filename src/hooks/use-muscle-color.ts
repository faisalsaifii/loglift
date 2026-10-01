import { useColorScheme } from '@/hooks/use-color-scheme';

import { getMuscleGroup, type MuscleGroupId } from '@/data/exercises';

/**
 * Resolves a body part's accent for the active appearance. Every group now maps
 * to the same neutral tint, so this exists only to keep call sites and the
 * catalogue shape intact — reintroducing per-muscle hue means editing
 * `MusclePalette` in `@/constants/theme`.
 */
export function useMuscleColor(id: MuscleGroupId | undefined): string {
  const scheme = useColorScheme();
  const group = getMuscleGroup(id);
  return (scheme === 'dark' ? group?.dark : group?.light) ?? '#000000';
}
