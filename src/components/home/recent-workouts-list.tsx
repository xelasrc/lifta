"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRecentWorkouts } from "@/lib/db/workouts";
import type { Workout } from "@/lib/db/types";

export function RecentWorkoutsList() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    listRecentWorkouts().then(setWorkouts);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl font-semibold text-white">Recent workouts</p>

      {workouts === null && <div className="h-16 animate-pulse rounded-full bg-surface" />}

      {workouts?.length === 0 && (
        <p className="text-sm text-muted">Nothing logged yet — start your first workout above.</p>
      )}

      {workouts?.map((workout) => (
        <Link
          key={workout.id}
          href={`/workout/${workout.id}`}
          className="flex items-center justify-between gap-3 rounded-full border border-accent px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-white">
              {new Date(workout.startedAt).toLocaleDateString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              })}
            </span>
            <p className="font-semibold text-white">{workout.title}</p>
          </div>
          <span aria-hidden className="flex text-xl font-bold leading-none">
            <span className="text-white">&rsaquo;</span>
            <span className="text-white/60">&rsaquo;</span>
            <span className="text-white/30">&rsaquo;</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
