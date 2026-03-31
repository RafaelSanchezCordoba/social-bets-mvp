"use client";

import { useState } from "react";

import { BetCard } from "@/components/bets/bet-card";
import type { BetSummary } from "@/lib/bets/queries";

type GroupBetsPanelProps = {
  groupId: string;
  currentUserId: string;
  openBets: BetSummary[];
  closedBets: BetSummary[];
  historyBets: BetSummary[];
};

export function GroupBetsPanel({
  groupId,
  currentUserId,
  openBets,
  closedBets,
  historyBets,
}: GroupBetsPanelProps) {
  const [view, setView] = useState<"active" | "history">("active");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
            Bets
          </p>
          <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
            Follow what is live now or check past outcomes
          </h2>
        </div>

        <div className="border-line inline-flex rounded-2xl border bg-white p-1">
          <button
            type="button"
            onClick={() => setView("active")}
            className={`rounded-[0.9rem] px-4 py-2 text-sm font-medium transition ${
              view === "active" ? "bg-accent text-background" : "text-ink"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setView("history")}
            className={`rounded-[0.9rem] px-4 py-2 text-sm font-medium transition ${
              view === "history" ? "bg-accent text-background" : "text-ink"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {view === "active" ? (
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Open bets
              </p>
              <h3 className="text-ink text-xl font-semibold tracking-[-0.03em]">
                Live pools and open wagers
              </h3>
            </div>

            {openBets.length > 0 ? (
              <div className="grid gap-4">
                {openBets.map((bet) => (
                  <BetCard key={bet.id} groupId={groupId} bet={bet} currentUserId={currentUserId} />
                ))}
              </div>
            ) : (
              <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
                There are no open bets in this group yet.
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
                Closed bets
              </p>
              <h3 className="text-ink text-xl font-semibold tracking-[-0.03em]">
                Waiting for the creator to resolve them
              </h3>
            </div>

            {closedBets.length > 0 ? (
              <div className="grid gap-4">
                {closedBets.map((bet) => (
                  <BetCard key={bet.id} groupId={groupId} bet={bet} currentUserId={currentUserId} />
                ))}
              </div>
            ) : (
              <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
                There are no closed bets waiting for resolution.
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
              History
            </p>
            <h3 className="text-ink text-xl font-semibold tracking-[-0.03em]">
              Resolved and cancelled bets
            </h3>
          </div>

          {historyBets.length > 0 ? (
            <div className="grid gap-4">
              {historyBets.map((bet) => (
                <BetCard key={bet.id} groupId={groupId} bet={bet} currentUserId={currentUserId} />
              ))}
            </div>
          ) : (
            <div className="border-line rounded-[1.75rem] border bg-white/70 p-5 text-sm leading-7 text-ink-soft">
              Resolved and cancelled bets will show up here.
            </div>
          )}
        </section>
      )}
    </section>
  );
}
