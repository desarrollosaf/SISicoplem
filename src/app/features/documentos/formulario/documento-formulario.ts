import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentosService, TipoDocumento } from '../../../core/services/documentos.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileUpload } from '../../../shared/file-upload/file-upload';

@Component({
  selector: 'app-documento-formulario',
  standalone: true,
  imports: [FormsModule, RouterLink, FileUpload],
  templateUrl: './documento-formulario.html',
  styleUrl: './documento-formulario.scss',
})
export class DocumentoFormulario {
  protected readonly cargandoInicial = signal(true);
  protected readonly enviando = signal(false);
  protected readonly intentoGuardar = signal(false);

  protected readonly tipos = signal<TipoDocumento[]>([]);
  protected readonly tipo = signal<number | null>(null);
  protected readonly archivos = signal<File[]>([]);

  protected readonly invalidTipo = computed(() => this.intentoGuardar() && this.tipo() === null);
  protected readonly invalidArchivo = computed(() => this.intentoGuardar() && this.archivos().length === 0);

  constructor(
    private readonly documentosService: DocumentosService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {
    this.documentosService.tipos().subscribe({
      next: (rows) => {
        this.tipos.set(rows);
        this.cargandoInicial.set(false);
      },
      error: () => {
        this.toastService.error('No se pudieron cargar los tipos de documento.');
        this.cargandoInicial.set(false);
      },
    });
  }

  onTipoChange(valor: string): void {
    this.tipo.set(valor ? Number(valor) : null);
  }

  guardar(): void {
    this.intentoGuardar.set(true);

    if (this.tipo() === null || this.archivos().length === 0) {
      this.toastService.error('Debes llenar todos los campos obligatorios.');
      return;
    }

    this.enviando.set(true);
    this.documentosService.crear(this.tipo()!, this.archivos()[0]).subscribe({
      next: () => {
        this.enviando.set(false);
        this.toastService.success('Se guardó el documento.');
        void this.router.navigateByUrl('/documentos');
      },
      error: () => {
        this.enviando.set(false);
        this.toastService.error('No se pudo guardar el documento.');
      },
    });
  }
}
