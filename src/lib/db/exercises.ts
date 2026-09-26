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
