create or replace function public.is_group_member(check_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = check_group_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(check_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = check_group_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.shares_group_with_profile(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members current_member
    join public.group_members target_member
      on target_member.group_id = current_member.group_id
    where current_member.user_id = auth.uid()
      and target_member.user_id = target_user_id
  );
$$;

drop policy if exists "Members can read groups" on public.groups;
create policy "Members can read groups"
on public.groups
for select
to authenticated
using (public.is_group_member(id));

drop policy if exists "Owners can delete groups" on public.groups;
create policy "Owners can delete groups"
on public.groups
for delete
to authenticated
using (public.is_group_owner(id));

drop policy if exists "Members can read memberships in their groups" on public.group_members;
create policy "Members can read memberships in their groups"
on public.group_members
for select
to authenticated
using (public.is_group_member(group_id));

drop policy if exists "Owners can remove members" on public.group_members;
create policy "Owners can remove members"
on public.group_members
for delete
to authenticated
using (
  public.is_group_owner(group_id)
  and user_id <> auth.uid()
  and role <> 'owner'
);

drop policy if exists "Group members can read related profiles" on public.profiles;
create policy "Group members can read related profiles"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.shares_group_with_profile(id)
);
