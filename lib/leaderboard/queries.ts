import "server-only";

import { getUserGroups } from "@/lib/groups/queries";

export type GroupLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  role: "owner" | "member";
  points: number;
};

export async function getLeaderboardGroups(userId: string) {
  return getUserGroups(userId);
}

export async function getGroupLeaderboard(userId: string, selectedGroupId?: string | null) {
  const groups = await getUserGroups(userId);

  if (groups.length === 0) {
    return {
      groups,
      selectedGroup: null,
      entries: [] as GroupLeaderboardEntry[],
    };
  }

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? groups[0];

  const entries = [...selectedGroup.members]
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      return left.profile?.username.localeCompare(right.profile?.username ?? "") ?? 0;
    })
    .map((member, index) => ({
      rank: index + 1,
      userId: member.user_id,
      username: member.profile?.username ?? "Unknown user",
      role: member.role,
      points: member.points,
    }));

  return {
    groups,
    selectedGroup,
    entries,
  };
}
