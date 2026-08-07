export {};

declare global {
  type AsyncStatus = "idle" | "loading" | "success" | "error";

  type UserRole =
    "operations-user" | "operations-supervisor" | "commercial-reviewer";

  type CurrentUser = {
    id: string;
    displayName: string;
    roles: UserRole[];
  };

  type Permission =
    | "editAmendment"
    | "submitAmendment"
    | "overrideEligibleWarning"
    | "viewDetailedChargeImpact";

  type EquipmentType = "20GP" | "40GP" | "40HC";

  type ContainerRequirement = {
    equipmentType: EquipmentType;
    quantity: number;
  };

  type Booking = {
    id: string;
    bookingNumber: string;
    customer: string;
    status: string;
    version: number;
    lastUpdated: string;
    portOfLoading: string;
    portOfDischarge: string;
    voyageId: string;
    vesselName: string;
    voyageNumber: string;
    cargoReadinessDate: string;
    containers: ContainerRequirement[];
    shipmentTerms: string;
    estimatedCharges: {
      total: number;
      currency: string;
    };
    specialInstructions?: string;
  };

  type BookingAmendmentDraft = {
    bookingId: string;
    baseVersion: number;
    portOfDischarge: string;
    voyageId: string;
    cargoReadinessDate: string;
    containers: ContainerRequirement[];
    specialInstructions?: string;
  };

  type VoyageOption = {
    id: string;
    vesselName: string;
    voyageNumber: string;
    portOfLoading: string;
    portOfDischarge: string;
    departureDate: string;
    cutOffDate: string;
    supports40HC: boolean;
  };

  type VoyageSearch = {
    portOfLoading: string;
    portOfDischarge: string;
    readinessDate: string;
    search: string;
  };

  type AssessAmendmentRequest = {
    bookingId: string;
    baseVersion: number;
    amendment: BookingAmendmentDraft;
  };

  type AmendmentImpact = {
    schedule: {
      feasible: boolean;
      warnings: string[];
    };
    equipment: {
      available: boolean;
      unavailableItems: string[];
    };
    charges: {
      currentTotal: number;
      revisedTotal: number;
      difference: number;
      currency: string;
      items: Array<{
        code: string;
        description: string;
        previousAmount: number;
        revisedAmount: number;
      }>;
    };
    approvals: Array<{
      code: string;
      reason: string;
    }>;
    validations: Array<{
      field?: string;
      severity: "info" | "warning" | "error";
      message: string;
    }>;
    assessmentVersion: string;
  };

  type SubmitAmendmentCommand = {
    bookingId: string;
    baseVersion: number;
    assessmentVersion: string;
    amendment: BookingAmendmentDraft;
    idempotencyKey: string;
  };

  type AmendmentSubmission = {
    id: string;
    status: "submitted" | "approved" | "rejected";
    idempotencyKey: string;
    alreadyProcessed: boolean;
  };

  type AmendmentSubmissionStatus = {
    id: string;
    status: AmendmentSubmission["status"];
  };

  type ApplicationError =
    | { type: "validation"; fields: Record<string, string[]> }
    | { type: "business-rule"; code: string; message: string }
    | { type: "conflict"; currentVersion: number }
    | { type: "network"; retryable: boolean }
    | { type: "unknown"; message: string };

  type BookingVersionConflictResponse = {
    code: "BOOKING_VERSION_CONFLICT";
    currentVersion: number;
    message: string;
  };

  type MockScenario =
    | "normal"
    | "validation"
    | "slow"
    | "conflict"
    | "timeout"
    | "unknown"
    | "duplicate"
    | "out-of-order";

  type BookingDto = Booking;
  type VoyageOptionDto = VoyageOption;
  type AmendmentImpactDto = AmendmentImpact;
  type AmendmentSubmissionDto = AmendmentSubmission;
  type AmendmentSubmissionStatusDto = AmendmentSubmissionStatus;
  type LatestBookingVersionDto = Pick<
    Booking,
    "id" | "version" | "lastUpdated"
  >;
  type AssessAmendmentRequestDto = AssessAmendmentRequest;
  type SubmitAmendmentCommandDto = SubmitAmendmentCommand;
}
