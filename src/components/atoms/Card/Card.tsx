import { type HTMLAttributes, type Ref } from "react";
import clsx from "@/utils/clsx";

export type CardVariant = "default" | "table" | "inverse";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// Surface container. `inverse` is the navy data panel used for charge totals.
// Low elevation — separation via 1px border.
function Card({
  variant = "default",
  padded = true,
  className,
  children,
  ref,
  ...rest
}: CardProps) {
  const rootClass = clsx(
    {
      "bg-surface border border-border-card rounded-card-lg":
        variant === "default",
      "bg-surface border border-border-card rounded-card": variant === "table",
      "bg-surface-inverse text-onnavy-1 border border-navy-border rounded-card-lg":
        variant === "inverse",
      "p-5": padded,
    },
    className,
  );

  return (
    <div ref={ref} className={rootClass} {...rest}>
      {children}
    </div>
  );
}

Card.displayName = "Card";

export default Card;
