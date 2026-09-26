import Link from "next/link";
import { Greeting } from "@/components/home/greeting";
import { TodaysWorkoutCard } from "@/components/home/todays-workout-card";
import { UnfinishedWorkoutsList } from "@/components/home/unfinished-workouts-list";
import { RecentWorkoutsList } from "@/components/home/recent-workouts-list";
import { SettingsIcon } from "@/components/icons/settings-icon";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-8 px-3 pt-8">
      <div className="relative flex items-center justify-center">
        <Link href="/settings" aria-label="Settings" className="absolute left-0 text-white">
          <SettingsIcon className="h-6 w-6" />
        </Link>
        <Greeting />
      </div>
      <TodaysWorkoutCard />
      <UnfinishedWorkoutsList />
      <RecentWorkoutsList />
    </div>
  );
}
