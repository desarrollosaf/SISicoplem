import { Routes } from '@angular/router';

export const REGISTRO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/registro-lista').then((m) => m.RegistroLista),
  },
  {
    path: 'crear',
    loadComponent: () => import('./formulario/registro-formulario').then((m) => m.RegistroFormulario),
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./formulario/registro-formulario').then((m) => m.RegistroFormulario),
  },
];
