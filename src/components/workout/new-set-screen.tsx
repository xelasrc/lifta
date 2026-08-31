"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSet, deleteSet } from "@/lib/db/sets";
import { createExercise, searchExercises } from "@/lib/db/exercises";
import { groupIntoChains } from "@/lib/db/set-chains";
import type { Exercise, WorkoutSet } from "@/lib/db/types";
import { NumberPicker } from "@/components/workout/number-picker";
import { ExerciseStatsPanel } from "@/components/exercise-stats-panel";
import { TrashIcon } from "@/components/icons/trash-icon";
import { Stepper } from "@/components/stepper";
import { getSettings } from "@/lib/settings";

function collectDescendantIds(sets: WorkoutSet[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of sets) {
      if (s.parentSetId && ids.has(s.parentSetId) && !ids.has(s.id)) {
        ids.add(s.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function NewSetScreen({ workoutId }: { workoutId: string }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [weight, setWeight] = useState(() => getSettings().defaultWeightKg);
  const [reps, setReps] = useState(() => getSettings().defaultReps);
  const [saving, setSaving] = useState(false);
  const [loggedSets, setLoggedSets] = useState<WorkoutSet[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [pendingDropParentId, setPendingDropParentId] = useState<string | null>(null);
  const [showPartials, setShowPartials] = useState(false);
  const [partialReps, setPartialReps] = useState(0);

  useEffect(() => {
    if (selected) return;
    searchExercises(query).then(setSuggestions);
  }, [query, selected]);

  function handleSelect(exercise: Exercise) {
    setSelected(exercise);
    setQuery(exercise.name);
    setSuggestions([]);
    setLoggedSets([]);
    setPendingDropParentId(null);
    setShowPartials(false);
    setPartialReps(0);
  }

  async function handleAddCustom() {
    const name = query.trim();
    if (!name) return;
    const exercise = await createExercise(name);
    handleSelect(exercise);
  }

  function handleStartDrop(parent: WorkoutSet) {
    setPendingDropParentId(parent.id);
    const droppedWeight =
      parent.weightKg != null ? Math.max(0, Math.round((parent.weightKg * 0.8) / 0.5) * 0.5) : 0;
    setWeight(droppedWeight);
    setReps(parent.reps);
  }

  function handleCancelDrop() {
    setPendingDropParentId(null);
  }

  async function handleAddSet() {
    if (!selected) return;
    setSaving(true);
    const set = await createSet({
      workoutId,
      exerciseId: selected.id,
      reps,
      weightKg: weight,
      type: pendingDropParentId ? "drop" : "normal",
      parentSetId: pendingDropParentId,
      partialReps: showPartials && partialReps > 0 ? partialReps : null,
    });
    setLoggedSets((prev) => [...prev, set]);
    setSaving(false);
    setPendingDropParentId(null);
    setShowPartials(false);
    setPartialReps(0);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  async function handleDeleteLoggedSet(setId: string) {
    const descendantIds = collectDescendantIds(loggedSets, setId);
    const childCount = descendantIds.size - 1;
    const message =
      childCount > 0
        ? `Delete this set and its ${childCount} drop set${childCount === 1 ? "" : "s"}?`
        : "Delete this set?";
    if (!window.confirm(message)) return;
    await deleteSet(setId);
    setLoggedSets((prev) => prev.filter((s) => !descendantIds.has(s.id)));
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
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">
                {pendingDropParentId ? "Drop set weight (kg)" : "Weight (kg)"}
              </p>
              {pendingDropParentId && (
                <button
                  type="button"
                  onClick={handleCancelDrop}
                  className="text-xs font-semibold text-muted hover:text-white"
                >
                  Cancel drop
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setWeight((w) => Math.max(0, w - 5))}
                aria-label="Decrease weight by 5"
                className="flex h-15 w-11 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-muted"
              >
                -5
              </button>
              <NumberPicker
                min={0}
                max={300}
                step={0.5}
                value={weight}
                onChange={setWeight}
                format={(v) => `${v}`}
              />
              <button
                type="button"
                onClick={() => setWeight((w) => Math.min(300, w + 5))}
                aria-label="Increase weight by 5"
                className="flex h-15 w-11 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-muted"
              >
                +5
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Reps</p>
            <div className="flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setReps((r) => Math.max(0, r - 5))}
                aria-label="Decrease reps by 5"
                className="flex h-15 w-11 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-muted"
              >
                -5
              </button>
              <NumberPicker min={0} max={50} step={1} value={reps} onChange={setReps} />
              <button
                type="button"
                onClick={() => setReps((r) => Math.min(50, r + 5))}
                aria-label="Increase reps by 5"
                className="flex h-15 w-11 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-muted"
              >
                +5
              </button>
            </div>
          </div>

          {showPartials ? (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Stepper label="Partial reps" value={partialReps} onChange={setPartialReps} min={0} max={20} step={1} />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPartials(false);
                  setPartialReps(0);
                }}
                aria-label="Remove partial reps"
                className="text-lg text-muted hover:text-white"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPartials(true)}
              className="self-start text-sm font-semibold text-accent"
            >
              + Add partial reps
            </button>
          )}

          <button
            type="button"
            onClick={handleAddSet}
            disabled={saving}
            className={`rounded-2xl bg-accent py-4 font-bold text-white transition-transform disabled:opacity-60 ${
              justAdded ? "scale-95" : "scale-100"
            }`}
          >
            {justAdded ? "Added ✓" : pendingDropParentId ? "Add Drop Set" : "Add Set"}
          </button>

          {loggedSets.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
              <p className="text-sm font-semibold text-muted">
                Logged for {selected.name} ({loggedSets.length})
              </p>
              {groupIntoChains(loggedSets).map((chain, i) => {
                const lastDrop = chain.drops[chain.drops.length - 1];
                return (
                  <div key={chain.parent.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">
                        Set {i + 1}: {chain.parent.reps} x {chain.parent.weightKg}kg
                        {chain.parent.partialReps ? ` +${chain.parent.partialReps} partial` : ""}
                      </p>
                      <div className="flex items-center gap-3">
                        {!lastDrop && (
                          <button
                            type="button"
                            onClick={() => handleStartDrop(chain.parent)}
                            className="text-xs font-semibold text-accent"
                          >
                            + Drop Set
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteLoggedSet(chain.parent.id)}
                          aria-label={`Delete set ${i + 1}`}
                          className="text-muted hover:text-accent"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {chain.drops.map((drop) => (
                      <div key={drop.id} className="flex items-center justify-between pl-4">
                        <p className="flex items-center gap-2 text-sm text-muted">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-muted">
                            Drop
                          </span>
                          {drop.reps} x {drop.weightKg}kg
                          {drop.partialReps ? ` +${drop.partialReps} partial` : ""}
                        </p>
                        <div className="flex items-center gap-3">
                          {drop.id === lastDrop.id && (
                            <button
                              type="button"
                              onClick={() => handleStartDrop(drop)}
                              className="text-xs font-semibold text-accent"
                            >
                              + Drop Set
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteLoggedSet(drop.id)}
                            aria-label="Delete drop set"
                            className="text-muted hover:text-accent"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
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
