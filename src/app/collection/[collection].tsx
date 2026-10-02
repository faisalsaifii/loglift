import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import type { SearchBarCommands } from 'react-native-screens';

import { SearchField } from '@/components/controls';
import { ExerciseRow } from '@/components/exercise-row';
import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  browseCollection,
  getCollection,
  getMuscleGroup,
  type Exercise,
} from '@/data/exercises';
import { useLibrary } from '@/store/library';
import { formatWeight, fromKg, pluralize } from '@/utils/weight';

/**
 * Web ignores `Stack.Toolbar`, so the native bottom search slot is unavailable
 * there and the screen renders its own `SearchField` instead of two search UIs.
 */
const USES_NATIVE_CHROME = Platform.OS !== 'web';

/**
 * One catalogue entry plus the two pieces of state that differ per row. Holding
 * the `Exercise` itself (rather than an id to look up again) keeps `renderItem`
 * free of catalogue lookups.
 */
type Row = {
  exercise: Exercise;
  isAdded: boolean;
  /** Body part, shown because a collection can span several muscles. */
  groupLabel: string | undefined;
  best: { text: string; reps: number } | undefined;
};

export default function CollectionScreen() {
  const { collection } = useLocalSearchParams<{ collection: string }>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchBar = useRef<SearchBarCommands>(null);
  const { addedIds, bestPr, unit, stats } = useLibrary();

  const current = getCollection(collection);

  // Resolving and formatting every row's best set on each keystroke would be
  // wasted work, so it is derived once per result set.
  const rows = useMemo<Row[]>(
    () =>
      current
        ? browseCollection(current.id, query).map((exercise) => {
            const record = bestPr(exercise.id);
            return {
              exercise,
              isAdded: addedIds.has(exercise.id),
              groupLabel: getMuscleGroup(exercise.group)?.label,
              best: record
                ? {
                    text: formatWeight(fromKg(record.weightKg, unit), unit),
                    reps: record.reps,
                  }
                : undefined,
            };
          })
        : [],
    [current, query, addedIds, bestPr, unit],
  );

  const trimmed = query.trim();

  if (!current) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          icon="search"
          title="Collection not found"
          message="That collection is no longer in the catalogue."
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Title>{current.label}</Stack.Title>

      {USES_NATIVE_CHROME ? (
        <Stack.SearchBar
          ref={searchBar}
          placeholder={`Search ${current.label.toLowerCase()} exercises`}
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

      {/*
        The per-muscle screens cap their lists and render them with `.map()`
        inside a `ScrollView`, but a collection is a union of whole body parts —
        hundreds of rows — so this gets a `FlatList`. That also makes the
        `recyclingKey` on `ExerciseRow`'s thumbnail actually recycle, so only the
        handful of visible GIFs are ever decoded.
      */}
      <Screen
        scroll={false}
        contentStyle={styles.body}
        header={
          USES_NATIVE_CHROME ? null : (
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${current.label.toLowerCase()} exercises`}
            />
          )
        }
      >
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          // `Screen` is non-scrolling here, so this list owns its own inset for
          // the native bar. See the note in `Screen`.
          contentInsetAdjustmentBehavior="automatic"
          data={rows}
          keyExtractor={(row) => row.exercise.id}
          renderItem={({ item }) => (
            <ExerciseRow
              exercise={item.exercise}
              isAdded={item.isAdded}
              best={item.best}
              groupLabel={item.groupLabel}
              onPress={() =>
                router.push({
                  pathname: '/exercise/[id]',
                  params: { id: item.exercise.id },
                })
              }
            />
          )}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Txt
                variant="caption"
                tone="secondary"
                eyebrow
                style={styles.counts}
              >
                {trimmed
                  ? `${pluralize(rows.length, 'match', 'matches')} for “${trimmed}”`
                  : `${pluralize(rows.length, 'exercise')} · ${stats.totalExercises} in your library`}
              </Txt>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title={`No matches for “${trimmed}”`}
              message="Check the spelling, or try a broader term like the equipment you have or the muscle you want to hit."
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
        />
      </Screen>
    </>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.seven,
  },
  listHeader: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  counts: {
    marginTop: Spacing.two,
  },
  separator: {
    height: Spacing.three,
  },
});
