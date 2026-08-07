# Task Implementation Workflow

Follow this workflow for every development task.

---

## Phase 1 — Understand

- Read the user's request.
- Read the relevant feature specification.
- Understand the objective.
- Identify constraints.
- Ask questions if requirements are unclear.

Do not assume missing requirements.

---

## Phase 2 — Discover

Inspect the project before writing code.

Search for existing:

- Components
- Hooks
- Services
- Transformers
- Schemas
- Utilities
- Constants
- Templates
- Similar features

When creating new code, first search `code-templates/` for the closest example and follow its structure and conventions unless the task requires otherwise.

Reuse existing code whenever possible.

Avoid duplication.

---

## Phase 3 — Plan

Create an implementation plan.

Include:

- Files to modify
- Files to create
- Existing code to reuse
- Risks
- Implementation steps

If the task is complex, create a plan in:

docs/tasks/plans/<TASK_NUM>-plan.md

---

## Phase 4 — Verify

Present the implementation plan.

Wait for user approval before:

- Architectural changes
- Multi-file features
- Large refactors

Minor changes may proceed without approval.

---

## Phase 5 — Implement

Implement only the approved plan.

While implementing:

- Follow architecture.
- Respect contracts.
- Follow patterns.
- Follow rules.
- Generate typed code.
- Reuse existing code.

---

## Phase 6 — Validate

Before completing:

- Verify architecture.
- Verify contracts.
- Verify naming.
- Verify imports.
- Verify loading states.
- Verify error handling.
- Verify tests.

Fix issues before marking the task complete.
