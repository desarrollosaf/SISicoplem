import { Component, computed, input } from '@angular/core';
import { ETIQUETA_TIPO_ARCHIVO, tipoArchivoPorNombre } from '../utils/tipo-archivo';

@Component({
  selector: 'app-archivo-preview',
  standalone: true,
  template: `
    <a class="archivo-preview" [attr.data-tipo]="tipo()" [href]="url()" target="_blank" rel="noopener noreferrer">
      @if (tipo() === 'imagen') {
        <img [src]="url()" [alt]="nombre()" />
      } @else {
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
          <path d="M14 3v5h5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        </svg>
        @if (etiqueta()) {
          <span class="archivo-preview__badge">{{ etiqueta() }}</span>
        }
      }
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .archivo-preview {
        position: relative;
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border: 1.5px solid var(--brand-border);
        border-radius: 10px;
        background: #f4f6f5;
        overflow: hidden;
        transition: border-color 0.15s;

        &:hover {
          border-color: var(--brand-primary);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        svg {
          width: 22px;
          height: 22px;
          color: var(--brand-muted);
        }

        &[data-tipo='pdf'] {
          --tipo-color: var(--brand-danger);
          background: var(--brand-danger-bg);
          color: var(--tipo-color);
        }

        &[data-tipo='excel'] {
          --tipo-color: var(--brand-green);
          background: rgba(121, 176, 55, 0.14);
          color: var(--tipo-color);
        }

        &[data-tipo='word'] {
          --tipo-color: #2f6fb0;
          background: rgba(47, 111, 176, 0.14);
          color: var(--tipo-color);
        }

        &[data-tipo='xml'] {
          --tipo-color: var(--brand-primary);
          background: var(--brand-primary-soft);
          color: var(--tipo-color);
        }
      }

      .archivo-preview__badge {
        position: absolute;
        bottom: 3px;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.05rem 0.3rem;
        border-radius: 4px;
        background: var(--tipo-color, var(--brand-muted));
        font-size: 0.55rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #fff;
      }
    `,
  ],
})
export class ArchivoPreview {
  readonly nombre = input.required<string>();
  readonly url = input.required<string>();

  protected readonly tipo = computed(() => tipoArchivoPorNombre(this.nombre()));
  protected readonly etiqueta = computed(() => ETIQUETA_TIPO_ARCHIVO[this.tipo()]);
}
