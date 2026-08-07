# 05 — Build the Amendment Form

## Specs

- [Booking Amendment overview](../specs/booking-amendment/overview.md)
- [Booking Amendment states](../specs/booking-amendment/states.md)

## Dependencies

04 — Load and Render an Existing Booking

## Implementation Steps

1. Build the typed React Hook Form with a Zod schema.
2. Add only Port of Discharge, Planned voyage, Cargo readiness date, container quantities, and special handling instructions as editable fields.
3. Add dynamic container rows and reset-to-original behavior.
4. Track dirty fields and map server validation errors to form fields.
5. Add quantity-greater-than-zero and no-duplicate-equipment validation.

## Acceptance Criteria

- [x] No non-permitted booking field is editable.
- [x] Container rows can be changed dynamically.
- [x] Reset restores the original booking values.
- [x] Dirty state changes only after meaningful edits.
- [x] Field errors are displayed at the correct fields.
