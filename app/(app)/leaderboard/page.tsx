import Link from "next/link";

import { GroupStandings } from "@/components/leaderboard/group-standings";
import { GroupsRealtimeListener } from "@/components/realtime/groups-realtime-listener";
import { getGroupLeaderboard } from "@/lib/leaderboard/queries";
import { createClient } from "@/lib/supabase/server";

type LeaderboardPageProps = {
  searchParams: Promise<{
    group?: string;
  }>;
};

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const { group: selectedGroupId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { groups, selectedGroup, entries } = await getGroupLeaderboard(user.id, selectedGroupId);
  const canManageMembers = selectedGroup?.currentUserRole === "owner";

  return (
    <main className="space-y-5">
      <GroupsRealtimeListener currentUserId={user.id} groupId={selectedGroup?.id} />

      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Leaderboard</p>
            <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Group rankings by live points
            </h1>
            <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
              Pick one of your groups and see who is stacking the most points right now.
            </p>
          </div>

          {groups.length > 0 ? (
            <div className="space-y-5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {groups.map((group) => {
                  const isActive = group.id === selectedGroup?.id;

                  return (
                    <Link
                      key={group.id}
                      href={`/leaderboard?group=${group.id}`}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-[rgba(199,106,42,0.24)] bg-[rgba(199,106,42,0.14)] text-accent-strong"
                          : "border-[rgba(92,73,48,0.14)] bg-white text-ink-soft"
                      }`}
                    >
                      {group.name}
                    </Link>
                  );
                })}
              </div>

              {selectedGroup ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <article className="border-line rounded-2xl border bg-white p-4">
                      <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Selected group</p>
                      <p className="text-ink mt-2 text-base font-semibold">{selectedGroup.name}</p>
                    </article>
                    <article className="border-line rounded-2xl border bg-white p-4">
                      <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Players</p>
                      <p className="text-ink mt-2 text-base font-semibold">{entries.length}</p>
                    </article>
                    <article className="border-line rounded-2xl border bg-white p-4">
                      <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Current leader</p>
                      <p className="text-ink mt-2 text-base font-semibold">{entries[0]?.username ?? "No players yet"}</p>
                    </article>
                  </div>

                  <GroupStandings
                    groupId={selectedGroup.id}
                    currentUserId={user.id}
                    canManageMembers={canManageMembers}
                    entries={entries}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="border-line rounded-[1.75rem] border bg-white/72 p-5 text-sm leading-7 text-ink-soft">
              <p>You are not in any groups yet.</p>
              <Link href="/groups/discover" className="text-accent-strong mt-3 inline-flex font-medium">
                Create one or join with a code
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
