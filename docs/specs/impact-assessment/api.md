# API

## Endpoint

`POST /api/bookings/:id/amendments/assess`

## Request

```ts
type AssessAmendmentRequest = {
  bookingId: string;
  baseVersion: number;
  amendment: BookingAmendmentDraft;
};
```

## Response

The response contains schedule feasibility and warnings, equipment availability and unavailable items, current and revised totals, charge difference and line items, currency, approvals, validation messages with optional field and severity, and an assessment version.

## Query Key

```ts
["booking-amendment-assessment", { bookingId, draftFingerprint }]
```

## Mock Behaviours

- Normal response
- Business validation error
- Slow response
- Timeout
- Out-of-order assessment responses

## Error Handling

Normalise infrastructure errors into application states. Do not send raw transport errors to components.
