import { getDB } from "./index";
import { enqueueSync } from "./sync-queue";
import { triggerSync } from "./sync";
import type { Workout } from "./schema";

export async function listRecentWorkouts(limit = 5): Promise<Workout[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("workouts", "by-startedAt");
  return all.reverse().slice(0, limit);
}

export async function getTodaysWorkout(): Promise<Workout | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex("workouts", "by-startedAt");
  const todayKey = new Date().toDateString();
  return all.reverse().find((workout) => new Date(workout.startedAt).toDateString() === todayKey);
}

export async function createWorkout(title: string): Promise<Workout> {
  const db = await getDB();
  const now = new Date().toISOString();
  const workout: Workout = {
    id: crypto.randomUUID(),
    title,
    startedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.add("workouts", workout);
  await enqueueSync("workouts", "insert", workout);
  triggerSync();
  return workout;
}

export async function getOrCreateTodaysWorkout(): Promise<Workout> {
  const existing = await getTodaysWorkout();
  return existing ?? createWorkout("Workout");
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const db = await getDB();
  return db.get("workouts", id);
}

export async function completeWorkout(id: string): Promise<void> {
  const db = await getDB();
  const workout = await db.get("workouts", id);
  if (!workout) return;

  const updated: Workout = { ...workout, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await db.put("workouts", updated);
  await enqueueSync("workouts", "update", updated);
  triggerSync();
}
