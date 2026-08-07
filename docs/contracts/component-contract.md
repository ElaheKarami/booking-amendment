# Component Contract

Components are responsible only for rendering UI.

Rules:

- One component per file.
- One default export per component.
- Keep components focused on one responsibility.
- Reuse existing components before creating new ones.
- Never call APIs directly.
- Never use axios or fetch.
- Never contain business logic.
- Never access authentication tokens.
- Never perform data transformation.
- Receive data through props or hooks.
- Show loading, empty, error and success states when applicable.
