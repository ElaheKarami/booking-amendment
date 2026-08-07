# AI Rules

Rules for any AI generating code in this app.

## Always

- Follow the mandated project structure (`app/`, `components/`, `services/`, `providers/`, `hooks/`, `schemas/`, `transformers/`, `lib/`, `utils/`, `constants/`).
- Use Tailwind CSS for all styling.
- Route every API call through `src/services/` — never call `axios` or `fetch` directly from a component or hook.
- Route data through transformers (backend DTO → frontend model, and back).
- Reuse existing atoms/molecules/organisms before creating new ones.
- Generate accompanying tests (Jest / React Testing Library) with new logic or components.
- Prefer consistency with existing patterns over introducing something new.

## Never

- Never call `axios`/`fetch` directly inside a component.
- Never expose auth tokens to the browser (tokens live in HttpOnly cookies, read only server-side).
- Never introduce a prohibited library — see `forbidden.md`.
- Never put business logic, validation, or DB/transaction concerns in the frontend — that belongs to the backend.
- Never bypass atomic design or component purity rules — see `coding-rules.md`.

## Decision rule

When multiple implementations are possible, pick the one that:

1. Preserves architectural consistency
2. Protects the frontend from backend contract instability
3. Maximizes code reuse
4. Produces predictable, easy-to-review AI-generated code

Consistency beats novelty. Architecture discipline beats personal preference.
