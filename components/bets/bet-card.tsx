"use client";

import { cancelBetAction, closeBetAction, resolveBetAction } from "@/app/groups/actions";
import { PlaceWagerForm } from "@/components/bets/place-wager-form";
import type { BetSummary } from "@/lib/bets/queries";

type BetCardProps = {
  groupId: string;
  bet: BetSummary;
  currentUserId: string;
};

function getStatusLabel(status: BetSummary["status"], isExpired: boolean) {
  if (status === "open" && isExpired) {
    return "closed by deadline";
  }

  return status;
}

export function BetCard({ groupId, bet, currentUserId }: BetCardProps) {
  const isCreator = bet.creatorId === currentUserId;
  const deadlinePassed = bet.isExpired;
  const canPlaceWager = bet.status === "open" && !deadlinePassed && !bet.myWager;
  const canClose = isCreator && bet.status === "open";
  const canCancel = isCreator && ["open", "closed"].includes(bet.status);
  const canResolve =
    isCreator &&
    !["resolved", "cancelled"].includes(bet.status) &&
    (bet.status === "closed" || deadlinePassed);
  const compactStatus = getStatusLabel(bet.status, bet.isExpired);

  return (
    <details className="border-line rounded-[1.75rem] border bg-[rgba(255,255,255,0.78)] p-4 shadow-sm backdrop-blur sm:p-5">
      <summary className="list-none cursor-pointer">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-ink text-xl font-semibold tracking-[-0.04em] sm:text-2xl">{bet.title}</h3>
              <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                {compactStatus}
              </span>
            </div>
            <p className="text-ink-soft text-sm leading-6">
              {bet.endsAt
                ? `Closes ${new Date(bet.endsAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Manual close by the bet creator"}
            </p>
            {bet.myWager ? (
              <p className="text-ink-muted text-sm leading-6">Your wager: {bet.myWager.points} pts</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="border-line rounded-2xl border bg-white px-4 py-3 text-right">
              <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Total pool</p>
              <p className="text-ink mt-2 text-lg font-semibold">{bet.totalPool} pts</p>
            </div>
            <div className="text-ink-muted font-mono text-xs uppercase tracking-[0.2em]">
              Expand
            </div>
          </div>
        </div>
      </summary>

      <div className="mt-5 space-y-5 border-t border-[rgba(92,73,48,0.12)] pt-5">
        <div className="grid gap-3">
          {bet.options.map((option) => {
            const impliedMultiplier = option.totalPoints > 0 ? (bet.totalPool / option.totalPoints).toFixed(2) : null;
            const isWinningOption = bet.winningOptionId === option.id;
            const isMyOption = bet.myWager?.optionId === option.id;

            return (
              <div
                key={option.id}
                className="border-line rounded-2xl border bg-white px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-ink text-base font-medium">
                      {option.optionText}
                      {isWinningOption ? " - winner" : ""}
                      {isMyOption ? " - your pick" : ""}
                    </p>
                    <p className="text-ink-muted mt-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                      {option.totalPoints} pts
                    </p>
                  </div>
                  <p className="text-accent-strong text-lg font-semibold">
                    {impliedMultiplier ? `${impliedMultiplier}x` : "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {bet.myWager ? (
          <div className="border-line rounded-2xl border bg-white/80 px-4 py-3 text-sm leading-6 text-ink-soft">
            You already wagered {bet.myWager.points} pts on this bet.
          </div>
        ) : null}

        {canPlaceWager ? <PlaceWagerForm groupId={groupId} betId={bet.id} options={bet.options} /> : null}

        {isCreator ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {canClose ? (
              <form action={closeBetAction}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="betId" value={bet.id} />
                <button
                  type="submit"
                  className="border-line text-ink flex h-12 w-full items-center justify-center rounded-2xl border bg-white px-4 text-sm font-medium"
                >
                  Close bet
                </button>
              </form>
            ) : null}

            {canCancel ? (
              <form action={cancelBetAction}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="betId" value={bet.id} />
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 text-sm font-medium text-[rgb(140,52,29)]"
                >
                  Cancel bet
                </button>
              </form>
            ) : null}

            {canResolve ? (
              <form action={resolveBetAction} className="space-y-3">
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="betId" value={bet.id} />
                <select
                  name="winningOptionId"
                  className="border-line text-ink h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select winner
                  </option>
                  {bet.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.optionText}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-accent text-background flex h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold"
                >
                  Resolve bet
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}
