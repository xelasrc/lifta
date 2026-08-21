import { createClient } from "@/lib/supabase/client";
import { getExercise } from "./exercises";
import { mapWorkoutSet } from "./mappers";
import type { Exercise, WorkoutSet } from "./types";

export interface StatsSummary {
  totalWorkouts: number;
  currentStreak: number;
  totalSets: number;
  totalVolumeKg: number;
}

export async function getStatsSummary(): Promise<StatsSummary> {
  const supabase = createClient();

  const [workoutsRes, setsRes] = await Promise.all([
    supabase.from("workouts").select("started_at").not("completed_at", "is", null),
    supabase.from("workout_sets").select("reps, weight_kg"),
  ]);

  const workouts = workoutsRes.data ?? [];
  const sets = setsRes.data ?? [];

  const totalWorkouts = workouts.length;
  const totalSets = sets.length;
  const totalVolumeKg = sets.reduce((sum, s) => sum + s.reps * (s.weight_kg ?? 0), 0);

  const workoutDates = new Set(workouts.map((w) => new Date(w.started_at).toDateString()));
  let currentStreak = 0;
  const cursor = new Date();
  if (!workoutDates.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (workoutDates.has(cursor.toDateString())) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { totalWorkouts, currentStreak, totalSets, totalVolumeKg };
}

export interface PersonalRecord {
  exercise: Exercise;
  best: WorkoutSet;
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const supabase = createClient();
  const { data } = await supabase.from("workout_sets").select("*");
  const sets = (data ?? []).map(mapWorkoutSet);

  const bestByExercise = new Map<string, WorkoutSet>();
  for (const set of sets) {
    const current = bestByExercise.get(set.exerciseId);
    if (!current || (set.weightKg ?? 0) > (current.weightKg ?? 0)) {
      bestByExercise.set(set.exerciseId, set);
    }
  }

  const records = await Promise.all(
    Array.from(bestByExercise.entries()).map(async ([exerciseId, best]) => {
      const exercise = await getExercise(exerciseId);
      return exercise ? { exercise, best } : null;
    }),
  );

  return records
    .filter((r): r is PersonalRecord => r !== null)
    .sort((a, b) => (b.best.weightKg ?? 0) - (a.best.weightKg ?? 0));
}
