# Booking Amendment

## Purpose

Provide one focused workspace in an enterprise shipping platform where an operations user changes selected details of an existing shipment booking, reviews financial and operational impacts, resolves validation issues, and submits the amendment for approval.

The challenge is limited to this business flow. It is not a broad logistics application.

## Goals

- Model complex form and workflow state.
- Separate server state and client state.
- Make explicit Next.js rendering decisions.
- Support asynchronous validation, concurrency handling, unsaved changes, reliable submission, performance, testing, enterprise-grade error handling, and effective AI-assisted development.
- Open an existing booking and load its current version.
- Allow changes only to Port of Discharge, Planned voyage, Cargo readiness date, Container quantities, and Special handling instructions.
- Assess schedule feasibility, equipment availability, estimated charges, approval requirements, and business validation results after a user selects Recalculate.
- Require review of impacts before amendment submission.
- Prevent submission when assessment is stale or a blocking business error exists.
- Preserve the user draft when a booking version conflict occurs.
- Handle successful, conflicting, and unknown submission results.
- Warn before meaningful unsaved work is lost.
- Demonstrate network awareness and prevent submission while offline.

## Entry Points

- A single primary Booking Amendment Workspace for one existing booking.

The challenge does not prescribe a route path. The workspace must not be divided into multiple unrelated pages.

## Workspace

- Booking header: booking number, status, version, and last updated.
- Amendment form: Port of Discharge, Voyage, Cargo Readiness Date, Container Quantities, and Special Instructions.
- Impact assessment: Schedule Impact, Equipment Availability, Charge Difference, Validation Messages, and Approval Requirements.
- Action area: unsaved-changes indication, Save Draft, Recalculate, and Submit.

The exact visual design is flexible; the interaction model must remain clear and focused.

## Booking Context

- Booking number
- Customer
- Port of Loading
- Port of Discharge
- Planned vessel and voyage
- Cargo readiness date
- Container requirements
- Shipment terms
- Current estimated charges
- Current booking version

## Components

- BookingHeader
- AmendmentForm
- ImpactAssessment
- WorkspaceActionArea
- Conflict comparison or dialog
- Submission status view
- Unsaved-change confirmation

## Dependencies

- Existing booking
- Voyage options
- Equipment availability
- Impact assessment
- Latest booking version
- Submission status
- Mock authenticated user
- Mock APIs
- Telemetry abstraction

## Next.js and Rendering

- Use Next.js App Router.
- Make explicit decisions for Server Components, Client Components, initial booking data, authentication boundary, data fetching, loading boundaries, error boundaries, hydration, and caching.
- Explain the resulting trade-offs.
- A possible split is a Server Component that validates the session, loads booking identity and the initial booking snapshot, and renders the initial shell; and a client workspace that owns form state, impact-assessment lifecycle, dirty-state tracking, conflict handling, and submission workflow.

## Authentication and Authorisation

- Use a mocked authenticated user; a live Keycloak environment is not required.
- Support operations-user, operations-supervisor, and commercial-reviewer roles.
- The README must explain a production approach using Keycloak, OpenID Connect, Authorisation Code Flow with PKCE, a Next.js BFF, HttpOnly secure cookies, token refresh, back-end permission enforcement, role or permission claims, and session-expiry handling.
- UI permission checks support user experience only; the API enforces authorisation.

## Performance

- Apply optimisation only where technically justified.
- Implement at least three of: dynamic charge-impact-panel loading, avoiding unnecessary form-wide re-renders, stable query keys, memoised derived charge summaries, cancellation of outdated assessment requests, debounced voyage search, lazy booking-comparison loading, bundle analysis, reduced client-side JavaScript, virtualised charge-line rendering, or incremental rendering of large result sets.
- Document expected behavior for 200 container rows, 500 charge items, thousands of voyage-search results, several messages on one field, and multiple rapid assessment requests.

## PWA and Network Resilience

- Show online and offline status.
- Handle going offline safely.
- Prevent amendment submission while offline.
- Provide clear recovery after reconnection.
- Avoid misleading success states.
- Explain which data, if any, may be safely cached.
- Suggested cache policies: static assets Cache First; application shell Precache; booking data and voyage search Network First; impact assessment and amendment submission Network Only; submission status Network First.
- A previously cached assessment is not current solely because it exists in cache.

## Documentation and AI Usage

- Provide a technical README, architecture diagram, sequence diagram, AI_USAGE.md, known limitations, and production improvement recommendations.
- AI use is encouraged, but the candidate remains responsible for architecture, correctness, security, testing, maintainability, documentation, and final implementation quality.
