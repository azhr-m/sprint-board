import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'sb-theme-toggle',
  standalone: true,
  template: `
    <button type="button" class="icon-btn" (click)="theme.toggle()"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            [attr.title]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'">
      <span class="sb-icon" aria-hidden="true">{{ theme.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
    </button>
  `,
  styles: [`
    .icon-btn { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
      border: 0; border-radius: var(--radius-control); background: transparent; color: var(--fg-2); cursor: pointer; }
    .icon-btn:hover { background: var(--surface-2); }
  `],
})
export class ThemeToggleComponent { theme = inject(ThemeService); }
