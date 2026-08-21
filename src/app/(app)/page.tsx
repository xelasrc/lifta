import { Greeting } from "@/components/home/greeting";
import { TodaysWorkoutCard } from "@/components/home/todays-workout-card";
import { RecentWorkoutsList } from "@/components/home/recent-workouts-list";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-8 px-5 pt-8">
      <Greeting />
      <TodaysWorkoutCard />
      <RecentWorkoutsList />
    </div>
  );
}
