import { createClient } from "@/lib/supabase/client";
import { mapWorkout } from "./mappers";
import type { Workout } from "./types";

// RLS also permits reading an accepted friend's rows now (see the social
// migration), so every "my stuff" query here must filter to auth.uid()
// explicitly rather than relying on RLS to imply "mine only".
async function requireUserId(supabase: ReturnType<typeof createClient>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

export async function listRecentWorkouts(limit = 5): Promise<Workout[]> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapWorkout);
}

// Returns today's *in-progress* workout, if any — a completed workout is
// done and shouldn't be resumed, so it's treated the same as no workout yet.
export async function getTodaysWorkout(): Promise<Workout | undefined> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
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
  const userId = await requireUserId(supabase);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .gte("started_at", startOfDay.toISOString())
    .lt("started_at", endOfDay.toISOString())
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false });

  return (data ?? []).map(mapWorkout);
}

// In-progress workouts started before today -- e.g. abandoned mid-log and
// never ended. These fall outside every other query (History only shows
// completed workouts; getTodaysWorkout only looks at today), so without this
// they're permanently unreachable except by guessing the URL.
export async function listStaleInProgressWorkouts(): Promise<Workout[]> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .lt("started_at", startOfDay.toISOString())
    .is("completed_at", null)
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

// Scoped to the caller's own workouts -- use listFriendCompletedWorkouts (in
// social.ts) for reading an accepted friend's workouts by their user id.
export async function getWorkoutById(id: string): Promise<Workout | undefined> {
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const { data } = await supabase.from("workouts").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  return data ? mapWorkout(data) : undefined;
}

export async function getWorkoutsByIds(ids: string[]): Promise<Workout[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const userId = await requireUserId(supabase);
  const { data } = await supabase.from("workouts").select("*").in("id", ids).eq("user_id", userId);
  return (data ?? []).map(mapWorkout);
}

// The workout's display name is derived from its split day rather than
// entered separately — "legs" becomes "Legs", empty becomes "Workout".
export function deriveWorkoutTitle(splitDay: string | null): string {
  if (!splitDay) return "Workout";
  return `${splitDay.charAt(0).toUpperCase()}${splitDay.slice(1)}`;
}

export async function updateWorkoutDetails(
  id: string,
  updates: { title: string; splitDay: string | null; startedAt?: string; completedAt?: string | null },
): Promise<void> {
  const supabase = createClient();
  const payload: { title: string; split_day: string | null; started_at?: string; completed_at?: string | null } = {
    title: updates.title,
    split_day: updates.splitDay,
  };
  if (updates.startedAt !== undefined) payload.started_at = updates.startedAt;
  if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
  const { error } = await supabase.from("workouts").update(payload).eq("id", id);
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

// Cascades to the workout's sets (workout_sets.workout_id ON DELETE CASCADE).
export async function deleteWorkout(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw error;
}
