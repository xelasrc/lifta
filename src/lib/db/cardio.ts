import { createClient } from "@/lib/supabase/client";
import { mapCardioActivity } from "./mappers";
import type { CardioActivity } from "./types";

export async function listCardioActivitiesForWorkout(workoutId: string): Promise<CardioActivity[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("cardio_activities")
    .select("*")
    .eq("workout_id", workoutId)
    .order("created_at", { ascending: true });
  return (data ?? []).map(mapCardioActivity);
}

export async function createCardioActivity(input: {
  workoutId: string;
  activityType: string;
  durationMinutes: number;
  distanceKm: number | null;
  notes: string | null;
}): Promise<CardioActivity> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("cardio_activities")
    .insert({
      user_id: user.id,
      workout_id: input.workoutId,
      activity_type: input.activityType,
      duration_minutes: input.durationMinutes,
      distance_km: input.distanceKm,
      notes: input.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCardioActivity(data);
}

export async function updateCardioActivity(
  id: string,
  updates: { activityType: string; durationMinutes: number; distanceKm: number | null; notes: string | null },
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("cardio_activities")
    .update({
      activity_type: updates.activityType,
      duration_minutes: updates.durationMinutes,
      distance_km: updates.distanceKm,
      notes: updates.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCardioActivity(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("cardio_activities").delete().eq("id", id);
  if (error) throw error;
}
