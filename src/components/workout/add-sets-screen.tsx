"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteSet } from "@/lib/db/sets";
import { getWorkoutDetail } from "@/lib/db/history";
import {
  completeWorkout,
  deleteWorkout,
  deriveWorkoutTitle,
  getWorkoutById,
  updateWorkoutDetails,
} from "@/lib/db/workouts";
import type { Exercise, Workout, WorkoutSet } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";

type Group = { exercise: Exercise | undefined; sets: WorkoutSet[] };

export function AddSetsScreen({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [ending, setEnding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [splitDayDraft, setSplitDayDraft] = useState("");
  const splitDayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getWorkoutById(workoutId).then((w) => setWorkout(w ?? null));
    getWorkoutDetail(workoutId).then((detail) => setGroups(detail.groups));
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
    setGroups((await getWorkoutDetail(workoutId)).groups);
  }

  async function handleDeleteWorkout() {
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    await deleteWorkout(workoutId);
    router.push("/");
  }

  function startEditing() {
    if (!workout) return;
    setSplitDayDraft(workout.splitDay ?? "");
    setEditing(true);
    requestAnimationFrame(() => splitDayInputRef.current?.select());
  }

  async function commitEdit() {
    if (!workout) return;
    const splitDay = splitDayDraft.trim() || null;
    const title = deriveWorkoutTitle(splitDay);
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
              <input
                ref={splitDayInputRef}
                value={splitDayDraft}
                onChange={(event) => setSplitDayDraft(event.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder="Split day (e.g. Push, Legs)"
                className="flex-1 border-b border-white/20 bg-transparent pb-1 text-2xl font-bold text-white outline-none"
              />
            ) : (
              <p className="text-2xl font-bold text-white">{workout.title}</p>
            )
          ) : (
            <div className="h-8 w-40 animate-pulse rounded bg-surface" />
          )}
        </div>

        {workout && (
          <div className="flex items-center gap-4 pt-1">
            {!editing && (
              <button
                type="button"
                onClick={handleDeleteWorkout}
                aria-label="Delete workout"
                className="text-muted hover:text-accent"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={editing ? commitEdit : startEditing}
              aria-label={editing ? "Save workout details" : "Edit workout details"}
              className={editing ? "text-accent" : "text-muted hover:text-white"}
            >
              {editing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
            </button>
          </div>
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

      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-muted">Recent sets</p>

        {groups === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

        {groups?.length === 0 && <p className="text-sm text-muted">No sets logged yet.</p>}

        {groups?.map((group) => (
          <div key={group.exercise?.id ?? group.sets[0]?.id} className="rounded-2xl bg-surface p-4">
            {group.exercise ? (
              <Link
                href={`/history/workout/${workoutId}/exercise/${group.exercise.id}`}
                className="flex items-center justify-between border-b border-white/10 pb-3 font-semibold text-white"
              >
                {group.exercise.name} <span className="text-accent">&rsaquo;</span>
              </Link>
            ) : (
              <p className="border-b border-white/10 pb-3 font-semibold text-white">Exercise</p>
            )}
            <div className="divide-y divide-white/10">
              {group.sets.map((set, i) => (
                <div key={set.id} className="flex items-center justify-between py-3">
                  <p className="font-semibold text-white">Set {i + 1}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted">
                      {set.reps} x {set.weightKg ?? 0}kg
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(set.id)}
                      aria-label={`Delete ${group.exercise?.name ?? "exercise"} set ${i + 1}`}
                      className="text-muted hover:text-accent"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
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
