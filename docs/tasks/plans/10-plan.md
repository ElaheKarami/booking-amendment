# 10 — Submit a Valid Amendment

## Scope

Submit a current, valid amendment assessment through the existing service pipeline.
Prevent avoidable duplicate requests with an idempotency key, preserve the draft, and
show the submission result. Detailed conflict recovery and unknown-result status checks
remain in Task 11.

## Plan

### 1. Submission lifecycle hook

Create a focused `useSubmitAmendment` hook using a TanStack Query mutation. It will:

- build `SubmitAmendmentCommand` from the current draft and valid assessment version;
- generate an idempotency key when a submission starts and retain it for a safe retry;
- expose `idle`, `submitting`, `succeeded`, `rejected`, `conflict`, and `unknown`
  lifecycle states;
- normalize service errors so the workspace can render a message without performing
  API or error-classification work.

The hook will not reimplement backend validation or authorization rules.

### 2. Workspace submission action

Update `BookingAmendmentWorkspace` to call the submission hook. Enable **Submit
amendment** only when the user has submit permission, the browser is online, the
assessment is current and valid, and no assessment validation is blocking.

While submitting, disable the control and show its existing loading state. Render
concise status feedback for acceptance (including the amendment ID), rejection,
conflict, and unknown outcomes while retaining the current form draft. Reuse `Button`,
`Badge`, `Card`, `PermissionGate`, and existing Tailwind tokens.

### 3. Service and mock coverage

Reuse `submitAmendment` and its existing request/response transformers. Extend focused
service and mock tests only where needed to assert the complete command, including the
idempotency key, reaches the existing endpoint.

### 4. Tests and exports

Add hook tests for command construction, in-flight duplicate prevention, successful
submission, rejection, conflict, unknown results, and safe retry with the same key.
Extend workspace tests for eligibility, loading state, and visible submission feedback.
Export the hook from the hooks barrel.

## Files

Create:

- `src/hooks/useSubmitAmendment.ts`
- `src/hooks/useSubmitAmendment.test.tsx`

Modify:

- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.tsx`
- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.test.tsx`
- `src/hooks/index.ts`
- `src/services/bookingAmendmentService.test.ts`
- `src/lib/mockBookingApi.test.ts` if command coverage is not already sufficient.

## Risks

- `navigator.onLine` is only a browser connectivity hint; the API response remains
  authoritative.
- Button disabling reduces accidental duplicate interaction but is not the idempotency
  mechanism; the retained key is.
- The current unknown response has no submission ID, so a status lookup cannot be
  invoked from it. Task 11 must either receive a submission reference or add a
  lookup by idempotency key before implementing the status-check action.
- There is no optimistic booking update; the accepted result is displayed without
  modifying cached booking data.

## Validation

- Run the affected hook, workspace, service, and mock Jest tests.
- Run `yarn lint`.
