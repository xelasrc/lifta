"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkout, getTodaysWorkout } from "@/lib/db/workouts";
import type { Workout } from "@/lib/db/schema";

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTodaysWorkout().then((found) => {
      setWorkout(found ?? null);
      setLoaded(true);
    });
  }, []);

  async function handleStart() {
    setStarting(true);
    const active = workout ?? (await createWorkout("Workout"));
    router.push(`/workout/${active.id}`);
  }

  if (!loaded) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <div>
        <p className="text-sm font-semibold text-muted">
          {workout ? "Today's Workout" : "No workout yet today"}
        </p>
        {workout && <p className="text-xl font-bold text-white">{workout.title}</p>}
      </div>
      <button
        type="button"
        onClick={handleStart}
        disabled={starting}
        className="rounded-full bg-accent py-3 text-center font-bold text-white disabled:opacity-60"
      >
        {workout ? "Continue" : "Start"}
      </button>
    </div>
  );
}
