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
  splitDay: string | null;
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
  type: "normal" | "drop";
  parentSetId: string | null;
  partialReps: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CardioActivity {
  id: string;
  workoutId: string;
  activityType: string;
  durationMinutes: number;
  distanceKm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
