"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "@/constants/Permissions";
import { ROUTES } from "@/constants/Routes";
import { MOCK_ACCESS_TOKEN } from "@/lib/sessionConstants";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function establishMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    MOCK_ACCESS_TOKEN,
    sessionCookieOptions(SESSION_MAX_AGE_SECONDS),
  );
  redirect(ROUTES.home);
}

export async function clearMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", sessionCookieOptions(0));
  redirect(ROUTES.home);
}
