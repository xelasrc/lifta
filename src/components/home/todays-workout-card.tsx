"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodaysWorkout } from "@/lib/db/workouts";
import { pullFromSupabase } from "@/lib/db/pull-sync";
import type { Workout } from "@/lib/db/schema";

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    pullFromSupabase().then(() =>
      getTodaysWorkout().then((found) => {
        setWorkout(found ?? null);
        setLoaded(true);
      }),
    );
    router.prefetch("/workout/active");
    router.prefetch("/workout/active/new-set");
  }, [router]);

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
        onClick={() => router.push("/workout/active")}
        className="rounded-full bg-accent py-3 text-center font-bold text-white"
      >
        {workout ? "Continue" : "Start"}
      </button>
    </div>
  );
}
