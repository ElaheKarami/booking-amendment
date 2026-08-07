# API

No authentication endpoint is required by the challenge. Authentication is mocked.

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

## Production Design to Document

- Keycloak
- OpenID Connect
- Authorisation Code Flow with PKCE
- Next.js BFF
- HttpOnly secure cookies
- Token refresh
- Back-end permission enforcement
- Role or permission claims
- Session-expiry handling
