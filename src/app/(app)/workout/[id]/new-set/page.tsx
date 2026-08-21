"use client";

import { use } from "react";
import { NewSetScreen } from "@/components/workout/new-set-screen";

export default function WorkoutByIdNewSetPage(props: PageProps<"/workout/[id]/new-set">) {
  const { id } = use(props.params);
  return <NewSetScreen workoutId={id} />;
}
