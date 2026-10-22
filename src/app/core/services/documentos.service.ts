import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentoListado {
  id: number;
  tipo: number;
  tipoNombre: string;
  activo: boolean;
  path: string;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private readonly url = `${environment.apiUrl}/documentos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<DocumentoListado[]> {
    return this.http.get<DocumentoListado[]>(this.url);
  }

  tipos(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.url}/tipos`);
  }

  crear(tipo: number, documento: File): Observable<{ id: number }> {
    const datos = new FormData();
    datos.append('tipo', String(tipo));
    datos.append('documento', documento);
    return this.http.post<{ id: number }>(this.url, datos);
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.url}/${id}`);
  }
}
