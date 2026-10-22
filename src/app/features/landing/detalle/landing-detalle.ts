import { Location } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcedimientoDetalle, PublicoService } from '../../../core/services/publico.service';
import { estructuraDe, etiquetaEstadoPublico } from '../../../shared/utils/procedimientos';
import { urlArchivo } from '../../../shared/utils/ruta-archivo';

interface FilaFase {
  fase: string;
  dia: string | null;
  hora: string | null;
  lugar: string | null;
  estado: string;
  documento: string | null;
}

@Component({
  selector: 'app-landing-detalle',
  standalone: true,
  imports: [],
  templateUrl: './landing-detalle.html',
  styleUrl: './landing-detalle.scss',
})
export class LandingDetalle {
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly procedimiento = signal<ProcedimientoDetalle | null>(null);

  /** "Documento" en adjudicación directa; "Convocatoria" en los demás (las de tipo 2 y 4 no llevan). */
  protected readonly etiquetaDocumento = computed(() =>
    this.procedimiento()?.tipo === 3 ? 'Documento' : 'Convocatoria',
  );

  protected readonly filas = computed<FilaFase[]>(() => {
    const p = this.procedimiento();
    if (!p) return [];
    switch (estructuraDe(p.tipo)) {
      case 'cuatro-fases':
        return [
          this.fila('Venta de bases', p, 'uno', p.documento_base),
          this.fila('Junta de Aclaraciones', p, 'dos', p.documento_ja),
          this.fila('Presentacion y Apertura de Propuestas', p, 'tres', p.documento_pap),
          this.fila('Emisión de Fallo', p, 'cuatro', p.documento_ef),
        ];
      case 'dos-fases':
        return [
          this.fila('Presentacion y Apertura de Propuestas', p, 'uno', p.documento_pap),
          this.fila('Emisión de Fallo', p, 'dos', p.documento_ef),
        ];
      default:
        return [];
    }
  });

  constructor(
    route: ActivatedRoute,
    publicoService: PublicoService,
    private readonly location: Location,
    private readonly router: Router,
  ) {
    const id = Number(route.snapshot.paramMap.get('id'));

    publicoService.procedimiento(id).subscribe({
      next: (p) => {
        this.procedimiento.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se encontró el procedimiento solicitado.');
        this.cargando.set(false);
      },
    });
  }

  /** Regresa a la lista de donde vino; si se abrió directo el enlace, va al inicio. */
  volver(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigateByUrl('/licitaciones');
    }
  }

  url(ruta: string | null | undefined): string | null {
    return urlArchivo(ruta);
  }

  private fila(
    fase: string,
    p: ProcedimientoDetalle,
    sufijo: 'uno' | 'dos' | 'tres' | 'cuatro',
    documento: string | null,
  ): FilaFase {
    const crudo = p as unknown as Record<string, string | null>;
    return {
      fase,
      dia: crudo[`dia_${sufijo}`],
      hora: crudo[`hora_${sufijo}`],
      lugar: crudo[`lugar_${sufijo}`],
      estado: etiquetaEstadoPublico(crudo[`radio_${sufijo}`]),
      documento,
    };
  }
}
