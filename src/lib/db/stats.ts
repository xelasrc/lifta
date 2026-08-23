import { createClient } from "@/lib/supabase/client";

export interface StatsSummary {
  totalWorkouts: number;
  currentStreak: number;
  totalSets: number;
}

export async function getStatsSummary(): Promise<StatsSummary> {
  const supabase = createClient();

  const [workoutsRes, setsRes] = await Promise.all([
    supabase.from("workouts").select("started_at").not("completed_at", "is", null),
    supabase.from("workout_sets").select("id"),
  ]);

  const workouts = workoutsRes.data ?? [];
  const sets = setsRes.data ?? [];

  const totalWorkouts = workouts.length;
  const totalSets = sets.length;

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

  return { totalWorkouts, currentStreak, totalSets };
}
