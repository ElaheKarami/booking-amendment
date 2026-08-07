# Amendment Submission

## Purpose

Submit a booking amendment reliably after impact assessment while handling idempotency, concurrency conflict, timeout, and unknown results.

## Goals

- Require a current valid assessment version and no blocking error.
- Address double-click, repeated submission, browser retry, slow response, and timeout.
- Preserve the draft when the booking was changed by another user.
- Treat a sent request that times out as an unknown result, not definite failure.
- Allow submission-status checks and only safe retry.

## Entry Points

- Booking Amendment Workspace → Submit
- Conflict handling
- Unknown-result handling

## Components

- Submit action
- Submission status
- Conflict comparison
- Unknown-result status

## Dependencies

- Booking amendment draft
- Valid assessment version
- Submission, submission-status, and latest-booking APIs
