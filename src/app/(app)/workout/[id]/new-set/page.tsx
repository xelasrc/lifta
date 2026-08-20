"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSet } from "@/lib/db/sets";
import { createExercise, searchExercises, syncExercisesFromSupabase } from "@/lib/db/exercises";
import type { Exercise } from "@/lib/db/schema";
import { NumberPicker } from "@/components/workout/number-picker";

export default function NewSetPage(props: PageProps<"/workout/[id]/new-set">) {
  const { id } = use(props.params);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [saving, setSaving] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [loggedSets, setLoggedSets] = useState<{ reps: number; weightKg: number | null }[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    syncExercisesFromSupabase().finally(() => setCatalogReady(true));
  }, []);

  useEffect(() => {
    if (selected) return;
    searchExercises(query).then(setSuggestions);
    // Re-run once the initial catalog sync lands, even if the query hasn't changed,
    // so results appear if the user searched before the first sync finished.
  }, [query, selected, catalogReady]);

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
    await createSet({ workoutId: id, exerciseId: selected.id, reps, weightKg: weight });
    setLoggedSets((prev) => [...prev, { reps, weightKg: weight }]);
    setSaving(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  function handleDone() {
    router.push(`/workout/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-8">
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

        {!selected && query && !catalogReady && (
          <p className="px-1 text-sm text-muted">Loading exercises…</p>
        )}

        {!selected && query && catalogReady && (
          <div className="flex flex-col gap-1 rounded-2xl bg-surface p-2">
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
            <button
              type="button"
              onClick={handleAddCustom}
              className="rounded-xl px-3 py-3 text-left font-semibold text-accent hover:bg-white/5"
            >
              + Add &quot;{query}&quot; as new exercise
            </button>
          </div>
        )}
      </div>

      {selected && (
        <>
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Weight (kg)</p>
            <NumberPicker min={0} max={300} step={0.5} value={weight} onChange={setWeight} />
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
                <p key={i} className="text-sm text-white">
                  Set {i + 1}: {set.reps} reps @ {set.weightKg}kg
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
