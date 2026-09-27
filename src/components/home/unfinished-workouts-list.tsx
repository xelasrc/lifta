"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listStaleInProgressWorkouts } from "@/lib/db/workouts";
import type { Workout } from "@/lib/db/types";

// Surfaces any in-progress workout started before today -- otherwise these
// are unreachable (History only lists completed workouts, and the "in
// progress" card above only checks today), so an abandoned one would
// otherwise sit invisible forever.
export function UnfinishedWorkoutsList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    listStaleInProgressWorkouts().then(setWorkouts);
  }, []);

  if (workouts.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-base font-medium text-heading">Unfinished</p>
      <div className="flex flex-col gap-2.5">
        {workouts.map((workout) => (
          <Link
            key={workout.id}
            href={`/workout/${workout.id}`}
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
            <span className="text-accent">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
