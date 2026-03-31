import { CreateGroupForm } from "@/components/groups/create-group-form";
import { GroupCard } from "@/components/groups/group-card";
import { JoinGroupForm } from "@/components/groups/join-group-form";
import { GroupsRealtimeListener } from "@/components/realtime/groups-realtime-listener";
import { getUserGroups } from "@/lib/groups/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

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
                Welcome back, {profile?.username ?? "player"}
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                Jump between your private circles, create a fresh group, or join one with an invite code.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Groups</p>
              <p className="text-ink mt-2 text-lg font-semibold">{groups.length}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Identity</p>
              <p className="text-ink mt-2 text-sm leading-6">
                {profile?.username ?? "Apply the profiles migration in Supabase first"}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Status</p>
              <p className="text-ink mt-2 text-sm leading-6">
                {error ? "Profile data missing" : "All synced and ready"}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Create group</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Start a new circle</h2>
            <p className="text-ink-soft text-sm leading-6">
              Group names stay unique across the app and the creator becomes owner automatically.
            </p>
          </div>
          <div className="mt-5">
            <CreateGroupForm />
          </div>
        </article>

        <article className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Join group</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Use an invite code</h2>
            <p className="text-ink-soft text-sm leading-6">
              Enter any active code to join instantly. Removed members can still come back later with the same invite.
            </p>
          </div>
          <div className="mt-5">
            <JoinGroupForm />
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Your circles</p>
          <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Groups you can jump into right now</h2>
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
          <div className="border-line rounded-[1.75rem] border bg-white/72 p-5 text-sm leading-7 text-ink-soft">
            You are not in any groups yet. Create one or join with an invite code to get started.
          </div>
        )}
      </section>
    </main>
  );
}
