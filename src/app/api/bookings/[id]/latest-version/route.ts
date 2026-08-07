import { NextRequest } from "next/server";
import { getMockLatestBooking } from "@/lib/mockBookingApi";
import { mockJsonResponse, requireMockPermission } from "@/lib/mockRoute";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const permissionError = await requireMockPermission("editAmendment");
  if (permissionError) return permissionError;

  const { id } = await context.params;
  return mockJsonResponse(getMockLatestBooking(id));
}
