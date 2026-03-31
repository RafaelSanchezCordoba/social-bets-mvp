"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V19H4z" />
        <path d="M9.5 19v-4.5h5V19" />
      </svg>
    ),
    matches: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/groups",
    label: "Groups",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v9C20 17.88 18.88 19 17.5 19h-11C5.12 19 4 17.88 4 16.5z" />
        <path d="M8 9.5h8" />
        <path d="M8 13h5" />
      </svg>
    ),
    matches: (pathname: string) => pathname === "/groups" || /^\/groups\/[a-f0-9-]+$/.test(pathname),
  },
  {
    href: "/groups/discover",
    label: "Create",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    matches: (pathname: string) => pathname === "/groups/discover",
  },
  {
    href: "/leaderboard",
    label: "Ranks",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 18V11" />
        <path d="M12 18V7" />
        <path d="M18 18v-4" />
        <path d="M4 19h16" />
      </svg>
    ),
    matches: (pathname: string) => pathname === "/leaderboard",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
    matches: (pathname: string) => pathname === "/profile",
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-5xl justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-10">
      <div className="border-line-strong flex w-full max-w-2xl items-center justify-between rounded-[1.7rem] border bg-[rgba(255,250,243,0.94)] px-2 py-2 shadow-[0_18px_40px_rgba(65,45,24,0.14)] backdrop-blur">
        {navItems.map((item) => {
          const isActive = item.matches(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.1rem] px-2 py-2 text-[10px] font-medium transition ${
                isActive ? "bg-[rgba(199,106,42,0.14)] text-accent-strong" : "text-ink-muted"
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
