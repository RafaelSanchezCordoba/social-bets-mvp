import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import { CreateGroupForm } from "@/components/groups/create-group-form";
import { GroupCard } from "@/components/groups/group-card";
import { JoinGroupForm } from "@/components/groups/join-group-form";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: groupMemberships } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

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
    const { data } = await supabase
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

    groupsData = (data as typeof groupsData) ?? [];
  }

  const membershipRoleByGroupId = new Map(
    (groupMemberships ?? []).map((membership) => [membership.group_id, membership.role]),
  );

  const groups =
    groupsData?.flatMap((group) => {
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
    }) ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,239,231,0.94))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-6">
        <div className="bg-panel space-y-6 rounded-[1.5rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                Dashboard
              </p>
              <h1 className="text-ink text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Your groups start here
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                Create a private group, join with an invite code, and manage the people inside it from the same mobile-first dashboard.
              </p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="border-line text-ink flex h-12 items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Account email
              </p>
              <p className="text-ink mt-2 break-all text-sm leading-6">
                {user.email}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Username
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                {profile?.username ?? "Apply the profiles migration in Supabase first"}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Groups
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                {error ? "The profiles table is still missing in Supabase" : `${groups.length} joined`}
              </p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="border-line rounded-[1.75rem] border bg-white/80 p-4 sm:p-5">
              <div className="space-y-2">
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                  Create group
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                  Start a new private circle
                </h2>
                <p className="text-ink-soft text-sm leading-6">
                  Group names are unique across the app, and the creator becomes the owner automatically.
                </p>
              </div>

              <div className="mt-5">
                <CreateGroupForm />
              </div>
            </section>

            <section className="border-line rounded-[1.75rem] border bg-white/80 p-4 sm:p-5">
              <div className="space-y-2">
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                  Join group
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                  Enter with an invite code
                </h2>
                <p className="text-ink-soft text-sm leading-6">
                  Owners can remove members when needed, and removed members can still join again later with the code.
                </p>
              </div>

              <div className="mt-5">
                <JoinGroupForm />
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Your groups
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                Manage who is in and who is out
              </h2>
            </div>

            {groups.length > 0 ? (
              <div className="grid gap-4">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    inviteCode={group.inviteCode}
                    createdAt={group.createdAt}
                    currentUserId={user.id}
                    currentUserRole={group.currentUserRole}
                    members={group.members}
                  />
                ))}
              </div>
            ) : (
              <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
                You are not in any groups yet. Create one or join with an invite code to get started.
              </div>
            )}
          </section>

          <div className="border-line rounded-2xl border bg-white/80 p-4 text-sm leading-7 text-ink-soft">
            <p>
              Before using this screen, apply `supabase/migrations/20260331133000_create_groups.sql` in Supabase so group creation, membership roles, and owner permissions are available.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
