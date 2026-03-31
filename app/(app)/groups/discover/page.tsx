import Link from "next/link";

import { CreateGroupForm } from "@/components/groups/create-group-form";
import { JoinGroupForm } from "@/components/groups/join-group-form";

export default function DiscoverGroupsPage() {
  return (
    <main className="space-y-5">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <Link href="/groups" className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
              Back to groups
            </Link>
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Create or join</p>
              <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Start a new circle or jump into one instantly
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                Build a private group for your friends or join one with a code. Either way, you land right where the action starts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border-line rounded-[1.75rem] border bg-white/84 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Create group</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">Open a fresh space</h2>
            <p className="text-ink-soft text-sm leading-6">
              Choose a unique name, become the owner automatically, and invite everyone else in with one code.
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
              Enter an active code to join right away. If you ever get removed, the owner can still let you back in later.
            </p>
          </div>
          <div className="mt-5">
            <JoinGroupForm />
          </div>
        </article>
      </section>
    </main>
  );
}
