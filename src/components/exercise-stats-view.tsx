"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExercise } from "@/lib/db/exercises";
import type { Exercise } from "@/lib/db/types";
import { ExerciseStatsPanel } from "@/components/exercise-stats-panel";

export function ExerciseStatsView({ exerciseId, backHref }: { exerciseId: string; backHref: string }) {
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    getExercise(exerciseId).then((e) => setExercise(e ?? null));
  }, [exerciseId]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-center gap-3">
        <Link href={backHref} aria-label="Back" className="text-2xl font-bold text-white">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-white">{exercise?.name ?? "Exercise"}</h1>
      </div>

      <ExerciseStatsPanel exerciseId={exerciseId} />
    </div>
  );
}
