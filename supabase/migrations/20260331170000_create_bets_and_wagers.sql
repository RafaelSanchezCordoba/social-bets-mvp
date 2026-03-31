create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  status text not null default 'open',
  ends_at timestamptz,
  closed_at timestamptz,
  resolved_at timestamptz,
  cancelled_at timestamptz,
  winning_option_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  constraint bets_status_check check (status in ('open', 'closed', 'resolved', 'cancelled'))
);

create unique index if not exists bets_id_group_id_idx
  on public.bets (id, group_id);

create index if not exists bets_group_id_created_at_idx
  on public.bets (group_id, created_at desc);

create table if not exists public.bet_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  bet_id uuid not null references public.bets (id) on delete cascade,
  option_text text not null,
  total_points integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint bet_options_total_points_check check (total_points >= 0)
);

create unique index if not exists bet_options_id_bet_id_group_id_idx
  on public.bet_options (id, bet_id, group_id);

create index if not exists bet_options_bet_id_idx
  on public.bet_options (bet_id);

create table if not exists public.wagers (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  bet_id uuid not null,
  bet_option_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint wagers_points_check check (points > 0),
  constraint wagers_bet_fk foreign key (bet_id, group_id)
    references public.bets (id, group_id) on delete cascade,
  constraint wagers_option_fk foreign key (bet_option_id, bet_id, group_id)
    references public.bet_options (id, bet_id, group_id) on delete cascade
);

create unique index if not exists wagers_bet_user_idx
  on public.wagers (bet_id, user_id);

create index if not exists wagers_group_id_created_at_idx
  on public.wagers (group_id, created_at desc);

alter table public.bets
  add constraint bets_winning_option_fk
  foreign key (winning_option_id) references public.bet_options (id) on delete set null;

create or replace function public.create_bet(
  target_group_id uuid,
  bet_title text,
  option_texts text[],
  target_ends_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  normalized_title text;
  normalized_options text[];
  option_text text;
  new_bet_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_group_member(target_group_id) then
    raise exception 'You are not a member of this group';
  end if;

  normalized_title := trim(coalesce(bet_title, ''));

  if normalized_title = '' then
    raise exception 'Bet title is required';
  end if;

  normalized_options := array(
    select distinct cleaned_option
    from (
      select trim(option_value) as cleaned_option
      from unnest(coalesce(option_texts, array[]::text[])) as option_value
    ) options_source
    where cleaned_option <> ''
  );

  if array_length(normalized_options, 1) is null or array_length(normalized_options, 1) < 2 then
    raise exception 'At least two options are required';
  end if;

  if array_length(normalized_options, 1) > 4 then
    raise exception 'A maximum of four options is allowed';
  end if;

  if target_ends_at is not null and target_ends_at <= timezone('utc', now()) then
    raise exception 'Closing time must be in the future';
  end if;

  insert into public.bets (group_id, creator_id, title, ends_at)
  values (target_group_id, current_user_id, normalized_title, target_ends_at)
  returning id into new_bet_id;

  foreach option_text in array normalized_options loop
    insert into public.bet_options (group_id, bet_id, option_text)
    values (target_group_id, new_bet_id, option_text);
  end loop;

  return new_bet_id;
end;
$$;

create or replace function public.place_wager(
  target_bet_id uuid,
  target_option_id uuid,
  wager_points integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_bet public.bets%rowtype;
  target_option public.bet_options%rowtype;
  member_record public.group_members%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if wager_points is null or wager_points <= 0 then
    raise exception 'Wager points must be greater than zero';
  end if;

  select *
  into target_bet
  from public.bets
  where id = target_bet_id
  for update;

  if not found then
    raise exception 'Bet not found';
  end if;

  if not public.is_group_member(target_bet.group_id) then
    raise exception 'You are not a member of this group';
  end if;

  if target_bet.status <> 'open' then
    raise exception 'This bet is not open';
  end if;

  if target_bet.ends_at is not null and target_bet.ends_at <= timezone('utc', now()) then
    raise exception 'This bet is already closed';
  end if;

  if exists (
    select 1
    from public.wagers
    where bet_id = target_bet_id
      and user_id = current_user_id
  ) then
    raise exception 'You have already placed a wager on this bet';
  end if;

  select *
  into target_option
  from public.bet_options
  where id = target_option_id
    and bet_id = target_bet_id
    and group_id = target_bet.group_id
  for update;

  if not found then
    raise exception 'Bet option not found';
  end if;

  select *
  into member_record
  from public.group_members
  where group_id = target_bet.group_id
    and user_id = current_user_id
  for update;

  if not found then
    raise exception 'Group membership not found';
  end if;

  if member_record.points < wager_points then
    raise exception 'Not enough points';
  end if;

  update public.group_members
  set points = points - wager_points
  where id = member_record.id;

  update public.bet_options
  set total_points = total_points + wager_points
  where id = target_option.id;

  insert into public.wagers (group_id, bet_id, bet_option_id, user_id, points)
  values (target_bet.group_id, target_bet_id, target_option_id, current_user_id, wager_points);
end;
$$;

create or replace function public.close_bet(target_bet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_bet public.bets%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_bet
  from public.bets
  where id = target_bet_id
  for update;

  if not found then
    raise exception 'Bet not found';
  end if;

  if target_bet.creator_id <> current_user_id then
    raise exception 'Only the bet creator can close this bet';
  end if;

  if target_bet.status <> 'open' then
    raise exception 'Only open bets can be closed';
  end if;

  update public.bets
  set status = 'closed',
      closed_at = timezone('utc', now())
  where id = target_bet_id;
end;
$$;

create or replace function public.cancel_bet(target_bet_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_bet public.bets%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_bet
  from public.bets
  where id = target_bet_id
  for update;

  if not found then
    raise exception 'Bet not found';
  end if;

  if target_bet.creator_id <> current_user_id then
    raise exception 'Only the bet creator can cancel this bet';
  end if;

  if target_bet.status in ('resolved', 'cancelled') then
    raise exception 'This bet can no longer be cancelled';
  end if;

  update public.group_members members
  set points = members.points + refunds.points_to_refund
  from (
    select user_id, sum(points)::integer as points_to_refund
    from public.wagers
    where bet_id = target_bet_id
    group by user_id
  ) refunds
  where members.group_id = target_bet.group_id
    and members.user_id = refunds.user_id;

  update public.bet_options
  set total_points = 0
  where bet_id = target_bet_id;

  update public.bets
  set status = 'cancelled',
      cancelled_at = timezone('utc', now()),
      closed_at = coalesce(closed_at, timezone('utc', now()))
  where id = target_bet_id;
end;
$$;

create or replace function public.resolve_bet(
  target_bet_id uuid,
  target_option_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_bet public.bets%rowtype;
  winning_option public.bet_options%rowtype;
  total_pool integer;
  winning_pool integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_bet
  from public.bets
  where id = target_bet_id
  for update;

  if not found then
    raise exception 'Bet not found';
  end if;

  if target_bet.creator_id <> current_user_id then
    raise exception 'Only the bet creator can resolve this bet';
  end if;

  if target_bet.status in ('resolved', 'cancelled') then
    raise exception 'This bet can no longer be resolved';
  end if;

  if target_bet.status = 'open'
     and (target_bet.ends_at is null or target_bet.ends_at > timezone('utc', now())) then
    raise exception 'Close the bet first or wait for the closing time';
  end if;

  select *
  into winning_option
  from public.bet_options
  where id = target_option_id
    and bet_id = target_bet_id
    and group_id = target_bet.group_id
  for update;

  if not found then
    raise exception 'Winning option not found';
  end if;

  select coalesce(sum(total_points), 0)::integer
  into total_pool
  from public.bet_options
  where bet_id = target_bet_id;

  winning_pool := winning_option.total_points;

  if winning_pool > 0 then
    update public.group_members members
    set points = members.points + payouts.reward_points
    from (
      select
        user_id,
        floor(sum(points)::numeric * total_pool::numeric / winning_pool::numeric)::integer as reward_points
      from public.wagers
      where bet_id = target_bet_id
        and bet_option_id = target_option_id
      group by user_id
    ) payouts
    where members.group_id = target_bet.group_id
      and members.user_id = payouts.user_id;
  end if;

  update public.bets
  set status = 'resolved',
      winning_option_id = target_option_id,
      resolved_at = timezone('utc', now()),
      closed_at = coalesce(closed_at, timezone('utc', now()))
  where id = target_bet_id;
end;
$$;

alter table public.bets enable row level security;
alter table public.bet_options enable row level security;
alter table public.wagers enable row level security;

create policy "Members can read bets"
on public.bets
for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can read bet options"
on public.bet_options
for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can read wagers"
on public.wagers
for select
to authenticated
using (public.is_group_member(group_id));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bets'
  ) then
    alter publication supabase_realtime add table public.bets;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bet_options'
  ) then
    alter publication supabase_realtime add table public.bet_options;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'wagers'
  ) then
    alter publication supabase_realtime add table public.wagers;
  end if;
end
$$;

alter table public.bets replica identity full;
alter table public.bet_options replica identity full;
alter table public.wagers replica identity full;
