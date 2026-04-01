import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <AuthShell
      eyebrow="Access"
      title="Jump back into your group and follow the action from any phone."
      description="Use your email or username to sign in. The flow stays fast, focused, and easy to use on mobile."
      footerLabel="Don&apos;t have an account yet?"
      footerHref="/signup"
      footerCta="Create account"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.24em]">
            Login
          </p>
          <h2 className="text-ink text-3xl font-semibold tracking-[-0.04em]">
            Welcome back
          </h2>
          <p className="text-ink-soft text-sm leading-6">
            Sign in to see your groups, your balance, and every live bet.
          </p>
        </div>

        <LoginForm />
      </div>
    </AuthShell>
  );
}
