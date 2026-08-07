import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { getBooking } from "@/services/bookingAmendmentService/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import { bookingQueryKey } from "./useBooking";
import { useReloadBooking } from "./useReloadBooking";

jest.mock("@/services/bookingAmendmentService/bookingAmendmentService", () => ({
  getBooking: jest.fn(),
}));

const mockGetBooking = jest.mocked(getBooking);

const sampleBooking: Booking = {
  id: "booking-001",
  bookingNumber: "BK-2026-001",
  customer: "Northstar Imports",
  status: "Confirmed",
  version: 8,
  lastUpdated: "2026-08-07T09:00:00.000Z",
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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useReloadBooking", () => {
  beforeEach(() => {
    mockGetBooking.mockReset();
  });

  it("refetches the booking and updates the query cache", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockGetBooking.mockResolvedValueOnce(sampleBooking);

    const { result } = renderHook(() => useReloadBooking(), {
      wrapper: createWrapper(queryClient),
    });

    let booking: Booking | undefined;
    await act(async () => {
      booking = await result.current("booking-001");
    });

    expect(booking).toEqual(sampleBooking);
    expect(mockGetBooking).toHaveBeenCalledWith("booking-001", {
      signal: expect.any(AbortSignal),
    });
    expect(queryClient.getQueryData(bookingQueryKey("booking-001"))).toEqual(
      sampleBooking,
    );
  });

  it("normalises API errors", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockGetBooking.mockRejectedValueOnce(
      new ApiError("The requested booking could not be found.", 404, [
        "The requested booking could not be found.",
      ]),
    );

    const { result } = renderHook(() => useReloadBooking(), {
      wrapper: createWrapper(queryClient),
    });

    await expect(
      act(async () => {
        await result.current("missing-booking");
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
