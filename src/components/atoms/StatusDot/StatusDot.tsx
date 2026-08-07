import { type HTMLAttributes, type Ref } from "react";
import clsx from "@/utils/clsx";

export type StatusDotSize = 7 | 9 | 11;
export type StatusDotTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "lease"
  | "neutral";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  size?: StatusDotSize;
  tone?: StatusDotTone;
  halo?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

const TONE_CLASS: Record<StatusDotTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  lease: "bg-teal-500",
  neutral: "bg-slate-600",
};

const HALO_CLASS: Record<StatusDotTone, string> = {
  success: "shadow-dot-ring-success",
  warning: "shadow-dot-ring-warning",
  error: "shadow-dot-ring-error",
  info: "shadow-dot-ring-info",
  lease: "shadow-dot-ring-lease",
  neutral: "shadow-dot-ring-neutral",
};

function StatusDot({
  size = 9,
  tone = "info",
  halo = false,
  className,
  ref,
  ...rest
}: StatusDotProps) {
  return (
    <span
      ref={ref}
      className={clsx(
        "inline-block shrink-0 rounded-full",
        TONE_CLASS[tone],
        {
          "h-[7px] w-[7px]": size === 7,
          "h-[9px] w-[9px]": size === 9,
          "h-[11px] w-[11px]": size === 11,
        },
        halo && HALO_CLASS[tone],
        className,
      )}
      {...rest}
    />
  );
}

StatusDot.displayName = "StatusDot";

export default StatusDot;
