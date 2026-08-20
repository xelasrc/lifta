import type { DBSchema } from "idb";

export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  title: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  reps: number;
  weightKg: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type SyncOperation = "insert" | "update" | "delete";
export type SyncTable = "workouts" | "exercises" | "workout_sets";

export interface SyncQueueEntry {
  id: string;
  table: SyncTable;
  operation: SyncOperation;
  payload: unknown;
  createdAt: string;
}

export interface LiftaDB extends DBSchema {
  workouts: {
    key: string;
    value: Workout;
    indexes: { "by-startedAt": string };
  };
  exercises: {
    key: string;
    value: Exercise;
    indexes: { "by-name": string };
  };
  workout_sets: {
    key: string;
    value: WorkoutSet;
    indexes: { "by-workoutId": string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueEntry;
    indexes: { "by-createdAt": string };
  };
}
