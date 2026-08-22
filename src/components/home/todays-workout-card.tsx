"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodaysWorkout, getOrCreateTodaysWorkout, updateWorkoutTitle } from "@/lib/db/workouts";
import type { Workout } from "@/lib/db/types";
import { SlideToStart } from "./slide-to-start";
import { PencilIcon } from "@/components/icons/pencil-icon";

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTodaysWorkout().then((found) => {
      setWorkout(found ?? null);
      setLoaded(true);
      if (found) {
        router.prefetch(`/workout/${found.id}`);
        router.prefetch(`/workout/${found.id}/new-set`);
      }
    });
  }, [router]);

  async function handleStart() {
    setStarting(true);
    const active = workout ?? (await getOrCreateTodaysWorkout());
    router.push(`/workout/${active.id}`);
  }

  function startEditing() {
    if (!workout) return;
    setTitleDraft(workout.title);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  async function commitEdit() {
    if (!workout) return;
    setEditing(false);
    const title = titleDraft.trim();
    if (!title || title === workout.title) return;
    setWorkout({ ...workout, title });
    await updateWorkoutTitle(workout.id, title);
  }

  if (!loaded) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-2xl bg-surface p-5">
        <p className="text-sm font-semibold text-muted">
          {workout ? "Today's Workout" : "No workout yet today"}
        </p>
        {workout &&
          (editing ? (
            <input
              ref={inputRef}
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={commitEdit}
              onKeyDown={(event) => {
                if (event.key === "Enter") inputRef.current?.blur();
                if (event.key === "Escape") setEditing(false);
              }}
              autoFocus
              className="w-full bg-transparent text-xl font-bold text-white outline-none"
            />
          ) : (
            <p className="text-xl font-bold text-white">{workout.title}</p>
          ))}
        {workout && !editing && (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit workout name"
            className="absolute right-4 bottom-4 text-muted hover:text-white"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <SlideToStart label={workout ? "Continue" : "Start"} onComplete={handleStart} disabled={starting} />
    </div>
  );
}
