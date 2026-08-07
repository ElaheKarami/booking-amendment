# Final Evaluation Checklist

## Scope Guardrails

- [ ] No full booking creation.
- [ ] No customer management.
- [ ] No vessel administration.
- [ ] No voyage administration.
- [ ] No agreement management.
- [ ] No complete charge-calculation engine.
- [ ] No container tracking.
- [ ] No full approval workflow.
- [ ] No real Keycloak deployment.
- [ ] No Kubernetes.
- [ ] No microfrontend.
- [ ] No monorepo.
- [ ] No mobile application.
- [ ] No complete design system.
- [ ] No real shipping backend.
- [ ] No production-grade offline submission.

## Deliverables

- [ ] Source-code repository is provided.
- [ ] Setup and execution instructions are provided.
- [ ] Working Next.js application is provided.
- [ ] Mock APIs are provided.
- [ ] Automated tests are provided.
- [ ] Architecture diagram is provided.
- [ ] Sequence diagram is provided.
- [ ] Technical README is provided.
- [ ] `AI_USAGE.md` is provided.
- [ ] Known limitations are provided.
- [ ] Production improvement recommendations are provided.

## Evaluation Criteria

- [ ] Architecture and separation of concerns meet the 18-point criterion.
- [ ] Complex form and workflow modelling meet the 14-point criterion.
- [ ] Server-state and cache management meet the 12-point criterion.
- [ ] Concurrency, idempotency, and reliability meet the 15-point criterion.
- [ ] React and Next.js implementation quality meet the 13-point criterion.
- [ ] Testing quality and flakiness control meet the 10-point criterion.
- [ ] Performance decisions meet the 6-point criterion.
- [ ] Documentation and trade-off analysis meet the 5-point criterion.
- [ ] AI-assisted engineering and prompt quality meet the 7-point criterion.

## Senior-Level Indicators

- [ ] Explicit state-machine thinking is demonstrated.
- [ ] Booking, draft, assessment, and submission are separated.
- [ ] Stale assessments are handled correctly.
- [ ] User work is preserved during conflicts.
- [ ] Submission has no naive optimistic update.
- [ ] Unknown-result handling is clear.
- [ ] Query invalidation is controlled.
- [ ] Domain and application boundaries are typed.
- [ ] Global state is minimal and justified.
- [ ] Request cancellation is safe.
- [ ] Performance decisions are meaningful.
- [ ] Tests are reliable and deterministic.
- [ ] Trade-offs are documented.
- [ ] AI-generated outputs have strong ownership.
- [ ] Architectural prompts are structured.
- [ ] Poor AI recommendations can be rejected.

## Red-Flag Check

- [ ] The workflow is not one large component.
- [ ] The original server response is not mutated.
- [ ] Submission cannot occur after assessment becomes stale.
- [ ] Idempotency does not rely only on a disabled button.
- [ ] The draft is not lost after a 409 Conflict.
- [ ] A timeout is not treated as definite failure.
- [ ] All API data is not stored in Redux or Zustand.
- [ ] API calls are not scattered across UI components.
- [ ] E2E tests do not use fixed waits.
- [ ] Production access tokens are not stored in `localStorage`.
- [ ] Sensitive booking or customer data is not logged.
- [ ] Failure states are explicitly modelled.
- [ ] No unrelated modules exceed the requested scope.
- [ ] AI-generated code can be explained by the candidate.
- [ ] Prompts are not vague or generic.
- [ ] AI architecture is not accepted without trade-off analysis.
- [ ] AI usage is not hidden or denied despite generated artefacts.

## Final Review Session

- [ ] Present the architecture in 10–15 minutes.
- [ ] Demonstrate the primary amendment workflow.
- [ ] Trigger a version conflict.
- [ ] Trigger an unknown submission result.
- [ ] Explain stale-assessment handling.
- [ ] Explain server-state and form-state boundaries.
- [ ] Defend the rendering strategy.
- [ ] Explain at least one performance optimisation.
- [ ] Run selected automated tests.
- [ ] Present the AI-assisted development workflow.
- [ ] Explain one AI-generated suggestion that was rejected.
- [ ] Modify a small part of the implementation during the session.
