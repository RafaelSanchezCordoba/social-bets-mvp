create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint groups_invite_code_format check (invite_code ~ '^[A-Z0-9]{6}$')
);

create unique index if not exists groups_name_lower_idx
  on public.groups ((lower(name)));

create unique index if not exists groups_invite_code_idx
  on public.groups (invite_code);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member',
  points integer not null default 1000,
  created_at timestamptz not null default timezone('utc', now()),
  constraint group_members_role_check check (role in ('owner', 'member')),
  constraint group_members_points_check check (points >= 0)
);

create unique index if not exists group_members_group_user_idx
  on public.group_members (group_id, user_id);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "Authenticated users can create groups"
on public.groups
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "Members can read groups"
on public.groups
for select
to authenticated
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = (select auth.uid())
  )
);

create policy "Owners can delete groups"
on public.groups
for delete
to authenticated
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = groups.id
      and gm.user_id = (select auth.uid())
      and gm.role = 'owner'
  )
);

create policy "Users can join groups as themselves"
on public.group_members
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Members can read memberships in their groups"
on public.group_members
for select
to authenticated
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = (select auth.uid())
  )
);

create policy "Owners can remove members"
on public.group_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.group_members gm
    where gm.group_id = group_members.group_id
      and gm.user_id = (select auth.uid())
      and gm.role = 'owner'
  )
  and group_members.user_id <> (select auth.uid())
  and group_members.role <> 'owner'
);
