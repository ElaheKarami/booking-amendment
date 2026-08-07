"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TELEMETRY_EVENTS } from "@/constants";
import { captureError, track } from "@/lib/telemetry";
import { assessAmendment } from "@/services";
import { ApiError, normalizeApiError } from "@/services/errorHandling";
import { amendmentDraftFingerprint } from "@/utils/amendmentDraftFingerprint";

export type AssessmentLifecycleStatus =
  "not-calculated" | "calculating" | "valid" | "stale" | "failed";

type ActiveAssessmentRequest = {
  id: number;
  fingerprint: string;
  controller: AbortController;
};

function safeAssessmentContext(
  draft: BookingAmendmentDraft,
  extras?: TelemetryProperties,
): TelemetryProperties {
  return {
    bookingId: draft.bookingId,
    baseVersion: draft.baseVersion,
    ...extras,
  };
}

export function useImpactAssessment() {
  const [status, setStatus] =
    useState<AssessmentLifecycleStatus>("not-calculated");
  const [impact, setImpact] = useState<AmendmentImpact | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const assessedFingerprintRef = useRef<string | null>(null);
  const impactRef = useRef<AmendmentImpact | null>(null);
  const activeRequestRef = useRef<ActiveAssessmentRequest | null>(null);
  const requestCounterRef = useRef(0);
  const lastDraftFingerprintRef = useRef<string | null>(null);
  const statusRef = useRef<AssessmentLifecycleStatus>("not-calculated");

  const setAssessmentStatus = useCallback(
    (next: AssessmentLifecycleStatus) => {
      statusRef.current = next;
      setStatus(next);
    },
    [],
  );

  const { mutateAsync } = useMutation({
    mutationFn: ({
      request,
      signal,
    }: {
      request: AssessAmendmentRequest;
      signal: AbortSignal;
    }) => assessAmendment(request, { signal }),
  });

  const abortActiveRequest = useCallback(() => {
    const active = activeRequestRef.current;
    if (!active) return;
    active.controller.abort();
    activeRequestRef.current = null;
  }, []);

  const emitStaleIfNeeded = useCallback(
    (context?: TelemetryProperties) => {
      if (statusRef.current === "stale") return;
      track(TELEMETRY_EVENTS.ASSESSMENT_BECAME_STALE, {
        status: "stale",
        ...context,
      });
    },
    [],
  );

  const syncDraft = useCallback(
    (draft: BookingAmendmentDraft) => {
      const fingerprint = amendmentDraftFingerprint(draft);
      const previousFingerprint = lastDraftFingerprintRef.current;

      if (
        previousFingerprint !== null &&
        previousFingerprint !== fingerprint
      ) {
        track(
          TELEMETRY_EVENTS.BOOKING_AMENDMENT_CHANGED,
          safeAssessmentContext(draft),
        );
      }
      lastDraftFingerprintRef.current = fingerprint;

      const assessedFingerprint = assessedFingerprintRef.current;

      if (assessedFingerprint === fingerprint) {
        if (impactRef.current) {
          setAssessmentStatus("valid");
          setError(null);
        }
        return;
      }

      if (activeRequestRef.current) {
        abortActiveRequest();
      }

      if (!assessedFingerprint) {
        setAssessmentStatus("not-calculated");
        setError(null);
        return;
      }

      if (impactRef.current) {
        emitStaleIfNeeded(safeAssessmentContext(draft));
        setAssessmentStatus("stale");
      } else {
        setAssessmentStatus("not-calculated");
      }
      setError(null);
    },
    [abortActiveRequest, emitStaleIfNeeded, setAssessmentStatus],
  );

  const markStale = useCallback(() => {
    if (activeRequestRef.current) {
      abortActiveRequest();
    }

    if (!impactRef.current) {
      assessedFingerprintRef.current = null;
      setAssessmentStatus("not-calculated");
      setError(null);
      return;
    }

    // Keep the last result visible, but invalidate the assessed fingerprint so
    // later syncDraft calls cannot restore "valid" until recalculate succeeds.
    if (assessedFingerprintRef.current) {
      assessedFingerprintRef.current = `invalidated:${assessedFingerprintRef.current}`;
    }
    emitStaleIfNeeded();
    setAssessmentStatus("stale");
    setError(null);
  }, [abortActiveRequest, emitStaleIfNeeded, setAssessmentStatus]);

  const recalculate = useCallback(
    async (draft: BookingAmendmentDraft) => {
      abortActiveRequest();

      const fingerprint = amendmentDraftFingerprint(draft);
      const controller = new AbortController();
      const requestId = requestCounterRef.current + 1;
      requestCounterRef.current = requestId;
      activeRequestRef.current = {
        id: requestId,
        fingerprint,
        controller,
      };

      setAssessmentStatus("calculating");
      setError(null);
      track(
        TELEMETRY_EVENTS.IMPACT_ASSESSMENT_REQUESTED,
        safeAssessmentContext(draft, { status: "calculating" }),
      );

      try {
        const result = await mutateAsync({
          request: {
            bookingId: draft.bookingId,
            baseVersion: draft.baseVersion,
            amendment: draft,
          },
          signal: controller.signal,
        });

        const active = activeRequestRef.current;
        if (!active || active.id !== requestId) return;
        if (active.fingerprint !== fingerprint) return;

        assessedFingerprintRef.current = fingerprint;
        lastDraftFingerprintRef.current = fingerprint;
        impactRef.current = result;
        setImpact(result);
        setAssessmentStatus("valid");
        setError(null);
        activeRequestRef.current = null;
        track(
          TELEMETRY_EVENTS.IMPACT_ASSESSMENT_SUCCEEDED,
          safeAssessmentContext(draft, { status: "valid" }),
        );
      } catch (caught) {
        if (controller.signal.aborted) return;

        const active = activeRequestRef.current;
        if (!active || active.id !== requestId) return;

        const normalized = normalizeApiError(caught);
        setError(normalized);
        setAssessmentStatus("failed");
        activeRequestRef.current = null;
        const failureContext = safeAssessmentContext(draft, {
          status: "failed",
          httpStatus: normalized.status,
          errorType: normalized.applicationError.type,
        });
        track(TELEMETRY_EVENTS.IMPACT_ASSESSMENT_FAILED, failureContext);
        captureError(normalized, failureContext);
      }
    },
    [abortActiveRequest, mutateAsync, setAssessmentStatus],
  );

  const hasBlockingValidation = Boolean(
    impact?.validations.some((validation) => validation.severity === "error"),
  );

  return {
    status,
    impact,
    error,
    isCalculating: status === "calculating",
    hasBlockingValidation,
    canSubmitAssessment: status === "valid" && !hasBlockingValidation,
    syncDraft,
    markStale,
    recalculate,
  };
}
