import { deleteGroupAction, removeMemberAction } from "@/app/dashboard/actions";

type GroupMember = {
  user_id: string;
  role: "owner" | "member";
  points: number;
  profile: {
    username: string;
  } | null;
};

type GroupCardProps = {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  currentUserId: string;
  currentUserRole: "owner" | "member";
  members: GroupMember[];
};

export function GroupCard({
  id,
  name,
  inviteCode,
  createdAt,
  currentUserId,
  currentUserRole,
  members,
}: GroupCardProps) {
  const isOwner = currentUserRole === "owner";

  return (
    <article className="border-line rounded-[1.75rem] border bg-[rgba(255,255,255,0.78)] p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-ink text-2xl font-semibold tracking-[-0.04em]">
                {name}
              </p>
              <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                {currentUserRole}
              </span>
            </div>
            <p className="text-ink-soft text-sm leading-6">
              Created on {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {isOwner ? (
            <form action={deleteGroupAction}>
              <input type="hidden" name="groupId" value={id} />
              <button
                type="submit"
                className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-3 text-sm font-medium text-[rgb(140,52,29)]"
              >
                Delete group
              </button>
            </form>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-line rounded-2xl border bg-white p-4">
            <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
              Invite code
            </p>
            <p className="text-ink mt-2 text-lg font-semibold tracking-[0.18em]">
              {inviteCode}
            </p>
          </div>
          <div className="border-line rounded-2xl border bg-white p-4">
            <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">
              Members
            </p>
            <p className="text-ink mt-2 text-lg font-semibold">
              {members.length}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">
              Roster
            </p>
            <p className="text-ink-soft text-xs">Owner can remove members</p>
          </div>

          <div className="space-y-3">
            {members.map((member) => {
              const canRemove =
                isOwner && member.user_id !== currentUserId && member.role !== "owner";

              return (
                <div
                  key={member.user_id}
                  className="border-line flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-ink text-sm font-medium">
                      {member.profile?.username ?? "Unknown user"}
                    </p>
                    <p className="text-ink-muted mt-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                      {member.points} pts · {member.role}
                    </p>
                  </div>

                  {canRemove ? (
                    <form action={removeMemberAction}>
                      <input type="hidden" name="groupId" value={id} />
                      <input type="hidden" name="memberUserId" value={member.user_id} />
                      <button
                        type="submit"
                        className="rounded-2xl border border-[rgba(164,60,33,0.18)] bg-[rgba(255,241,236,0.88)] px-4 py-2 text-sm font-medium text-[rgb(140,52,29)]"
                      >
                        Remove
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
