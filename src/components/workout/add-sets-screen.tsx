"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWorkoutDetail } from "@/lib/db/history";
import {
  completeWorkout,
  deleteWorkout,
  deriveWorkoutTitle,
  getWorkoutById,
  updateWorkoutDetails,
} from "@/lib/db/workouts";
import { groupIntoChains } from "@/lib/db/set-chains";
import { toDateInputValue, withDate } from "@/lib/date";
import type { CardioActivity, Exercise, Workout, WorkoutSet } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { CardioActivityCard } from "@/components/workout/cardio-activity-card";
import { AddCardioForm } from "@/components/workout/add-cardio-form";

type Group = { exercise: Exercise | undefined; sets: WorkoutSet[] };

export function AddSetsScreen({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [cardioActivities, setCardioActivities] = useState<CardioActivity[] | null>(null);
  const [ending, setEnding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [splitDayDraft, setSplitDayDraft] = useState("");
  const [dateDraft, setDateDraft] = useState("");
  const splitDayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getWorkoutById(workoutId).then((w) => setWorkout(w ?? null));
    getWorkoutDetail(workoutId).then((detail) => {
      setGroups(detail.groups);
      setCardioActivities(detail.cardioActivities);
    });
  }, [workoutId]);

  async function handleEndWorkout() {
    if (!window.confirm("End this workout? You won't be able to add more sets to it after.")) return;
    setEnding(true);
    await completeWorkout(workoutId);
    router.push("/");
  }

  async function handleDeleteWorkout() {
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    await deleteWorkout(workoutId);
    router.push("/");
  }

  function startEditing() {
    if (!workout) return;
    setSplitDayDraft(workout.splitDay ?? "");
    setDateDraft(toDateInputValue(workout.startedAt));
    setEditing(true);
    requestAnimationFrame(() => splitDayInputRef.current?.select());
  }

  async function commitEdit() {
    if (!workout) return;
    const splitDay = splitDayDraft.trim() || null;
    const title = deriveWorkoutTitle(splitDay);
    const startedAt = dateDraft ? withDate(workout.startedAt, dateDraft) : workout.startedAt;
    setWorkout({ ...workout, title, splitDay, startedAt });
    setEditing(false);
    await updateWorkoutDetails(workoutId, { title, splitDay, startedAt });
  }

  function handleEditKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") commitEdit();
    if (event.key === "Escape") setEditing(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link href="/" aria-label="Back to home" className="pt-1 text-2xl font-bold text-heading">
            &lsaquo;
          </Link>

          {workout ? (
            editing ? (
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={splitDayInputRef}
                  value={splitDayDraft}
                  onChange={(event) => setSplitDayDraft(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Split day (e.g. Push, Legs)"
                  className="border-b border-white/20 bg-transparent pb-1 text-2xl font-bold text-heading placeholder-muted outline-none"
                />
                <input
                  type="date"
                  value={dateDraft}
                  onChange={(event) => setDateDraft(event.target.value)}
                  className="w-fit rounded-lg border border-white/20 bg-background px-2 py-1 text-sm text-heading outline-none"
                />
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-heading">{workout.title}</p>
                <p className="text-sm text-heading/70">{new Date(workout.startedAt).toLocaleDateString()}</p>
              </div>
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
              className={editing ? "text-accent" : "text-muted hover:text-heading"}
            >
              {editing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push(`/workout/${workoutId}/new-set`)}
        className="flex h-44 items-center justify-center rounded-2xl bg-widget text-accent"
        aria-label="Add set"
      >
        <span className="text-4xl leading-none">+</span>
      </button>

      <AddCardioForm
        workoutId={workoutId}
        onAdded={(activity) => setCardioActivities((prev) => [...(prev ?? []), activity])}
      />

      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-heading/70">Sets</p>

        {groups === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

        {groups?.length === 0 && <p className="text-sm text-heading/70">No sets logged yet.</p>}

        {groups?.map((group) => {
          const exerciseHref = group.exercise ? `/workout/${workoutId}/exercise/${group.exercise.id}` : null;
          return (
            <div key={group.exercise?.id ?? group.sets[0]?.id} className="flex flex-col gap-3">
              <p className="font-semibold text-heading">{group.exercise?.name ?? "Exercise"}</p>
              <div className="flex flex-col gap-3">
                {groupIntoChains(group.sets).map((chain, i) => {
                  const row = (
                    <>
                      <span className="text-sm text-heading">set {i + 1}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-heading/90">
                          {chain.parent.reps} x {chain.parent.weightKg ?? 0}kg
                        </span>
                        {exerciseHref && <span className="text-accent">&rsaquo;</span>}
                      </span>
                    </>
                  );
                  return exerciseHref ? (
                    <Link
                      key={chain.parent.id}
                      href={exerciseHref}
                      className="flex items-center justify-between rounded-full bg-pill px-5 py-4"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div
                      key={chain.parent.id}
                      className="flex items-center justify-between rounded-full bg-pill px-5 py-4"
                    >
                      {row}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold text-heading/70">Cardio</p>

        {cardioActivities === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

        {cardioActivities?.length === 0 && <p className="text-sm text-heading/70">No cardio logged yet.</p>}

        {cardioActivities?.map((activity) => (
          <CardioActivityCard
            key={activity.id}
            activity={activity}
            showControls
            onUpdated={(updated) =>
              setCardioActivities((prev) => prev?.map((a) => (a.id === updated.id ? updated : a)) ?? null)
            }
            onDeleted={(deletedId) =>
              setCardioActivities((prev) => prev?.filter((a) => a.id !== deletedId) ?? null)
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleEndWorkout}
        disabled={ending}
        className="mt-auto mb-[max(1.5rem,env(safe-area-inset-bottom))] rounded-full bg-accent-gradient py-4 font-bold text-white disabled:opacity-60"
      >
        End Workout
      </button>
    </div>
  );
}
