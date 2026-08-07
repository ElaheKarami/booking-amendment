export const TELEMETRY_EVENTS = {
  BOOKING_AMENDMENT_OPENED: "booking_amendment_opened",
  BOOKING_AMENDMENT_CHANGED: "booking_amendment_changed",
  IMPACT_ASSESSMENT_REQUESTED: "impact_assessment_requested",
  IMPACT_ASSESSMENT_SUCCEEDED: "impact_assessment_succeeded",
  IMPACT_ASSESSMENT_FAILED: "impact_assessment_failed",
  ASSESSMENT_BECAME_STALE: "assessment_became_stale",
  AMENDMENT_SUBMISSION_STARTED: "amendment_submission_started",
  AMENDMENT_VERSION_CONFLICT: "amendment_version_conflict",
  AMENDMENT_SUBMISSION_UNKNOWN: "amendment_submission_unknown",
  AMENDMENT_SUBMISSION_SUCCEEDED: "amendment_submission_succeeded",
} as const satisfies Record<string, TelemetryEventName>;
