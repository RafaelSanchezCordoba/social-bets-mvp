"use client";

import { useActionState } from "react";

import { joinGroupAction, type GroupActionState } from "@/app/dashboard/actions";

const initialState: GroupActionState = {
  status: "idle",
  message: "",
};

export function JoinGroupForm() {
  const [state, formAction, isPending] = useActionState(joinGroupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="inviteCode" className="text-ink text-sm font-medium">
          Invite code
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          placeholder="AB12CD"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base uppercase outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
        />
      </div>

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
        className="border-line text-ink flex h-13 w-full items-center justify-center rounded-2xl border bg-white text-base font-semibold shadow-sm transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Joining group..." : "Join group"}
      </button>
    </form>
  );
}
