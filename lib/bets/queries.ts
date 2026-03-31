import "server-only";

import { createClient } from "@/lib/supabase/server";

export type BetSummary = {
  id: string;
  title: string;
  status: "open" | "closed" | "resolved" | "cancelled";
  endsAt: string | null;
  createdAt: string;
  creatorId: string;
  winningOptionId: string | null;
  isExpired: boolean;
  options: Array<{
    id: string;
    optionText: string;
    totalPoints: number;
  }>;
  totalPool: number;
  myWager: {
    optionId: string;
    points: number;
  } | null;
};

export async function getGroupBets(groupId: string, userId: string): Promise<BetSummary[]> {
  const supabase = await createClient();
  const now = Date.now();

  const { data: betsData, error: betsError } = await supabase
    .from("bets")
    .select("id, title, status, ends_at, created_at, creator_id, winning_option_id")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (betsError) {
    throw new Error(`Failed to load bets: ${betsError.message}`);
  }

  const betIds = betsData?.map((bet) => bet.id) ?? [];

  const { data: optionsData, error: optionsError } = betIds.length
    ? await supabase
        .from("bet_options")
        .select("id, bet_id, option_text, total_points")
        .in("bet_id", betIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (optionsError) {
    throw new Error(`Failed to load bet options: ${optionsError.message}`);
  }

  const { data: wagersData, error: wagersError } = betIds.length
    ? await supabase
        .from("wagers")
        .select("bet_id, bet_option_id, points")
        .eq("user_id", userId)
        .in("bet_id", betIds)
    : { data: [], error: null };

  if (wagersError) {
    throw new Error(`Failed to load wagers: ${wagersError.message}`);
  }

  const wagerByBetId = new Map(
    (wagersData ?? []).map((wager) => [
      wager.bet_id,
      {
        optionId: wager.bet_option_id,
        points: wager.points,
      },
    ]),
  );

  const optionsByBetId = new Map<string, Array<(typeof optionsData)[number]>>();

  for (const option of optionsData ?? []) {
    const existingOptions = optionsByBetId.get(option.bet_id) ?? [];
    existingOptions.push(option);
    optionsByBetId.set(option.bet_id, existingOptions);
  }

  return (betsData ?? []).map((bet) => {
    const options =
      (optionsByBetId.get(bet.id) ?? []).map((option) => ({
        id: option.id,
        optionText: option.option_text,
        totalPoints: option.total_points,
      })) ?? [];

    return {
      id: bet.id,
      title: bet.title,
      status: bet.status,
      endsAt: bet.ends_at,
      createdAt: bet.created_at,
      creatorId: bet.creator_id,
      winningOptionId: bet.winning_option_id,
      isExpired: bet.ends_at ? new Date(bet.ends_at).getTime() <= now : false,
      options,
      totalPool: options.reduce((sum, option) => sum + option.totalPoints, 0),
      myWager: wagerByBetId.get(bet.id) ?? null,
    };
  });
}
