import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Segmented, SearchField } from '@/components/controls';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { Button, Card } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import {
  FOODS,
  matchesQuery,
  scaleNutrients,
  type Food,
  type Nutrients,
} from '@/data/foods';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary } from '@/store/library';
import { dayKey, formatGrams, formatKcal, MEALS, type MealType } from '@/utils/diet';

const MAX_RESULTS = 80;
const MEAL_VALUES = new Set<string>(MEALS.map((meal) => meal.value));

function parseAmount(input: string): number {
  const value = Number.parseFloat(input.trim().replace(',', '.'));
  return Number.isFinite(value) ? value : 0;
}

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ meal?: string; day?: string }>();
  const colors = useTheme();
  const { customFoods } = useLibrary();

  const [meal, setMeal] = useState<MealType>(
    params.meal && MEAL_VALUES.has(params.meal) ? (params.meal as MealType) : 'snack'
  );
  const day = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) ? params.day : dayKey();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [creating, setCreating] = useState(false);

  const results = useMemo(
    () => [...customFoods, ...FOODS].filter((food) => matchesQuery(food, query)),
    [customFoods, query]
  );

  const view = selected ? 'detail' : creating ? 'custom' : 'search';

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: view === 'custom' ? 'Custom food' : selected ? 'Nutrition' : 'Add food',
          // Search uses the stack's own back arrow. The detail and custom views
          // live in this same screen, so their back arrow returns to search.
          headerLeft:
            view === 'search'
              ? undefined
              : () => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to search"
                    hitSlop={10}
                    style={styles.headerBack}
                    onPress={() => {
                      setSelected(null);
                      setCreating(false);
                    }}>
                    <Icon name="chevronLeft" size={22} color={colors.accent} weight="semibold" />
                  </Pressable>
                ),
        }}
      />

      {view === 'search' ? (
        <>
          <Segmented
            options={MEALS}
            value={meal}
            onChange={setMeal}
          />
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods (e.g. chicken, dal, banana)"
          />
          <Button
            label="Create custom food"
            icon="plus"
            variant="secondary"
            onPress={() => setCreating(true)}
          />
          {results.length === 0 ? (
            <Txt tone="secondary" style={styles.centered}>
              No foods match “{query.trim()}”. Create a custom food to track it.
            </Txt>
          ) : (
            <Card padded={false}>
              {results.slice(0, MAX_RESULTS).map((food, index) => (
                <Pressable
                  key={food.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${food.name}, ${formatKcal(food.per100g.kcal)} calories per 100 grams`}
                  onPress={() => setSelected(food)}
                  style={({ pressed }) => [
                    styles.foodRow,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.flex}>
                    <Txt variant="subheading" numberOfLines={1}>
                      {food.name}
                    </Txt>
                    <Txt variant="caption" tone="secondary" numberOfLines={1}>
                      {formatKcal(food.per100g.kcal)} kcal · {formatGrams(food.per100g.protein)}{' '}
                      protein · per 100 g
                    </Txt>
                  </View>
                  <Icon name="chevron" size={14} color={colors.textTertiary} />
                </Pressable>
              ))}
            </Card>
          )}
          {results.length > MAX_RESULTS ? (
            <Txt variant="caption" tone="secondary" style={styles.centered}>
              Showing {MAX_RESULTS} of {results.length}. Keep typing to narrow it down.
            </Txt>
          ) : null}
        </>
      ) : null}

      {view === 'detail' && selected ? (
        <FoodDetail
          food={selected}
          meal={meal}
          onMealChange={setMeal}
          day={day}
          onDone={() => router.back()}
          onDeleted={() => setSelected(null)}
        />
      ) : null}

      {view === 'custom' ? (
        <CustomFoodForm
          onCreated={(food) => {
            setCreating(false);
            setSelected(food);
          }}
        />
      ) : null}
    </Screen>
  );
}

function FoodDetail({
  food,
  meal,
  onMealChange,
  day,
  onDone,
  onDeleted,
}: {
  food: Food;
  meal: MealType;
  onMealChange: (meal: MealType) => void;
  day: string;
  onDone: () => void;
  onDeleted: () => void;
}) {
  const colors = useTheme();
  const { addFoodEntry, removeCustomFood } = useLibrary();
  const [amount, setAmount] = useState(String(Math.round(food.serving.grams)));

  const grams = parseAmount(amount);
  const valid = grams > 0 && grams <= 5000;
  const nutrients = scaleNutrients(food.per100g, valid ? grams : 0);

  const log = () => {
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    addFoodEntry(food, grams, meal, day);
    onDone();
  };

  const presets = [
    { label: `${food.serving.label} · ${Math.round(food.serving.grams)} g`, grams: food.serving.grams },
    { label: '100 g', grams: 100 },
  ].filter((preset, index, all) => all.findIndex((p) => p.grams === preset.grams) === index);

  return (
    <>
      <View style={styles.gap}>
        <Txt variant="title">{food.name}</Txt>
        <Txt variant="caption" tone="secondary">
          {food.custom ? 'Your food' : food.category} · values are typical estimates
        </Txt>
      </View>

      <Card>
        <Txt variant="caption" tone="secondary" eyebrow>
          Amount (grams)
        </Txt>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          onSubmitEditing={log}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="done"
          selectTextOnFocus
          accessibilityLabel="Amount in grams"
          style={[
            styles.amountInput,
            {
              color: valid || !amount ? colors.text : colors.danger,
              backgroundColor: colors.surfaceSunken,
              borderColor: valid || !amount ? colors.border : colors.danger,
            },
          ]}
        />
        <View style={styles.presets}>
          {presets.map((preset) => (
            <Pressable
              key={preset.label}
              accessibilityRole="button"
              onPress={() => setAmount(String(Math.round(preset.grams)))}
              style={({ pressed }) => [
                styles.preset,
                { borderColor: colors.border, backgroundColor: colors.surfaceSunken },
                pressed && styles.pressed,
              ]}>
              <Txt variant="label">{preset.label}</Txt>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.kcalRow}>
          <Txt variant="display">{formatKcal(nutrients.kcal)}</Txt>
          <Txt variant="subheading" tone="secondary">
            kcal
          </Txt>
        </View>
        <NutrientRows nutrients={nutrients} />
        <Txt variant="caption" tone="secondary">
          Per 100 g: {formatKcal(food.per100g.kcal)} kcal · {formatGrams(food.per100g.protein)}{' '}
          protein · {formatGrams(food.per100g.carbs)} carbs · {formatGrams(food.per100g.fat)} fat
        </Txt>
      </Card>

      <Segmented options={MEALS} value={meal} onChange={onMealChange} />

      <Button
        label={`Add to ${MEALS.find((m) => m.value === meal)?.label.toLowerCase()}`}
        icon="check"
        onPress={log}
        disabled={!valid}
      />

      {food.custom ? (
        <Button
          label="Delete this custom food"
          icon="trash"
          variant="danger"
          accessibilityHint="Past entries you logged with it are kept"
          onPress={() => {
            removeCustomFood(food.id);
            onDeleted();
          }}
        />
      ) : null}
    </>
  );
}

function NutrientRows({ nutrients }: { nutrients: Nutrients }) {
  const colors = useTheme();
  const rows: [string, number][] = [
    ['Protein', nutrients.protein],
    ['Carbohydrates', nutrients.carbs],
    ['Fat', nutrients.fat],
    ['Fibre', nutrients.fiber],
  ];
  return (
    <View style={styles.nutrientTable}>
      {rows.map(([label, value]) => (
        <View
          key={label}
          style={[styles.nutrientRow, { borderTopColor: colors.border }]}>
          <Txt variant="body">{label}</Txt>
          <Txt variant="mono">{formatGrams(value)}</Txt>
        </View>
      ))}
    </View>
  );
}

const FIELDS: { key: keyof Nutrients; label: string }[] = [
  { key: 'kcal', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'fiber', label: 'Fibre (g)' },
];

function CustomFoodForm({ onCreated }: { onCreated: (food: Food) => void }) {
  const colors = useTheme();
  const { addCustomFood } = useLibrary();
  const [name, setName] = useState('');
  const [values, setValues] = useState<Record<keyof Nutrients, string>>({
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
  });
  const [serving, setServing] = useState('100');

  const kcal = parseAmount(values.kcal);
  const servingGrams = parseAmount(serving);
  const valid = name.trim().length > 0 && kcal > 0 && kcal <= 1000 && servingGrams > 0;

  const save = () => {
    if (!valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    const clamp = (key: keyof Nutrients) => Math.min(100, Math.max(0, parseAmount(values[key])));
    const food = addCustomFood({
      name: name.trim().slice(0, 80),
      per100g: {
        kcal,
        protein: clamp('protein'),
        carbs: clamp('carbs'),
        fat: clamp('fat'),
        fiber: clamp('fiber'),
      },
      serving: { label: '1 serving', grams: servingGrams },
    });
    onCreated(food);
  };

  const inputStyle = [
    styles.fieldInput,
    { color: colors.text, backgroundColor: colors.surfaceSunken, borderColor: colors.border },
  ];

  return (
    <>
      <Txt variant="body" tone="secondary">
        Enter the label values per 100 g (or 100 ml).
      </Txt>
      <View style={styles.field}>
        <Txt variant="label" tone="secondary">
          Name
        </Txt>
        <TextInput
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={80}
          placeholder="e.g. Homemade protein bar"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Food name"
          style={inputStyle}
        />
      </View>
      {FIELDS.map(({ key, label }) => (
        <View key={key} style={styles.field}>
          <Txt variant="label" tone="secondary">
            {label}
          </Txt>
          <TextInput
            value={values[key]}
            onChangeText={(text) => setValues((current) => ({ ...current, [key]: text }))}
            keyboardType="decimal-pad"
            inputMode="decimal"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={label}
            style={inputStyle}
          />
        </View>
      ))}
      <View style={styles.field}>
        <Txt variant="label" tone="secondary">
          One serving weighs (g)
        </Txt>
        <TextInput
          value={serving}
          onChangeText={setServing}
          keyboardType="decimal-pad"
          inputMode="decimal"
          accessibilityLabel="Serving size in grams"
          style={inputStyle}
        />
      </View>
      <Button label="Save food" icon="check" onPress={save} disabled={!valid} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gap: {
    gap: Spacing.one,
  },
  // Android draws a custom headerLeft flush against the title; iOS pads it itself.
  headerBack: {
    paddingRight: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
  centered: {
    textAlign: 'center',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    marginTop: Spacing.two,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  preset: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  nutrientTable: {
    marginBottom: Spacing.three,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  field: {
    gap: Spacing.one,
  },
  fieldInput: {
    fontSize: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
});
