import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/constants/Permissions";
import { MOCK_ACCESS_TOKEN } from "@/lib/sessionConstants";

/**
 * Route protection boundary (Next.js 16 `proxy`).
 * Missing/invalid sessions are not redirected to a login page — the page-level
 * AuthenticationBoundary renders the unauthenticated state instead.
 */
export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isSessionValid = accessToken === MOCK_ACCESS_TOKEN;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-session-valid", isSessionValid ? "1" : "0");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
