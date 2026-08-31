import type { WorkoutSet } from "./types";

export interface SetChain {
  parent: WorkoutSet;
  drops: WorkoutSet[];
}

// Groups a flat, position-ordered list of sets into parent sets with their
// drop-set continuations attached in order. A drop-of-a-drop still flattens
// into its top-level chain's `drops` array, rather than nesting further.
export function groupIntoChains(sets: WorkoutSet[]): SetChain[] {
  const byId = new Map(sets.map((s) => [s.id, s]));
  const chains = new Map<string, SetChain>();
  const order: string[] = [];

  for (const set of sets) {
    if (set.type === "normal") {
      chains.set(set.id, { parent: set, drops: [] });
      order.push(set.id);
      continue;
    }

    let rootId = set.parentSetId;
    let cursor = rootId ? byId.get(rootId) : undefined;
    while (cursor?.type === "drop" && cursor.parentSetId) {
      rootId = cursor.parentSetId;
      cursor = byId.get(rootId);
    }

    const chain = rootId ? chains.get(rootId) : undefined;
    if (chain) chain.drops.push(set);
  }

  return order.map((id) => chains.get(id)!);
}

// Counts every descendant (children, grandchildren, ...) of `rootId` within
// `sets` — used to warn before a delete that cascades to drop continuations.
export function countDescendants(sets: WorkoutSet[], rootId: string): number {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of sets) {
      if (s.parentSetId && ids.has(s.parentSetId) && !ids.has(s.id)) {
        ids.add(s.id);
        changed = true;
      }
    }
  }
  return ids.size - 1;
}
