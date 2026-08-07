"use client";

import { useState } from "react";
import { Button, Card } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import AmendmentForm from "../AmendmentForm/AmendmentForm";
import { bookingAmendmentDraftFromBooking } from "@/transformers/bookingAmendmentTransformer";

export interface BookingAmendmentWorkspaceProps {
  booking: Booking;
  canEdit: boolean;
  canSubmit: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  requestDiscard: (onConfirm: () => void) => void;
}

function BookingAmendmentWorkspace({
  booking,
  canEdit,
  canSubmit,
  onDirtyChange,
  requestDiscard,
}: BookingAmendmentWorkspaceProps) {
  const [draft] = useState(() => bookingAmendmentDraftFromBooking(booking));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card padded={false} className="border-border px-6 py-5">
          <h2 className="text-section text-text-1">Amendment details</h2>
          <p className="mt-1 text-body-sm text-text-2">
            Adjust discharge, voyage, and cargo fields before recalculating
            impact.
          </p>

          <PermissionGate
            permission="editAmendment"
            fallback={
              <p className="mt-4 text-body-sm text-text-2-strong">
                Your role can view this booking but cannot change amendment
                fields. Ask an operations user to prepare the draft.
              </p>
            }
          >
            <AmendmentForm
              defaultValues={draft}
              portOfLoading={booking.portOfLoading}
              currentVoyageLabel={`${booking.vesselName} · ${booking.voyageNumber}`}
              disabled={!canEdit}
              onDirtyChange={onDirtyChange}
              requestDiscard={requestDiscard}
            />
          </PermissionGate>
        </Card>

        <Card padded={false} className="border-border px-6 py-5">
          <h2 className="text-section text-text-1">Impact assessment</h2>
          <p className="mt-1 text-body-sm text-text-2">
            Run Recalculate to view schedule, equipment, and charge impacts for
            the current draft.
          </p>
        </Card>
      </div>

      <Card
        padded={false}
        className="flex flex-wrap items-center justify-between gap-3 border-border px-6 py-4"
      >
        <p className="text-body-sm text-text-2">
          {canEdit
            ? "Unsaved changes are kept in the workspace until you submit."
            : "Toolbar actions follow your assigned roles."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate
            permission="editAmendment"
            fallback={
              <Button type="button" variant="secondary" disabled>
                Recalculate
              </Button>
            }
          >
            <Button type="button" variant="secondary" disabled={!canEdit}>
              Recalculate
            </Button>
          </PermissionGate>
          <PermissionGate
            permission="submitAmendment"
            fallback={
              <Button type="button" variant="primary" disabled>
                Submit amendment
              </Button>
            }
          >
            <Button type="button" variant="primary" disabled={!canSubmit}>
              Submit amendment
            </Button>
          </PermissionGate>
        </div>
      </Card>
    </div>
  );
}

BookingAmendmentWorkspace.displayName = "BookingAmendmentWorkspace";

export default BookingAmendmentWorkspace;
