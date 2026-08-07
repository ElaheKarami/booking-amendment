# 12 — Add Telemetry Abstraction

## Specs

- [Booking Amendment API](../specs/booking-amendment/api.md)

## Dependencies

04 — Load and Render an Existing Booking

## Implementation Steps

1. Create the `track` and `captureError` telemetry abstraction outside component and core business logic.
2. Track amendment opened and changed, assessment requested/succeeded/failed/stale, submission started/conflict/unknown/succeeded.
3. Ensure event properties and error context omit sensitive and commercially confidential values.

## Acceptance Criteria

- [ ] All ten required events are emitted at their lifecycle transitions.
- [ ] No telemetry implementation is embedded in feature UI components.
- [ ] Sensitive booking, customer, and token values are not logged.
