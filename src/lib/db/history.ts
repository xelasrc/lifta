import { getDB } from "./index";
import { listSetsForWorkout } from "./sets";
import { getExercise } from "./exercises";
import type { Exercise, Workout, WorkoutSet } from "./schema";

function monthKeyOf(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function listWorkoutsByMonth(): Promise<Map<string, Workout[]>> {
  const db = await getDB();
  const all = await db.getAll("workouts");
  const completed = all.filter((w) => w.completedAt);

  const map = new Map<string, Workout[]>();
  for (const workout of completed) {
    const key = monthKeyOf(workout.startedAt);
    const list = map.get(key) ?? [];
    list.push(workout);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

export async function listWorkoutsInMonth(monthKey: string): Promise<Workout[]> {
  const db = await getDB();
  const all = await db.getAll("workouts");
  return all
    .filter((w) => w.completedAt && monthKeyOf(w.startedAt) === monthKey)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getWorkoutCategories(workoutId: string): Promise<string[]> {
  const sets = await listSetsForWorkout(workoutId);
  const exerciseIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
  const exercises = await Promise.all(exerciseIds.map((id) => getExercise(id)));

  const categories = new Set(
    exercises
      .filter((e): e is Exercise => Boolean(e?.category))
      .map((e) => (e.category as string).charAt(0).toUpperCase() + (e.category as string).slice(1)),
  );
  return Array.from(categories);
}

export async function getWorkoutDetail(workoutId: string): Promise<{
  workout: Workout | undefined;
  groups: { exercise: Exercise | undefined; sets: WorkoutSet[] }[];
}> {
  const db = await getDB();
  const workout = await db.get("workouts", workoutId);
  const sets = await listSetsForWorkout(workoutId);

  const exerciseIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
  const exercises = await Promise.all(exerciseIds.map((id) => getExercise(id)));
  const exerciseById = new Map(exercises.filter((e): e is Exercise => Boolean(e)).map((e) => [e.id, e]));

  const groups = exerciseIds.map((exerciseId) => ({
    exercise: exerciseById.get(exerciseId),
    sets: sets.filter((s) => s.exerciseId === exerciseId),
  }));

  return { workout, groups };
}

export async function listSetsForExercise(exerciseId: string): Promise<WorkoutSet[]> {
  const db = await getDB();
  const all = await db.getAll("workout_sets");
  return all
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
