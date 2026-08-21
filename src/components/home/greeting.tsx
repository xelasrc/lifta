"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

function noopSubscribe() {
  return () => {};
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export function Greeting() {
  const timeOfDay = useSyncExternalStore(noopSubscribe, getTimeOfDay, () => "Morning");
  const [name, setName] = useState("there");

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        const user = session?.user;
        const fullName = user?.user_metadata?.full_name as string | undefined;
        setName(fullName ?? user?.email?.split("@")[0] ?? "there");
      });
  }, []);

  return (
    <div>
      <p className="text-2xl font-semibold text-white">Good {timeOfDay}</p>
      <p className="text-2xl font-semibold text-accent">{name}!</p>
    </div>
  );
}
