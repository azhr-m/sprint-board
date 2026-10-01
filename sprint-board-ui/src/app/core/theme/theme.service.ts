import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemePref = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

/** Must match the no-flash script in src/index.html. */
export const THEME_STORAGE_KEY = 'sb-theme';
const TRANSITION_MS = 220;

/**
 * Single source of truth for theming.
 * - pref: what the user chose (light / dark / system), persisted in localStorage
 * - theme: what is actually applied; 'system' resolves via prefers-color-scheme and updates live
 * Writes data-theme on <html>, which switches every CSS variable in styles/_tokens.scss.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly win = this.doc.defaultView;
  private readonly media = this.win?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemDark = signal(this.media?.matches ?? false);
  readonly pref = signal<ThemePref>(this.read());
  readonly theme = computed<Theme>(() => {
    const pref = this.pref();
    return pref === 'system' ? (this.systemDark() ? 'dark' : 'light') : pref;
  });

  private initialized = false;

  constructor() {
    this.media?.addEventListener('change', (e) => this.systemDark.set(e.matches));

    effect(() => {
      const theme = this.theme();
      const root = this.doc.documentElement;

      // The index.html script already applied the theme for first paint, so only animate real switches.
      if (this.initialized) {
        root.classList.add('theme-transition');
        this.win?.setTimeout(() => root.classList.remove('theme-transition'), TRANSITION_MS);
      }
      this.initialized = true;

      root.setAttribute('data-theme', theme);
      try {
        this.win?.localStorage.setItem(THEME_STORAGE_KEY, this.pref());
      } catch {}
    });
  }

  set(pref: ThemePref): void {
    this.pref.set(pref);
  }

  /** Top-bar toggle: flips the applied theme and pins it (leaves 'system'). */
  toggle(): void {
    this.pref.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private read(): ThemePref {
    try {
      const value = this.win?.localStorage.getItem(THEME_STORAGE_KEY);
      if (value === 'light' || value === 'dark' || value === 'system') return value;
    } catch {}
    return 'system';
  }
}
