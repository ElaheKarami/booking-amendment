import { NextRequest } from "next/server";
import { getMockVoyages } from "@/lib/mockBookingApi";
import {
  getMockScenario,
  mockJsonResponse,
  requireMockPermission,
} from "@/lib/mockRoute";

export async function GET(request: NextRequest) {
  const permissionError = await requireMockPermission("editAmendment");
  if (permissionError) return permissionError;

  return mockJsonResponse(
    getMockVoyages(
      {
        portOfLoading: request.nextUrl.searchParams.get("portOfLoading") ?? "",
        portOfDischarge:
          request.nextUrl.searchParams.get("portOfDischarge") ?? "",
        readinessDate: request.nextUrl.searchParams.get("readinessDate") ?? "",
        search: request.nextUrl.searchParams.get("search") ?? "",
      },
      getMockScenario(request),
    ),
  );
}
