import Link from "next/link";

import { GroupCard } from "@/components/groups/group-card";
import { GroupsRealtimeListener } from "@/components/realtime/groups-realtime-listener";
import { getUserGroups } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const groups = await getUserGroups(user.id);

  return (
    <main className="space-y-5">
      <GroupsRealtimeListener currentUserId={user.id} />

      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Groups</p>
            <div className="space-y-2">
              <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Your circles
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                Keep every group you belong to in one place, then jump into the one that matters right now.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[1.75rem] border border-[rgba(92,73,48,0.12)] bg-white/82 p-4 shadow-sm backdrop-blur">
            <div>
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Quick action</p>
              <p className="text-ink mt-2 text-base font-medium">Create a new group or join one with a code</p>
            </div>
            <Link
              href="/groups/discover"
              className="bg-accent text-background flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)]"
            >
              Create or join
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {groups.length > 0 ? (
          <div className="grid gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                inviteCode={group.inviteCode}
                createdAt={group.createdAt}
                currentUserRole={group.currentUserRole}
                members={group.members}
              />
            ))}
          </div>
        ) : (
          <div className="border-line rounded-[1.75rem] border bg-white/72 p-5 text-sm leading-7 text-ink-soft">
            <p>You are not in any groups yet.</p>
            <Link href="/groups/discover" className="text-accent-strong mt-3 inline-flex font-medium">
              Create one or join with a code
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
