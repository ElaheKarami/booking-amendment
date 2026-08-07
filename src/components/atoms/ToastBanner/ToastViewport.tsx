"use client";

import { useSyncExternalStore } from "react";
import clsx from "@/utils/clsx";
import ToastBanner from "./ToastBanner";
import { dismissMessage, getToasts, subscribeToasts } from "./showMessage";

export interface ToastViewportProps {
  className?: string;
}

// Fixed top-center container for the live toast stack (z-toast, motion-emphasis).
// Mount once at the app root; drive via showMessage().
export default function ToastViewport({ className }: ToastViewportProps) {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className={clsx(
        "fixed left-1/2 top-4 z-toast flex w-full max-w-[540px] -translate-x-1/2 flex-col items-center gap-3 px-4",
        "pointer-events-none",
        className,
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full motion-safe:animate-toast-in"
        >
          <ToastBanner
            type={toast.type}
            description={toast.description}
            linkHref={toast.linkHref}
            linkText={toast.linkText}
            onClose={() => dismissMessage(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

ToastViewport.displayName = "ToastViewport";
