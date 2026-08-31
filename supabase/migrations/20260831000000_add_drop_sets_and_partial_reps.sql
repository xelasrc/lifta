-- Drop sets: a follow-up set at reduced weight, logged immediately after (and
-- chained to) another set with no rest. type='drop' rows must reference the
-- set they dropped from via parent_set_id; chains can nest (a drop of a drop).
-- Partial reps: extra reduced-range-of-motion reps performed at the end of
-- the SAME set (not a new row) — nullable so most sets are unaffected.

alter table public.workout_sets
  add column type text not null default 'normal',
  add column parent_set_id uuid references public.workout_sets (id) on delete cascade,
  add column partial_reps integer;

alter table public.workout_sets
  add constraint workout_sets_type_check check (type in ('normal', 'drop'));

alter table public.workout_sets
  add constraint workout_sets_type_parent_consistency_check check (
    (type = 'drop' and parent_set_id is not null) or
    (type = 'normal' and parent_set_id is null)
  );

alter table public.workout_sets
  add constraint workout_sets_partial_reps_check check (partial_reps is null or partial_reps >= 0);

create index workout_sets_parent_set_id_idx on public.workout_sets (parent_set_id);
