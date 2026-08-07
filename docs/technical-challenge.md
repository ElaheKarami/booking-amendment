# **Senior Front-End Technical Challenge** 

## **Shipment Booking Amendment & Charge Impact Workspace** 

### **Target Role** 

Senior Front-End Engineer — React / Next.js 

### **Expected Effort** 

#### **15–20 hours** 

# **1. Challenge Objective** 

Design and implement a focused but technically deep workspace for managing a **shipment booking amendment** in an enterprise shipping platform. 

The challenge is intentionally limited to one business flow: 

A booking already exists. An operations user changes selected shipment details, reviews the financial and operational impact, resolves validation issues, and submits the amendment for approval. 

The objective is not to build a broad logistics application. The focus is on: 

- Complex form and state modelling 

- Server-state and client-state separation 

- Next.js rendering decisions 

- Asynchronous validation 

- Concurrency handling 

- Unsaved changes 

- Reliable submission 

- Performance 

- Testing 

- Enterprise-grade error handling 

- Effective AI-assisted software development 

This challenge is aligned with the candidate’s stated experience in Next.js, React, TypeScript, PWA, performance optimisation, state management, SSR, reusable component systems and production-scale applications. 

# **2. Business Scenario** 

An operations user opens an existing shipment booking and requests an amendment. 

The booking contains: 

- Booking number 

- Customer 

- Port of Loading 

- Port of Discharge 

- Planned vessel and voyage 

- Cargo readiness date 

- Container requirements 

- Shipment terms 

- Current estimated charges 

- Current booking version 

The user may change only the following fields: 

- Port of Discharge 

- Planned voyage 

- Cargo readiness date 

- Container quantities 

- Special handling instructions 

Each change may affect: 

- Schedule feasibility 

- Equipment availability 

- Estimated charges 

- Required approvals 

- Business validation results 

The user must review these impacts before submitting the amendment. 

# **3. Main User Flow** 

```
Open Existing Booking
```

```
→ Load Current Booking Version
```

> `→ Edit Selected Fields` 

> `→ Run Impact Assessment` 

```
→ Review Validation and Charge Changes
→ Resolve Blocking Issues
→ Submit Amendment
→ Handle Success, Conflict, or Unknown Result
```

# **4. Required Workspace** 

Build a single primary workspace rather than multiple unrelated pages. 

A suggested layout: 

```
+----------------------------------------------------------------+
| Booking Header                                                 |
| Booking No. | Status | Version | Last Updated                  |
+----------------------------------+-----------------------------+
| Amendment Form                   | Impact Assessment           |
|                                  |                             |
| Port of Discharge                | Schedule Impact             |
| Voyage                           | Equipment Availability      |
| Cargo Readiness Date             | Charge Difference           |
| Container Quantities             | Validation Messages         |
| Special Instructions             | Approval Requirements       |
|                                  |                             |
+----------------------------------+-----------------------------+
| Unsaved Changes | Save Draft | Recalculate | Submit            |
+----------------------------------------------------------------+
```

The exact visual design is flexible, but the interaction model should remain clear and focused. 

# **5. Booking Amendment Model** 

A simplified domain model may look like this: 

```
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
```

```
};
```

The original booking and the amendment draft must remain distinguishable. 

The original server response must not be mutated directly. 

# **6. Impact Assessment** 

The application must call a mock impact-assessment API when the user explicitly selects **Recalculate** . 

Example request: 

```
type AssessAmendmentRequest = {
  bookingId: string;
  baseVersion: number;
  amendment: BookingAmendmentDraft;
};
```

Example response: 

```
type AmendmentImpact = {
  schedule: {
    feasible: boolean;
    warnings: string[];
  };
  equipment: {
    available: boolean;
    unavailableItems: string[];
  };
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
  approvals: Array<{
    code: string;
    reason: string;
```

```
  }>;
  validations: Array<{
    field?: string;
    severity: "info" | "warning" | "error";
    message: string;
  }>;
  assessmentVersion: string;
};
```

## **Required Behaviour** 

The UI must clearly distinguish between: 

- Field validation errors 

- Informational messages 

- Business warnings 

- Blocking business errors 

- Charge changes 

- Approval requirements 

Submission must be blocked when there is at least one blocking error. 

# **7. Stale Assessment Handling** 

This is one of the core requirements. 

After an impact assessment has been calculated, the user may modify the form again. 

The previous impact result must then be marked as **stale** . 

```
Assessment calculated
→ User changes container quantity
→ Existing assessment becomes stale
→ Submission is disabled
→ User must recalculate
```

The solution must prevent the user from submitting an amendment based on an outdated assessment. 

This should be represented explicitly in the application model rather than only through button state. 

A possible state model: 

```
type AssessmentState =
  | { status: "not-calculated" }
  | { status: "calculating" }
  | {
      status: "valid";
      assessmentVersion: string;
      result: AmendmentImpact;
    }
  | {
      status: "stale";
      previousResult: AmendmentImpact;
    }
  | {
      status: "failed";
      error: AssessmentError;
    };
```

# **8. Concurrency and Version Conflict** 

The booking may be modified by another user while the amendment workspace is open. 

The submit API may return: 

```
409 Conflict
```

Example response: 

```
{
  "code": "BOOKING_VERSION_CONFLICT",
  "currentVersion": 8,
  "message": "The booking was modified by another user."
}
```

## **Required Behaviour** 

When a conflict occurs, the UI must: 

- Preserve the user’s current draft 

- Explain that the booking has changed 

- Allow the user to load the latest booking 

- Clearly indicate that recalculation is required 

- Avoid silently overwriting the newer version 

A strong implementation may show a concise comparison between: 

- The user’s amendment draft 

- The previously loaded booking 

- The latest booking version 

A complete merge engine is not required. 

# **9. Submission Reliability** 

The submit operation must address: 

- Double-click 

- Repeated submission 

- Browser retry 

- Slow response 

- Request timeout 

- Unknown submission result 

A recommended command: 

```
type SubmitAmendmentCommand = {
  bookingId: string;
  baseVersion: number;
  assessmentVersion: string;
  amendment: BookingAmendmentDraft;
  idempotencyKey: string;
};
```

## **Idempotency** 

The solution must explain: 

- What idempotency means 

- What can be handled by the front end 

- What must be guaranteed by the back end 

- Why disabling a button alone is insufficient 

- How the same submission can safely be recognised after retry 

# **10. Unknown Submission Result** 

If the request times out after being sent, the UI must not immediately report a definite failure. 

Instead, it should display an explicit state: 

```
Submission status unknown
```

The user should be able to: 

- Check submission status 

- Return to the booking 

- Retry only when the system determines it is safe 

- See the submission reference or idempotency key 

A recommended submission state model: 

```
type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "succeeded";
      amendmentId: string;
    }
  | {
      status: "rejected";
      reason: string;
    }
  | {
      status: "conflict";
      currentVersion: number;
    }
  | {
      status: "unknown";
      idempotencyKey: string;
    };
```

# **11. Form Complexity** 

The amendment form must include: 

- Typed field modelling 

- Schema-based validation 

- Dynamic container rows 

- Cross-field validation 

- Dirty-state tracking 

- Reset to original values 

- Unsaved-change protection 

- Server-side validation mapping 

React Hook Form with Zod is recommended, but alternatives are acceptable when justified. 

## **Example Cross-Field Rules** 

```
Container quantity must be greater than zero.
```

```
Duplicate equipment types must not be added.
```

```
If equipment type is 40HC,
the selected voyage must support that equipment.
```

```
Cargo readiness date must be compatible
with the selected voyage cut-off date.
```

The business validation may be mocked, but the architecture should support both client-side and server-side rules. 

# **12. Unsaved Changes** 

The application must warn the user before: 

- Browser refresh 

- Closing the tab 

- Navigating to another route 

- Reloading the latest booking after a version conflict 

- Resetting the form 

The application should not show unnecessary warnings when no meaningful change has occurred. 

The README should explain limitations associated with browser-level navigation protection. 

# **13. State Management** 

The solution must clearly separate server state, form state and workflow state. 

## **Server State** 

Examples: 

- Existing booking 

- Voyage options 

- Equipment availability 

- Impact assessment 

- Latest booking version 

- Submission status 

Recommended tool: 

- TanStack Query 

## **Form State** 

Examples: 

- Amendment values 

- Dirty fields 

- Validation errors 

- Dynamic container rows 

Recommended tool: 

- React Hook Form or equivalent 

## **Local Workflow State** 

Examples: 

- Selected panel 

- Confirmation dialogue 

- Conflict dialogue 

- Comparison mode 

- Temporary UI status 

Recommended tools: 

- Local React state 

- Zustand or Redux Toolkit only where justified 

Server entities should not be unnecessarily duplicated in a global store. 

# **14. Server-State Requirements** 

The implementation should demonstrate: 

- Clear query-key design 

- Cache handling 

- Mutation handling 

- Query invalidation 

- Retry policy 

- Request cancellation 

- Error normalisation 

- Prevention of stale-response overwrite 

Example query keys: 

```
["booking", bookingId]
["voyages", {
  portOfLoading,
  portOfDischarge,
  readinessDate,
  search
}]
["booking-amendment-assessment", {
  bookingId,
  draftFingerprint
}]
["amendment-submission-status", submissionId]
```

Outdated assessment requests should be cancelled or ignored safely. 

# **15. Next.js Requirements** 

Use **Next.js App Router** . 

The candidate must make explicit decisions regarding: 

- Server Components 

- Client Components 

- Initial booking data 

- Authentication boundary 

- Data fetching 

- Loading boundaries 

- Error boundaries 

- Hydration 

- Caching 

A reasonable approach might be: 

```
Server Component
├── Validate session
├── Load booking identity
├── Load initial booking snapshot
```

```
└── Render initial shell
Client Workspace
├── Form state
├── Impact-assessment lifecycle
├── Dirty-state tracking
├── Conflict handling
└── Submission workflow
```

The exact implementation is not prescribed, but the candidate must explain the trade-offs. 

# **16. Authentication and Authorisation Design** 

A live Keycloak environment is not required. 

Implement a mocked authenticated user: 

```
type CurrentUser = {
  id: string;
  displayName: string;
  roles: Array<
    | "operations-user"
    | "operations-supervisor"
    | "commercial-reviewer"
  >;
};
```

Suggested permissions: 

**Action Required Role** Edit amendment Operations User Submit amendment Operations User Override eligible warning Operations Supervisor View detailed charge impact Commercial Reviewer or Supervisor 

The README must explain how the production solution would use: 

- Keycloak 

- OpenID Connect 

- Authorisation Code Flow with PKCE 

- Next.js BFF 

- HttpOnly secure cookies 

- Token refresh 

- Back-end permission enforcement 

- Role or permission claims 

- Session expiry handling 

UI-level permission checks are for user experience only. The API must enforce authorisation. 

# **17. Performance Requirements** 

The challenge should not become a broad performance exercise. Optimisation should be applied only where it is technically justified. 

Implement at least three of the following: 

- Dynamic loading of the charge-impact panel 

- Avoiding unnecessary form-wide re-renders 

- Stable query keys 

- Memoised derived charge summaries 

- Cancellation of outdated assessment requests 

- Debounced voyage search 

- Lazy loading of the booking-comparison UI 

- Bundle analysis 

- Reduced client-side JavaScript 

- Virtualised charge-line rendering 

- Incremental rendering of large result sets 

## **Required Explanation** 

The README should explain how the application would behave if: 

- A booking contained 200 container rows 

- An assessment returned 500 charge items 

- Voyage search returned thousands of results 

- Several validation messages were attached to a single field 

- Multiple assessment requests were triggered in quick succession 

Expected considerations include: 

- Virtualisation 

- Server-side search 

- Pagination or grouping 

- Request cancellation 

- Avoiding global form subscriptions 

- Avoiding unnecessary derived-state recalculation 

- Maintaining responsive interaction 

# **18. PWA and Network Resilience** 

A complete offline transaction workflow is not required. 

However, the application should demonstrate appropriate network awareness. 

Implement at least: 

- Online and offline indicator 

- Safe handling when the user becomes offline 

- Prevention of amendment submission while offline 

- Clear recovery behaviour after reconnection 

- Protection against misleading success states 

The candidate should explain which data, if any, may safely be cached. 

#### Suggested policy: 

|**Resource**|**Suggested Strategy**|
|---|---|
|Static assets|Cache First|
|Application shell|Precache|
|Booking data|Network First|
|Voyage search|Network First|
|Impact assessment|Network Only|
|Amendment submission|Network Only|
|Submission status|Network First|



A previous assessment must not be treated as current solely because it exists in cache. 

# **19. Mock APIs** 

The candidate may implement mock APIs using: 

- Next.js Route Handlers 

- Mock Service Worker 

- A lightweight mock server 

Required endpoints may include: 

```
GET  /api/bookings/:id
GET  /api/voyages
POST /api/bookings/:id/amendments/assess
```

```
POST /api/bookings/:id/amendments
GET  /api/amendment-submissions/:id/status
GET  /api/bookings/:id/latest-version
```

The mock layer must support: 

- Normal response 

- Business validation error 

- Slow response 

- Version conflict 

- Timeout 

- Unknown submission result 

- Duplicate submission 

- 

- Out-of-order assessment responses 

# **20. Error Modelling** 

Avoid passing raw transport errors directly into components. 

A possible model: 

```
type ApplicationError =
  | {
      type: "validation";
      fields: Record<string, string[]>;
    }
  | {
      type: "business-rule";
      code: string;
      message: string;
    }
  | {
      type: "conflict";
      currentVersion: number;
    }
  | {
      type: "network";
      retryable: boolean;
    }
  | {
      type: "unknown";
      message: string;
    };
```

The candidate should demonstrate how infrastructure errors are translated into meaningful application states. 

# **21. Observability** 

Provide a small telemetry abstraction. 

```
interface Telemetry {
  track(
    event: string,
    properties?: Record<string, unknown>
  ): void;
  captureError(
    error: unknown,
    context?: Record<string, unknown>
  ): void;
}
```

Track at least: 

```
booking_amendment_opened
booking_amendment_changed
impact_assessment_requested
impact_assessment_succeeded
impact_assessment_failed
assessment_became_stale
amendment_submission_started
amendment_version_conflict
amendment_submission_unknown
amendment_submission_succeeded
```

A real monitoring platform is not required. 

Observability concerns should remain outside the core business and component logic. 

Sensitive or commercially confidential values must not be logged. 

# **22. Testing Requirements** 

Implement at least: 

- Three unit tests 

- Three component or integration tests 

- One end-to-end test 

## **Suggested Unit-Test Areas** 

- Detecting whether an assessment is stale 

- Calculating charge difference 

- Mapping server validation errors to form fields 

- Determining whether submission is allowed 

- Creating a stable draft fingerprint 

- Transitioning between workflow states 

## **Suggested Integration-Test Areas** 

- Editing the form invalidates the previous assessment 

- Blocking validation prevents submission 

- Version conflict preserves the draft 

- Timeout produces an unknown-result state 

- A delayed old assessment does not overwrite the newer result 

- Offline state prevents submission 

## **Required E2E Scenario** 

```
Open Booking
```

- `→ Change Container Quantity` 

- `→ Recalculate Impact` 

- `→ Review Charge Difference` 

- `→ Submit Amendment` 

- `→ Receive Success` 

A conflict or unknown-result scenario is optional but highly valuable. 

## **Flaky-Test Constraint** 

Fixed delays are not acceptable: 

```
await page.waitForTimeout(3000);
```

Tests must wait for: 

- Named API response 

- Visible UI state 

- Network event 

- Final workflow status 

- Deterministic state transition 

# **23. Architecture Documentation** 

#### The README must include: 

`1. Problem Understanding` 

`2. Architecture and Module Boundaries` 

`3. Next.js Rendering Decisions` 

`4. Form and State Management` 

`5. Impact-Assessment Lifecycle` 

`6. Stale-Assessment Strategy` 

`7. Concurrency and Conflict Handling` 

`8. Submission Reliability and Idempotency` 

`9. Authentication and Authorisation` 

`10. Testing Strategy` 

`11. Performance Decisions` 

`12. Observability` 

`13. Trade-offs` 

`14. Production Improvements` 

The candidate must include at least one architecture diagram and one sequence diagram. 

#### Example sequence: 

```
User
  ↓
Amendment Workspace
  ↓
Impact Assessment API
  ↓
Validation + Charge Calculation
  ↓
Assessment Version
  ↓
Submit Amendment
  ↓
Success / Conflict / Unknown
```

# **24. AI Usage Expectations** 

The use of AI-assisted development tools is explicitly encouraged. 

Examples include: 

- ChatGPT 

- Claude 

- GitHub Copilot 

- Cursor 

- Windsurf 

- Similar AI coding or design assistants 

Effective AI usage is considered an engineering advantage. 

The candidate will not be penalised for using AI. Thoughtful and controlled AI usage will be considered a positive signal. 

The candidate remains fully responsible for: 

- Architecture 

- Correctness 

- Security 

- Testing 

- Maintainability 

- Documentation 

- Final implementation quality 

# **25. AI-Assisted Engineering Evaluation** 

We are interested in how the candidate uses AI as an engineering collaborator rather than only as a code generator. 

The evaluation includes the following areas. 

## **25.1 Architectural Prompting** 

The candidate should demonstrate the ability to construct prompts that help with: 

- Defining application boundaries 

- Modelling workflow states 

- Identifying architectural risks 

- Comparing alternative designs 

- Analysing trade-offs 

- Designing failure handling 

- Planning test strategies 

- Improving performance decisions 

## **25.2 Prompt Engineering** 

We will assess whether prompts: 

- Include sufficient business and technical context 

- Define explicit constraints 

- Separate broad architecture from implementation tasks 

- Ask for alternatives rather than one unquestioned solution 

- Request assumptions and trade-offs 

- Reduce ambiguity 

- Evolve iteratively 

- Produce outputs that can be verified 

## **25.3 AI Output Validation** 

The candidate should demonstrate how AI-generated output was reviewed. 

Examples: 

- Checking generated code against requirements 

- Verifying framework and library behaviour 

- Rejecting unsafe patterns 

- Correcting hallucinated APIs 

- Simplifying over-engineered suggestions 

- Adding missing failure states 

- Testing generated logic 

- Reviewing security-sensitive code manually 

## **25.4 Engineering Ownership** 

The candidate must be able to explain: 

- Why the final architecture was selected 

- Which AI suggestions were rejected 

- Which suggestions were modified 

- Which decisions were made manually 

- How generated code was tested 

- Where the candidate disagreed with the AI 

- What risks remain in the final solution 

The candidate should be able to modify and defend any part of the submitted solution during the review session. 

# **26. Required AI Usage Document** 

Include a document named: 

```
AI_USAGE.md
```

It should contain: 

```
1. AI Tools Used
```

`2. AI-Assisted Areas` 

`3. Architecture Prompts` 

`4. Implementation Prompts` 

`5. Testing Prompts` 

`6. Prompt Iterations` 

`7. Outputs Rejected or Modified` 

`8. Validation Methods` 

`9. Limitations Encountered` 

`10. Lessons Learned` 

#### Include at least: 

- Two architecture-related prompts 

- Two implementation-related prompts 

- One testing-related prompt 

- One example where the AI output was rejected or substantially changed 

The candidate may remove confidential account information, API keys or irrelevant conversation content. 

The objective is not to provide a complete conversation transcript. The objective is to demonstrate a structured AI-assisted engineering process. 

# **27. AI Prompt Quality Example** 

#### A weak prompt: 

```
Build a booking amendment page in Next.js.
```

#### A stronger prompt: 

```
Act as a senior front-end architect.
```

```
Design the state model for a Next.js booking-amendment workspace.
```

```
Constraints:
```

> `- The original booking and amendment draft must remain separate.` 

> `- An impact assessment becomes stale after any relevant form change.` 

- `Submission requires a valid assessment version.` 

- `The API may return 409 conflict or an unknown result after timeout.` 

- `The user draft must be preserved during conflicts.` 

- `Server state should be managed by TanStack Query.` 

- `Form state should not be duplicated in a global store.` 

```
Provide:
```

`1. State model` 

`2. State transitions` 

`3. Failure cases` 

`4. Suggested module boundaries` 

`5. Trade-offs` 

`6. Testing implications` 

We value the candidate’s ability to create the second type of prompt and critically assess the result. 

# **28. Out of Scope** 

To keep the challenge focused, the following are not required: 

- Full booking creation 

- Customer management 

- Vessel administration 

- Voyage administration 

- Agreement management 

- Complete charge-calculation engine 

- Container tracking 

- Full approval workflow 

- Real Keycloak deployment 

- Kubernetes 

- Microfrontend 

- Monorepo 

- Mobile application 

- Complete design system 

- Real shipping backend 

- Production-grade offline submission 

# **29. Suggested Time Allocation** 

|**Area**|**Estimated Time**|
|---|---|
|Architecture and project setup|2 hours|
|Amendment form and validation|4 hours|
|Impact-assessment workflow|3 hours|
|Conflict and submission handling|3 hours|
|State management and performance|2 hours|
|Testing|3 hours|
|Documentation and diagrams|1.5 hours|
|AI usage documentation|0.5 hour|
|**Total**|**19 hours**|



# **30. Deliverables** 

The candidate should provide: 

1. Source-code repository 2. Setup and execution instructions 3. Working Next.js application 4. Mock APIs 5. Automated tests 6. Architecture diagram 7. Sequence diagram 8. Technical README 

9. `AI_USAGE.md` 

10. Known limitations 

11. Production improvement recommendations 

# **31. Evaluation Criteria** 

|**Area**|**Score**|
|---|---|
|Architecture and separation of concerns|18|
|Complex form and workflow modelling|14|
|Server-state and cache management|12|
|Concurrency, idempotency and reliability|15|
|React and Next.js implementation quality|13|
|Testing quality and flakiness control|10|
|Performance decisions|6|
|Documentation and trade-off analysis|5|
|AI-assisted engineering and prompt quality|7|
|**Total**|**100**|



# **32. Senior-Level Indicators** 

A strong Senior submission should demonstrate: 

- Explicit state-machine thinking 

- Separation between booking, draft, assessment and submission 

- Correct handling of stale assessments 

- Preservation of user work during conflicts 

- No naive optimistic update for submission 

- Clear unknown-result handling 

- Controlled query invalidation 

- Typed domain and application boundaries 

- Minimal and justified global state 

- Safe request cancellation 

- Meaningful performance decisions 

- Reliable and deterministic tests 

- Documented trade-offs 

- Strong ownership of AI-generated outputs 

- Structured architectural prompts 

- Ability to reject poor AI recommendations 

# **33. Red Flags** 

- Treating the whole workflow as one large component 

- Mutating the original server response 

- Allowing submission after assessment becomes stale 

- Relying only on a disabled button for idempotency 

- Losing the user draft after a `409 Conflict` 

- Treating timeout as definite failure 

- Storing all API data in Redux or Zustand 

- Scattering API calls across UI components 

- Using fixed waits in E2E tests 

- Storing production access tokens in `localStorage` 

- Logging sensitive booking or customer data 

- No explicit modelling of failure states 

- Building unrelated modules beyond the requested scope 

- Submitting AI-generated code that the candidate cannot explain 

- Providing vague or generic prompts 

- Accepting AI architecture without trade-off analysis 

- Hiding or denying AI usage despite evident generated artefacts 

# **Final Review Session** 

During the technical review, the candidate should be prepared to: 

- Present the architecture in 10–15 minutes 

- Demonstrate the primary amendment workflow 

- Trigger a version conflict 

- Trigger an unknown submission result 

- Explain stale-assessment handling 

- Explain server-state and form-state boundaries 

- Defend the rendering strategy 

- Explain at least one performance optimisation 

- Run selected automated tests 

- Present the AI-assisted development workflow 

- Explain one AI-generated suggestion that was rejected 

- Modify a small part of the implementation during the session 

