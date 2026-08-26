"use client";

import { use } from "react";
import { ExerciseStatsView } from "@/components/exercise-stats-view";

export default function ExerciseHistoryPage(
  props: PageProps<"/history/workout/[id]/exercise/[exerciseId]">,
) {
  const { id, exerciseId } = use(props.params);
  return <ExerciseStatsView exerciseId={exerciseId} backHref={`/history/workout/${id}`} />;
}
