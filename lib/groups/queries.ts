import "server-only";

import { createClient } from "@/lib/supabase/server";

export type GroupSummary = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  currentUserRole: "owner" | "member";
  members: Array<{
    user_id: string;
    role: "owner" | "member";
    points: number;
    profile: { username: string } | null;
  }>;
};

export async function getUserGroups(userId: string): Promise<GroupSummary[]> {
  const supabase = await createClient();

  const { data: groupMemberships, error: membershipsError } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    throw new Error(`Failed to load group memberships: ${membershipsError.message}`);
  }

  const groupIds = groupMemberships?.map((membership) => membership.group_id) ?? [];

  let groupsData: Array<{
    id: string;
    name: string;
    invite_code: string;
    created_at: string;
    group_members: Array<{
      user_id: string;
      role: "owner" | "member";
      points: number;
      profile: { username: string } | Array<{ username: string }> | null;
    }> | null;
  }> = [];

  if (groupIds.length > 0) {
    const { data, error: groupsError } = await supabase
      .from("groups")
      .select(
        `
          id,
          name,
          invite_code,
          created_at,
          group_members (
            user_id,
            role,
            points,
            profile:profiles (
              username
            )
          )
        `,
      )
      .in("id", groupIds)
      .order("created_at", { ascending: true });

    if (groupsError) {
      throw new Error(`Failed to load groups: ${groupsError.message}`);
    }

    groupsData = (data as typeof groupsData) ?? [];
  }

  const membershipRoleByGroupId = new Map(
    (groupMemberships ?? []).map((membership) => [membership.group_id, membership.role]),
  );

  return groupsData.flatMap((group) => {
    const currentUserRole = membershipRoleByGroupId.get(group.id);

    if (!currentUserRole) {
      return [];
    }

    return [
      {
        id: group.id,
        name: group.name,
        inviteCode: group.invite_code,
        createdAt: group.created_at,
        currentUserRole,
        members:
          group.group_members?.map((member) => ({
            user_id: member.user_id,
            role: member.role,
            points: member.points,
            profile: Array.isArray(member.profile) ? member.profile[0] ?? null : member.profile,
          })) ?? [],
      },
    ];
  });
}

export async function getGroupForUser(groupId: string, userId: string) {
  const groups = await getUserGroups(userId);
  return groups.find((group) => group.id === groupId) ?? null;
}
