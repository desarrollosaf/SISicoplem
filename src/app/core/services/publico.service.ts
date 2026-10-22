import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistroDetalle } from './registros.service';

export interface ProcedimientoPublico {
  id: number;
  tipo: number;
  nombre: string | null;
  fecha: string | null;
}

export type ProcedimientoDetalle = RegistroDetalle & { tipoNombre: string | null };

export interface DocumentosActivos {
  programaAdquisiciones: string | null;
  programaArrendamientos: string | null;
  catalogoBienes: string | null;
}

/** Consulta pública de la landing (sin sesión). */
@Injectable({ providedIn: 'root' })
export class PublicoService {
  private readonly url = `${environment.apiUrl}/publico`;

  constructor(private readonly http: HttpClient) {}

  procedimientos(grupo: 'adquisiciones' | 'arrendamiento'): Observable<ProcedimientoPublico[]> {
    return this.http.get<ProcedimientoPublico[]>(`${this.url}/procedimientos`, { params: { grupo } });
  }

  procedimiento(id: number): Observable<ProcedimientoDetalle> {
    return this.http.get<ProcedimientoDetalle>(`${this.url}/procedimientos/${id}`);
  }

  documentos(): Observable<DocumentosActivos> {
    return this.http.get<DocumentosActivos>(`${this.url}/documentos`);
  }
}
