import { Component, ElementRef, computed, inject, input, output } from '@angular/core';

/** Controles de paginación para las listas de cards: rango, páginas y tamaño de página. */
@Component({
  selector: 'app-paginador',
  standalone: true,
  template: `
    @if (total() > 0) {
      <nav class="paginador" aria-label="Paginación">
        <span class="paginador__rango">
          Mostrando <strong>{{ desde() }}–{{ hasta() }}</strong> de <strong>{{ total() }}</strong>
        </span>

        @if (totalPaginas() > 1) {
          <div class="paginador__paginas">
            <button
              type="button"
              class="paginador__btn"
              [disabled]="pagina() === 1"
              aria-label="Página anterior"
              (click)="irA(pagina() - 1)"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            @for (p of paginas(); track $index) {
              @if (p === null) {
                <span class="paginador__salto" aria-hidden="true">…</span>
              } @else {
                <button
                  type="button"
                  class="paginador__btn"
                  [class.is-active]="p === pagina()"
                  [attr.aria-current]="p === pagina() ? 'page' : null"
                  (click)="irA(p)"
                >
                  {{ p }}
                </button>
              }
            }
            <button
              type="button"
              class="paginador__btn"
              [disabled]="pagina() === totalPaginas()"
              aria-label="Página siguiente"
              (click)="irA(pagina() + 1)"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        }

        <label class="paginador__tamano">
          <span>Por página</span>
          <select [value]="tamano()" (change)="onTamano($event)">
            @for (t of tamanos(); track t) {
              <option [value]="t" [selected]="t === tamano()">{{ t }}</option>
            }
          </select>
        </label>
      </nav>
    }
  `,
  styles: [
    `
      .paginador {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
        margin-top: 1.1rem;
        font-size: 0.82rem;
        color: var(--brand-muted);
      }

      .paginador__rango strong {
        color: var(--brand-ink);
      }

      .paginador__paginas {
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .paginador__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 34px;
        height: 34px;
        padding: 0 0.55rem;
        border: 1.5px solid var(--brand-border);
        border-radius: 10px;
        background: #fff;
        color: var(--brand-ink);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          background 0.15s,
          border-color 0.15s,
          color 0.15s;
      }

      .paginador__btn svg {
        width: 16px;
        height: 16px;
      }

      .paginador__btn:hover:not(:disabled):not(.is-active) {
        border-color: var(--brand-primary);
        color: var(--brand-primary);
      }

      .paginador__btn.is-active {
        border-color: var(--brand-primary);
        background: var(--brand-primary);
        color: #fff;
      }

      .paginador__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .paginador__salto {
        padding: 0 0.2rem;
      }

      .paginador__tamano {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }

      .paginador__tamano select {
        height: 34px;
        padding: 0 0.5rem;
        border: 1.5px solid var(--brand-border);
        border-radius: 10px;
        background: #fff;
        color: var(--brand-ink);
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
      }

      @media (max-width: 640px) {
        .paginador {
          justify-content: center;
        }
      }
    `,
  ],
})
export class Paginador {
  readonly total = input.required<number>();
  readonly pagina = input.required<number>();
  readonly tamano = input.required<number>();
  readonly tamanos = input<number[]>([10, 20, 50]);

  readonly paginaChange = output<number>();
  readonly tamanoChange = output<number>();

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamano())));
  protected readonly desde = computed(() => (this.total() === 0 ? 0 : (this.pagina() - 1) * this.tamano() + 1));
  protected readonly hasta = computed(() => Math.min(this.total(), this.pagina() * this.tamano()));

  /** Primera, última y las vecinas de la actual; `null` = salto ("…"). */
  protected readonly paginas = computed<(number | null)[]>(() => {
    const total = this.totalPaginas();
    const actual = this.pagina();
    const visibles = new Set([1, total, actual - 1, actual, actual + 1].filter((p) => p >= 1 && p <= total));
    const ordenadas = [...visibles].sort((a, b) => a - b);
    const resultado: (number | null)[] = [];
    ordenadas.forEach((p, i) => {
      if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push(null);
      resultado.push(p);
    });
    return resultado;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected irA(pagina: number): void {
    if (pagina === this.pagina()) return;
    this.paginaChange.emit(pagina);
    this.subirAlInicio();
  }

  protected onTamano(evento: Event): void {
    this.tamanoChange.emit(Number((evento.target as HTMLSelectElement).value));
    this.subirAlInicio();
  }

  /**
   * Al cambiar de página se regresa al principio de la lista (la card que la contiene), para no
   * quedarse viendo el final de la página anterior. Se deja margen por el menú superior fijo.
   */
  private subirAlInicio(): void {
    const contenedor = this.host.nativeElement.closest<HTMLElement>('.card') ?? this.host.nativeElement.parentElement;
    if (!contenedor) return;
    const menu = document.querySelector<HTMLElement>('.sticky-top');
    const margen = (menu?.offsetHeight ?? 0) + 16;
    const destino = contenedor.getBoundingClientRect().top + window.scrollY - margen;
    // Solo si el inicio de la lista ya quedó arriba, fuera de la vista (no "brinca" si ya se ve).
    if (destino < window.scrollY) {
      window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' });
    }
  }
}
