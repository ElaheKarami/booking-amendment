# Folder Structure

## Goal
Every project follows the same structure. Do not redesign it per feature.

## Responsibilities

app/
- Routing
- Layouts
- Server Components
- Route Handlers

components/
- All reusable UI
- Atomic Design

providers/
- Global providers
- Auth
- Roles
- Theme

services/
- API communication only

hooks/
- UI orchestration
- TanStack Query

schemas/
- Zod validation

transformers/
- DTO ↔ Frontend model conversion

lib/
- Server utilities

utils/
- Pure utility functions

constants/
- Application constants

types.d.ts
- Shared types

proxy.ts
- Route protection
