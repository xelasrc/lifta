"use client";

import { use } from "react";
import { AddSetsScreen } from "@/components/workout/add-sets-screen";

export default function WorkoutByIdPage(props: PageProps<"/workout/[id]">) {
  const { id } = use(props.params);
  return <AddSetsScreen workoutId={id} />;
}
