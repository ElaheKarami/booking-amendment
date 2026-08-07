# 08 — Impact Assessment Lifecycle

## Scope

Add the assessment lifecycle only. Task 09 owns rendering the returned schedule,
equipment, charge, approval, and validation details; task 10 owns submission.

## Plan

### 1. Assessment hook and draft identity

Create `src/hooks/useImpactAssessment.ts` to:

- Expose the explicit `recalculate(draft)` action through a TanStack Query mutation
  backed by `bookingAmendmentService.assessAmendment`.
- Model `not-calculated`, `calculating`, `valid`, `stale`, and `failed` states,
  retaining the most recent impact result.
- Build a deterministic fingerprint from the complete amendment draft and use it to
  associate a request and response with that exact draft.
- Abort an in-flight request when a later recalculation or relevant draft change
  supersedes it; additionally ignore any response whose request identifier or
  fingerprint is no longer current.
- Normalise request failures with the existing error handling.

Export the hook from `src/hooks/index.ts`. Add unit coverage for request data,
state transitions, stale handling, and an outdated response.

### 2. Form-to-workspace draft updates

Update `src/components/organisms/AmendmentForm/AmendmentForm.tsx` with a typed
callback that reports the current valid form values to its parent whenever an
editable amendment field changes. Preserve React Hook Form and existing validation;
the form continues to own its UI state.

### 3. Workspace controls and lifecycle feedback

Update `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.tsx`
to:

- Keep the latest reported amendment draft and provide it to the assessment hook.
- Wire **Recalculate** to the explicit assessment action, sending the booking ID,
  base version, and current amendment draft.
- Mark a valid result stale after every later draft change.
- Show concise lifecycle feedback (not calculated, calculating, stale, or failed)
  with the existing `Badge`, `Button` loading state, and normalized error message.
- Disable Submit unless the user has submit permission and the current assessment is
  valid. Task 10 will add the submission command and remaining submission states.

### 4. Tests

Add or update Jest / React Testing Library coverage for:

- Recalculate using the latest draft.
- Calculating, failed, valid, and stale UI states.
- Submit being disabled before calculation, during calculation, after failure, and
  after a relevant form edit.
- The hook rejecting an obsolete response.

## Reuse

- `assessAmendment`, its request/response transformers, and the existing mock
  assessment endpoint.
- TanStack Query, `normalizeApiError`, `Badge`, `Button`, React Hook Form, and the
  established hook/service layers.

## Risks

- The form currently owns the amendment values, so the callback must keep the
  workspace draft synchronized without resetting or revalidating the form.
- Cancellation is best-effort. The fingerprint and request guard remain necessary
  because an aborted request can still resolve.
- Assessment result rendering and charge-role gating deliberately remain for task 09.

## Validation

- Run the affected hook, form, workspace, service, and transformer tests.
- Run `yarn lint`.
