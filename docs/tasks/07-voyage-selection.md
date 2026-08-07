# 07 — Add Voyage Selection and Validation

## Specs

- [Voyages overview](../specs/voyages/overview.md)
- [Voyages flow](../specs/voyages/flow.md)
- [Voyages API](../specs/voyages/api.md)

## Dependencies

05 — Build the Amendment Form

## Implementation Steps

1. Load voyage options using Port of Loading, selected Port of Discharge, readiness date, and search input.
2. Add debounced voyage search.
3. Revalidate readiness-date cut-off and 40HC equipment support after voyage selection.
4. Mark an existing valid assessment stale when voyage inputs change.

## Acceptance Criteria

- [ ] Voyage loading supports loading, empty, success, and error states.
- [ ] Search does not fire on every keystroke.
- [ ] Invalid cut-off date or unsupported 40HC selection is shown as form validation.
