export function amendmentDraftFingerprint(
  draft: BookingAmendmentDraft,
): string {
  return JSON.stringify({
    bookingId: draft.bookingId,
    baseVersion: draft.baseVersion,
    portOfDischarge: draft.portOfDischarge,
    voyageId: draft.voyageId,
    cargoReadinessDate: draft.cargoReadinessDate,
    containers: draft.containers.map((container) => ({
      equipmentType: container.equipmentType,
      quantity: container.quantity,
    })),
    specialInstructions: draft.specialInstructions ?? "",
  });
}
