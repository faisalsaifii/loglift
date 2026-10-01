import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Txt } from '@/components/txt';
import { Card, Chip, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { getExercise, MUSCLE_GROUPS, type Exercise } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';
import { useLibrary, type PrEntry } from '@/store/library';
import { formatRelativeDate, formatWeight, fromKg, pluralize, type WeightUnit } from '@/utils/weight';

export default function ProgressScreen() {
  const router = useRouter();
  const { stats, recentPrs, unit, isReady } = useLibrary();

  const heaviest = recentPrs.reduce<{ entry: PrEntry; exerciseId: string } | undefined>(
    (best, current) => (!best || current.entry.weightKg > best.entry.weightKg ? current : best),
    undefined
  );

  return (
    <Screen>
      <Stack.Title>Progress</Stack.Title>

      <Txt variant="body" tone="secondary">
        Every set you log, newest first.
      </Txt>

      {isReady && recentPrs.length === 0 ? (
        <EmptyState
          icon="trophy"
          title="No sets logged yet"
          message="Open any exercise and log your first set to start building history."
          action={{
            label: 'Browse chest',
            onPress: () => router.push({ pathname: '/muscle/[muscle]', params: { muscle: 'chest' } }),
          }}
        />
      ) : null}

      {recentPrs.length > 0 ? (
        <>
          <Summary stats={stats} heaviest={heaviest} unit={unit} />
          <Breakdown total={stats.totalPrs} counts={stats.byGroup} />
          <History entries={recentPrs.slice(0, 40)} unit={unit} />
          {recentPrs.length > 40 ? (
            <Txt variant="caption" tone="secondary">
              {pluralize(recentPrs.length - 40, 'older set')} not shown
            </Txt>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function Summary({
  stats,
  heaviest,
  unit,
}: {
  stats: ReturnType<typeof useLibrary>['stats'];
  heaviest?: { entry: PrEntry };
  unit: WeightUnit;
}) {
  return (
    <View style={styles.summaryRow}>
      <Card style={styles.summaryCard} padded={false}>
        <SummaryTile label="Sets logged" value={String(stats.totalPrs)} />
      </Card>
      <Card style={styles.summaryCard} padded={false}>
        <SummaryTile
          label="Heaviest lift"
          value={heaviest ? formatWeight(fromKg(heaviest.entry.weightKg, unit), unit) : '—'}
        />
      </Card>
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Txt variant="caption" tone="secondary" eyebrow>
        {label}
      </Txt>
      <Txt variant="title" numberOfLines={1}>
        {value}
      </Txt>
    </View>
  );
}

function Breakdown({
  total,
  counts,
}: {
  total: number;
  counts: ReturnType<typeof useLibrary>['stats']['byGroup'];
}) {
  const colors = useTheme();

  return (
    <View style={styles.breakdown}>
      <Txt variant="heading">By body part</Txt>
      <View style={styles.bars}>
        {MUSCLE_GROUPS.map((group) => (
          <BreakdownBar
            key={group.id}
            label={group.label}
            count={counts[group.id]?.prs ?? 0}
            total={total}
            trackColor={colors.surfaceSunken}
          />
        ))}
      </View>
    </View>
  );
}

function BreakdownBar({
  label,
  count,
  total,
  trackColor,
}: {
  label: string;
  count: number;
  total: number;
  trackColor: string;
}) {
  const colors = useTheme();
  const ratio = total === 0 ? 0 : count / total;

  return (
    <View style={styles.barRow}>
      <Txt variant="label" style={styles.barLabel} numberOfLines={1}>
        {label}
      </Txt>
      <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: count > 0 ? colors.text : 'transparent',
              width: `${Math.max(ratio * 100, count > 0 ? 4 : 0)}%`,
            },
          ]}
        />
      </View>
      <Txt variant="caption" tone="secondary" style={styles.barCount}>
        {count}
      </Txt>
    </View>
  );
}

function History({
  entries,
  unit,
}: {
  entries: { entry: PrEntry; exerciseId: string }[];
  unit: WeightUnit;
}) {
  const colors = useTheme();
  const router = useRouter();

  return (
    <View style={styles.history}>
      <Txt variant="heading">History</Txt>
      <Card padded={false}>
        {entries.map(({ entry, exerciseId }, index) => {
          const exercise = getExercise(exerciseId);
          if (!exercise) {
            return null;
          }
          return (
            <HistoryRow
              key={entry.id}
              exercise={exercise}
              entry={entry}
              unit={unit}
              divider={index > 0 ? colors.border : undefined}
              onPress={() =>
                router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
              }
            />
          );
        })}
      </Card>
    </View>
  );
}

function HistoryRow({
  exercise,
  entry,
  unit,
  divider,
  onPress,
}: {
  exercise: Exercise;
  entry: PrEntry;
  unit: WeightUnit;
  divider?: string;
  onPress: () => void;
}) {
  const colors = useTheme();

  return (
    <Card
      padded={false}
      onPress={onPress}
      accessibilityLabel={`${exercise.name}, ${formatWeight(fromKg(entry.weightKg, unit), unit)} for ${entry.reps} reps`}
      style={[
        styles.historyCard,
        divider
          ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }
          : null,
      ]}>
      <View style={styles.historyText}>
        <Txt variant="subheading" numberOfLines={1}>
          {exercise.name}
        </Txt>
        <Txt variant="caption" tone="secondary">
          {formatRelativeDate(entry.date)}
        </Txt>
      </View>
      <Chip label={`${formatWeight(fromKg(entry.weightKg, unit), unit)} × ${entry.reps}`} filled />
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  summaryCard: {
    flex: 1,
  },
  summaryTile: {
    gap: Spacing.one,
    padding: Spacing.four,
  },
  breakdown: {
    gap: Spacing.three,
  },
  bars: {
    gap: Spacing.three,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  barLabel: {
    width: 84,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barCount: {
    width: 28,
    textAlign: 'right',
  },
  history: {
    gap: Spacing.three,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,
    borderWidth: 0,
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
});
