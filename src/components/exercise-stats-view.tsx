"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listSetsForExercise } from "@/lib/db/history";
import { getExercise } from "@/lib/db/exercises";
import { getWorkoutsByIds } from "@/lib/db/workouts";
import type { Exercise, Workout, WorkoutSet } from "@/lib/db/types";

function volumeOf(set: WorkoutSet): number {
  return set.reps * (set.weightKg ?? 0);
}

function bestBy(sets: WorkoutSet[], score: (set: WorkoutSet) => number): WorkoutSet | null {
  return sets.reduce<WorkoutSet | null>(
    (max, s) => (max === null || score(s) > score(max) ? s : max),
    null,
  );
}

function groupByWorkout(sets: WorkoutSet[]): { workoutId: string; sets: WorkoutSet[] }[] {
  const groups: { workoutId: string; sets: WorkoutSet[] }[] = [];
  for (const set of sets) {
    const group = groups.find((g) => g.workoutId === set.workoutId);
    if (group) group.sets.push(set);
    else groups.push({ workoutId: set.workoutId, sets: [set] });
  }
  return groups;
}

function StatRow({
  label,
  set,
  metric,
  highlighted,
}: {
  label: string;
  set: WorkoutSet;
  metric?: number;
  highlighted?: boolean;
}) {
  const breakdown = `${set.reps} x ${set.weightKg ?? 0}kg`;
  const primaryText = metric !== undefined ? `${label}: ${metric}kg (${breakdown})` : `${label}: ${breakdown}`;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
      <p className={`font-semibold ${highlighted ? "text-accent" : "text-white"}`}>{primaryText}</p>
      <p className="text-sm text-muted">{new Date(set.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

function PlaceholderRow({ text, hint }: { text: string; hint: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
      <p className="font-semibold text-accent">{text}</p>
      <p className="text-sm text-muted">{hint}</p>
    </div>
  );
}

export function ExerciseStatsView({ exerciseId, backHref }: { exerciseId: string; backHref: string }) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<WorkoutSet[] | null>(null);
  const [workouts, setWorkouts] = useState<Map<string, Workout>>(new Map());

  useEffect(() => {
    getExercise(exerciseId).then((e) => setExercise(e ?? null));
    listSetsForExercise(exerciseId).then(async (rows) => {
      setSets(rows);
      const uniqueWorkoutIds = Array.from(new Set(rows.map((s) => s.workoutId)));
      const found = await getWorkoutsByIds(uniqueWorkoutIds);
      setWorkouts(new Map(found.map((w) => [w.id, w])));
    });
  }, [exerciseId]);

  if (!sets) {
    return (
      <div className="flex flex-1 flex-col px-3 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  // A set logged with 0 reps means the lift was attempted and failed, so it
  // shouldn't count toward any personal best no matter how heavy the weight was.
  const validSets = sets.filter((s) => s.reps > 0);
  const bestVolume = bestBy(validSets, volumeOf);
  // A real 1-rep max, not an estimate from higher-rep sets — only counts if
  // the user has actually logged a single-rep set for this exercise.
  const best1RM = bestBy(
    validSets.filter((s) => s.reps === 1),
    (s) => s.weightKg ?? 0,
  );
  const first = sets.length > 0 ? sets[sets.length - 1] : null;
  const groups = groupByWorkout(sets);

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-center gap-3">
        <Link href={backHref} aria-label="Back" className="text-2xl font-bold text-white">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-white">{exercise?.name ?? "Exercise"}</h1>
      </div>

      <div className="flex flex-col gap-2">
        {bestVolume && (
          <StatRow label="Best Volume" set={bestVolume} metric={volumeOf(bestVolume)} highlighted />
        )}
        {validSets.length > 0 &&
          (best1RM ? (
            <StatRow label="Best 1RM" set={best1RM} metric={best1RM.weightKg ?? 0} highlighted />
          ) : (
            <PlaceholderRow text="Best 1RM: —" hint="Log a single-rep set" />
          ))}
        {first && <StatRow label="First" set={first} />}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Previous</p>
        {sets.length === 0 && <p className="text-sm text-muted">No history yet.</p>}
        {groups.map((group) => {
          const workout = workouts.get(group.workoutId);
          return (
            <div key={group.workoutId} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
              <Link href={`/history/workout/${group.workoutId}`} className="flex items-center justify-between">
                <p className="font-semibold text-white">{workout?.title ?? "Workout"}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted">
                    {new Date(group.sets[0].createdAt).toLocaleDateString()}
                  </p>
                  <span className="text-accent">&rsaquo;</span>
                </div>
              </Link>
              <div className="flex flex-col gap-1">
                {group.sets.map((set, i) => (
                  <p key={set.id} className="text-sm text-muted">
                    Set {i + 1}: {set.reps} x {set.weightKg ?? 0}kg
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
