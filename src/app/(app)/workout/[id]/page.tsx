"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddSetsScreen } from "@/components/workout/add-sets-screen";
import { getWorkoutById } from "@/lib/db/workouts";
import { isToday } from "@/lib/date";

export default function WorkoutByIdPage(props: PageProps<"/workout/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getWorkoutById(id).then((workout) => {
      if (workout && (workout.completedAt || !isToday(workout.startedAt))) {
        router.replace(`/history/workout/${id}`);
      } else {
        setAllowed(true);
      }
    });
  }, [id, router]);

  if (!allowed) return null;
  return <AddSetsScreen workoutId={id} />;
}
