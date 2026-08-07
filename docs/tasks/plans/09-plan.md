# 09 — Render Impact Review and Blocking States

## Scope

Render the existing amendment-impact response after recalculation, retain it for stale
review, hide charge line-item detail without the required permission, and prevent
submission when the current assessment reports an error-severity validation.

## Plan

### 1. Impact-review components

Create a focused `ImpactAssessmentPanel` organism with stateless child sections for:

- schedule feasibility and warnings;
- equipment availability and unavailable items;
- current, revised, and difference charge totals;
- validation messages grouped by field when supplied and visibly differentiated by
  info, warning, and error severity;
- approval requirements.

Reuse `Card`, `Badge`, `StatusDot`, `Tag`, the existing status icons, and
`formatPrice`. Use the existing Tailwind design tokens and show an explicit
outdated-result notice when the supplied assessment is stale.

### 2. Charge-detail permission gate

Render charge totals and the difference for every user, but place the charge line-item
breakdown behind `PermissionGate` using `viewDetailedChargeImpact`. Provide a concise
fallback that explains that detailed charge impact requires a Commercial Reviewer or
Operations Supervisor role; the API remains the authorization authority.

### 3. Workspace integration and submission eligibility

Update `BookingAmendmentWorkspace` to render `ImpactAssessmentPanel` whenever the
assessment hook retains an impact result, passing its stale status. Preserve the
existing lifecycle badge and controls.

Update `useImpactAssessment` so its submission eligibility is true only for a valid
assessment with no returned `severity: "error"` validation. Expose the derived
blocking state if the panel or workspace needs it, without duplicating backend
business rules.

### 4. Tests and exports

Add barrel exports for the new components and extend component tests to cover:

- all five impact sections and severity-specific validation feedback;
- the stale/outdated result notice;
- visible charge totals with line items shown only to an Operations Supervisor or
  Commercial Reviewer;
- an error-severity validation keeping **Submit amendment** disabled after a valid
  recalculation.

Extend the assessment-hook test for the blocking eligibility rule.

## Files

Create:

- `src/components/organisms/ImpactAssessmentPanel/ImpactAssessmentPanel.tsx`
- `src/components/molecules/ScheduleImpact/ScheduleImpact.tsx`
- `src/components/molecules/EquipmentAvailability/EquipmentAvailability.tsx`
- `src/components/molecules/ChargeDifference/ChargeDifference.tsx`
- `src/components/molecules/ValidationMessages/ValidationMessages.tsx`
- `src/components/molecules/ApprovalRequirements/ApprovalRequirements.tsx`
- focused Jest / React Testing Library tests for the new review components.

Modify:

- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.tsx`
- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.test.tsx`
- `src/hooks/useImpactAssessment.ts`
- `src/hooks/useImpactAssessment.test.tsx`
- `src/components/molecules/index.ts`
- `src/components/organisms/index.ts`

## Risks

- Validation severity is API-owned: the UI only treats the documented `error`
  severity as blocking and does not recreate backend validation rules.
- Permission gating is presentation-only and must not be treated as authorization.
- The existing mock response rarely produces warnings, unavailable equipment, or
  approvals together; tests should provide representative `AmendmentImpact` fixtures
  rather than expanding mock business logic.

## Validation

- Run the affected hook, workspace, and new component Jest tests.
- Run `yarn lint`.
