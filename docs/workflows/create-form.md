# Create Form Workflow

## Purpose

Follow this workflow whenever creating or updating a form.

## Steps

1. Create or update the Zod schema.
2. Build the form using React Hook Form.
3. Reuse existing input components whenever possible.
4. Connect the form to the appropriate service through a hook.
5. Display field validation errors.
6. Display API errors using the project's error handling.
7. Disable submission while a request is in progress.
8. Refresh affected data after successful submission when required.
9. Verify loading and success states.
10. Add or update tests.

## Checklist

- React Hook Form used
- Zod validation used
- Service layer used
- Hook used
- No business logic in the component
- Loading state handled
- Validation handled
- API errors handled
