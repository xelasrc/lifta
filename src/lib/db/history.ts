import { createClient } from "@/lib/supabase/client";
import { listSetsForWorkout } from "./sets";
import { listCardioActivitiesForWorkout } from "./cardio";
import { getExercise } from "./exercises";
import { mapWorkout, mapWorkoutSet } from "./mappers";
import type { CardioActivity, Exercise, Workout, WorkoutSet } from "./types";

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

// Bulk-checks which workouts have any sets vs. any cardio activities, in two
// queries total (not one per workout) -- used to decorate the history
// calendar with a strength ring and/or a cardio ring per day.
export async function getWorkoutActivityFlags(
  workoutIds: string[],
): Promise<Map<string, { hasSets: boolean; hasCardio: boolean }>> {
  if (workoutIds.length === 0) return new Map();

  const supabase = createClient();
  const [{ data: setRows }, { data: cardioRows }] = await Promise.all([
    supabase.from("workout_sets").select("workout_id").in("workout_id", workoutIds),
    supabase.from("cardio_activities").select("workout_id").in("workout_id", workoutIds),
  ]);
  const setWorkoutIds = new Set((setRows ?? []).map((r) => r.workout_id));
  const cardioWorkoutIds = new Set((cardioRows ?? []).map((r) => r.workout_id));

  const flags = new Map<string, { hasSets: boolean; hasCardio: boolean }>();
  for (const id of workoutIds) {
    flags.set(id, { hasSets: setWorkoutIds.has(id), hasCardio: cardioWorkoutIds.has(id) });
  }
  return flags;
}

export async function getWorkoutCategories(workoutId: string): Promise<string[]> {
  const [sets, cardioActivities] = await Promise.all([
    listSetsForWorkout(workoutId),
    listCardioActivitiesForWorkout(workoutId),
  ]);
  const exerciseIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
  const exercises = await Promise.all(exerciseIds.map((id) => getExercise(id)));

  const categories = new Set(
    exercises
      .filter((e): e is Exercise => Boolean(e?.category))
      .map((e) => (e.category as string).charAt(0).toUpperCase() + (e.category as string).slice(1)),
  );
  if (cardioActivities.length > 0) categories.add("Cardio");
  return Array.from(categories);
}

export async function getWorkoutDetail(workoutId: string): Promise<{
  workout: Workout | undefined;
  groups: { exercise: Exercise | undefined; sets: WorkoutSet[] }[];
  cardioActivities: CardioActivity[];
}> {
  const supabase = createClient();
  const { data } = await supabase.from("workouts").select("*").eq("id", workoutId).maybeSingle();
  const workout = data ? mapWorkout(data) : undefined;

  const [sets, cardioActivities] = await Promise.all([
    listSetsForWorkout(workoutId),
    listCardioActivitiesForWorkout(workoutId),
  ]);
  const exerciseIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
  const exercises = await Promise.all(exerciseIds.map((id) => getExercise(id)));
  const exerciseById = new Map(exercises.filter((e): e is Exercise => Boolean(e)).map((e) => [e.id, e]));

  const groups = exerciseIds.map((exerciseId) => ({
    exercise: exerciseById.get(exerciseId),
    sets: sets.filter((s) => s.exerciseId === exerciseId),
  }));

  return { workout, groups, cardioActivities };
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
