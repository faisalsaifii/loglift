import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getExercise, type MuscleGroupId } from '@/data/exercises';
import type { WeightUnit } from '@/utils/weight';
import { toKg } from '@/utils/weight';

const STORAGE_KEY = 'loglift.state.v1';

/** A single logged personal record. Weight is always kilograms internally. */
export type PrEntry = {
  id: string;
  /** Kilograms. Converted at render time so the display unit can change freely. */
  weightKg: number;
  reps: number;
  /** ISO timestamp of the set. */
  date: string;
};

export type ExerciseLog = {
  /** Exercise id from the catalogue. */
  id: string;
  addedAt: string;
  prs: PrEntry[];
};

type PersistedState = {
  unit: WeightUnit;
  logs: Record<string, ExerciseLog>;
};

const EMPTY_STATE: PersistedState = { unit: 'kg', logs: {} };

type BestPr = {
  weightKg: number;
  reps: number;
  date: string;
};

type LibraryContextValue = {
  /** False until the persisted state has been read back from storage. */
  isReady: boolean;
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  /** Every exercise the user has added to their library, newest first. */
  library: ExerciseLog[];
  addedIds: ReadonlySet<string>;
  isAdded: (exerciseId: string) => boolean;
  toggleAdded: (exerciseId: string) => void;
  getLog: (exerciseId: string) => ExerciseLog | undefined;
  getPrs: (exerciseId: string) => PrEntry[];
  addPr: (exerciseId: string, weightKg: number, reps: number) => void;
  removePr: (exerciseId: string, prId: string) => void;
  /** Heaviest logged set for an exercise, with the reps it was done for. */
  bestPr: (exerciseId: string) => BestPr | undefined;
  /** Per-body-part counts of library exercises and total logged PRs. */
  stats: {
    totalExercises: number;
    totalPrs: number;
    byGroup: Record<MuscleGroupId, { exercises: number; prs: number }>;
  };
  /** Flat, newest-first list of every PR with its exercise resolved. */
  recentPrs: { entry: PrEntry; exerciseId: string }[];
  clearAll: () => void;
};

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortPrs(prs: PrEntry[]): PrEntry[] {
  return [...prs].sort((a, b) => {
    if (a.weightKg !== b.weightKg) {
      return b.weightKg - a.weightKg;
    }
    return b.reps - a.reps;
  });
}

/** Tolerant JSON parse: corrupt storage must never stop the app from booting. */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sanitise(value: unknown): PersistedState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return EMPTY_STATE;
  }
  const candidate = value as Partial<PersistedState>;
  const logs: Record<string, ExerciseLog> = {};

  if (candidate.logs && typeof candidate.logs === 'object' && !Array.isArray(candidate.logs)) {
    for (const [id, log] of Object.entries(candidate.logs)) {
      if (!getExercise(id) || !log || typeof log !== 'object') {
        continue;
      }
      const prs = Array.isArray(log.prs)
        ? log.prs
            .filter(
              (pr): pr is PrEntry =>
                !!pr &&
                typeof pr.weightKg === 'number' &&
                Number.isFinite(pr.weightKg) &&
                typeof pr.reps === 'number' &&
                Number.isFinite(pr.reps) &&
                pr.reps > 0
            )
            .map((pr) => ({
              id: typeof pr.id === 'string' ? pr.id : createId(),
              weightKg: pr.weightKg,
              reps: pr.reps,
              date: typeof pr.date === 'string' ? pr.date : new Date(0).toISOString(),
            }))
        : [];
      logs[id] = {
        id,
        addedAt: typeof log.addedAt === 'string' ? log.addedAt : new Date().toISOString(),
        prs: sortPrs(prs),
      };
    }
  }

  return {
    unit: candidate.unit === 'lb' ? 'lb' : 'kg',
    logs,
  };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(EMPTY_STATE);
  const [isReady, setIsReady] = useState(false);

  // Mutations must be able to read the newest state synchronously, and they must
  // not run inside a `setState` updater: React re-invokes updaters (StrictMode,
  // concurrent renders), which would persist a payload the UI never showed.
  const stateRef = useRef<PersistedState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) {
          return;
        }
        const restored = raw ? sanitise(parseJson(raw)) : EMPTY_STATE;
        stateRef.current = restored;
        setState(restored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Writes are fire-and-forget: the UI state is the source of truth and a failed
  // write should never block a tap.
  const persist = useCallback((next: PersistedState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const mutate = useCallback(
    (updater: (current: PersistedState) => PersistedState) => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      setState(next);
      persist(next);
    },
    [persist]
  );

  const setUnit = useCallback(
    (unit: WeightUnit) => mutate((current) => ({ ...current, unit })),
    [mutate]
  );

  const toggleAdded = useCallback(
    (exerciseId: string) => {
      if (!getExercise(exerciseId)) {
        return;
      }
      mutate((current) => {
        const logs = { ...current.logs };
        if (logs[exerciseId]) {
          // Removing an exercise drops its history with it — the library is the
          // user's list of what they track, not an archive.
          delete logs[exerciseId];
        } else {
          logs[exerciseId] = { id: exerciseId, addedAt: new Date().toISOString(), prs: [] };
        }
        return { ...current, logs };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    [mutate]
  );

  const addPr = useCallback(
    (exerciseId: string, weightKg: number, reps: number) => {
      if (!getExercise(exerciseId) || !(weightKg > 0) || !(reps > 0)) {
        return;
      }
      mutate((current) => {
        const existing = current.logs[exerciseId];
        const log: ExerciseLog = existing ?? {
          id: exerciseId,
          addedAt: new Date().toISOString(),
          prs: [],
        };
        const entry: PrEntry = {
          id: createId(),
          weightKg,
          reps,
          date: new Date().toISOString(),
        };
        return {
          ...current,
          logs: { ...current.logs, [exerciseId]: { ...log, prs: sortPrs([...log.prs, entry]) } },
        };
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    [mutate]
  );

  const removePr = useCallback(
    (exerciseId: string, prId: string) => {
      mutate((current) => {
        const existing = current.logs[exerciseId];
        if (!existing) {
          return current;
        }
        return {
          ...current,
          logs: {
            ...current.logs,
            [exerciseId]: { ...existing, prs: existing.prs.filter((pr) => pr.id !== prId) },
          },
        };
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    [mutate]
  );

  const clearAll = useCallback(() => {
    mutate(() => ({ unit: 'kg', logs: {} }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [mutate]);

  const value = useMemo<LibraryContextValue>(() => {
    const logs = state.logs;
    const library = Object.values(logs).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    const addedIds = new Set(Object.keys(logs));

    const byGroup = {
      chest: { exercises: 0, prs: 0 },
      back: { exercises: 0, prs: 0 },
      shoulders: { exercises: 0, prs: 0 },
      biceps: { exercises: 0, prs: 0 },
      triceps: { exercises: 0, prs: 0 },
      legs: { exercises: 0, prs: 0 },
      core: { exercises: 0, prs: 0 },
    } satisfies Record<MuscleGroupId, { exercises: number; prs: number }>;

    let totalPrs = 0;
    const recentPrs: { entry: PrEntry; exerciseId: string }[] = [];

    for (const log of library) {
      const exercise = getExercise(log.id);
      if (exercise) {
        byGroup[exercise.group].exercises += 1;
        byGroup[exercise.group].prs += log.prs.length;
      }
      totalPrs += log.prs.length;
      for (const entry of log.prs) {
        recentPrs.push({ entry, exerciseId: log.id });
      }
    }

    recentPrs.sort((a, b) => b.entry.date.localeCompare(a.entry.date));

    return {
      isReady,
      unit: state.unit,
      setUnit,
      library,
      addedIds,
      isAdded: (id) => addedIds.has(id),
      toggleAdded,
      getLog: (id) => logs[id],
      getPrs: (id) => logs[id]?.prs ?? [],
      addPr,
      removePr,
      bestPr: (id) => {
        const best = logs[id]?.prs[0];
        if (!best) {
          return undefined;
        }
        return { weightKg: best.weightKg, reps: best.reps, date: best.date };
      },
      stats: {
        totalExercises: library.length,
        totalPrs,
        byGroup,
      },
      recentPrs,
      clearAll,
    };
  }, [state, isReady, setUnit, toggleAdded, addPr, removePr, clearAll]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used inside a LibraryProvider');
  }
  return context;
}

/** Convenience for screens that only care about a single exercise's history. */
export function useExerciseLog(exerciseId: string | undefined) {
  const library = useLibrary();
  const exercise = getExercise(exerciseId);

  return useMemo(
    () => ({
      exercise,
      isAdded: exerciseId ? library.isAdded(exerciseId) : false,
      toggleAdded: () => {
        if (exerciseId) {
          library.toggleAdded(exerciseId);
        }
      },
      prs: exerciseId ? library.getPrs(exerciseId) : [],
      best: exerciseId ? library.bestPr(exerciseId) : undefined,
    }),
    [library, exerciseId, exercise]
  );
}

export { toKg };
