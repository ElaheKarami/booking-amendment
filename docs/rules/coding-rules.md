# Coding Rules

## TypeScript

- Strict mode mandatory.
- No `any` unless truly unavoidable.
- Prefer reusable abstractions; avoid duplicating logic.

## Components

- Keep components small and focused.
- Atoms/molecules stay pure: no hooks, no API calls, no business logic, no Context.
- Organisms may use hooks but still no business logic.
- Every async loading state needs a matching skeleton component.
- Don't use forwardRef. In React 19, ref can be passed as a prop.

## Architecture layers (don't skip or bypass)

```
UI Component → Hook (TanStack Query) → Feature service → apiRequestObject → Axios/Interceptors → BFF (Next.js Route Handler / Server Action) → Backend
```

- Do not bypass the API layer (`src/services/`).
- Do not bypass the BFF.
- Do not bypass transformers — components never see raw backend data.
- Hooks call services only, never the API directly.
- Services communicate with the BFF, never the backend directly.

## State

- Server state → TanStack Query (fetching, mutations, cache, retries, pagination).
- Global app/UI state → React Context (`AuthProvider`, `RoleProvider`, theme, modal, locale). Keep each context narrow; split it if it causes wide re-renders — don't reach for a store library instead.

## Forms

- React Hook Form + Zod for every form.
- No manual/hand-rolled validation.
- Schemas live in `src/schemas/`.

## Styling

- Tailwind CSS only, no mixed styling systems.
- Compose classes with the `clsx` wrapper (see `utils/clsx.ts`), not inline ternaries.

## Testing

- Unit (Jest): hooks, utils, transformers, services, context providers — minimum 40% coverage.
- Component (React Testing Library): rendering, interactions, state transitions.
- E2E (Playwright): critical flows — login, primary create/submit, multi-step forms.
