# Authentication Flow

## Workspace Access

Open booking workspace

↓

Validate session at the authentication boundary

↓

Resolve mocked current user and roles

↓

Render the initial workspace shell and permission-aware actions

## Permission Check

User requests an action

↓

Apply the UI-level role check

↓

Allow the action or show an appropriate permission state

↓

API independently enforces authorisation
