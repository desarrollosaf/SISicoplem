import { Signal, computed, signal } from '@angular/core';

/** Quita acentos y mayúsculas para que "solicitud" encuentre "SOLICITÚD" y viceversa. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Búsqueda + paginación del lado del cliente para las listas de cards (reemplaza lo que hacía
 * AG Grid con quickFilter/pagination). Cada palabra buscada debe aparecer en el texto del
 * registro, en cualquier orden.
 */
export class ListaPaginada<T> {
  readonly busqueda = signal('');
  private readonly paginaSolicitada = signal(1);
  readonly tamano = signal(10);

  readonly filtradas: Signal<T[]>;
  readonly totalPaginas: Signal<number>;
  /** Nunca se sale del rango aunque cambie la fuente (p. ej. se firmó y desapareció un registro). */
  readonly pagina: Signal<number>;
  readonly visibles: Signal<T[]>;

  constructor(fuente: () => T[], textoDe: (item: T) => string) {
    this.filtradas = computed(() => {
      const palabras = normalizarTexto(this.busqueda()).split(/\s+/).filter(Boolean);
      const items = fuente();
      if (palabras.length === 0) return items;
      return items.filter((item) => {
        const texto = normalizarTexto(textoDe(item));
        return palabras.every((p) => texto.includes(p));
      });
    });
    this.totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtradas().length / this.tamano())));
    this.pagina = computed(() => Math.min(this.paginaSolicitada(), this.totalPaginas()));
    this.visibles = computed(() => {
      const inicio = (this.pagina() - 1) * this.tamano();
      return this.filtradas().slice(inicio, inicio + this.tamano());
    });
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.paginaSolicitada.set(1);
  }

  irAPagina(pagina: number): void {
    this.paginaSolicitada.set(pagina);
  }

  cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.paginaSolicitada.set(1);
  }

  /** Para cuando cambia un filtro externo (estatus, pestaña…): vuelve a la primera página. */
  reiniciar(): void {
    this.paginaSolicitada.set(1);
  }
}
