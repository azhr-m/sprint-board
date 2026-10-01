# Handoff: SprintBoard theming (Angular)

## Overview
SprintBoard is an Agile task-management web app (Dashboard, Board, Task Detail, My Tasks, Team, Admin, Settings). This package covers the **theming foundation**: design tokens for light and dark, the runtime theme switch (light / dark / system), base styles, and the status/priority color system. Build these first, before any screen.

## About the design files
`reference/SprintBoard.dc.html` (clickable prototype) and `reference/SprintBoard Design System.dc.html` (tokens, components, flow map) are **design references built in HTML**. They are not production code. Recreate them in the Angular codebase using its existing patterns. The files in `angular/` are ready-to-use starting points for the theming layer.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, shadows and motion are final. Match them exactly.

## How theming works
1. Every color is a CSS custom property defined twice: once on `:root, [data-theme='light']` and once on `[data-theme='dark']` (`angular/styles/_tokens.scss`).
2. `ThemeService` (signals) stores the user's pick (`light | dark | system`) in `localStorage['sb-theme']`, resolves `system` with `prefers-color-scheme` (live-updating), and writes `data-theme` on `<html>`.
3. An inline script in `index.html` applies the theme before Angular boots, so the first paint has no flash.
4. Components only use `var(--token)`. **Never hard-code a color** in a component stylesheet. Then dark mode needs no extra work.
5. The top-bar toggle flips between light and dark. Settings → Appearance offers Light / Dark / System as three radio cards.

## Setup steps (for Claude Code)
1. Copy `angular/styles/*` → `src/styles/`.
2. Replace `src/styles.scss` with `angular/styles.scss` (or add its `@use` lines).
3. Merge `angular/index.head.html` into `src/index.html` `<head>` (fonts, icon font, no-flash script).
4. Copy `angular/theme/theme.service.ts` and `theme-toggle.component.ts` → `src/app/core/theme/`.
5. Put `<sb-theme-toggle>` in the top bar. Bind Settings → Appearance radios to `themeService.pref()` / `themeService.set()`.
6. If the project uses Angular Material, also `@use 'styles/material-bridge'` after including a Material theme.
7. SSR (Angular Universal / `@angular/ssr`): the service only touches `localStorage` and `matchMedia` behind guards, but run its effect in the browser only (`afterNextRender` or an `isPlatformBrowser` check) if hydration warnings appear.

## Design tokens
Colors are authored in **OKLCH**, with sRGB hex equivalents in `tokens.json` and in comments in `_tokens.scss`. `_tokens.hex.scss` is a hex-only drop-in if OKLCH can't be used.

### Color roles
- `--bg` app background · `--surface` cards, top bar, panels · `--surface-2` hover, table headers, sunken areas · `--surface-3` skeletons, tracks, count pills · `--sidebar` sidebar
- `--border` default 1px border · `--border-strong` inputs, secondary buttons
- `--fg` primary text · `--fg-2` secondary text · `--fg-3` meta, placeholders, icons. All pass WCAG AA on `--surface` and `--bg`.
- `--accent` primary buttons, active states, progress · `--accent-hover` · `--on-accent` text on accent · `--accent-soft` active nav, selected rows · `--accent-soft-strong` focus glow on inputs · `--accent-text` links and accent text · `--ring` focus outline
- `--danger`, `--danger-hover`, `--on-danger`, `--danger-soft`, `--danger-text`: destructive actions, **overdue dates**, errors
- `--success-text`, `--warn` (unsaved-changes dot), `--live` / `--live-ring` (pulsing "Live" dot)
- `--scrim` behind dialogs and side panels
- `--toast-bg`, `--toast-fg`, `--toast-ok`, `--toast-link` inverted toasts

### Status (each has bg / fg / dot)
| Status | Token prefix | Icon (Material Symbols) |
|---|---|---|
| To Do | `--st-todo-*` (neutral gray) | `radio_button_unchecked` |
| In Progress | `--st-progress-*` (blue) | `timelapse` |
| Review | `--st-review-*` (amber) | `rate_review` |
| Done | `--st-done-*` (green) | `check_circle` |

### Priority (bg / fg)
| Priority | Token prefix | Icon |
|---|---|---|
| Low | `--pr-low-*` (neutral) | `keyboard_arrow_down` |
| Medium | `--pr-medium-*` (cyan-blue) | `drag_handle` |
| High | `--pr-high-*` (warm coral, *not* red) | `keyboard_double_arrow_up` |

Red is reserved for overdue and errors, so High priority stands out without looking like an alarm. Always show the icon and the label together. Never use color alone.

### Typography (Geist + Geist Mono)
| Role | Size / weight | Tracking | Use |
|---|---|---|---|
| Display | 40 / 640 | -0.025em | Design-system headings only |
| H1 | 24 / 620, lh 1.2 | -0.015em | Page titles |
| Task title (detail) | 26 / 620, lh 1.25 | -0.018em | Task Detail H1 |
| H2 | 15 / 600 | 0 | Card and section titles |
| Body | 14 / 400, lh 1.45 | 0 | Default |
| Card title | 14 / 530, lh 1.4 | 0 | Board cards |
| Label | 13 / 560 | 0 | Form labels |
| Meta | 12.5 / 450 | 0 | Timestamps, helper text |
| Table header | 12 / 600, uppercase | 0.02em | Table column headers |
| Mono | 11.5–12 / 450 Geist Mono | 0 | Task IDs (SB-142), dates in sprint bars, kbd hints |

Use `font-variant-numeric: tabular-nums` on counts and stats.

### Spacing, radius, elevation
- Spacing: 4px base, scale 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48. Page padding 28px top, 32px sides. Card padding 18–20px. Grid gaps 16px. Board column gap 16px, card gap 8px.
- Radius: chip 6 · control (buttons, inputs) 8 · card 10 · panel and large card 12 · dialog 14 · pill 999.
- Shadows: `--sh-1` resting cards · `--sh-2` hover · `--sh-3` menus, popovers, side panel, dialogs, toasts, lifted drag card. Dark theme uses stronger black shadows. Surfaces get lighter as they rise.
- Controls: heights 32 (small) / 36 (default) / 40 (form inputs). Icon buttons are 36×36.
- Shell: sidebar 240px (collapsed 68px, width transition 180ms) · top bar 60px · side panel 540px.

### Focus and interaction states
- Every interactive element: `:focus-visible` → `outline: 2px solid var(--ring); outline-offset: 2px`.
- Inputs: on focus, `border-color: var(--accent)` and `box-shadow: 0 0 0 3px var(--accent-soft-strong)`. On error, `border-color: var(--danger)`, an error icon inside the field on the right, and a message in `--danger-text` (12.5px) with an `error` icon.
- Buttons: primary hover → `--accent-hover`. Secondary and ghost hover → `--surface-2`. Disabled → opacity .45–.6, `cursor: not-allowed`. Loading → 14px spinner (2px border, right side transparent, 0.7s linear spin), a label such as "Saving…", button disabled.
- Active nav item: `--accent-soft` background, `--accent-text` text and icon, weight 600.

### Motion
- Popovers and dialogs: `sb-pop` 140–160ms ease. Side panel: `sb-panel` 200ms. Toasts: `sb-toast` 220ms, auto-dismiss after 5s, max 3 stacked, bottom-right 24px.
- Skeletons: `sb-shimmer` 1.4s ease-in-out infinite on `--surface-3` blocks shaped like the real content. Use skeletons, not spinners, for page and list loading.
- New card after create: `sb-glow` 2.4s ease-out.
- Theme switch: 180ms color transitions, only during the switch (`.theme-transition` on `<html>`).
- Respect `prefers-reduced-motion` (handled in `_base.scss`).

## Assets
- Fonts: Geist and Geist Mono (Google Fonts, OFL). To self-host instead, install the `geist` npm package.
- Icons: Material Symbols Rounded (Google Fonts), weight 350, optical size 20, sizes 15–20px. Ligature names are listed above and in the prototype. For an SVG approach, use `@angular/material`'s `MatIconModule` with the same symbol names, or the `material-symbols` npm package.
- Avatars: initials on a hue-per-person circle, `background: oklch(0.8 0.09 H)` and `color: oklch(0.3 0.08 H)`, with H stored per user. The same values work in both themes.

## Files
- `angular/styles/_tokens.scss`: all CSS variables (OKLCH, hex in comments), light and dark, plus non-color tokens
- `angular/styles/_tokens.hex.scss`: hex-only fallback
- `angular/styles/_base.scss`: resets, focus ring, icon class, keyframes, reduced motion
- `angular/styles/_semantic.scss`: `.sb-badge[data-status]`, `.sb-prio[data-priority]`, `.sb-skeleton`
- `angular/styles/_material-bridge.scss`: optional Angular Material mapping
- `angular/styles.scss`: entry file
- `angular/index.head.html`: font links and no-flash theme script
- `angular/theme/theme.service.ts`, `angular/theme/theme-toggle.component.ts`
- `tokens.json`: machine-readable tokens (for Style Dictionary or Figma Tokens if needed)
- `reference/`: the HTML prototype and design system (open `SprintBoard Design System.dc.html` in a browser)
- `CLAUDE_CODE_PROMPT.md`: a paste-ready prompt
