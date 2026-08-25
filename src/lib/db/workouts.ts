import { createClient } from "@/lib/supabase/client";
import { mapWorkout } from "./mappers";
import type { Workout } from "./types";

export async function listRecentWorkouts(limit = 5): Promise<Workout[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapWorkout);
}

// Returns today's *in-progress* workout, if any — a completed workout is
// done and shouldn't be resumed, so it's treated the same as no workout yet.
export async function getTodaysWorkout(): Promise<Workout | undefined> {
  const supabase = createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .gte("started_at", startOfDay.toISOString())
    .lt("started_at", endOfDay.toISOString())
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? mapWorkout(data) : undefined;
}

export async function listTodaysCompletedWorkouts(): Promise<Workout[]> {
  const supabase = createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .gte("started_at", startOfDay.toISOString())
    .lt("started_at", endOfDay.toISOString())
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false });

  return (data ?? []).map(mapWorkout);
}

export async function createWorkout(title: string): Promise<Workout> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, title, started_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return mapWorkout(data);
}

export async function getOrCreateTodaysWorkout(): Promise<Workout> {
  const existing = await getTodaysWorkout();
  return existing ?? createWorkout("Workout");
}

export async function getWorkoutById(id: string): Promise<Workout | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("workouts").select("*").eq("id", id).maybeSingle();
  return data ? mapWorkout(data) : undefined;
}

export async function updateWorkoutTitle(id: string, title: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workouts").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function updateWorkoutDetails(
  id: string,
  updates: { title: string; splitDay: string | null },
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("workouts")
    .update({ title: updates.title, split_day: updates.splitDay })
    .eq("id", id);
  if (error) throw error;
}

export async function completeWorkout(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("workouts")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
