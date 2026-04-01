import Link from "next/link";
import { redirect } from "next/navigation";

import {
  deleteGroupAction,
  leaveGroupAction,
  removeMemberAction,
} from "@/app/dashboard/actions";
import { CreateBetForm } from "@/components/bets/create-bet-form";
import { GroupBetsPanel } from "@/components/bets/group-bets-panel";
import { GroupsRealtimeListener } from "@/components/realtime/groups-realtime-listener";
import { getGroupBets } from "@/lib/bets/queries";
import { getGroupForUser } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";

type GroupPageProps = {
  params: Promise<{
    groupId: string;
  }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
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
  const currentUserMember = group.members.find((member) => member.user_id === user.id) ?? null;
  const openBets = bets.filter((bet) => bet.status === "open");
  const closedBets = bets.filter((bet) => bet.status === "closed");
  const historyBets = bets.filter((bet) => ["resolved", "cancelled"].includes(bet.status));
  const isOwner = group.currentUserRole === "owner";

  return (
    <main className="space-y-5">
      <GroupsRealtimeListener groupId={group.id} currentUserId={user.id} />

      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Link href="/groups" className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                Back to groups
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                  {group.name}
                </h1>
                <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                  {group.currentUserRole}
                </span>
              </div>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                Run private predictions, manage members, and keep the whole pool synced live like a proper mobile-first app.
              </p>
            </div>

            {isOwner ? (
              <form action={deleteGroupAction}>
                <input type="hidden" name="groupId" value={group.id} />
                <button
                  type="submit"
                  className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-3 text-sm font-medium text-[rgb(140,52,29)]"
                >
                  Delete group
                </button>
              </form>
            ) : (
              <form action={leaveGroupAction}>
                <input type="hidden" name="groupId" value={group.id} />
                <button
                  type="submit"
                  className="border-line text-ink flex h-12 items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium"
                >
                  Leave group
                </button>
              </form>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Invite code</p>
              <p className="text-ink mt-2 text-lg font-semibold tracking-[0.18em]">{group.inviteCode}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Members</p>
              <p className="text-ink mt-2 text-lg font-semibold">{group.members.length}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">My balance</p>
              <p className="text-ink mt-2 text-lg font-semibold">{currentUserMember?.points ?? 0} pts</p>
            </article>
            <Link
              href={`/leaderboard?group=${group.id}`}
              className="border-line text-ink flex items-center justify-between rounded-2xl border bg-white p-4 sm:col-span-3"
            >
              <div>
                <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Leaderboard</p>
                <p className="text-ink mt-2 text-base font-semibold">View this group ranking</p>
              </div>
              <span className="text-accent-strong text-sm font-medium">Open</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Create bet</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Open a new prediction round</h2>
            <p className="text-ink-soft text-sm leading-6">
              Add two to four options and decide whether the bet closes automatically or only when you close it yourself.
            </p>
          </div>
          <div className="mt-5">
            <CreateBetForm groupId={group.id} />
          </div>
        </div>

        <div className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Roster</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Everyone inside the group</h2>
            <p className="text-ink-soft text-sm leading-6">
              Owners can remove members, and members can always rejoin later with the same invite code.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {group.members.map((member) => {
              const canRemove = isOwner && member.user_id !== user.id && member.role !== "owner";

              return (
                <article
                  key={member.user_id}
                  className="border-line flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-ink text-sm font-medium">{member.profile?.username ?? "Unknown user"}</p>
                    <p className="text-ink-muted mt-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                      {member.points} pts · {member.role}
                    </p>
                  </div>

                  {canRemove ? (
                    <form action={removeMemberAction}>
                      <input type="hidden" name="groupId" value={group.id} />
                      <input type="hidden" name="memberUserId" value={member.user_id} />
                      <button
                        type="submit"
                        className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-2 text-sm font-medium text-[rgb(140,52,29)]"
                      >
                        Remove
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
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
