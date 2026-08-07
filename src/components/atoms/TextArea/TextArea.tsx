import {
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import clsx from "@/utils/clsx";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

// FLAG: TextArea is not designed in design.md — scaffolded from TextField tokens.
function TextArea({
  label,
  helperText,
  error,
  containerClassName,
  className,
  id,
  disabled,
  ref,
  ...rest
}: TextAreaProps) {
  const describedById = id
    ? error
      ? `${id}-error`
      : helperText
        ? `${id}-helper`
        : undefined
    : undefined;
  const hasError = Boolean(error);

  const field = (
    <textarea
      ref={ref}
      id={id}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      aria-describedby={describedById}
      className={clsx(
        "min-h-[88px] w-full resize-y rounded-lg border bg-surface px-3 py-2 text-label text-text-1 placeholder:text-text-3",
        "transition-colors duration-fast ease-motion-standard focus:outline-none",
        {
          "border-border focus:border-accent focus:shadow-focus-ring": !hasError,
          "border-error focus:shadow-danger-ring": hasError,
          "cursor-not-allowed bg-slate-50 opacity-45": disabled,
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

TextArea.displayName = "TextArea";

export default TextArea;
