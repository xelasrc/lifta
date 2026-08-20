"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listSetsForWorkout, deleteSet } from "@/lib/db/sets";
import { getExercise } from "@/lib/db/exercises";
import { completeWorkout } from "@/lib/db/workouts";
import type { WorkoutSet } from "@/lib/db/schema";
import { TrashIcon } from "@/components/icons/trash-icon";

type SetRow = WorkoutSet & { exerciseName: string };

async function fetchSetRows(workoutId: string): Promise<SetRow[]> {
  const rows = await listSetsForWorkout(workoutId);
  return Promise.all(
    rows.map(async (set) => {
      const exercise = await getExercise(set.exerciseId);
      return { ...set, exerciseName: exercise?.name ?? "Exercise" };
    }),
  );
}

export default function AddSetsPage(props: PageProps<"/workout/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();
  const [sets, setSets] = useState<SetRow[] | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    fetchSetRows(id).then(setSets);
  }, [id]);

  async function handleEndWorkout() {
    setEnding(true);
    await completeWorkout(id);
    router.push("/");
  }

  async function handleDelete(setId: string) {
    if (!window.confirm("Delete this set?")) return;
    await deleteSet(setId);
    setSets(await fetchSetRows(id));
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="text-2xl font-bold text-white">Add Sets</h1>

      <button
        type="button"
        onClick={() => router.push(`/workout/${id}/new-set`)}
        className="flex h-32 items-center justify-center rounded-2xl bg-surface text-accent"
        aria-label="Add set"
      >
        <span className="text-4xl leading-none">+</span>
      </button>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Recent sets</p>

        {sets === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

        {sets?.length === 0 && <p className="text-sm text-muted">No sets logged yet.</p>}

        {sets?.map((set, i) => (
          <div
            key={set.id}
            className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
          >
            <div>
              <p className="font-semibold text-white">
                {set.exerciseName} · Set {i + 1}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-muted">
                <p>Reps: {set.reps}</p>
                <p>Weight: {set.weightKg ?? 0}kg</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(set.id)}
                aria-label={`Delete ${set.exerciseName} set ${i + 1}`}
                className="text-muted hover:text-accent"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleEndWorkout}
        disabled={ending}
        className="mt-auto rounded-full bg-accent py-4 font-bold text-white disabled:opacity-60"
      >
        End Workout
      </button>
    </div>
  );
}
