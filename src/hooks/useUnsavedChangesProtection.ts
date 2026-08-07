"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useUnsavedChangesProtection(isDirty: boolean) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const requestDiscard = useCallback(
    (onConfirm: () => void) => {
      if (!isDirty) {
        onConfirm();
        return;
      }

      pendingActionRef.current = onConfirm;
      setIsConfirmOpen(true);
    },
    [isDirty],
  );

  const cancelDiscard = useCallback(() => {
    pendingActionRef.current = null;
    setIsConfirmOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setIsConfirmOpen(false);
    action?.();
  }, []);

  return {
    isConfirmOpen,
    requestDiscard,
    confirmDiscard,
    cancelDiscard,
  };
}
