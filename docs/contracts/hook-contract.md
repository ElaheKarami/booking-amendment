# Hook Contract

Hooks orchestrate UI behavior.

Rules:
- Hooks call services only.
- Hooks never call axios or fetch.
- Use TanStack Query for server state.
- Keep business logic out of hooks.
- Never return JSX.
- Keep hooks reusable and feature-focused.
