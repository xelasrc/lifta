"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listWorkoutsByMonth } from "@/lib/db/history";
import { pullFromSupabase } from "@/lib/db/pull-sync";
import type { Workout } from "@/lib/db/schema";
import { MonthCalendar } from "@/components/history/month-calendar";

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function HistoryPage() {
  const router = useRouter();
  const [months, setMonths] = useState<[string, Workout[]][] | null>(null);

  useEffect(() => {
    pullFromSupabase().then(() =>
      listWorkoutsByMonth().then((map) => setMonths(Array.from(map.entries()))),
    );
  }, []);

  function handleDayClick(workouts: Workout[], day: number) {
    const match = workouts.find((w) => new Date(w.startedAt).getDate() === day);
    if (match) router.push(`/history/workout/${match.id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-5 pt-8">
      <h1 className="text-2xl font-bold text-white">History</h1>

      {months === null && <div className="h-40 animate-pulse rounded-2xl bg-surface" />}
      {months?.length === 0 && <p className="text-sm text-muted">No workouts logged yet.</p>}

      {months?.map(([monthKey, workouts]) => {
        const workoutDays = new Set(workouts.map((w) => new Date(w.startedAt).getDate()));
        return (
          <div key={monthKey} className="flex flex-col gap-3">
            <Link href={`/history/${monthKey}`} className="flex items-center gap-1 text-lg font-bold text-white">
              {formatMonthLabel(monthKey)}
              <span className="text-accent">&rsaquo;</span>
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
