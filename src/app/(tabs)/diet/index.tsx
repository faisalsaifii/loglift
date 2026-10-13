import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { Button, Card } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary } from '@/store/library';
import {
  dayKey,
  formatDay,
  formatGrams,
  formatKcal,
  MEALS,
  shiftDay,
  sumNutrients,
  type FoodEntry,
  type MealType,
} from '@/utils/diet';

function confirmRemove(name: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof globalThis.confirm === 'function' && globalThis.confirm(`Remove ${name}?`)
    );
  }
  return new Promise((resolve) => {
    Alert.alert('Remove this food?', name, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function DietScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { foodLog, goals, removeFoodEntry, isReady } = useLibrary();
  const [day, setDay] = useState(() => dayKey());
  const [editingGoals, setEditingGoals] = useState(false);

  const entries = useMemo(() => foodLog.filter((entry) => entry.day === day), [foodLog, day]);
  const totals = useMemo(() => sumNutrients(entries), [entries]);
  const isToday = day === dayKey();

  const addFood = (meal: MealType) =>
    router.push({ pathname: '/add-food', params: { meal, day } });

  const remove = async (entry: FoodEntry) => {
    if (await confirmRemove(entry.name)) {
      removeFoodEntry(entry.id);
    }
  };

  return (
    <Screen>
      <Stack.Title>Diet</Stack.Title>

      <View style={styles.dayRow}>
        <DayButton direction="prev" label="Previous day" onPress={() => setDay(shiftDay(day, -1))} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          disabled={isToday}
          onPress={() => setDay(dayKey())}
          style={styles.dayLabel}>
          <Txt variant="heading">{formatDay(day)}</Txt>
        </Pressable>
        <DayButton direction="next" label="Next day" onPress={() => setDay(shiftDay(day, 1))} />
      </View>

      <Card>
        <View style={styles.summaryHeader}>
          <View style={styles.flex}>
            <Txt variant="caption" tone="secondary" eyebrow>
              Calories
            </Txt>
            <Txt variant="display" numberOfLines={1}>
              {formatKcal(totals.kcal)}
              <Txt variant="subheading" tone="secondary">
                {' '}
                / {formatKcal(goals.calories)} kcal
              </Txt>
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit daily goals"
            onPress={() => setEditingGoals(true)}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}>
            <Icon name="target" size={22} color={colors.accent} />
          </Pressable>
        </View>
        <ProgressBar value={totals.kcal} goal={goals.calories} />
        <Txt variant="caption" tone="secondary">
          {totals.kcal <= goals.calories
            ? `${formatKcal(goals.calories - totals.kcal)} kcal left`
            : `${formatKcal(totals.kcal - goals.calories)} kcal over`}
        </Txt>

        <View style={styles.macroGrid}>
          <Macro label="Protein" value={totals.protein} goal={goals.protein} />
          <Macro label="Carbs" value={totals.carbs} />
          <Macro label="Fat" value={totals.fat} />
          <Macro label="Fibre" value={totals.fiber} />
        </View>
      </Card>

      {MEALS.map((meal) => {
        const mealEntries = entries.filter((entry) => entry.meal === meal.value);
        const mealKcal = sumNutrients(mealEntries).kcal;
        return (
          <View key={meal.value} style={styles.meal}>
            <View style={styles.mealHeader}>
              <Txt variant="heading">{meal.label}</Txt>
              <Txt variant="label" tone="secondary">
                {formatKcal(mealKcal)} kcal
              </Txt>
            </View>
            <Card padded={false}>
              {mealEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${entry.name}`}
                  accessibilityHint="Deletes this entry"
                  onPress={() => void remove(entry)}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.flex}>
                    <Txt variant="subheading" numberOfLines={1}>
                      {entry.name}
                    </Txt>
                    <Txt variant="caption" tone="secondary" numberOfLines={1}>
                      {formatGrams(entry.grams)} · P {formatGrams(entry.protein)} · C{' '}
                      {formatGrams(entry.carbs)} · F {formatGrams(entry.fat)}
                    </Txt>
                  </View>
                  <Txt variant="mono">{formatKcal(entry.kcal)}</Txt>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add food to ${meal.label}`}
                onPress={() => addFood(meal.value)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Icon name="plus" size={16} color={colors.accent} weight="semibold" />
                <Txt variant="label" tone="accent">
                  Add food
                </Txt>
              </Pressable>
            </Card>
          </View>
        );
      })}

      {isReady && foodLog.length === 0 ? (
        <Txt variant="caption" tone="secondary" style={styles.hint}>
          Tap “Add food” under a meal to search over 100 foods, see their calories and protein, and
          log what you eat.
        </Txt>
      ) : null}

      <GoalsDialog visible={editingGoals} onClose={() => setEditingGoals(false)} />
    </Screen>
  );
}

function DayButton({
  direction,
  label,
  onPress,
}: {
  direction: 'prev' | 'next';
  label: string;
  onPress: () => void;
}) {
  const colors = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.dayButton,
        { backgroundColor: colors.surfaceSunken, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <Icon name={direction === 'prev' ? 'chevronLeft' : 'chevron'} size={18} color={colors.text} />
    </Pressable>
  );
}

function ProgressBar({ value, goal }: { value: number; goal: number }) {
  const colors = useTheme();
  const ratio = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceSunken }]}>
      <View
        style={[
          styles.fill,
          { width: `${ratio * 100}%`, backgroundColor: value > goal ? colors.danger : colors.accent },
        ]}
      />
    </View>
  );
}

function Macro({ label, value, goal }: { label: string; value: number; goal?: number }) {
  return (
    <View style={styles.macro}>
      <Txt variant="caption" tone="secondary" eyebrow>
        {label}
      </Txt>
      <Txt variant="subheading">{formatGrams(value)}</Txt>
      {goal ? (
        <Txt variant="caption" tone="secondary">
          of {formatGrams(goal)}
        </Txt>
      ) : null}
    </View>
  );
}

function GoalsDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useTheme();
  const { goals, setGoals } = useLibrary();
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const caloriesValue = Number.parseFloat(calories.replace(',', '.'));
  const proteinValue = Number.parseFloat(protein.replace(',', '.'));
  const valid =
    caloriesValue > 0 && caloriesValue < 20000 && proteinValue > 0 && proteinValue < 1000;

  const save = () => {
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    setGoals({ calories: Math.round(caloriesValue), protein: Math.round(proteinValue) });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        setCalories(String(goals.calories));
        setProtein(String(goals.protein));
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Txt variant="heading">Daily goals</Txt>
          <GoalField label="Calories (kcal)" value={calories} onChange={setCalories} onSubmit={save} />
          <GoalField label="Protein (g)" value={protein} onChange={setProtein} onSubmit={save} />
          <View style={styles.dialogActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.flex} />
            <Button label="Save" icon="check" onPress={save} disabled={!valid} style={styles.flex} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function GoalField({
  label,
  value,
  onChange,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const colors = useTheme();
  return (
    <View style={styles.field}>
      <Txt variant="label" tone="secondary">
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        keyboardType="number-pad"
        inputMode="numeric"
        returnKeyType="done"
        accessibilityLabel={label}
        style={[
          styles.fieldInput,
          { color: colors.text, backgroundColor: colors.surfaceSunken, borderColor: colors.border },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  track: {
    height: 8,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  macro: {
    flex: 1,
    gap: 2,
  },
  meal: {
    gap: Spacing.two,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  hint: {
    textAlign: 'center',
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
  field: {
    gap: Spacing.one,
  },
  fieldInput: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
});
