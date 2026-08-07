import { amendmentDraftFingerprint } from "./amendmentDraftFingerprint";

const draft: BookingAmendmentDraft = {
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

describe("amendmentDraftFingerprint", () => {
  it("is stable for the same draft contents", () => {
    expect(amendmentDraftFingerprint(draft)).toBe(
      amendmentDraftFingerprint({
        ...draft,
        containers: draft.containers.map((container) => ({ ...container })),
      }),
    );
  });

  it("changes when a relevant field changes", () => {
    expect(
      amendmentDraftFingerprint({
        ...draft,
        voyageId: "voyage-002",
      }),
    ).not.toBe(amendmentDraftFingerprint(draft));
  });

  it("treats missing special instructions like an empty string", () => {
    expect(
      amendmentDraftFingerprint({
        ...draft,
        specialInstructions: undefined,
      }),
    ).toBe(
      amendmentDraftFingerprint({
        ...draft,
        specialInstructions: "",
      }),
    );
  });
});
