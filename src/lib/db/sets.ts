import { createClient } from "@/lib/supabase/client";
import { mapWorkoutSet } from "./mappers";
import type { WorkoutSet } from "./types";

export async function listSetsForWorkout(workoutId: string): Promise<WorkoutSet[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("workout_id", workoutId)
    .order("position", { ascending: true });
  return (data ?? []).map(mapWorkoutSet);
}

export async function createSet(input: {
  workoutId: string;
  exerciseId: string;
  reps: number;
  weightKg: number | null;
}): Promise<WorkoutSet> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const existing = await listSetsForWorkout(input.workoutId);

  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      user_id: user.id,
      workout_id: input.workoutId,
      exercise_id: input.exerciseId,
      reps: input.reps,
      weight_kg: input.weightKg,
      position: existing.length,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWorkoutSet(data);
}

export async function deleteSet(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workout_sets").delete().eq("id", id);
  if (error) throw error;
}
