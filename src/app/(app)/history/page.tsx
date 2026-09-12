"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWorkoutActivityFlags, listWorkoutsByMonth } from "@/lib/db/history";
import type { Workout } from "@/lib/db/types";
import { MonthCalendar, type DayActivity } from "@/components/history/month-calendar";

function formatMonthName(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [months, setMonths] = useState<[string, Workout[]][] | null>(null);
  const [activityFlags, setActivityFlags] = useState<Map<string, { hasSets: boolean; hasCardio: boolean }>>(
    new Map(),
  );
  const currentMonthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listWorkoutsByMonth().then(async (map) => {
      const entries = Array.from(map.entries());
      const allWorkoutIds = entries.flatMap(([, workouts]) => workouts.map((w) => w.id));
      const flags = await getWorkoutActivityFlags(allWorkoutIds);
      setMonths(entries);
      setActivityFlags(flags);
    });
  }, []);

  useEffect(() => {
    // Land on the current (last, since months are oldest-first) month by
    // default -- scrolling up reveals earlier months, like a calendar app.
    currentMonthRef.current?.scrollIntoView({ block: "start" });
  }, [months]);

  function handleDayClick(workouts: Workout[], day: number, monthKey: string) {
    const matches = workouts.filter((w) => new Date(w.startedAt).getDate() === day);
    if (matches.length === 1) {
      router.push(`/history/workout/${matches[0].id}`);
    } else if (matches.length > 1) {
      // Multiple workouts on the same day — send to the month list instead
      // of guessing which one the user meant.
      router.push(`/history/${monthKey}`);
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 gap-6">
        <div className="relative border-b border-white/10 bg-background px-3 pt-8 pb-3">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="mt-1 text-sm text-muted">Today · {today}</p>
          <div className="pointer-events-none absolute inset-x-0 top-full h-20 bg-linear-to-b from-background/70 to-transparent" />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-3">
        {months === null && <div className="h-40 animate-pulse rounded-2xl bg-surface" />}
        {months?.length === 0 && <p className="text-sm text-muted">No workouts logged yet.</p>}

        {months?.map(([monthKey, workouts], index) => {
          const workoutDayFlags = new Map<number, DayActivity>();
          for (const w of workouts) {
            const day = new Date(w.startedAt).getDate();
            const flags = activityFlags.get(w.id) ?? { hasSets: false, hasCardio: false };
            const existing = workoutDayFlags.get(day) ?? { hasStrength: false, hasCardio: false };
            workoutDayFlags.set(day, {
              hasStrength: existing.hasStrength || flags.hasSets,
              hasCardio: existing.hasCardio || flags.hasCardio,
            });
          }
          const year = monthKey.split("-")[0];
          const isCurrentMonth = index === months.length - 1;
          return (
            <div
              key={monthKey}
              ref={isCurrentMonth ? currentMonthRef : undefined}
              className="flex scroll-mt-26 flex-col gap-4 rounded-2xl bg-surface px-3 py-5"
            >
              <Link href={`/history/${monthKey}`} className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-lg font-bold text-white">
                  {formatMonthName(monthKey)}
                  <span className="text-muted">&rsaquo;</span>
                </span>
                <span className="text-lg font-bold text-white">{year}</span>
              </Link>
              <MonthCalendar
                monthKey={monthKey}
                workoutDayFlags={workoutDayFlags}
                onDayClick={(day) => handleDayClick(workouts, day, monthKey)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
