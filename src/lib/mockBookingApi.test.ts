import {
  assessMockAmendment,
  getMockBooking,
  getMockLatestBooking,
  getMockSubmissionStatus,
  getMockVoyages,
  submitMockAmendment,
} from "./mockBookingApi";

const draft: BookingAmendmentDraft = {
  bookingId: "booking-001",
  baseVersion: 7,
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  cargoReadinessDate: "2026-08-18",
  containers: [{ equipmentType: "20GP", quantity: 2 }],
};

describe("mock booking API", () => {
  it("returns an immutable booking snapshot", () => {
    const first = getMockBooking("booking-001");
    if ("type" in first.body || "code" in first.body) {
      throw new Error("Expected a booking.");
    }

    first.body.containers[0].quantity = 99;

    const second = getMockBooking("booking-001");
    if ("type" in second.body || "code" in second.body) {
      throw new Error("Expected a booking.");
    }

    expect(second.body.containers[0].quantity).toBe(2);
  });

  it("returns validation details in an assessment result", () => {
    const result = assessMockAmendment({
      bookingId: "booking-001",
      baseVersion: 7,
      amendment: {
        ...draft,
        containers: [{ equipmentType: "20GP", quantity: 0 }],
      },
    });

    if ("type" in result.body || "code" in result.body) {
      throw new Error("Expected an impact result.");
    }

    expect(result.body.validations).toEqual([
      expect.objectContaining({
        field: "containers.0.quantity",
        severity: "error",
      }),
    ]);
  });

  it("supports delayed assessment and typed validation scenarios", () => {
    const delayed = assessMockAmendment(
      { bookingId: "booking-001", baseVersion: 7, amendment: draft },
      "out-of-order",
    );
    const invalid = assessMockAmendment(
      { bookingId: "booking-001", baseVersion: 7, amendment: draft },
      "validation",
    );

    expect(delayed.delayMs).toBe(600);
    expect(invalid).toEqual(
      expect.objectContaining({
        status: 422,
        body: expect.objectContaining({ type: "validation" }),
      }),
    );
  });

  it("recognises duplicate submissions by idempotency key", () => {
    const command: SubmitAmendmentCommand = {
      bookingId: "booking-001",
      baseVersion: 7,
      assessmentVersion: "assessment-7-voyage-001",
      amendment: draft,
      idempotencyKey: "test-idempotency-key",
    };

    const first = submitMockAmendment(command);
    const second = submitMockAmendment(command);

    if (
      "type" in first.body ||
      "code" in first.body ||
      "type" in second.body ||
      "code" in second.body
    ) {
      throw new Error("Expected submission responses.");
    }

    expect(first.body.alreadyProcessed).toBe(false);
    expect(second.body).toMatchObject({
      id: first.body.id,
      alreadyProcessed: true,
    });
  });

  it("returns the latest booking version", () => {
    expect(getMockLatestBooking("booking-001")).toMatchObject({
      status: 200,
      body: { id: "booking-001", version: 7 },
    });
  });

  it("filters voyage options by route and readiness date", () => {
    const results = getMockVoyages({
      portOfLoading: "CNSHA",
      portOfDischarge: "NLRTM",
      readinessDate: "2026-08-20",
      search: "",
    });
    const unavailableRoute = getMockVoyages({
      portOfLoading: "CNSHA",
      portOfDischarge: "USLAX",
      readinessDate: "2026-08-18",
      search: "",
    });

    expect(results.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "voyage-002" })]),
    );
    expect(
      (results.body as VoyageOption[]).some((voyage) => voyage.id === "voyage-001"),
    ).toBe(false);
    expect(unavailableRoute.body).toEqual([]);
  });

  it("filters voyage options by search text", () => {
    const results = getMockVoyages({
      portOfLoading: "CNSHA",
      portOfDischarge: "NLRTM",
      readinessDate: "2026-08-18",
      search: "pacific",
    });

    expect(results.body).toEqual([
      expect.objectContaining({ id: "voyage-002", voyageNumber: "PS027W" }),
    ]);
  });

  it("returns the documented conflict response", () => {
    const result = submitMockAmendment(
      {
        bookingId: "booking-001",
        baseVersion: 7,
        assessmentVersion: "assessment-7-voyage-001",
        amendment: draft,
        idempotencyKey: "conflict-key",
      },
      "conflict",
    );

    expect(result).toEqual({
      status: 409,
      body: {
        code: "BOOKING_VERSION_CONFLICT",
        currentVersion: 7,
        message: "The booking was modified by another user.",
      },
    });
  });

  it("resolves submission status by idempotency key or submission id", () => {
    const command: SubmitAmendmentCommand = {
      bookingId: "booking-001",
      baseVersion: 7,
      assessmentVersion: "assessment-7-voyage-001",
      amendment: draft,
      idempotencyKey: "status-lookup-key",
    };

    const submitted = submitMockAmendment(command);
    if ("type" in submitted.body || "code" in submitted.body) {
      throw new Error("Expected a submission response.");
    }

    expect(getMockSubmissionStatus("status-lookup-key")).toEqual({
      status: 200,
      body: { id: submitted.body.id, status: "submitted" },
    });
    expect(getMockSubmissionStatus(submitted.body.id)).toEqual({
      status: 200,
      body: { id: submitted.body.id, status: "submitted" },
    });
  });
});
