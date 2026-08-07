# Forbidden

## Libraries

Do not introduce:

- Redux Toolkit
- SWR
- Material UI
- CSS Modules
- Styled Components
- Emotion
- jQuery
- Moment.js

Reason: inconsistent architecture, bundle size increase, design inconsistency, duplicate patterns with the approved stack (Axios, React Hook Form, Zod, TanStack Query, classnames, Lucide React, date-fns, Redux, Zustand).

## Inside UI components

- Direct API calls (`fetch`, `axios.get(...)`, etc.)
- Business logic or business validation logic
- Hardcoded business rules
- Browser-side token access
- `alert()`
- Direct `console.error()` (use centralized `services/errorHandling.ts` instead)

## Architecture

- No business rules, DB operations, transaction management, authorization decisions, or business validation in the frontend — that's the backend's job.
- No `pages/` directory — App Router only.
- No `middleware.ts` — use `proxy.ts` (Next.js 16 convention).
- No ad-hoc axios usage per feature — all API access goes through `src/services/`.
- No per-folder type files or duplicated types — one root-level `types.d.ts`.
- No localStorage/sessionStorage for auth tokens — HttpOnly cookies only.
- No exposing auth tokens to the browser, ever.

## Package manager

- No `package-lock.json`. Yarn only — commit `yarn.lock`.
