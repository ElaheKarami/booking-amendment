# Plan — UI Kit (design.md §10 Component inventory)

**Agent:** Planner  
**Status:** Implemented  
**Depends on:** 01 — Project Foundation (complete); design tokens partially in `tailwind.config.ts`

---

## Objective

Implement the reusable UI kit listed in `docs/design/design.md` §10 (with agreed additions), aligned with existing design tokens, Atomic Design, component contracts, and `code-templates/`. Scaffold any “not designed yet” items with explicit `FLAG` comments rather than inventing silently.

---

## Requirements Summary

| Source | Requirement |
| --- | --- |
| design.md §10.1 | Button, IconButton, Badge/StatusChip, **Tag**, StatusDot, TextField, Select, Checkbox/Radio (**no Switch**), ToastBanner + ToastViewport + `showMessage` |
| design.md §10.2 | Tabs, **Stepper** (no JourneyRibbon), DatePicker, SearchSelect, Modal |
| Agreed additions | **Card**, **Tooltip** (disabled-button reasons) |
| design.md §1–9, §11 | Semantic colors, type scale, radius/pill, motion, z-index, focus rings; a11y focus ring on interactive elements |
| design.md §7 | Custom SVG icons only — no third-party icon packages |
| Integration | Wire `errorHandling` → toast for **error / success / warning** messages |
| Architecture | Atoms/molecules under `src/components/`; barrel exports; `@/` imports; Tailwind + `clsx` |
| Templates | Prefer `code-templates/components/**` structure; fix `@erp/*` → `@/` |

---

## Decisions (resolved)

1. **Drop Switch** — not in scope.
2. **Card in scope** — adapt from template.
3. **Tag** — component name is `Tag` (not `CodeChip`).
4. **No JourneyRibbon** — Stepper only (compact wizard).
5. **Wire errorHandling to toasts** — `showMessage` for error, success, and warning.
6. **Tooltip in scope** — support explaining why a control (e.g. button) is disabled.

---

## Discovery

### Existing (reuse)

- `tailwind.config.ts` — primitive navy/blue/teal/green/amber/rust/slate, spacing optics, elevations 1–4, partial radius, z-index (missing sticky-header + semantic aliases)
- `src/utils/clsx.ts`
- `code-templates/components/atoms/{Button,Badge,TextField,Select,ToastBanner,Card,Tooltip}`
- `code-templates/components/molecules/{Modal,DatePicker,SearchSelect,EmptyState}`
- `code-templates/services/errorHandling.tsx` — pattern for debounce + `showMessage`
- `src/components/molecules/EmptyState` (already shipped; still uses raw hex — retoken after semantic theme lands)
- `AppProviders` / root layout — mount point for `ToastViewport`
- `src/services/errorHandling.ts` — extend to drive toasts

### Missing (create)

- Semantic Tailwind theme (colors, fontSize, motion, focus shadows, pill/card-lg radius, sticky-header z, toast animation)
- Custom SVG icon set + `Spinner` atom (templates depend on them)
- Inventory + agreed components under `src/components/atoms|molecules`
- Barrel `src/components/atoms/index.ts` (and molecule exports)
- Typed errorHandling ↔ toast integration
- Component tests for interactive kit pieces

### Out of scope

- Switch, JourneyRibbon
- Live calendar popover / full combobox polish beyond scaffold
- Dark mode / responsive redesign
- Third-party icon or UI libraries
- Booking amendment feature UI (later tasks consume the kit)

---

## Proposed Design

### 1. Theme completion (`tailwind.config.ts` + `globals.css` if needed)

Add semantic aliases matching template class names:

| Token group | Examples |
| --- | --- |
| Semantic colors | `primary`, `primary-emphasis`, `accent`, `surface`, `surface-inverse`, `border`, `border-strong`, `border-card`, `text-1/2/3`, `text-2-strong`, `text-2-stronger`, `success/warning/error/info`, `onnavy-1/2/3` |
| Font sizes | `display` … `tab-micro` per §2 (incl. `body`, `body-sm`, `label`, `caption`, `section`, `overline`) |
| Radius | `lg` 8px, `pill` 20px, `btn-lg`, `card` 12px, `card-lg` 14px |
| Motion | `duration-fast/base/slow/emphasis`, `ease-motion-standard`, `ease-motion-emphasis` |
| Shadows | `focus-ring`, `danger-ring` |
| Z-index | `sticky-header: 1010` |
| Animation | `toast-in` (motion-emphasis slide + fade); respect `prefers-reduced-motion` |

### 2. Icons + Spinner (atoms support)

Minimal custom SVG set used by kit:

- `CloseIcon`, `ChevronDownIcon`, `CheckIcon`, `SearchIcon`
- `InfoIcon`, `CheckCircleIcon`, `AlertCircleIcon`, `AlertTriangleIcon`
- `Spinner` atom (sizes 16/18/24)

Path: `src/components/icons/` + `src/components/atoms/Spinner/`.

### 3. Atoms (§10.1 + additions)

| Component | Approach | FLAG notes |
| --- | --- | --- |
| **Button** | Adapt template: variants `primary` \| `primary-emphasis` \| `secondary` \| `ghost`; sizes sm/md/lg; `isLoading` + Spinner | Hover/active derived §1.3; loading not designed |
| **IconButton** | New: 42×42, radius-icon; idle slate-75 / text-2; active navy-500 + elevation-2 | Hover/disabled not designed — derive opacity/cursor |
| **Badge** | Adapt template: tones success/warning/error/info/lease; variants pill \| mvp | — |
| **Tag** | New: mono, accent `#2f73c4`, radius-sm (inline table codes) | Named `Tag` per decision |
| **StatusDot** | New: size 7/9/11; optional 2px halo | — |
| **TextField** | Adapt template | Focus/error/disabled flagged |
| **Select** | Adapt template + chevron | Not designed — scaffold |
| **Checkbox**, **Radio** | New scaffolds; accent/primary colors | Not designed — FLAG |
| **Card** | Adapt template: variants `default` \| `table` \| `inverse` | Low elevation; border separation |
| **Tooltip** | Adapt template: hover/focus-within bubble; placements top/bottom/left/right | Not designed — FLAG; wrap disabled controls so reason is visible |
| **ToastBanner** | Adapt template | — |
| **showMessage** + store | Adapt template module store; types include success/error/warning/info/loading | — |
| **ToastViewport** | Adapt template; mount once in `AppProviders` | Hover/dismiss interaction undocumented |

### 4. Molecules (§10.2)

| Component | Approach | FLAG notes |
| --- | --- | --- |
| **Tabs** | Underline active/idle per §10.2 | — |
| **Stepper** | Compact numbered steps + connectors | Booking wizard form only |
| **DatePicker** | Native `input[type=date]` from template | Not designed |
| **SearchSelect** | Combobox scaffold from template; `@/` imports | Not designed |
| **Modal** | Portal + scrim + elevation-4 from template | Not designed; provisional elevation |

Atoms stay presentational (no business logic). `ToastViewport`, `Modal`, `SearchSelect` are client components with UI-only hooks (allowed for portal/store/combobox; no API/auth).

**Tooltip + disabled buttons:** wrap the control (or a focusable span around a disabled button) so hover/focus still reveals `content` explaining the disable reason. Document this usage in the Tooltip component comment.

### 5. Integration — errorHandling ↔ Toast

- `AppProviders`: render `<ToastViewport />` beside children
- Rewrite/extend `src/services/errorHandling.ts` to:
  - Expose helpers that call `showMessage("error" | "success" | "warning", description, options?)`
  - Keep a small debounce/dedupe so the same error string is not spammed (inspired by template `ErrorHandler`, but typed — no `any`)
  - `normalizeApiError` (or a thin `reportApiError`) surfaces `errorReasons` / message via toast
  - Success and warning paths are first-class exports (e.g. `showSuccessMessage`, `showWarningMessage`, or a single `notify(type, …)` used by services/hooks later)
- Retoken `EmptyState` to semantic classes (no behavior change)

### 6. Tests

RTL (behavior-focused):

- Button: variants render; disabled/loading disable click
- Badge: tone classes / text
- Tag: mono accent render
- TextField: label association; error → `aria-invalid`
- Tabs: activate tab on click / keyboard
- Toast: `showMessage` → viewport renders; dismiss removes
- errorHandling: report error/success/warning invokes toast store
- Modal: open/close via Escape + close button
- Checkbox: controlled toggle
- Tooltip: content associated / visible on focus-within (disabled-reason pattern)
- Card: variant surfaces render

---

## File List

### Modify

- `tailwind.config.ts`
- `src/app/globals.css` (base focus / reduced-motion if needed)
- `src/providers/AppProviders.tsx`
- `src/components/molecules/EmptyState/EmptyState.tsx`
- `src/components/molecules/index.ts`
- `src/services/errorHandling.ts` (**required** toast wire-up)

### Create

**Theme / icons**

- `src/components/icons/*.tsx` + `index.ts`
- `src/components/atoms/Spinner/Spinner.tsx` + `index.ts`

**Atoms**

- `Button`, `IconButton`, `Badge`, `Tag`, `StatusDot`, `TextField`, `Select`, `Checkbox`, `Radio`, `Card`, `Tooltip`, `ToastBanner` (+ `showMessage.ts`, `ToastViewport.tsx`)
- `src/components/atoms/index.ts`

**Molecules**

- `Tabs`, `Stepper`, `DatePicker`, `SearchSelect`, `Modal`
- barrel updates

**Tests** under matching folders (`*.test.tsx` / `showMessage.test.ts` / `errorHandling.test.ts`)

---

## Implementation Steps

1. Complete Tailwind semantic + motion + focus + type tokens.
2. Add icons + Spinner.
3. Port/adapt atoms from templates (Button, Badge, TextField, Select, Card, Tooltip, Toast).
4. Build missing atoms (IconButton, Tag, StatusDot, Checkbox, Radio).
5. Port/adapt molecules; build Tabs + Stepper (no JourneyRibbon).
6. Mount ToastViewport; wire errorHandling → showMessage for error/success/warning.
7. Retoken EmptyState; export barrels.
8. Add RTL/unit tests; run suite; fix type/lint issues.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Template uses `@erp/utils` / missing Spinner/icons | Normalize to `@/`; create local icons/Spinner first |
| Semantic class names diverge from EmptyState hex | Single token pass before components |
| Atoms-with-hooks rule vs ToastViewport/Modal/SearchSelect | Client UI orchestration only; no services/business logic |
| “Not designed yet” over-invention | FLAG comments; minimal native/HTML scaffolds |
| Disabled button tooltips (no hover on disabled) | Wrap with Tooltip span that receives hover/focus |
| errorHandling ↔ toast coupling | Typed helpers in `services/`; UI stays in atoms |

---

## Approval gate

Multi-file feature — **do not implement until this plan is approved.**
