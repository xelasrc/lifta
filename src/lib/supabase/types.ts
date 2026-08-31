export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          split_day: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          split_day?: string | null;
          started_at: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      workout_sets: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          exercise_id: string;
          reps: number;
          weight_kg: number | null;
          position: number;
          type: "normal" | "drop";
          parent_set_id: string | null;
          partial_reps: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          exercise_id: string;
          reps: number;
          weight_kg?: number | null;
          position: number;
          type?: "normal" | "drop";
          parent_set_id?: string | null;
          partial_reps?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_sets"]["Insert"]>;
        Relationships: [];
      };
      cardio_activities: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          activity_type: string;
          duration_minutes: number;
          distance_km: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          activity_type: string;
          duration_minutes: number;
          distance_km?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cardio_activities"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
