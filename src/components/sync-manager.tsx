"use client";

import { useEffect } from "react";
import { triggerSync } from "@/lib/db/sync";

export function SyncManager() {
  useEffect(() => {
    triggerSync();
    window.addEventListener("online", triggerSync);
    return () => window.removeEventListener("online", triggerSync);
  }, []);

  return null;
}
