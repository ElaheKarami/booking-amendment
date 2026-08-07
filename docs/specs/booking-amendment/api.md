# API

## Endpoints

- `GET /api/bookings/:id`
- `GET /api/voyages`
- `POST /api/bookings/:id/amendments/assess`
- `POST /api/bookings/:id/amendments`
- `GET /api/amendment-submissions/:id/status`
- `GET /api/bookings/:id/latest-version`

Mock APIs may use Next.js Route Handlers, Mock Service Worker, or a lightweight mock server.

## Mock Behaviours

- Normal response
- Business validation error
- Slow response
- Version conflict
- Timeout
- Unknown submission result
- Duplicate submission
- Out-of-order assessment responses

## Domain Models

```ts
type BookingAmendmentDraft = {
  bookingId: string;
  baseVersion: number;
  portOfDischarge: string;
  voyageId: string;
  cargoReadinessDate: string;
  containers: Array<{
    equipmentType: "20GP" | "40GP" | "40HC";
    quantity: number;
  }>;
  specialInstructions?: string;
};

type AssessAmendmentRequest = {
  bookingId: string;
  baseVersion: number;
  amendment: BookingAmendmentDraft;
};

type AmendmentImpact = {
  schedule: {
    feasible: boolean;
    warnings: string[];
  };
  equipment: {
    available: boolean;
    unavailableItems: string[];
  };
  charges: {
    currentTotal: number;
    revisedTotal: number;
    difference: number;
    currency: string;
    items: Array<{
      code: string;
      description: string;
      previousAmount: number;
      revisedAmount: number;
    }>;
  };
  approvals: Array<{
    code: string;
    reason: string;
  }>;
  validations: Array<{
    field?: string;
    severity: "info" | "warning" | "error";
    message: string;
  }>;
  assessmentVersion: string;
};

type SubmitAmendmentCommand = {
  bookingId: string;
  baseVersion: number;
  assessmentVersion: string;
  amendment: BookingAmendmentDraft;
  idempotencyKey: string;
};
```

Keep the original booking and amendment draft distinct. Do not mutate the original server response directly.

## Conflict Response

```json
{
  "code": "BOOKING_VERSION_CONFLICT",
  "currentVersion": 8,
  "message": "The booking was modified by another user."
}
```

## Server State

- Existing booking
- Voyage options
- Equipment availability
- Impact assessment
- Latest booking version
- Submission status

Demonstrate query-key design, cache handling, mutations, query invalidation, retry policy, request cancellation, error normalisation, and prevention of stale-response overwrite.

```ts
["booking", bookingId]
["voyages", { portOfLoading, portOfDischarge, readinessDate, search }]
["booking-amendment-assessment", { bookingId, draftFingerprint }]
["amendment-submission-status", submissionId]
```

Cancel or safely ignore outdated assessment requests.

## Validation

- Container quantity must be greater than zero.
- Duplicate equipment types must not be added.
- A selected 40HC equipment type requires a voyage that supports it.
- Cargo readiness date must be compatible with the selected voyage cut-off date.
- Business validation may be mocked; the architecture supports both client-side and server-side rules.
- Map server-side validation to form fields.

## Error Model

```ts
type ApplicationError =
  | { type: "validation"; fields: Record<string, string[]> }
  | { type: "business-rule"; code: string; message: string }
  | { type: "conflict"; currentVersion: number }
  | { type: "network"; retryable: boolean }
  | { type: "unknown"; message: string };
```

Translate infrastructure errors into meaningful application states. Do not pass raw transport errors directly into components.

## Idempotency

- Explain what idempotency means.
- Generate and attach an idempotency key to each submission.
- Explain why disabling a button alone is insufficient.
- The front end can prevent avoidable duplicate interaction and surface status.
- The back end must guarantee recognition of retries using the same key.
- The same submission must be safely recognisable after retry.

## Telemetry

Provide an abstraction with `track(event, properties?)` and `captureError(error, context?)`.

- `booking_amendment_opened`
- `booking_amendment_changed`
- `impact_assessment_requested`
- `impact_assessment_succeeded`
- `impact_assessment_failed`
- `assessment_became_stale`
- `amendment_submission_started`
- `amendment_version_conflict`
- `amendment_submission_unknown`
- `amendment_submission_succeeded`

Keep observability outside core business and component logic. Do not log sensitive or commercially confidential values.
