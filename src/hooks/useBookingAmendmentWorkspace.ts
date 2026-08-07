"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BookingAmendmentFormValues } from "@/schemas/bookingAmendmentSchema";
import {
  reportApiError,
  showWarningMessage,
} from "@/services/errorHandling";
import { bookingAmendmentDraftFromBooking } from "@/transformers/bookingAmendmentTransformer";
import { amendmentDraftFingerprint } from "@/utils/amendmentDraftFingerprint";
import {
  assessmentFeedback,
  submissionFeedback,
} from "@/utils/bookingAmendmentWorkspaceFeedback";
import { useImpactAssessment } from "./useImpactAssessment";
import { useNetworkStatus } from "./useNetworkStatus";
import { useReloadBooking } from "./useReloadBooking";
import { useSubmissionStatus } from "./useSubmissionStatus";
import { useSubmitAmendment } from "./useSubmitAmendment";

export type UseBookingAmendmentWorkspaceArgs = {
  booking: Booking;
  canEdit: boolean;
  canSubmit: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  requestDiscard: (onConfirm: () => void) => void;
};

export function useBookingAmendmentWorkspace({
  booking,
  canEdit,
  canSubmit,
  onDirtyChange,
  requestDiscard,
}: UseBookingAmendmentWorkspaceArgs) {
  const [formBaseline, setFormBaseline] = useState(() =>
    bookingAmendmentDraftFromBooking(booking),
  );
  const [baselineKey, setBaselineKey] = useState(0);
  const [draft, setDraft] = useState<BookingAmendmentDraft>(formBaseline);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const draftFingerprintRef = useRef(amendmentDraftFingerprint(formBaseline));
  const previousOnlineRef = useRef(true);
  const reloadBooking = useReloadBooking();
  const {
    isOnline,
    justReconnected,
    acknowledgeReconnect,
  } = useNetworkStatus();
  const {
    status,
    impact,
    error,
    isCalculating,
    canSubmitAssessment,
    syncDraft,
    markStale,
    recalculate,
  } = useImpactAssessment();
  const {
    status: submissionStatus,
    submission,
    error: submissionError,
    idempotencyKey,
    isSubmitting,
    submit,
    clearOutcome,
  } = useSubmitAmendment();
  const {
    status: checkedSubmissionStatus,
    isChecking,
    checkStatus,
    clearStatus,
  } = useSubmissionStatus();

  useEffect(() => {
    const wasOnline = previousOnlineRef.current;
    previousOnlineRef.current = isOnline;

    if (wasOnline && !isOnline) {
      // A retained assessment is never current just because it still exists.
      markStale();
    }
  }, [isOnline, markStale]);

  const reconnectNotifiedRef = useRef(false);

  useEffect(() => {
    if (!justReconnected || reconnectNotifiedRef.current) return;

    reconnectNotifiedRef.current = true;
    showWarningMessage(
      "Connection restored. Recalculate impact before submitting — a previous assessment is not current.",
    );
  }, [justReconnected]);

  useEffect(() => {
    if (!isOnline) {
      reconnectNotifiedRef.current = false;
    }
  }, [isOnline]);

  const handleDraftChange = useCallback(
    (next: BookingAmendmentFormValues) => {
      const fingerprint = amendmentDraftFingerprint(next);
      setDraft(next);
      syncDraft(next);

      if (fingerprint !== draftFingerprintRef.current) {
        draftFingerprintRef.current = fingerprint;
        clearOutcome();
        clearStatus();
      }
    },
    [clearOutcome, clearStatus, syncDraft],
  );

  const handleRecalculate = useCallback(() => {
    if (!isOnline) return;
    acknowledgeReconnect();
    void recalculate(draft);
  }, [acknowledgeReconnect, draft, isOnline, recalculate]);

  const handleSubmit = useCallback(async () => {
    if (!impact?.assessmentVersion) return;
    if (!isOnline) return;

    const outcome = await submit({
      draft,
      assessmentVersion: impact.assessmentVersion,
    });

    if (outcome !== "succeeded") return;

    setFormBaseline(draft);
    setBaselineKey((key) => key + 1);
    onDirtyChange?.(false);
  }, [draft, impact, isOnline, onDirtyChange, submit]);

  const applyLatestBooking = useCallback(async () => {
    setIsLoadingLatest(true);

    try {
      const latest = await reloadBooking(booking.id);
      const conflictVersion =
        submissionError?.applicationError.type === "conflict"
          ? submissionError.applicationError.currentVersion
          : undefined;
      const nextVersion = Math.max(
        latest.version,
        conflictVersion ?? latest.version,
      );
      const nextDraft: BookingAmendmentDraft = {
        ...draft,
        bookingId: latest.id,
        baseVersion: nextVersion,
      };

      setFormBaseline((previous) => ({
        ...previous,
        bookingId: latest.id,
        baseVersion: nextVersion,
      }));
      setDraft(nextDraft);
      draftFingerprintRef.current = amendmentDraftFingerprint(nextDraft);
      syncDraft(nextDraft);
      markStale();
      clearOutcome();
      clearStatus();
      showWarningMessage(
        `Loaded booking version ${nextVersion}. Recalculate before submitting.`,
      );
    } catch (caught) {
      reportApiError(caught, { forceShow: true });
    } finally {
      setIsLoadingLatest(false);
    }
  }, [
    booking.id,
    clearOutcome,
    clearStatus,
    draft,
    markStale,
    reloadBooking,
    submissionError,
    syncDraft,
  ]);

  const handleLoadLatestBooking = useCallback(() => {
    requestDiscard(() => {
      void applyLatestBooking();
    });
  }, [applyLatestBooking, requestDiscard]);

  const handleCheckStatus = useCallback(() => {
    if (!idempotencyKey) return;
    void checkStatus(idempotencyKey);
  }, [checkStatus, idempotencyKey]);

  const feedback = assessmentFeedback(
    status,
    error?.reasons[0] ?? error?.message,
  );
  const resultFeedback = submissionFeedback(
    submissionStatus,
    submission,
    submissionError?.reasons[0] ?? submissionError?.message,
    idempotencyKey,
  );
  const submitEnabled =
    canSubmit &&
    canSubmitAssessment &&
    isOnline &&
    !isSubmitting &&
    submissionStatus !== "succeeded";
  const recalculateEnabled =
    canEdit && isOnline && !isCalculating && !isSubmitting && !isLoadingLatest;

  return {
    formBaseline,
    baselineKey,
    assessmentStatus: status,
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
  };
}
