import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { Button, Card, Chip, EmptyState } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import {
  getCategoryLabel,
  getEquipmentLabel,
  getExercise,
  getGenericSteps,
  getGifUrl,
  getMuscleGroup,
  getMuscleLabel,
} from '@/data/exercises';
import { getFormCues } from '@/data/form-cues';
import { useMuscleColor } from '@/hooks/use-muscle-color';
import { useTheme } from '@/hooks/use-theme';
import { useExerciseLog, useLibrary } from '@/store/library';
import { formatRelativeDate, formatWeight, fromKg, pluralize } from '@/utils/weight';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const [gifPaused, setGifPaused] = useState(false);

  const exercise = getExercise(id);
  const { isAdded, toggleAdded, prs, best } = useExerciseLog(exercise?.id);
  const { unit, removePr } = useLibrary();
  const accent = useMuscleColor(exercise?.group);
  const group = getMuscleGroup(exercise?.group);

  if (!exercise) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Exercise' }} />
        <EmptyState
          icon="search"
          title="Exercise not found"
          message="This exercise is no longer in the catalogue."
        />
      </Screen>
    );
  }

  const curatedCues = getFormCues(exercise.name);
  const cues = curatedCues ?? getGenericSteps(exercise);

  const confirmRemove = (prId: string, text: string) => {
    if (Platform.OS === 'web') {
      removePr(exercise.id, prId);
      return;
    }
    Alert.alert('Remove this set?', text, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePr(exercise.id, prId) },
    ]);
  };

  return (
    <Screen contentStyle={styles.content}>
      <Stack.Screen options={{ title: exercise.name }} />
      {group ? (
        <Txt variant="body" tone="secondary">
          {group.label}
        </Txt>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={isAdded ? 'In your library' : 'Add to library'}
          icon={isAdded ? 'check' : 'plus'}
          variant={isAdded ? 'secondary' : 'primary'}
          accentColor={accent}
          onPress={() => toggleAdded()}
          style={styles.actionButton}
        />
        <Button
          label="Log a set"
          icon="trophy"
          variant={isAdded ? 'primary' : 'secondary'}
          accentColor={accent}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.push({ pathname: '/log-pr', params: { exercise: exercise.id } });
          }}
          style={styles.actionButton}
        />
      </View>

      <Card padded={false}>
        <View style={[styles.gifStage, { backgroundColor: colors.surfaceSunken }]}>
          <Image
            source={{ uri: getGifUrl(exercise) }}
            style={styles.gif}
            contentFit="contain"
            autoplay={!gifPaused}
            transition={200}
            recyclingKey={exercise.id}
            accessibilityIgnoresInvertColors
            accessibilityLabel={`Animated demonstration of ${exercise.name}`}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={gifPaused ? 'Play animation' : 'Pause animation'}
            onPress={() => setGifPaused((paused) => !paused)}
            style={({ pressed }) => [
              styles.gifToggle,
              { backgroundColor: colors.overlay },
              pressed && styles.pressed,
            ]}>
            <Icon
              name={gifPaused ? 'play' : 'pause'}
              size={16}
              color={colors.text}
              weight="semibold"
            />
            <Txt variant="caption" style={{ color: colors.text }}>
              {gifPaused ? 'Play' : 'Pause'}
            </Txt>
          </Pressable>
        </View>
      </Card>

      <View style={styles.chips}>
        <Chip label={getEquipmentLabel(exercise.equipment)} icon="grid" />
        <Chip label={getCategoryLabel(exercise.category)} />
        <Chip label={group?.label ?? ''} color={accent} filled />
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <Icon name="target" size={17} color={colors.textSecondary} />
          <Txt variant="heading">Muscles worked</Txt>
        </View>
        <View style={styles.muscleList}>
          <View style={styles.muscleRow}>
            <Txt variant="label" tone="secondary" style={styles.muscleLabel}>
              Primary
            </Txt>
            <Chip label={getMuscleLabel(exercise.target)} color={accent} filled />
          </View>
          {exercise.secondary.length > 0 ? (
            <View style={styles.muscleRow}>
              <Txt variant="label" tone="secondary" style={styles.muscleLabel}>
                Also
              </Txt>
              <View style={styles.secondaryChips}>
                {exercise.secondary.map((muscle) => (
                  <Chip key={muscle} label={getMuscleLabel(muscle)} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Icon name="sparkle" size={17} color={colors.textSecondary} />
          <Txt variant="heading">Form cues</Txt>
          {!curatedCues ? (
            <Txt variant="caption" tone="secondary" style={styles.sourceTag}>
              from the source
            </Txt>
          ) : null}
        </View>
        <View style={styles.cueList}>
          {cues.map((cue, index) => (
            <View key={cue} style={styles.cue}>
              <View style={[styles.cueIndex, { backgroundColor: colors.surfaceSunken }]}>
                <Txt variant="caption" tone="secondary" style={styles.cueIndexLabel}>
                  {index + 1}
                </Txt>
              </View>
              <Txt variant="body" tone="secondary" style={styles.cueText}>
                {cue}
              </Txt>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Icon name="trophy" size={17} color={colors.textSecondary} />
          <Txt variant="heading">Your records</Txt>
        </View>

        {best ? (
          <View style={styles.bestBlock}>
            <Txt variant="caption" tone="secondary" eyebrow>
              Heaviest set
            </Txt>
            <Txt variant="display">
              {formatWeight(fromKg(best.weightKg, unit), unit)}
            </Txt>
            <Txt variant="label" tone="secondary">
              {pluralize(best.reps, 'rep')} · {formatRelativeDate(best.date)}
            </Txt>
          </View>
        ) : (
          <Txt variant="body" tone="secondary">
            No sets logged yet. Add your first one to start the history.
          </Txt>
        )}

        {prs.length > 0 ? (
          <View style={styles.history}>
            <Txt variant="label" tone="secondary" style={styles.historyHeader}>
              {pluralize(prs.length, 'set')} logged
            </Txt>
            {prs.map((pr) => (
              <Pressable
                key={pr.id}
                accessibilityRole="button"
                accessibilityLabel={`Remove set of ${formatWeight(fromKg(pr.weightKg, unit), unit)} for ${pr.reps} reps`}
                onPress={() =>
                  confirmRemove(
                    pr.id,
                    `${formatWeight(fromKg(pr.weightKg, unit), unit)} × ${pr.reps} on ${formatRelativeDate(pr.date)}`
                  )
                }
                style={({ pressed }) => [
                  styles.historyRow,
                  { borderTopColor: colors.border },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.historyMain}>
                  <Txt variant="mono">
                    {formatWeight(fromKg(pr.weightKg, unit), unit)} × {pr.reps}
                  </Txt>
                  <Txt variant="caption" tone="secondary">
                    {formatRelativeDate(pr.date)}
                  </Txt>
                </View>
                <Icon name="trash" size={16} color={colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  gifStage: {
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  gifToggle: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radii.pill,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  sourceTag: {
    marginLeft: 'auto',
  },
  muscleList: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  muscleLabel: {
    width: 64,
    paddingTop: 6,
  },
  secondaryChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cueList: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  cue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  cueIndex: {
    width: 22,
    height: 22,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueIndexLabel: {
    fontWeight: '700',
  },
  cueText: {
    flex: 1,
  },
  bestBlock: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.one,
  },
  history: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  historyHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  historyMain: {
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
