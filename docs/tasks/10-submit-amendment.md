# 10 — Submit a Valid Amendment

## Specs

- [Amendment Submission overview](../specs/amendment-submission/overview.md)
- [Amendment Submission API](../specs/amendment-submission/api.md)
- [Amendment Submission states](../specs/amendment-submission/states.md)

## Dependencies

09 — Render Impact Review and Blocking States

## Implementation Steps

1. Enable Submit only for an online Operations User with a valid non-stale assessment and no blocking error.
2. Generate and attach an idempotency key to the submission command.
3. Model idle, submitting, succeeded, rejected, conflict, and unknown states.
4. Prevent avoidable duplicate interaction while the request is in flight.
5. Show accepted amendment ID or rejection reason.

## Acceptance Criteria

- [ ] Submission carries booking ID, base version, assessment version, amendment, and idempotency key.
- [ ] A disabled button is not the only idempotency control.
- [ ] Submission has no naive optimistic update.
- [ ] Rejected submissions preserve the draft.
