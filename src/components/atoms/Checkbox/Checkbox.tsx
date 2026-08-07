import {
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "@/utils/clsx";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

// FLAG: Checkbox is not designed in design.md — scaffolded with accent token.
// Label wraps the control (no useId / htmlFor).
function Checkbox({
  label,
  className,
  disabled,
  ref,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={clsx(
        "inline-flex items-center gap-2 text-body text-text-1",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="h-4 w-4 rounded-xs border-border accent-accent focus-visible:outline-none focus-visible:shadow-focus-ring"
        {...rest}
      />
      {label}
    </label>
  );
}

Checkbox.displayName = "Checkbox";

export default Checkbox;
