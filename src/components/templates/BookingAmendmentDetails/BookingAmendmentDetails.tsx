"use client";

import { useState } from "react";
import { Button } from "@/components/atoms";
import { EmptyState, Modal } from "@/components/molecules";
import {
  BookingHeader,
  BookingAmendmentWorkspace,
} from "@/components/organisms";
import { BookingWorkspaceSkeleton } from "@/components/skeletons";
import { DEFAULT_BOOKING_ID } from "@/constants";
import {
  useBooking,
  useBookingAmendmentTelemetry,
  useUnsavedChangesProtection,
} from "@/hooks";
import { useAuth } from "@/providers";
import { ApiError } from "@/services/errorHandling";

export interface BookingAmendmentDetailsProps {
  bookingId?: string;
  onBack: () => void;
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
  useBookingAmendmentTelemetry(booking?.id);
  const [isDirty, setIsDirty] = useState(false);
  const { isConfirmOpen, requestDiscard, confirmDiscard, cancelDiscard } =
    useUnsavedChangesProtection(isDirty);
  const handleBack = () => requestDiscard(onBack);

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

  if (!booking) {
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
    <>
      <BookingHeader booking={booking} canEdit={canEdit} onBack={handleBack} />
      <BookingAmendmentWorkspace
        booking={booking}
        canEdit={canEdit}
        canSubmit={canSubmit}
        onDirtyChange={setIsDirty}
        onReturnToBooking={handleBack}
        requestDiscard={requestDiscard}
      />
      <Modal
        open={isConfirmOpen}
        onClose={cancelDiscard}
        title="Discard unsaved changes?"
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={cancelDiscard}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="primary-emphasis"
              onClick={confirmDiscard}
            >
              Discard changes
            </Button>
          </>
        }
      >
        You have unsaved amendment changes. Discard them to continue?
      </Modal>
    </>
  );
}

BookingAmendmentDetails.displayName = "BookingAmendmentDetails";

export default BookingAmendmentDetails;
