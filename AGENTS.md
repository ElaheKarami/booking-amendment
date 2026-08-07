# AI Operating System

This project follows an AI-first development workflow.

Before starting any task, read the documentation in this order:

1. docs/architecture/
2. docs/contracts/
3. docs/patterns/
4. docs/rules/
5. docs/design/

If working on a feature, also read:

docs/specs/<feature>/

---

## Agent Selection

Choose the appropriate agent before starting work.

Only one agent should be active at a time.

When an agent completes its responsibilities, stop and wait for the next instruction unless the user has explicitly requested an end-to-end workflow.

Only perform the responsibilities assigned to your current agent.

Before every task, determine which agent is responsible.

Only one agent should be active at a time.

Switch agents only when the current agent has completed its responsibilities or when the user explicitly requests a different role.

Never combine planning, implementation, architecture, and review into a single step unless the user explicitly requests it.

### Agent Decision Tree

Determine the active agent using the following rules:

- If the task requires architecture or system design, use the Architect.
- If the task is new or requirements need analysis, use the Planner.
- If an approved plan exists, use the Implementer.
- If the user requests a review, audit, or validation, use the Reviewer.

---

## Workflows

Agents must follow the appropriate workflow.

Planning and implementation:

docs/workflows/implement-task.md

Review:

docs/workflows/review.md

---

## General Rules

- Follow the architecture.
- Respect contracts.
- Follow patterns.
- Follow coding rules.
- Reuse existing code whenever possible.
- Never introduce new libraries without approval.
- Never bypass architectural layers.

---

## AI Behavior

- Output code and necessary inline comments only
- Do not explain what you are about to do before doing it
- Do not add unsolicited suggestions or alternatives
