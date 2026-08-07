import { type HTMLAttributes, type ReactNode, type Ref } from "react";
import clsx from "@/utils/clsx";
import Spinner from "@/components/atoms/Spinner/Spinner";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from "@/components/icons";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastBannerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  type: ToastType;
  description: ReactNode | string[];
  onClose?: () => void;
  linkHref?: string;
  linkText?: string;
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

const LEADING_ICON: Record<Exclude<ToastType, "loading">, typeof InfoIcon> = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

// Presentational toast banner. Framework-agnostic: plain <a> instead of next/link.
function ToastBanner({
  type,
  description,
  onClose,
  linkHref,
  linkText,
  className,
  ref,
  ...rest
}: ToastBannerProps) {
  const rootClass = clsx(
    "w-full md:w-[516px] flex items-center gap-4 rounded-md text-body font-medium py-4 px-6 shadow-elevation-3",
    {
      "bg-success text-white": type === "success",
      "bg-error text-white": type === "error",
      "bg-warning text-text-1": type === "warning",
      "bg-primary text-white": type === "info",
      "bg-slate-75 text-text-1": type === "loading",
      "flex-wrap lg:flex-nowrap": Boolean(linkHref),
    },
    className,
  );

  const Icon = type === "loading" ? null : LEADING_ICON[type];

  return (
    <div
      ref={ref}
      role={type === "error" || type === "warning" ? "alert" : "status"}
      aria-live={
        type === "error" || type === "warning" ? "assertive" : "polite"
      }
      className={rootClass}
      {...rest}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
        {type === "loading" ? (
          <Spinner size={24} />
        ) : Icon ? (
          <Icon size={24} />
        ) : null}
      </span>

      <p
        className={clsx(
          "grow min-w-0 w-full m-0 p-0 text-left whitespace-pre-line",
          {
            "order-last lg:order-none": Boolean(linkHref),
          },
        )}
      >
        {Array.isArray(description) ? description.join("\n") : description}
      </p>

      {linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noreferrer noopener"
          className="shrink-0 order-2 lg:order-none ml-auto lg:ml-0 underline"
        >
          {linkText}
        </a>
      )}

      {type !== "loading" && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-sm opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:shadow-focus-ring"
        >
          <CloseIcon size={22} />
        </button>
      )}
    </div>
  );
}

ToastBanner.displayName = "ToastBanner";

export default ToastBanner;
