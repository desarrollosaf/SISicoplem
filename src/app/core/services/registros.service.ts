import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistroListado {
  id: number;
  tipo: number;
  tipoNombre: string | null;
  nombre: string | null;
  fecha: string | null;
}

/** Registro completo (tabla sicoplem_irp_lpnp). */
export interface RegistroDetalle {
  id: number;
  tipo: number;
  nombre: string | null;
  fecha: string | null;
  hora: string | null;
  dia_uno: string | null;
  dia_dos: string | null;
  dia_tres: string | null;
  dia_cuatro: string | null;
  hora_uno: string | null;
  hora_dos: string | null;
  hora_tres: string | null;
  hora_cuatro: string | null;
  lugar_uno: string | null;
  lugar_dos: string | null;
  lugar_tres: string | null;
  lugar_cuatro: string | null;
  radio_uno: string | null;
  radio_dos: string | null;
  radio_tres: string | null;
  radio_cuatro: string | null;
  documento: string | null;
  documento_base: string | null;
  documento_ja: string | null;
  documento_pap: string | null;
  documento_ef: string | null;
  path_contrato: string | null;
}

export interface TipoProcedimiento {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrosService {
  private readonly url = `${environment.apiUrl}/registros`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<RegistroListado[]> {
    return this.http.get<RegistroListado[]>(this.url);
  }

  obtener(id: number): Observable<RegistroDetalle> {
    return this.http.get<RegistroDetalle>(`${this.url}/${id}`);
  }

  crear(datos: FormData): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.url, datos);
  }

  actualizar(id: number, datos: FormData): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.url}/${id}`);
  }

  tiposProcedimiento(): Observable<TipoProcedimiento[]> {
    return this.http.get<TipoProcedimiento[]>(`${environment.apiUrl}/catalogos/tipos-procedimiento`);
  }
}
