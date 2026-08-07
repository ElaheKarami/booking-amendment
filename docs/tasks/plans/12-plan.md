# 12 — Add Telemetry Abstraction

## Scope

Add a small `track` / `captureError` abstraction under `lib/`, emit the ten
required amendment lifecycle events from hooks (not UI), and keep properties
free of sensitive booking, customer, charge, and token values. No real
monitoring vendor.

## Plan

### 1. Telemetry module

Create `src/lib/telemetry.ts` with:

```ts
track(event: string, properties?: Record<string, unknown>): void
captureError(error: unknown, context?: Record<string, unknown>): void
```

- Declare a `Telemetry` type in `types.d.ts`.
- Export named helpers from `src/lib/index.ts`.
- Sink: `console` in development only (or a no-op elsewhere). No new dependency.
- Add event-name constants (the ten required strings) next to the module or in
  `src/constants/` — keep call sites typed against those names.
- Document allowed vs forbidden property keys in a short comment or helper so
  callers do not pass draft payloads, customer, booking number, charges, tokens,
  or free-text instructions.

### 2. Emit from hooks (not feature UI)

| Event | Where |
| --- | --- |
| `booking_amendment_opened` | Thin hook (e.g. `useBookingAmendmentTelemetry`) fired once when the loaded booking id is available — called from the details template / workspace mount path, implementation stays in the hook |
| `booking_amendment_changed` | `useImpactAssessment.syncDraft` when the draft fingerprint actually changes |
| `impact_assessment_requested` | Start of `recalculate` |
| `impact_assessment_succeeded` | Successful `recalculate` |
| `impact_assessment_failed` | Failed `recalculate` + `captureError` with safe context |
| `assessment_became_stale` | When status becomes `stale` (`syncDraft` / `markStale`) |
| `amendment_submission_started` | Start of `submit` (after offline early-return) |
| `amendment_version_conflict` | Submission outcome `conflict` |
| `amendment_submission_unknown` | Submission outcome `unknown` |
| `amendment_submission_succeeded` | Submission outcome `succeeded` |

Safe properties only, for example: `bookingId`, `baseVersion`, assessment /
submission lifecycle status, HTTP status, application error `type`. Never log
customer, booking number, charge amounts, containers, special instructions, or
auth tokens.

Do not put console sinks or event maps inside organisms or atoms.

### 3. Tests

- Unit-test the telemetry module (track / captureError invoke the sink; optional
  assert helper rejects or strips forbidden keys if a sanitizer is added).
- Extend `useImpactAssessment` and `useSubmitAmendment` tests to spy on `track` /
  `captureError` for the relevant transitions.
- Cover opened once via the thin lifecycle hook test.

## Files

Create:

- `src/lib/telemetry.ts`
- `src/lib/telemetry.test.ts`
- `src/hooks/useBookingAmendmentTelemetry.ts` (opened-once only; keep tiny)
- `src/hooks/useBookingAmendmentTelemetry.test.tsx`
- `docs/tasks/plans/12-plan.md`

Modify:

- `types.d.ts` — `Telemetry` (+ event union if useful)
- `src/lib/index.ts`
- `src/hooks/index.ts`
- `src/hooks/useImpactAssessment.ts`
- `src/hooks/useImpactAssessment.test.tsx`
- `src/hooks/useSubmitAmendment.ts`
- `src/hooks/useSubmitAmendment.test.tsx`
- `src/components/templates/BookingAmendmentDetails/BookingAmendmentDetails.tsx`
  (call the opened hook only — no telemetry implementation inline)

## Reuse

- Existing assessment and submission lifecycle hooks as the single source of
  transition points.
- Existing `ApiError` / `normalizeApiError` for safe error context (`type`,
  `status`, message codes — not raw payloads).
- `amendmentDraftFingerprint` already used by `syncDraft` for change detection.

## Risks

- Firing `booking_amendment_changed` / `assessment_became_stale` too often on
  baseline sync or conflict reload — gate on real fingerprint / status
  transitions.
- Accidental logging of form values — keep properties allowlisted and minimal.
- `forbidden.md` bans ad-hoc `console.error` in UI; the telemetry sink may use
  `console` only inside `lib/telemetry.ts`, not in components.

## Validation

- Run telemetry, impact-assessment, submit-amendment, and opened-hook Jest tests.
- Run `yarn lint`.
- Grep call sites: no `track` / `captureError` implementation inside
  `components/` beyond invoking the opened hook.
