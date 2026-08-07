# Amendment Submission Flow

## Submit

User selects Submit

↓

Require online status, Operations User permission, valid current assessment, and no blocking error

↓

Send amendment with an idempotency key

↓

Handle succeeded, rejected, conflict, or unknown result

## Conflict

API returns 409 Conflict

↓

Preserve the draft and explain the booking changed

↓

Allow latest-booking load with unsaved-change protection

↓

Require recalculation and do not silently overwrite the newer version

↓

Optionally compare the draft, previously loaded booking, and latest version

## Unknown Result

Sent request times out

↓

Show “Submission status unknown” and the reference or idempotency key

↓

Allow status check, return to booking, or only safe retry
