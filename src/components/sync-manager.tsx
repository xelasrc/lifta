"use client";

import { useEffect } from "react";
import { triggerSync } from "@/lib/db/sync";
import { pullFromSupabase } from "@/lib/db/pull-sync";

export function SyncManager() {
  useEffect(() => {
    pullFromSupabase().then(() => triggerSync());
    window.addEventListener("online", triggerSync);
    return () => window.removeEventListener("online", triggerSync);
  }, []);

  return null;
}
