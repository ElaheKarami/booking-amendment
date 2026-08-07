# 14 — Add Automated Tests

## Specs

- [Booking Amendment flow](../specs/booking-amendment/flow.md)
- [Impact Assessment flow](../specs/impact-assessment/flow.md)
- [Amendment Submission flow](../specs/amendment-submission/flow.md)

## Dependencies

13 — Add Network Resilience and Performance Measures

## Implementation Steps

1. Write at least three unit tests for stale detection, charge difference, server-validation mapping, submission eligibility, draft fingerprint, or workflow transitions.
2. Write at least three component or integration tests for assessment invalidation, blocking validation, conflict draft preservation, unknown timeout, stale response protection, or offline prevention.
3. Write the required end-to-end success flow: open booking, change container quantity, recalculate, review charge difference, submit, and receive success.
4. Add conflict or unknown-result end-to-end coverage if feasible.

## Acceptance Criteria

- [ ] The required minimum unit, integration/component, and E2E counts are met.
- [ ] E2E tests wait for named API responses, visible states, network events, final statuses, or deterministic transitions.
- [ ] E2E tests use no fixed delays.
