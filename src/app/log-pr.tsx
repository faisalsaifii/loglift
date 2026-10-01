import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Txt } from '@/components/txt';
import { UnitSelector } from '@/components/unit-selector';
import { Button, Card } from '@/components/ui';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { getExercise, getGifUrl } from '@/data/exercises';
import { useMuscleColor } from '@/hooks/use-muscle-color';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary } from '@/store/library';
import {
  formatWeight,
  fromKg,
  parseWeight,
  roundWeight,
  type WeightUnit,
} from '@/utils/weight';

const REP_PRESETS = [5, 8, 10, 12, 15, 20];

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Renders as a bold accent action rather than a plain cancel affordance. */
  emphasis?: boolean;
  role?: 'cancel';
};

/** Header text button matching the system nav bar's cancel/save treatment. */
function HeaderButton({ label, onPress, disabled, emphasis, role }: HeaderButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={role === 'cancel' ? 'Dismisses without saving' : undefined}
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Txt
        variant="body"
        style={{
          color: disabled
            ? colors.textTertiary
            : emphasis
              ? colors.accent
              : colors.textSecondary,
          fontWeight: emphasis ? '800' : '400',
        }}>
        {label}
      </Txt>
    </Pressable>
  );
}

export default function LogPrScreen() {
  const { exercise: exerciseId } = useLocalSearchParams<{ exercise: string }>();
  const colors = useTheme();
  const { unit, bestPr } = useLibrary();

  const exercise = getExercise(exerciseId);
  const existing = exercise ? bestPr(exercise.id) : undefined;

  if (!exercise) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Log a set' }} />
        <Txt variant="heading">Pick an exercise first</Txt>
        <Button label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  // Remounting on the exercise/unit/current-record lets the form seed its inputs
  // straight from props, so logging an improvement starts as a small edit.
  return (
    <SetEntryForm
      key={`${exercise.id}:${unit}:${existing?.date ?? 'new'}`}
      exercise={exercise}
      existing={existing}
      unit={unit}
    />
  );
}

type SetEntryFormProps = {
  exercise: NonNullable<ReturnType<typeof getExercise>>;
  existing?: { weightKg: number; reps: number; date: string };
  unit: WeightUnit;
};

function SetEntryForm({ exercise, existing, unit }: SetEntryFormProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { setUnit, addPr, isAdded, toggleAdded } = useLibrary();
  const accent = useMuscleColor(exercise.group);

  const [weightInput, setWeightInput] = useState(() =>
    existing ? String(roundWeight(fromKg(existing.weightKg, unit))) : ''
  );
  const [repsInput, setRepsInput] = useState(() => (existing ? String(existing.reps) : ''));

  const weightKg = useMemo(() => parseWeight(weightInput, unit), [weightInput, unit]);
  const reps = Number.parseInt(repsInput, 10);
  const repsValid = Number.isFinite(reps) && reps > 0 && reps <= 999;
  const weightValid = weightKg !== null;
  const canSave = weightValid && repsValid;

  const projectedIsPr =
    canSave &&
    (!existing ||
      weightKg > existing.weightKg ||
      (weightKg === existing.weightKg && reps > existing.reps));

  const save = () => {
    if (!canSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    addPr(exercise.id, weightKg as number, reps);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: colors.background }]}>
      {/*
        Cancel and Save live in the native header now, replacing the hand-rolled
        nav bar this screen used to draw itself. `headerLeft`/`headerRight` are
        declared per-render so they close over this form's current `save` and
        `canSave`.
      */}
      <Stack.Screen
        options={{
          title: 'Log a set',
          headerLeft: () => (
            <HeaderButton label="Cancel" onPress={() => router.back()} role="cancel" />
          ),
          headerRight: () => (
            <HeaderButton
              label="Save"
              onPress={save}
              disabled={!canSave}
              emphasis
            />
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Card style={styles.exerciseCard}>
          <View style={[styles.thumb, { backgroundColor: colors.surfaceSunken }]}>
            <Image
              source={{ uri: getGifUrl(exercise) }}
              style={styles.thumbImage}
              contentFit="cover"
              recyclingKey={exercise.id}
              transition={150}
              autoplay={false}
            />
          </View>
          <View style={styles.exerciseInfo}>
            <Txt variant="subheading" numberOfLines={2}>
              {exercise.name}
            </Txt>
            <Txt variant="caption" tone="secondary">
              {existing
                ? `Current best ${formatWeight(fromKg(existing.weightKg, unit), unit)} × ${existing.reps}`
                : 'First set for this exercise'}
            </Txt>
          </View>
        </Card>

        {!isAdded ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleAdded(exercise.id)}
            style={[styles.notice, { backgroundColor: colors.accentSoft }]}>
            <Icon name="info" size={15} color={colors.accent} />
            <Txt variant="caption" tone="accent" style={styles.noticeText}>
              Not in your library yet — logging this set will add it for you.
            </Txt>
          </Pressable>
        ) : null}

        <Card>
          <Txt variant="label" tone="secondary" eyebrow>
            Weight
          </Txt>
          <View style={styles.inputRow}>
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              inputMode="decimal"
              returnKeyType="done"
              selectTextOnFocus
              style={[
                styles.weightInput,
                {
                  color: weightValid ? colors.text : weightInput ? colors.danger : colors.text,
                  backgroundColor: colors.surfaceSunken,
                  borderColor: weightInput && !weightValid ? colors.danger : colors.border,
                },
              ]}
              accessibilityLabel="Weight"
            />
            <UnitSelector
              value={unit}
              onChange={setUnit}
              style={styles.unitSelector}
              testID="log-pr-weight-unit"
            />
          </View>
          {weightInput && !weightValid ? (
            <Txt variant="caption" tone="danger" style={styles.errorText}>
              Enter a number, or add a unit like “185lb”.
            </Txt>
          ) : null}
        </Card>

        <Card>
          <Txt variant="label" tone="secondary" eyebrow>
            Reps
          </Txt>
          <TextInput
            value={repsInput}
            onChangeText={(text) => setRepsInput(text.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            selectTextOnFocus
            style={[
              styles.repsInput,
              {
                color: repsValid ? colors.text : repsInput ? colors.danger : colors.text,
                backgroundColor: colors.surfaceSunken,
                borderColor: repsInput && !repsValid ? colors.danger : colors.border,
              },
            ]}
            accessibilityLabel="Reps"
          />
          <View style={styles.presets}>
            {REP_PRESETS.map((preset) => {
              const active = reps === preset;
              return (
                <Pressable
                  key={preset}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setRepsInput(String(preset))}
                  style={[
                    styles.preset,
                    {
                      backgroundColor: active ? colors.text : colors.surfaceSunken,
                      borderColor: active ? colors.text : colors.border,
                    },
                  ]}>
                  <Txt variant="label" style={{ color: active ? colors.onAccent : colors.textSecondary }}>
                    {preset}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {projectedIsPr ? (
          <View style={[styles.prBanner, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
            <Icon name="flame" size={18} color={colors.text} weight="semibold" />
            <Txt variant="subheading" style={styles.prBannerText}>
              {existing ? 'That beats your current best.' : 'Your first record for this lift.'}
            </Txt>
          </View>
        ) : null}

        <Button
          label="Save set"
          icon="check"
          accentColor={accent}
          disabled={!canSave}
          onPress={save}
          style={styles.saveButton}
        />
        <Txt variant="caption" tone="secondary" style={styles.footnote}>
          Weights are stored in kg, so switching units later never changes your history.
        </Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  headerButton: {
    minWidth: 44,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.md,
  },
  noticeText: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  weightInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    letterSpacing: -1,
  },
  unitSelector: {
    alignSelf: 'center',
  },
  repsInput: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    letterSpacing: -1,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  preset: {
    flexGrow: 1,
    minWidth: 52,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  errorText: {
    marginTop: Spacing.two,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  prBannerText: {
    flex: 1,
  },
  saveButton: {
    marginTop: Spacing.two,
  },
  footnote: {
    textAlign: 'center',
  },
});
