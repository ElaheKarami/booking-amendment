import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { getBooking } from "@/services/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import { bookingQueryKey, useBooking } from "./useBooking";

jest.mock("@/services/bookingAmendmentService", () => ({
  getBooking: jest.fn(),
}));

const mockGetBooking = jest.mocked(getBooking);

const sampleBooking: Booking = {
  id: "booking-001",
  bookingNumber: "BK-2026-001",
  customer: "Northstar Imports",
  status: "Confirmed",
  version: 7,
  lastUpdated: "2026-08-07T08:30:00.000Z",
  portOfLoading: "CNSHA",
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  vesselName: "MV Atlantic Horizon",
  voyageNumber: "AH026W",
  cargoReadinessDate: "2026-08-18",
  containers: [{ equipmentType: "20GP", quantity: 2 }],
  shipmentTerms: "FOB Shanghai",
  estimatedCharges: { total: 4_800, currency: "USD" },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useBooking", () => {
  beforeEach(() => {
    mockGetBooking.mockReset();
  });

  it("uses the booking query key", () => {
    expect(bookingQueryKey("booking-001")).toEqual(["booking", "booking-001"]);
  });

  it("loads a booking through the service layer", async () => {
    mockGetBooking.mockResolvedValueOnce(sampleBooking);

    const { result } = renderHook(() => useBooking("booking-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleBooking);
    expect(mockGetBooking).toHaveBeenCalledWith("booking-001", {
      signal: expect.any(AbortSignal),
    });
  });

  it("normalises API errors", async () => {
    mockGetBooking.mockRejectedValueOnce(
      new ApiError("The requested booking could not be found.", 404, [
        "The requested booking could not be found.",
      ]),
    );

    const { result } = renderHook(() => useBooking("missing-booking"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error).toMatchObject({
      status: 404,
      message: "The requested booking could not be found.",
    });
  });
});
