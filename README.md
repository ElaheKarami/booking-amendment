# Frontend Assessment

A Next.js App Router application for the Booking Amendment assessment. Mocked
authentication and UI permission gates are in place; domain features follow in
later tasks.

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
- A typed Axios service foundation with response transformers and centralized error
  normalization.
- A same-origin BFF route at `src/app/api/[...path]/route.ts`; it reads an HttpOnly
  access-token cookie on the server and forwards requests to `BACKEND_URL`.
- Root loading and error boundaries.
- ESLint, Prettier, Jest with React Testing Library, and Playwright configuration.

## Architecture

The project enforces this data flow:

```text
Component → Hook → Feature service → apiRequestObject → Axios → BFF → Backend
```

Backend DTOs must be transformed before they reach UI components. Components and hooks
must not call Axios, `fetch`, or backend APIs directly.

## Source structure

```text
src/
  app/             App Router routes, layouts, and BFF route handlers
                   (protected workspace under app/(workspace)/)
  components/      Atomic UI: atoms, molecules, organisms, templates, skeletons
  providers/       Root React providers (Query + Auth)
  services/        Axios clients, request/response pipeline, feature services
  hooks/           UI orchestration and TanStack Query hooks
  schemas/         Zod validation schemas
  transformers/    Backend DTO ↔ frontend model conversions
  lib/             Server utilities (session, permission helpers)
  utils/           Pure utility functions
  constants/       Application constants
  proxy.ts         Route protection (Next.js 16)
```

Detailed architecture, contracts, patterns, and rules are documented in `docs/`.

## Status

Foundation and mocked authentication are in place. Booking amendment domain features
(load booking, form, impact assessment, submit) are not implemented yet.
