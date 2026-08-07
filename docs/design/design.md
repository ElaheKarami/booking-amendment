# Design

# Design System

Single source of truth for the frontend AI-assessment component
library.

**Stack:** React + Tailwind CSS. Fonts: IBM Plex Sans (UI) + IBM Plex Mono (data/codes).
**Product character:** dense, data-heavy maritime/logistics ERP. Navy brand, one
saturated blue accent, teal for primary equipment/action, muted slate neutrals, white
surfaces on a light slate-tinted app background.

---

## 1. Color palette

### 1.1 Primitive colors

Grouped by hue. Scale numbers are relative lightness (50 = lightest, 900 = darkest);
gaps exist where the design only uses certain steps — do **not** invent intermediate
steps, flag them if needed.

**Navy (brand / `navy-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| navy-900 | `#0a2138` | Deepest panel footer, inset navy blocks |
| navy-800 | `#0c2742` | Primary brand navy — dark cards, charge rail, logo |
| navy-700 | `#0e3358` | Logo stripe alt |
| navy-600 | `#11293f` | Darkest text (text-1) — doubles as neutral |
| navy-500 | `#11427a` | Primary button / step accent (deep blue) |
| navy-400 | `#16467a` | Logo stripe |
| navy-300 | `#1b4f7e` | Capacity-gauge gradient start |
| navy-border | `#1c3e60` | Divider inside navy panels |

**Blue (accent / `blue-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| blue-600 | `#2f73c4` | Accent — links, mono codes, eyebrow labels, gauge end, active step |
| blue-100 | `#cdddf0` | Focus ring / active-step glow |
| blue-75 | `#eef3fa` | Active ribbon-step background |
| blue-50 | `#eaf1fb` | Badge background ("MVP" chip) |

**Teal (equipment / primary CTA / `teal-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| teal-600 | `#0c6b4f` | Text on light teal chip |
| teal-500 | `#0e8079` | Primary action button, lease/equipment accent, avatar |
| teal-300 | `#2dd4bf` | Success dot on dark navy, accent squares |
| teal-100 | `#cfe7dd` | Info-note border |
| teal-90 | `#c7e6df` | Timeline lease-dot ring |
| teal-75 | `#e1f1ec` | Lease chip background |
| teal-50 | `#f0f7f4` | Info-note background (light teal) |

**Green (success / `green-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| green-600 | `#1e8e5a` | Success text, completed-step fill, accepted badge |
| green-100 | `#cfe0d6` | Success card border / completed connector |
| green-50 | `#e7f4ec` | Success badge background |

**Amber (warning / `amber-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| amber-600 | `#b5780b` | Warning text ("Pending pricing", condition) |
| amber-100 | `#f0dcae` | Timeline condition-dot ring |
| amber-50 | `#fbf1dd` | Warning badge background |

**Rust (error / overdue / `rust-*`)**
| Token | Hex | Seen use |
| --- | --- | --- |
| rust-600 | `#a8492a` | Error/overdue text, detention state, over-free-time bar |
| rust-50 | `#fbede6` | Error/overdue badge background |

**Slate (neutrals / `slate-*`)** — text, borders, surfaces
| Token | Hex | Seen use |
| --- | --- | --- |
| white | `#ffffff` | Surface (cards, bars, sidebar) |
| slate-25 | `#fafbfc` | Table header fill |
| slate-50 | `#f6f8fa` | Subtle inset (calc note block) |
| slate-75 | `#f3f5f8` | Content area background |
| slate-100 | `#f2f5f8` | Table row divider |
| slate-150 | `#f0f3f7` | Hairline divider inside cards |
| slate-200 | `#eef1f5` | App background, track fill, chip background |
| slate-250 | `#e9edf1` | Alt app background (directions canvas) |
| slate-300 | `#e7ecf2` | Card border |
| slate-350 | `#e4e9f0` | Primary border (headers, rails, connectors) |
| slate-400 | `#dde4ec` | Brand-strip border |
| slate-450 | `#d6deea` | Secondary-button border |
| slate-500 | `#cdd6e0` | Scrollbar thumb |
| slate-550 | `#c3ccd6` | Breadcrumb slash, small dots |
| slate-600 | `#9aa7b4` | text-3 (muted labels, uppercase captions) |
| slate-700 | `#8a98a6` | text-3 alt (helper text) |
| slate-750 | `#7c8a98` | text-2 (secondary body) |
| slate-800 | `#5c6b7a` | text-2 alt (paragraph secondary) |
| slate-850 | `#46586a` | text-2 strong (button label, values) |
| slate-900 | `#11293f` | text-1 (primary text) |

**Navy-scale text (on dark surfaces)**
| Token | Hex | Seen use |
| --- | --- | --- |
| onnavy-1 | `#ffffff` | Primary text on navy |
| onnavy-2 | `#9fb3c8` | Secondary text on navy |
| onnavy-3 | `#7d96b0` | Tertiary/caption on navy |

### 1.2 Semantic colors

| Role               | Primitive                | Hex                                                   |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| `primary`          | teal-500                 | `#0e8079` (primary CTA: "Confirm & assign equipment") |
| `primary-emphasis` | navy-500                 | `#11427a` (deep-blue publish / navigational primary)  |
| `secondary`        | white + slate-450 border | `#ffffff` / border `#d6deea`                          |
| `accent`           | blue-600                 | `#2f73c4`                                             |
| `background`       | slate-200                | `#eef1f5` (app shell) / content `#f3f5f8`             |
| `surface`          | white                    | `#ffffff`                                             |
| `surface-inverse`  | navy-800                 | `#0c2742` (dark data panels)                          |
| `border`           | slate-350                | `#e4e9f0` (structural) / slate-300 `#e7ecf2` (cards)  |
| `border-strong`    | slate-450                | `#d6deea`                                             |
| `text-1`           | slate-900                | `#11293f`                                             |
| `text-2`           | slate-750                | `#7c8a98`                                             |
| `text-3`           | slate-600                | `#9aa7b4`                                             |
| `link`             | blue-600                 | `#2f73c4`                                             |
| `success`          | green-600                | `#1e8e5a`                                             |
| `warning`          | amber-600                | `#b5780b`                                             |
| `error`            | rust-600                 | `#a8492a`                                             |
| `info`             | blue-600                 | `#2f73c4`                                             |
| `focus-ring`       | blue-100                 | `#cdddf0`                                             |

> Note: the designs use **rust `#a8492a`** rather than a pure red for error/overdue —
> it reads as an oxidized "alert" tone consistent with the maritime palette. Keep it;
> do not substitute a generic `red-500`.

### 1.3 State variants

Hover/active are not all explicitly rendered in the static files — derive per the rule
below and mark derived values so Kiro flags rather than guesses.

| Interactive color            | default                                      | hover _(derive: darken \~8%)_         | active _(darken \~14%)_  | disabled                         | focus ring                 |
| ---------------------------- | -------------------------------------------- | ------------------------------------- | ------------------------ | -------------------------------- | -------------------------- |
| primary (teal)               | `#0e8079`                                    | `#0c7169` _(derived)_                 | `#0a6259` _(derived)_    | `#0e8079` @ 45% + `not-allowed`  | 3px `#cdddf0`              |
| primary-emphasis (navy blue) | `#11427a`                                    | `#0f3a6b` _(derived)_                 | `#0d325d` _(derived)_    | 45% + `not-allowed`              | 3px `#cdddf0`              |
| secondary (outline)          | bg `#ffffff` border `#d6deea` text `#46586a` | bg `#f6f8fa` _(derived)_              | bg `#eef1f5` _(derived)_ | text `#9aa7b4`, border `#e4e9f0` | 3px `#cdddf0`              |
| link / accent                | `#2f73c4`                                    | `#255f a8`→ use `#255ea8` _(derived)_ | `#1f4f8c` _(derived)_    | `#9aa7b4`                        | 3px `#cdddf0`              |
| danger (rust)                | `#a8492a`                                    | `#933f24` _(derived)_                 | `#7d351e` _(derived)_    | 45%                              | 3px `rgba(168,73,42,0.35)` |

**Disabled convention:** reduce opacity to ~45% and set `cursor: not-allowed`; do not
recolor to gray unless a fully-flat disabled is requested.

### 1.4 Dark mode

**Out of scope for MVP.** The library uses hard-coded light surfaces with intentional
navy "inverse" panels (`#0c2742`) as a design device, _not_ a theme. Do not build a
`dark:` variant set or assume `prefers-color-scheme` support until explicitly briefed.

---

## 2. Typography

**Families**

- **UI / everything:** `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif`
  — page titles, body, labels, buttons.
- **Data / mono:** `'IBM Plex Mono', ui-monospace, monospace` — all identifiers,
  codes, rates, currency amounts, dates/times, correlation ids, event names.
- No separate heading font; hierarchy is weight + size within Plex Sans.

**Weights loaded:** Sans 400 / 500 / 600 / 700 · Mono 400 / 500 / 600.
Headings use **600** (not 700); 700 is loaded but reserved.

### Type scale

| Name          | Size   | Line-height | Weight     | Letter-spacing | Typical use                                 |
| ------------- | ------ | ----------- | ---------- | -------------- | ------------------------------------------- |
| display       | 34px   | 42px        | 600        | −0.02em        | Directions/marketing screen H1              |
| heading-1     | 30px   | 38px        | 600        | −0.02em        | Page title (agreement, trace, charge)       |
| heading-2     | 28px   | 36px        | 600        | −0.02em        | Booking page title                          |
| stat-lg       | 26px   | 32px        | 600        | −0.01em        | Big numbers (equipment count, calc figures) |
| data-xl       | 28px   | 34px        | 600 (mono) | −0.01em        | Charge totals on navy rail                  |
| data-lg       | 24px   | 30px        | 600 (mono) | −0.01em        | Port codes (CNSHA / NLRTM)                  |
| heading-3     | 18px   | 24px        | 600        | 0              | Card headline value (commodity, dates)      |
| section       | 16px   | 22px        | 600        | 0              | Section titles ("Ocean freight tariff")     |
| title         | 15px   | 22px        | 600        | −0.01em        | App name, dark-panel title                  |
| body          | 13.5px | 20px        | 400        | 0              | Table cell text, default body               |
| body-sm       | 13px   | 20px        | 400        | 0              | Secondary body, meta rows                   |
| label         | 12.5px | 18px        | 400/500    | 0              | Field values, breadcrumbs                   |
| caption       | 12px   | 16px        | 400        | 0              | Helper text, sub-labels                     |
| micro         | 11.5px | 16px        | 400        | 0              | Footnotes on navy panels                    |
| overline      | 11px   | 14px        | 600        | 0.06em         | UPPERCASE section eyebrows                  |
| overline-wide | 10.5px | 14px        | 600        | 0.08em         | UPPERCASE journey label                     |
| tab-micro     | 8.5px  | 12px        | 400        | 0.04em         | Icon-rail sublabels                         |

**Category → step mapping**

- Page titles → `heading-1` (30/600); booking uses `heading-2` (28/600).
- Card / section titles → `section` (16/600).
- Card sub-headline stat → `heading-3` (18/600) or `stat-lg` (26/600) for hero numbers.
- Table headers → `overline` (11px / 600 / 0.05em / UPPERCASE / color `#9aa7b4`).
- Table body → `body` (13.5/400).
- Field labels & captions → `caption` (12/400, color `#7c8a98`–`#9aa7b4`).
- Helper / footnote text → `micro`–`caption`, color `#8a98a6`.
- Buttons → 13–14px / 600 (primary), 13–13.5px / 500 (secondary).
- Eyebrows / group labels → `overline` UPPERCASE, color `#2f73c4` (accent) or `#9aa7b4` (muted).
- Badges / chips → 11px / 600, mixed case.
- Any code, rate, id, date, currency → **IBM Plex Mono**, weight 500–600.

`-webkit-font-smoothing: antialiased` is applied on the app root.

---

## 3. Spacing scale

**Base unit: 4px.** Tailwind's default 4px scale applies. The designs, however, use a
**mixed even scale plus odd "optical" values** for dense data layouts — document both.

Core (4px) scale: `0 / 4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 56`.

**Custom / optical values in active use** (add as Tailwind spacing extensions — do not
round them away, the density depends on them):
`5, 6, 7, 9, 10, 11, 13, 14, 18, 22, 26, 34, 54, 70`

Representative fixed dimensions:

- Icon rail width `70px`; top bar height `54px`; ribbon padding `13px 26px`.
- Content padding `34px 40px 48px`; card padding `18px 20px` → `24px 26px`.
- Right rails/asides: `320px` / `330px` / `340px`.
- Search box `210×32px`; primary buttons `height 38px` (toolbar) / `46px` (CTA).
- Directions canvas outer padding `56px`.

---

## 4. Border radius scale

| Token       | px           | Used by                                                    |
| ----------- | ------------ | ---------------------------------------------------------- |
| radius-xs   | 3px          | Tiny accent squares, mono-code chip corners                |
| radius-sm   | 5px          | Small badges, table-inline code chips                      |
| radius-md   | 7px          | Lifecycle-state chips, ribbon-step buttons (`9px` variant) |
| radius-lg   | 8px          | Search field, top-bar inputs                               |
| radius-btn  | 9px–10px     | Buttons (toolbar `9px`, CTA `10px`), inset note blocks     |
| radius-icon | 11px         | Icon-rail buttons                                          |
| radius-card | 12px–14px    | Cards & panels (tables `12px`, feature cards/rails `14px`) |
| radius-pill | 20px         | Status badges / chips (pill)                               |
| radius-full | 9999px / 50% | Avatars, step dots, timeline dots, small status dots       |

Guidance: **inputs `8px` · buttons `9–10px` · cards `12–14px` · badges `20px` (pill) ·
avatars & dots `full`.** Keep cards at `14px` for feature panels, `12px` for data tables.

---

## 5. Shadows / elevation

Literal box-shadow values. The system is **low-elevation** — most separation is done
with 1px borders, not shadows. Reserve shadows for lifted/floating states.

| Token       | box-shadow                                    | Use                                        |
| ----------- | --------------------------------------------- | ------------------------------------------ |
| elevation-0 | `none` (rely on `1px solid #e7ecf2` border)   | Resting cards, tables, panels              |
| elevation-1 | `0 1px 2px rgba(17,41,63,0.06)` _(derived)_   | Subtle card hover-lift                     |
| elevation-2 | `0 4px 12px rgba(12,39,66,0.22)`              | Active icon-rail button (pressed/selected) |
| elevation-3 | `0 8px 24px rgba(12,39,66,0.16)` _(derived)_  | Dropdown / popover / menu                  |
| elevation-4 | `0 16px 48px rgba(10,33,56,0.24)` _(derived)_ | Modal / dialog                             |

**Non-elevation shadow utilities (in active use):**

- Inset hairline on logo tiles: `inset 0 0 0 1px rgba(255,255,255,0.08)`.
- Highlight ring on accepted invoice card: `0 0 0 1px #e7f4ec`.
- Timeline dot rings (2px halo): `0 0 0 2px <hue>` — e.g. `#cdddf0` (blue),
  `#c7e6df` (teal), `#f0dcae` (amber), `#a8492a` (rust solid).

> Only `elevation-2` and the ring/inset utilities appear literally in the files;
> elevation-1/3/4 are derived for overlays not yet designed — Kiro should treat them
> as provisional and flag when building Modal / UserMenu / Toast.

---

## 6. Breakpoints / responsive grid

The shipped screens are **fixed desktop app layouts** (~1320px preview, content
`max-width` 1180–1320px); true responsive behavior is **not designed yet** — flag any
mobile/tablet assumption. Use Tailwind defaults as the starting contract:

| Name           | min-width | Intended                   |
| -------------- | --------- | -------------------------- |
| sm (mobile-lg) | 640px     | not designed yet           |
| md (tablet)    | 768px     | not designed yet           |
| lg (desktop)   | 1024px    | primary target lower bound |
| xl (wide)      | 1280px    | primary design target      |
| 2xl            | 1536px    | not designed yet           |

**Layout contract (from designs):**

- App shell = fixed icon rail (`70px`) + fluid main column + optional right rail
  (`320–340px`, `flex:none`).
- Content column `max-width: 1240px` (agreement/trace/charge), `1180px` (ribbon),
  `1320px` (directions), left-aligned with `40px` horizontal padding.
- Two-column card grids use `flex` with `gap: 16px`; table columns use CSS
  `grid-template-columns` with fr ratios (e.g. `1.4fr 1fr 0.9fr 0.9fr`).
- No fixed 12-col grid token defined — layouts are flex/subgrid. Standard gutter `gap`
  values: `16px` (card rows), `26px` (main ↔ rail), `12px`–`14px` (inline groups).

---

## 7. Iconography

- **Source: custom SVG set** (to be built) at consistent stroke weight. **Do not add a
  third-party icon package** (no Lucide/Heroicons/FontAwesome) unless briefed. The
  current mockups use Unicode glyphs (`◳ ▤ ⛴ ⌕ ✓ ›`) as **placeholders only** — replace
  with the custom set, do not ship glyphs.
- **Standard sizes:** `16px` (inline / dense table), `20px` (default UI / buttons),
  `24px` (nav / step dots). Icon-rail glyph optical size ~`18px` inside a `42px` button.
- Status dots (non-icon): `7px` (badge), `9px` (journey), `11px` (timeline node).
- Stroke/emphasis follows text color of context (e.g. muted `#9aa7b4` default, accent
  `#2f73c4`, on-navy `#9fb3c8`).

---

## 8. Motion

Sparingly animated (ERP density favors restraint). Only one literal transition exists
in the files: `transition: all .12s` on icon-rail buttons. Standardize:

| Token           | Duration | Easing                                          | Use                                                   |
| --------------- | -------- | ----------------------------------------------- | ----------------------------------------------------- |
| motion-fast     | 120ms    | `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)       | Hover/active color & bg on buttons, rail, chips, tabs |
| motion-base     | 200ms    | `cubic-bezier(0.4, 0, 0.2, 1)`                  | Dropdown/menu open, accordion, tab-panel              |
| motion-slow     | 300ms    | `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) | Modal / drawer / overlay enter                        |
| motion-emphasis | 400ms    | `cubic-bezier(0.16, 1, 0.3, 1)`                 | Progress/gauge fills, toast slide-in                  |

- Prefer transitioning explicit properties (`background-color, color, border-color,
box-shadow, transform, opacity`) over` all` in production.
- Respect `prefers-reduced-motion`: disable non-essential transforms.

> Only `motion-fast` is literal; base/slow/emphasis are the intended standard —
> confirm against motion specs when Modal/Toast are designed.

---

## 9. Z-index scale

Layering seen in the shell (icon rail `z-index:5`, top bar `z-index:4`, ribbon `z-index:3`)
plus standard overlay layers for components not yet built:

| Token           | value | Layer                                                           |
| --------------- | ----- | --------------------------------------------------------------- |
| z-base          | 0     | Default content flow                                            |
| z-ribbon        | 3     | Journey ribbon                                                  |
| z-topbar        | 4     | Sticky top bar / page header                                    |
| z-sidebar       | 5     | Icon rail / sidebar                                             |
| z-dropdown      | 1000  | Select / SearchSelect / UserMenu menus                          |
| z-sticky-header | 1010  | DataTable sticky header (above dropdown origin, below overlays) |
| z-overlay       | 1100  | Modal/drawer scrim                                              |
| z-modal         | 1110  | Modal / dialog surface                                          |
| z-popover       | 1200  | Tooltip / popover (above modal)                                 |
| z-toast         | 1300  | Toast / notification stack                                      |

> Shell values (3–5) are literal; 1000+ overlay tiers are the intended standard for
> components not yet in the designs.

---

## 10. Component inventory

Grouped simple → complex. "not designed yet" = no visual reference in the files; Kiro
should scaffold a sensible default and **flag** rather than invent silently.

### 10.1 Simple / single-purpose

- **Button** — Variants: `primary` (teal `#0e8079`, white text, 600), `primary-emphasis`
  (navy `#11427a`), `secondary/outline` (white, border `#d6deea`, text `#46586a`, 500),
  `ghost` (transparent, ribbon-step style). Sizes: `sm` h32, `md` h38, `lg` h46 (radius
  9–10px). States shown: default. Hover/active/focus/disabled/**loading = not designed yet**.
- **IconButton** — square `42px`, radius `11px`; active = navy fill + `elevation-2`,
  idle = `#f3f5f8` bg / `#7c8a98` glyph. States: default + active shown; hover/disabled
  not designed yet.
- **Badge / StatusChip** — pill (radius 20px), 11px/600, tinted bg + colored text pairs:
  success `#e7f4ec`/`#1e8e5a`, warning `#fbf1dd`/`#b5780b`, error `#fbede6`/`#a8492a`,
  info `#eaf1fb`/`#2f73c4`, lease `#e1f1ec`/`#0c6b4f`. One `MVP` chip uses radius 5px +
  UPPERCASE. No sizes beyond one.
- **Tag / CodeChip** — mono, `#2f73c4`, used inline in tables (e.g. `CN→NL`, `BAF`).
- **StatusDot** — `7/9/11px` circle, hue-coded, optional 2px halo ring.
- **TextField / Input** — border `#e4e9f0`, radius 8px, h32, 12.5px, placeholder `#9aa7b4`.
  Only search variant shown; focus/error/disabled states **not designed yet**.
- **Select** — not designed yet (scaffold from TextField + chevron).
- **Checkbox / Radio / Switch** — **not designed yet.** Flag; use accent `#2f73c4` /
  primary `#0e8079` when built.
- **ToastBanner** — Types `success` |
  `error` | `warning` | `info` | `loading`, colored via semantic tokens (`bg-success`,
  `bg-warning`/`text-1`, `bg-primary` for info, etc.). Framework-agnostic — plain `<a>` instead
  of `next/link`; `clsx` from `@/utils`; `CloseIcon`/`Spinner` from local icons/atoms.
  Imperative API `showMessage(type, description, options?)` backed by a module-level
  store/emitter, so `@/services/errorHandling.tsx` error handling can trigger it.
  Paired with **ToastViewport** — fixed container,
  top-center, `z-toast` (1300), slide-in via `motion-emphasis`; mount once at root, subscribes
  to the store and renders the stack. States: all five types shown; hover/dismiss interaction
  not yet documented.

### 10.2 Composed / interactive

- **Tabs** — underline style: active 13.5px/600 `#11293f` + 2px bottom border `#11427a`;
  idle `#7c8a98`. Row gap 26px, container border-bottom `#e4e9f0`. States: default+active.
- **Stepper / JourneyRibbon** — horizontal numbered steps with connectors; step dot 24px
  circle (active navy `#11427a`/white, done green `#1e8e5a`/✓, idle `#e4e9f0`/`#9aa7b4`);
  connectors 2px (done teal/blue, pending `#e4e9f0`). Two forms: compact wizard stepper
  (booking) and labeled navigation ribbon (module journey).
- **DatePicker, SearchSelect** — **not designed yet.**
- **Modal** — **not designed yet.** Use elevation-3/4 + z-modal/z-toast.

---

## 11. Accessibility notes

**Contrast (WCAG 2.1, against stated background).**

- `text-1 #11293f` on white → ~13.6:1 ✅ AAA.
- `text-1 #11293f` on app bg `#eef1f5` → ~12:1 ✅ AAA.
- `text-2 #7c8a98` on white → ~3.6:1 — **passes AA for large text only (≥18px/14px-bold),
  fails AA for normal body.** ⚠ Do not use `#7c8a98` for essential small body copy;
  it's acceptable for meta/secondary. For AA-normal secondary text use `#5c6b7a`
  (~5.1:1 ✅) or `#46586a` (~6.7:1 ✅).
- `text-3 #9aa7b4` on white → ~2.6:1 — **fails AA for text.** Restrict to UPPERCASE
  overlines / decorative labels ≥600 weight at large size, or non-text. Flag any use as
  body copy.
- Accent `#2f73c4` on white → ~4.0:1 — passes AA large; **borderline for small text/links.**
  For small link text prefer `#255ea8` (hover token, ~5.6:1 ✅) to be safe.
- Success `#1e8e5a` on `#e7f4ec` → ~3.4:1 (large/badge OK); warning `#b5780b` on `#fbf1dd`
  → ~4.4:1 ✅; error `#a8492a` on `#fbede6` → ~5.0:1 ✅.
- On navy `#0c2742`: white ✅ AAA; `#9fb3c8` → ~5.9:1 ✅ AA; `#7d96b0` → ~4.2:1 (AA large /
  borderline small — keep to captions).
- Primary CTA white-on-teal `#0e8079` → ~4.0:1 — **AA large-text/UI-component pass**;
  button label is 14/600 (large-bold) so ✅. Do not shrink primary button text below 14px.

**Do not "auto-fix" the palette.** The muted slate text tones are intentional for a
dense ERP; the flags above tell Kiro _where_ to pick a darker token, not to recolor the
whole scale.

**Focus ring (standard, every interactive element):**

- Color `#2f73c4` (accent) ring OR `#cdddf0` glow; width **2px** solid ring + **2px**
  offset (`outline: 2px solid #2f73c4; outline-offset: 2px;`) **or** box-shadow
  `0 0 0 3px rgba(47,115,196,0.35)`.
- Never remove focus outlines without an equivalent visible replacement.
- Danger controls use a rust focus ring `rgba(168,73,42,0.35)`.
- Keyboard focus and mouse focus should be visually identical (no `:focus` suppression);
  prefer `:focus-visible` to avoid ring on mouse-press where appropriate.
