import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import {
  RegistroDetalle,
  RegistrosService,
  TipoProcedimiento,
} from '../../../core/services/registros.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileUpload } from '../../../shared/file-upload/file-upload';
import {
  ESTADOS_FASE,
  TIPOS_CON_CONTRATO,
  TIPOS_SIN_DOCUMENTO,
  estructuraDe,
} from '../../../shared/utils/procedimientos';
import { esZip, urlArchivo } from '../../../shared/utils/ruta-archivo';

type CampoArchivo = 'documento' | 'documento_base' | 'documento_ja' | 'documento_pap' | 'documento_ef';

interface Fase {
  sufijo: 'uno' | 'dos' | 'tres' | 'cuatro';
  titulo: string;
  archivo: CampoArchivo;
  conLugar: boolean;
  ejemploDia: string;
  ejemploHora: string;
  ejemploLugar: string;
}

const LUGAR_SAF = 'SECRETARÍA DE ADMINISTRACIÓN Y FINANZAS';

const FASES_CUATRO: Fase[] = [
  { sufijo: 'uno', titulo: 'Venta de Bases', archivo: 'documento_base', conLugar: true, ejemploDia: '27 DE NOVIEMBRE DE 2018', ejemploHora: '15:00 HORAS', ejemploLugar: LUGAR_SAF },
  { sufijo: 'dos', titulo: 'Junta de Aclaraciones', archivo: 'documento_ja', conLugar: true, ejemploDia: '28 DE NOVIEMBRE DE 2018', ejemploHora: '12:00 HORAS', ejemploLugar: LUGAR_SAF },
  { sufijo: 'tres', titulo: 'Presentación y Apertura de Propuestas', archivo: 'documento_pap', conLugar: true, ejemploDia: '30 DE NOVIEMBRE DE 2018', ejemploHora: '12:00 HORAS', ejemploLugar: LUGAR_SAF },
  { sufijo: 'cuatro', titulo: 'Emisión de Fallo', archivo: 'documento_ef', conLugar: true, ejemploDia: '03 DE DICIEMBRE DE 2018', ejemploHora: '13:00 HORAS', ejemploLugar: LUGAR_SAF },
];

const FASES_DOS: Fase[] = [
  { sufijo: 'uno', titulo: 'Apertura de Propuestas', archivo: 'documento_pap', conLugar: true, ejemploDia: '22, 23 Y 26 DE NOVIEMBRE DE 2018', ejemploHora: 'DE 10:00 A 16:00 HORAS', ejemploLugar: 'LAS PERSONAS INTERESADAS PODRÁN OBTENER...' },
  { sufijo: 'dos', titulo: 'Emisión de Fallo', archivo: 'documento_ef', conLugar: false, ejemploDia: '03 DE DICIEMBRE DE 2018', ejemploHora: '13:00 HORAS', ejemploLugar: '' },
];

interface Visor {
  titulo: string;
  url: string;
  seguro: SafeResourceUrl | null;
  zip: boolean;
}

@Component({
  selector: 'app-registro-formulario',
  standalone: true,
  imports: [FormsModule, RouterLink, FileUpload],
  templateUrl: './registro-formulario.html',
  styleUrl: './registro-formulario.scss',
})
export class RegistroFormulario {
  protected readonly idRegistro: number | null;
  protected readonly modoEdicion: boolean;
  protected readonly cargandoInicial = signal(true);
  protected readonly enviando = signal(false);
  protected readonly intentoGuardar = signal(false);

  protected readonly tipos = signal<TipoProcedimiento[]>([]);
  protected readonly tipo = signal<number | null>(null);
  protected readonly nombre = signal('');
  /** dia_*, hora_*, lugar_* y radio_* tal como se mandan al servidor. */
  protected readonly datos = signal<Record<string, string>>({});
  protected readonly archivos = signal<Record<string, File[]>>({});
  protected readonly existente = signal<RegistroDetalle | null>(null);
  protected readonly visor = signal<Visor | null>(null);

  protected readonly estados = ESTADOS_FASE;

  protected readonly estructura = computed(() => estructuraDe(this.tipo()));
  protected readonly fases = computed(() => {
    switch (this.estructura()) {
      case 'cuatro-fases':
        return FASES_CUATRO;
      case 'dos-fases':
        return FASES_DOS;
      default:
        return [];
    }
  });
  protected readonly cortas = computed(() => this.estructura() === 'dos-fases');
  protected readonly mostrarDocumento = computed(
    () => this.tipo() !== null && !TIPOS_SIN_DOCUMENTO.includes(this.tipo()!),
  );
  /** "Documento" en adjudicación directa; "Convocatoria" en los demás procedimientos. */
  protected readonly etiquetaDocumento = computed(() => (this.tipo() === 3 ? 'Documento' : 'Convocatoria'));
  protected readonly mostrarContrato = computed(
    () => this.tipo() !== null && TIPOS_CON_CONTRATO.includes(this.tipo()!),
  );

  protected readonly invalidTipo = computed(() => this.intentoGuardar() && this.tipo() === null);

  constructor(
    private readonly registrosService: RegistrosService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    route: ActivatedRoute,
  ) {
    const idParam = route.snapshot.paramMap.get('id');
    this.idRegistro = idParam ? Number(idParam) : null;
    this.modoEdicion = this.idRegistro !== null;

    this.registrosService.tiposProcedimiento().subscribe({
      next: (rows) => {
        this.tipos.set(rows);
        if (!this.modoEdicion) this.cargandoInicial.set(false);
      },
      error: () => {
        this.toastService.error('No se pudieron cargar los tipos de procedimiento.');
        this.cargandoInicial.set(false);
      },
    });

    if (this.modoEdicion) {
      this.cargarParaEdicion(this.idRegistro!);
    }
  }

  onTipoChange(valor: string): void {
    this.tipo.set(valor ? Number(valor) : null);
  }

  dato(campo: string): string {
    return this.datos()[campo] ?? '';
  }

  setDato(campo: string, valor: string): void {
    this.datos.update((d) => ({ ...d, [campo]: valor }));
  }

  archivosDe(campo: string): File[] {
    return this.archivos()[campo] ?? [];
  }

  setArchivos(campo: string, files: File[], unico: boolean): void {
    this.archivos.update((a) => ({ ...a, [campo]: unico ? files.slice(-1) : files }));
  }

  /** Ruta ya guardada de un documento del registro que se está editando. */
  rutaExistente(campo: string): string | null {
    const registro = this.existente() as unknown as Record<string, string | null> | null;
    return registro?.[campo] ?? null;
  }

  urlExistente(campo: string): string | null {
    return urlArchivo(this.rutaExistente(campo));
  }

  verDocumento(titulo: string, ruta: string | null): void {
    const url = urlArchivo(ruta);
    if (!url) return;
    const zip = esZip(ruta);
    this.visor.set({
      titulo,
      url,
      zip,
      seguro: zip ? null : this.sanitizer.bypassSecurityTrustResourceUrl(url),
    });
  }

  cerrarVisor(): void {
    this.visor.set(null);
  }

  guardar(): void {
    this.intentoGuardar.set(true);

    if (this.tipo() === null) {
      this.toastService.error('Debes seleccionar el tipo de procedimiento.');
      return;
    }

    const formulario = this.armarFormData();
    this.enviando.set(true);
    const peticion: Observable<unknown> = this.modoEdicion
      ? this.registrosService.actualizar(this.idRegistro!, formulario)
      : this.registrosService.crear(formulario);

    peticion.subscribe({
      next: () => {
        this.enviando.set(false);
        this.toastService.success(this.modoEdicion ? 'Registro guardado.' : 'Se ha guardado correctamente.');
        void this.router.navigateByUrl('/registro');
      },
      error: () => {
        this.enviando.set(false);
        this.toastService.error('No se pudo guardar el registro.');
      },
    });
  }

  private armarFormData(): FormData {
    const formulario = new FormData();
    formulario.append('tipo', String(this.tipo()));
    formulario.append('nombre', this.nombre());

    for (const fase of this.fases()) {
      const s = fase.sufijo;
      formulario.append(`dia_${s}`, this.dato(`dia_${s}`));
      formulario.append(`hora_${s}`, this.dato(`hora_${s}`));
      if (fase.conLugar) formulario.append(`lugar_${s}`, this.dato(`lugar_${s}`));
      // Vacío = sin estado: el servidor lo guarda como NULL (así también se puede quitar uno ya elegido).
      formulario.append(`radio_${s}`, this.dato(`radio_${s}`));
    }

    const campos: CampoArchivo[] = [
      ...(this.mostrarDocumento() ? (['documento'] as CampoArchivo[]) : []),
      ...this.fases().map((f) => f.archivo),
    ];
    for (const campo of campos) {
      const archivo = this.archivosDe(campo)[0];
      if (archivo) formulario.append(campo, archivo);
    }

    if (this.mostrarContrato()) {
      for (const archivo of this.archivosDe('contrato')) formulario.append('contrato', archivo);
    }

    return formulario;
  }

  private cargarParaEdicion(id: number): void {
    this.registrosService.obtener(id).subscribe({
      next: (registro) => {
        this.existente.set(registro);
        this.tipo.set(registro.tipo);
        this.nombre.set(registro.nombre ?? '');

        const valores: Record<string, string> = {};
        const crudo = registro as unknown as Record<string, string | null>;
        for (const s of ['uno', 'dos', 'tres', 'cuatro']) {
          for (const prefijo of ['dia', 'hora', 'lugar', 'radio']) {
            valores[`${prefijo}_${s}`] = crudo[`${prefijo}_${s}`] ?? '';
          }
        }
        this.datos.set(valores);
        this.cargandoInicial.set(false);
      },
      error: () => {
        this.toastService.error('No se pudo cargar el registro.');
        this.cargandoInicial.set(false);
        void this.router.navigateByUrl('/registro');
      },
    });
  }
}
