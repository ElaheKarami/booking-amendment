import { NextRequest } from "next/server";
import { submitMockAmendment } from "@/lib/mockBookingApi";
import {
  getMockScenario,
  mockJsonResponse,
  requireMockPermission,
} from "@/lib/mockRoute";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const permissionError = await requireMockPermission("submitAmendment");
  if (permissionError) return permissionError;

  const { id } = await context.params;
  const body = (await request.json()) as SubmitAmendmentCommand;
  return mockJsonResponse(
    submitMockAmendment({ ...body, bookingId: id }, getMockScenario(request)),
  );
}
