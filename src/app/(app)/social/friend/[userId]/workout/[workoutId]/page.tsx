"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getWorkoutCategories, getWorkoutDetail } from "@/lib/db/history";
import { getProfilesByIds } from "@/lib/db/social";
import { groupIntoChains } from "@/lib/db/set-chains";
import type { CardioActivity, Exercise, Profile, Workout, WorkoutSet } from "@/lib/db/types";
import { CardioActivityCard } from "@/components/workout/cardio-activity-card";

type Group = { exercise: Exercise | undefined; sets: WorkoutSet[] };

// A read-only view of an accepted friend's workout -- kept separate from
// /history/workout/[id] so its back arrow returns to that friend's workout
// list, not to the signed-in user's own /history.
export default function FriendWorkoutDetailPage(
  props: PageProps<"/social/friend/[userId]/workout/[workoutId]">,
) {
  const { userId, workoutId } = use(props.params);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [cardioActivities, setCardioActivities] = useState<CardioActivity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getWorkoutDetail(workoutId).then((detail) => {
      setWorkout(detail.workout ?? null);
      setGroups(detail.groups);
      setCardioActivities(detail.cardioActivities);
    });
    getWorkoutCategories(workoutId).then(setCategories);
    getProfilesByIds([userId]).then((profiles) => setProfile(profiles.get(userId) ?? null));
  }, [workoutId, userId]);

  if (!workout) {
    return (
      <div className="flex flex-1 flex-col px-3 pt-8">
        <div className="h-24 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-8">
      <div className="flex items-center gap-3">
        <Link href={`/social/friend/${userId}`} aria-label="Back" className="text-2xl font-bold text-heading">
          &lsaquo;
        </Link>
        <div>
          <p className="text-sm font-semibold text-muted">{profile?.displayName ?? profile?.email ?? "…"}</p>
          <h1 className="text-2xl font-bold text-heading">{workout.title}</h1>
        </div>
      </div>

      <div className="rounded-2xl bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-white">{workout.title}</p>
          <p className="shrink-0 whitespace-nowrap text-sm text-muted">
            {new Date(workout.startedAt).toLocaleDateString()}
          </p>
        </div>
        {categories.length > 0 && <p className="mt-1 text-sm text-accent">{categories.join(", ")}</p>}
      </div>

      {cardioActivities.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-heading/70">Cardio</p>
          {cardioActivities.map((activity) => (
            <CardioActivityCard
              key={activity.id}
              activity={activity}
              showControls={false}
              onUpdated={() => {}}
              onDeleted={() => {}}
            />
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-heading/70">Sets</p>
          {groups.map((group) => (
            <div key={group.exercise?.id ?? group.sets[0]?.id} className="rounded-2xl bg-surface p-4">
              <p className="border-b border-white/10 pb-3 font-semibold text-white">
                {group.exercise?.name ?? "Exercise"}
              </p>
              <div className="divide-y divide-white/10">
                {groupIntoChains(group.sets).map((chain, i) => (
                  <div key={chain.parent.id} className="flex flex-col gap-1 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">Set {i + 1}</p>
                      <p className="text-sm text-muted">
                        {chain.parent.reps} x {chain.parent.weightKg ?? 0}kg
                        {chain.parent.partialReps ? ` +${chain.parent.partialReps} partial` : ""}
                      </p>
                    </div>
                    {chain.drops.map((drop) => (
                      <div key={drop.id} className="flex items-center justify-between pl-4">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-muted">
                          Drop
                        </span>
                        <p className="text-sm text-muted">
                          {drop.reps} x {drop.weightKg ?? 0}kg
                          {drop.partialReps ? ` +${drop.partialReps} partial` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
