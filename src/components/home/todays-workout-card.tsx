"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTodaysWorkout, getOrCreateTodaysWorkout, listTodaysCompletedWorkouts, listRecentWorkouts } from "@/lib/db/workouts";
import { getWorkoutDetail } from "@/lib/db/history";
import type { Workout } from "@/lib/db/types";
import { SlideToStart } from "./slide-to-start";
import { CheckIcon } from "@/components/icons/check-icon";
import { formatRelativeDay, formatDuration } from "@/lib/date";

type Progress = { exercises: number; sets: number };

async function getProgress(workoutId: string): Promise<Progress> {
  const { groups } = await getWorkoutDetail(workoutId);
  return { exercises: groups.length, sets: groups.reduce((sum, g) => sum + g.sets.length, 0) };
}

function progressLabel({ exercises, sets }: Progress): string {
  return `${exercises} exercise${exercises === 1 ? "" : "s"} · ${sets} set${sets === 1 ? "" : "s"}`;
}

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedToday, setCompletedToday] = useState<Workout[]>([]);
  const [completedProgress, setCompletedProgress] = useState<Map<string, Progress>>(new Map());
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTodaysWorkout().then(async (found) => {
      setWorkout(found ?? null);
      if (found) {
        router.prefetch(`/workout/${found.id}`);
        router.prefetch(`/workout/${found.id}/new-set`);
        setProgress(await getProgress(found.id));
      } else {
        const completed = await listTodaysCompletedWorkouts();
        setCompletedToday(completed);
        if (completed.length > 0) {
          const entries = await Promise.all(
            completed.map(async (w) => [w.id, await getProgress(w.id)] as const),
          );
          setCompletedProgress(new Map(entries));
        } else {
          const [recent] = await listRecentWorkouts(1);
          setLastWorkout(recent ?? null);
        }
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
        <div className="rounded-2xl border-l-4 border-accent bg-surface p-5">
          <p className="text-sm font-semibold text-muted">Today&apos;s Workout</p>
          <p className="text-xl font-bold text-white">{workout.title}</p>
          {progress && (progress.exercises > 0 || progress.sets > 0) && (
            <p className="mt-1 text-xs text-muted">{progressLabel(progress)}</p>
          )}
        </div>
      ) : completedToday.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">
            {completedToday.length > 1 ? "Today's workouts" : "Today's workout"}
          </p>
          {completedToday.map((w) => {
            const p = completedProgress.get(w.id);
            const details = [formatDuration(w.startedAt, w.completedAt ?? w.startedAt), p && progressLabel(p)]
              .filter(Boolean)
              .join(" · ");
            return (
              <Link
                key={w.id}
                href={`/history/workout/${w.id}`}
                className="flex items-center justify-between gap-3 rounded-xl py-1 text-white hover:text-accent"
              >
                <div className="flex items-start gap-2">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="font-bold">{w.title}</p>
                    {details && <p className="text-xs text-muted">{details}</p>}
                  </div>
                </div>
                <span className="text-accent">&rsaquo;</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">No workout yet today</p>
          {lastWorkout && (
            <p className="mt-1 text-xs text-muted">
              Last: {lastWorkout.title} · {formatRelativeDay(lastWorkout.startedAt)}
            </p>
          )}
        </div>
      )}
      <SlideToStart
        label={workout ? "Continue" : completedToday.length > 0 ? "New Workout" : "Start"}
        onComplete={handleStart}
        disabled={starting}
      />
    </div>
  );
}
