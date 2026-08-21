"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { listWorkoutsInMonth, getWorkoutCategories } from "@/lib/db/history";
import type { Workout } from "@/lib/db/types";

type Row = Workout & { categories: string[] };

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function HistoryMonthPage(props: PageProps<"/history/[month]">) {
  const { month } = use(props.params);
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    listWorkoutsInMonth(month)
      .then((workouts) =>
        Promise.all(workouts.map(async (w) => ({ ...w, categories: await getWorkoutCategories(w.id) }))),
      )
      .then(setRows);
  }, [month]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div>
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="mt-1 text-lg font-semibold text-muted">{formatMonthLabel(month)}</p>
      </div>

      {rows === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}
      {rows?.length === 0 && <p className="text-sm text-muted">No workouts this month.</p>}

      <div className="flex flex-col gap-3">
        {rows?.map((w) => (
          <Link
            key={w.id}
            href={`/history/workout/${w.id}`}
            className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
          >
            <div>
              <p className="font-semibold text-white">{w.title}</p>
              <p className="text-xs text-muted">
                {w.categories.length > 0 ? w.categories.join(", ") : "No exercises logged"}
              </p>
            </div>
            <p className="text-sm text-muted">{new Date(w.startedAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
