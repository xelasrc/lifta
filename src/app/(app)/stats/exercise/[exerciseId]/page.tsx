"use client";

import { use } from "react";
import { ExerciseStatsView } from "@/components/exercise-stats-view";

export default function StatsExercisePage(props: PageProps<"/stats/exercise/[exerciseId]">) {
  const { exerciseId } = use(props.params);
  return <ExerciseStatsView exerciseId={exerciseId} backHref="/stats" />;
}
