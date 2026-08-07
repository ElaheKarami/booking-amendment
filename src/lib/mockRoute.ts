import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { hasPermission } from "@/lib/permissionCheck";
import { getCurrentUser } from "@/lib/getCurrentUser";

type MockApiResult<T> = {
  status: number;
  body: T | ApplicationError | BookingVersionConflictResponse;
  delayMs?: number;
};

export function getMockScenario(request: NextRequest): MockScenario {
  const scenario = request.nextUrl.searchParams.get("scenario");
  const scenarios: MockScenario[] = [
    "normal",
    "validation",
    "slow",
    "conflict",
    "timeout",
    "unknown",
    "duplicate",
    "out-of-order",
  ];

  return scenarios.includes(scenario as MockScenario)
    ? (scenario as MockScenario)
    : "normal";
}

export async function requireMockPermission(
  permission: Permission,
): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        type: "business-rule",
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      } satisfies ApplicationError,
      { status: 401 },
    );
  }

  if (!hasPermission(user, permission)) {
    return NextResponse.json(
      {
        type: "business-rule",
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      } satisfies ApplicationError,
      { status: 403 },
    );
  }

  return null;
}

export async function mockJsonResponse<T>(
  result: MockApiResult<T>,
): Promise<NextResponse> {
  if (result.delayMs) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, result.delayMs);
    });
  }

  return NextResponse.json(result.body, { status: result.status });
}
