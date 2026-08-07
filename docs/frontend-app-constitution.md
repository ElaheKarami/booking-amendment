# Frontend Engineering Constitution — Single App

## AI-DLC Optimized · Next.js App Router

---

# 1. Architecture Philosophy

- Backend APIs are the single source of business truth.
- Frontend must never replicate backend business logic.
- Frontend acts as a presentation and orchestration layer.
- Defensive architecture against backend contract instability (anti-corruption layer).
- AI-generated code must follow deterministic architectural rules.

The frontend is **not responsible for**:

- Business rules
- Database operations
- Transaction management
- Authorization decisions
- Business validation logic

Frontend responsibilities:

- User interface rendering
- Form handling
- State management
- API communication
- Authentication session handling
- Data transformation
- Error presentation
- Secure BFF communication

---

# 2. Global Architecture Model

```text
Browser
  ↓
Next.js Application
  ↓
BFF Layer (Next.js Route Handlers / Server Actions)
  ↓
Backend REST API
  ↓
Backend Services
```

---

# 3. Technology Stack

## Required

- Next.js (latest stable) — **App Router only**, no `pages/` directory
- React (latest stable)
- TypeScript (strict mode)
- Tailwind CSS
- Yarn (package manager)

## Approved Libraries

- Axios
- React Hook Form
- Zod
- TanStack Query
- classnames
- Lucide React
- date-fns
- Redux
- Zustand

## Testing

- Jest
- React Testing Library
- Playwright

## Package Manager Rules

- Yarn only. Commit `yarn.lock`. Never commit `package-lock.json`.

---

# 4. Prohibited Libraries

- Redux Toolkit
- SWR
- Material UI
- CSS Modules
- Styled Components
- Emotion
- jQuery
- Moment.js

Reason: inconsistent architecture, bundle size increase, design inconsistency,
duplicate patterns with the approved stack above.

---

# 5. Project Structure

**Mandatory — this is not redesigned per feature.**

```text
app-name/
  src/
    app/                    # Next.js App Router (routing, layouts, server components)
      (dashboard)/
      api/                  # BFF route handlers
      layout.tsx
      page.tsx

    components/             # Atomic Design — all shared + feature UI lives here
      atoms/
        Button/
          Button.tsx
        index.ts
      molecules/
      organisms/
      templates/
      skeletons/

    providers/              # React providers — UI (theme, modal, locale) AND
                             # auth/role context (AuthProvider, RoleProvider)

    services/                # All API access lives here (see §9)
      axios/
        clientAxios.ts
        serverAxios.ts
        interceptors.ts
      apiRequestObject.ts    # single entry point for every API call
      apiResponse.ts         # normalizes shape (pagination, transformer, success/error)
      errorHandling.ts
      bookingService/
        bookingService.ts
      userService/
        userService.ts

      ...

    hooks/                   # Custom React hooks (TanStack Query usage, orchestration)

    schemas/                 # Zod validation schemas

    transformers/             # Request/response transformers (anti-corruption layer)

    lib/                      # Server-side utilities (getCurrentUser, permissionCheck)

    utils/                     # Pure utility functions

    constants/
      Routes.ts

    proxy.ts                    # Route protection (Next.js 16 convention)

  types.d.ts                    # All shared/ambient types — single source, root level
  tailwind.config.ts
  tsconfig.json
```

> **Next.js 16 convention:** route protection lives in **`proxy.ts`**, exporting
> a `proxy` function that runs on the Node.js runtime. `middleware.ts` is
> deprecated — do not use it.

---

# 6. Folder Responsibilities

### `src/app/`

Routing, page rendering, layouts, route grouping, server components, route
handlers. **Must not** contain business logic or direct API calls.

### `src/app/api/` — the BFF layer

Secure backend communication: token forwarding, secure cookie reading, request
validation, backend proxying. **Must use** `services/api/serverAxios`; never
direct `fetch`.

### `src/components/`

All UI lives here, organized by Atomic Design (see §7). There is no separate
package boundary between "shared" and "feature" UI in a single app — the atomic
layer (atoms/molecules/organisms/templates) is the reusable layer, and
feature-specific composites live alongside them but stay out of atoms/molecules.
**Forbidden inside components:** `axios`, direct `fetch`, business calculations,
token logic, `alert()`, direct `console.error()`.

### `src/providers/`

React providers for UI concerns (theme, modal, locale) **and** for global
app state — most importantly `AuthProvider` / `RoleProvider`, which expose
the current user, role, and permissions via Context (see §12). This is the
single place global state lives; there is no separate store layer.

### `src/services/`

All API access lives here (see §9): the axios clients (`services/axios/`),
the two central files `apiRequestObject.ts` and `apiResponse.ts`, and thin
per-feature service functions (`userService.ts`, `bookingService.ts`, ...).
Components and hooks never call `axios` — or even `apiRequestObject` —
directly; they call a feature service function.

### `src/lib/`

Server-side utilities only, used in server components, route handlers, and
`proxy.ts`. May use `services/api/serverAxios`. **No UI logic.**

### `src/hooks/`

Custom hooks: TanStack Query usage, mutation logic, local orchestration.
**Hooks call services — never the API directly.**

### `src/schemas/`

Zod schemas only. No hand-rolled validation logic.

### `src/transformers/`

Request/response transformation (see §10).

### `src/constants/`

Application constants (`Routes.ts`, `Permissions.ts`, `StatusCodes.ts`). No
business logic.

### `proxy.ts`

Checks the auth cookie, verifies the session, allows or redirects to login.
**Must never expose the token to the browser.**

### `types.d.ts`

Single, root-level file for all shared/ambient types. No per-folder type
files, no duplicated types.

---

# 7. UI Architecture (Atomic Design)

```text
src/components/
    atoms/
    molecules/
    organisms/
    templates/
    skeletons/
```

## Atoms

Button, Input, Label, Checkbox, Spinner.
Rules: pure UI only, no hooks, no API calls, no business logic, no Context.

## Molecules

SearchInput, DatePicker, Pagination, FormGroup.
Rules: UI composition only, no business logic.

## Organisms

Table, ModalWrapper, FilterPanel, SearchToolbar.
Rules: complex reusable UI sections, may use hooks, no business logic.

## Templates

DashboardLayout, FormLayout, PageLayout.

## Skeletons

Required for every asynchronous loading state.

---

# 8. Component Purity Rules

Forbidden inside UI components:

- Direct API calls (`fetch`, `axios.get(...)`, etc.)
- Business logic
- Business validation logic
- Hardcoded business rules
- Browser token access
- `alert()`
- Direct `console.error()`

All errors go through centralized error handling (`services/api/errorHandling.ts`).

---

# 9. API Architecture

```text
Backend API
  ↓
Axios Client (services/axios)
  ↓
Interceptors
  ↓
apiRequestObject.ts   (single entry point — dispatches by REQUEST_TYPE)
  ↓
apiResponse.ts        (normalizes shape: pagination, transformer, success/error)
  ↓
Feature service (services/<feature>Service.ts)
  ↓
Hook (TanStack Query)
  ↓
UI Component
```

Direct API communication from components is prohibited. All API access goes
through `src/services/` — no ad-hoc axios usage per feature.

`apiRequestObject` and `apiResponse` are the two central files everything
else is built on. A feature service should stay a thin, declarative wrapper
around `apiRequestObject` — it says _which_ endpoint, _which_ `REQUEST_TYPE`,
and _which_ transformer, and lets these two files handle the actual
dispatch/shape work. Feature services don't reimplement response handling.

## `services/axios/`

`clientAxios.ts` — browser-safe client. `serverAxios.ts` — server-side
client that reads the HttpOnly cookie and injects the bearer token (browser
must never access tokens). `interceptors.ts` — token injection, retry logic,
header/error normalization. Together these expose the low-level HTTP verbs
(`get`, `post`, `put`, `remove`, `upload`, `fetcher`, `getBlob`, `getGateway`)
that `apiRequestObject` calls.

## `services/apiRequestObject.ts`

The single entry point for every API call in the app. Takes `{ url, type,
transformer, inputTransformer, body, signal }`, runs the request through the
matching HTTP verb from `services/axios`, and pipes the result through
`apiResponse.convertToLocalData` when a `transformer` is supplied.

- `REQUEST_TYPE` enumerates the supported calls: `GET`, `GET_GATEWAY`, `POST`,
  `PUT`, `REMOVE`, `UPLOAD`, `FETCHER`, `IMAGE_FETCHER`.
- `inputTransformer` shapes the outgoing payload (frontend model → backend
  DTO) before the request is sent — this is the request-transformation layer
  from §10.
- `fetcherWrapper()` wraps `apiRequestObject` for `REQUEST_TYPE.FETCHER` so
  it can be handed straight to a TanStack Query `queryFn`.

## `services/apiResponse.ts`

`convertToLocalData` normalizes every response into one predictable shape —
`{ success, items/…, totalElements, totalPages, errorReasons }` — regardless
of whether the backend returned a paginated `items` object, a `content`
array, a plain array, or a single object. It applies the response
`transformer` (from §10) to each item as part of that normalization. This is
what lets feature services stay thin: they never hand-roll pagination or
success/error shaping themselves.

## `services/errorHandling.ts`

API error categorization, standard user-facing messages, centralized
logging. No local component error formatting allowed.

## `services/<feature>Service.ts`

One file per feature (`userService.ts`, `bookingService.ts`, ...). Declares
the call — url, `REQUEST_TYPE`, transformer — via `apiRequestObject`. This is
the only layer hooks are allowed to call.

```ts
// services/userService.ts
import { apiRequestObject, REQUEST_TYPE } from "./apiRequestObject";
import {
  userTransformer,
  userInputTransformer,
} from "@/transformers/userTransformer";

export const getUser = (id: string) =>
  apiRequestObject({
    url: `/users/${id}`,
    type: REQUEST_TYPE.GET,
    transformer: userTransformer,
  });

export const createUser = (payload: NewUser) =>
  apiRequestObject({
    url: "/users",
    type: REQUEST_TYPE.POST,
    body: payload,
    inputTransformer: userInputTransformer,
    transformer: userTransformer,
  });
```

---

# 10. Transformer Architecture (Mandatory — Anti-Corruption Layer)

```text
Backend DTO → Transformer → Stable Frontend Model → UI
```

```ts
export const userTransformer = (data) => ({
  id: data.id,
  firstName: data.first_name,
});
```

Rules:

- Components never consume raw backend response.
- Mandatory for every feature that talks to the backend.
- In practice this is the `transformer` param passed into `apiRequestObject`
  (see §9) — there's no separate manual pipeline to wire up per call.

## Outgoing (request) transformation

```text
Form State → Input Transformer → Backend Payload DTO → API Request
```

```ts
firstName → first_name
```

Purpose: protect the UI from backend naming/contract instability. Backend
teams may change DTOs — the transformer absorbs the change, the UI stays
stable. This is the `inputTransformer` param on `apiRequestObject` (§9).

---

# 11. Security Architecture

```text
Browser
  ↓
Next.js BFF Layer
  ↓
Backend API
```

- Tokens stored in HttpOnly cookies only.
- Browser JavaScript never accesses auth tokens.
- No localStorage / sessionStorage auth tokens.
- Secure cookie flags required.
- CSRF protection enabled.
- `proxy.ts` route protection required.
- Strict CSP headers required.

BFF pattern is mandatory — no exceptions for "simple" endpoints.

---

# 12. State Management

## React Context

Context handles both UI-only concerns **and** global
app state:

- UI-only: theme provider, language provider, modal providers.
- App state: `AuthProvider` / `RoleProvider` — current user, role,
  permissions. Wraps the app once near the root (in `src/providers/`) and is
  consumed via a small `useAuth()` / `useRole()` hook.

Keep each context narrow and focused (don't build one giant "app context").
If a context's value changes on every render and causes visible re-render
cost across a large tree, that's the signal to split it further — not a
reason to reach for a store library.

## TanStack Query

Required for all server state: API fetching, mutations, retry logic, cache
invalidation, pagination, optimistic updates, background refetching, and
request de-duplication. SWR is forbidden.

Chosen over SWR deliberately, including for a client-heavy app: TanStack
gives first-class mutations, richer cache/invalidation control, built-in
devtools, and doesn't assume a server-components-first data flow — it works
the same whether a call originates from a server action, a route handler, or
a plain client fetch. SWR's minimalism is an advantage for pure read-only,
server-component-first apps; it isn't here.

---

# 13. Form Architecture

Required: React Hook Form + Zod.

- All forms require schema validation.
- No manual validation logic.
- Schemas live in `src/schemas/`.

---

# 14. Styling Standards

Tailwind CSS only. No mixed styling systems.

Class composition via `clsx`:

```ts
// utils/clsx.ts
import classnames from "classnames";

export default function clsx(...args: any) {
  return classnames(...args);
}
```

```ts
className={clsx('rounded', { 'font-bold': isActive })}
```

---

# 15. Export Standards

Default exports per component, barrel-exported per folder:

```ts
export { default as Button } from "./Button/Button";
export { default as Input } from "./Input/Input";
```

```ts
import { Button, Input } from "@/components/atoms";
```

(Use the `@/` path alias since there is no workspace package to import from.)

---

# 16. Coding Standards

- Strict TypeScript mode mandatory.
- No `any` unless unavoidable.
- Prefer reusable abstractions; avoid duplicate logic.
- Keep components small.
- Shared components (atoms/molecules) remain pure.
- Do not bypass the API layer.
- Do not bypass transformers.

---

# 17. Testing Standards

## Unit Testing (Jest)

Minimum 40% coverage. Test: hooks, utilities, transformers, services, and
context providers (`AuthProvider` / `RoleProvider`).

## Component Testing (React Testing Library)

Test: rendering, interactions, state transitions.

## End-to-End Testing (Playwright)

Cover critical workflows: login, primary create/submit flow, multi-step forms.

---

# 18. AI Code Generation Rules

AI-generated code must:

- Follow this project structure.
- Always use Tailwind for styling.
- Always route data through transformers.
- Always route API calls through `src/services/` — never call axios directly
  from a component or hook.
- Never create direct API calls inside components.
- Never expose auth tokens to the browser.
- Always reuse existing atoms/molecules/organisms before creating new ones.
- Always generate accompanying tests.
- Prefer consistency over introducing new libraries.
- Never introduce a prohibited library (§4).
- Respect atomic design and component purity rules.

---

# 19. Final Engineering Rule

If there are multiple ways to implement something, choose the solution that:

- preserves architectural consistency
- protects the frontend from backend instability
- maximizes code reuse
- produces predictable AI-generated code

Consistency is more important than novelty. Architecture discipline is more
important than developer preference.

---

# 20. Code Templates

Some code templates are available inside code-templates/
