"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStatsSummary, type StatsSummary } from "@/lib/db/stats";
import { searchExercises } from "@/lib/db/exercises";
import type { Exercise } from "@/lib/db/types";

export default function StatsPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    getStatsSummary().then(setSummary);
  }, []);

  useEffect(() => {
    searchExercises(query).then(setExercises);
  }, [query]);

  return (
    <div className="flex flex-1 flex-col gap-8 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">Stats</h1>

      {summary === null ? (
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Workouts" value={summary.totalWorkouts} />
          <StatTile label="Day streak" value={summary.currentStreak} />
          <StatTile label="Sets logged" value={summary.totalSets} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Exercises</p>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercises..."
          className="rounded-2xl bg-surface px-5 py-4 text-white placeholder-muted outline-none focus:ring-2 focus:ring-accent"
        />

        {exercises === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}
        {exercises?.length === 0 && <p className="text-sm text-muted">No exercises found.</p>}

        {exercises && exercises.length > 0 && (
          <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto rounded-2xl bg-surface p-2 scrollbar-none">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/stats/exercise/${exercise.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-white hover:bg-white/5"
              >
                {exercise.name}
                <span className="text-accent">&rsaquo;</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
