# Imports & Exports

## Component exports

Each component uses a default export, re-exported (barrel) from its folder's `index.ts`:

```ts
// components/atoms/index.ts
export { default as Button } from "./Button/Button";
export { default as Input } from "./Input/Input";
```

## Importing

Import from the barrel, not the deep path:

```ts
import { Button, Input } from "@/components/atoms";
```

## Path alias

Always use the `@/` alias (there's no workspace package to import from, since this is a single standalone app):

```ts
import { apiRequestObject } from "@/services/apiRequestObject";
import { userTransformer } from "@/transformers/userTransformer";
```

## Services

- Feature services (`userService.ts`, `bookingService.ts`, ...) export named functions, built on `apiRequestObject`.
- Components/hooks import the feature service — never `apiRequestObject` or `axios` directly.

## Types

- All shared/ambient types live in one root-level `types.d.ts`. Don't create per-folder type files or re-declare types elsewhere.
