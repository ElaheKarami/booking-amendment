import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, MOCK_CURRENT_USER } from "@/constants/Permissions";
import { MOCK_ACCESS_TOKEN } from "@/lib/sessionConstants";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken !== MOCK_ACCESS_TOKEN) {
    return null;
  }

  return MOCK_CURRENT_USER;
}
