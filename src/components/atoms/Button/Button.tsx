import { type ButtonHTMLAttributes, type Ref } from "react";
import clsx from "@/utils/clsx";
import Spinner from "@/components/atoms/Spinner/Spinner";

export type ButtonVariant =
  "primary" | "primary-emphasis" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

// Primary action button. Variants + sizes per design.md §10.1.
// hover/active tints are §1.3 *derived* values; loading state is flagged (not designed).
function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ref,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  const rootClass = clsx(
    "inline-flex items-center justify-center gap-2 font-semibold rounded-btn select-none",
    "transition-colors duration-fast ease-motion-standard",
    "focus-visible:outline-none focus-visible:shadow-focus-ring",
    isDisabled ? "cursor-not-allowed" : "cursor-pointer",
    {
      "bg-primary text-onnavy-1 hover:bg-primary-hover active:bg-primary-active disabled:opacity-45":
        variant === "primary",
      "bg-primary-emphasis text-onnavy-1 hover:bg-primary-emphasis-hover active:bg-primary-emphasis-active disabled:opacity-45":
        variant === "primary-emphasis",
      "bg-surface text-text-2-stronger border border-border-strong hover:bg-slate-50 active:bg-slate-200 disabled:opacity-45 disabled:text-text-3 disabled:border-border disabled:hover:bg-surface disabled:active:bg-surface":
        variant === "secondary",
      "bg-transparent text-text-2-stronger hover:bg-slate-75 active:bg-slate-200 disabled:opacity-45":
        variant === "ghost",
      "h-8 px-3 text-body-sm": size === "sm",
      "h-[38px] px-4 text-body font-semibold": size === "md",
      "h-[46px] px-5 text-body font-semibold rounded-btn-lg": size === "lg",
      "w-full": fullWidth,
    },
    className,
  );

  return (
    <button
      ref={ref}
      type={type}
      className={rootClass}
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
    >
      {isLoading && (
        <Spinner size={size === "sm" ? 16 : 18} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

Button.displayName = "Button";

export default Button;
