import type { Database } from "@/lib/supabase/types";
import type { CardioActivity, Exercise, Friendship, Profile, Workout, WorkoutSet } from "./types";

type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];
type ExerciseRow = Database["public"]["Tables"]["exercises"]["Row"];
type WorkoutSetRow = Database["public"]["Tables"]["workout_sets"]["Row"];
type CardioActivityRow = Database["public"]["Tables"]["cardio_activities"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type FriendshipRow = Database["public"]["Tables"]["friendships"]["Row"];

export function mapWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    splitDay: row.split_day,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    reps: row.reps,
    weightKg: row.weight_kg,
    order: row.position,
    type: row.type,
    parentSetId: row.parent_set_id,
    partialReps: row.partial_reps,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCardioActivity(row: CardioActivityRow): CardioActivity {
  return {
    id: row.id,
    workoutId: row.workout_id,
    activityType: row.activity_type,
    durationMinutes: row.duration_minutes,
    distanceKm: row.distance_km,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
  };
}

export function mapFriendship(row: FriendshipRow): Friendship {
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: row.created_at,
  };
}
