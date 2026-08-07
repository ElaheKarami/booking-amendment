# States

## Form State

- Typed field modelling
- Schema-based validation
- Dynamic container rows
- Cross-field validation
- Dirty-state tracking
- Reset to original values
- Unsaved-change protection
- Server-side validation mapping

React Hook Form with Zod is recommended; alternatives are acceptable when justified.

## Assessment State

```ts
type AssessmentState =
  | { status: "not-calculated" }
  | { status: "calculating" }
  | {
      status: "valid";
      assessmentVersion: string;
      result: AmendmentImpact;
    }
  | {
      status: "stale";
      previousResult: AmendmentImpact;
    }
  | {
      status: "failed";
      error: AssessmentError;
    };
```

- `not-calculated`: no assessment for the current draft.
- `calculating`: Recalculate is in flight.
- `valid`: the assessment matches the current draft.
- `stale`: a relevant form change occurred after assessment; submission is disabled until recalculation.
- `failed`: assessment failed.

## Submission State

```ts
type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "succeeded"; amendmentId: string }
  | { status: "rejected"; reason: string }
  | { status: "conflict"; currentVersion: number }
  | { status: "unknown"; idempotencyKey: string };
```

- `idle`: no submission attempted.
- `submitting`: request in flight.
- `succeeded`: amendment accepted.
- `rejected`: amendment rejected with a reason.
- `conflict`: booking version conflict.
- `unknown`: request timed out after it was sent; status remains indeterminate.

The submit operation accounts for double-click, repeated submission, browser retry, slow response, request timeout, and unknown result.

## Validation and Impact States

- Field validation errors
- Informational messages
- Business warnings
- Blocking business errors
- Charge changes
- Approval requirements

Submission is blocked when at least one blocking business error exists.

## Conflict State

- Preserve the current draft.
- Explain that another user changed the booking.
- Allow loading the latest booking.
- Require recalculation after loading it.
- Do not silently overwrite the newer version.

## Unsaved-Change State

- `clean`: no meaningful change; do not warn.
- `dirty`: warn before refresh, tab close, route navigation, loading the latest booking after conflict, or reset.

The README explains browser-level navigation-protection limitations.

## Network State

- `online`: normal operation.
- `offline`: prevent amendment submission.
- `reconnected`: show clear recovery behavior.

Do not report misleading success. A cached previous assessment is not current solely because it is cached.

## Local Workflow State

- Selected panel
- Confirmation dialog
- Conflict dialog
- Comparison mode
- Temporary UI status

Keep server entities from being unnecessarily duplicated in a global store. Local React state is recommended; Zustand or Redux Toolkit is used only where justified.
