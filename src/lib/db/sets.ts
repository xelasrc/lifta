import { getDB } from "./index";
import { enqueueSync } from "./sync-queue";
import { triggerSync } from "./sync";
import type { WorkoutSet } from "./schema";

export async function listSetsForWorkout(workoutId: string): Promise<WorkoutSet[]> {
  const db = await getDB();
  const sets = await db.getAllFromIndex("workout_sets", "by-workoutId", workoutId);
  return sets.sort((a, b) => a.order - b.order);
}

export async function createSet(input: {
  workoutId: string;
  exerciseId: string;
  reps: number;
  weightKg: number | null;
}): Promise<WorkoutSet> {
  const db = await getDB();
  const existing = await listSetsForWorkout(input.workoutId);
  const now = new Date().toISOString();
  const set: WorkoutSet = {
    id: crypto.randomUUID(),
    workoutId: input.workoutId,
    exerciseId: input.exerciseId,
    reps: input.reps,
    weightKg: input.weightKg,
    order: existing.length,
    createdAt: now,
    updatedAt: now,
  };
  await db.add("workout_sets", set);
  await enqueueSync("workout_sets", "insert", set);
  triggerSync();
  return set;
}

export async function deleteSet(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("workout_sets", id);
  await enqueueSync("workout_sets", "delete", { id });
  triggerSync();
}
