"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listSetsForWorkout, deleteSet } from "@/lib/db/sets";
import { getExercise } from "@/lib/db/exercises";
import { completeWorkout, getWorkoutById, updateWorkoutDetails } from "@/lib/db/workouts";
import type { Workout, WorkoutSet } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";

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

export function AddSetsScreen({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sets, setSets] = useState<SetRow[] | null>(null);
  const [ending, setEnding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [splitDayDraft, setSplitDayDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getWorkoutById(workoutId).then((w) => setWorkout(w ?? null));
    fetchSetRows(workoutId).then(setSets);
  }, [workoutId]);

  async function handleEndWorkout() {
    if (!window.confirm("End this workout? You won't be able to add more sets to it after.")) return;
    setEnding(true);
    await completeWorkout(workoutId);
    router.push("/");
  }

  async function handleDelete(setId: string) {
    if (!window.confirm("Delete this set?")) return;
    await deleteSet(setId);
    setSets(await fetchSetRows(workoutId));
  }

  function startEditing() {
    if (!workout) return;
    setTitleDraft(workout.title);
    setSplitDayDraft(workout.splitDay ?? "");
    setEditing(true);
    requestAnimationFrame(() => titleInputRef.current?.select());
  }

  async function commitEdit() {
    if (!workout) return;
    const title = titleDraft.trim() || workout.title;
    const splitDay = splitDayDraft.trim() || null;
    setWorkout({ ...workout, title, splitDay });
    setEditing(false);
    await updateWorkoutDetails(workoutId, { title, splitDay });
  }

  function handleEditKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") commitEdit();
    if (event.key === "Escape") setEditing(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/" aria-label="Back to home" className="pt-1 text-2xl font-bold text-white">
            &lsaquo;
          </Link>

          {workout ? (
            editing ? (
              <div className="flex flex-1 flex-col gap-2 pt-0.5">
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Workout name"
                  className="border-b border-white/20 bg-transparent pb-1 text-2xl font-bold text-white outline-none"
                />
                <input
                  value={splitDayDraft}
                  onChange={(event) => setSplitDayDraft(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Split day (e.g. Push)"
                  className="border-b border-white/20 bg-transparent pb-1 text-sm font-semibold text-accent outline-none"
                />
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-white">{workout.title}</p>
                {workout.splitDay && <p className="text-sm font-semibold text-accent">{workout.splitDay}</p>}
              </div>
            )
          ) : (
            <div className="h-8 w-40 animate-pulse rounded bg-surface" />
          )}
        </div>

        {workout && (
          <button
            type="button"
            onClick={editing ? commitEdit : startEditing}
            aria-label={editing ? "Save workout details" : "Edit workout details"}
            className="pt-1 text-muted hover:text-white"
          >
            {editing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push(`/workout/${workoutId}/new-set`)}
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
        className="mt-auto mb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-full bg-accent py-4 font-bold text-white disabled:opacity-60"
      >
        End Workout
      </button>
    </div>
  );
}
