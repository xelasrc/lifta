"use client";

import { useEffect, useState } from "react";
import { getStatsSummary, getPersonalRecords, type StatsSummary, type PersonalRecord } from "@/lib/db/stats";

export default function StatsPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [records, setRecords] = useState<PersonalRecord[] | null>(null);

  useEffect(() => {
    getStatsSummary().then(setSummary);
    getPersonalRecords().then(setRecords);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-8 px-3 pt-8">
      <h1 className="text-2xl font-bold text-white">Stats</h1>

      {summary === null ? (
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Workouts" value={summary.totalWorkouts} />
          <StatTile label="Day streak" value={summary.currentStreak} />
          <StatTile label="Sets logged" value={summary.totalSets} />
          <StatTile label="Volume (kg)" value={Math.round(summary.totalVolumeKg).toLocaleString()} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted">Personal records</p>

        {records === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}
        {records?.length === 0 && <p className="text-sm text-muted">Log a set to start tracking records.</p>}

        {records?.map((record) => (
          <div
            key={record.exercise.id}
            className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
          >
            <p className="font-semibold text-white">{record.exercise.name}</p>
            <div className="text-right text-sm text-muted">
              <p>Reps: {record.best.reps}</p>
              <p>Weight: {record.best.weightKg ?? 0}kg</p>
            </div>
          </div>
        ))}
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
