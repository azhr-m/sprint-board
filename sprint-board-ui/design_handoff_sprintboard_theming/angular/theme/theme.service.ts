import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemePref = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sb-theme';

/**
 * Single source of truth for theming.
 * - pref: what the user chose (light / dark / system) — persisted
 * - theme: what is actually applied — resolves 'system' via prefers-color-scheme
 * Applies data-theme on <html>, which switches every CSS variable in tokens.scss.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);
  private media = this.doc.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  private systemDark = signal(this.media?.matches ?? false);
  readonly pref = signal<ThemePref>(this.read());
  readonly theme = computed<Theme>(() =>
    this.pref() === 'system' ? (this.systemDark() ? 'dark' : 'light') : (this.pref() as Theme)
  );

  constructor() {
    this.media?.addEventListener('change', e => this.systemDark.set(e.matches));
    effect(() => {
      const t = this.theme();
      const root = this.doc.documentElement;
      root.classList.add('theme-transition');
      root.setAttribute('data-theme', t);
      setTimeout(() => root.classList.remove('theme-transition'), 220);
      try { localStorage.setItem(STORAGE_KEY, this.pref()); } catch {}
    });
  }

  set(pref: ThemePref) { this.pref.set(pref); }
  /** Top-bar toggle: flips the applied theme and pins it (leaves 'system'). */
  toggle() { this.pref.set(this.theme() === 'dark' ? 'light' : 'dark'); }

  private read(): ThemePref {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch {}
    return 'system';
  }
}
