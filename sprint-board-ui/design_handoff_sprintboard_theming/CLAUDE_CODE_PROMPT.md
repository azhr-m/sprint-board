# Paste into Claude Code

Set up theming for SprintBoard in this Angular project using the handoff in `design_handoff_sprintboard_theming/`. Read its README.md first.

1. Copy `angular/styles/_tokens.scss`, `_base.scss` and `_semantic.scss` into `src/styles/` and wire them into `src/styles.scss` as in `angular/styles.scss`. Check `angular.json` → `stylePreprocessorOptions.includePaths` if `@use 'styles/...'` doesn't resolve.
2. Merge `angular/index.head.html` into `src/index.html` `<head>`. Keep the no-flash script before any stylesheet that depends on the theme.
3. Add `ThemeService` and `ThemeToggleComponent` under `src/app/core/theme/`. Adjust to this repo's conventions (standalone vs NgModule, file naming, signals vs RxJS). Keep the behavior identical: pref in localStorage key `sb-theme`, values light | dark | system, system follows prefers-color-scheme live, and data-theme is set on <html>.
4. Put the toggle in the top bar. Build Settings → Appearance as a radiogroup of three cards (Light / Dark / System) bound to `pref()` / `set()`.
5. If Angular Material is installed, add `_material-bridge.scss` after the Material theme include.
6. Add a lint rule or a quick grep in CI that fails on hex/rgb/hsl/oklch literals in component styles (outside `src/styles/_tokens*.scss`). Components must use `var(--…)`.
7. Create a `/dev/theme` route showing buttons, inputs, status badges and priority chips in both themes side by side (wrap one column in `[data-theme="dark"]`). This checks that tokens scope correctly.
8. Verify: no theme flash on hard reload in dark mode; toggling works; System follows the OS while the app is open; focus rings show on keyboard navigation; body text and `--fg-3` meet AA contrast in both themes.

Don't build the screens yet. This task is the theming layer only.
