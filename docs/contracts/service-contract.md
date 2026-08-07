# Service Contract

Services are the only API layer.

Rules:
- One service file per feature.
- All requests go through apiRequestObject.
- Always use request and response transformers.
- Return frontend models only.
- Never return raw backend DTOs.
- Never contain UI logic.
- Never import React.
- Keep services declarative and predictable.
