import { isAxiosError } from "axios";

export class ApiError extends Error {
  readonly status: number | undefined;

  readonly reasons: string[];

  constructor(message: string, status?: number, reasons: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reasons = reasons;
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError<{ errorReasons?: unknown }>(error)) {
    const errorReasons = error.response?.data?.errorReasons;
    const reasons = Array.isArray(errorReasons)
      ? errorReasons.filter(
          (reason): reason is string => typeof reason === "string",
        )
      : [];

    return new ApiError(
      reasons[0] ?? error.message,
      error.response?.status,
      reasons,
    );
  }

  return new ApiError("An unexpected error occurred.");
}
