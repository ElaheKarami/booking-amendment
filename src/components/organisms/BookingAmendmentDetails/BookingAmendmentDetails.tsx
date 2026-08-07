"use client";

import { useMemo } from "react";
import { Badge, Button, Card, TextField, TextItem } from "@/components/atoms";
import { EmptyState, PermissionGate } from "@/components/molecules";
import { BookingWorkspaceSkeleton } from "@/components/skeletons";
import { DEFAULT_BOOKING_ID } from "@/constants";
import { useBooking } from "@/hooks";
import { ApiError } from "@/services/errorHandling";
import { bookingAmendmentDraftFromBooking } from "@/transformers/bookingAmendmentTransformer";
import { useAuth } from "@/providers";
import type { BadgeTone } from "@/components/atoms";

interface BookingAmendmentDetailsProps {
  bookingId?: string;
  onBack: () => void;
}

function formatLastUpdated(iso: string): string {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));

  return `${formatted} UTC`;
}

function formatContainers(containers: ContainerRequirement[]): string {
  return containers
    .map((container) => `${container.quantity} × ${container.equipmentType}`)
    .join(", ");
}

function statusTone(status: string): BadgeTone {
  const normalized = status.toLowerCase();

  if (normalized.includes("confirm")) return "success";
  if (normalized.includes("pending")) return "warning";
  if (normalized.includes("cancel")) return "error";

  return "info";
}

function BookingAmendmentDetails({
  bookingId = DEFAULT_BOOKING_ID,
  onBack,
}: BookingAmendmentDetailsProps) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("editAmendment");
  const canSubmit = hasPermission("submitAmendment");
  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useBooking(bookingId);
  const draft = useMemo(
    () => (booking ? bookingAmendmentDraftFromBooking(booking) : null),
    [booking],
  );

  if (isLoading) {
    return <BookingWorkspaceSkeleton />;
  }

  if (isError) {
    const apiError = error instanceof ApiError ? error : null;
    const isNotFound = apiError?.status === 404;
    const message =
      apiError?.reasons[0] ??
      apiError?.message ??
      "Unable to load the booking.";

    return (
      <EmptyState
        title={isNotFound ? "Booking not found" : "Unable to load booking"}
        description={message}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="secondary" onClick={onBack}>
              Back to workspace
            </Button>
            {!isNotFound && (
              <Button type="button" variant="primary" onClick={() => refetch()}>
                Try again
              </Button>
            )}
          </div>
        }
      />
    );
  }

  if (!booking || !draft) {
    return (
      <EmptyState
        title="Booking not found"
        description="The requested booking could not be loaded."
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Back to workspace
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        padded={false}
        className="flex flex-wrap items-start justify-between gap-4 border-border px-6 py-5"
      >
        <div className="w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-auto"
          >
            ← Back to workspace
          </Button>
          <h1 className="text-heading-2 text-text-1 my-3">Booking Details</h1>

          <Card className="flex flex-col lg:flex-row gap-3 lg:gap-6 w-full mb-4">
            <TextItem
              title="Booking Request No."
              text={booking.bookingNumber}
            />
            <TextItem
              title="Booking Status"
              text={
                <Badge tone={statusTone(booking.status)}>
                  {booking.status}
                </Badge>
              }
            />
            <TextItem title="Version" text={`v${booking.version}`} />
            <TextItem
              title="Last Updated"
              text={formatLastUpdated(booking.lastUpdated)}
            />
          </Card>
          <p className="text-body-sm text-text-2">
            Review amendment fields, recalculate impact, then submit when ready.
          </p>
        </div>
        {!canEdit && <Badge tone="warning">View only</Badge>}
      </Card>

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
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                id="port-of-discharge"
                label="Port of discharge"
                defaultValue={draft.portOfDischarge}
                disabled={!canEdit}
                readOnly
              />
              <TextField
                id="voyage"
                label="Planned voyage"
                defaultValue={booking.voyageNumber}
                disabled={!canEdit}
                readOnly
              />
              <TextField
                id="cargo-readiness"
                label="Cargo readiness date"
                type="date"
                defaultValue={draft.cargoReadinessDate}
                disabled={!canEdit}
                readOnly
              />
              <TextField
                id="containers"
                label="Containers"
                defaultValue={formatContainers(draft.containers)}
                disabled={!canEdit}
                readOnly
              />
              <TextField
                id="special-instructions"
                label="Special instructions"
                defaultValue={draft.specialInstructions ?? ""}
                containerClassName="sm:col-span-2"
                disabled={!canEdit}
                readOnly
              />
            </div>
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

BookingAmendmentDetails.displayName = "BookingAmendmentDetails";

export default BookingAmendmentDetails;
