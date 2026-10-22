import { Routes } from '@angular/router';

export const DOCUMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lista/documentos-lista').then((m) => m.DocumentosLista),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./formulario/documento-formulario').then((m) => m.DocumentoFormulario),
  },
];
