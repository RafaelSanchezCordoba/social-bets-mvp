import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import { deleteGroupAction, removeMemberAction } from "@/app/dashboard/actions";
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
    notFound();
  }

  const isOwner = group.currentUserRole === "owner";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
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
              ) : null}
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
                Status
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                Group space ready for upcoming bets
              </p>
            </article>
          </div>

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

          <div className="border-line rounded-2xl border bg-white/80 p-4 text-sm leading-7 text-ink-soft">
            Bets, options, and live pool updates will be added here next, so each group gets its own dedicated betting hub.
          </div>
        </div>
      </section>
    </main>
  );
}
