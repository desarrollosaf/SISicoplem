import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentosActivos, PublicoService } from '../../../core/services/publico.service';
import { urlArchivo } from '../../../shared/utils/ruta-archivo';

@Component({
  selector: 'app-landing-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-inicio.html',
  styleUrl: './landing-inicio.scss',
})
export class LandingInicio {
  protected readonly documentos = signal<DocumentosActivos | null>(null);

  constructor(publicoService: PublicoService) {
    publicoService.documentos().subscribe({
      next: (docs) => this.documentos.set(docs),
      error: () => this.documentos.set(null),
    });
  }

  url(ruta: string | null | undefined): string | null {
    return urlArchivo(ruta);
  }
}
