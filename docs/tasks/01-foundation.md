# 01 — Create Project Foundation

## Specs

- [Booking Amendment overview](../specs/booking-amendment/overview.md)
- [Booking Amendment states](../specs/booking-amendment/states.md)

## Dependencies

None

## Implementation Steps

1. Configure the Next.js App Router application with strict TypeScript, Tailwind CSS, Yarn, React Hook Form, Zod, TanStack Query, Axios, Jest, React Testing Library, and Playwright.
2. Create the mandated application layers, including app routing, providers, services, hooks, schemas, transformers, utilities, constants, and shared root types.
3. Add the TanStack Query provider and root loading and error boundaries.
4. Define the separation of server state, form state, and local workflow state.
5. Set the direct existing-booking workspace as the only challenge entry flow; do not add a booking list or login page.

## Acceptance Criteria

- [ ] Uses the App Router and no `pages/` directory.
- [ ] Uses the required architecture pipeline: component → hook → service → BFF → backend.
- [ ] Uses only approved libraries and Yarn.
- [ ] Has a skeleton for asynchronous page content.
- [ ] Keeps booking, draft, assessment, and submission state separate.
- [ ] Does not introduce out-of-scope modules.
