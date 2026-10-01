import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type { SearchBarCommands } from 'react-native-screens';

import { SearchField } from '@/components/controls';
import { ExerciseRow } from '@/components/exercise-row';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getMuscleGroup, searchAllExercises } from '@/data/exercises';
import { useLibrary } from '@/store/library';
import { formatWeight, fromKg } from '@/utils/weight';

/**
 * Results shown per query. The catalogue has well over a thousand movements, so
 * a matching query can otherwise return a list nobody scrolls to the end of.
 */
const RESULT_LIMIT = 80;

/**
 * Web has no `Stack.Toolbar`, so the native bottom search slot is unavailable
 * there and the screen renders its own `SearchField` instead of two search UIs.
 */
const USES_NATIVE_CHROME = Platform.OS !== 'web';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchBar = useRef<SearchBarCommands>(null);
  const { addedIds, bestPr, unit } = useLibrary();

  const trimmed = query.trim();

  const rows = useMemo(
    () =>
      searchAllExercises(trimmed, { limit: RESULT_LIMIT }).map((exercise) => {
        const record = bestPr(exercise.id);
        return {
          exercise,
          isAdded: addedIds.has(exercise.id),
          groupLabel: getMuscleGroup(exercise.group)?.label,
          best: record
            ? { text: formatWeight(fromKg(record.weightKg, unit), unit), reps: record.reps }
            : undefined,
        };
      }),
    [trimmed, addedIds, bestPr, unit]
  );

  return (
    <>
      <Stack.Title>Search</Stack.Title>

      {/*
        A single search bar, bound to JS state. Deliberately no `role="search"`
        on this tab: that makes UIKit draw its *own* field in the tab bar, which
        would sit on top of this one.
      */}
      {USES_NATIVE_CHROME ? (
        <Stack.SearchBar
          ref={searchBar}
          placeholder="Search all exercises"
          autoCapitalize="none"
          placement="integrated"
          onChangeText={(event) => setQuery(event.nativeEvent.text)}
          onSearchButtonPress={() => searchBar.current?.blur()}
        />
      ) : null}

      {USES_NATIVE_CHROME ? (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.SearchBarSlot />
        </Stack.Toolbar>
      ) : null}

      <Screen
        header={
          USES_NATIVE_CHROME ? null : (
            <SearchField value={query} onChangeText={setQuery} placeholder="Search all exercises" />
          )
        }>
        {trimmed && rows.length > 0 ? (
          <Txt variant="caption" tone="secondary" eyebrow>
            {`${rows.length} ${rows.length === 1 ? 'match' : 'matches'} across all muscles`}
          </Txt>
        ) : null}

        {trimmed && rows.length === 0 ? (
          <EmptyState
            icon="search"
            title={`No matches for “${trimmed}”`}
            message="Check the spelling, or try a broader term like the equipment you have or the muscle you want to hit."
          />
        ) : null}

        {!trimmed ? (
          <EmptyState
            icon="search"
            title="Search every exercise"
            message="Find any movement in the catalogue without picking a body part first. Results are ranked by how closely the name matches."
          />
        ) : null}

        {rows.length > 0 ? (
          <View style={styles.list}>
            {rows.map(({ exercise, isAdded, best, groupLabel }) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                isAdded={isAdded}
                best={best}
                groupLabel={groupLabel}
                onPress={() =>
                  router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
                }
              />
            ))}
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
});
