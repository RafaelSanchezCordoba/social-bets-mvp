import { removeMemberAction } from "@/app/dashboard/actions";
import type { GroupLeaderboardEntry } from "@/lib/leaderboard/queries";

function getMedal(rank: number) {
  if (rank === 1) return "01";
  if (rank === 2) return "02";
  if (rank === 3) return "03";
  return null;
}

type GroupStandingsProps = {
  groupId: string;
  currentUserId: string;
  canManageMembers: boolean;
  entries: GroupLeaderboardEntry[];
};

export function GroupStandings({
  groupId,
  currentUserId,
  canManageMembers,
  entries,
}: GroupStandingsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {entries.slice(0, 3).map((entry) => {
          const canRemove = canManageMembers && entry.role !== "owner" && entry.userId !== currentUserId;

          return (
            <article
              key={entry.userId}
              className="border-line rounded-[1.35rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,229,0.92))] px-4 py-3 shadow-sm"
            >
              <p className="text-ink-muted font-mono text-[10px] uppercase tracking-[0.18em]">
                Rank {getMedal(entry.rank) ?? entry.rank}
              </p>
              <p className="text-ink mt-2 text-lg font-semibold tracking-[-0.03em]">{entry.username}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                  {entry.role}
                </span>
                <span className="text-ink text-base font-semibold">{entry.points} pts</span>
              </div>
              {canRemove ? (
                <form action={removeMemberAction} className="mt-3">
                  <input type="hidden" name="groupId" value={groupId} />
                  <input type="hidden" name="memberUserId" value={entry.userId} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-3 py-2 text-xs font-medium text-[rgb(140,52,29)]"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="grid gap-3">
        {entries.slice(3).map((entry) => {
          const canRemove = canManageMembers && entry.role !== "owner" && entry.userId !== currentUserId;

          return (
            <article
              key={entry.userId}
              className="border-line flex items-center justify-between gap-3 rounded-[1.1rem] border bg-white px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-ink truncate text-sm font-medium">
                  #{entry.rank} {entry.username}
                </p>
                <p className="text-ink-muted mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                  {entry.role}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <p className="text-ink text-sm font-semibold">{entry.points} pts</p>
                {canRemove ? (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="memberUserId" value={entry.userId} />
                    <button
                      type="submit"
                      className="rounded-xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-3 py-1.5 text-xs font-medium text-[rgb(140,52,29)]"
                    >
                      Remove
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
