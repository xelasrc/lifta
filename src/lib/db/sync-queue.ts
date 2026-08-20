import { getDB } from "./index";
import type { SyncOperation, SyncTable } from "./schema";

export async function enqueueSync(
  table: SyncTable,
  operation: SyncOperation,
  payload: unknown,
) {
  const db = await getDB();
  await db.add("sync_queue", {
    id: crypto.randomUUID(),
    table,
    operation,
    payload,
    createdAt: new Date().toISOString(),
  });
}

export async function drainSyncQueue(
  handler: (entry: {
    table: SyncTable;
    operation: SyncOperation;
    payload: unknown;
  }) => Promise<void>,
) {
  const db = await getDB();
  const entries = await db.getAllFromIndex("sync_queue", "by-createdAt");

  for (const entry of entries) {
    try {
      await handler(entry);
      await db.delete("sync_queue", entry.id);
    } catch {
      // Leave failed entries queued; retry on the next sync pass
      // (e.g. next "online" event) instead of dropping local writes.
      break;
    }
  }
}
