"use client";

import { useActionState, useMemo, useState } from "react";

import { createBetAction, type BetFormState } from "@/app/groups/actions";

const initialState: BetFormState = {
  status: "idle",
  message: "",
};

export function CreateBetForm({ groupId }: { groupId: string }) {
  const [state, formAction, isPending] = useActionState(createBetAction, initialState);
  const [optionCount, setOptionCount] = useState(2);
  const optionIndexes = useMemo(() => Array.from({ length: optionCount }, (_, index) => index), [optionCount]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />

      <div className="space-y-2">
        <label htmlFor="title" className="text-ink text-sm font-medium">
          Bet title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Who wins Saturday's derby?"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
        />
      </div>

      <div className="grid gap-3">
        {optionIndexes.map((index) => (
          <div key={index} className="space-y-2">
            <label className="text-ink text-sm font-medium">Option {index + 1}</label>
            <input
              name="options"
              type="text"
              placeholder={index === 0 ? "Team A" : index === 1 ? "Team B" : "Another option"}
              className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
              required={index < 2}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {optionCount < 4 ? (
          <button
            type="button"
            onClick={() => setOptionCount((count) => count + 1)}
            className="border-line text-ink rounded-2xl border bg-white px-4 py-3 text-sm font-medium"
          >
            Add option
          </button>
        ) : null}

        {optionCount > 2 ? (
          <button
            type="button"
            onClick={() => setOptionCount((count) => Math.max(2, count - 1))}
            className="border-line text-ink rounded-2xl border bg-white px-4 py-3 text-sm font-medium"
          >
            Remove option
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="endsAt" className="text-ink text-sm font-medium">
          Auto-close at (optional)
        </label>
        <input
          id="endsAt"
          name="endsAt"
          type="datetime-local"
          className="border-line text-ink h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
        />
      </div>

      {state.message ? (
        <p className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-3 text-sm leading-6 text-[rgb(140,52,29)]">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-background flex h-13 w-full items-center justify-center rounded-2xl text-base font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating bet..." : "Create bet"}
      </button>
    </form>
  );
}
