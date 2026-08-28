"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSet, deleteSet } from "@/lib/db/sets";
import { createExercise, searchExercises } from "@/lib/db/exercises";
import type { Exercise, WorkoutSet } from "@/lib/db/types";
import { NumberPicker } from "@/components/workout/number-picker";
import { ExerciseStatsPanel } from "@/components/exercise-stats-panel";
import { TrashIcon } from "@/components/icons/trash-icon";

export function NewSetScreen({ workoutId }: { workoutId: string }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [saving, setSaving] = useState(false);
  const [loggedSets, setLoggedSets] = useState<WorkoutSet[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (selected) return;
    searchExercises(query).then(setSuggestions);
  }, [query, selected]);

  function handleSelect(exercise: Exercise) {
    setSelected(exercise);
    setQuery(exercise.name);
    setSuggestions([]);
    setLoggedSets([]);
  }

  async function handleAddCustom() {
    const name = query.trim();
    if (!name) return;
    const exercise = await createExercise(name);
    handleSelect(exercise);
  }

  async function handleAddSet() {
    if (!selected) return;
    setSaving(true);
    const set = await createSet({ workoutId, exerciseId: selected.id, reps, weightKg: weight });
    setLoggedSets((prev) => [...prev, set]);
    setSaving(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  async function handleDeleteLoggedSet(setId: string) {
    if (!window.confirm("Delete this set?")) return;
    await deleteSet(setId);
    setLoggedSets((prev) => prev.filter((s) => s.id !== setId));
  }

  function handleDone() {
    router.push(`/workout/${workoutId}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Exercise</h1>
        <button
          type="button"
          onClick={handleDone}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
        >
          Done
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          placeholder="Search or add an exercise..."
          className="rounded-2xl bg-surface px-5 py-4 text-white placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />

        {!selected && (
          <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto rounded-2xl bg-surface p-2 scrollbar-none">
            {suggestions.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => handleSelect(exercise)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-white hover:bg-white/5"
              >
                {exercise.name}
                <span className="text-accent">&rsaquo;</span>
              </button>
            ))}
            {query && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="rounded-xl px-3 py-3 text-left font-semibold text-accent hover:bg-white/5"
              >
                + Add &quot;{query}&quot; as new exercise
              </button>
            )}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Weight (kg)</p>
            <NumberPicker
              min={0}
              max={300}
              step={0.5}
              value={weight}
              onChange={setWeight}
              format={(v) => `${v}`}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Reps</p>
            <NumberPicker min={0} max={50} step={1} value={reps} onChange={setReps} />
          </div>

          <button
            type="button"
            onClick={handleAddSet}
            disabled={saving}
            className={`rounded-full bg-accent py-3 font-bold text-white transition-transform disabled:opacity-60 ${
              justAdded ? "scale-95" : "scale-100"
            }`}
          >
            {justAdded ? "Added ✓" : "Add Set"}
          </button>

          {loggedSets.length > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
              <p className="text-sm font-semibold text-muted">
                Logged for {selected.name} ({loggedSets.length})
              </p>
              {loggedSets.map((set, i) => (
                <div key={set.id} className="flex items-center justify-between">
                  <p className="text-sm text-white">
                    Set {i + 1}: {set.reps} x {set.weightKg}kg
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteLoggedSet(set.id)}
                    aria-label={`Delete set ${i + 1}`}
                    className="text-muted hover:text-accent"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <ExerciseStatsPanel
            exerciseId={selected.id}
            refreshToken={loggedSets.length}
            excludeWorkoutId={workoutId}
          />
        </>
      )}
    </div>
  );
}
