"use client";

import { use } from "react";
import { NewSetScreen } from "@/components/workout/new-set-screen";

export default function WorkoutByIdNewSetForExercisePage(
  props: PageProps<"/workout/[id]/new-set/[exerciseId]">,
) {
  const { id, exerciseId } = use(props.params);
  return <NewSetScreen workoutId={id} initialExerciseId={exerciseId} />;
}
