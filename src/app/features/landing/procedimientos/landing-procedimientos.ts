import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProcedimientoPublico, PublicoService } from '../../../core/services/publico.service';
import {
  GRUPOS_ADQUISICIONES,
  GRUPOS_ARRENDAMIENTO,
} from '../../../shared/utils/procedimientos';

interface SeccionTipo {
  titulo: string;
  items: ProcedimientoPublico[];
}

interface Anio {
  anio: string;
  secciones: SeccionTipo[];
}

@Component({
  selector: 'app-landing-procedimientos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-procedimientos.html',
  styleUrl: './landing-procedimientos.scss',
})
export class LandingProcedimientos {
  protected readonly titulo: string;
  protected readonly descripcion: string;

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly procedimientos = signal<ProcedimientoPublico[]>([]);
  private readonly anioElegido = signal<string | null>(null);

  private readonly grupos: { tipo: number; titulo: string }[];

  /** Años de más reciente a más antiguo, con sus procedimientos agrupados por tipo. */
  protected readonly anios = computed<Anio[]>(() => {
    const porAnio = new Map<string, ProcedimientoPublico[]>();
    for (const p of this.procedimientos()) {
      const anio = p.fecha ? p.fecha.slice(0, 4) : 'Sin fecha';
      porAnio.set(anio, [...(porAnio.get(anio) ?? []), p]);
    }
    return [...porAnio.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([anio, items]) => ({
        anio,
        secciones: this.grupos
          .map((g) => ({ titulo: g.titulo, items: items.filter((i) => i.tipo === g.tipo) }))
          .filter((s) => s.items.length > 0),
      }));
  });

  protected readonly anioActivo = computed(() => this.anioElegido() ?? this.anios()[0]?.anio ?? null);
  protected readonly seleccionado = computed(() => this.anios().find((a) => a.anio === this.anioActivo()));

  constructor(route: ActivatedRoute, publicoService: PublicoService) {
    const grupo = route.snapshot.data['grupo'] === 'arrendamiento' ? 'arrendamiento' : 'adquisiciones';
    this.grupos = grupo === 'arrendamiento' ? GRUPOS_ARRENDAMIENTO : GRUPOS_ADQUISICIONES;
    this.titulo =
      grupo === 'arrendamiento'
        ? 'Procedimientos de arrendamientos, adquisiciones de inmuebles y enajenaciones'
        : 'Procedimientos de adquisiciones y servicios';
    this.descripcion = 'Selecciona el año y consulta el detalle de cada procedimiento.';

    publicoService.procedimientos(grupo).subscribe({
      next: (rows) => {
        this.procedimientos.set(rows);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los procedimientos.');
        this.cargando.set(false);
      },
    });
  }

  elegirAnio(anio: string): void {
    this.anioElegido.set(anio);
  }
}
