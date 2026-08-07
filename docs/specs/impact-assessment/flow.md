# Impact Assessment Flow

## Recalculate

User selects Recalculate

↓

Send booking ID, base version, and amendment draft

↓

Set assessment to calculating

↓

Receive a valid result or failed error state

↓

Review schedule, equipment, charges, approvals, and validations

## Stale Assessment

Assessment is valid

↓

Relevant draft value changes

↓

Retain the previous result and mark the assessment stale

↓

Disable submission and require Recalculate

## Outdated Responses

Multiple assessment requests occur

↓

Cancel or safely ignore outdated requests or responses

↓

Do not allow an old response to overwrite a newer result
