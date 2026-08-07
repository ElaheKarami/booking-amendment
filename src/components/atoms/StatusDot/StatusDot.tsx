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
  success: "shadow-[0_0_0_2px_#cfe0d6]",
  warning: "shadow-[0_0_0_2px_#f0dcae]",
  error: "shadow-[0_0_0_2px_#a8492a]",
  info: "shadow-[0_0_0_2px_#cdddf0]",
  lease: "shadow-[0_0_0_2px_#c7e6df]",
  neutral: "shadow-[0_0_0_2px_#e4e9f0]",
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
