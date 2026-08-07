# 03 — Create Mock APIs and Domain Models

## Specs

- [Booking Amendment API](../specs/booking-amendment/api.md)
- [Impact Assessment API](../specs/impact-assessment/api.md)
- [Amendment Submission API](../specs/amendment-submission/api.md)
- [Voyages API](../specs/voyages/api.md)

## Dependencies

01 — Create Project Foundation

## Implementation Steps

1. Define the shared booking, amendment draft, impact, submission, user, and application-error types.
2. Create mock endpoints for booking, voyages, assessment, submission, submission status, and latest booking version.
3. Implement all required mock outcomes: normal response, business validation error, slow response, conflict, timeout, unknown result, duplicate submission, and out-of-order assessment responses.
4. Add request and response transformers, feature services, and normalised error handling.

## Acceptance Criteria

- [ ] No component or hook makes direct `fetch` or Axios calls.
- [ ] Original server booking data is transformed and remains immutable.
- [ ] Raw transport errors never reach components.
- [ ] Each endpoint supports the scenarios required by the challenge.
