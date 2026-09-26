-- Social: a public profiles directory (so users can be found by email) plus
-- a friendships table, and new read policies letting accepted friends see
-- each other's workouts/sets/cardio/exercises. Every *existing* unscoped
-- "list my stuff" query in the app must be given an explicit user_id filter
-- alongside this migration -- RLS no longer implies "mine only" once the
-- friends-select policies below are active, it now implies "mine or my
-- accepted friends'".

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Any signed-in user can look up any profile by id/email -- this is an
-- intentional public directory (email + display name only) so friend
-- search works; it exposes nothing else about the account.
create policy "select all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

grant select, update on public.profiles to authenticated;

-- Populate a profile row automatically on signup.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_no_self_friend check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index friendships_requester_id_idx on public.friendships (requester_id);
create index friendships_addressee_id_idx on public.friendships (addressee_id);

create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

alter table public.friendships enable row level security;

create policy "select own friendships" on public.friendships
  for select using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "insert own friend requests" on public.friendships
  for insert with check (requester_id = auth.uid());

-- Either side can update (the addressee accepts; either can also just leave
-- it as-is) -- the app only ever flips pending -> accepted, from the
-- addressee's side, but this isn't security-critical either way since a
-- friendship conveys read-only access, not a privilege escalation.
create policy "update own friendships" on public.friendships
  for update using (requester_id = auth.uid() or addressee_id = auth.uid())
  with check (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "delete own friendships" on public.friendships
  for delete using (requester_id = auth.uid() or addressee_id = auth.uid());

grant select, insert, update, delete on public.friendships to authenticated;

-- Friends-visibility: additive (permissive) select policies alongside each
-- table's existing "manage own" policy -- Postgres OR's permissive policies
-- together, so this only ever widens read access, never narrows the
-- existing owner-only write policies.
create policy "select accepted friends workouts" on public.workouts
  for select using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = workouts.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = workouts.user_id))
    )
  );

create policy "select accepted friends workout_sets" on public.workout_sets
  for select using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = workout_sets.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = workout_sets.user_id))
    )
  );

create policy "select accepted friends cardio_activities" on public.cardio_activities
  for select using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = cardio_activities.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = cardio_activities.user_id))
    )
  );

create policy "select accepted friends exercises" on public.exercises
  for select using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = exercises.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = exercises.user_id))
    )
  );
