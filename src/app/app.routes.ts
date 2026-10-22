import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },

  // Landing pública (consulta de procedimientos), sin sesión.
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
  },

  // Panel de captura, con sesión.
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'registro' },
      {
        path: 'registro',
        loadChildren: () =>
          import('./features/registro/registro.routes').then((m) => m.REGISTRO_ROUTES),
      },
      {
        path: 'documentos',
        loadChildren: () =>
          import('./features/documentos/documentos.routes').then((m) => m.DOCUMENTOS_ROUTES),
      },
      {
        path: 'cambio-password',
        loadComponent: () =>
          import('./features/cambio-password/cambio-password').then((m) => m.CambioPassword),
      },
    ],
  },
  { path: '**', redirectTo: 'licitaciones' },
];
