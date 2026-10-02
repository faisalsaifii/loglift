import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { Card } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { COLLECTIONS, MUSCLE_GROUPS } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary } from '@/store/library';
import { pluralize } from '@/utils/weight';

export default function MusclesScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { stats, isReady } = useLibrary();

  const summary = isReady
    ? `${pluralize(stats.totalExercises, 'exercise')} tracked · ${pluralize(stats.totalPrs, 'set')} logged`
    : 'Loading your library…';

  return (
    <>
      <Stack.Title>Muscles</Stack.Title>

      <Screen>
        <Txt variant="caption" tone="secondary">
          {summary}
        </Txt>

        <Card padded={false}>
          {/*
            Collections come first because each is the union of the muscle groups
            listed below it — `Full body` spans all of them, `Push` and `Pull`
            split the upper body. Their counts are summed across the groups they
            cover, not read from a single `byGroup` slice.
          */}
          {COLLECTIONS.map((collection, index) => (
            <View key={collection.id}>
              {index > 0 ? (
                <View
                  style={[styles.separator, { backgroundColor: colors.border }]}
                />
              ) : null}
              <MuscleRow
                label={collection.label}
                icon={collection.icon}
                count={
                  collection.groups
                    ? collection.groups.reduce(
                        (total, group) =>
                          total + (stats.byGroup[group]?.exercises ?? 0),
                        0,
                      )
                    : stats.totalExercises
                }
                onPress={() =>
                  router.push({
                    pathname: '/collection/[collection]',
                    params: { collection: collection.id },
                  })
                }
              />
            </View>
          ))}
          {MUSCLE_GROUPS.map((group) => (
            <View key={group.id}>
              <View
                style={[styles.separator, { backgroundColor: colors.border }]}
              />
              <MuscleRow
                label={group.label}
                icon={group.id}
                count={stats.byGroup[group.id]?.exercises ?? 0}
                onPress={() =>
                  router.push({
                    pathname: '/muscle/[muscle]',
                    params: { muscle: group.id },
                  })
                }
              />
            </View>
          ))}
        </Card>
      </Screen>
    </>
  );
}

type MuscleRowProps = {
  label: string;
  icon: IconName;
  count: number;
  onPress: () => void;
};

function MuscleRow({ label, icon, count, onPress }: MuscleRowProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${pluralize(count, 'exercise')} added.`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.surfaceSunken }]}>
        <Icon name={icon} size={18} color={colors.text} weight="semibold" />
      </View>
      <Txt variant="subheading" numberOfLines={1} style={styles.rowLabel}>
        {label}
      </Txt>
      <Txt
        variant="caption"
        numberOfLines={1}
        style={[
          styles.rowCount,
          { color: count > 0 ? colors.textSecondary : colors.textTertiary },
        ]}
      >
        {count > 0 ? pluralize(count, 'exercise') : 'None yet'}
      </Txt>
      <Icon name="chevron" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    // Inset to the label's left edge, the way a native grouped list separates rows.
    marginLeft: Spacing.four + 30 + Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  rowCount: {
    maxWidth: '40%',
  },
  pressed: {
    opacity: 0.6,
  },
});
