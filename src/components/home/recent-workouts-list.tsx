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
    <div className="flex flex-col gap-4">
      <p className="text-2xl font-bold text-heading">Recent workouts</p>

      <div className="flex flex-col gap-2.5">
        {workouts === null && <div className="h-17 animate-pulse rounded-full bg-surface" />}

        {workouts?.length === 0 && (
          <p className="text-sm text-heading/70">Nothing logged yet — start your first workout above.</p>
        )}

        {workouts?.map((workout) => (
          <Link
            key={workout.id}
            href={`/history/workout/${workout.id}`}
            className="flex items-center justify-between gap-3 rounded-full border-2 border-accent bg-pill px-5 py-6"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-white">
                {new Date(workout.startedAt).toLocaleDateString(undefined, {
                  month: "numeric",
                  day: "numeric",
                  year: "2-digit",
                })}
              </span>
              <p className="text-sm font-medium text-white">{workout.title}</p>
            </div>
            <span className="text-2xl font-bold text-accent">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
