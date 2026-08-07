# Shipment Booking Amendment & Charge Impact Workspace
**Senior Front-End Technical Challenge — Working Plan**
Target: Senior Front-End Engineer (React / Next.js) · Effort: 15–20 hours

---

## 🎯 The One Flow You're Building

> A booking already exists. An operations user changes selected shipment details, reviews the financial and operational impact, resolves validation issues, and submits the amendment for approval.

```
Open Booking → Load Current Version → Edit Fields → Recalculate Impact
→ Review Validation & Charges → Resolve Blocking Issues → Submit
→ Handle Success / Conflict / Unknown Result
```

**Do NOT build:** booking creation, customer/vessel/voyage admin, real charge engine, real Keycloak, approval workflow, microfrontends, monorepo, mobile, design system, offline submission. (Full list in §Out of Scope.)

---

## ⏱ Time Budget (19h total)

| Phase | Area | Time |
|---|---|---|
| 1 | Architecture + project setup | 2h |
| 2 | Amendment form + validation | 4h |
| 3 | Impact-assessment workflow | 3h |
| 4 | Conflict + submission handling | 3h |
| 5 | State management + performance | 2h |
| 6 | Testing | 3h |
| 7 | Documentation + diagrams | 1.5h |
| 8 | AI usage documentation | 0.5h |

---

## 🏗 Tech Stack (recommended / expected)

- **Next.js App Router** (required)
- **TanStack Query** — server state
- **React Hook Form + Zod** — form state + schema validation (alternatives OK if justified)
- **Local React state / Zustand-RTK only where justified** — workflow state
- **Mock APIs:** Next.js Route Handlers or MSW

**Golden rule:** server state ≠ form state ≠ workflow state. Never duplicate server entities in a global store. Never mutate the original server response.

---

## 📦 Phase 1 — Setup & Architecture (2h)

- [ ] Next.js App Router project, TypeScript strict
- [ ] Decide Server vs Client Component split and write it down:
  ```
  Server Component
  ├── Validate session (mock)
  ├── Load booking identity
  ├── Load initial booking snapshot
  └── Render initial shell

  Client Workspace
  ├── Form state
  ├── Impact-assessment lifecycle
  ├── Dirty-state tracking
  ├── Conflict handling
  └── Submission workflow
  ```
- [ ] Module boundaries: `domain/` (types, pure logic), `api/` (mock + client), `features/amendment/`, `lib/telemetry`
- [ ] Mock authenticated user + roles (see §Auth)

### Layout target (single workspace, not multiple pages)

```
┌──────────────────────────────────────────────────────┐
│ Booking Header: No. | Status | Version | Updated     │
├──────────────────────────┬───────────────────────────┤
│ Amendment Form           │ Impact Assessment         │
│  Port of Discharge       │  Schedule Impact          │
│  Voyage                  │  Equipment Availability   │
│  Cargo Readiness Date    │  Charge Difference        │
│  Container Quantities    │  Validation Messages      │
│  Special Instructions    │  Approval Requirements    │
├──────────────────────────┴───────────────────────────┤
│ Unsaved Changes | Save Draft | Recalculate | Submit  │
└──────────────────────────────────────────────────────┘
```

---

## 📝 Phase 2 — Form & Validation (4h)

### Editable fields (only these)
- Port of Discharge · Planned voyage · Cargo readiness date · Container quantities · Special handling instructions

### Domain model
```ts
type BookingAmendmentDraft = {
  bookingId: string;
  baseVersion: number;
  portOfDischarge: string;
  voyageId: string;
  cargoReadinessDate: string;
  containers: Array<{
    equipmentType: "20GP" | "40GP" | "40HC";
    quantity: number;
  }>;
  specialInstructions?: string;
};
```

### Form checklist
- [ ] Typed field modelling (RHF + Zod)
- [ ] Schema-based validation
- [ ] Dynamic container rows (add/remove)
- [ ] Cross-field validation
- [ ] Dirty-state tracking
- [ ] Reset to original values
- [ ] Unsaved-change protection (see below)
- [ ] Server-side validation errors mapped back to form fields

### Cross-field rules (implement all)
1. Container quantity > 0
2. No duplicate equipment types
3. `40HC` → selected voyage must support that equipment
4. Cargo readiness date must be compatible with voyage cut-off date

Architecture must support both client-side and (mocked) server-side rules.

### Unsaved-changes protection — warn before:
- [ ] Browser refresh / tab close (`beforeunload`)
- [ ] In-app route navigation
- [ ] Reloading latest booking after a version conflict
- [ ] Resetting the form

No warnings when nothing meaningful changed. Document browser-level navigation-protection limitations in README.

---

## 🔄 Phase 3 — Impact Assessment Workflow (3h)

Triggered **only** by explicit "Recalculate" button.

### API contract
```ts
type AssessAmendmentRequest = {
  bookingId: string;
  baseVersion: number;
  amendment: BookingAmendmentDraft;
};

type AmendmentImpact = {
  schedule:  { feasible: boolean; warnings: string[] };
  equipment: { available: boolean; unavailableItems: string[] };
  charges: {
    currentTotal: number;
    revisedTotal: number;
    difference: number;
    currency: string;
    items: Array<{
      code: string;
      description: string;
      previousAmount: number;
      revisedAmount: number;
    }>;
  };
  approvals: Array<{ code: string; reason: string }>;
  validations: Array<{
    field?: string;
    severity: "info" | "warning" | "error";
    message: string;
  }>;
  assessmentVersion: string;
};
```

### Assessment state machine (CORE requirement — model it explicitly, not just via button state)
```ts
type AssessmentState =
  | { status: "not-calculated" }
  | { status: "calculating" }
  | { status: "valid"; assessmentVersion: string; result: AmendmentImpact }
  | { status: "stale"; previousResult: AmendmentImpact }
  | { status: "failed"; error: AssessmentError };
```

### Stale-assessment rule
```
Assessment calculated → user changes any relevant field
→ assessment becomes STALE → Submit disabled → must recalculate
```
- [ ] Any relevant form change marks the assessment stale
- [ ] Submission is impossible with a stale (or missing) assessment
- [ ] Out-of-order responses: a delayed old assessment must never overwrite a newer one (cancel or ignore)

### UI must visually distinguish
- [ ] Field validation errors · info messages · business warnings · **blocking** business errors · charge changes · approval requirements
- [ ] Submit blocked while ≥1 blocking error exists

---

## ⚔️ Phase 4 — Concurrency, Submission & Reliability (3h)

### 409 Version Conflict
```json
{ "code": "BOOKING_VERSION_CONFLICT", "currentVersion": 8,
  "message": "The booking was modified by another user." }
```
On conflict the UI must:
- [ ] Preserve the user's draft (never lose their work)
- [ ] Explain the booking changed
- [ ] Offer "Load latest booking"
- [ ] Make clear recalculation is required
- [ ] Never silently overwrite the newer version
- [ ] Bonus (strong): concise 3-way comparison (draft vs loaded booking vs latest) — full merge engine NOT required

### Submission command
```ts
type SubmitAmendmentCommand = {
  bookingId: string;
  baseVersion: number;
  assessmentVersion: string;
  amendment: BookingAmendmentDraft;
  idempotencyKey: string;
};
```

### Submission state machine
```ts
type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "succeeded"; amendmentId: string }
  | { status: "rejected"; reason: string }
  | { status: "conflict"; currentVersion: number }
  | { status: "unknown"; idempotencyKey: string };
```

### Reliability checklist — handle:
- [ ] Double-click · repeated submission · browser retry · slow response · timeout · unknown result

### Idempotency — README must explain:
- [ ] What idempotency means
- [ ] What the front end can handle vs what the back end must guarantee
- [ ] Why a disabled button alone is insufficient
- [ ] How the same submission is safely recognised after retry

### Unknown-result handling (timeout after send ≠ failure!)
Show explicit "Submission status unknown" state where the user can:
- [ ] Check submission status (`GET /api/amendment-submissions/:id/status`)
- [ ] Return to the booking
- [ ] Retry only when the system says it's safe
- [ ] See the submission reference / idempotency key

**No naive optimistic update for submission.**

---

## 🗄 Phase 5 — Server State & Performance (2h)

### TanStack Query requirements
- [ ] Clear query-key design:
  ```ts
  ["booking", bookingId]
  ["voyages", { portOfLoading, portOfDischarge, readinessDate, search }]
  ["booking-amendment-assessment", { bookingId, draftFingerprint }]
  ["amendment-submission-status", submissionId]
  ```
- [ ] Cache handling · mutation handling · query invalidation
- [ ] Retry policy · request cancellation · error normalisation
- [ ] Stale-response overwrite prevention

### Performance — implement ≥3 (pick what's justified):
- [ ] Dynamic import of charge-impact panel
- [ ] Avoid form-wide re-renders (no global form subscriptions)
- [ ] Stable query keys
- [ ] Memoised derived charge summaries
- [ ] Cancel outdated assessment requests
- [ ] Debounced voyage search
- [ ] Lazy-load comparison UI
- [ ] Bundle analysis · reduced client JS · virtualised charge lines · incremental rendering

### README scale explanation — how would the app behave with:
200 container rows · 500 charge items · thousands of voyage results · multiple messages per field · rapid repeated assessment requests
→ Cover: virtualisation, server-side search, pagination/grouping, request cancellation, avoiding global form subscriptions, avoiding derived-state recompute.

### PWA / network awareness (light — no offline transactions)
- [ ] Online/offline indicator
- [ ] Safe behaviour when going offline · block submission while offline
- [ ] Clear recovery after reconnection · no misleading success states
- [ ] Cache policy (explain in README):

| Resource | Strategy |
|---|---|
| Static assets | Cache First |
| App shell | Precache |
| Booking data | Network First |
| Voyage search | Network First |
| Impact assessment | **Network Only** |
| Amendment submission | **Network Only** |
| Submission status | Network First |

A cached assessment is never "current" just because it's cached.

---

## 🔌 Mock APIs

Endpoints:
```
GET  /api/bookings/:id
GET  /api/voyages
POST /api/bookings/:id/amendments/assess
POST /api/bookings/:id/amendments
GET  /api/amendment-submissions/:id/status
GET  /api/bookings/:id/latest-version
```

Mock layer must simulate: normal response · business validation error · slow response · version conflict · timeout · unknown result · duplicate submission · **out-of-order assessment responses**.
(Tip: control via query param or header, e.g. `?scenario=conflict`, so review demos and E2E tests are deterministic.)

### Error model — never pass raw transport errors into components
```ts
type ApplicationError =
  | { type: "validation"; fields: Record<string, string[]> }
  | { type: "business-rule"; code: string; message: string }
  | { type: "conflict"; currentVersion: number }
  | { type: "network"; retryable: boolean }
  | { type: "unknown"; message: string };
```

---

## 🔐 Auth (mocked, but designed)

```ts
type CurrentUser = {
  id: string;
  displayName: string;
  roles: Array<"operations-user" | "operations-supervisor" | "commercial-reviewer">;
};
```

| Action | Required Role |
|---|---|
| Edit amendment | Operations User |
| Submit amendment | Operations User |
| Override eligible warning | Operations Supervisor |
| View detailed charge impact | Commercial Reviewer or Supervisor |

README must explain the production design: Keycloak · OIDC · Auth Code Flow + PKCE · Next.js BFF · HttpOnly secure cookies · token refresh · backend permission enforcement · role/permission claims · session expiry.
**UI checks = UX only; the API enforces authorisation.** Never store access tokens in localStorage.

---

## 📊 Observability

```ts
interface Telemetry {
  track(event: string, properties?: Record<string, unknown>): void;
  captureError(error: unknown, context?: Record<string, unknown>): void;
}
```

Track at minimum:
```
booking_amendment_opened      impact_assessment_failed
booking_amendment_changed     assessment_became_stale
impact_assessment_requested   amendment_submission_started
impact_assessment_succeeded   amendment_version_conflict
amendment_submission_unknown  amendment_submission_succeeded
```

Keep telemetry outside business/component logic. **Never log sensitive booking/customer data.**

---

## 🧪 Phase 6 — Testing (3h)

Minimum: **3 unit + 3 component/integration + 1 E2E**.

### Unit test candidates (pick 3+)
- [ ] Staleness detection
- [ ] Charge-difference calculation
- [ ] Server validation errors → form-field mapping
- [ ] "Is submission allowed" logic
- [ ] Stable draft fingerprint
- [ ] Workflow state transitions

### Integration test candidates (pick 3+)
- [ ] Editing form invalidates previous assessment
- [ ] Blocking validation prevents submission
- [ ] Version conflict preserves draft
- [ ] Timeout → unknown-result state
- [ ] Delayed old assessment doesn't overwrite newer one
- [ ] Offline blocks submission

### Required E2E happy path
```
Open Booking → Change Container Quantity → Recalculate
→ Review Charge Difference → Submit → Success
```
Conflict or unknown-result E2E = optional but high-value.

### ❌ Flakiness rule — banned:
```ts
await page.waitForTimeout(3000); // NEVER
```
Wait on: named API response · visible UI state · network event · final workflow status · deterministic state transition.

---

## 📄 Phase 7 — README (1.5h)

Required sections (use as headings):
1. Problem Understanding
2. Architecture & Module Boundaries
3. Next.js Rendering Decisions
4. Form & State Management
5. Impact-Assessment Lifecycle
6. Stale-Assessment Strategy
7. Concurrency & Conflict Handling
8. Submission Reliability & Idempotency
9. Authentication & Authorisation
10. Testing Strategy
11. Performance Decisions
12. Observability
13. Trade-offs
14. Production Improvements

Plus: **≥1 architecture diagram** and **≥1 sequence diagram** (Mermaid is fine), e.g.:
```
User → Amendment Workspace → Impact Assessment API
→ Validation + Charge Calc → Assessment Version
→ Submit Amendment → Success / Conflict / Unknown
```

---

## 🤖 Phase 8 — AI_USAGE.md (0.5h)

AI use is encouraged and evaluated (7/100 points). Document as you go — don't reconstruct at the end.

Required sections:
1. AI Tools Used
2. AI-Assisted Areas
3. Architecture Prompts
4. Implementation Prompts
5. Testing Prompts
6. Prompt Iterations
7. Outputs Rejected or Modified
8. Validation Methods
9. Limitations Encountered
10. Lessons Learned

Must include: **2 architecture prompts · 2 implementation prompts · 1 testing prompt · 1 rejected/heavily-modified AI output**.

### What a good prompt looks like (they will judge this)
❌ Weak: *"Build a booking amendment page in Next.js."*

✅ Strong: give role + goal + explicit constraints (draft/booking separation, staleness rule, assessment-version requirement, 409/unknown handling, TanStack Query, no form state in global store) and ask for: state model, transitions, failure cases, module boundaries, trade-offs, testing implications.

Be ready to explain: why the final architecture was chosen, which AI suggestions you rejected/modified, which decisions were manual, how generated code was tested, where you disagreed with the AI, remaining risks. **You must be able to modify and defend any part live.**

---

## 📦 Deliverables Checklist

- [ ] Source-code repository
- [ ] Setup & run instructions
- [ ] Working Next.js app
- [ ] Mock APIs (all scenarios)
- [ ] Automated tests (3 + 3 + 1)
- [ ] Architecture diagram
- [ ] Sequence diagram
- [ ] Technical README (14 sections)
- [ ] AI_USAGE.md
- [ ] Known limitations
- [ ] Production improvement recommendations

---

## 🏆 Scoring (100 pts) — where to invest

| Area | Pts |
|---|---|
| Architecture & separation of concerns | **18** |
| Concurrency, idempotency & reliability | **15** |
| Complex form & workflow modelling | **14** |
| React/Next.js implementation quality | **13** |
| Server-state & cache management | **12** |
| Testing quality & flakiness control | **10** |
| AI-assisted engineering & prompts | 7 |
| Performance decisions | 6 |
| Documentation & trade-off analysis | 5 |

→ ~59 pts sit in architecture + reliability + form/workflow + server-state. Prioritise those over UI polish.

---

## ✅ Senior Signals (aim for these)
Explicit state-machine thinking · booking/draft/assessment/submission kept separate · correct stale handling · draft preserved on conflict · no naive optimistic submit · clear unknown-result handling · controlled query invalidation · typed domain boundaries · minimal justified global state · safe request cancellation · deterministic tests · documented trade-offs · strong AI-output ownership.

## 🚩 Red Flags (self-audit before submitting)
- [ ] ✗ One giant workflow component
- [ ] ✗ Mutating the original server response
- [ ] ✗ Submitting with a stale assessment
- [ ] ✗ Disabled button as the only idempotency measure
- [ ] ✗ Draft lost after 409
- [ ] ✗ Timeout treated as definite failure
- [ ] ✗ All API data in Redux/Zustand
- [ ] ✗ API calls scattered across UI components
- [ ] ✗ Fixed waits in E2E
- [ ] ✗ Tokens in localStorage
- [ ] ✗ Logging sensitive data
- [ ] ✗ No explicit failure-state modelling
- [ ] ✗ Scope creep beyond the one flow
- [ ] ✗ AI code you can't explain / vague prompts / hidden AI usage

---

## 🎤 Final Review Session — rehearse these
1. Present architecture in 10–15 min
2. Demo the primary amendment workflow
3. Trigger a version conflict live
4. Trigger an unknown submission result live
5. Explain stale-assessment handling
6. Explain server-state vs form-state boundaries
7. Defend the rendering strategy (Server vs Client Components)
8. Explain ≥1 performance optimisation
9. Run selected tests live
10. Present the AI-assisted workflow + one rejected AI suggestion
11. Modify a small part of the code live
