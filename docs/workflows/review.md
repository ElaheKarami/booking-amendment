# Review Workflow

Review every completed implementation.

---

## Review Order

1. Architecture
2. Contracts
3. Patterns
4. Rules
5. Feature Specification

---

## Verify

### Architecture

- Correct layering
- Correct folder structure
- No architecture violations

### Components

- Small
- Reusable
- Single responsibility
- No business logic
- No direct API calls

### Hooks

- Call services only
- No JSX
- Reusable

### Services

- Correct API usage
- Typed
- Uses transformers

### Forms

- React Hook Form
- Zod
- Validation
- Loading state

### Code Quality

- Naming conventions
- Imports
- No duplication
- Strong typing
- No dead code

### Testing

- Tests updated
- Existing tests still pass

---

## Report

Classify findings as:

- Critical
- Major
- Minor
- Suggestion

Do not rewrite the implementation unless requested.
