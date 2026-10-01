import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { SearchBarCommands } from 'react-native-screens';

import { SearchField, Segmented } from '@/components/controls';
import { ExerciseRow } from '@/components/exercise-row';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  getMuscleGroup,
  MUSCLE_GROUP_IDS,
  searchExercises,
} from '@/data/exercises';
import { useLibrary } from '@/store/library';
import { formatWeight, fromKg } from '@/utils/weight';

type Scope = 'mine' | 'library';

/** Enough rows to browse comfortably without rendering an unbounded list. */
const BROWSE_LIMIT = 60;

/**
 * Whether the real native header/toolbar chrome is used. Only iOS and Android
 * render `headerSearchBarOptions` and `Stack.Toolbar` as proper native controls;
 * the web stack renders the former as a cramped inline field beside the back
 * button and ignores the latter entirely. Web therefore keeps its own
 * `SearchField` and an in-content fallback action instead of two search UIs.
 */
const USES_NATIVE_CHROME = Platform.OS !== 'web';

const SCOPES: readonly { value: Scope; label: string }[] = [
  { value: 'mine', label: 'My exercises' },
  { value: 'library', label: 'All exercises' },
];

export default function MuscleScreen() {
  const { muscle } = useLocalSearchParams<{ muscle: string }>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('mine');
  const searchBar = useRef<SearchBarCommands>(null);

  const group = getMuscleGroup(muscle) ?? getMuscleGroup(MUSCLE_GROUP_IDS[0]);
  const { addedIds, bestPr, unit, isReady } = useLibrary();

  const results = useMemo(() => {
    if (!group) {
      return [];
    }
    const matches = searchExercises(group.id, query, { limit: BROWSE_LIMIT });
    return scope === 'mine' ? matches.filter((exercise) => addedIds.has(exercise.id)) : matches;
  }, [group, query, scope, addedIds]);

  // Resolving and formatting every row's best set on each keystroke would be
  // wasted work, so it is derived once per result set.
  const rows = useMemo(
    () =>
      results.map((exercise) => {
        const record = bestPr(exercise.id);
        return {
          exercise,
          isAdded: addedIds.has(exercise.id),
          best: record
            ? { text: formatWeight(fromKg(record.weightKg, unit), unit), reps: record.reps }
            : undefined,
        };
      }),
    [results, addedIds, bestPr, unit]
  );

  if (!group) {
    return null;
  }

  const addedCount = rows.filter((row) => row.isAdded).length;
  const placeholder = `Search ${group.label.toLowerCase()} exercises`;

  return (
    <>
      <Stack.Title>{group.label}</Stack.Title>
      {/*
        Only on iOS/Android. The web stack also honours `headerSearchBarOptions`,
        but renders it as a cramped inline field beside the back chevron, so web
        keeps its own `SearchField` instead of a second search affordance.
      */}
      {USES_NATIVE_CHROME ? (
        <Stack.SearchBar
          ref={searchBar}
          placeholder={placeholder}
          autoCapitalize="none"
          placement="integrated"
          onChangeText={(event) => setQuery(event.nativeEvent.text)}
          onSearchButtonPress={() => searchBar.current?.blur()}
        />
      ) : null}

      {/*
        The bottom toolbar holds the search bar and the add button on one row.
        `SearchBarSlot` is what keeps the search bar out of the navigation header
        and down here beside the button; without it the bar falls back to the
        header. The flexible spacer pushes the button to the trailing edge. Both
        are pinned, so neither scrolls away with the list.
      */}
      {USES_NATIVE_CHROME ? (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.SearchBarSlot />
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            icon="plus"
            variant="prominent"
            accessibilityLabel="Add exercise"
            onPress={() => setScope('library')}
          />
        </Stack.Toolbar>
      ) : null}

      <Screen
        header={
          <View style={styles.controls}>
            {USES_NATIVE_CHROME ? null : (
              <SearchField value={query} onChangeText={setQuery} placeholder={placeholder} />
            )}
            <Segmented options={SCOPES} value={scope} onChange={setScope} />
          </View>
        }>
        <Txt variant="body" tone="secondary">
          {group.blurb}
        </Txt>

        {isReady && rows.length === 0 ? (
          <EmptyState
            icon={scope === 'mine' ? 'library' : 'search'}
            title={query ? `No matches for “${query}”` : 'Nothing here yet'}
            message={
              query
                ? 'Try a shorter search, or switch to all exercises to browse the full list.'
                : scope === 'mine'
                  ? 'Add exercises from the full list and they will show up here.'
                  : `No ${group.label.toLowerCase()} exercises match that search.`
            }
            action={
              // Native shows the add button in the bottom toolbar; web has no
              // toolbar, so it keeps the in-content action.
              !USES_NATIVE_CHROME && scope === 'mine' && !query
                ? { label: 'Browse all exercises', onPress: () => setScope('library') }
                : undefined
            }
          />
        ) : null}

        {rows.length > 0 ? (
          <>
            <View style={styles.listHeader}>
              <Txt variant="caption" tone="secondary" eyebrow>
                {`${addedCount} added · ${rows.length} shown`}
              </Txt>
            </View>
            <View style={styles.list}>
              {rows.map(({ exercise, isAdded, best }) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  isAdded={isAdded}
                  best={best}
                  onPress={() =>
                    router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
                  }
                />
              ))}
            </View>
          </>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: Spacing.three,
  },
  listHeader: {
    paddingTop: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
});
