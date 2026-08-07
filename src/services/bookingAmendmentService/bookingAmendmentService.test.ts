import { apiRequestObject } from "@/services/apiRequestObject";
import { getBooking, submitAmendment } from "./bookingAmendmentService";

jest.mock("@/services/apiRequestObject", () => ({
  REQUEST_TYPE: { GET: "get", POST: "post" },
  apiRequestObject: jest.fn(),
}));

const mockApiRequestObject = jest.mocked(apiRequestObject);

describe("bookingAmendmentService", () => {
  beforeEach(() => {
    mockApiRequestObject.mockReset();
  });

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

  it("submits an amendment with the full command through transformers", async () => {
    const command: SubmitAmendmentCommand = {
      bookingId: "booking-001",
      baseVersion: 7,
      assessmentVersion: "assessment-7-voyage-001",
      amendment: {
        bookingId: "booking-001",
        baseVersion: 7,
        portOfDischarge: "NLRTM",
        voyageId: "voyage-001",
        cargoReadinessDate: "2026-08-18",
        containers: [{ equipmentType: "20GP", quantity: 2 }],
      },
      idempotencyKey: "idempotency-test-key",
    };
    const submission: AmendmentSubmission = {
      id: "submission-001",
      status: "submitted",
      idempotencyKey: "idempotency-test-key",
      alreadyProcessed: false,
    };
    mockApiRequestObject.mockResolvedValueOnce({
      success: true,
      data: submission,
    });

    await expect(submitAmendment(command)).resolves.toEqual(submission);
    expect(mockApiRequestObject).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/bookings/booking-001/amendments",
        type: "post",
        body: command,
        inputTransformer: expect.any(Function),
        transformer: expect.any(Function),
      }),
    );
  });
});
