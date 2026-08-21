import { getDB } from "./index";
import { createClient } from "@/lib/supabase/client";
import { syncExercisesFromSupabase } from "./exercises";
import type { Workout, WorkoutSet } from "./schema";

export async function pullFromSupabase(): Promise<void> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Exercises are needed to resolve names for whatever workouts/sets pull
    // down below, so fetch it alongside rather than only on the add-set screen.
    const [workoutsRes, setsRes] = await Promise.all([
      supabase.from("workouts").select("*").abortSignal(AbortSignal.timeout(4000)),
      supabase.from("workout_sets").select("*").abortSignal(AbortSignal.timeout(4000)),
      syncExercisesFromSupabase(),
    ]);

    const db = await getDB();

    if (workoutsRes.data) {
      const tx = db.transaction("workouts", "readwrite");
      await Promise.all([
        ...workoutsRes.data.map((row) =>
          tx.store.put({
            id: row.id,
            title: row.title,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          } satisfies Workout),
        ),
        tx.done,
      ]);
    }

    if (setsRes.data) {
      const tx = db.transaction("workout_sets", "readwrite");
      await Promise.all([
        ...setsRes.data.map((row) =>
          tx.store.put({
            id: row.id,
            workoutId: row.workout_id,
            exerciseId: row.exercise_id,
            reps: row.reps,
            weightKg: row.weight_kg,
            order: row.position,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          } satisfies WorkoutSet),
        ),
        tx.done,
      ]);
    }
  } catch {
    // Offline or timed out - proceed with whatever's already local.
  }
}
