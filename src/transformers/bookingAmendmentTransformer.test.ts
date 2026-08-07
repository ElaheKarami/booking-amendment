import {
  assessAmendmentConvertToServerData,
  bookingConvertToLocalData,
} from "./bookingAmendmentTransformer";

describe("booking amendment transformers", () => {
  it("creates an independent booking model from a DTO", () => {
    const dto: BookingDto = {
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

    const booking = bookingConvertToLocalData(dto);
    booking.containers[0].quantity = 5;

    expect(dto.containers[0].quantity).toBe(2);
  });

  it("creates an independent assessment request DTO", () => {
    const request: AssessAmendmentRequest = {
      bookingId: "booking-001",
      baseVersion: 7,
      amendment: {
        bookingId: "booking-001",
        baseVersion: 7,
        portOfDischarge: "NLRTM",
        voyageId: "voyage-001",
        cargoReadinessDate: "2026-08-18",
        containers: [{ equipmentType: "20GP", quantity: 2 }],
      },
    };

    const dto = assessAmendmentConvertToServerData(request);
    dto.amendment.containers[0].quantity = 3;

    expect(request.amendment.containers[0].quantity).toBe(2);
  });
});
