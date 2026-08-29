"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWorkoutDetail, getWorkoutCategories } from "@/lib/db/history";
import { deleteWorkout, deriveWorkoutTitle, updateWorkoutDetails } from "@/lib/db/workouts";
import { deleteSet, updateSet } from "@/lib/db/sets";
import type { Exercise, Workout, WorkoutSet } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";

type Group = { exercise: Exercise | undefined; sets: WorkoutSet[] };

export default function HistoryWorkoutPage(props: PageProps<"/history/workout/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [splitDayDraft, setSplitDayDraft] = useState("");
  const splitDayInputRef = useRef<HTMLInputElement>(null);

  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [repsDraft, setRepsDraft] = useState("");
  const [weightDraft, setWeightDraft] = useState("");

  function refresh() {
    getWorkoutDetail(id).then((detail) => {
      setWorkout(detail.workout ?? null);
      setGroups(detail.groups);
    });
    getWorkoutCategories(id).then(setCategories);
  }

  useEffect(refresh, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    setDeleting(true);
    await deleteWorkout(id);
    router.push("/history");
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
    setEditingSetId(null);
    await updateWorkoutDetails(id, { title, splitDay });
  }

  function handleEditKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") commitEdit();
    if (event.key === "Escape") setEditing(false);
  }

  function startEditingSet(set: WorkoutSet) {
    setEditingSetId(set.id);
    setRepsDraft(String(set.reps));
    setWeightDraft(String(set.weightKg ?? 0));
  }

  async function commitEditSet(setId: string) {
    const reps = Math.max(0, Math.round(Number(repsDraft)) || 0);
    const weightKg = Math.max(0, Number(weightDraft)) || 0;
    setEditingSetId(null);
    await updateSet(setId, { reps, weightKg });
    refresh();
  }

  async function handleDeleteSet(setId: string) {
    if (!window.confirm("Delete this set?")) return;
    await deleteSet(setId);
    refresh();
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
        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <input
              ref={splitDayInputRef}
              value={splitDayDraft}
              onChange={(event) => setSplitDayDraft(event.target.value)}
              onKeyDown={handleEditKeyDown}
              placeholder="Split day (e.g. Push, Legs)"
              className="min-w-0 flex-1 border-b border-white/20 bg-transparent pb-1 text-xl font-bold text-white outline-none"
            />
          ) : (
            <p className="text-xl font-bold text-white">{workout.title}</p>
          )}
          <div className="flex shrink-0 items-center gap-3">
            <p className="whitespace-nowrap text-sm text-muted">
              {new Date(workout.startedAt).toLocaleDateString()}
            </p>
            <button
              type="button"
              onClick={editing ? commitEdit : startEditing}
              aria-label={editing ? "Save workout details" : "Edit workout details"}
              className={editing ? "text-accent" : "text-muted hover:text-white"}
            >
              {editing ? <CheckIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {categories.length > 0 && <p className="mt-1 text-sm text-accent">{categories.join(", ")}</p>}
      </div>

      {editing && (
        <button
          type="button"
          onClick={() => router.push(`/workout/${id}/new-set`)}
          className="flex h-32 items-center justify-center rounded-2xl bg-surface text-accent"
          aria-label="Add set"
        >
          <span className="text-4xl leading-none">+</span>
        </button>
      )}

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.exercise?.id ?? group.sets[0]?.id} className="rounded-2xl bg-surface p-4">
            {group.exercise ? (
              <Link
                href={`/history/workout/${id}/exercise/${group.exercise.id}`}
                className="flex items-center justify-between border-b border-white/10 pb-3 font-semibold text-white"
              >
                {group.exercise.name} <span className="text-accent">&rsaquo;</span>
              </Link>
            ) : (
              <p className="border-b border-white/10 pb-3 font-semibold text-white">Exercise</p>
            )}
            <div className="divide-y divide-white/10">
              {group.sets.map((set, i) =>
                editingSetId === set.id ? (
                  <div key={set.id} className="flex items-center justify-between gap-2 py-3">
                    <p className="font-semibold text-white">Set {i + 1}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={repsDraft}
                        onChange={(event) => setRepsDraft(event.target.value)}
                        autoFocus
                        className="w-12 rounded-lg border border-white/20 bg-background px-2 py-1 text-right text-sm text-white outline-none"
                      />
                      <span className="text-sm text-muted">x</span>
                      <input
                        type="number"
                        value={weightDraft}
                        onChange={(event) => setWeightDraft(event.target.value)}
                        className="w-16 rounded-lg border border-white/20 bg-background px-2 py-1 text-right text-sm text-white outline-none"
                      />
                      <span className="text-sm text-muted">kg</span>
                      <button
                        type="button"
                        onClick={() => commitEditSet(set.id)}
                        aria-label={`Save set ${i + 1}`}
                        className="text-accent"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={set.id} className="flex items-center justify-between py-3">
                    <p className="font-semibold text-white">Set {i + 1}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted">
                        {set.reps} x {set.weightKg ?? 0}kg
                      </p>
                      {editing && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditingSet(set)}
                            aria-label={`Edit set ${i + 1}`}
                            className="text-muted hover:text-white"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSet(set.id)}
                            aria-label={`Delete set ${i + 1}`}
                            className="text-muted hover:text-accent"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
