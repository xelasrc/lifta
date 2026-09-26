import { createClient } from "@/lib/supabase/client";
import { mapExercise } from "./mappers";
import type { Exercise } from "./types";

export async function getExercise(id: string): Promise<Exercise | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("exercises").select("*").eq("id", id).maybeSingle();
  return data ? mapExercise(data) : undefined;
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const q = query.trim();

  // RLS also permits reading an accepted friend's custom exercises now, so
  // this must filter explicitly -- suggestions here should only ever be
  // global catalog exercises or the caller's own, never a friend's.
  let request = supabase
    .from("exercises")
    .select("*")
    .or(user ? `user_id.is.null,user_id.eq.${user.id}` : "user_id.is.null")
    .order("name", { ascending: true });
  if (q) {
    request = request.ilike("name", `%${q}%`);
  }

  const { data } = await request;
  return (data ?? []).map(mapExercise);
}

export async function createExercise(name: string): Promise<Exercise> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("exercises")
    .insert({ user_id: user.id, name })
    .select()
    .single();
  if (error) throw error;
  return mapExercise(data);
}

// Only the caller's own custom exercises -- global catalog entries
// (user_id null) aren't yours to manage or delete.
export async function listMyExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });
  return (data ?? []).map(mapExercise);
}

// workout_sets.exercise_id is ON DELETE RESTRICT, so this fails (with
// Postgres code 23503) for any exercise that's actually been logged --
// surfaced here as a friendly message instead of a raw FK error.
export async function deleteExercise(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error("Can't delete an exercise that's already logged in a workout");
    }
    throw error;
  }
}
