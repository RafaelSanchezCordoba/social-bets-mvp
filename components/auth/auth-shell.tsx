import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerCta: string;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footerLabel,
  footerHref,
  footerCta,
  children,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6 rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_50px_rgba(65,45,24,0.08)] backdrop-blur sm:p-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-ink-muted shadow-sm">
            <span className="bg-accent h-2 w-2 rounded-full" />
            {eyebrow}
          </div>

          <div className="space-y-4">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.28em]">
              Social Bets
            </p>
            <h1 className="text-ink max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {title}
            </h1>
            <p className="text-ink-soft max-w-xl text-base leading-7 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Private", "Invite-only groups for friends"],
              ["Fast", "Email, username, and direct access"],
              ["Mobile", "Designed for smooth phone use"],
            ].map(([label, value]) => (
              <article
                key={label}
                className="border-line rounded-2xl border bg-[rgba(255,255,255,0.72)] p-4"
              >
                <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.18em]">
                  {label}
                </p>
                <p className="text-ink mt-2 text-sm leading-6">{value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,239,231,0.94))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-6">
          <div className="bg-panel rounded-[1.5rem] p-5 sm:p-6">{children}</div>
          <div className="mt-4 text-center text-sm text-ink-soft">
            {footerLabel}{" "}
            <Link href={footerHref} className="text-accent-strong font-medium">
              {footerCta}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
