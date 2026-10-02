
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState, memo } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ExerciseRow } from '@/components/exercise-row';
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
  getMuscleLabel,
  getSimilarExercises,
} from '@/data/exercises';
import { getFormCues } from '@/data/form-cues';
import { useMuscleColor } from '@/hooks/use-muscle-color';
import { useTheme } from '@/hooks/use-theme';
import { useExerciseLog, useLibrary, type PrEntry } from '@/store/library';
import {
  estimateOneRepMax,
  formatDate,
  formatRelativeDate,
  formatVolume,
  formatWeight,
  fromKg,
  pluralize,
  type WeightUnit,
} from '@/utils/weight';

/**
 * Sets shown before the history list is expanded. A heavily trained lift can
 * accumulate hundreds of entries, and every one of them is a full row inside a
 * `ScrollView` — which does not recycle the way a `FlatList` would.
 */
const COLLAPSED_SETS = 8;

/**
 * `Stack.Toolbar` only exists on Android and iOS. The web stack renders no
 * toolbar at all, so web keeps the in-content row of design-system buttons
 * rather than showing an empty bar.
 */
// const USES_NATIVE_CHROME = Platform.OS !== 'web';

/**
 * `Alert` only exists on native, so web falls back to the browser's own confirm
 * dialog. Every destructive path here drops recorded history, so neither
 * platform is allowed to skip the confirmation.
 */
function confirmDestructive(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof globalThis.confirm === 'function' &&
        globalThis.confirm(`${title}\n\n${message}`),
    );
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

/**
 * Everything the records card shows, derived once per history change. `prs`
 * arrives heaviest-first, which is the wrong order for a timeline, so this
 * sorts its own copy instead of depending on the store's ordering.
 */
function summarise(prs: PrEntry[]) {
  const chronological = [...prs].sort((a, b) => b.date.localeCompare(a.date));

  let volumeKg = 0;
  let oneRepMaxKg = 0;

  for (const pr of prs) {
    volumeKg += pr.weightKg * pr.reps;
    oneRepMaxKg = Math.max(
      oneRepMaxKg,
      estimateOneRepMax(pr.weightKg, pr.reps),
    );
  }

  return {
    chronological,
    count: prs.length,
    volumeKg,
    oneRepMaxKg,
    firstLogged: chronological[chronological.length - 1]?.date,
    lastLogged: chronological[0]?.date,
  };
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const [gifPaused, setGifPaused] = useState(false);
  const [showAllSets, setShowAllSets] = useState(false);

  const exercise = getExercise(id);
  const { isAdded, toggleAdded, prs, best } = useExerciseLog(exercise?.id);
  const { unit, removePr, addedIds } = useLibrary();
  const accent = useMuscleColor(exercise?.group);

  const records = useMemo(() => summarise(prs), [prs]);
  const similar = useMemo(
    () => (exercise ? getSimilarExercises(exercise) : []),
    [exercise],
  );
  const cues = useMemo(
    () => (exercise ? (getFormCues(exercise.name) ?? getGenericSteps(exercise)) : []),
    [exercise],
  );
  /*
   * Memoised on purpose. A fresh `options` object makes expo-router call
   * `setOptions` on every render, which is half of what collapses the Android
   * toolbar — see the note on `ToolbarActions`.
   */
  const options = useMemo(() => ({ title: exercise?.name ?? 'Exercise' }), [exercise?.name]);

  const exerciseId = exercise?.id;
  const exerciseName = exercise?.name ?? '';

  // Removing an exercise deletes its history with it, so the label on the
  // button is deliberately a description of the state, not the action. Declared
  // before the not-found return so the hook order never changes.
  const toggleLibrary = useCallback(async () => {
    if (!exerciseId) {
      return;
    }
    if (!isAdded) {
      toggleAdded();
      return;
    }

    const confirmed = await confirmDestructive(
      'Remove from your library?',
      prs.length > 0
        ? `${exerciseName} and its ${pluralize(prs.length, 'logged set')} will be deleted.`
        : `${exerciseName} will be removed from your library.`,
    );

    if (confirmed) {
      toggleAdded();
    }
  }, [isAdded, toggleAdded, prs.length, exerciseId, exerciseName]);

  const openLog = useCallback(() => {
    if (!exerciseId) {
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    router.push({ pathname: '/log-pr', params: { exercise: exerciseId } });
  }, [router, exerciseId]);

  if (!exercise) {
    return (
      <Screen>
        <Stack.Screen options={options} />
        <EmptyState
          icon="search"
          title="Exercise not found"
          message="This exercise is no longer in the catalogue."
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const confirmRemoveSet = async (pr: PrEntry) => {
    const weight = formatWeight(fromKg(pr.weightKg, unit), unit);
    const confirmed = await confirmDestructive(
      'Remove this set?',
      `${weight} × ${pr.reps} on ${formatRelativeDate(pr.date)}`,
    );

    if (confirmed) {
      removePr(exercise.id, pr.id);
    }
  };

  return (
    <>
      <ToolbarActions
        isAdded={isAdded}
        onToggleLibrary={toggleLibrary}
        onOpenLog={openLog}
      />

      <Screen contentStyle={styles.content}>
        <Stack.Screen options={options} />

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            label={isAdded ? 'In your library' : 'Add to library'}
            icon={isAdded ? 'check' : 'plus'}
            variant={isAdded ? 'secondary' : 'primary'}
            accentColor={accent}
            onPress={toggleLibrary}
            accessibilityHint={
              isAdded ? 'Removes this exercise and everything logged for it' : undefined
            }
            style={styles.actionButton}
          />
          <Button
            label="Log a set"
            icon="trophy"
            variant={isAdded ? 'primary' : 'secondary'}
            accentColor={accent}
            onPress={openLog}
            style={styles.actionButton}
          />
        </View>

        {/*
          Full-bleed media. The negative margin cancels `Screen`'s horizontal
          inset, so the demonstration runs to the screen edges while still
          respecting the centred 720pt column on tablets and web. The radius lives
          here rather than on a `Card` because a hairline border around media
          reads as an accident.
        */}
        <View
          style={[styles.gifStage, { backgroundColor: colors.surfaceSunken }]}
        >
          <Image
            source={{ uri: getGifUrl(exercise) }}
            style={styles.gif}
            contentFit="fill"
            autoplay={!gifPaused}
            transition={200}
            recyclingKey={exercise.id}
            accessibilityIgnoresInvertColors
            accessibilityLabel={`Animated demonstration of ${exercise.name}`}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={gifPaused ? 'Play animation' : 'Pause animation'}
            accessibilityHint="Stops or restarts the looping demonstration"
            onPress={() => setGifPaused((paused) => !paused)}
            style={({ pressed }) => [
              styles.gifToggle,
              { backgroundColor: colors.overlay },
              pressed && styles.pressed,
            ]}
          >
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

        {/* The body part is the only tinted chip: it is the one attribute that
            decides where this movement is filed, and tapping it here is a dead
            end, so it reads as a label rather than a control. */}
        <View style={styles.chips}>
          <Chip label={getMuscleLabel(exercise.group)} color={accent} filled />
          <Chip label={getEquipmentLabel(exercise.equipment)} icon="grid" />
          <Chip label={getCategoryLabel(exercise.category)} />
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="target" size={17} color={colors.textSecondary} />
            <Txt variant="heading">Muscles worked</Txt>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.muscleBlock}>
              <Txt variant="label" tone="secondary" eyebrow>
                Primary
              </Txt>
              <View style={styles.chipRow}>
                <Chip
                  label={getMuscleLabel(exercise.target)}
                  color={accent}
                  filled
                />
              </View>
            </View>
            {exercise.secondary.length > 0 ? (
              <View style={styles.muscleBlock}>
                <Txt variant="label" tone="secondary" eyebrow>
                  Also works
                </Txt>
                <View style={styles.chipRow}>
                  {exercise.secondary.map((muscle) => (
                    <Chip key={muscle} label={getMuscleLabel(muscle)} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="sparkle" size={17} color={colors.textSecondary} />
            <Txt variant="heading">Form cues</Txt>
            {!getFormCues(exercise.name) ? (
              <Txt variant="caption" tone="secondary" style={styles.headerTag}>
                from the source
              </Txt>
            ) : null}
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cueList}>
              {cues.map((cue, index) => (
                <View key={cue} style={styles.cue}>
                  <View
                    style={[
                      styles.cueIndex,
                      { backgroundColor: colors.surfaceSunken },
                    ]}
                  >
                    <Txt
                      variant="caption"
                      tone="secondary"
                      style={styles.cueIndexLabel}
                    >
                      {index + 1}
                    </Txt>
                  </View>
                  <Txt variant="body" tone="secondary" style={styles.cueText}>
                    {cue}
                  </Txt>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <RecordsCard
          best={best}
          records={records}
          unit={unit}
          expanded={showAllSets}
          onToggleExpanded={() => setShowAllSets((shown) => !shown)}
          onRemoveSet={confirmRemoveSet}
          onLogSet={openLog}
        />

        {/*
          A detail page is a dead end without this: the catalogue has 1,292
          movements, and most people arrive here from a search for one variation
          and want the next one.
        */}
        {similar.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="library" size={17} color={colors.textSecondary} />
              <Txt variant="heading">More like this</Txt>
            </View>
            <View style={styles.similarList}>
              {similar.map((other) => (
                <ExerciseRow
                  key={other.id}
                  exercise={other}
                  isAdded={addedIds.has(other.id)}
                  onPress={() =>
                    router.push({
                      pathname: '/exercise/[id]',
                      params: { id: other.id },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}
      </Screen>
    </>
  );
}

type Records = ReturnType<typeof summarise>;

/**
 * The two screen-level actions, in the native bottom toolbar rather than at the
 * top of the scroll view: they are the reason most people open this screen, and
 * a pinned bar keeps them reachable from the records list at the bottom. Only
 * iOS and Android render it — see `USES_NATIVE_CHROME`.
 *
 * Split into its own memoised component, and given `useCallback` handlers,
 * because of an Android-specific trap. The toolbar there is a Jetpack Compose
 * `Host` with `matchContents`, which reports its own size back to Yoga. Any
 * screen re-render that makes expo-router re-apply the screen options detaches
 * and re-attaches the toolbar's subviews; the host then measures 0x0, writes
 * that as "no size" and never recovers, so the entire bar vanishes after a
 * frame or two. This screen re-renders often — pausing the animation, expanding
 * the history, any store write — so a stable identity for the toolbar and its
 * children is what keeps it on screen.
 *
 * See https://github.com/expo/expo/issues/49312.
 */
const ToolbarActions = memo(function ToolbarActions({
  isAdded,
  onToggleLibrary,
  onOpenLog,
}: {
  isAdded: boolean;
  onToggleLibrary: () => void;
  onOpenLog: () => void;
}) {
  /*
   * Android's toolbar rejects SF Symbol names outright — `Stack.Toolbar.Button`
   * renders nothing at all without an image source — so each button carries a
   * Material Symbols drawable for that side. `process.env.EXPO_OS` is replaced
   * with a string literal at build time, so the branch for the other platform is
   * dead code and its icon never reaches the bundle. The SF Symbol names come
   * from `ICONS` so a rename there stays a compile error rather than a blank
   * glyph, exactly as it does for `<Icon>`.
   */
  // Icons are passed via Stack.Toolbar.Icon component with text labels
  // const os = process.env.EXPO_OS;
  // const trophyIcon = os === 'ios' ? ICONS.trophy.sf : TrophyIcon;
  // const addIcon = os === 'ios' ? ICONS.plus.sf : AddIcon;
  // const inLibraryIcon = os === 'ios' ? ICONS.check.sf : CheckIcon;

  return null;
});

function RecordsCard({
  best,
  records,
  unit,
  expanded,
  onToggleExpanded,
  onRemoveSet,
  onLogSet,
}: {
  best: { weightKg: number; reps: number; date: string } | undefined;
  records: Records;
  unit: WeightUnit;
  expanded: boolean;
  onToggleExpanded: () => void;
  onRemoveSet: (pr: PrEntry) => void;
  /**
   * Omitted where the native bottom toolbar already pins "Log a set" to the
   * screen, so the empty state does not offer the same action twice.
   */
  onLogSet?: () => void;
}) {
  const colors = useTheme();
  const visible = expanded
    ? records.chronological
    : records.chronological.slice(0, COLLAPSED_SETS);
  const hidden = records.count - visible.length;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name="trophy" size={17} color={colors.textSecondary} />
        <Txt variant="heading">Your records</Txt>
      </View>

      <Card padded={false}>
        {best ? (
          <View style={styles.bestBlock}>
            <Txt variant="caption" tone="secondary" eyebrow>
              Heaviest set
            </Txt>
            <Txt variant="display" style={styles.bestWeight}>
              {formatWeight(fromKg(best.weightKg, unit), unit)}
            </Txt>
            <Txt variant="label" tone="secondary">
              {pluralize(best.reps, 'rep')} · {formatRelativeDate(best.date)}
            </Txt>

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <View style={styles.statsRow}>
              <Stat
                label="Est. 1RM"
                value={formatWeight(fromKg(records.oneRepMaxKg, unit), unit)}
                caption="Epley, from your best set"
              />
              <Stat
                label="Total volume"
                value={formatVolume(records.volumeKg, unit)}
                caption={`across ${pluralize(records.count, 'set')}`}
              />
            </View>

            <Txt variant="caption" tone="secondary" style={styles.firstLogged}>
              {records.firstLogged && records.lastLogged
                ? records.firstLogged === records.lastLogged
                  ? `First logged ${formatDate(records.firstLogged)}`
                  : `First logged ${formatDate(records.firstLogged)} · latest ${formatRelativeDate(records.lastLogged).toLowerCase()}`
                : null}
            </Txt>
          </View>
        ) : (
          <View style={styles.recordsEmpty}>
            <Txt variant="body" tone="secondary">
              No sets logged yet. Add your first one to start the history.
            </Txt>
            {onLogSet ? (
              <Button
                label="Log a set"
                icon="trophy"
                onPress={onLogSet}
                style={styles.recordsEmptyAction}
              />
            ) : null}
          </View>
        )}

        {records.count > 0 ? (
          <View style={[styles.history, { borderTopColor: colors.border }]}>
            <Txt variant="label" tone="secondary" style={styles.historyHeader}>
              {`${pluralize(records.count, 'set')} logged, newest first`}
            </Txt>
            {visible.map((pr, index) => {
              const weight = formatWeight(fromKg(pr.weightKg, unit), unit);
              return (
                <Pressable
                  key={pr.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove set of ${weight} for ${pr.reps} reps`}
                  accessibilityHint="Deletes this set from your history"
                  onPress={() => onRemoveSet(pr)}
                  style={({ pressed }) => [
                    styles.historyRow,
                    { borderTopColor: colors.border },
                    index > 0 && styles.historyRowDivided,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.historyMain}>
                    <Txt variant="mono">
                      {weight} × {pr.reps}
                    </Txt>
                    <Txt variant="caption" tone="secondary">
                      {formatRelativeDate(pr.date)}
                    </Txt>
                  </View>
                  <Icon name="trash" size={16} color={colors.textSecondary} />
                </Pressable>
              );
            })}
            {hidden > 0 || expanded ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  expanded
                    ? 'Show fewer sets'
                    : `Show all ${records.count} sets`
                }
                onPress={onToggleExpanded}
                style={({ pressed }) => [
                  styles.historyRow,
                  { borderTopColor: colors.border },
                  styles.historyRowDivided,
                  pressed && styles.pressed,
                ]}
              >
                <Txt variant="label" tone="accent">
                  {expanded ? 'Show fewer' : `Show all ${records.count} sets`}
                </Txt>
                <Icon
                  name="chevron"
                  size={14}
                  color={colors.accent}
                  style={[
                    styles.disclosure,
                    expanded && styles.disclosureFlipped,
                  ]}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

function Stat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <View style={styles.stat}>
      <Txt variant="caption" tone="secondary" eyebrow>
        {label}
      </Txt>
      <Txt variant="title" numberOfLines={1}>
        {value}
      </Txt>
      <Txt variant="caption" tone="secondary">
        {caption}
      </Txt>
    </View>
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
    borderRadius: Radii.lg,
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
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  headerTag: {
    marginLeft: 'auto',
  },
  cardBody: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  muscleBlock: {
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cueList: {
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
    padding: Spacing.four,
    gap: Spacing.one,
  },
  bestWeight: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  firstLogged: {
    marginTop: Spacing.three,
  },
  recordsEmpty: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  recordsEmptyAction: {
    alignSelf: 'flex-start',
  },
  history: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  historyHeader: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  historyRowDivided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  disclosure: {
    transform: [{ rotate: '90deg' }],
  },
  disclosureFlipped: {
    transform: [{ rotate: '270deg' }],
  },
  historyMain: {
    gap: 2,
  },
  similarList: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
});
