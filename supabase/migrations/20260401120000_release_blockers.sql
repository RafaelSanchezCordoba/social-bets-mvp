create or replace function public.has_pending_group_wagers(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.wagers wagers
    join public.bets bets on bets.id = wagers.bet_id
    where wagers.group_id = target_group_id
      and wagers.user_id = target_user_id
      and bets.status in ('open', 'closed')
  );
$$;

create or replace function public.group_has_unsettled_bets(target_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.bets
    where group_id = target_group_id
      and status in ('open', 'closed')
  );
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
  distributed_points integer;
  remainder_points integer;
  remainder_user_id uuid;
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
    with winner_totals as (
      select
        wagers.user_id,
        sum(wagers.points)::integer as wager_points,
        min(wagers.created_at) as first_wager_at,
        floor(sum(wagers.points)::numeric * total_pool::numeric / winning_pool::numeric)::integer as reward_points
      from public.wagers wagers
      where wagers.bet_id = target_bet_id
        and wagers.bet_option_id = target_option_id
      group by wagers.user_id
    )
    update public.group_members members
    set points = members.points + winner_totals.reward_points
    from winner_totals
    where members.group_id = target_bet.group_id
      and members.user_id = winner_totals.user_id;

    select coalesce(sum(floor(sum_points::numeric * total_pool::numeric / winning_pool::numeric)), 0)::integer
    into distributed_points
    from (
      select sum(wagers.points)::integer as sum_points
      from public.wagers wagers
      where wagers.bet_id = target_bet_id
        and wagers.bet_option_id = target_option_id
      group by wagers.user_id
    ) base_payouts;

    remainder_points := total_pool - distributed_points;

    if remainder_points > 0 then
      select winner.user_id
      into remainder_user_id
      from (
        select
          wagers.user_id,
          sum(wagers.points)::integer as wager_points,
          min(wagers.created_at) as first_wager_at
        from public.wagers wagers
        where wagers.bet_id = target_bet_id
          and wagers.bet_option_id = target_option_id
        group by wagers.user_id
      ) winner
      order by winner.wager_points desc, winner.first_wager_at asc, winner.user_id asc
      limit 1;

      if remainder_user_id is not null then
        update public.group_members
        set points = points + remainder_points
        where group_id = target_bet.group_id
          and user_id = remainder_user_id;
      end if;
    end if;
  end if;

  update public.bets
  set status = 'resolved',
      winning_option_id = target_option_id,
      resolved_at = timezone('utc', now()),
      closed_at = coalesce(closed_at, timezone('utc', now()))
  where id = target_bet_id;
end;
$$;
