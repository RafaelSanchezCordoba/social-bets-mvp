import { signOutAction } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="space-y-5">
      <section className="border-line-strong rounded-[2rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,239,231,0.96))] p-4 shadow-[0_24px_80px_rgba(65,45,24,0.12)] sm:p-5">
        <div className="bg-panel space-y-5 rounded-[1.5rem] p-5">
          <div className="space-y-3">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">Profile</p>
            <h1 className="text-ink text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Your app identity
            </h1>
            <p className="text-ink-soft max-w-2xl text-sm leading-7 sm:text-base">
              Review how you appear inside groups and keep your session ready for quick betting rounds.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Username</p>
              <p className="text-ink mt-2 text-lg font-semibold">{profile?.username ?? "Unknown"}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Email</p>
              <p className="text-ink mt-2 break-all text-sm leading-6">{user.email}</p>
            </article>
            <article className="border-line rounded-2xl border bg-white p-4">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Joined</p>
              <p className="text-ink mt-2 text-sm leading-6">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </p>
            </article>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="border-line text-ink flex h-12 w-full items-center justify-center rounded-2xl border bg-white px-5 text-sm font-medium sm:w-auto"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
