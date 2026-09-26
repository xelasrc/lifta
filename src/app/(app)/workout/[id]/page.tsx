"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddSetsScreen } from "@/components/workout/add-sets-screen";
import { getWorkoutById } from "@/lib/db/workouts";

export default function WorkoutByIdPage(props: PageProps<"/workout/[id]">) {
  const { id } = use(props.params);
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    getWorkoutById(id).then((workout) => {
      // Only a *completed* workout belongs in history -- an in-progress one
      // stays on this live logging screen no matter when it was started, so
      // an old abandoned workout (surfaced via the home screen's "Unfinished"
      // list) can still be resumed instead of bouncing into a redirect loop
      // with /history/workout/[id]'s own "not completed -> come back here" check.
      if (workout && workout.completedAt) {
        router.replace(`/history/workout/${id}`);
      } else {
        setAllowed(true);
      }
    });
  }, [id, router]);

  if (!allowed) return null;
  return <AddSetsScreen workoutId={id} />;
}
