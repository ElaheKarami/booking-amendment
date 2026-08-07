# Architecture

## Purpose
The frontend is a presentation and orchestration layer. Backend APIs are the single source of business truth.

## Principles
- Never implement backend business rules in the frontend.
- Protect the UI from backend contract changes through transformers.
- Keep responsibilities separated by layer.
- Prefer predictable, reusable architecture over convenience.

## Layers
Browser
→ Next.js App Router
→ BFF (Route Handlers / Server Actions)
→ Services
→ Backend API

Each layer communicates only with the next layer.

## Responsibilities

Frontend:
- Render UI
- Handle forms
- Manage client state
- Communicate through the service layer
- Display loading and errors
- Transform backend data

Backend:
- Business rules
- Authorization
- Validation
- Database
- Transactions
