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
  const q = query.trim();

  let request = supabase.from("exercises").select("*").order("name", { ascending: true });
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
