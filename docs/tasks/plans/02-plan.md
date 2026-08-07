# Plan — 02 Mocked Authentication and Permissions

**Agent:** Planner  
**Status:** Implemented
**Depends on:** 01 — Project Foundation (complete)

---

## Objective

Add mocked authentication and UI-level permission gates for the booking-amendment workspace, without a live Keycloak environment or a login page. Document production auth design in the README. Keep API authorisation a back-end responsibility.

---

## Requirements Summary

| Source | Requirement |
| --- | --- |
| Task | Mocked `CurrentUser` with id, displayName, and the three roles |
| Task | Auth boundary before protected workspace |
| Task | UI gates: edit, submit, override eligible warning, view detailed charge impact |
| Task | Document API authorisation as back-end responsibility |
| AC | Ops User → edit + submit |
| AC | Ops Supervisor → override warning + detailed charge impact |
| AC | Commercial Reviewer → detailed charge impact |
| AC | Missing/invalid session → authentication boundary |
| AC | No token in JS / localStorage / sessionStorage |
| Specs | No auth API endpoint; document Keycloak/OIDC/PKCE/BFF/HttpOnly/refresh/claims/expiry |
| Foundation | No booking list or login page |

---

## Discovery

### Existing (reuse)

- `src/providers/AppProviders.tsx` — TanStack Query root; extend to nest AuthProvider
- BFF already reads HttpOnly `accessToken` cookie in `serverAxios` / `api/[...path]`
- Empty `src/lib/`, `src/constants/`, `src/components/*` scaffolds
- Root `types.d.ts` for shared ambient types
- Design tokens / EmptyState template pattern for forbidden/unauthenticated UI
- `code-templates/constants/Routes.ts` structure for new constants

### Missing (create)

- `CurrentUser` / role / permission types
- Mock user + session helpers
- `proxy.ts` route protection
- AuthProvider (identity + UI permission helpers)
- Auth boundary + permission gate UI
- Permission constants + check helpers
- README production-auth section
- Unit tests for AuthProvider and permission checks

### Out of scope

- Live Keycloak / OIDC
- Login page or booking list
- Amendment form, impact panel, submit flow (later tasks)
- New libraries

---

## Proposed Design

### 1. Types (`types.d.ts`)

```ts
type UserRole =
  | "operations-user"
  | "operations-supervisor"
  | "commercial-reviewer";

type CurrentUser = {
  id: string;
  displayName: string;
  roles: UserRole[];
};

type Permission =
  | "editAmendment"
  | "submitAmendment"
  | "overrideEligibleWarning"
  | "viewDetailedChargeImpact";
```

### 2. Mock user + permissions map

- **One** mocked user holding **all three roles** (matches task wording).
- Permission → required roles in `src/constants/Permissions.ts`:
  - `editAmendment` / `submitAmendment` → `operations-user`
  - `overrideEligibleWarning` → `operations-supervisor`
  - `viewDetailedChargeImpact` → `operations-supervisor` \| `commercial-reviewer`
- Role-specific AC verified via unit tests with fixture users that have only the relevant role(s).

### 3. Session (mocked, HttpOnly only)

- Reuse cookie name `accessToken` already used by the BFF.
- Valid mock: opaque server-known value (e.g. `mock-access-token`). Never read or write this cookie from client JS.
- `src/lib/getCurrentUser.ts` (server-only): if cookie matches mock value → return `MOCK_CURRENT_USER`; else → `null`.
- `src/lib/permissionCheck.ts` (pure): `hasPermission(user, permission)`.
- Assessment-only server actions (no login page):
  - `establishMockSession` — `Set-Cookie` HttpOnly / Secure / SameSite=Lax
  - `clearMockSession` — clear cookie (demo invalid session)

### 4. `src/proxy.ts`

- Export `proxy` (Next.js 16; not `middleware.ts`).
- Matcher excludes static assets and `/api` as needed.
- For protected workspace routes: if session cookie missing/invalid, rewrite or continue to the page so the **authentication boundary** renders (do **not** redirect to a login page).
- Never put the token in response bodies or non-HttpOnly cookies.

### 5. Authentication boundary

- Server Component route-group layout `app/(workspace)/layout.tsx`:
  1. `const user = await getCurrentUser()`
  2. If `null` → render `AuthenticationBoundary` (unauthenticated state + assessment CTA to establish mock session)
  3. If user → wrap `children` with `AuthProvider`
- Workspace page(s) under `(workspace)/` render protected content (e.g. `ProtectedWorkspaceShell`)

### 6. Provider

Single `AuthProvider` with `useAuth()` exposing:

- `user`, `isAuthenticated`
- `hasPermission(permission)`, `hasRole(role)`

- Nest inside `AppProviders` after QueryClient, or pass `user` from the server page into the client provider wrapping only the authenticated tree.
- Prefer injecting server-resolved `user` as props (no client fetch of identity; no tokens on the client).
- No separate `RoleProvider` — identity and UI permission helpers live together for this assessment.

### 7. UI-level gates

- `PermissionGate` molecule: renders children when allowed; otherwise a forbidden/permission state (scaffold EmptyState-style; flag if not in design.md).
- Export helpers so later features wrap edit/submit/override/charge-detail actions without duplicating role logic.
- Document in code/README comments that UI gates are UX-only; API enforces authorisation.

### 8. README

Add a **Production authentication & authorisation** section covering:

- Keycloak, OIDC, Auth Code Flow + PKCE
- Next.js BFF, HttpOnly secure cookies, token refresh
- Back-end permission enforcement, role/permission claims
- Session-expiry handling
- Explicit note that UI checks are not authorisation

---

## Files to Create

| Path | Purpose |
| --- | --- |
| `types.d.ts` (extend) | `UserRole`, `CurrentUser`, `Permission` |
| `src/constants/Permissions.ts` | Permission → role map + mock user constant export if needed |
| `src/constants/Routes.ts` | Route constants (from template) |
| `src/constants/index.ts` | Barrel |
| `src/lib/getCurrentUser.ts` | Server session → `CurrentUser \| null` |
| `src/lib/permissionCheck.ts` | Pure permission helper |
| `src/lib/mockSession.ts` | Server actions: establish / clear mock session |
| `src/lib/index.ts` | Barrel (server-safe exports only where appropriate) |
| `src/proxy.ts` | Route protection |
| `src/providers/AuthProvider.tsx` | Auth + permission helpers + `useAuth` |
| `src/components/molecules/PermissionGate/PermissionGate.tsx` | UI gate |
| `src/components/molecules/EmptyState/EmptyState.tsx` | Forbidden/empty scaffold (from template) |
| `src/components/organisms/AuthenticationBoundary/AuthenticationBoundary.tsx` | Unauthenticated boundary UI |
| `src/components/organisms/ProtectedWorkspaceShell/ProtectedWorkspaceShell.tsx` | Minimal authenticated shell + gate demos for AC |
| Unit tests under `__tests__` or colocated `*.test.ts(x)` | Providers, `permissionCheck`, boundary behaviour |

## Files to Modify

| Path | Change |
| --- | --- |
| `src/providers/AppProviders.tsx` / `index.ts` | Export AuthProvider; nest as needed |
| `src/app/(workspace)/layout.tsx` | Session check → boundary or AuthProvider |
| `src/app/(workspace)/page.tsx` | Protected workspace content |
| `src/components/molecules/index.ts` | Barrel exports |
| `src/components/organisms/index.ts` | Barrel exports |
| `README.md` | Production auth design + how mock session works |

---

## Implementation Steps

1. Extend `types.d.ts` with auth types.
2. Add `Permissions` / `Routes` constants and `permissionCheck`.
3. Implement `getCurrentUser` + mock session server actions (HttpOnly cookie only).
4. Add `proxy.ts` matcher for the workspace route.
5. Implement `AuthProvider` (`user` + `hasPermission` / `hasRole`).
6. Build `AuthenticationBoundary`, `PermissionGate`, `EmptyState`, and a minimal `ProtectedWorkspaceShell` that surfaces the four gated actions for verification.
7. Wire `(workspace)/layout.tsx` as the server auth boundary and page as shell content.
8. Update README (production design + mock session usage).
9. Add Jest tests for permission matrix and `AuthProvider`; manually verify no token in `localStorage` / `sessionStorage` / client-readable cookies.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Accidental token exposure to client | Only `Set-Cookie` HttpOnly from server actions; never pass token into props/context; no `NEXT_PUBLIC` secrets |
| Confusing boundary with a login page | Boundary is unauthenticated workspace gate + assessment “establish mock session” action only |
| Mock user with all roles hides single-role bugs | Unit-test each permission with single-role fixtures |
| Building too much workspace UI now | Shell only demos gates; no amendment form or APIs |
| `proxy.ts` vs page-level gate duplication | Proxy marks/enforces cookie presence; page renders boundary UI — no login redirect |

---

## Acceptance Mapping

| Criterion | How verified |
| --- | --- |
| Ops User edit/submit | `permissionCheck` + `PermissionGate` tests with `operations-user` only |
| Supervisor override + charge detail | Same with `operations-supervisor` only |
| Commercial Reviewer charge detail | Same with `commercial-reviewer` only |
| Invalid session → boundary | Clear mock cookie → page shows `AuthenticationBoundary` |
| No token in browser storage | Cookie HttpOnly; grep + manual DevTools check |

---

## Open Question

None blocking. Default decisions above follow specs and foundation constraints. If you prefer a **role switcher** for manual demos instead of all-roles-on-one-user + unit fixtures, say so before implementation.
