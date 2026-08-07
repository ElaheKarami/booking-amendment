# 05 — Build the Amendment Form

## Scope

- Add `src/schemas/bookingAmendmentSchema.ts` with Zod validation for editable fields only: Port of Discharge, Planned voyage, Cargo readiness date, container quantities, and special handling instructions.
- Enforce quantity greater than zero and no duplicate equipment types in the schema.
- Add `src/hooks/useVoyages.ts` to load voyage options through the existing `getVoyages` service with TanStack Query.
- Create an `AmendmentForm` organism using React Hook Form, the Zod resolver, and `useFieldArray` for dynamic container rows.
- Reuse existing UI: `Select`, `SearchSelect`, `DatePicker`, `TextField`, `Button`, and `PermissionGate`. Keep non-editable booking fields outside the form.
- Support field-level errors, reset to original booking values, and dirty-state tracking that changes only after meaningful edits.
- Provide a small helper to map server validation field paths onto React Hook Form errors (for later assess/submit use).

## Details integration

- Update `BookingAmendmentDetails` to replace the `useMemo` draft with `useState` initialized from `bookingAmendmentDraftFromBooking` after booking load, so edits are not re-derived on every render.
- Render `AmendmentForm` in place of the current read-only amendment fields.
- Keep existing loading, error, header, permission, impact placeholder, and action-area behavior unchanged.

## Reuse

- `bookingAmendmentDraftFromBooking` transformer
- `getVoyages` / booking types already in `types.d.ts`
- Atoms/molecules listed above
- Form pattern: React Hook Form + Zod in `src/schemas/`

## Validation

- Update `BookingAmendmentDetails` tests for the interactive form.
- Add focused tests for schema rules, dynamic container rows, dirty state, reset, and field errors.
- Run lint and the affected Jest tests.

## Risk

- Voyage options depend on discharge port and readiness date; keep the currently selected voyage visible while options refresh, and do not introduce voyage search debounce or assessment submission in this task.
