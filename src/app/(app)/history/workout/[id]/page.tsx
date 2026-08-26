"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWorkoutDetail, getWorkoutCategories } from "@/lib/db/history";
import { deleteWorkout } from "@/lib/db/workouts";
import type { Exercise, Workout, WorkoutSet } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";

type Group = { exercise: Exercise | undefined; sets: WorkoutSet[] };

export default function HistoryWorkoutPage(props: PageProps<"/history/workout/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getWorkoutDetail(id).then((detail) => {
      setWorkout(detail.workout ?? null);
      setGroups(detail.groups);
    });
    getWorkoutCategories(id).then(setCategories);
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    setDeleting(true);
    await deleteWorkout(id);
    router.push("/history");
  }

  if (!workout) {
    return (
      <div className="flex flex-1 flex-col px-3 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/history" aria-label="Back" className="text-2xl font-bold text-white">
            &lsaquo;
          </Link>
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete workout"
          className="text-muted hover:text-accent disabled:opacity-60"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-2xl bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-white">{workout.title}</p>
          <p className="text-sm text-muted">{new Date(workout.startedAt).toLocaleDateString()}</p>
        </div>
        {workout.splitDay && <p className="mt-1 text-sm font-semibold text-accent">{workout.splitDay}</p>}
        {categories.length > 0 && <p className="mt-1 text-sm text-accent">{categories.join(", ")}</p>}
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.exercise?.id ?? group.sets[0]?.id} className="flex flex-col gap-2">
            {group.exercise ? (
              <Link
                href={`/history/workout/${id}/exercise/${group.exercise.id}`}
                className="font-semibold text-white"
              >
                {group.exercise.name} <span className="text-accent">&rsaquo;</span>
              </Link>
            ) : (
              <p className="font-semibold text-white">Exercise</p>
            )}
            {group.sets.map((set, i) => (
              <div
                key={set.id}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
              >
                <p className="font-semibold text-white">Set {i + 1}</p>
                <div className="text-right text-sm text-muted">
                  <p>Reps: {set.reps}</p>
                  <p>Weight: {set.weightKg ?? 0}kg</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
