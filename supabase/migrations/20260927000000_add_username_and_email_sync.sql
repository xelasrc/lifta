-- Username: profiles.display_name (already existed, unused until now) is a
-- non-unique username, auto-populated from the email prefix at signup and
-- editable later from the user's own profile page.
--
-- Also fixes a real bug: the original handle_new_user only ran on INSERT, so
-- profiles.email went stale forever the first time a user changed their
-- email via Settings (the friend's card would keep showing their old
-- address). Added an UPDATE OF email trigger to keep it in sync.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Backfill: every profile created before this migration has a null
-- display_name (the original insert trigger never set one).
update public.profiles
set display_name = split_part(email, '@', 1)
where display_name is null;
