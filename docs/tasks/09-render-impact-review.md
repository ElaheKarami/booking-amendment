# 09 — Render Impact Review and Blocking States

## Specs

- [Impact Assessment overview](../specs/impact-assessment/overview.md)
- [Impact Assessment states](../specs/impact-assessment/states.md)
- [Impact Assessment permissions](../specs/impact-assessment/permissions.md)

## Dependencies

08 — Implement Impact Assessment Lifecycle

## Implementation Steps

1. Display schedule feasibility and warnings, equipment availability and unavailable items, charge totals/difference/line items, approval requirements, and validation messages.
2. Distinguish field validation errors, information, warnings, blocking errors, charge changes, and approval requirements.
3. Restrict detailed charge-impact visibility to Commercial Reviewer or Operations Supervisor.
4. Keep submission blocked whenever a blocking business error exists.

## Acceptance Criteria

- [x] Each impact category is visibly distinguishable.
- [x] An error-severity validation blocks submission.
- [x] Previous stale results are visibly identified as outdated.
- [x] Detailed charge lines respect the required role gating.
