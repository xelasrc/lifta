"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getProfilesByIds, listFriendCompletedWorkouts } from "@/lib/db/social";
import { formatDuration } from "@/lib/date";
import type { Profile, Workout } from "@/lib/db/types";

export default function FriendWorkoutsPage(props: PageProps<"/social/friend/[userId]">) {
  const { userId } = use(props.params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    getProfilesByIds([userId]).then((profiles) => setProfile(profiles.get(userId) ?? null));
    listFriendCompletedWorkouts(userId).then(setWorkouts);
  }, [userId]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-center gap-3">
        <Link href="/social" aria-label="Back to social" className="text-2xl font-bold text-heading">
          &lsaquo;
        </Link>
        <h1 className="text-2xl font-bold text-heading">{profile?.displayName ?? profile?.email ?? "…"}</h1>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-heading/70">Workouts</p>

        {workouts === null && <div className="h-16 animate-pulse rounded-2xl bg-surface" />}

        {workouts?.length === 0 && <p className="text-sm text-heading/70">No workouts logged yet.</p>}

        {workouts?.map((workout) => (
          <Link
            key={workout.id}
            href={`/social/friend/${userId}/workout/${workout.id}`}
            className="flex items-center justify-between rounded-full bg-pill px-5 py-4"
          >
            <div>
              <p className="font-semibold text-heading">{workout.title}</p>
              <p className="text-sm text-muted">
                {new Date(workout.startedAt).toLocaleDateString()}
                {workout.completedAt && ` · ${formatDuration(workout.startedAt, workout.completedAt)}`}
              </p>
            </div>
            <span className="text-accent">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
