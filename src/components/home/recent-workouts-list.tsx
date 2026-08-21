"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRecentWorkouts } from "@/lib/db/workouts";
import { pullFromSupabase } from "@/lib/db/pull-sync";
import type { Workout } from "@/lib/db/schema";

export function RecentWorkoutsList() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    pullFromSupabase().then(() => listRecentWorkouts().then(setWorkouts));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-muted">Recent workouts</p>

      {workouts === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

      {workouts?.length === 0 && (
        <p className="text-sm text-muted">Nothing logged yet — start your first workout above.</p>
      )}

      {workouts?.map((workout) => (
        <Link
          key={workout.id}
          href={`/workout/${workout.id}`}
          className="flex items-center justify-between rounded-2xl border border-accent/60 px-4 py-3"
        >
          <div>
            <p className="font-semibold text-white">{workout.title}</p>
            <p className="text-xs text-muted">{new Date(workout.startedAt).toLocaleDateString()}</p>
          </div>
          <span className="text-accent">&rsaquo;</span>
        </Link>
      ))}
    </div>
  );
}
