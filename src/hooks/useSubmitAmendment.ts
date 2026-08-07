"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TELEMETRY_EVENTS } from "@/constants";
import { track } from "@/lib/telemetry";
import { submitAmendment } from "@/services";
import {
  ApiError,
  normalizeApiError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
} from "@/services/errorHandling";

export type SubmissionLifecycleStatus =
  "idle" | "submitting" | "succeeded" | "rejected" | "conflict" | "unknown";

export type SubmitAmendmentInput = {
  draft: BookingAmendmentDraft;
  assessmentVersion: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function classifySubmissionError(
  error: ApiError,
): Exclude<SubmissionLifecycleStatus, "idle" | "submitting" | "succeeded"> {
  const type = error.applicationError.type;

  if (type === "conflict") {
    return "conflict";
  }

  if (type === "unknown" || type === "network") {
    return "unknown";
  }

  return "rejected";
}

function notifySubmissionOutcome(
  status: Exclude<SubmissionLifecycleStatus, "idle" | "submitting">,
  submission: AmendmentSubmission | null,
  error: ApiError | null,
  idempotencyKey: string,
): void {
  switch (status) {
    case "succeeded":
      showSuccessMessage(
        submission?.id
          ? `Amendment accepted · ${submission.id}`
          : "Amendment accepted",
      );
      return;
    case "rejected":
      showErrorMessage(
        error?.reasons[0] ??
          error?.message ??
          "Amendment rejected. The draft was preserved.",
        { forceShow: true },
      );
      return;
    case "conflict":
      showWarningMessage(
        error?.reasons[0] ??
          error?.message ??
          "Booking changed by another user. Draft preserved — recalculate before retrying.",
      );
      return;
    case "unknown":
      showWarningMessage(
        `Submission status unknown · reference ${idempotencyKey}`,
      );
      return;
  }
}

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function safeSubmissionContext(
  draft: BookingAmendmentDraft,
  extras?: TelemetryProperties,
): TelemetryProperties {
  return {
    bookingId: draft.bookingId,
    baseVersion: draft.baseVersion,
    ...extras,
  };
}

export function useSubmitAmendment() {
  const [status, setStatus] = useState<SubmissionLifecycleStatus>("idle");
  const [submission, setSubmission] = useState<AmendmentSubmission | null>(
    null,
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const { mutateAsync } = useMutation({
    mutationFn: ({
      command,
      signal,
    }: {
      command: SubmitAmendmentCommand;
      signal: AbortSignal;
    }) => submitAmendment(command, { signal }),
  });

  const clearOutcome = useCallback(() => {
    if (inFlightRef.current) return;

    setStatus("idle");
    setSubmission(null);
    setError(null);
    idempotencyKeyRef.current = null;
    setIdempotencyKey(null);
  }, []);

  const submit = useCallback(
    async ({
      draft,
      assessmentVersion,
    }: SubmitAmendmentInput): Promise<SubmissionLifecycleStatus> => {
      if (inFlightRef.current) {
        return "submitting";
      }

      if (isBrowserOffline()) {
        showWarningMessage("Offline — reconnect before submitting");
        return status === "unknown" ? "unknown" : "idle";
      }

      const reuseKey =
        status === "unknown" && Boolean(idempotencyKeyRef.current);
      const nextKey = reuseKey
        ? (idempotencyKeyRef.current as string)
        : createIdempotencyKey();

      idempotencyKeyRef.current = nextKey;
      inFlightRef.current = true;
      setIdempotencyKey(nextKey);
      setStatus("submitting");
      setError(null);
      setSubmission(null);
      track(
        TELEMETRY_EVENTS.AMENDMENT_SUBMISSION_STARTED,
        safeSubmissionContext(draft, { status: "submitting" }),
      );

      const command: SubmitAmendmentCommand = {
        bookingId: draft.bookingId,
        baseVersion: draft.baseVersion,
        assessmentVersion,
        amendment: draft,
        idempotencyKey: nextKey,
      };

      const controller = new AbortController();
      const handleOffline = () => {
        controller.abort();
      };

      if (typeof window !== "undefined") {
        window.addEventListener("offline", handleOffline);
      }

      try {
        const result = await mutateAsync({
          command,
          signal: controller.signal,
        });

        if (controller.signal.aborted || isBrowserOffline()) {
          setSubmission(null);
          setStatus("unknown");
          setError(null);
          track(
            TELEMETRY_EVENTS.AMENDMENT_SUBMISSION_UNKNOWN,
            safeSubmissionContext(draft, { status: "unknown" }),
          );
          notifySubmissionOutcome("unknown", null, null, nextKey);
          return "unknown";
        }

        if (result.status === "rejected") {
          const rejectionError = new ApiError(
            "The amendment was rejected.",
            422,
            ["The amendment was rejected."],
          );
          setSubmission(result);
          setStatus("rejected");
          setError(rejectionError);
          notifySubmissionOutcome("rejected", result, rejectionError, nextKey);
          return "rejected";
        }

        setSubmission(result);
        setStatus("succeeded");
        setError(null);
        track(
          TELEMETRY_EVENTS.AMENDMENT_SUBMISSION_SUCCEEDED,
          safeSubmissionContext(draft, { status: "succeeded" }),
        );
        notifySubmissionOutcome("succeeded", result, null, nextKey);
        return "succeeded";
      } catch (caught) {
        if (controller.signal.aborted || isBrowserOffline()) {
          setSubmission(null);
          setStatus("unknown");
          setError(null);
          track(
            TELEMETRY_EVENTS.AMENDMENT_SUBMISSION_UNKNOWN,
            safeSubmissionContext(draft, { status: "unknown" }),
          );
          notifySubmissionOutcome("unknown", null, null, nextKey);
          return "unknown";
        }

        const normalized = normalizeApiError(caught);
        const nextStatus = classifySubmissionError(normalized);
        setError(normalized);
        setSubmission(null);
        setStatus(nextStatus);

        if (nextStatus === "conflict") {
          track(
            TELEMETRY_EVENTS.AMENDMENT_VERSION_CONFLICT,
            safeSubmissionContext(draft, {
              status: "conflict",
              httpStatus: normalized.status,
              errorType: normalized.applicationError.type,
            }),
          );
        } else if (nextStatus === "unknown") {
          track(
            TELEMETRY_EVENTS.AMENDMENT_SUBMISSION_UNKNOWN,
            safeSubmissionContext(draft, {
              status: "unknown",
              httpStatus: normalized.status,
              errorType: normalized.applicationError.type,
            }),
          );
        }

        notifySubmissionOutcome(nextStatus, null, normalized, nextKey);
        return nextStatus;
      } finally {
        if (typeof window !== "undefined") {
          window.removeEventListener("offline", handleOffline);
        }
        inFlightRef.current = false;
      }
    },
    [mutateAsync, status],
  );

  return {
    status,
    submission,
    error,
    idempotencyKey,
    isSubmitting: status === "submitting",
    submit,
    clearOutcome,
  };
}
