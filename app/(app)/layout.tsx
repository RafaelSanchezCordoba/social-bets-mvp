import { redirect } from "next/navigation";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col px-4 pt-5 pb-28 sm:px-6 sm:pt-6 sm:pb-32 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top,rgba(199,106,42,0.12),transparent_62%)]" />
      <div className="flex-1">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
