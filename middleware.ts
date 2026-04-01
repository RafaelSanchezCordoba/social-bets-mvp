import type { NextRequest } from "next/server";

import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/home/:path*",
    "/dashboard/:path*",
    "/groups/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
  ],
};
