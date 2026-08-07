# 02 — Add Mocked Authentication and Permissions

## Specs

- [Authentication overview](../specs/authentication/overview.md)
- [Authentication flow](../specs/authentication/flow.md)
- [Authentication API](../specs/authentication/api.md)
- [Authentication permissions](../specs/authentication/permissions.md)

## Dependencies

01 — Create Project Foundation

## Implementation Steps

1. Create a mocked `CurrentUser` with ID, display name, and the three specified roles.
2. Add the authentication boundary before the protected workspace renders.
3. Add UI-level gates for amendment editing, submission, eligible-warning override, and detailed charge-impact viewing.
4. Keep API authorisation as a documented back-end responsibility.

## Acceptance Criteria

- [x] Operations User can edit and submit.
- [x] Operations Supervisor can override eligible warnings and view detailed charge impact.
- [x] Commercial Reviewer can view detailed charge impact.
- [x] A missing or invalid session reaches the authentication boundary.
- [x] No token is exposed to browser JavaScript, `localStorage`, or `sessionStorage`.
