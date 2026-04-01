import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteGroupAction, leaveGroupAction } from "@/app/dashboard/actions";
import { CreateBetPanel } from "@/components/bets/create-bet-panel";
import { CopyInviteButton } from "@/components/groups/copy-invite-button";
import { GroupBetsPanel } from "@/components/bets/group-bets-panel";
import { GroupStandings } from "@/components/leaderboard/group-standings";
import { GroupsRealtimeListener } from "@/components/realtime/groups-realtime-listener";
import { getGroupBets } from "@/lib/bets/queries";
import { getGroupForUser } from "@/lib/groups/queries";
import { getGroupLeaderboard } from "@/lib/leaderboard/queries";
import { createClient } from "@/lib/supabase/server";

type GroupPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams: Promise<{
    actionError?: string;
  }>;
};

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const { groupId } = await params;
  const { actionError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const group = await getGroupForUser(groupId, user.id);

  if (!group) {
    redirect("/groups");
  }

  const bets = await getGroupBets(group.id, user.id);
  const { entries } = await getGroupLeaderboard(user.id, group.id);
  const currentUserMember = group.members.find((member) => member.user_id === user.id) ?? null;
  const openBets = bets.filter((bet) => bet.status === "open");
  const closedBets = bets.filter((bet) => bet.status === "closed");
  const historyBets = bets.filter((bet) => ["resolved", "cancelled"].includes(bet.status));
  const isOwner = group.currentUserRole === "owner";

  return (
    <main className="space-y-5">
      <GroupsRealtimeListener groupId={group.id} currentUserId={user.id} />

      {actionError ? (
        <div className="rounded-[1.5rem] border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.9)] px-4 py-3 text-sm leading-6 text-[rgb(140,52,29)] shadow-sm">
          {actionError}
        </div>
      ) : null}

      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Link href="/groups" className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                Back to groups
              </Link>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  {group.name}
                </h1>
                <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                  {group.currentUserRole}
                </span>
                {isOwner ? (
                  <form action={deleteGroupAction} className="sm:ml-2">
                    <input type="hidden" name="groupId" value={group.id} />
                    <button
                      type="submit"
                      className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-2 text-sm font-medium text-[rgb(140,52,29)]"
                    >
                      Delete group
                    </button>
                  </form>
                ) : (
                  <form action={leaveGroupAction} className="sm:ml-2">
                    <input type="hidden" name="groupId" value={group.id} />
                    <button
                      type="submit"
                      className="border-line text-ink flex h-10 items-center justify-center rounded-2xl border bg-white px-4 text-sm font-medium"
                    >
                      Leave group
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Invite code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-ink text-lg font-semibold tracking-[0.18em]">{group.inviteCode}</p>
                <CopyInviteButton inviteCode={group.inviteCode} />
              </div>
            </article>
            <details className="border-line rounded-2xl border bg-white p-4 sm:col-span-1">
              <summary className="list-none cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Members & standings</p>
                    <p className="text-ink mt-2 text-lg font-semibold">{group.members.length}</p>
                  </div>
                  <span className="text-accent-strong text-sm font-medium">Open</span>
                </div>
              </summary>

              <div className="mt-4 grid gap-3 border-t border-[rgba(92,73,48,0.12)] pt-4">
                <GroupStandings
                  groupId={group.id}
                  currentUserId={user.id}
                  canManageMembers={isOwner}
                  entries={entries}
                />
                <Link
                  href={`/leaderboard?group=${group.id}`}
                  className="text-accent-strong inline-flex text-sm font-medium"
                >
                  Open full leaderboard page
                </Link>
              </div>
            </details>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">My balance</p>
              <p className="text-ink mt-2 text-lg font-semibold">{currentUserMember?.points ?? 0} pts</p>
            </article>
          </div>
        </div>
      </section>

      <section>
        <CreateBetPanel groupId={group.id} />
      </section>

      <GroupBetsPanel
        groupId={group.id}
        currentUserId={user.id}
        openBets={openBets}
        closedBets={closedBets}
        historyBets={historyBets}
      />
    </main>
  );
}
