import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { count: groupsCount }, { count: wagersCount }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("wagers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <main className="space-y-5">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Home</p>
            <div className="space-y-2">
              <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Welcome back, {profile?.username ?? "player"}
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                This is your quick app overview. Jump into groups, open a new circle, or wait for the leaderboard to start heating up.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Groups joined</p>
              <p className="text-ink mt-2 text-lg font-semibold">{groupsCount ?? 0}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Wagers placed</p>
              <p className="text-ink mt-2 text-lg font-semibold">{wagersCount ?? 0}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Status</p>
              <p className="text-ink mt-2 text-sm leading-6">Mobile shell live and ready</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Groups</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">See every circle you belong to</h2>
            <p className="text-ink-soft text-sm leading-6">
              Browse your active groups, check membership, and jump directly into the latest betting activity.
            </p>
          </div>
          <Link
            href="/groups"
            className="border-line text-ink mt-5 flex h-12 items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium"
          >
            Open groups
          </Link>
        </article>

        <article className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Create or join</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Start the next betting circle</h2>
            <p className="text-ink-soft text-sm leading-6">
              Open a fresh group or jump into an existing one using a simple invite code.
            </p>
          </div>
          <Link
            href="/groups/discover"
            className="bg-accent text-background mt-5 flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)]"
          >
            Create or join
          </Link>
        </article>
      </section>
    </main>
  );
}
