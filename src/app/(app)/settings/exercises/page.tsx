"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createExercise, deleteExercise, listMyExercises } from "@/lib/db/exercises";
import type { Exercise } from "@/lib/db/types";
import { TrashIcon } from "@/components/icons/trash-icon";

export default function MyExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  function refresh() {
    listMyExercises().then(setExercises);
  }

  useEffect(refresh, []);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      const exercise = await createExercise(name);
      setExercises((prev) => [...(prev ?? []), exercise].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that exercise");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(exercise: Exercise) {
    if (!window.confirm(`Delete "${exercise.name}" from your exercise library?`)) return;
    setError(null);
    try {
      await deleteExercise(exercise.id);
      setExercises((prev) => prev?.filter((e) => e.id !== exercise.id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that exercise");
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3">
        <Link href="/settings" aria-label="Back to settings" className="text-2xl font-bold text-heading">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-heading">My Exercises</h1>
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New exercise name"
          className="flex-1 rounded-full bg-pill px-5 py-4 text-heading placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="rounded-full bg-accent-gradient px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-accent">{error}</p>}

      {exercises === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

      {exercises?.length === 0 && (
        <div className="rounded-2xl bg-surface p-5 text-center">
          <p className="text-sm text-muted">
            You haven&apos;t added any custom exercises yet -- these show up here once you add one while logging a
            set.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {exercises?.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between rounded-full bg-pill px-5 py-4"
          >
            <span className="text-heading">{exercise.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(exercise)}
              aria-label={`Delete ${exercise.name}`}
              className="text-muted hover:text-accent"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
