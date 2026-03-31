create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9_]{3,20}$'
  )
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles ((lower(email)));

create unique index if not exists profiles_username_lower_idx
  on public.profiles ((lower(username)));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_username text;
begin
  normalized_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));

  if normalized_username = '' then
    raise exception 'Username is required';
  end if;

  insert into public.profiles (id, email, username)
  values (new.id, new.email, normalized_username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
