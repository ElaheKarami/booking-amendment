type MockApiResult<T> = {
  status: number;
  body: T | ApplicationError | BookingVersionConflictResponse;
  delayMs?: number;
};

const booking: Booking = {
  id: "booking-001",
  bookingNumber: "SLK1100354",
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
  containers: [
    { equipmentType: "20GP", quantity: 2 },
    { equipmentType: "40HC", quantity: 1 },
  ],
  shipmentTerms: "FOB Shanghai",
  estimatedCharges: { total: 4_800, currency: "USD" },
  specialInstructions: "Keep dry.",
};

const voyages: VoyageOption[] = [
  {
    id: "voyage-001",
    vesselName: "MV Atlantic Horizon",
    voyageNumber: "AH026W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-08-24",
    cutOffDate: "2026-08-19",
    supports40HC: true,
  },
  {
    id: "voyage-002",
    vesselName: "MV Pacific Star",
    voyageNumber: "PS027W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-08-29",
    cutOffDate: "2026-08-24",
    supports40HC: false,
  },
  {
    id: "voyage-003",
    vesselName: "MV Northern Light",
    voyageNumber: "NL028W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-02",
    cutOffDate: "2026-08-27",
    supports40HC: true,
  },
  {
    id: "voyage-004",
    vesselName: "MV Baltic Trader",
    voyageNumber: "BT029E",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-05",
    cutOffDate: "2026-08-30",
    supports40HC: true,
  },
  {
    id: "voyage-005",
    vesselName: "MV Coral Express",
    voyageNumber: "CE030W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-08",
    cutOffDate: "2026-09-02",
    supports40HC: false,
  },
  {
    id: "voyage-006",
    vesselName: "MV Orient Pearl",
    voyageNumber: "OP031W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-12",
    cutOffDate: "2026-09-06",
    supports40HC: true,
  },
  {
    id: "voyage-007",
    vesselName: "MV Jade Carrier",
    voyageNumber: "JC032E",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-15",
    cutOffDate: "2026-09-09",
    supports40HC: true,
  },
  {
    id: "voyage-008",
    vesselName: "MV Silver Wave",
    voyageNumber: "SW033W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-19",
    cutOffDate: "2026-09-13",
    supports40HC: false,
  },
  {
    id: "voyage-009",
    vesselName: "MV Emerald Sea",
    voyageNumber: "ES034W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-22",
    cutOffDate: "2026-09-16",
    supports40HC: true,
  },
  {
    id: "voyage-010",
    vesselName: "MV Horizon Line",
    voyageNumber: "HL035E",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-26",
    cutOffDate: "2026-09-20",
    supports40HC: true,
  },
  {
    id: "voyage-011",
    vesselName: "MV Rotterdam Bridge",
    voyageNumber: "RB036W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-09-30",
    cutOffDate: "2026-09-24",
    supports40HC: true,
  },
  {
    id: "voyage-012",
    vesselName: "MV Yangtze Spirit",
    voyageNumber: "YS037W",
    portOfLoading: "CNSHA",
    portOfDischarge: "NLRTM",
    departureDate: "2026-10-03",
    cutOffDate: "2026-09-27",
    supports40HC: false,
  },
  {
    id: "voyage-013",
    vesselName: "MV Hamburg Star",
    voyageNumber: "HS038E",
    portOfLoading: "CNSHA",
    portOfDischarge: "DEHAM",
    departureDate: "2026-09-04",
    cutOffDate: "2026-08-28",
    supports40HC: true,
  },
  {
    id: "voyage-014",
    vesselName: "MV Elbe Runner",
    voyageNumber: "ER039W",
    portOfLoading: "CNSHA",
    portOfDischarge: "DEHAM",
    departureDate: "2026-09-11",
    cutOffDate: "2026-09-05",
    supports40HC: false,
  },
  {
    id: "voyage-015",
    vesselName: "MV Scheldt Voyager",
    voyageNumber: "SV040W",
    portOfLoading: "CNSHA",
    portOfDischarge: "BEANR",
    departureDate: "2026-09-07",
    cutOffDate: "2026-09-01",
    supports40HC: true,
  },
];

const submissions = new Map<string, AmendmentSubmission>();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function scenarioDelay(scenario: MockScenario): number | undefined {
  if (scenario === "slow") return 300;
  if (scenario === "out-of-order") return 600;
  return undefined;
}

function errorResult(
  status: number,
  body: ApplicationError,
): MockApiResult<never> {
  return { status, body };
}

function conflictResult(currentVersion: number): MockApiResult<never> {
  return {
    status: 409,
    body: {
      code: "BOOKING_VERSION_CONFLICT",
      currentVersion,
      message: "The booking was modified by another user.",
    },
  };
}

function bookingOrError(id: string): MockApiResult<Booking> {
  if (id !== booking.id) {
    return errorResult(404, {
      type: "business-rule",
      code: "BOOKING_NOT_FOUND",
      message: "The requested booking could not be found.",
    });
  }

  return { status: 200, body: clone(booking) };
}

function validationResult(
  draft: BookingAmendmentDraft,
): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  const equipmentTypes = new Set<EquipmentType>();

  draft.containers.forEach((container, index) => {
    if (container.quantity <= 0) {
      fields[`containers.${index}.quantity`] = [
        "Container quantity must be greater than zero.",
      ];
    }
    if (equipmentTypes.has(container.equipmentType)) {
      fields[`containers.${index}.equipmentType`] = [
        "Duplicate equipment types are not allowed.",
      ];
    }
    equipmentTypes.add(container.equipmentType);
  });

  const voyage = voyages.find((item) => item.id === draft.voyageId);
  if (!voyage) {
    fields.voyageId = ["Select a valid voyage."];
  } else {
    if (
      draft.containers.some(
        (container) => container.equipmentType === "40HC",
      ) &&
      !voyage.supports40HC
    ) {
      fields.voyageId = [
        "The selected voyage does not support 40HC equipment.",
      ];
    }
    if (draft.cargoReadinessDate > voyage.cutOffDate) {
      fields.cargoReadinessDate = [
        "Cargo readiness must be on or before the voyage cut-off date.",
      ];
    }
  }

  return fields;
}

function assessImpact(draft: BookingAmendmentDraft): AmendmentImpact {
  const voyage = voyages.find((item) => item.id === draft.voyageId);
  const fields = validationResult(draft);
  const hasValidationErrors = Object.keys(fields).length > 0;
  const revisedTotal =
    booking.estimatedCharges.total +
    draft.containers.reduce((total, item) => total + item.quantity * 150, 0);

  return {
    schedule: {
      feasible: !hasValidationErrors,
      warnings: voyage ? [] : ["The selected voyage is no longer available."],
    },
    equipment: {
      available: !hasValidationErrors,
      unavailableItems: hasValidationErrors
        ? ["Review container requirements."]
        : [],
    },
    charges: {
      currentTotal: booking.estimatedCharges.total,
      revisedTotal,
      difference: revisedTotal - booking.estimatedCharges.total,
      currency: booking.estimatedCharges.currency,
      items: [
        {
          code: "OCEAN",
          description: "Ocean freight",
          previousAmount: booking.estimatedCharges.total,
          revisedAmount: revisedTotal,
        },
      ],
    },
    approvals:
      revisedTotal > 5_000
        ? [
            {
              code: "COMMERCIAL_REVIEW",
              reason: "Charge increase exceeds $200.",
            },
          ]
        : [],
    validations: Object.entries(fields).flatMap(([field, messages]) =>
      messages.map((message) => ({
        field,
        severity: "error" as const,
        message,
      })),
    ),
    assessmentVersion: `assessment-${booking.version}-${draft.voyageId}`,
  };
}

export function getMockBooking(
  id: string,
  scenario: MockScenario = "normal",
): MockApiResult<Booking> {
  const result = bookingOrError(id);
  return { ...result, delayMs: scenarioDelay(scenario) };
}

export function getMockVoyages(
  search: VoyageSearch,
  scenario: MockScenario = "normal",
): MockApiResult<VoyageOption[]> {
  const normalizedSearch = search.search.toLowerCase();
  const results = voyages.filter(
    (voyage) =>
      voyage.portOfLoading === search.portOfLoading &&
      voyage.portOfDischarge === search.portOfDischarge &&
      voyage.cutOffDate >= search.readinessDate &&
      `${voyage.vesselName} ${voyage.voyageNumber}`
        .toLowerCase()
        .includes(normalizedSearch),
  );

  return {
    status: 200,
    body: clone(results),
    delayMs: scenarioDelay(scenario),
  };
}

export function assessMockAmendment(
  request: AssessAmendmentRequest,
  scenario: MockScenario = "normal",
): MockApiResult<AmendmentImpact> {
  if (
    request.bookingId !== booking.id ||
    request.baseVersion !== booking.version
  ) {
    return conflictResult(booking.version);
  }

  if (scenario === "timeout") {
    return errorResult(504, { type: "network", retryable: true });
  }

  if (scenario === "validation") {
    return errorResult(422, {
      type: "validation",
      fields: { voyageId: ["The selected voyage cannot be assessed."] },
    });
  }

  return {
    status: 200,
    body: assessImpact(request.amendment),
    delayMs: scenarioDelay(scenario),
  };
}

export function submitMockAmendment(
  command: SubmitAmendmentCommand,
  scenario: MockScenario = "normal",
): MockApiResult<AmendmentSubmission> {
  if (scenario === "conflict" || command.baseVersion !== booking.version) {
    return conflictResult(booking.version);
  }

  if (scenario === "validation") {
    return errorResult(422, {
      type: "validation",
      fields: { cargoReadinessDate: ["Cargo readiness is no longer valid."] },
    });
  }

  if (scenario === "timeout") {
    return errorResult(504, { type: "network", retryable: true });
  }

  const existing = submissions.get(command.idempotencyKey);
  if (existing || scenario === "duplicate") {
    const submission = existing ?? {
      id: "submission-001",
      status: "submitted" as const,
      idempotencyKey: command.idempotencyKey,
      alreadyProcessed: true,
    };
    submissions.set(command.idempotencyKey, submission);
    return {
      status: 200,
      body: clone({ ...submission, alreadyProcessed: true }),
    };
  }

  const submission: AmendmentSubmission = {
    id: `submission-${submissions.size + 1}`,
    status: "submitted",
    idempotencyKey: command.idempotencyKey,
    alreadyProcessed: false,
  };
  submissions.set(command.idempotencyKey, submission);

  if (scenario === "unknown") {
    return errorResult(504, {
      type: "unknown",
      message: "The amendment may have been submitted. Check its status.",
    });
  }

  return {
    status: 202,
    body: clone(submission),
    delayMs: scenarioDelay(scenario),
  };
}

export function getMockSubmissionStatus(
  id: string,
): MockApiResult<AmendmentSubmissionStatus> {
  const submission = [...submissions.values()].find((item) => item.id === id);
  if (!submission) {
    return errorResult(404, {
      type: "business-rule",
      code: "SUBMISSION_NOT_FOUND",
      message: "The amendment submission could not be found.",
    });
  }

  return {
    status: 200,
    body: { id: submission.id, status: submission.status },
  };
}

export function getMockLatestBooking(
  id: string,
): MockApiResult<Pick<Booking, "id" | "version" | "lastUpdated">> {
  if (id !== booking.id) {
    return errorResult(404, {
      type: "business-rule",
      code: "BOOKING_NOT_FOUND",
      message: "The requested booking could not be found.",
    });
  }

  return {
    status: 200,
    body: {
      id: booking.id,
      version: booking.version,
      lastUpdated: booking.lastUpdated,
    },
  };
}
