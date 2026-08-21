import { createClient } from "@/lib/supabase/client";
import { listSetsForWorkout } from "./sets";
import { getExercise } from "./exercises";
import { mapWorkout, mapWorkoutSet } from "./mappers";
import type { Exercise, Workout, WorkoutSet } from "./types";

function monthKeyOf(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function listCompletedWorkouts(): Promise<Workout[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false });
  return (data ?? []).map(mapWorkout);
}

export async function listWorkoutsByMonth(): Promise<Map<string, Workout[]>> {
  const completed = await listCompletedWorkouts();

  const map = new Map<string, Workout[]>();
  for (const workout of completed) {
    const key = monthKeyOf(workout.startedAt);
    const list = map.get(key) ?? [];
    list.push(workout);
    map.set(key, list);
  }

  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

export async function listWorkoutsInMonth(monthKey: string): Promise<Workout[]> {
  const completed = await listCompletedWorkouts();
  return completed.filter((w) => monthKeyOf(w.startedAt) === monthKey);
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
  const supabase = createClient();
  const { data } = await supabase.from("workouts").select("*").eq("id", workoutId).maybeSingle();
  const workout = data ? mapWorkout(data) : undefined;

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
  const supabase = createClient();
  const { data } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapWorkoutSet);
}
