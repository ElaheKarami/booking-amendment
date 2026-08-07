import { NextRequest } from "next/server";
import { getMockBooking } from "@/lib/mockBookingApi";
import {
  getMockScenario,
  mockJsonResponse,
  requireMockPermission,
} from "@/lib/mockRoute";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const permissionError = await requireMockPermission("editAmendment");
  if (permissionError) return permissionError;

  const { id } = await context.params;
  return mockJsonResponse(getMockBooking(id, getMockScenario(request)));
}
