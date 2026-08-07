import { apiRequestObject } from "@/services/apiRequestObject";
import { getBooking } from "./bookingAmendmentService";

jest.mock("@/services/apiRequestObject", () => ({
  REQUEST_TYPE: { GET: "get", POST: "post" },
  apiRequestObject: jest.fn(),
}));

const mockApiRequestObject = jest.mocked(apiRequestObject);

describe("bookingAmendmentService", () => {
  it("gets a booking through the shared API request layer", async () => {
    const booking: Booking = {
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
      containers: [],
      shipmentTerms: "FOB Shanghai",
      estimatedCharges: { total: 4_800, currency: "USD" },
    };
    mockApiRequestObject.mockResolvedValueOnce({
      success: true,
      data: booking,
    });

    await expect(
      getBooking("booking-001", { scenario: "slow" }),
    ).resolves.toEqual(booking);
    expect(mockApiRequestObject).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/bookings/booking-001?scenario=slow",
        transformer: expect.any(Function),
      }),
    );
  });
});
