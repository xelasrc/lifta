"use client";

import { useEffect, useState } from "react";
import { listSetsForExercise } from "@/lib/db/history";
import { getWorkoutsByIds } from "@/lib/db/workouts";
import type { Workout, WorkoutSet } from "@/lib/db/types";

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

function RecordTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-xl font-bold text-accent">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

// Reusable content (no page chrome) so it can sit inside the dedicated
// exercise-stats page and also be embedded inline while logging a set.
export function ExerciseStatsPanel({
  exerciseId,
  refreshToken,
  excludeWorkoutId,
}: {
  exerciseId: string;
  refreshToken?: number;
  // Hide this workout's sets from "Previous" — used while actively logging
  // into it, since they're already shown in the current-session list above.
  excludeWorkoutId?: string;
}) {
  const [sets, setSets] = useState<WorkoutSet[] | null>(null);
  const [workouts, setWorkouts] = useState<Map<string, Workout>>(new Map());

  useEffect(() => {
    listSetsForExercise(exerciseId).then(async (rows) => {
      setSets(rows);
      const uniqueWorkoutIds = Array.from(new Set(rows.map((s) => s.workoutId)));
      const found = await getWorkoutsByIds(uniqueWorkoutIds);
      setWorkouts(new Map(found.map((w) => [w.id, w])));
    });
  }, [exerciseId, refreshToken]);

  if (!sets) {
    return <div className="h-24 animate-pulse rounded-2xl bg-surface" />;
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
  const previousSets = excludeWorkoutId ? sets.filter((s) => s.workoutId !== excludeWorkoutId) : sets;
  const groups = groupByWorkout(previousSets);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-muted">Personal Records</p>
      <div className="grid grid-cols-2 gap-3">
        <RecordTile value={bestVolume ? `${volumeOf(bestVolume)}kg` : "—"} label="Volume" />
        <RecordTile value={best1RM ? `${best1RM.weightKg ?? 0}kg` : "—"} label="1RM" />
      </div>

      {previousSets.length === 0 && <p className="text-sm text-muted">No history yet.</p>}
      {groups.map((group) => {
        const workout = workouts.get(group.workoutId);
        return (
          <div key={group.workoutId} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{workout?.title ?? "Workout"}</p>
              <p className="text-sm text-muted">{new Date(group.sets[0].createdAt).toLocaleDateString()}</p>
            </div>
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
  );
}
