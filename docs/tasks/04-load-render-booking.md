# 04 — Load and Render an Existing Booking

## Specs

- [Booking Amendment overview](../specs/booking-amendment/overview.md)
- [Booking Amendment flow](../specs/booking-amendment/flow.md)
- [Booking Amendment API](../specs/booking-amendment/api.md)

## Dependencies

02 — Add Mocked Authentication and Permissions

## Implementation Steps

1. Load the current version of one existing booking through the booking service and query hook.
2. Render a workspace skeleton while loading.
3. Render booking number, status, version, and last updated after success.
4. Handle missing booking and normalised API error states.
5. Initialise a separate amendment draft from the loaded booking.

## Acceptance Criteria

- [x] Booking header contains required values.
- [x] Loading, success, and error states are visible.
- [x] The initial draft equals permitted booking values without mutating the booking response.
- [x] The workspace remains a single primary workspace.
