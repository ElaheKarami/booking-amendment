import { type InputHTMLAttributes, type Ref } from "react";
import clsx from "@/utils/clsx";

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

// FLAG: DatePicker is not designed in design.md — scaffolded as a styled native
// date input. Replace with a calendar popover when a visual spec exists.
// Label association via nesting (no useId). Pass `id` when aria-describedby is needed.
function DatePicker({
  label,
  helperText,
  error,
  containerClassName,
  className,
  id,
  disabled,
  ref,
  ...rest
}: DatePickerProps) {
  const hasError = Boolean(error);
  const describedById = id
    ? error
      ? `${id}-error`
      : helperText
        ? `${id}-helper`
        : undefined
    : undefined;

  const field = (
    <input
      ref={ref}
      id={id}
      type="date"
      disabled={disabled}
      aria-invalid={hasError || undefined}
      aria-describedby={describedById}
      className={clsx(
        "h-8 rounded-lg border bg-surface px-3 text-label text-text-1 transition-colors duration-fast focus:outline-none",
        {
          "border-border focus:border-accent focus:shadow-focus-ring":
            !hasError,
          "border-error focus:shadow-danger-ring": hasError,
          "opacity-45 cursor-not-allowed bg-slate-50": disabled,
        },
        className,
      )}
      {...rest}
    />
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
