import { Stack } from 'expo-router';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { UnitSelector } from '@/components/unit-selector';
import { Card, Chip } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import {
  ALL_EXERCISES,
  CATALOG_ATTRIBUTION,
  CATALOG_LICENSE,
  CATALOG_VERSION,
  MUSCLE_GROUPS,
} from '@/data/exercises';
import { CURATED_CUE_COUNT } from '@/data/form-cues';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary } from '@/store/library';
import { pluralize, UNIT_NAMES } from '@/utils/weight';

export default function SettingsScreen() {
  const colors = useTheme();
  const { unit, setUnit, clearAll, stats } = useLibrary();

  const confirmClear = () => {
    const message =
      'This removes every exercise from your library and all logged sets. It cannot be undone.';
    if (Platform.OS === 'web') {
      clearAll();
      return;
    }
    Alert.alert('Clear all data?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear everything', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <Screen>
      <Stack.Title>Settings</Stack.Title>

      <Card>
        <Txt variant="heading">Weight unit</Txt>
        <Txt variant="body" tone="secondary">
          Sets are stored in kilograms, so switching here only changes how they are displayed.
        </Txt>
        <UnitSelector
          value={unit}
          onChange={setUnit}
          labels={UNIT_NAMES}
          style={styles.unitSelector}
          testID="settings-weight-unit"
        />
      </Card>

      <Card>
        <Txt variant="heading">Your data</Txt>
        <Txt variant="body" tone="secondary">
          {pluralize(stats.totalExercises, 'exercise')} tracked ·{' '}
          {pluralize(stats.totalPrs, 'set')} logged
        </Txt>
        <Pressable
          accessibilityRole="button"
          onPress={confirmClear}
          style={({ pressed }) => [styles.dangerRow, pressed && styles.pressed]}>
          <Icon name="reset" size={17} color={colors.danger} />
          <Txt variant="subheading" tone="danger" style={styles.dangerText}>
            Clear all data
          </Txt>
        </Pressable>
      </Card>

      <Card>
        <Txt variant="heading">Exercise library</Txt>
        <Txt variant="body" tone="secondary">
          {ALL_EXERCISES.length} movements across {MUSCLE_GROUPS.length} body parts, with{' '}
          {CURATED_CUE_COUNT} hand-written form cue sets.
        </Txt>
        <View style={styles.groups}>
          {MUSCLE_GROUPS.map((group) => (
            <Chip key={group.id} label={group.label} />
          ))}
        </View>
      </Card>

      <Card>
        <Txt variant="heading">About</Txt>
        <Txt variant="body" tone="secondary">
          {CATALOG_ATTRIBUTION}
        </Txt>
        <Txt variant="caption" tone="secondary">
          Catalogue version {CATALOG_VERSION}
        </Txt>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            Linking.openURL(CATALOG_LICENSE).catch(() => {});
          }}
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
          <Icon name="link" size={16} color={colors.accent} />
          <Txt variant="label" tone="accent" style={styles.dangerText}>
            Source dataset &amp; licence
          </Txt>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  unitSelector: {
    marginTop: Spacing.three,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  dangerText: {
    flex: 1,
  },
  groups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
