import { openDB, type IDBPDatabase } from "idb";
import type { LiftaDB } from "./schema";

const DB_NAME = "lifta";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LiftaDB>> | null = null;

export function getDB() {
  if (typeof window === "undefined") {
    throw new Error("getDB() can only be called in the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<LiftaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const workouts = db.createObjectStore("workouts", { keyPath: "id" });
        workouts.createIndex("by-startedAt", "startedAt");

        const exercises = db.createObjectStore("exercises", { keyPath: "id" });
        exercises.createIndex("by-name", "name");

        const sets = db.createObjectStore("workout_sets", { keyPath: "id" });
        sets.createIndex("by-workoutId", "workoutId");

        const syncQueue = db.createObjectStore("sync_queue", { keyPath: "id" });
        syncQueue.createIndex("by-createdAt", "createdAt");
      },
    });
  }

  return dbPromise;
}
