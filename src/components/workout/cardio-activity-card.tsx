"use client";

import { useState } from "react";
import { TrashIcon } from "@/components/icons/trash-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { updateCardioActivity, deleteCardioActivity } from "@/lib/db/cardio";
import type { CardioActivity } from "@/lib/db/types";

export function CardioActivityCard({
  activity,
  showControls,
  onUpdated,
  onDeleted,
}: {
  activity: CardioActivity;
  showControls: boolean;
  onUpdated: (activity: CardioActivity) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [typeDraft, setTypeDraft] = useState(activity.activityType);
  const [durationDraft, setDurationDraft] = useState(String(activity.durationMinutes));
  const [distanceDraft, setDistanceDraft] = useState(activity.distanceKm != null ? String(activity.distanceKm) : "");
  const [notesDraft, setNotesDraft] = useState(activity.notes ?? "");

  function startEditing() {
    setTypeDraft(activity.activityType);
    setDurationDraft(String(activity.durationMinutes));
    setDistanceDraft(activity.distanceKm != null ? String(activity.distanceKm) : "");
    setNotesDraft(activity.notes ?? "");
    setEditing(true);
  }

  async function commitEdit() {
    const durationMinutes = Math.max(0, Math.round(Number(durationDraft)) || 0);
    const distanceNum = Number(distanceDraft);
    const distanceKm = distanceDraft.trim() && distanceNum > 0 ? distanceNum : null;
    const activityType = typeDraft.trim() || activity.activityType;
    const notes = notesDraft.trim() || null;
    setEditing(false);
    await updateCardioActivity(activity.id, { activityType, durationMinutes, distanceKm, notes });
    onUpdated({ ...activity, activityType, durationMinutes, distanceKm, notes });
  }

  async function handleDelete() {
    if (!window.confirm("Delete this cardio activity?")) return;
    await deleteCardioActivity(activity.id);
    onDeleted(activity.id);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
        <input
          value={typeDraft}
          onChange={(event) => setTypeDraft(event.target.value)}
          autoFocus
          className="rounded-lg border border-white/20 bg-background px-3 py-2 text-sm text-white outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={durationDraft}
            onChange={(event) => setDurationDraft(event.target.value)}
            className="w-16 rounded-lg border border-white/20 bg-background px-2 py-1 text-right text-sm text-white outline-none"
          />
          <span className="text-sm text-muted">min</span>
          <input
            type="number"
            value={distanceDraft}
            onChange={(event) => setDistanceDraft(event.target.value)}
            className="w-16 rounded-lg border border-white/20 bg-background px-2 py-1 text-right text-sm text-white outline-none"
          />
          <span className="text-sm text-muted">km</span>
          <button
            type="button"
            onClick={commitEdit}
            aria-label={`Save ${activity.activityType}`}
            className="ml-auto text-accent"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        </div>
        <input
          value={notesDraft}
          onChange={(event) => setNotesDraft(event.target.value)}
          placeholder="Notes (optional)"
          className="rounded-lg border border-white/20 bg-background px-3 py-2 text-sm text-white outline-none placeholder-muted"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
      <div>
        <p className="font-semibold text-white">{activity.activityType}</p>
        <p className="text-sm text-muted">
          {activity.durationMinutes} min{activity.distanceKm != null ? ` · ${activity.distanceKm} km` : ""}
        </p>
        {activity.notes && <p className="mt-1 text-xs text-muted">{activity.notes}</p>}
      </div>
      {showControls && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit ${activity.activityType}`}
            className="text-muted hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${activity.activityType}`}
            className="text-muted hover:text-accent"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
