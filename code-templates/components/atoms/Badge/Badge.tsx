import { type HTMLAttributes } from "react";
import clsx from "@/utils/clsx";

export type BadgeTone = "success" | "warning" | "error" | "info" | "lease";
export type BadgeVariant = "pill" | "mvp";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
  ref?: React.RefObject<HTMLElement>;
}

// Status chip (design.md §10.1). Tinted bg + colored text pairs; `mvp` is the
// square uppercase chip. 11px / 600.
function Badge({
  tone = "info",
  variant = "pill",
  className,
  children,
  ref,
  ...rest
}: BadgeProps) {
  const rootClass = clsx(
    "inline-flex items-center gap-1 text-[11px] font-semibold leading-none",
    {
      "rounded-pill px-2.5 py-1": variant === "pill",
      "rounded-sm px-1.5 py-0.5 uppercase tracking-[0.06em] bg-blue-50 text-accent":
        variant === "mvp",
      // tone applies to the pill variant only
      "bg-green-50 text-success": variant === "pill" && tone === "success",
      "bg-amber-50 text-warning": variant === "pill" && tone === "warning",
      "bg-rust-50 text-error": variant === "pill" && tone === "error",
      "bg-blue-50 text-info": variant === "pill" && tone === "info",
      "bg-teal-75 text-teal-600": variant === "pill" && tone === "lease",
    },
    className,
  );

  return (
    <span ref={ref} className={rootClass} {...rest}>
      {children}
    </span>
  );
}

Badge.displayName = "Badge";

export default Badge;
