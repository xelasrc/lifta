"use client";

import { use } from "react";
import { ExerciseStatsView } from "@/components/exercise-stats-view";

export default function WorkoutExercisePage(props: PageProps<"/workout/[id]/exercise/[exerciseId]">) {
  const { id, exerciseId } = use(props.params);
  return <ExerciseStatsView exerciseId={exerciseId} backHref={`/workout/${id}`} />;
}
