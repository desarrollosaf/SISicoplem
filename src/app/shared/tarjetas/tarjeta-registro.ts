import { Component, computed, input } from '@angular/core';
/** Color de la marca lateral de la card. */
export type TonoTarjeta = 'info' | 'ok' | 'error' | 'warn' | 'pago' | 'pagado' | 'ejercido' | 'firmar' | 'neutral';

/**
 * Card genérica (mismo estilo que la de solicitudes) para catálogos: roles, contratos,
 * proveedores. Cada pantalla proyecta sus partes en elementos con atributo:
 * - `chips`: etiquetas junto al título (rol, vigencia…).
 * - `datos`: los campos del registro; usar `<div class="tarjeta-dato"><span>Etiqueta</span><strong>Valor</strong></div>`.
 * - `lado`: dato destacado a la derecha (p. ej. monto).
 * - `acciones`: botones (editar, eliminar…).
 */
@Component({
  selector: 'app-tarjeta-registro',
  standalone: true,
  template: `
    <article class="tarjeta tarjeta--{{ tono() }}" [class.tarjeta--atenuada]="atenuada()">
      <span class="tarjeta__marca" aria-hidden="true">
        @if (iniciales()) {
          <span class="tarjeta__iniciales">{{ iniciales() }}</span>
        } @else {
          <span class="tarjeta__punto"></span>
        }
      </span>

      <div class="tarjeta__cuerpo">
        <div class="tarjeta__encabezado">
          <h3 class="tarjeta__titulo">{{ titulo() }}</h3>
          @if (subtitulo()) {
            <span class="tarjeta__subtitulo">{{ subtitulo() }}</span>
          }
          <ng-content select="[chips]" />
        </div>
        <div class="tarjeta__datos">
          <ng-content select="[datos]" />
        </div>
      </div>

      <div class="tarjeta__lado">
        <ng-content select="[lado]" />
        <div class="tarjeta__acciones">
          <ng-content select="[acciones]" />
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host ::ng-deep [chips],
      :host ::ng-deep [acciones],
      :host ::ng-deep [datos] {
        display: contents;
      }

      .tarjeta {
        --tono: #9aa0a3;
        --tono-suave: #f1f0f1;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.15rem 1rem 1rem;
        border: 1px solid var(--brand-border);
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        transition:
          box-shadow 0.18s ease,
          transform 0.18s ease,
          border-color 0.18s ease;
      }

      .tarjeta:hover {
        border-color: color-mix(in srgb, var(--tono) 35%, var(--brand-border));
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.07);
        transform: translateY(-1px);
      }

      .tarjeta--atenuada {
        opacity: 0.7;
      }

      .tarjeta--info { --tono: #2f6fb0; --tono-suave: #e8f1fa; }
      .tarjeta--ok { --tono: #4c8a1f; --tono-suave: #eaf6df; }
      .tarjeta--error { --tono: #c0392b; --tono-suave: #fbeceb; }
      .tarjeta--warn { --tono: #d4890f; --tono-suave: #fdf3e2; }
      .tarjeta--pago { --tono: #b8860b; --tono-suave: #fdf3d9; }
      .tarjeta--pagado { --tono: #1a8a4a; --tono-suave: #e4f6ea; }
      .tarjeta--ejercido,
      .tarjeta--firmar { --tono: #5b4fd6; --tono-suave: #ebe8fd; }
      .tarjeta--primario { --tono: var(--brand-primary); --tono-suave: var(--brand-primary-soft); }

      .tarjeta__marca {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: var(--tono-suave);
      }

      .tarjeta__punto {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--tono);
      }

      .tarjeta__iniciales {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--tono);
        letter-spacing: 0.02em;
      }

      .tarjeta__cuerpo {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tarjeta__encabezado {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.35rem 0.6rem;
      }

      .tarjeta__titulo {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--brand-ink);
      }

      .tarjeta__subtitulo {
        font-size: 0.78rem;
        color: var(--brand-muted);
      }

      .tarjeta__datos {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 1.4rem;
      }

      .tarjeta__lado {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.55rem;
        flex-shrink: 0;
      }

      .tarjeta__acciones {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      @media (max-width: 720px) {
        .tarjeta {
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .tarjeta__cuerpo {
          flex-basis: calc(100% - 60px);
        }

        .tarjeta__lado {
          width: 100%;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.6rem;
          border-top: 1px dashed var(--brand-border);
        }
      }
    `,
  ],
})
export class TarjetaRegistro {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly tono = input<TonoTarjeta | 'primario'>('neutral');
  /** Si se da un nombre, la marca muestra sus iniciales en vez del punto de color. */
  readonly nombreParaIniciales = input<string | null>(null);
  readonly atenuada = input(false);

  protected readonly iniciales = computed(() => {
    const nombre = this.nombreParaIniciales()?.trim();
    if (!nombre) return '';
    const palabras = nombre.split(/\s+/).filter((p) => /^[\p{L}]/u.test(p));
    return palabras
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  });
}
