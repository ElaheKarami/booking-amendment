# 06 — Add Unsaved-Change Protection

## Specs

- [Booking Amendment flow](../specs/booking-amendment/flow.md)
- [Booking Amendment states](../specs/booking-amendment/states.md)

## Dependencies

05 — Build the Amendment Form

## Implementation Steps

1. Warn on browser refresh and tab close only when the form is dirty.
2. Add a confirmation before route navigation, reset, and loading the latest booking after conflict when dirty.
3. Allow the requested action to continue after confirmation; do not warn while clean.
4. Preserve the current draft until the user confirms discard.

## Acceptance Criteria

- [x] Each of the five required leave/reset scenarios is protected when dirty.
- [x] No warning appears when there is no meaningful change.
- [x] Browser-level limitations are recorded for the README task.
