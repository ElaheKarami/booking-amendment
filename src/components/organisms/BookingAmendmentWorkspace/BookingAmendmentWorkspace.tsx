"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import { ImpactAssessmentPanelSkeleton } from "@/components/skeletons";
import AmendmentForm from "../AmendmentForm/AmendmentForm";
import {
  useImpactAssessment,
  useNetworkStatus,
  useReloadBooking,
  useSubmissionStatus,
  useSubmitAmendment,
} from "@/hooks";
import type { BookingAmendmentFormValues } from "@/schemas/bookingAmendmentSchema";
import {
  reportApiError,
  showWarningMessage,
} from "@/services/errorHandling";
import { bookingAmendmentDraftFromBooking } from "@/transformers/bookingAmendmentTransformer";
import { amendmentDraftFingerprint } from "@/utils/amendmentDraftFingerprint";

const ImpactAssessmentPanel = dynamic(
  () => import("../ImpactAssessmentPanel/ImpactAssessmentPanel"),
  {
    loading: () => <ImpactAssessmentPanelSkeleton />,
    ssr: false,
  },
);

export interface BookingAmendmentWorkspaceProps {
  booking: Booking;
  canEdit: boolean;
  canSubmit: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onReturnToBooking: () => void;
  requestDiscard: (onConfirm: () => void) => void;
}

function assessmentFeedback(
  status: ReturnType<typeof useImpactAssessment>["status"],
  errorMessage: string | undefined,
): { tone: "info" | "warning" | "error" | "success"; label: string } {
  switch (status) {
    case "calculating":
      return { tone: "info", label: "Calculating impact…" };
    case "valid":
      return { tone: "success", label: "Assessment matches the current draft" };
    case "stale":
      return {
        tone: "warning",
        label: "Draft changed — recalculate before submitting",
      };
    case "failed":
      return {
        tone: "error",
        label: errorMessage ?? "Assessment failed. Try recalculating.",
      };
    case "not-calculated":
    default:
      return {
        tone: "info",
        label: "Not calculated — run Recalculate to assess impact",
      };
  }
}

function submissionFeedback(
  status: ReturnType<typeof useSubmitAmendment>["status"],
  submission: AmendmentSubmission | null,
  errorMessage: string | undefined,
  idempotencyKey: string | null,
): { tone: "info" | "warning" | "error" | "success"; label: string } | null {
  switch (status) {
    case "submitting":
      return { tone: "info", label: "Submitting amendment…" };
    case "succeeded":
      return {
        tone: "success",
        label: submission?.id
          ? `Amendment accepted · ${submission.id}`
          : "Amendment accepted",
      };
    case "rejected":
      return {
        tone: "error",
        label: errorMessage ?? "Amendment rejected. The draft was preserved.",
      };
    case "conflict":
      return {
        tone: "warning",
        label:
          errorMessage ??
          "Booking changed by another user. Draft preserved — load latest and recalculate before retrying.",
      };
    case "unknown":
      return {
        tone: "warning",
        label: idempotencyKey
          ? `Submission status unknown · reference ${idempotencyKey}`
          : "Submission status unknown. Do not assume failure.",
      };
    case "idle":
    default:
      return null;
  }
}

function BookingAmendmentWorkspace({
  booking,
  canEdit,
  canSubmit,
  onDirtyChange,
  onReturnToBooking,
  requestDiscard,
}: BookingAmendmentWorkspaceProps) {
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
              defaultValues={formBaseline}
              baselineKey={baselineKey}
              portOfLoading={booking.portOfLoading}
              currentVoyageLabel={`${booking.vesselName} · ${booking.voyageNumber}`}
              disabled={!canEdit || isSubmitting || isLoadingLatest}
              onDirtyChange={onDirtyChange}
              onDraftChange={handleDraftChange}
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
          <div className="mt-4">
            <Badge tone={feedback.tone} aria-live="polite">
              {feedback.label}
            </Badge>
          </div>
          <ImpactAssessmentPanel
            impact={impact}
            stale={status === "stale"}
          />
        </Card>
      </div>

      <Card
        padded={false}
        className="flex flex-wrap items-center justify-between gap-3 border-border px-6 py-4"
      >
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-body-sm text-text-2">
            {canEdit
              ? "Unsaved changes are kept in the workspace until you submit."
              : "Toolbar actions follow your assigned roles."}
          </p>
          {!isOnline && (
            <Badge tone="warning" aria-live="polite">
              Offline — reconnect before submitting
            </Badge>
          )}
          {isOnline && justReconnected && (
            <Badge tone="info" aria-live="polite">
              Reconnected — recalculate before submitting
            </Badge>
          )}
          {resultFeedback && (
            <Badge tone={resultFeedback.tone} aria-live="polite">
              {resultFeedback.label}
            </Badge>
          )}
          {checkedSubmissionStatus && (
            <Badge tone="info" aria-live="polite">
              Checked status · {checkedSubmissionStatus.id} ·{" "}
              {checkedSubmissionStatus.status}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {submissionStatus === "conflict" && (
            <Button
              type="button"
              variant="secondary"
              disabled={isLoadingLatest || isSubmitting}
              isLoading={isLoadingLatest}
              onClick={handleLoadLatestBooking}
            >
              Load latest booking
            </Button>
          )}
          {submissionStatus === "unknown" && (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={!idempotencyKey || isChecking || isSubmitting}
                isLoading={isChecking}
                onClick={handleCheckStatus}
              >
                Check status
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onReturnToBooking}
              >
                Return to booking
              </Button>
            </>
          )}
          <PermissionGate
            permission="editAmendment"
            fallback={
              <Button type="button" variant="secondary" disabled>
                Recalculate
              </Button>
            }
          >
            <Button
              type="button"
              variant="secondary"
              disabled={!recalculateEnabled}
              isLoading={isCalculating}
              onClick={handleRecalculate}
            >
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
            <Button
              type="button"
              variant="primary"
              disabled={!submitEnabled}
              isLoading={isSubmitting}
              onClick={() => {
                void handleSubmit();
              }}
            >
              {submissionStatus === "unknown" ? "Retry submission" : "Submit amendment"}
            </Button>
          </PermissionGate>
        </div>
      </Card>
    </div>
  );
}

BookingAmendmentWorkspace.displayName = "BookingAmendmentWorkspace";

export default BookingAmendmentWorkspace;
