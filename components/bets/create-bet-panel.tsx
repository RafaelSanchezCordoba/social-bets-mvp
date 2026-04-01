import { CreateBetForm } from "@/components/bets/create-bet-form";

export function CreateBetPanel({ groupId }: { groupId: string }) {
  return (
    <details className="border-line rounded-[1.75rem] border bg-white/84 shadow-sm backdrop-blur">
      <summary className="list-none cursor-pointer p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Create bet</p>
            <h2 className="text-ink text-2xl font-semibold tracking-[-0.03em]">
              Open a new prediction round
            </h2>
            <p className="text-ink-soft text-sm leading-6">
              Tap to add options and choose whether the bet closes automatically or only when you close it.
            </p>
          </div>
          <span className="text-accent-strong shrink-0 text-sm font-medium">Open</span>
        </div>
      </summary>

      <div className="border-line border-t px-4 pt-4 pb-5 sm:px-5">
        <CreateBetForm groupId={groupId} />
      </div>
    </details>
  );
}
