import { getDB } from "./index";
import { enqueueSync } from "./sync-queue";
import { triggerSync } from "./sync";
import { createClient } from "@/lib/supabase/client";
import type { Exercise } from "./schema";

export async function syncExercisesFromSupabase() {
  const supabase = createClient();

  try {
    // Cap the wait: offline requests can otherwise hang for the browser's full
    // network timeout (10s+) before falling back to the local cache.
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .abortSignal(AbortSignal.timeout(3000));
    if (error || !data) return;

    const db = await getDB();
    const tx = db.transaction("exercises", "readwrite");
    await Promise.all([
      ...data.map((row) =>
        tx.store.put({
          id: row.id,
          name: row.name,
          category: row.category,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } satisfies Exercise),
      ),
      tx.done,
    ]);
  } catch {
    // Offline or timed out - proceed with whatever's already cached locally.
  }
}

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDB();
  return db.getAllFromIndex("exercises", "by-name");
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  const db = await getDB();
  return db.get("exercises", id);
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const all = await listExercises();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((exercise) => exercise.name.toLowerCase().includes(q));
}

export async function createExercise(name: string): Promise<Exercise> {
  const db = await getDB();
  const now = new Date().toISOString();
  const exercise: Exercise = {
    id: crypto.randomUUID(),
    name,
    category: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.put("exercises", exercise);
  await enqueueSync("exercises", "insert", exercise);
  triggerSync();
  return exercise;
}
