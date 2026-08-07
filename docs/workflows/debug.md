# Debug Workflow

## Purpose

Use this workflow before attempting a fix.

## Steps

1. Reproduce the issue.
2. Identify the affected feature.
3. Determine which layer contains the problem.
4. Verify contracts are being followed.
5. Verify data flow between layers.
6. Check request and response transformers.
7. Apply the smallest possible fix.
8. Test the affected functionality.
9. Check for regressions.
10. Review the final implementation.

## Debug Order

1. Component
2. Hook
3. Service
4. Transformer
5. API
6. Backend

## Checklist

- Root cause identified
- No architectural shortcuts
- No duplicated fixes
- Existing patterns preserved
- Regression tested
