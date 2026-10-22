import { environment } from '../../../environments/environment';

/** URL pública de un archivo guardado (la base guarda rutas como `Documentos/<uuid>/<nombre>`). */
export function urlArchivo(ruta: string | null | undefined): string | null {
  if (!ruta) return null;
  return `${environment.uploadsUrl}/${ruta.split('/').map(encodeURIComponent).join('/')}`;
}

export function esZip(ruta: string | null | undefined): boolean {
  return !!ruta && ruta.toLowerCase().endsWith('.zip');
}
