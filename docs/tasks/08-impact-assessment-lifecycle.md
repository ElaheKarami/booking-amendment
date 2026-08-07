# 08 — Implement Impact Assessment Lifecycle

## Specs

- [Impact Assessment overview](../specs/impact-assessment/overview.md)
- [Impact Assessment flow](../specs/impact-assessment/flow.md)
- [Impact Assessment API](../specs/impact-assessment/api.md)
- [Impact Assessment states](../specs/impact-assessment/states.md)

## Dependencies

07 — Add Voyage Selection and Validation

## Implementation Steps

1. Recalculate only after the user explicitly selects Recalculate.
2. Send booking ID, base version, and amendment draft.
3. Model not-calculated, calculating, valid, stale, and failed assessment states.
4. Cancel or safely ignore superseded assessment requests using the draft fingerprint.
5. Mark valid assessment stale on every relevant form change and retain the previous result for review.

## Acceptance Criteria

- [ ] Submission is disabled before assessment, while calculating, after failure, and while stale.
- [ ] An outdated response cannot replace the current assessment.
- [ ] Recalculate sends the current draft and produces a valid assessment version.
