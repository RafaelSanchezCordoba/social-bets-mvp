export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid flex-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-ink-muted shadow-sm backdrop-blur">
            <span className="bg-accent h-2 w-2 rounded-full" />
            Baseline del MVP
          </div>

          <div className="space-y-5">
            <p className="text-ink-muted font-mono text-sm uppercase tracking-[0.3em]">
              Social Bets
            </p>
            <h1 className="text-ink max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Apuestas privadas entre amigos con puntos, grupos y resultados en tiempo real.
            </h1>
            <p className="text-ink-soft max-w-2xl text-lg leading-8 sm:text-xl">
              Esta base deja el proyecto listo para construir el flujo MVP sobre Next.js y Supabase sin arrastrar el template inicial.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="border-line rounded-2xl border bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Motor
              </p>
              <p className="text-ink mt-2 text-base font-medium">
                Sistema parimutuel, sin dinero real
              </p>
            </div>
            <div className="border-line rounded-2xl border bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Stack
              </p>
              <p className="text-ink mt-2 text-base font-medium">
                Next.js, Supabase, Tailwind CSS
              </p>
            </div>
          </div>
        </div>

        <div className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,239,231,0.94))] p-6 shadow-[0_24px_80px_rgba(65,45,24,0.12)]">
          <div className="bg-panel space-y-4 rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                  Grupo demo
                </p>
                <h2 className="text-ink mt-2 text-2xl font-semibold">
                  La Liga del Domingo
                </h2>
              </div>
              <div className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]">
                Open
              </div>
            </div>

            <div className="border-line rounded-2xl border bg-white px-4 py-4">
              <p className="text-ink-soft text-sm">Apuesta activa</p>
              <p className="text-ink mt-1 text-xl font-medium">
                Quien gana el clasico del sabado?
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Equipo A", points: 420, share: "42%", odds: "2.38x" },
                  { label: "Empate", points: 180, share: "18%", odds: "5.56x" },
                  { label: "Equipo B", points: 400, share: "40%", odds: "2.50x" },
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
                          {option.points} pts · {option.share} del pool
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
                ["Pool total", "1000 pts"],
                ["Mi saldo", "860 pts"],
                ["Realtime", "Activo"],
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
            Scope MVP
          </p>
          <p className="mt-3 leading-7">
            Auth, grupos privados, creacion de apuestas, wagers atomicos y resolucion con payouts.
          </p>
        </article>
        <article className="border-line rounded-2xl border bg-white/70 p-5 backdrop-blur">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            Backend
          </p>
          <p className="mt-3 leading-7">
            Supabase manejara auth, Postgres, realtime y RPC para place wager y resolve bet.
          </p>
        </article>
        <article className="border-line rounded-2xl border bg-white/70 p-5 backdrop-blur">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            Workflow
          </p>
          <p className="mt-3 leading-7">
            `main` queda como baseline estable; el desarrollo del producto continuara desde `dev` y ramas `feature/*`.
          </p>
        </article>
      </section>
    </main>
  );
}
