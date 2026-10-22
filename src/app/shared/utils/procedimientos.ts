/**
 * Reglas de cada tipo de procedimiento (tabla `licitacions`). Son las mismas que decidían qué
 * secciones mostraba el formulario original y qué tabla mostraba la ficha pública.
 *
 *  1 Licitación Pública Nacional Presencial · 2 Invitación Restringida Presencial ·
 *  6 Enajenaciones: cuatro fases (venta de bases, junta de aclaraciones, presentación y
 *    apertura de propuestas, emisión de fallo).
 *  4 Adjudicación directa LPNP/IRP: dos fases (apertura de propuestas, emisión de fallo).
 *  3 Adjudicación Directa, 5 Arrendamiento, 7 Donaciones, 8 Enajenación Directa: solo documento.
 */
export type EstructuraProcedimiento = 'cuatro-fases' | 'dos-fases' | 'solo-documento';

export const ESTRUCTURA_POR_TIPO: Record<number, EstructuraProcedimiento> = {
  1: 'cuatro-fases',
  2: 'cuatro-fases',
  3: 'solo-documento',
  4: 'dos-fases',
  5: 'solo-documento',
  6: 'cuatro-fases',
  7: 'solo-documento',
  8: 'solo-documento',
};

export function estructuraDe(tipo: number | null | undefined): EstructuraProcedimiento | null {
  return tipo ? (ESTRUCTURA_POR_TIPO[tipo] ?? null) : null;
}

/** Tipos que llevan "Convocatoria"/"Documento" principal. */
export const TIPOS_SIN_DOCUMENTO = [2, 4];
/** Tipos que permiten subir contrato(s). */
export const TIPOS_CON_CONTRATO = [1, 2, 3, 4];

export const ESTADOS_FASE = [
  { valor: '0', etiqueta: 'Concluido' },
  { valor: '1', etiqueta: 'En proceso' },
  { valor: '2', etiqueta: 'Por realizar' },
] as const;

export function etiquetaEstadoPublico(valor: string | null | undefined): string {
  switch (valor) {
    case '0':
      return 'Concluido';
    case '1':
      return 'Proceso';
    case '2':
      return 'Por realizar';
    default:
      return '';
  }
}

/** Rótulos de cada procedimiento en la landing, agrupados como en el portal original. */
export const GRUPOS_ADQUISICIONES: { tipo: number; titulo: string }[] = [
  { tipo: 1, titulo: 'Licitación Pública Nacional Presencial' },
  { tipo: 2, titulo: 'Invitación Restringida Presencial' },
  { tipo: 3, titulo: 'Adjudicación Directa' },
  { tipo: 4, titulo: 'Adjudicación directa LPNP/IRP' },
];

export const GRUPOS_ARRENDAMIENTO: { tipo: number; titulo: string }[] = [
  { tipo: 5, titulo: 'Arrendamiento' },
  { tipo: 6, titulo: 'Enajenaciones' },
  { tipo: 7, titulo: 'Donaciones' },
  { tipo: 8, titulo: 'Enajenación Directa' },
];
