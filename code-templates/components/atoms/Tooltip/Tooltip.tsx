import { useId, type HTMLAttributes, type ReactNode } from "react";
import clsx from "@/utils/clsx";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content: ReactNode;
  placement?: TooltipPlacement;
  children: ReactNode;
}

// FLAG: Tooltip is not designed in design.md — scaffolded with elevation-3 + z-popover.
// CSS hover/focus only; revisit for a positioned/portalled version when specced.
export default function Tooltip({
  content,
  placement = "top",
  children,
  className,
  ...rest
}: TooltipProps) {
  const tooltipId = useId();

  const bubbleClass = clsx(
    "pointer-events-none absolute z-popover px-2 py-1 rounded-md bg-navy-800 text-onnavy-1 text-caption",
    "whitespace-nowrap shadow-elevation-3 opacity-0 invisible transition-opacity duration-fast",
    "group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible",
    {
      "bottom-full left-1/2 -translate-x-1/2 mb-1.5": placement === "top",
      "top-full left-1/2 -translate-x-1/2 mt-1.5": placement === "bottom",
      "right-full top-1/2 -translate-y-1/2 mr-1.5": placement === "left",
      "left-full top-1/2 -translate-y-1/2 ml-1.5": placement === "right",
    },
  );

  return (
    <span className={clsx("group relative inline-flex", className)} {...rest}>
      <span aria-describedby={tooltipId}>{children}</span>
      <span id={tooltipId} role="tooltip" className={bubbleClass}>
        {content}
      </span>
    </span>
  );
}

Tooltip.displayName = "Tooltip";
