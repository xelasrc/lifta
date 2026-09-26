export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workout {
  id: string;
  userId: string;
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

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted";
  createdAt: string;
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
