import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <AuthShell
      eyebrow="Sign up"
      title="Create your in-app identity and sign in with email or username."
      description="Your username is how friends will recognize you across bets, rankings, and results inside each group."
      footerLabel="Already have an account?"
      footerHref="/login"
      footerCta="Sign in"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
            Signup
          </p>
          <h2 className="text-ink text-3xl font-semibold tracking-[-0.04em]">
            Set up your profile
          </h2>
          <p className="text-ink-soft text-sm leading-6">
            You only need an email, a password, and a unique username to get started.
          </p>
        </div>

        <SignupForm />
      </div>
    </AuthShell>
  );
}
