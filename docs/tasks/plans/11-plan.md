# 11 — Handle Conflict and Unknown Submission Result

## Scope

Complete conflict recovery and unknown-result actions on top of Task 10’s
submission lifecycle. Keep the draft on `409`, load the latest booking without
silently replacing user edits, force recalculation, and give unknown outcomes
status-check / return / safe-retry actions. Skip a full 3-way merge UI (optional
in the task).

## Plan

### 1. Conflict recovery in the workspace

When `submissionStatus === "conflict"`:

- Keep the current form draft (already true; do not reset fields on `409`).
- Show a clear conflict message plus a **Load latest booking** action.
- Before applying the load, use existing `requestDiscard` unsaved-change
  protection.
- On confirm: refetch the booking via the existing booking query (`getBooking` /
  `useBooking`), update the React Query cache, and set `draft.baseVersion` (and
  related booking identity) to the latest version **without** copying latest
  field values over the user’s edits.
- Call `syncDraft` so the assessment becomes stale / not submittable until
  Recalculate.
- Clear the conflict outcome after a successful load so the user must
  recalculate, then submit with a **new** idempotency key.

Reuse `Button`, `Badge`, `Modal` / `requestDiscard`, and existing Tailwind
tokens. Do not add a comparison panel.

### 2. Unknown-result actions

When `submissionStatus === "unknown"`:

- Keep the existing “Submission status unknown” copy and idempotency-key
  reference (not a hard failure).
- Add **Check status**, **Return to booking**, and **Retry** (safe retry already
  reuses the key in `useSubmitAmendment`).
- Pass `onReturnToBooking` from `BookingAmendmentDetails` into the workspace
  (reuse the existing back/`requestDiscard` path).

### 3. Status lookup by reference

Unknown timeouts often have no submission id. Extend the mock
`getMockSubmissionStatus` (and keep the service signature) so `:id` resolves by
submission id **or** idempotency key. Add a small `useSubmissionStatus` (or
inline query in the submission hook) that calls `getSubmissionStatus` with the
retained key and surfaces accepted / rejected / still unknown without treating
the original timeout as failure.

### 4. Tests

Extend workspace and hook tests for:

- conflict → load latest → draft fields preserved, `baseVersion` updated,
  submit disabled until recalculate;
- unknown → status check by idempotency key, safe retry same key, return action
  wired;
- timeout / network still map to `unknown`, not rejected.

## Files

Create (only if needed for a focused status query):

- `src/hooks/useSubmissionStatus.ts`
- `src/hooks/useSubmissionStatus.test.tsx`

Modify:

- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.tsx`
- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.test.tsx`
- `src/components/templates/BookingAmendmentDetails/BookingAmendmentDetails.tsx`
- `src/hooks/useSubmitAmendment.ts` (only if needed for conflict clear / retry
  key rules after load)
- `src/lib/mockBookingApi.ts` (status lookup by idempotency key)
- `src/lib/mockBookingApi.test.ts`
- `src/hooks/index.ts` if a new hook is exported

## Risks

- Loading latest must update version/baseline, not overwrite discharge / voyage /
  cargo edits with server values.
- Safe retry must keep the same idempotency key only while status is `unknown`;
  after conflict resolution, generate a new key.
- Status check may still return not-found if the request never reached the
  server; show that as still unknown, not as definite rejection.

## Validation

- Run affected Jest tests (workspace, submit hook, mock API, status hook if any).
- Run `yarn lint`.
