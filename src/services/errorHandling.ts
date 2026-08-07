import { isAxiosError } from "axios";
import {
  showMessage,
  type ShowMessageOptions,
} from "@/components/atoms/ToastBanner/showMessage";
import type { ToastType } from "@/components/atoms/ToastBanner/ToastBanner";

export class ApiError extends Error {
  readonly status: number | undefined;

  readonly reasons: string[];

  readonly applicationError: ApplicationError;

  constructor(
    message: string,
    status?: number,
    reasons: string[] = [],
    applicationError: ApplicationError = {
      type: "unknown",
      message,
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reasons = reasons;
    this.applicationError = applicationError;
  }
}

function isApplicationError(value: unknown): value is ApplicationError {
  if (!value || typeof value !== "object" || !("type" in value)) {
    return false;
  }

  const type = value.type;
  return (
    type === "validation" ||
    type === "business-rule" ||
    type === "conflict" ||
    type === "network" ||
    type === "unknown"
  );
}

function applicationErrorMessages(error: ApplicationError): string[] {
  if (error.type === "validation") {
    return Object.values(error.fields).flat();
  }

  if (error.type === "conflict") {
    return ["The booking was modified by another user."];
  }

  if (error.type === "network") {
    return ["A network error occurred. Please try again."];
  }

  return [error.message];
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (
    isAxiosError<{
      errorReasons?: unknown;
      code?: unknown;
      currentVersion?: unknown;
    }>(error)
  ) {
    const data = error.response?.data;
    if (isApplicationError(data)) {
      const reasons = applicationErrorMessages(data);
      return new ApiError(
        reasons[0] ?? "An unexpected error occurred.",
        error.response?.status,
        reasons,
        data,
      );
    }

    if (
      data?.code === "BOOKING_VERSION_CONFLICT" &&
      typeof data.currentVersion === "number"
    ) {
      const applicationError: ApplicationError = {
        type: "conflict",
        currentVersion: data.currentVersion,
      };
      const reasons = applicationErrorMessages(applicationError);
      return new ApiError(
        reasons[0],
        error.response?.status,
        reasons,
        applicationError,
      );
    }

    const errorReasons = data?.errorReasons;
    const reasons = Array.isArray(errorReasons)
      ? errorReasons.filter(
          (reason): reason is string => typeof reason === "string",
        )
      : [];
    const applicationError: ApplicationError = error.response
      ? { type: "unknown", message: reasons[0] ?? error.message }
      : { type: "network", retryable: true };

    return new ApiError(
      reasons[0] ?? applicationErrorMessages(applicationError)[0],
      error.response?.status,
      reasons,
      applicationError,
    );
  }

  return new ApiError("An unexpected error occurred.", undefined, [], {
    type: "unknown",
    message: "An unexpected error occurred.",
  });
}

type NotifyType = Extract<ToastType, "error" | "success" | "warning">;

interface TrackedMessage {
  key: string;
  expiresIn: number;
}

const DEBOUNCE_MS = 15_000;
const FILTERED_MESSAGES = [
  "Profile picture not found for provided user",
  "could not find entity",
  "not found",
];

let tracked: TrackedMessage[] = [];

function purgeExpired(): void {
  const now = Date.now();
  tracked = tracked.filter((item) => item.expiresIn > now);
}

function shouldShow(messages: string[], forceShow: boolean): boolean {
  if (forceShow) return true;
  purgeExpired();
  const key = messages.join("\n");
  if (tracked.some((item) => item.key === key)) return false;
  if (
    FILTERED_MESSAGES.some((filtered) =>
      messages.some((message) => message.includes(filtered)),
    )
  ) {
    return false;
  }
  return true;
}

function track(messages: string[]): void {
  tracked.push({
    key: messages.join("\n"),
    expiresIn: Date.now() + DEBOUNCE_MS,
  });
}

function toMessages(description: string | string[]): string[] {
  return Array.isArray(description) ? description : [description];
}

export function notify(
  type: NotifyType,
  description: string | string[],
  options?: ShowMessageOptions & { forceShow?: boolean },
): string | null {
  const messages = toMessages(description);
  const forceShow = options?.forceShow ?? false;

  if (type === "error" && !shouldShow(messages, forceShow)) {
    return null;
  }

  if (type === "error") {
    track(messages);
  }

  const toastOptions: ShowMessageOptions = {
    duration: options?.duration,
    linkHref: options?.linkHref,
    linkText: options?.linkText,
    id: options?.id,
  };
  return showMessage(type, messages, toastOptions);
}

export function showErrorMessage(
  description: string | string[],
  options?: ShowMessageOptions & { forceShow?: boolean },
): string | null {
  return notify("error", description, options);
}

export function showSuccessMessage(
  description: string | string[],
  options?: ShowMessageOptions,
): string | null {
  return notify("success", description, options);
}

export function showWarningMessage(
  description: string | string[],
  options?: ShowMessageOptions,
): string | null {
  return notify("warning", description, options);
}

export function reportApiError(
  error: unknown,
  options?: ShowMessageOptions & { forceShow?: boolean },
): ApiError {
  const normalized = normalizeApiError(error);
  const messages =
    normalized.reasons.length > 0 ? normalized.reasons : [normalized.message];
  showErrorMessage(messages, options);
  return normalized;
}
