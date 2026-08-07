import {
  bookingAmendmentSchema,
  createBookingAmendmentSchema,
  mapServerValidationToFormErrors,
  type BookingAmendmentFormValues,
} from "./bookingAmendmentSchema";

const validDraft: BookingAmendmentFormValues = {
  bookingId: "booking-001",
  baseVersion: 7,
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  cargoReadinessDate: "2026-08-18",
  containers: [
    { equipmentType: "20GP", quantity: 2 },
    { equipmentType: "40HC", quantity: 1 },
  ],
  specialInstructions: "Keep dry.",
};

describe("bookingAmendmentSchema", () => {
  it("accepts a valid amendment draft", () => {
    expect(bookingAmendmentSchema.safeParse(validDraft).success).toBe(true);
  });

  it("rejects quantity less than or equal to zero", () => {
    const result = bookingAmendmentSchema.safeParse({
      ...validDraft,
      containers: [{ equipmentType: "20GP", quantity: 0 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Container quantity must be greater than zero.",
      );
    }
  });

  it("rejects duplicate equipment types", () => {
    const result = bookingAmendmentSchema.safeParse({
      ...validDraft,
      containers: [
        { equipmentType: "20GP", quantity: 2 },
        { equipmentType: "20GP", quantity: 1 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Duplicate equipment types are not allowed.",
      );
    }
  });

  it("rejects special instructions over 500 characters", () => {
    const result = bookingAmendmentSchema.safeParse({
      ...validDraft,
      specialInstructions: "x".repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("500");
    }
  });

  it("rejects 40HC equipment when the selected voyage does not support it", () => {
    const schema = createBookingAmendmentSchema([
      { id: "voyage-002", supports40HC: false },
    ]);

    const result = schema.safeParse({
      ...validDraft,
      voyageId: "voyage-002",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "The selected voyage does not support 40HC equipment.",
      );
    }
  });
});

describe("mapServerValidationToFormErrors", () => {
  it("maps field paths onto setError calls", () => {
    const setError = jest.fn();

    mapServerValidationToFormErrors(
      {
        "containers.0.quantity": [
          "Container quantity must be greater than zero.",
        ],
        voyageId: ["Select a valid voyage."],
      },
      setError,
    );

    expect(setError).toHaveBeenCalledWith("containers.0.quantity", {
      type: "server",
      message: "Container quantity must be greater than zero.",
    });
    expect(setError).toHaveBeenCalledWith("voyageId", {
      type: "server",
      message: "Select a valid voyage.",
    });
  });
});
