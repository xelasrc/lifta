import { createClient } from "@/lib/supabase/client";
import { drainSyncQueue } from "./sync-queue";
import type { Exercise, SyncOperation, Workout, WorkoutSet } from "./schema";

let syncing = false;

export function triggerSync() {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  syncing = true;
  syncPendingChanges().finally(() => {
    syncing = false;
  });
}

async function syncPendingChanges() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await drainSyncQueue(async (entry) => {
    if (entry.table === "workouts") {
      await syncWorkout(entry.operation, entry.payload as Workout, user.id);
    } else if (entry.table === "exercises") {
      await syncExercise(entry.operation, entry.payload as Exercise, user.id);
    } else {
      await syncWorkoutSet(entry.operation, entry.payload as WorkoutSet | { id: string }, user.id);
    }
  });
}

async function syncWorkout(operation: SyncOperation, payload: Workout, userId: string) {
  const supabase = createClient();

  if (operation === "delete") {
    const { error } = await supabase.from("workouts").delete().eq("id", payload.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("workouts").upsert({
    id: payload.id,
    user_id: userId,
    title: payload.title,
    started_at: payload.startedAt,
    completed_at: payload.completedAt,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  });
  if (error) throw error;
}

async function syncExercise(operation: SyncOperation, payload: Exercise, userId: string) {
  const supabase = createClient();

  if (operation === "delete") {
    const { error } = await supabase.from("exercises").delete().eq("id", payload.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("exercises").upsert({
    id: payload.id,
    user_id: userId,
    name: payload.name,
    category: payload.category,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  });
  if (error) throw error;
}

async function syncWorkoutSet(
  operation: SyncOperation,
  payload: WorkoutSet | { id: string },
  userId: string,
) {
  const supabase = createClient();

  if (operation === "delete") {
    const { error } = await supabase.from("workout_sets").delete().eq("id", payload.id);
    if (error) throw error;
    return;
  }

  const set = payload as WorkoutSet;
  const { error } = await supabase.from("workout_sets").upsert({
    id: set.id,
    user_id: userId,
    workout_id: set.workoutId,
    exercise_id: set.exerciseId,
    reps: set.reps,
    weight_kg: set.weightKg,
    position: set.order,
    created_at: set.createdAt,
    updated_at: set.updatedAt,
  });
  if (error) throw error;
}
