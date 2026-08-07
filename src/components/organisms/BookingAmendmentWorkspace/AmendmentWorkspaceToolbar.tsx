"use client";

import { Badge, Button, Card } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import type { SubmissionLifecycleStatus } from "@/hooks/useSubmitAmendment";
import type { WorkspaceFeedback } from "@/utils/bookingAmendmentWorkspaceFeedback";

export interface AmendmentWorkspaceToolbarProps {
  canEdit: boolean;
  isOnline: boolean;
  justReconnected: boolean;
  resultFeedback: WorkspaceFeedback | null;
  checkedSubmissionStatus: AmendmentSubmissionStatus | null;
  submissionStatus: SubmissionLifecycleStatus;
  isLoadingLatest: boolean;
  isSubmitting: boolean;
  isChecking: boolean;
  isCalculating: boolean;
  idempotencyKey: string | null;
  recalculateEnabled: boolean;
  submitEnabled: boolean;
  onLoadLatestBooking: () => void;
  onCheckStatus: () => void;
  onReturnToBooking: () => void;
  onRecalculate: () => void;
  onSubmit: () => void;
}

function AmendmentWorkspaceToolbar({
  canEdit,
  isOnline,
  justReconnected,
  resultFeedback,
  checkedSubmissionStatus,
  submissionStatus,
  isLoadingLatest,
  isSubmitting,
  isChecking,
  isCalculating,
  idempotencyKey,
  recalculateEnabled,
  submitEnabled,
  onLoadLatestBooking,
  onCheckStatus,
  onReturnToBooking,
  onRecalculate,
  onSubmit,
}: AmendmentWorkspaceToolbarProps) {
  return (
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
            onClick={onLoadLatestBooking}
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
              onClick={onCheckStatus}
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
            onClick={onRecalculate}
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
            onClick={onSubmit}
          >
            {submissionStatus === "unknown"
              ? "Retry submission"
              : "Submit amendment"}
          </Button>
        </PermissionGate>
      </div>
    </Card>
  );
}

AmendmentWorkspaceToolbar.displayName = "AmendmentWorkspaceToolbar";

export default AmendmentWorkspaceToolbar;
