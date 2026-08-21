"use client";

import { useEffect, useState } from "react";
import { getOrCreateTodaysWorkout } from "@/lib/db/workouts";
import { pullFromSupabase } from "@/lib/db/pull-sync";
import { NewSetScreen } from "@/components/workout/new-set-screen";

export default function ActiveWorkoutNewSetPage() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    pullFromSupabase()
      .then(() => getOrCreateTodaysWorkout())
      .then((workout) => setWorkoutId(workout.id));
  }, []);

  if (!workoutId) {
    return (
      <div className="flex flex-1 flex-col px-5 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  return <NewSetScreen workoutId={workoutId} basePath="/workout/active" />;
}
