import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Icon } from '@/components/icon';
import { Segmented } from '@/components/controls';
import { LineChart, type ChartPoint } from '@/components/line-chart';
import { Txt } from '@/components/txt';
import { Button, Card } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary, type BodyWeightEntry } from '@/store/library';
import {
  formatDate,
  formatRelativeDate,
  fromKg,
  parseWeight,
  pluralize,
  type WeightUnit,
} from '@/utils/weight';

type RangeKey = 'monthly' | 'quarterly' | 'yearly';

const RANGES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

const RANGE_DAYS: Record<RangeKey, number> = { monthly: 30, quarterly: 90, yearly: 365 };
const DAY_MS = 86_400_000;
const COLLAPSED_READINGS = 8;
/** One tap moves the reading by the smallest increment a bathroom scale shows. */
const STEP = 0.1;
const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 70;

function confirmRemove(message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof globalThis.confirm === 'function' && globalThis.confirm(`Remove this reading?\n\n${message}`)
    );
  }
  return new Promise((resolve) => {
    Alert.alert('Remove this reading?', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

/** Whole numbers read as noise on a body weight; one decimal is what scales show. */
function formatBody(weight: number, unit: WeightUnit): string {
  return `${weight.toFixed(1)} ${unit}`;
}

function formatDelta(delta: number, unit: WeightUnit): string {
  const rounded = Math.round(delta * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)} ${unit}`;
}

export function BodyWeightTab() {
  const colors = useTheme();
  const { bodyWeights, addBodyWeight, removeBodyWeight, unit } = useLibrary();
  const [range, setRange] = useState<RangeKey>('monthly');
  const [input, setInput] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [adding, setAdding] = useState(false);

  const weightKg = parseWeight(input, unit);
  const canSave = weightKg !== null && weightKg < 1000;

  const closeAdd = () => {
    setAdding(false);
    setInput('');
  };

  // An empty field starts from the latest reading, so a nudge is a small edit.
  const nudge = (delta: number) => {
    // Functional update: a held button fires from a stale closure.
    setInput((current) => {
      const typed = Number.parseFloat(current.replace(',', '.'));
      const base = Number.isFinite(typed)
        ? typed
        : latest
          ? fromKg(latest.weightKg, unit)
          : 0;
      return Math.min(999, Math.max(0, Math.round((base + delta) * 10) / 10)).toFixed(1);
    });
    Haptics.selectionAsync().catch(() => {});
  };

  const save = () => {
    if (!canSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    addBodyWeight(weightKg);
    closeAdd();
  };

  // The window ends at mount time, or at the newest reading if that is later
  // (one just logged), so the latest point never falls off the right edge.
  const [mountedAt] = useState(() => Date.now());
  const latest = bodyWeights[bodyWeights.length - 1];
  const end = Math.max(mountedAt, latest ? new Date(latest.date).getTime() : 0);
  const start = end - RANGE_DAYS[range] * DAY_MS;

  const points = useMemo<ChartPoint[]>(
    () =>
      bodyWeights
        .map((entry) => ({ time: new Date(entry.date).getTime(), value: fromKg(entry.weightKg, unit) }))
        .filter((p) => p.time >= start && p.time <= end),
    [bodyWeights, unit, start, end]
  );

  const formatValue = useCallback((v: number) => v.toFixed(1), []);
  const formatTime = useCallback(
    (t: number) =>
      new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    []
  );

  const first = points[0];
  const last = points[points.length - 1];
  const change = first && last && points.length > 1 ? last.value - first.value : undefined;
  const values = points.map((p) => p.value);

  const newestFirst = useMemo(() => [...bodyWeights].reverse(), [bodyWeights]);
  const visible = showAll ? newestFirst : newestFirst.slice(0, COLLAPSED_READINGS);

  const remove = async (entry: BodyWeightEntry) => {
    const label = `${formatBody(fromKg(entry.weightKg, unit), unit)} on ${formatDate(entry.date)}`;
    if (await confirmRemove(label)) {
      removeBodyWeight(entry.id);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Txt variant="heading">Body weight</Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log body weight"
          onPress={() => setAdding(true)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.plus,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
          ]}>
          <Icon name="plus" size={22} color={colors.onAccent} weight="semibold" />
        </Pressable>
      </View>

      <Modal visible={adding} transparent animationType="fade" onRequestClose={closeAdd}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAdd} accessibilityLabel="Close" />
          <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.labelRow}>
              <Icon name="scale" size={18} color={colors.textSecondary} />
              <Txt variant="subheading" tone="secondary">
                Log today&apos;s weight
              </Txt>
            </View>
            <View style={styles.stepRow}>
            <StepButton label="−" accessibilityLabel={`Decrease weight by ${STEP} ${unit}`} onPress={() => nudge(-STEP)} />
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderColor: input && !canSave ? colors.danger : colors.border,
                },
              ]}>
              <TextInput
                value={input}
                onChangeText={setInput}
                onSubmitEditing={save}
                autoFocus
                placeholder={latest ? String(Math.round(fromKg(latest.weightKg, unit) * 10) / 10) : '0.0'}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                inputMode="decimal"
                returnKeyType="done"
                accessibilityLabel={`Body weight in ${unit}`}
                style={[styles.input, { color: input && !canSave ? colors.danger : colors.text }]}
              />
              <Txt variant="subheading" tone="secondary" style={styles.unit}>
                {unit}
              </Txt>
            </View>
            <StepButton label="+" accessibilityLabel={`Increase weight by ${STEP} ${unit}`} onPress={() => nudge(STEP)} />
            </View>
            <Txt variant="caption" tone="secondary">
              One reading per day — logging again today replaces it.
            </Txt>
            <View style={styles.dialogActions}>
              <Button label="Cancel" variant="secondary" onPress={closeAdd} style={styles.dialogButton} />
              <Button label="Save" icon="check" onPress={save} disabled={!canSave} style={styles.dialogButton} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Segmented options={RANGES} value={range} onChange={setRange} />

      <Card>
        {latest ? (
          <View style={styles.stats}>
            <Stat label="Current" value={formatBody(fromKg(latest.weightKg, unit), unit)} />
            <Stat
              label={`Change · ${RANGES.find((r) => r.value === range)?.label.toLowerCase()}`}
              value={change === undefined ? '—' : formatDelta(change, unit)}
            />
          </View>
        ) : null}

        {points.length > 0 ? (
          <>
            <LineChart
              points={points}
              start={start}
              end={end}
              formatValue={formatValue}
              formatTime={formatTime}
            />
            {points.length > 1 ? (
              <Txt variant="caption" tone="secondary">
                Low {formatBody(Math.min(...values), unit)} · High {formatBody(Math.max(...values), unit)}
              </Txt>
            ) : null}
          </>
        ) : (
          <Txt variant="body" tone="secondary" style={styles.emptyChart}>
            {bodyWeights.length === 0
              ? 'No readings yet. Log your weight above to start your graph.'
              : 'No readings in this period. Try a longer range.'}
          </Txt>
        )}
      </Card>

      {bodyWeights.length > 0 ? (
        <View style={styles.readings}>
          <Txt variant="heading">Your readings</Txt>
          <Card padded={false}>
            {visible.map((entry, index) => {
              const previous = newestFirst[newestFirst.indexOf(entry) + 1];
              const delta = previous
                ? fromKg(entry.weightKg - previous.weightKg, unit)
                : undefined;
              const weight = formatBody(fromKg(entry.weightKg, unit), unit);
              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove reading of ${weight}`}
                  accessibilityHint="Deletes this reading"
                  onPress={() => void remove(entry)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.rowMain}>
                    <Txt variant="mono">{weight}</Txt>
                    <Txt variant="caption" tone="secondary">
                      {formatRelativeDate(entry.date)}
                    </Txt>
                  </View>
                  {delta !== undefined ? (
                    <Txt variant="caption" tone="secondary">
                      {formatDelta(delta, unit)}
                    </Txt>
                  ) : null}
                  <Icon name="trash" size={16} color={colors.textSecondary} />
                </Pressable>
              );
            })}
            {bodyWeights.length > COLLAPSED_READINGS ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAll((shown) => !shown)}
                style={({ pressed }) => [
                  styles.row,
                  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                  pressed && styles.pressed,
                ]}>
                <Txt variant="label" tone="accent">
                  {showAll ? 'Show fewer' : `Show all ${pluralize(bodyWeights.length, 'reading')}`}
                </Txt>
              </Pressable>
            ) : null}
          </Card>
        </View>
      ) : null}
    </View>
  );
}

function StepButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const colors = useTheme();
  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    clearInterval(timer.current);
    timer.current = undefined;
  }, []);

  // Steps once on touch-down, then repeats after a short hold. `onPress` is not
  // used: it only fires on release, which would double-count the first step.
  const start = () => {
    stop();
    onPressRef.current();
    timer.current = setTimeout(() => {
      timer.current = setInterval(() => onPressRef.current(), HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
  };

  useEffect(() => stop, [stop]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Press and hold to keep going"
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onPressRef.current()}
      onPressIn={start}
      onPressOut={stop}
      hitSlop={6}
      style={({ pressed }) => [
        styles.stepButton,
        { backgroundColor: colors.surfaceSunken, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <Txt variant="title" style={styles.stepLabel}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="caption" tone="secondary" eyebrow>
        {label}
      </Txt>
      <Txt variant="title" numberOfLines={1}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  dialog: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dialogButton: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepLabel: {
    lineHeight: 28,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingRight: Spacing.four,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: Spacing.three,
    // Balances the unit label so the number stays visually centred.
    paddingLeft: Spacing.six,
  },
  unit: {
    width: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  emptyChart: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  readings: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
