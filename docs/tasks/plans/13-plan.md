# 13 — Network Resilience and Performance

## Scope

Add safe online/offline recovery without offline transactions, apply the requested
browser cache policies without a new dependency, and make three focused performance
measures demonstrable. A previous impact result will remain visible for context but
will never become submittable after an offline transition until it is recalculated.

## Plan

### 1. Extract network state and make recovery safe

Create a focused `useNetworkStatus` hook around browser `online` and `offline` events.
It will expose the current state and a one-time reconnected signal.

Update `BookingAmendmentWorkspace` to:

- show online, offline, and reconnected feedback using the existing `Badge`;
- disable submit while offline;
- mark any retained assessment stale when connectivity is lost, so reconnecting
  requires an explicit Recalculate;
- treat a request interrupted by offline status as `unknown`, retaining its
  idempotency key rather than reporting success or rejection;
- continue to use the existing status-check and safe-retry flows for an unknown
  submission.

`navigator.onLine` remains a browser hint, not a guarantee of server reachability.

### 2. Register a small service worker with explicit cache boundaries

Add a dependency-free service worker and a minimal client-only registration component
mounted through `AppProviders`.

The worker will apply these same-origin policies:

| Resource | Policy |
| --- | --- |
| Next/static public assets | Cache First |
| App-shell navigation | Precache the root shell, then Network First |
| Booking, voyage, latest-version, and submission-status GET requests | Network First with cached fallback |
| Assessment and amendment POST requests | Network Only |

The worker will never cache a response to assessment or submission endpoints. It will
not queue or replay submissions offline.

### 3. Make performance measures explicit

Retain the existing debounced voyage search and cancellation/ignore logic for obsolete
assessment requests. Add a dynamic import with an existing-style skeleton fallback for
`ImpactAssessmentPanel`, keeping charge-impact code out of the initial workspace
bundle.

Together, the demonstrable measures are:

1. 300 ms debounced voyage search;
2. cancellation and request-identity protection for rapid assessment requests;
3. lazy-loaded impact-assessment panel.

No virtualization will be added to the current small mock data set. The documentation
will state the production strategy for 200 container rows (windowed rows), 500 charge
lines (windowed/incremental detail list), and thousands of voyages (server-side
search and pagination). Multiple messages remain an array rendered per field; rapid
assessment requests are aborted or ignored before they can replace the newest result.

### 4. Tests and documentation

Add focused tests for:

- offline submission prevention and reconnect → stale assessment → Recalculate
  recovery;
- a submission interrupted by offline status becoming `unknown`;
- network-status hook event handling;
- service-worker route-policy helpers, kept in a testable pure module;
- dynamic-panel loading fallback where practical.

Document cache policies, offline limitations, and the large-data strategy in the
task plan for this milestone; the final README task can incorporate this material
without duplicating the implementation.

## Cache policies (implemented)

| Resource | Policy | Notes |
| --- | --- | --- |
| `/_next/static/*`, images, fonts | Cache First | Runtime cache on first successful fetch |
| App shell `/` | Precache on install; Network First with shell fallback | Hashed build assets still Cache First when requested |
| `GET` booking, voyages, latest-version, submission status | Network First | Cached only as offline fallback — not treated as authoritative |
| Assessment / amendment `POST` | Network Only | Never cached, never queued for offline replay |

A previously retained assessment is marked stale when the browser goes offline so
reconnect cannot treat it as current solely because it still exists in memory.

## Large-data strategy (documented)

| Scale | Strategy |
| --- | --- |
| 200 container rows | Windowed / virtualised field-array rows in production; current MVP keeps a small typed list |
| 500 charge lines | Windowed or incrementally revealed detail list behind the charge summary; summary totals stay memoised |
| Thousands of voyages | Server-side search + pagination (already debounced client search + stable query keys) |
| Multiple messages per field | Render the validation array as-is; no derived global store |
| Rapid assessment requests | AbortController + request-id/fingerprint ignore so only the newest result can become `valid` |

## Demonstrable performance measures

1. Debounced voyage search (300 ms) in `AmendmentForm`
2. Cancellation / request-identity protection in `useImpactAssessment`
3. Dynamic import of `ImpactAssessmentPanel` with skeleton fallback

## Files

Create:

- `src/hooks/useNetworkStatus.ts`
- `src/hooks/useNetworkStatus.test.tsx`
- `src/providers/ServiceWorkerRegistration/ServiceWorkerRegistration.tsx`
- `src/lib/serviceWorkerCachePolicy.ts`
- `src/lib/serviceWorkerCachePolicy.test.ts`
- `public/service-worker.js`
- `docs/tasks/plans/13-plan.md`

Modify:

- `src/hooks/index.ts`
- `src/hooks/useSubmitAmendment.ts`
- `src/hooks/useSubmitAmendment.test.tsx`
- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.tsx`
- `src/components/organisms/BookingAmendmentWorkspace/BookingAmendmentWorkspace.test.tsx`
- `src/providers/AppProviders.tsx`

## Reuse

- `useImpactAssessment.markStale` for invalidating an in-memory impact result.
- `useSubmitAmendment` idempotency-key retention and existing unknown-result actions.
- `AmendmentForm`'s existing 300 ms debounced voyage query.
- Existing `Badge`, `Button`, `Card`, skeleton styles, Tailwind tokens, service layer,
  and error normalization.

## Risks

- Browser online/offline events cannot prove API reachability; the API outcome remains
  authoritative.
- A submission request that is aborted after connectivity drops may already have
  reached the server, so its outcome must be `unknown`.
- Next.js does not supply build-aware precaching without an additional PWA tool.
  The custom worker will precache only stable shell URLs and runtime-cache static
  assets; hashed build files remain Cache First when requested.
- Service-worker behavior requires browser-level verification in addition to Jest.

## Validation

- Run the affected hook, workspace, and cache-policy Jest tests.
- Run `yarn lint` and `yarn build`.
- In a browser, verify the worker registration and offline route behavior through
  DevTools: cached GET fallback works, while assessment and submission requests are
  never served from cache.
