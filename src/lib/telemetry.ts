/**
 * Telemetry sink for amendment lifecycle observability.
 *
 * Allowed property keys only: bookingId, baseVersion, status, httpStatus, errorType.
 * Never pass customer, bookingNumber, charges, containers, specialInstructions, tokens,
 * or full draft / amendment payloads.
 */

const ALLOWED_PROPERTY_KEYS = new Set<keyof TelemetryProperties>([
  "bookingId",
  "baseVersion",
  "status",
  "httpStatus",
  "errorType",
]);

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function sanitizeTelemetryProperties(
  properties?: Record<string, unknown> | TelemetryProperties,
): TelemetryProperties | undefined {
  if (!properties) return undefined;

  const sanitized: TelemetryProperties = {};

  for (const key of ALLOWED_PROPERTY_KEYS) {
    const value = properties[key];
    if (value !== undefined) {
      Object.assign(sanitized, { [key]: value });
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function safeErrorSummary(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }

  return "unknown";
}

export function track(
  event: TelemetryEventName | string,
  properties?: TelemetryProperties,
): void {
  if (!isDevelopment()) return;

  const safeProperties = sanitizeTelemetryProperties(properties);
  // Development-only sink — replace with a vendor adapter in production.
  // eslint-disable-next-line no-console -- intentional telemetry sink
  console.info("[telemetry]", event, safeProperties ?? {});
}

export function captureError(
  error: unknown,
  context?: TelemetryProperties,
): void {
  if (!isDevelopment()) return;

  const safeContext = sanitizeTelemetryProperties(context);
  // eslint-disable-next-line no-console -- intentional telemetry sink
  console.error("[telemetry:error]", safeErrorSummary(error), safeContext ?? {});
}

export const telemetry: Telemetry = {
  track,
  captureError,
};
