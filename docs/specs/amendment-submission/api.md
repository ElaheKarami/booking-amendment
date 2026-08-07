# API

## Endpoints

- `POST /api/bookings/:id/amendments`
- `GET /api/amendment-submissions/:id/status`
- `GET /api/bookings/:id/latest-version`

## Command

```ts
type SubmitAmendmentCommand = {
  bookingId: string;
  baseVersion: number;
  assessmentVersion: string;
  amendment: BookingAmendmentDraft;
  idempotencyKey: string;
};
```

## Conflict

The API may return `409 Conflict` with `BOOKING_VERSION_CONFLICT`, the current version, and a message that another user modified the booking.

## Query Key

```ts
["amendment-submission-status", submissionId]
```

## Mock Behaviours

- Normal response
- Business validation error
- Slow response
- Version conflict
- Timeout
- Unknown submission result
- Duplicate submission

## Idempotency

The front end attaches the idempotency key and prevents avoidable duplicate interactions. The back end guarantees recognition of repeated requests with the same key; disabling a button alone is insufficient.
