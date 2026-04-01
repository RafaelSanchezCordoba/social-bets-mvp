import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid flex-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-ink-muted shadow-sm backdrop-blur">
            <span className="bg-accent h-2 w-2 rounded-full" />
            Welcome to Social Bets
          </div>

          <div className="space-y-5">
            <p className="text-ink-muted font-mono text-sm uppercase tracking-[0.3em]">
              Social Bets
            </p>
            <h1 className="text-ink max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Build private prediction circles with friends and keep every point moving live.
            </h1>
            <p className="text-ink-soft max-w-2xl text-lg leading-8 sm:text-xl">
              Create invite-only groups, open quick bets, wager virtual points, and follow the pool in real time from a mobile-first app shell.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="bg-accent text-background flex h-13 items-center justify-center rounded-2xl px-5 text-base font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)] transition hover:translate-y-[-1px]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="border-line text-ink flex h-13 items-center justify-center rounded-2xl border bg-white/85 px-5 text-base font-medium shadow-sm backdrop-blur"
            >
              Sign in
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-line rounded-2xl border bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Private groups
              </p>
              <p className="text-ink mt-2 text-base font-medium">
                Invite-only circles for your own people
              </p>
            </div>
            <div className="border-line rounded-2xl border bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Point-based
              </p>
              <p className="text-ink mt-2 text-base font-medium">
                No real money, only virtual balances
              </p>
            </div>
            <div className="border-line rounded-2xl border bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Live sync
              </p>
              <p className="text-ink mt-2 text-base font-medium">
                Pools, members, and outcomes update fast
              </p>
            </div>
          </div>
        </div>

        <div className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,239,231,0.94))] p-6 shadow-[0_24px_80px_rgba(65,45,24,0.12)]">
          <div className="bg-panel space-y-4 rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                  Demo group
                </p>
                <h2 className="text-ink mt-2 text-2xl font-semibold">
                  Sunday League Crew
                </h2>
              </div>
              <div className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]">
                Open
              </div>
            </div>

            <div className="border-line rounded-2xl border bg-white px-4 py-4">
              <p className="text-ink-soft text-sm">What it feels like inside</p>
              <p className="text-ink mt-1 text-xl font-medium">
                Who wins Saturday&apos;s derby?
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Team A", points: 420, share: "42%", odds: "2.38x" },
                  { label: "Draw", points: 180, share: "18%", odds: "5.56x" },
                  { label: "Team B", points: 400, share: "40%", odds: "2.50x" },
                ].map((option) => (
                  <div
                    key={option.label}
                    className="border-line bg-surface rounded-2xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-ink text-base font-medium">
                          {option.label}
                        </p>
                        <p className="text-ink-muted mt-1 font-mono text-xs uppercase tracking-[0.18em]">
                          {option.points} pts · {option.share} of the pool
                        </p>
                      </div>
                      <p className="text-accent-strong text-lg font-semibold">
                        {option.odds}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Total pool", "1000 pts"],
                ["My balance", "860 pts"],
                ["Realtime", "Active"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-line rounded-2xl border bg-white px-4 py-3"
                >
                  <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                    {label}
                  </p>
                  <p className="text-ink mt-2 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-line text-ink-soft grid gap-4 border-t pt-8 text-sm md:grid-cols-3">
        <article className="border-line rounded-2xl border bg-white/70 p-5 backdrop-blur">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            1. Create or join
          </p>
          <p className="mt-3 leading-7">
            Start a new group or enter with a friend&apos;s invite code.
          </p>
        </article>
        <article className="border-line rounded-2xl border bg-white/70 p-5 backdrop-blur">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            2. Bet with points
          </p>
          <p className="mt-3 leading-7">
            Pick one outcome, lock your wager, and watch the pool shift live.
          </p>
        </article>
        <article className="border-line rounded-2xl border bg-white/70 p-5 backdrop-blur">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            3. Resolve together
          </p>
          <p className="mt-3 leading-7">
            Close, resolve, or cancel bets and keep the group synced in real time.
          </p>
        </article>
      </section>
    </main>
  );
}
