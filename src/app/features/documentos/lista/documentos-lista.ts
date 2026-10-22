import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DocumentoListado, DocumentosService } from '../../../core/services/documentos.service';
import { ToastService } from '../../../core/services/toast.service';
import { TarjetaRegistro } from '../../../shared/tarjetas/tarjeta-registro';
import { Paginador } from '../../../shared/tarjetas/paginador';
import { ListaPaginada } from '../../../shared/tarjetas/lista-paginada';
import { urlArchivo } from '../../../shared/utils/ruta-archivo';

type FiltroEstado = '' | 'activo' | 'inactivo';

@Component({
  selector: 'app-documentos-lista',
  standalone: true,
  imports: [RouterLink, FormsModule, TarjetaRegistro, Paginador],
  templateUrl: './documentos-lista.html',
  styleUrl: './documentos-lista.scss',
})
export class DocumentosLista {
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly documentos = signal<DocumentoListado[]>([]);
  protected readonly filtro = signal<FiltroEstado>('');

  private readonly filtrados = computed(() => {
    const filtro = this.filtro();
    if (!filtro) return this.documentos();
    return this.documentos().filter((d) => (filtro === 'activo') === d.activo);
  });

  protected readonly lista = new ListaPaginada(
    () => this.filtrados(),
    (d) => [d.tipoNombre, d.activo ? 'activo' : 'inactivo'].join(' '),
  );

  constructor(
    private readonly documentosService: DocumentosService,
    private readonly toastService: ToastService,
  ) {
    this.cargar();
  }

  onFiltroChange(valor: string): void {
    this.filtro.set(valor as FiltroEstado);
    this.lista.reiniciar();
  }

  url(documento: DocumentoListado): string | null {
    return urlArchivo(documento.path);
  }

  eliminar(documento: DocumentoListado): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Al oprimir el botón de aceptar se eliminará el registro.',
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--brand-danger)',
      cancelButtonColor: 'var(--brand-muted)',
    }).then((resultado) => {
      if (!resultado.isConfirmed) return;

      this.documentosService.eliminar(documento.id).subscribe({
        next: () => {
          this.toastService.success('Registro eliminado.');
          this.cargar();
        },
        error: () => this.toastService.error('No se pudo eliminar el documento.'),
      });
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.documentosService.listar().subscribe({
      next: (rows) => {
        this.documentos.set(rows);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los documentos.');
        this.cargando.set(false);
      },
    });
  }
}
