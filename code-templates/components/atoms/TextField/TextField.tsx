import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "@/utils/clsx";

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  containerClassName?: string;
  ref?: React.RefObject<HTMLInputElement>;
}

// Text input (design.md §10.1: border #e4e9f0, radius 8px, h32, 12.5px).
// focus/error/disabled states are flagged in design.md — implemented from tokens.
function TextField({
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  containerClassName,
  className,
  id,
  disabled,
  ref,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedById = error
    ? `${fieldId}-error`
    : helperText
      ? `${fieldId}-helper`
      : undefined;
  const hasError = Boolean(error);

  const inputClass = clsx(
    "w-full h-8 rounded-lg border bg-surface text-label text-text-1 placeholder:text-text-3",
    "transition-colors duration-fast ease-motion-standard focus:outline-none",
    {
      "border-border focus:border-accent focus:shadow-focus-ring": !hasError,
      "border-error focus:shadow-danger-ring": hasError,
      "opacity-45 cursor-not-allowed bg-slate-50": disabled,
      "pl-8 pr-3": Boolean(leadingIcon),
      "pl-3 pr-8": Boolean(trailingIcon) && !leadingIcon,
      "px-8": Boolean(leadingIcon) && Boolean(trailingIcon),
      "px-3": !leadingIcon && !trailingIcon,
    },
    className,
  );

  return (
    <div className={clsx("flex flex-col gap-1", containerClassName)}>
      {label && (
        <label htmlFor={fieldId} className="text-caption text-text-2-stronger">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-2.5 flex text-text-3">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          className={inputClass}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedById}
          {...rest}
        />
        {trailingIcon && (
          <span className="pointer-events-none absolute right-2.5 flex text-text-3">
            {trailingIcon}
          </span>
        )}
      </div>
      {error ? (
        <span id={`${fieldId}-error`} className="text-caption text-error">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${fieldId}-helper`} className="text-caption text-text-2">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

TextField.displayName = "TextField";

export default TextField;
