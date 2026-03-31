"use client";

import { useActionState } from "react";

import {
  createGroupAction,
  type GroupActionState,
} from "@/app/dashboard/actions";

const initialState: GroupActionState = {
  status: "idle",
  message: "",
};

export function CreateGroupForm() {
  const [state, formAction, isPending] = useActionState(
    createGroupAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-ink text-sm font-medium">
          Group name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Sunday League Crew"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
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
        className="bg-accent text-background flex h-13 w-full items-center justify-center rounded-2xl text-base font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating group..." : "Create group"}
      </button>
    </form>
  );
}
