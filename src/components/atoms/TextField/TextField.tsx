import {
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
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
  ref?: Ref<HTMLInputElement>;
}

// Text input (design.md §10.1: border token, radius-lg, h32, label size).
// FLAG: focus/error/disabled states are not designed — implemented from tokens.
// Label association via nesting (no useId). Pass `id` when aria-describedby is needed.
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
  const describedById = id
    ? error
      ? `${id}-error`
      : helperText
        ? `${id}-helper`
        : undefined
    : undefined;
  const hasError = Boolean(error);

  const inputClass = clsx(
    "w-full h-8 rounded-lg border bg-surface text-label text-text-1 placeholder:text-text-3",
    "transition-colors duration-fast ease-motion-standard focus:outline-none",
    {
      "border-border focus:border-accent focus:shadow-focus-ring": !hasError,
      "border-error focus:shadow-danger-ring": hasError,
      "opacity-45 cursor-not-allowed bg-slate-50": disabled,
      "pl-8 pr-3": Boolean(leadingIcon) && !trailingIcon,
      "pl-3 pr-8": Boolean(trailingIcon) && !leadingIcon,
      "px-8": Boolean(leadingIcon) && Boolean(trailingIcon),
      "px-3": !leadingIcon && !trailingIcon,
    },
    className,
  );

  const field = (
    <div className="relative flex items-center">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-2.5 flex text-text-3">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
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
  );

  return (
    <div className={clsx("flex flex-col gap-1", containerClassName)}>
      {label ? (
        <label className="flex flex-col gap-1 text-caption text-text-2-stronger">
          <span>{label}</span>
          {field}
        </label>
      ) : (
        field
      )}
      {error ? (
        <span
          id={id ? `${id}-error` : undefined}
          className="text-caption text-error"
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          id={id ? `${id}-helper` : undefined}
          className="text-caption text-text-2"
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

TextField.displayName = "TextField";

export default TextField;
