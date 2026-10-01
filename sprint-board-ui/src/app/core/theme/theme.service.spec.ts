import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

/** Minimal controllable prefers-color-scheme media query. */
function fakeMedia(matches: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = [];
  return {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
    emit(value: boolean) {
      matches = value;
      listeners.forEach((fn) => fn({ matches: value }));
    },
  };
}

describe('ThemeService', () => {
  let media: ReturnType<typeof fakeMedia>;
  let root: HTMLElement;

  function create(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    media = fakeMedia(false);
    const doc = TestBed.inject(DOCUMENT);
    root = doc.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('theme-transition');
    doc.defaultView!.matchMedia = (() => media) as unknown as typeof window.matchMedia;
  });

  it('defaults to system and follows prefers-color-scheme', () => {
    media = fakeMedia(true);
    const service = create();
    expect(service.pref()).toBe('system');
    expect(service.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('reads a stored preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const service = create();
    expect(service.pref()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create().pref()).toBe('system');
  });

  it('set() applies and persists the preference', () => {
    const service = create();
    service.set('dark');
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('system updates live when the OS scheme changes', () => {
    const service = create();
    expect(root.getAttribute('data-theme')).toBe('light');

    media.emit(true);
    TestBed.tick();
    expect(service.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('an explicit choice ignores OS changes', () => {
    const service = create();
    service.set('light');
    media.emit(true);
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('toggle() flips the applied theme and leaves system', () => {
    media = fakeMedia(true);
    const service = create();
    service.toggle();
    TestBed.tick();
    expect(service.pref()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('animates real switches only, not the initial apply', () => {
    const service = create();
    expect(root.classList.contains('theme-transition')).toBe(false);
    service.toggle();
    TestBed.tick();
    expect(root.classList.contains('theme-transition')).toBe(true);
  });
});
