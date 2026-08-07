"use client";

import { useBookingAmendmentWorkspace } from "@/hooks";
import AmendmentDetailsSection from "./AmendmentDetailsSection";
import AmendmentWorkspaceToolbar from "./AmendmentWorkspaceToolbar";
import ImpactAssessmentSection from "./ImpactAssessmentSection";

export interface BookingAmendmentWorkspaceProps {
  booking: Booking;
  canEdit: boolean;
  canSubmit: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onReturnToBooking: () => void;
  requestDiscard: (onConfirm: () => void) => void;
}

function BookingAmendmentWorkspace({
  booking,
  canEdit,
  canSubmit,
  onDirtyChange,
  onReturnToBooking,
  requestDiscard,
}: BookingAmendmentWorkspaceProps) {
  const {
    formBaseline,
    baselineKey,
    assessmentStatus,
    impact,
    feedback,
    resultFeedback,
    checkedSubmissionStatus,
    submissionStatus,
    isOnline,
    justReconnected,
    isCalculating,
    isSubmitting,
    isLoadingLatest,
    isChecking,
    idempotencyKey,
    submitEnabled,
    recalculateEnabled,
    handleDraftChange,
    handleRecalculate,
    handleSubmit,
    handleLoadLatestBooking,
    handleCheckStatus,
  } = useBookingAmendmentWorkspace({
    booking,
    canEdit,
    canSubmit,
    onDirtyChange,
    requestDiscard,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AmendmentDetailsSection
          booking={booking}
          formBaseline={formBaseline}
          baselineKey={baselineKey}
          canEdit={canEdit}
          disabled={isSubmitting || isLoadingLatest}
          onDirtyChange={onDirtyChange}
          onDraftChange={handleDraftChange}
          requestDiscard={requestDiscard}
        />
        <ImpactAssessmentSection
          impact={impact}
          assessmentStatus={assessmentStatus}
          feedback={feedback}
        />
      </div>

      <AmendmentWorkspaceToolbar
        canEdit={canEdit}
        isOnline={isOnline}
        justReconnected={justReconnected}
        resultFeedback={resultFeedback}
        checkedSubmissionStatus={checkedSubmissionStatus}
        submissionStatus={submissionStatus}
        isLoadingLatest={isLoadingLatest}
        isSubmitting={isSubmitting}
        isChecking={isChecking}
        isCalculating={isCalculating}
        idempotencyKey={idempotencyKey}
        recalculateEnabled={recalculateEnabled}
        submitEnabled={submitEnabled}
        onLoadLatestBooking={handleLoadLatestBooking}
        onCheckStatus={handleCheckStatus}
        onReturnToBooking={onReturnToBooking}
        onRecalculate={handleRecalculate}
        onSubmit={() => {
          void handleSubmit();
        }}
      />
    </div>
  );
}

BookingAmendmentWorkspace.displayName = "BookingAmendmentWorkspace";

export default BookingAmendmentWorkspace;
