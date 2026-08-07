# States

## Idle

No submission has been attempted.

## Submitting

The request is in flight.

## Succeeded

The amendment was accepted and returns an amendment ID.

## Rejected

The amendment was rejected with a reason.

## Conflict

The booking version changed. Preserve the draft and offer latest-booking load.

## Unknown

The request was sent but the result is unknown. Do not report definite failure; show the idempotency key and status-check options.

## Application Errors

- Validation with field messages
- Business rule with code and message
- Conflict with current version
- Network with retryability
- Unknown with message
