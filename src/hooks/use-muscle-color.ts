import { useColorScheme } from '@/hooks/use-color-scheme';

import { getMuscleGroup, type MuscleGroupId } from '@/data/exercises';

/** Resolves a body part's accent colour for the active appearance. */
export function useMuscleColor(id: MuscleGroupId | undefined): string {
  const scheme = useColorScheme();
  const group = getMuscleGroup(id);
  return (scheme === 'dark' ? group?.dark : group?.light) ?? '#6D4AFF';
}
