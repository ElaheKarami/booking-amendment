"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

export function useImpactAssessment() {
  const [status, setStatus] =
    useState<AssessmentLifecycleStatus>("not-calculated");
  const [impact, setImpact] = useState<AmendmentImpact | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const assessedFingerprintRef = useRef<string | null>(null);
  const impactRef = useRef<AmendmentImpact | null>(null);
  const activeRequestRef = useRef<ActiveAssessmentRequest | null>(null);
  const requestCounterRef = useRef(0);

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

  const syncDraft = useCallback(
    (draft: BookingAmendmentDraft) => {
      const fingerprint = amendmentDraftFingerprint(draft);
      const assessedFingerprint = assessedFingerprintRef.current;

      if (assessedFingerprint === fingerprint) {
        if (impactRef.current) {
          setStatus("valid");
          setError(null);
        }
        return;
      }

      if (activeRequestRef.current) {
        abortActiveRequest();
      }

      if (!assessedFingerprint) {
        setStatus("not-calculated");
        setError(null);
        return;
      }

      setStatus(impactRef.current ? "stale" : "not-calculated");
      setError(null);
    },
    [abortActiveRequest],
  );

  const markStale = useCallback(() => {
    if (activeRequestRef.current) {
      abortActiveRequest();
    }

    if (!impactRef.current) {
      assessedFingerprintRef.current = null;
      setStatus("not-calculated");
      setError(null);
      return;
    }

    // Keep the last result visible, but invalidate the assessed fingerprint so
    // later syncDraft calls cannot restore "valid" until recalculate succeeds.
    if (assessedFingerprintRef.current) {
      assessedFingerprintRef.current = `invalidated:${assessedFingerprintRef.current}`;
    }
    setStatus("stale");
    setError(null);
  }, [abortActiveRequest]);

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

      setStatus("calculating");
      setError(null);

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
        impactRef.current = result;
        setImpact(result);
        setStatus("valid");
        setError(null);
        activeRequestRef.current = null;
      } catch (caught) {
        if (controller.signal.aborted) return;

        const active = activeRequestRef.current;
        if (!active || active.id !== requestId) return;

        const normalized = normalizeApiError(caught);
        setError(normalized);
        setStatus("failed");
        activeRequestRef.current = null;
      }
    },
    [abortActiveRequest, mutateAsync],
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
