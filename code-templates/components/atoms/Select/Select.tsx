import { useId, type SelectHTMLAttributes } from "react";
import clsx from "@/utils/clsx";
import { ChevronDownIcon } from "../../icons";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  ref?: React.RefObject<HTMLSelectElement>;
}

// FLAG: Select is not designed in design.md — scaffolded from TextField + chevron
// with token styling. Revisit when a visual spec exists.
function Select({
  label,
  options,
  placeholder,
  error,
  helperText,
  containerClassName,
  className,
  id,
  disabled,
  ref,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedById = error
    ? `${fieldId}-error`
    : helperText
      ? `${fieldId}-helper`
      : undefined;
  const hasError = Boolean(error);

  const selectClass = clsx(
    "w-full h-8 rounded-lg border bg-surface text-label text-text-1 pl-3 pr-8 appearance-none",
    "transition-colors duration-fast ease-motion-standard focus:outline-none",
    {
      "border-border focus:border-accent focus:shadow-focus-ring": !hasError,
      "border-error focus:shadow-danger-ring": hasError,
      "opacity-45 cursor-not-allowed bg-slate-50": disabled,
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
        <select
          ref={ref}
          id={fieldId}
          className={selectClass}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedById}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute right-2.5 text-text-3"
        />
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

Select.displayName = "Select";

export default Select;
