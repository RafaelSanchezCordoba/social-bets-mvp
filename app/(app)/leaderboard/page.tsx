export default function LeaderboardPage() {
  return (
    <main className="space-y-5">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Leaderboard</p>
            <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Rankings are coming next
            </h1>
            <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
              This screen will show the strongest players across your groups, streaks, and point momentum once the first layer of bets has settled.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Top players", "Global and per-group standings"],
              ["Momentum", "Recent wins and hot streaks"],
              ["Balance", "Who is building the biggest stack"],
            ].map(([label, value]) => (
              <article key={label} className="border-line rounded-2xl border bg-white p-4">
                <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">{label}</p>
                <p className="text-ink mt-3 text-sm leading-6">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
