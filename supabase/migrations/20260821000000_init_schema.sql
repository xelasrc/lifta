-- Core schema for lifta: exercises, workouts, workout_sets.
-- Mirrors the local IndexedDB schema in src/lib/db/schema.ts, plus the
-- user_id ownership column that only makes sense in the shared database.

create extension if not exists "pgcrypto";

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  -- null user_id = a global catalog exercise, visible to everyone.
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  -- restrict, not cascade: don't let deleting an exercise silently erase set history.
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  reps integer not null check (reps >= 0),
  weight_kg numeric(6, 2) check (weight_kg >= 0),
  -- named "position", not "order" (reserved word), unlike the local schema's `order` field.
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_user_id_idx on public.exercises (user_id);
create index workouts_user_id_started_at_idx on public.workouts (user_id, started_at desc);
create index workout_sets_workout_id_idx on public.workout_sets (workout_id);
create index workout_sets_user_id_idx on public.workout_sets (user_id);

-- keep updated_at current on every row update
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

create trigger workout_sets_set_updated_at
  before update on public.workout_sets
  for each row execute function public.set_updated_at();

-- Row Level Security: everything is deny-by-default until a policy allows it.
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;

create policy "select own or global exercises" on public.exercises
  for select using (user_id is null or user_id = auth.uid());

create policy "insert own exercises" on public.exercises
  for insert with check (user_id = auth.uid());

create policy "update own exercises" on public.exercises
  for update using (user_id = auth.uid());

create policy "delete own exercises" on public.exercises
  for delete using (user_id = auth.uid());

create policy "manage own workouts" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "manage own workout_sets" on public.workout_sets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- "Automatically expose new tables" is off, so grant Data API access explicitly.
-- RLS above still governs which rows each request can actually see.
grant select, insert, update, delete on public.exercises to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
grant select, insert, update, delete on public.workout_sets to authenticated;
