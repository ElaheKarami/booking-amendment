import { NextRequest } from "next/server";
import { assessMockAmendment } from "@/lib/mockBookingApi";
import {
  getMockScenario,
  mockJsonResponse,
  requireMockPermission,
} from "@/lib/mockRoute";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const permissionError = await requireMockPermission("editAmendment");
  if (permissionError) return permissionError;

  const { id } = await context.params;
  const body = (await request.json()) as AssessAmendmentRequest;
  return mockJsonResponse(
    assessMockAmendment({ ...body, bookingId: id }, getMockScenario(request)),
  );
}
