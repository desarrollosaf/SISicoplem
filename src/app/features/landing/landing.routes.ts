import { Routes } from '@angular/router';

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/landing-layout').then((m) => m.LandingLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'licitaciones' },
      {
        path: 'licitaciones',
        loadComponent: () => import('./inicio/landing-inicio').then((m) => m.LandingInicio),
      },
      {
        path: 'licitaciones/:id',
        loadComponent: () => import('./detalle/landing-detalle').then((m) => m.LandingDetalle),
      },
      {
        path: 'adquisiciones',
        data: { grupo: 'adquisiciones' },
        loadComponent: () =>
          import('./procedimientos/landing-procedimientos').then((m) => m.LandingProcedimientos),
      },
      {
        path: 'arrendamiento',
        data: { grupo: 'arrendamiento' },
        loadComponent: () =>
          import('./procedimientos/landing-procedimientos').then((m) => m.LandingProcedimientos),
      },
    ],
  },
];
