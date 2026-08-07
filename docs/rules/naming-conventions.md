# Naming Conventions

## Components (atoms/molecules/organisms/templates)

- PascalCase, one folder per component, folder name matches component name:
  ```
  components/atoms/Button/Button.tsx
  ```
- Export as default from the component file, re-export by name from the folder's barrel `index.ts`.

## Services

- `camelCase` file and function names, suffixed `Service`:
  ```
  services/userService/userService.ts
  services/bookingService/bookingService.ts
  ```
- Exported functions are verbs: `getUser`, `createUser`, `updateBooking`.

## Transformers

- `camelCase`, suffixed `Transformer`, one per domain entity:
  ```
  transformers/userTransformer.ts
  ```
- inside each file: `xConvertToLocalData` = response (backend → frontend). `xConvertToServerData` = request (frontend → backend).

## Schemas

- `camelCase`, suffixed `Schema`:
  ```
  schemas/userSchema.ts
  ```

## Providers / Context

- PascalCase, suffixed `Provider`, paired with a `useX` hook:
  ```
  AuthProvider → useAuth()
  RoleProvider → useRole()
  ```

## Hooks

- `camelCase`, prefixed `use`:
  ```
  useUser, useBookings, useCreateBooking
  ```

## Constants

- PascalCase filenames, one concern per file:
  ```
  constants/Routes.ts
  constants/Permissions.ts
  constants/StatusCodes.ts
  ```

## Enums / fixed sets

- SCREAMING_SNAKE_CASE values:
  ```ts
  (REQUEST_TYPE.GET, REQUEST_TYPE.POST, REQUEST_TYPE.UPLOAD);
  ```

## Routing (Next.js 16)

- Route protection file is `proxy.ts` (not `middleware.ts`).

## Types

- Shared/ambient types declared once in root-level `types.d.ts`, PascalCase type names.
