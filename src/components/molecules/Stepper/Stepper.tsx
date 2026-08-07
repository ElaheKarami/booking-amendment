import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "@/utils/clsx";
import { CheckIcon } from "@/components/icons";

export type StepStatus = "idle" | "active" | "done";

export interface StepItem {
  id: string;
  label?: ReactNode;
  status: StepStatus;
}

export interface StepperProps extends HTMLAttributes<HTMLElement> {
  steps: StepItem[];
}

// Compact numbered wizard stepper (design.md §10.2).
function Stepper({ steps, className, ...rest }: StepperProps) {
  return (
    <ol
      className={clsx("flex items-center gap-0", className)}
      {...rest}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  {
                    "bg-navy-500 text-white": step.status === "active",
                    "bg-success text-white": step.status === "done",
                    "bg-border text-text-3": step.status === "idle",
                  },
                )}
                aria-current={step.status === "active" ? "step" : undefined}
              >
                {step.status === "done" ? (
                  <CheckIcon size={14} />
                ) : (
                  index + 1
                )}
              </span>
              {step.label && (
                <span
                  className={clsx("text-caption whitespace-nowrap", {
                    "font-semibold text-text-1": step.status === "active",
                    "text-success": step.status === "done",
                    "text-text-3": step.status === "idle",
                  })}
                >
                  {step.label}
                </span>
              )}
            </div>
            {!isLast && (
              <span
                className={clsx("mx-3 h-0.5 min-w-4 flex-1", {
                  "bg-primary": step.status === "done",
                  "bg-border": step.status !== "done",
                })}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

Stepper.displayName = "Stepper";

export default Stepper;
