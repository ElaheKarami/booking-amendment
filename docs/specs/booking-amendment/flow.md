# Booking Amendment Flow

## Primary Flow

Open Existing Booking

↓

Load Current Booking Version

↓

Edit Selected Fields

↓

Run Impact Assessment

↓

Review Validation and Charge Changes

↓

Resolve Blocking Issues

↓

Submit Amendment

↓

Handle Success, Conflict, or Unknown Result

---

## Impact Assessment

User selects Recalculate

↓

Send booking ID, base version, and amendment draft

↓

Receive schedule feasibility, equipment availability, charge changes, approval requirements, validation results, and assessment version

↓

Clearly distinguish field validation errors, informational messages, business warnings, blocking business errors, charge changes, and approval requirements

↓

Block submission when a blocking error exists

---

## Stale Assessment

Assessment calculated

↓

User changes a relevant form value

↓

Mark the existing assessment stale in the application model

↓

Disable submission

↓

Require Recalculate before submission

---

## Version Conflict

Submit amendment

↓

API returns 409 Conflict

↓

Preserve the current draft

↓

Explain that the booking changed

↓

Allow loading the latest booking

↓

Clearly indicate that recalculation is required

↓

Do not silently overwrite the newer booking version

↓

Optionally show a concise comparison of the user draft, previously loaded booking, and latest booking version

---

## Unknown Submission Result

Request is sent

↓

Response times out

↓

Show “Submission status unknown,” not a definite failure

↓

Allow the user to check status, return to the booking, or retry only when safe

↓

Show the submission reference or idempotency key

---

## Unsaved Changes

Meaningful form change occurs

↓

Warn before browser refresh, closing the tab, route navigation, loading the latest booking after a conflict, or form reset

↓

Do not warn when no meaningful change exists

---

## Network Resilience

User becomes offline

↓

Show offline status and prevent submission

↓

After reconnection, show clear recovery behavior without treating a previous assessment as current only because it is cached

---

## Required End-to-End Flow

Open Booking

↓

Change Container Quantity

↓

Recalculate Impact

↓

Review Charge Difference

↓

Submit Amendment

↓

Receive Success
