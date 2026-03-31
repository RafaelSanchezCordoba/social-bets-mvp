import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,239,231,0.94))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-6">
        <div className="bg-panel space-y-6 rounded-[1.5rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
                Private area
              </p>
              <h1 className="text-ink text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Your access is working
              </h1>
              <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
                This screen confirms your session is active and protected routes are already working for the MVP.
              </p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="border-line text-ink flex h-12 items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Auth email
              </p>
              <p className="text-ink mt-2 break-all text-sm leading-6">
                {user.email}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                App username
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                {profile?.username ?? "Apply the profiles migration in Supabase first"}
              </p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
                Status
              </p>
              <p className="text-ink mt-2 text-sm leading-6">
                {error ? "The profiles table is still missing in Supabase" : "Session and profile are ready"}
              </p>
            </article>
          </div>

          <div className="border-line rounded-2xl border bg-white/80 p-4 text-sm leading-7 text-ink-soft">
            <p>
              Next step to complete auth: run the migration in `supabase/migrations/20260331120000_create_profiles.sql` on your Supabase project.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
