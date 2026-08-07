# 13 — Add Network Resilience and Performance Measures

## Specs

- [Booking Amendment overview](../specs/booking-amendment/overview.md)
- [Voyages API](../specs/voyages/api.md)

## Dependencies

11 — Handle Conflict and Unknown Submission Result

## Implementation Steps

1. Show online and offline status; prevent submission offline and provide clear reconnection recovery.
2. Apply suggested cache policies: Cache First static assets, precached shell, Network First booking/voyages/submission status, and Network Only assessment/submission.
3. Ensure a cached assessment is never treated as current solely because it exists.
4. Implement at least three justified performance measures from dynamic impact loading, form-render isolation, stable keys, memoised summaries, cancellation, debounce, lazy comparison, bundle analysis, reduced client JavaScript, virtualisation, or incremental rendering.
5. Document behavior for 200 containers, 500 charge lines, thousands of voyages, multiple messages per field, and rapid assessment requests.

## Acceptance Criteria

- [ ] Offline state cannot submit an amendment or imply success.
- [ ] At least three performance measures are demonstrably implemented.
- [ ] Large-data behavior remains responsive or is documented with the required strategy.
