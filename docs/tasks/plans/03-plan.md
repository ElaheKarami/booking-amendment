# Mock API Domain Models

## Scope

- Define the shared booking-amendment models, transport DTOs, endpoint results, and `ApplicationError` in `types.d.ts`. Keep server booking snapshots distinct from amendment drafts.
- Add server-only mock data/state helpers under `src/lib` to return immutable booking data, voyage options, assessments, submission statuses, and deterministic mock scenarios.
- Add static/dynamic App Router handlers under `src/app/api` for the six specified endpoints. They take precedence over the existing catch-all proxy and enforce mocked API validation and permissions.
- Use an optional `scenario` request parameter solely to make required outcomes deterministic: normal, validation, slow, conflict, timeout, unknown, duplicate, and delayed assessment responses.
- Add request/response transformers in `src/transformers` and feature services in `src/services`, routing all client access through `apiRequestObject`.
- Extend `src/services/errorHandling.ts` so transport failures become typed application errors rather than raw Axios errors.

## Validation

- Add focused Jest tests for transformers, service requests/error normalisation, and the mock-handler scenarios that drive the required endpoint behaviours.
- Run lint, TypeScript/build checks, and the affected Jest tests.

## Risk

- Mock state is process-local and intentionally non-persistent; handlers keep the public contract stable so a real BFF backend can replace them without changing components or hooks.
