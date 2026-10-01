import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemePref, ThemeService } from '../../core/theme/theme.service';

interface ThemeOption {
  value: ThemePref;
  label: string;
  /** Themes rendered in the preview; System shows light and dark side by side. */
  preview: ('light' | 'dark')[];
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly themeService = inject(ThemeService);

  protected readonly themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Light', preview: ['light'] },
    { value: 'dark', label: 'Dark', preview: ['dark'] },
    { value: 'system', label: 'System', preview: ['light', 'dark'] },
  ];
}
