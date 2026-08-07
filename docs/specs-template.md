This is the way each spec should be created.

---

# specs/

I would make the specs **feature-based**.

```
docs/
    specs/
        users/
        bookings/
        authentication/
        dashboard/
```

Each feature contains the same files.

---

```
specs/
    users/
        overview.md
        flow.md
        api.md
        states.md
        permissions.md
```

That's enough.

---

# overview.md

Purpose of the feature.

```md
# Users

## Purpose

Manage system users.

## Goals

- List users
- Create users
- Edit users
- Delete users

## Entry Points

- /users
- /users/create
- /users/:id

## Components

- UserTable
- UserForm
- UserFilters

## Dependencies

- userService
- userTransformer
- userSchema
```

---

# flow.md

How the feature works.

```md
# User Flow

## List Users

Open page

↓

Fetch users

↓

Loading

↓

Show table

↓

Pagination

---

## Create User

Open form

↓

Validate

↓

Submit

↓

Success

↓

Refresh table

---

## Edit User

Open form

↓

Load user

↓

Edit

↓

Save

↓

Refresh

---

## Delete User

Confirmation

↓

Delete

↓

Refresh list
```

No implementation.

Only flow.

---

# api.md

Everything backend related.

```md
# API

## Endpoints

GET /users

GET /users/{id}

POST /users

PUT /users/{id}

DELETE /users/{id}

---

## Service

userService.ts

---

## Transformer

userTransformer.ts

userInputTransformer.ts

---

## Schema

userSchema.ts
```

---

# states.md

Very useful for AI.

```md
# States

## Loading

Show skeleton.

---

## Empty

Show empty state.

---

## Success

Render data.

---

## Validation Error

Show field errors.

---

## API Error

Show error message.

---

## Unauthorized

Redirect to login.

---

## Forbidden

Display permission message.
```

---

# permissions.md

Simple.

```md
# Permissions

## View

Admin

Manager

---

## Create

Admin

---

## Update

Admin

Manager

---

## Delete

Admin
```

---

# Final structure

```
docs/
│
├── AGENTS.md
│
├── architecture/
│
├── contracts/
│
├── patterns/
│
├── rules/
│
└── specs/
    │
    ├── authentication/
    │   ├── overview.md
    │   ├── flow.md
    │   ├── api.md
    │   ├── states.md
    │   └── permissions.md
    │
    ├── users/
    │   ├── overview.md
    │   ├── flow.md
    │   ├── api.md
    │   ├── states.md
    │   └── permissions.md
    │
    ├── bookings/
    │   ├── overview.md
    │   ├── flow.md
    │   ├── api.md
    │   ├── states.md
    │   └── permissions.md
    │
    └── dashboard/
        ├── overview.md
        ├── flow.md
        ├── api.md
        ├── states.md
        └── permissions.md
```

I think this is a good balance. It's detailed enough to guide AI coding agents consistently, but small enough that you'll actually keep it updated as the project evolves.
