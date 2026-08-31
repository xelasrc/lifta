-- Cardio logging: a workout can have zero or more cardio activities,
-- entirely independent of workout_sets (no shared row, no FK between the
-- two). A workout with cardio activities and zero sets is "cardio logged as
-- a whole workout"; a workout with both is "cardio alongside strength" --
-- the workouts table itself needs no changes, since a workout's lifecycle
-- has never been coupled to what gets logged into it.

create table public.cardio_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  activity_type text not null,
  duration_minutes integer not null,
  distance_km numeric(6, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cardio_activities_duration_minutes_check check (duration_minutes >= 0),
  constraint cardio_activities_distance_km_check check (distance_km is null or distance_km >= 0)
);

create index cardio_activities_workout_id_idx on public.cardio_activities (workout_id);
create index cardio_activities_user_id_idx on public.cardio_activities (user_id);

create trigger cardio_activities_set_updated_at
  before update on public.cardio_activities
  for each row execute function public.set_updated_at();

alter table public.cardio_activities enable row level security;

create policy "manage own cardio_activities" on public.cardio_activities
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.cardio_activities to authenticated;
