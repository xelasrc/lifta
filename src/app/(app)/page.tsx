import Link from "next/link";
import { Greeting } from "@/components/home/greeting";
import { TodaysWorkoutCard } from "@/components/home/todays-workout-card";
import { UnfinishedWorkoutsList } from "@/components/home/unfinished-workouts-list";
import { RecentWorkoutsList } from "@/components/home/recent-workouts-list";
import { SettingsIcon } from "@/components/icons/settings-icon";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-10 px-5 pt-2">
      <div className="flex flex-col gap-6">
        <Link href="/settings" aria-label="Settings" className="text-accent">
          <SettingsIcon className="h-7 w-7" />
        </Link>
        <Greeting />
      </div>
      <TodaysWorkoutCard />
      <UnfinishedWorkoutsList />
      <RecentWorkoutsList />
    </div>
  );
}
