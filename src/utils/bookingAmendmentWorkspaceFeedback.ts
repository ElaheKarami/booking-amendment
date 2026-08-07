import type { AssessmentLifecycleStatus } from "@/hooks/useImpactAssessment";
import type { SubmissionLifecycleStatus } from "@/hooks/useSubmitAmendment";

export type WorkspaceFeedbackTone = "info" | "warning" | "error" | "success";

export type WorkspaceFeedback = {
  tone: WorkspaceFeedbackTone;
  label: string;
};

export function assessmentFeedback(
  status: AssessmentLifecycleStatus,
  errorMessage: string | undefined,
): WorkspaceFeedback {
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

export function submissionFeedback(
  status: SubmissionLifecycleStatus,
  submission: AmendmentSubmission | null,
  errorMessage: string | undefined,
  idempotencyKey: string | null,
): WorkspaceFeedback | null {
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
