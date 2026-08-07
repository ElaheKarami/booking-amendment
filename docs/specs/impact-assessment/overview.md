# Impact Assessment

## Purpose

Assess and display the schedule, equipment, charge, approval, and validation impact of a booking amendment draft.

## Goals

- Assess only when the user selects Recalculate.
- Display schedule feasibility, equipment availability, estimated-charge changes, required approvals, and business validation results.
- Distinguish field validation errors, information, warnings, blocking errors, charges, and approvals.
- Make an assessment stale after a relevant draft change.
- Prevent submission using a stale assessment or one with blocking errors.

## Entry Points

- Booking Amendment Workspace → Recalculate

## Components

- ImpactAssessmentPanel
- ScheduleImpact
- EquipmentAvailability
- ChargeDifference
- ValidationMessages
- ApprovalRequirements

## Dependencies

- Booking amendment draft
- Assessment API
- Current user permission to view detailed charge impact
