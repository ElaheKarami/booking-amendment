# 07 — Voyage Selection and Validation

## Scope

Complete voyage-selection feedback and validation using the existing voyage service,
hook, and amendment form. Keep assessment lifecycle state out of scope for task 08.

## Plan

### 1. Amendment form

Update `src/components/organisms/AmendmentForm/AmendmentForm.tsx` to:

- Show loading, empty, success, and API-error feedback for voyage options.
- Keep the existing 300 ms debounced server search.
- Use server-driven filtering for voyage search results.
- Supply loaded voyage data to form validation.

### 2. Amendment schema

Update `src/schemas/bookingAmendmentSchema.ts` to:

- Validate that cargo readiness is on or before the selected voyage cut-off date.
- Preserve the existing 40HC compatibility validation.

### 3. Search select

Update `src/components/molecules/SearchSelect/SearchSelect.tsx` only as needed to:

- Support a small loading or status message while preserving existing consumers.

### 4. Tests

Update the affected Jest and React Testing Library tests to cover:

- Cut-off date validation.
- Voyage loading, empty, and error feedback.
- Debounced voyage search.
- Any missing voyage service or hook coverage.

## Reuse

- `useVoyages` and its stable query key, cancellation signal, and centralized error normalization.
- `bookingAmendmentService.getVoyages` and `voyageConvertToLocalData`.
- Existing `SearchSelect`, React Hook Form, Zod, and TanStack Query patterns.

## Risk

Voyage constraint data is asynchronous. Client validation applies only when the selected
voyage is available locally; the backend remains the source of truth.

## Out of Scope

Do not introduce assessment stale-state handling in this task. Task 08 owns the
not-calculated, calculating, valid, stale, and failed assessment lifecycle.
