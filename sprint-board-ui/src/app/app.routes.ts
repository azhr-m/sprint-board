import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

const devRoutes: Routes = [
  {
    path: 'dev/theme',
    title: 'Theme preview · SprintBoard',
    loadComponent: () =>
      import('./features/dev/theme-preview/theme-preview').then((m) => m.ThemePreview),
  },
];

export const routes: Routes = [
  // Temporary landing route until the Dashboard exists.
  { path: '', pathMatch: 'full', redirectTo: 'settings' },
  {
    path: 'settings',
    title: 'Settings · SprintBoard',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  ...(isDevMode() ? devRoutes : []),
  { path: '**', redirectTo: '' },
];
