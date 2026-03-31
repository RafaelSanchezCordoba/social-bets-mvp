import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import {
  deleteGroupAction,
  leaveGroupAction,
  removeMemberAction,
} from "@/app/dashboard/actions";
import { BetCard } from "@/components/bets/bet-card";
import { CreateBetForm } from "@/components/bets/create-bet-form";
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
    redirect("/dashboard");
  }

  const bets = await getGroupBets(group.id, user.id);
  const currentUserMember = group.members.find((member) => member.user_id === user.id) ?? null;
  const openBets = bets.filter((bet) => bet.status === "open");
  const finishedBets = bets.filter((bet) => bet.status !== "open");

  const isOwner = group.currentUserRole === "owner";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <GroupsRealtimeListener groupId={group.id} currentUserId={user.id} />
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,239,231,0.94))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-6">
        <div className="bg-panel space-y-6 rounded-[1.5rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]"
              >
                Back to dashboard
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-ink text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {group.name}
                </h1>
                <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                  {group.currentUserRole}
                </span>
              </div>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                This is the future home for all bets inside the group. For now, you can manage access, invite new members, and confirm the group is ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="border-line text-ink flex h-12 items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium"
                >
                  Sign out
                </button>
              </form>

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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Invite code
              </p>
              <p className="text-ink mt-2 text-lg font-semibold tracking-[0.18em]">
                {group.inviteCode}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Members
              </p>
              <p className="text-ink mt-2 text-lg font-semibold">{group.members.length}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                My balance
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                {currentUserMember?.points ?? 0} pts
              </p>
            </article>
          </div>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-line rounded-[1.75rem] border bg-white/80 p-4 sm:p-5">
              <div className="space-y-2">
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                  Create bet
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                  Open a new prediction round
                </h2>
                <p className="text-ink-soft text-sm leading-6">
                  Add two to four options and choose whether the bet closes automatically or only when you close it manually.
                </p>
              </div>

              <div className="mt-5">
                <CreateBetForm groupId={group.id} />
              </div>
            </div>

            <div className="border-line rounded-[1.75rem] border bg-white/80 p-4 sm:p-5">
              <div className="space-y-2">
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                  Betting rules
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                  One wager per user, final once placed
                </h2>
                <p className="text-ink-soft text-sm leading-7">
                  Bets use parimutuel payouts. The creator can close, resolve, or cancel a bet. If a bet is cancelled, all wagered points return to their members.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Roster
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                Everyone inside the group
              </h2>
            </div>

            <div className="grid gap-3">
              {group.members.map((member) => {
                const canRemove =
                  isOwner && member.user_id !== user.id && member.role !== "owner";

                return (
                  <article
                    key={member.user_id}
                    className="border-line flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-ink text-sm font-medium">
                        {member.profile?.username ?? "Unknown user"}
                      </p>
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
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Open bets
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                Live pools and open wagers
              </h2>
            </div>

            {openBets.length > 0 ? (
              <div className="grid gap-4">
                {openBets.map((bet) => (
                  <BetCard key={bet.id} groupId={group.id} bet={bet} currentUserId={user.id} />
                ))}
              </div>
            ) : (
              <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
                There are no open bets in this group yet.
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Finished bets
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
                Closed, resolved, and cancelled
              </h2>
            </div>

            {finishedBets.length > 0 ? (
              <div className="grid gap-4">
                {finishedBets.map((bet) => (
                  <BetCard key={bet.id} groupId={group.id} bet={bet} currentUserId={user.id} />
                ))}
              </div>
            ) : (
              <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
                Resolved and cancelled bets will show up here.
              </div>
            )}
          </section>

          <div className="border-line rounded-2xl border bg-white/80 p-4 text-sm leading-7 text-ink-soft">
            Apply `supabase/migrations/20260331170000_create_bets_and_wagers.sql` in Supabase before testing the betting flow in this group.
          </div>
        </div>
      </section>
    </main>
  );
}
