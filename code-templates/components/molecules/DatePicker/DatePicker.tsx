import { useId, type InputHTMLAttributes } from "react";
import clsx from "@/utils/clsx";

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  ref?: React.RefObject<HTMLInputElement>;
  className?: string;
  id?: string;
  disabled?: boolean;
}

// FLAG: DatePicker is not designed in design.md — scaffolded as a styled native
// date input. Replace with a calendar popover when a visual spec exists.
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
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hasError = Boolean(error);
  const describedById = error
    ? `${fieldId}-error`
    : helperText
      ? `${fieldId}-helper`
      : undefined;

  return (
    <div className={clsx("flex flex-col gap-1", containerClassName)}>
      {label && (
        <label htmlFor={fieldId} className="text-caption text-text-2-stronger">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
