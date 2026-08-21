"use client";

import { use, useEffect, useState } from "react";
import { listSetsForExercise } from "@/lib/db/history";
import { getExercise } from "@/lib/db/exercises";
import type { Exercise, WorkoutSet } from "@/lib/db/types";

export default function ExerciseHistoryPage(
  props: PageProps<"/history/workout/[id]/exercise/[exerciseId]">,
) {
  const { exerciseId } = use(props.params);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<WorkoutSet[] | null>(null);

  useEffect(() => {
    getExercise(exerciseId).then((e) => setExercise(e ?? null));
    listSetsForExercise(exerciseId).then(setSets);
  }, [exerciseId]);

  if (!sets) {
    return (
      <div className="flex flex-1 flex-col px-3 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  const best = sets.reduce<WorkoutSet | null>(
    (max, s) => (max === null || (s.weightKg ?? 0) > (max.weightKg ?? 0) ? s : max),
    null,
  );
  const first = sets.length > 0 ? sets[sets.length - 1] : null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">{exercise?.name ?? "Exercise"}</h1>

      <div className="flex flex-col gap-2">
        {best && (
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <p className="font-semibold text-white">Best: {new Date(best.createdAt).toLocaleDateString()}</p>
            <div className="text-right text-sm text-muted">
              <p>Reps: {best.reps}</p>
              <p>Weight: {best.weightKg ?? 0}kg</p>
            </div>
          </div>
        )}
        {first && (
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <p className="font-semibold text-white">First: {new Date(first.createdAt).toLocaleDateString()}</p>
            <div className="text-right text-sm text-muted">
              <p>Reps: {first.reps}</p>
              <p>Weight: {first.weightKg ?? 0}kg</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Previous</p>
        {sets.length === 0 && <p className="text-sm text-muted">No history yet.</p>}
        {sets.map((set) => (
          <div key={set.id} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <p className="font-semibold text-white">{new Date(set.createdAt).toLocaleDateString()}</p>
            <div className="text-right text-sm text-muted">
              <p>Reps: {set.reps}</p>
              <p>Weight: {set.weightKg ?? 0}kg</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
