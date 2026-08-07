# Frontend Assessment

A Next.js App Router foundation for the Booking Amendment assessment. The application
features have not been implemented yet.

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

## Current foundation

- Next.js 16 App Router with strict TypeScript and the `@/` source alias.
- Tailwind CSS design tokens, IBM Plex Sans, and IBM Plex Mono.
- TanStack Query root provider for server state.
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
  components/      Atomic UI: atoms, molecules, organisms, templates, skeletons
  providers/       Root React providers
  services/        Axios clients, request/response pipeline, feature services
  hooks/           UI orchestration and TanStack Query hooks
  schemas/         Zod validation schemas
  transformers/    Backend DTO ↔ frontend model conversions
  lib/             Server-only utilities
  utils/           Pure utility functions
  constants/       Application constants
```

Detailed architecture, contracts, patterns, and rules are documented in `docs/`.

## Status

Only the project foundation is in place. The Booking Amendment workspace and all
associated application features require separate approval and implementation.
