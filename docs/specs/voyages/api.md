# API

## Endpoint

`GET /api/voyages`

## Query Key

```ts
["voyages", {
  portOfLoading,
  portOfDischarge,
  readinessDate,
  search
}]
```

## Server-State Requirements

- Design stable query keys.
- Handle cache, retry, cancellation, errors, and stale responses.
- Use Network First caching.
- Consider server-side search, pagination or grouping for thousands of results.

## Validation Inputs

The selected voyage provides the cut-off compatibility and 40HC equipment-support information required by the amendment form.
