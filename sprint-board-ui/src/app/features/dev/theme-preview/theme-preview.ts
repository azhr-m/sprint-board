import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Dev-only specimen page (/dev/theme). Renders the same components in a light and a dark
 * column, each scoped with [data-theme], to check that tokens re-scope correctly
 * regardless of the app-level theme.
 */
@Component({
  selector: 'app-theme-preview',
  templateUrl: './theme-preview.html',
  styleUrl: './theme-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePreview {
  protected readonly themes = ['light', 'dark'] as const;

  protected readonly statuses = [
    { key: 'todo', label: 'To Do', icon: 'radio_button_unchecked' },
    { key: 'progress', label: 'In Progress', icon: 'timelapse' },
    { key: 'review', label: 'Review', icon: 'rate_review' },
    { key: 'done', label: 'Done', icon: 'check_circle' },
  ];

  protected readonly priorities = [
    { key: 'low', label: 'Low', icon: 'keyboard_arrow_down' },
    { key: 'medium', label: 'Medium', icon: 'drag_handle' },
    { key: 'high', label: 'High', icon: 'keyboard_double_arrow_up' },
  ];

  protected readonly surfaces = ['bg', 'surface', 'surface-2', 'surface-3', 'sidebar'];
}
