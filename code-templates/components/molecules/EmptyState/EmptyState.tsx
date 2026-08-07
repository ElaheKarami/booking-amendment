import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "@/utils/clsx";

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
  className?: string;
}

// FLAG: EmptyState is not designed in design.md — scaffolded with token styling.
function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ref,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      ref={ref}
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-card-lg border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
      {...rest}
    >
      {icon && <div className="text-text-3">{icon}</div>}
      <p className="text-section text-text-1">{title}</p>
      {description && (
        <p className="max-w-sm text-body-sm text-text-2-strong">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

EmptyState.displayName = "EmptyState";

export default EmptyState;
