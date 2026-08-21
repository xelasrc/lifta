"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listWorkoutsByMonth } from "@/lib/db/history";
import type { Workout } from "@/lib/db/types";
import { MonthCalendar } from "@/components/history/month-calendar";

function formatMonthName(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [months, setMonths] = useState<[string, Workout[]][] | null>(null);

  useEffect(() => {
    listWorkoutsByMonth().then((map) => setMonths(Array.from(map.entries())));
  }, []);

  function handleDayClick(workouts: Workout[], day: number) {
    const match = workouts.find((w) => new Date(w.startedAt).getDate() === day);
    if (match) router.push(`/history/workout/${match.id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">History</h1>

      {months === null && <div className="h-40 animate-pulse rounded-2xl bg-surface" />}
      {months?.length === 0 && <p className="text-sm text-muted">No workouts logged yet.</p>}

      {months?.map(([monthKey, workouts]) => {
        const workoutDays = new Set(workouts.map((w) => new Date(w.startedAt).getDate()));
        const year = monthKey.split("-")[0];
        return (
          <div key={monthKey} className="flex flex-col gap-4 rounded-2xl bg-surface px-3 py-5">
            <Link href={`/history/${monthKey}`} className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-lg font-bold text-white">
                {formatMonthName(monthKey)}
                <span className="text-muted">&rsaquo;</span>
              </span>
              <span className="text-lg font-bold text-white">{year}</span>
            </Link>
            <MonthCalendar
              monthKey={monthKey}
              workoutDays={workoutDays}
              onDayClick={(day) => handleDayClick(workouts, day)}
            />
          </div>
        );
      })}
    </div>
  );
}
