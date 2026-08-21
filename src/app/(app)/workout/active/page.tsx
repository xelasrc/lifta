"use client";

import { useEffect, useState } from "react";
import { getOrCreateTodaysWorkout } from "@/lib/db/workouts";
import { pullFromSupabase } from "@/lib/db/pull-sync";
import { AddSetsScreen } from "@/components/workout/add-sets-screen";

export default function ActiveWorkoutPage() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    // Pull first so an existing "today" workout from another device is seen
    // before deciding whether to create a new (duplicate) one locally.
    pullFromSupabase()
      .then(() => getOrCreateTodaysWorkout())
      .then((workout) => setWorkoutId(workout.id));
  }, []);

  if (!workoutId) {
    return (
      <div className="flex flex-1 flex-col px-3 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  return <AddSetsScreen workoutId={workoutId} basePath="/workout/active" />;
}
