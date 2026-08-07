import { type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import clsx from "@/utils/clsx";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  "aria-label": string;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

// Square icon control (design.md §10.1). Hover/disabled not designed — derived.
function IconButton({
  active = false,
  className,
  children,
  disabled,
  type = "button",
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        "inline-flex h-[42px] w-[42px] items-center justify-center rounded-icon",
        "transition-colors duration-fast ease-motion-standard",
        "focus-visible:outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-45",
        {
          "bg-navy-500 text-white shadow-elevation-2": active,
          "bg-slate-75 text-text-2 hover:bg-slate-200": !active,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

IconButton.displayName = "IconButton";

export default IconButton;
