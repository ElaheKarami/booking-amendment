"use client";

import { Card } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import type { BookingAmendmentFormValues } from "@/schemas/bookingAmendmentSchema";
import AmendmentForm from "../AmendmentForm/AmendmentForm";

export interface AmendmentDetailsSectionProps {
  booking: Booking;
  formBaseline: BookingAmendmentFormValues;
  baselineKey: number;
  canEdit: boolean;
  disabled: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onDraftChange: (draft: BookingAmendmentFormValues) => void;
  requestDiscard: (onConfirm: () => void) => void;
}

function AmendmentDetailsSection({
  booking,
  formBaseline,
  baselineKey,
  canEdit,
  disabled,
  onDirtyChange,
  onDraftChange,
  requestDiscard,
}: AmendmentDetailsSectionProps) {
  return (
    <Card padded={false} className="border-border px-6 py-5">
      <h2 className="text-section text-text-1">Amendment details</h2>
      <p className="mt-1 text-body-sm text-text-2">
        Adjust discharge, voyage, and cargo fields before recalculating impact.
      </p>

      <PermissionGate
        permission="editAmendment"
        fallback={
          <p className="mt-4 text-body-sm text-text-2-strong">
            Your role can view this booking but cannot change amendment fields.
            Ask an operations user to prepare the draft.
          </p>
        }
      >
        <AmendmentForm
          defaultValues={formBaseline}
          baselineKey={baselineKey}
          portOfLoading={booking.portOfLoading}
          currentVoyageLabel={`${booking.vesselName} · ${booking.voyageNumber}`}
          disabled={!canEdit || disabled}
          onDirtyChange={onDirtyChange}
          onDraftChange={onDraftChange}
          requestDiscard={requestDiscard}
        />
      </PermissionGate>
    </Card>
  );
}

AmendmentDetailsSection.displayName = "AmendmentDetailsSection";

export default AmendmentDetailsSection;
