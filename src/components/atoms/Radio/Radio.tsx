import {
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "@/utils/clsx";

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  label?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

// FLAG: Radio is not designed in design.md — scaffolded with primary token.
// Label wraps the control (no useId / htmlFor).
function Radio({
  label,
  className,
  disabled,
  ref,
  ...rest
}: RadioProps) {
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
        type="radio"
        disabled={disabled}
        className="h-4 w-4 border-border accent-primary focus-visible:outline-none focus-visible:shadow-focus-ring"
        {...rest}
      />
      {label}
    </label>
  );
}

Radio.displayName = "Radio";

export default Radio;
