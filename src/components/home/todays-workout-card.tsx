"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTodaysWorkout, getOrCreateTodaysWorkout, listTodaysCompletedWorkouts } from "@/lib/db/workouts";
import { getWorkoutDetail } from "@/lib/db/history";
import type { Workout } from "@/lib/db/types";
import { SlideToStart } from "./slide-to-start";
import { CheckIcon } from "@/components/icons/check-icon";
import { formatDuration } from "@/lib/date";

type Progress = { exercises: number; sets: number; cardio: number };

async function getProgress(workoutId: string): Promise<Progress> {
  const { groups, cardioActivities } = await getWorkoutDetail(workoutId);
  return {
    exercises: groups.length,
    sets: groups.reduce((sum, g) => sum + g.sets.length, 0),
    cardio: cardioActivities.length,
  };
}

function progressLabel({ exercises, sets, cardio }: Progress): string {
  const base = `${exercises} exercise${exercises === 1 ? "" : "s"} · ${sets} set${sets === 1 ? "" : "s"}`;
  return cardio > 0 ? `${base} · ${cardio} cardio` : base;
}

export function TodaysWorkoutCard() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completedToday, setCompletedToday] = useState<Workout[]>([]);
  const [completedProgress, setCompletedProgress] = useState<Map<string, Progress>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!workout) return;
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, [workout]);

  useEffect(() => {
    getTodaysWorkout().then(async (found) => {
      setWorkout(found ?? null);
      if (found) {
        router.prefetch(`/workout/${found.id}`);
        router.prefetch(`/workout/${found.id}/new-set`);
        setProgress(await getProgress(found.id));
      }

      const completed = await listTodaysCompletedWorkouts();
      setCompletedToday(completed);
      if (completed.length > 0) {
        const entries = await Promise.all(
          completed.map(async (w) => [w.id, await getProgress(w.id)] as const),
        );
        setCompletedProgress(new Map(entries));
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
      {workout || completedToday.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
          {completedToday.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-muted">Today&apos;s Workouts</p>
              {completedToday.map((w) => {
                const p = completedProgress.get(w.id);
                const details = [
                  formatDuration(w.startedAt, w.completedAt ?? w.startedAt),
                  p && progressLabel(p),
                ]
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
          )}
          {workout && (
            <div className={completedToday.length > 0 ? "mt-1 border-t border-white/10 pt-3" : ""}>
              <p className="text-sm font-semibold text-muted">In Progress</p>
              <div className="mt-2 flex items-start gap-2 py-1 text-white">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
                </span>
                <div>
                  <p className="font-bold">{workout.title}</p>
                  <p className="text-xs text-muted">
                    {formatDuration(workout.startedAt, now.toISOString())} ·{" "}
                    {progressLabel(progress ?? { exercises: 0, sets: 0, cardio: 0 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface p-5">
          <p className="text-sm font-semibold text-muted">No workout yet today</p>
        </div>
      )}
      {workout ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="rounded-full bg-accent py-4 font-bold text-white disabled:opacity-60"
        >
          Continue
        </button>
      ) : (
        <SlideToStart
          label={completedToday.length > 0 ? "New Workout" : "Start"}
          onComplete={handleStart}
          disabled={starting}
        />
      )}
    </div>
  );
}
