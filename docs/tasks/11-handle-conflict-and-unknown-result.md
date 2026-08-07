# 11 — Handle Conflict and Unknown Submission Result

## Specs

- [Amendment Submission flow](../specs/amendment-submission/flow.md)
- [Amendment Submission states](../specs/amendment-submission/states.md)
- [Booking Amendment flow](../specs/booking-amendment/flow.md)

## Dependencies

10 — Submit a Valid Amendment

## Implementation Steps

1. Handle `409 BOOKING_VERSION_CONFLICT` without losing the current draft.
2. Explain the conflict, allow latest-booking load, and require recalculation after it.
3. Do not silently overwrite the newer booking version.
4. Optionally show the user draft, previous booking, and latest booking side by side.
5. On a sent request timeout, set state to unknown instead of failure.
6. Show the submission reference or idempotency key and allow status check, return to booking, or safe retry only.

## Acceptance Criteria

- [x] Conflict preserves the draft and clearly signals recalculation is required.
- [x] Unknown result is not shown as a definitive failure.
- [x] Retry uses safe idempotency-key handling.
