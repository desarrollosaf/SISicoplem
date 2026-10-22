import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RegistrosService, RegistroListado } from '../../../core/services/registros.service';
import { ToastService } from '../../../core/services/toast.service';
import { TarjetaRegistro } from '../../../shared/tarjetas/tarjeta-registro';
import { Paginador } from '../../../shared/tarjetas/paginador';
import { ListaPaginada } from '../../../shared/tarjetas/lista-paginada';

function anioDe(registro: RegistroListado): string {
  return registro.fecha ? registro.fecha.slice(0, 4) : '';
}

@Component({
  selector: 'app-registro-lista',
  standalone: true,
  imports: [RouterLink, FormsModule, TarjetaRegistro, Paginador],
  templateUrl: './registro-lista.html',
  styleUrl: './registro-lista.scss',
})
export class RegistroLista {
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly registros = signal<RegistroListado[]>([]);
  protected readonly anio = signal('');

  protected readonly anios = computed(() =>
    [...new Set(this.registros().map(anioDe).filter(Boolean))].sort((a, b) => b.localeCompare(a)),
  );

  private readonly filtrados = computed(() => {
    const anio = this.anio();
    return anio ? this.registros().filter((r) => anioDe(r) === anio) : this.registros();
  });

  protected readonly lista = new ListaPaginada(
    () => this.filtrados(),
    (r) => [r.nombre, r.tipoNombre, anioDe(r)].filter(Boolean).join(' '),
  );

  constructor(
    private readonly registrosService: RegistrosService,
    private readonly toastService: ToastService,
  ) {
    this.cargar();
  }

  onAnioChange(valor: string): void {
    this.anio.set(valor);
    this.lista.reiniciar();
  }

  anioDe = anioDe;

  eliminar(registro: RegistroListado): void {
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

      this.registrosService.eliminar(registro.id).subscribe({
        next: () => {
          this.toastService.success('Registro eliminado.');
          this.cargar();
        },
        error: () => this.toastService.error('No se pudo eliminar el registro.'),
      });
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.registrosService.listar().subscribe({
      next: (rows) => {
        this.registros.set(rows);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los procedimientos.');
        this.cargando.set(false);
      },
    });
  }
}
