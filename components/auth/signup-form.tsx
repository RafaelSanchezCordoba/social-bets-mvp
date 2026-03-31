"use client";

import { useActionState } from "react";

import { signUpAction, type AuthFormState } from "@/app/(auth)/actions";

const initialState: AuthFormState = {
  status: "idle",
  message: "",
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-ink text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-ink text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="3-20 chars, letters, numbers, or _"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-ink text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
        />
      </div>

      <p className="text-ink-muted text-xs leading-6">
        Your username will identify you inside the app and can also be used to sign in.
      </p>

      {state.message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
            state.status === "error"
              ? "border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] text-[rgb(140,52,29)]"
              : "border-[rgba(58,125,80,0.16)] bg-[rgba(239,248,242,0.9)] text-[rgb(40,97,59)]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-background flex h-13 w-full items-center justify-center rounded-2xl text-base font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
