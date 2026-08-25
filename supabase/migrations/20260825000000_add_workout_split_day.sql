-- A free-text tag for the workout's split day (e.g. "Push", "Pull", "Legs"),
-- editable alongside the workout title from the Add Sets screen.
alter table public.workouts add column split_day text;
