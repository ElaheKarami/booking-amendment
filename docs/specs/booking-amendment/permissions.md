# Permissions

## Current User

```ts
type CurrentUser = {
  id: string;
  displayName: string;
  roles: Array<
    | "operations-user"
    | "operations-supervisor"
    | "commercial-reviewer"
  >;
};
```

## Edit Amendment

Operations User

## Submit Amendment

Operations User

## Override Eligible Warning

Operations Supervisor

## View Detailed Charge Impact

Commercial Reviewer or Operations Supervisor

## Enforcement

Authentication is mocked; a live Keycloak environment is not required.

UI-level checks are for user experience only. The API enforces authorisation.
