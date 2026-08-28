"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTodaysWorkout, getOrCreateTodaysWorkout, listTodaysCompletedWorkouts } from "@/lib/db/workouts";
import type { Workout } from "@/lib/db/types";
import { SlideToStart } from "./slide-to-start";

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedToday, setCompletedToday] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTodaysWorkout().then(async (found) => {
      setWorkout(found ?? null);
      if (found) {
        router.prefetch(`/workout/${found.id}`);
        router.prefetch(`/workout/${found.id}/new-set`);
      } else {
        setCompletedToday(await listTodaysCompletedWorkouts());
      }
      setLoaded(true);
    });
  }, [router]);

  async function handleStart() {
    setStarting(true);
    const active = workout ?? (await getOrCreateTodaysWorkout());
    router.push(`/workout/${active.id}`);
  }

  if (!loaded) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {workout ? (
        <div className="rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">Today&apos;s Workout</p>
          <p className="text-xl font-bold text-white">{workout.title}</p>
        </div>
      ) : completedToday.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">
            {completedToday.length > 1 ? "Today's workouts" : "Today's workout"}
          </p>
          {completedToday.map((w) => (
            <Link
              key={w.id}
              href={`/history/workout/${w.id}`}
              className="flex items-center justify-between rounded-xl py-1 text-white hover:text-accent"
            >
              <span className="font-bold">{w.title}</span>
              <span className="text-accent">&rsaquo;</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">No workout yet today</p>
        </div>
      )}
      <SlideToStart label={workout ? "Continue" : "Start"} onComplete={handleStart} disabled={starting} />
    </div>
  );
}
