import { createClient } from "@/lib/supabase/server";
import { Greeting } from "@/components/home/greeting";
import { TodaysWorkoutCard } from "@/components/home/todays-workout-card";
import { RecentWorkoutsList } from "@/components/home/recent-workouts-list";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="flex flex-1 flex-col gap-8 px-5 pt-8">
      <Greeting name={name} />
      <TodaysWorkoutCard />
      <RecentWorkoutsList />
    </div>
  );
}
