# Authentication

## Purpose

Provide a mocked authenticated user for the booking-amendment workspace and document the production authentication and authorisation design.

## Goals

- Support operations-user, operations-supervisor, and commercial-reviewer roles.
- Gate amendment actions and detailed charge access in the UI.
- Keep API authorisation enforcement on the back end.
- Document the production approach without requiring a live Keycloak environment.

## Entry Points

- Initial booking workspace rendering
- Amendment workspace actions

## Components

- Authenticated workspace boundary
- Permission-aware actions

## Dependencies

- Mocked `CurrentUser`
- Backend authorisation
