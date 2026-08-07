# Frontend Assessment

A Next.js App Router application for the Booking Amendment assessment. Mocked
authentication, UI permission gates, typed domain models, and mock booking APIs
are in place; workspace UI features follow in later tasks.

## Prerequisites

- Node.js 20 or later
- Yarn 1.x

## Setup

```bash
yarn install
```

Create `.env.local` with the server-only backend origin when a backend is available:

```bash
BACKEND_URL=https://backend.example.com
```

`BACKEND_URL` is read only by the BFF route handler. Do not add credentials or access
tokens to `NEXT_PUBLIC_*` variables.

## Scripts

```bash
yarn dev          # Start the development server
yarn lint         # Run ESLint
yarn test         # Run Jest tests
yarn test:watch   # Run Jest in watch mode
yarn test:e2e     # Run Playwright tests
yarn build        # Create a production build
yarn start        # Start the production server
```

Open [http://localhost:3000](http://localhost:3000) after starting the development
server.

## Mocked authentication (assessment)

There is no login page. Session validation happens at the authentication boundary
on the workspace route:

1. Open `/`. If the HttpOnly `accessToken` cookie is missing or invalid, the
   authentication boundary is shown.
2. Choose **Restore session** to set an HttpOnly cookie via a server action (never
   from browser JavaScript, `localStorage`, or `sessionStorage`).
3. The server resolves a mocked `CurrentUser` (id, display name, and the three
   challenge roles) and renders the protected workspace shell.
4. Use **End session** to return to the unauthenticated boundary.

UI permission gates cover edit, submit, override eligible warning, and detailed
charge impact. These checks are for user experience only. **API authorisation
remains a back-end responsibility.**

## Production authentication & authorisation

A live Keycloak environment is not required for this assessment. In production the
intended design is:

- **Keycloak** as the identity provider.
- **OpenID Connect** with the **Authorisation Code Flow + PKCE**.
- Browser never holds tokens. The **Next.js BFF** completes the code exchange and
  stores access/refresh tokens in **HttpOnly, Secure, SameSite** cookies.
- Authenticated browser calls stay same-origin to the BFF; the BFF attaches the
  access token when calling upstream APIs (as `src/services/axios/serverAxios.ts`
  already sketches).
- **Token refresh** is performed server-side using the refresh token cookie before
  upstream calls or on a controlled refresh path; failed refresh clears cookies and
  returns the user to the authentication boundary.
- **Role / permission claims** from the ID or access token drive UI gating only.
- **Back-end permission enforcement** is mandatory on every mutating and sensitive
  read endpoint; the UI must not be treated as an authorisation boundary.
- **Session expiry**: when the access token expires and refresh fails (or the
  refresh token expires), the BFF clears auth cookies and the authentication
  boundary handles the unauthenticated state without exposing token material to
  the client.

### Connecting to Keycloak with NextAuth

In production, **NextAuth.js** (Auth.js) would sit between the Next.js app and
Keycloak. It handles the OIDC authorisation-code flow, session callbacks, and
secure cookie management so the browser never sees raw tokens.

**Key files (not implemented in this assessment):**

```text
src/app/api/auth/[...nextauth]/authOptions.ts   # Provider config, callbacks, JWT/session mapping
src/app/api/auth/[...nextauth]/route.ts         # NextAuth route handler (GET/POST)
```

- **`authOptions.ts`** — defines the Keycloak provider (issuer, client ID/secret,
  scopes), maps Keycloak **role / permission claims** into the NextAuth session,
  and configures callbacks (`jwt`, `session`) so `getCurrentUser` can resolve a
  `CurrentUser` from the server session instead of the mock cookie.
- **`route.ts`** — exports the NextAuth handler for all auth routes (`/api/auth/signin`,
  `/api/auth/callback/keycloak`, `/api/auth/signout`, etc.).

**Custom login UI:** Keycloak’s hosted login pages would use a **custom theme**
built by editing Keycloak **FTL** templates (FreeMarker) in the Keycloak server
theme directory — e.g. `login.ftl`, `template.ftl`, and related assets — so
sign-in matches product branding while the app still redirects through NextAuth.

**End-to-end flow:**

1. User hits a protected route → redirected to NextAuth sign-in → Keycloak (custom theme).
2. Keycloak returns to `/api/auth/callback/keycloak`; NextAuth sets HttpOnly session cookies.
3. Server components / BFF read the session, attach the access token to upstream API calls,
   and UI permission gates read roles from the session — same pattern as the mock, with real IdP data.

## Current foundation

- Next.js 16 App Router with strict TypeScript and the `@/` source alias.
- Tailwind CSS design tokens, IBM Plex Sans, and IBM Plex Mono.
- TanStack Query root provider for server state.
- Mocked auth session, `AuthProvider`, `proxy.ts` route protection, and UI
  permission gates.
- Typed booking-amendment domain models in root `types.d.ts`.
- Mock booking API route handlers with deterministic scenario outcomes.
- Feature services and transformers for booking, voyages, assessment, and
  submission; transport errors normalize to `ApplicationError`.
- A same-origin BFF catch-all at `src/app/api/[...path]/route.ts` for upstream
  forwarding when `BACKEND_URL` is set; specific mock routes take precedence.
- Root loading and error boundaries.
- ESLint, Prettier, Jest with React Testing Library, and Playwright configuration.

## Architecture

The project enforces this data flow:

```text
Component → Hook → Feature service → apiRequestObject → Axios → BFF / mock route → Backend
```

Backend DTOs must be transformed before they reach UI components. Components and hooks
must not call Axios, `fetch`, or backend APIs directly.

## Mock APIs and domain models

Shared booking-amendment types live in root `types.d.ts`: `Booking`,
`BookingAmendmentDraft`, `VoyageOption`, `AmendmentImpact`, submission models, and
`ApplicationError`. The original booking snapshot and the editable draft remain
distinct; transformers copy nested data so callers cannot mutate server state in
place.

Mock route handlers under `src/app/api` implement the challenge endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/bookings/:id` | Load booking snapshot |
| `GET` | `/api/voyages` | Voyage options (route, readiness, search) |
| `POST` | `/api/bookings/:id/amendments/assess` | Impact assessment |
| `POST` | `/api/bookings/:id/amendments` | Submit amendment (idempotent) |
| `GET` | `/api/amendment-submissions/:id/status` | Submission status |
| `GET` | `/api/bookings/:id/latest-version` | Latest booking version |

Handlers check the mock session and permission before responding. Mock data and
scenario logic live in `src/lib/mockBookingApi.ts` (process-local, non-persistent).

### Deterministic scenarios

Pass an optional `scenario` query parameter to exercise challenge outcomes:

| `scenario` | Typical use |
| --- | --- |
| `normal` | Happy path (default) |
| `validation` | Business / field validation error |
| `slow` | Delayed response |
| `conflict` | `409` with `BOOKING_VERSION_CONFLICT` |
| `timeout` | Network / timeout failure |
| `unknown` | Ambiguous submission result after send |
| `duplicate` | Idempotent resubmit of the same key |
| `out-of-order` | Slower assessment (stale-response drills) |

Example: `GET /api/bookings/booking-001?scenario=slow`.

Client code should call `src/services/bookingAmendmentService.ts` only. That layer
uses `apiRequestObject`, request/response transformers in
`src/transformers/bookingAmendmentTransformer.ts`, and
`src/services/errorHandling.ts` so raw Axios errors never reach components.

Version conflicts return the documented body:

```json
{
  "code": "BOOKING_VERSION_CONFLICT",
  "currentVersion": 7,
  "message": "The booking was modified by another user."
}
```

The error normalizer maps that shape (and typed `ApplicationError` payloads) into
application state for hooks and UI.

## Submission idempotency

Amendment submit can be interrupted after the request leaves the browser:
double-clicks, retries, slow networks, and timeouts. Disabling the Submit button
reduces accidental duplicate clicks, but it is **not** enough — a request may
already be in flight or already accepted on the server while the UI still shows
an unknown result.

### Why we need an idempotency key

Each submit command includes an `idempotencyKey`. The backend treats that key as
“this is the same submission attempt.” If the same key arrives again, the server
returns the original outcome instead of creating a second amendment. That is how
the system stays safe when the client cannot tell whether the first request
succeeded.

### How the frontend handles it

`useSubmitAmendment` owns the key lifecycle:

1. **New attempt** — from idle, after a clear rejection, or after a version
   conflict — generate a new key with `crypto.randomUUID()` (with a fallback) and
   send it on `POST /api/bookings/:id/amendments` together with booking ID, base
   version, assessment version, and the draft.
2. **In flight** — ignore further submit calls while a request is outstanding
   (`inFlightRef`), in addition to disabling the button.
3. **Unknown result** — if the request was sent but the result is unclear
   (timeout / ambiguous response), keep the same key and reuse it on a safe
   retry. A **new** key here would look like a second command and could create a
   duplicate if the first request had already succeeded.
4. **No optimistic update** — the UI waits for the server response; the draft is
   preserved on rejection, conflict, and unknown outcomes.

The mock API stores submissions by key and supports a `duplicate` scenario so the
same key returns `alreadyProcessed: true`. Detailed conflict recovery and
status-check UX for unknown results continue in later tasks; the key reuse rule
above is the client’s safe-retry contract.

## Unsaved changes and browser navigation

In-app leave actions (back to workspace, form reset, and later conflict
“load latest booking”) use a confirmation dialog when the amendment draft is
dirty. Refresh and tab close rely on the browser `beforeunload` event.

Browser limitations to be aware of:

- Custom dialog copy is not shown for `beforeunload`; browsers control the prompt
  text and may suppress it unless the user has interacted with the page.
- Not every navigation path is interceptable (for example some browser chrome
  actions, crashes, or OS-level kills).
- App Router soft-navigation blockers are not used yet; leave protection today
  covers the workspace’s local back navigation and explicit discard actions.

## Source structure

```text
src/
  app/             App Router routes, layouts, mock API handlers, and BFF proxy
                   (protected workspace under app/(workspace)/)
  components/      Atomic UI: atoms, molecules, organisms, templates, skeletons
  providers/       Root React providers (Query + Auth)
  services/        Axios clients, request/response pipeline, feature services
  hooks/           UI orchestration and TanStack Query hooks
  schemas/         Zod validation schemas
  transformers/    Backend DTO ↔ frontend model conversions
  lib/             Server utilities (session, mock API state, permission helpers)
  utils/           Pure utility functions
  constants/       Application constants
  proxy.ts         Route protection (Next.js 16)
```

Detailed architecture, contracts, patterns, and rules are documented in `docs/`.

## Status

Foundation, mocked authentication, domain models, and mock booking APIs are in
place. Booking amendment workspace features (load booking into the UI, form,
impact assessment UX, submit flow) follow in later tasks.
