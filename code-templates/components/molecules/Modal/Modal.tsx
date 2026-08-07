"use client";

import { useEffect, useRef, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "@erp/utils/clsx";
import { CloseIcon } from "../../icons";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
}

// FLAG: Modal is not designed in design.md — scaffolded with elevation-4 + z-modal
// scrim. Escape + scrim close, body scroll lock, initial focus. Not a full focus trap.
export default function Modal({ open, onClose, title, children, footer, size = "md", className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-overlay flex items-start justify-center overflow-y-auto bg-navy-900/50 p-6 pt-[10vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={clsx(
          "z-modal w-full rounded-card-lg bg-surface shadow-elevation-4 focus:outline-none",
          {
            "max-w-md": size === "sm",
            "max-w-lg": size === "md",
            "max-w-2xl": size === "lg",
          },
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          {title && (
            <h2 id={titleId} className="text-section text-text-1">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-sm text-text-2 hover:text-text-1 focus-visible:outline-none focus-visible:shadow-focus-ring"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="px-5 py-4 text-body text-text-1">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

Modal.displayName = "Modal";
