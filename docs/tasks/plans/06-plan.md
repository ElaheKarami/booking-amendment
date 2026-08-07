# 06 — Add Unsaved-Change Protection

## Scope

Protect meaningful amendment drafts before they are discarded. Warn only when React Hook Form `isDirty` is true. Reuse the existing `Modal` molecule — no `alert()`, no new libraries.

Five scenarios (from specs):

1. Browser refresh
2. Tab close
3. In-app leave (Back to workspace)
4. Form reset
5. Load latest booking after conflict (hook ready now; conflict UI lands in a later task)

## Approach

### 1. Hook — `useUnsavedChangesProtection`

Add `src/hooks/useUnsavedChangesProtection.ts`:

- Input: `isDirty: boolean`
- Register `beforeunload` only while dirty (covers refresh + tab close)
- Hold confirmation dialog state (`open`, pending callback)
- Expose `requestDiscard(onConfirm: () => void)` — if clean, run `onConfirm` immediately; if dirty, open the dialog and run `onConfirm` only after the user confirms
- Expose `cancelDiscard` / `confirmDiscard` for the Modal footer
- Return no JSX (hook contract)

### 2. Wire into the form and leave path

**`AmendmentForm`**

- Use the hook with RHF `isDirty`
- Gate **Reset to original** through `requestDiscard(() => reset(defaultValues))`
- Report dirty to the parent via `onDirtyChange?: (isDirty: boolean) => void` so leave actions outside the form can guard

**`BookingAmendmentDetails` / header back**

- Track form dirty from `onDirtyChange`
- Wrap `onBack` with `requestDiscard` so **Back to workspace** confirms when dirty
- Render one shared discard `Modal` (title + short body + Cancel / Discard buttons) owned at this level (or workspace), fed by the same hook instance used for leave — **or** keep one hook in the form for beforeunload/reset and a second for leave only if lifting a single hook is awkward; prefer **one owner**: Details tracks dirty + owns Modal + beforeunload, Form only calls `onRequestReset` / reports dirty. Pick the smaller diff: Form owns beforeunload + reset confirm; Details owns leave confirm via dirty callback + its own Modal/hook. Avoid duplicating beforeunload.

Preferred single ownership:

- Lift dirty reporting: Form → Details via `onDirtyChange`
- Details owns `useUnsavedChangesProtection(isDirty)` (beforeunload + Modal)
- Pass `requestDiscard` down to Form for reset, and use it for Back
- Export or keep `requestDiscard` available for future **Load latest booking** conflict action (same API; no conflict UI in this task)

### 3. README note

Add a short **Unsaved-change / browser navigation** note to `README.md`: custom UI can guard in-app leave/reset; `beforeunload` is browser-controlled (message text often ignored; not all navigations are interceptable). Satisfies “recorded for the README task.”

## Reuse

- `Modal` + `Button` for confirm UI
- Existing RHF `isDirty` / `reset` from task 05
- Local workflow state only (no global store)

## Out of scope

- Conflict dialog / load-latest UI (later task) — only ensure the same `requestDiscard` path is reusable
- Save Draft, Recalculate, Submit, App Router `useBlocker` (leave is local shell state today)
- New libraries

## Validation

- Tests: dirty → beforeunload listener registered; clean → not registered; reset/back ask then proceed; clean actions do not open Modal; cancel keeps draft
- Update existing AmendmentForm / Details tests as needed
- Lint + affected Jest tests

## Risk

- Dirty lives inside the form today; must surface to Details for Back without lifting the whole form
- Conflict scenario cannot be exercised in UI until later; cover via reusable `requestDiscard` + unit tests
