"use client";

import { useActionState } from "react";

import { placeWagerAction, type BetFormState } from "@/app/groups/actions";

const initialState: BetFormState = {
  status: "idle",
  message: "",
};

type PlaceWagerFormProps = {
  groupId: string;
  betId: string;
  options: Array<{
    id: string;
    optionText: string;
    totalPoints: number;
  }>;
};

export function PlaceWagerForm({ groupId, betId, options }: PlaceWagerFormProps) {
  const [state, formAction, isPending] = useActionState(placeWagerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="betId" value={betId} />

      <div className="grid gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="border-line flex cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 py-3"
          >
            <input type="radio" name="optionId" value={option.id} required />
            <span className="text-ink text-sm font-medium">{option.optionText}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor={`points-${betId}`} className="text-ink text-sm font-medium">
          Points
        </label>
        <input
          id={`points-${betId}`}
          name="points"
          type="number"
          min="1"
          step="1"
          placeholder="50"
          className="border-line text-ink placeholder:text-ink-muted h-13 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-[rgba(199,106,42,0.15)]"
          required
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
        className="bg-accent text-background flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold shadow-[0_14px_30px_rgba(141,69,23,0.2)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Placing wager..." : "Place wager"}
      </button>
    </form>
  );
}
