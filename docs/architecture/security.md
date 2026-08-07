# Security

## Authentication
- Store tokens only in HttpOnly cookies.
- Never expose tokens to browser JavaScript.
- Never use localStorage or sessionStorage for authentication.

## Communication
- All backend communication goes through the BFF.
- Use server-side axios for authenticated requests.

## Route Protection
- Use proxy.ts for route protection.
- Redirect unauthenticated users before rendering protected pages.

## Security Rules
- Enable CSRF protection.
- Use secure cookie flags.
- Apply Content Security Policy headers.
- Never leak sensitive information to the client.
