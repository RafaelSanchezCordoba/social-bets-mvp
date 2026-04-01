"use client";

import { useState } from "react";

export function CopyInviteButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-line text-ink rounded-xl border bg-[rgba(255,250,243,0.92)] px-3 py-2 text-xs font-medium"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
