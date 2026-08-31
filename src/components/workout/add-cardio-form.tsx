"use client";

import { useState } from "react";
import { Stepper } from "@/components/stepper";
import { createCardioActivity } from "@/lib/db/cardio";
import type { CardioActivity } from "@/lib/db/types";

const QUICK_TYPES = ["Run", "Bike", "Row", "Swim", "Walk"];

export function AddCardioForm({
  workoutId,
  onAdded,
}: {
  workoutId: string;
  onAdded: (activity: CardioActivity) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activityType, setActivityType] = useState("");
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setActivityType("");
    setDuration(0);
    setDistance(0);
    setNotes("");
  }

  async function handleSave() {
    if (!activityType.trim()) return;
    setSaving(true);
    const activity = await createCardioActivity({
      workoutId,
      activityType: activityType.trim(),
      durationMinutes: duration,
      distanceKm: distance > 0 ? distance : null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    reset();
    setOpen(false);
    onAdded(activity);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-dashed border-white/20 py-3 text-sm font-semibold text-accent"
      >
        + Add Cardio
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted">Activity</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActivityType(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                activityType === type ? "bg-accent text-white" : "bg-white/10 text-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <input
          value={activityType}
          onChange={(event) => setActivityType(event.target.value)}
          placeholder="Activity type"
          className="rounded-lg border border-white/20 bg-background px-3 py-2 text-sm text-white outline-none placeholder-muted"
        />
      </div>

      <Stepper label="Duration" value={duration} onChange={setDuration} min={0} max={300} step={1} bigStep={5} suffix="min" />
      <Stepper label="Distance" value={distance} onChange={setDistance} min={0} max={100} step={0.1} bigStep={1} suffix="km" />

      <input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes (optional)"
        className="rounded-lg border border-white/20 bg-background px-3 py-2 text-sm text-white outline-none placeholder-muted"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="flex-1 rounded-full bg-white/10 py-3 text-sm font-semibold text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !activityType.trim()}
          className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}
