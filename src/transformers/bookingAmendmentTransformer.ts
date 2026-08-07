export function bookingConvertToLocalData(data: BookingDto): Booking {
  return {
    ...data,
    containers: data.containers.map((container) => ({ ...container })),
    estimatedCharges: { ...data.estimatedCharges },
  };
}

export function voyageConvertToLocalData(data: VoyageOptionDto): VoyageOption {
  return { ...data };
}

export function impactConvertToLocalData(
  data: AmendmentImpactDto,
): AmendmentImpact {
  return {
    ...data,
    schedule: { ...data.schedule, warnings: [...data.schedule.warnings] },
    equipment: {
      ...data.equipment,
      unavailableItems: [...data.equipment.unavailableItems],
    },
    charges: {
      ...data.charges,
      items: data.charges.items.map((item) => ({ ...item })),
    },
    approvals: data.approvals.map((approval) => ({ ...approval })),
    validations: data.validations.map((validation) => ({ ...validation })),
  };
}

export function submissionConvertToLocalData(
  data: AmendmentSubmissionDto,
): AmendmentSubmission {
  return { ...data };
}

export function submissionStatusConvertToLocalData(
  data: AmendmentSubmissionStatusDto,
): AmendmentSubmissionStatus {
  return { ...data };
}

export function latestBookingVersionConvertToLocalData(
  data: LatestBookingVersionDto,
): LatestBookingVersionDto {
  return { ...data };
}

export function assessAmendmentConvertToServerData(
  data: AssessAmendmentRequest,
): AssessAmendmentRequestDto {
  return {
    ...data,
    amendment: {
      ...data.amendment,
      containers: data.amendment.containers.map((container) => ({
        ...container,
      })),
    },
  };
}

export function submitAmendmentConvertToServerData(
  data: SubmitAmendmentCommand,
): SubmitAmendmentCommandDto {
  return {
    ...data,
    amendment: {
      ...data.amendment,
      containers: data.amendment.containers.map((container) => ({
        ...container,
      })),
    },
  };
}
