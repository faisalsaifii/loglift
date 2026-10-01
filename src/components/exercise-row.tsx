import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { Chip } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { getEquipmentLabel, getGifUrl, type Exercise } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';

type ExerciseRowProps = {
  exercise: Exercise;
  onPress: () => void;
  isAdded: boolean;
  /** Best PR for the exercise, already converted to the display unit. */
  best?: { text: string; reps: number };
  /** Body part, shown when results can span more than one muscle. */
  groupLabel?: string;
};

export function ExerciseRow({ exercise, onPress, isAdded, best, groupLabel }: ExerciseRowProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}. ${isAdded ? 'In your library.' : 'Not in your library.'}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <View style={[styles.thumb, { backgroundColor: colors.surfaceSunken }]}>
        <Image
          source={{ uri: getGifUrl(exercise) }}
          style={styles.image}
          contentFit="cover"
          transition={180}
          recyclingKey={exercise.id}
          accessibilityIgnoresInvertColors
          // A long list would otherwise animate dozens of GIFs at once, which
          // tanks scrolling on a phone. The detail screen plays them.
          autoplay={false}
        />
        {isAdded ? (
          <View style={[styles.badge, { backgroundColor: colors.text }]}>
            <Icon name="check" size={11} color={colors.onAccent} weight="bold" />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Txt variant="subheading" numberOfLines={2}>
          {exercise.name}
        </Txt>
        <View style={styles.meta}>
          {groupLabel ? <Chip label={groupLabel} filled /> : null}
          <Chip label={getEquipmentLabel(exercise.equipment)} />
          {best ? (
            <Txt variant="caption" tone="secondary" style={styles.metaBest}>
              {best.text} × {best.reps}
            </Txt>
          ) : null}
        </View>
      </View>

      <Icon name="chevron" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radii.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 18,
    height: 18,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaBest: {
    marginLeft: 'auto',
  },
});
