"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getSubmissionStatus } from "@/services";
import {
  ApiError,
  normalizeApiError,
  showSuccessMessage,
  showWarningMessage,
} from "@/services/errorHandling";

export function submissionStatusQueryKey(reference: string) {
  return ["amendment-submission-status", reference] as const;
}

export function useSubmissionStatus() {
  const [status, setStatus] = useState<AmendmentSubmissionStatus | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (reference: string) => getSubmissionStatus(reference),
  });

  const checkStatus = useCallback(
    async (reference: string): Promise<AmendmentSubmissionStatus | null> => {
      setError(null);

      try {
        const result = await mutateAsync(reference);
        setStatus(result);
        showSuccessMessage(
          `Submission ${result.id} · status ${result.status}`,
        );
        return result;
      } catch (caught) {
        const normalized = normalizeApiError(caught);
        setStatus(null);
        setError(normalized);
        showWarningMessage(
          normalized.reasons[0] ??
            normalized.message ??
            "Submission status is still unknown. You can retry safely with the same reference.",
        );
        return null;
      }
    },
    [mutateAsync],
  );

  const clearStatus = useCallback(() => {
    setStatus(null);
    setError(null);
  }, []);

  return {
    status,
    error,
    isChecking: isPending,
    checkStatus,
    clearStatus,
  };
}
