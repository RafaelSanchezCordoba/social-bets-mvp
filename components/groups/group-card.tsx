import Link from "next/link";

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
  currentUserRole: "owner" | "member";
  members: GroupMember[];
};

export function GroupCard({
  id,
  name,
  inviteCode,
  createdAt,
  currentUserRole,
  members,
}: GroupCardProps) {
  const topMembers = [...members]
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      return (left.profile?.username ?? "").localeCompare(right.profile?.username ?? "");
    })
    .slice(0, 3);

  return (
    <Link
      href={`/groups/${id}`}
      className="border-line block rounded-[1.75rem] border bg-[rgba(255,255,255,0.78)] p-4 shadow-sm backdrop-blur transition hover:translate-y-[-1px] sm:p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-ink text-2xl font-semibold tracking-[-0.04em]">{name}</p>
            <span className="bg-accent-soft text-accent-strong rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
              {currentUserRole}
            </span>
          </div>
          <p className="text-ink-soft text-sm leading-6">
            Created on {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-line rounded-2xl border bg-white p-4">
            <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Invite code</p>
            <p className="text-ink mt-2 text-lg font-semibold tracking-[0.18em]">{inviteCode}</p>
          </div>
          <div className="border-line rounded-2xl border bg-white p-4">
            <p className="text-ink-muted font-mono text-[11px] uppercase tracking-[0.2em]">Members</p>
            <p className="text-ink mt-2 text-lg font-semibold">{members.length}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-ink-muted font-mono text-xs uppercase tracking-[0.22em]">Top 3</p>
            <p className="text-accent-strong text-xs font-medium">Open group</p>
          </div>

          <div className="grid gap-2">
            {topMembers.map((member, index) => (
              <div
                key={member.user_id}
                className="border-line flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-ink text-sm font-medium">
                    #{index + 1} {member.profile?.username ?? "Unknown user"}
                  </p>
                  <p className="text-ink-muted mt-1 font-mono text-[11px] uppercase tracking-[0.18em]">
                    {member.role}
                  </p>
                </div>
                <p className="text-ink text-sm font-semibold">{member.points} pts</p>
              </div>
            ))}
            {members.length > 3 ? (
              <p className="text-ink-soft px-1 text-xs leading-6">+{members.length - 3} more members inside this group.</p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
