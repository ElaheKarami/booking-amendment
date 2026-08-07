# States

## Authenticated

A mocked current user is available and the workspace can apply UI-level permission checks.

## Unauthenticated

The session is not valid at the authentication boundary.

## Forbidden

The current user lacks the role required by a UI action. Display a permission state; do not treat UI gating as API authorisation.

## Session Expiry

Document production session-expiry handling in the README.
