"use client";

import { useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export function Greeting({ name }: { name: string }) {
  const timeOfDay = useSyncExternalStore(noopSubscribe, getTimeOfDay, () => "Morning");

  return (
    <div>
      <p className="text-2xl font-semibold text-white">Good {timeOfDay}</p>
      <p className="text-2xl font-semibold text-accent">{name}!</p>
    </div>
  );
}
