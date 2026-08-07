"use client";

import { Button } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import {
  BookingHeader,
  BookingAmendmentWorkspace,
} from "@/components/organisms";
import { BookingWorkspaceSkeleton } from "@/components/skeletons";
import { DEFAULT_BOOKING_ID } from "@/constants";
import { useBooking } from "@/hooks";
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
      <BookingHeader booking={booking} canEdit={canEdit} onBack={onBack} />
      <BookingAmendmentWorkspace
        booking={booking}
        canEdit={canEdit}
        canSubmit={canSubmit}
        onBack={onBack}
      />
    </>
  );
}

BookingAmendmentDetails.displayName = "BookingAmendmentDetails";

export default BookingAmendmentDetails;
