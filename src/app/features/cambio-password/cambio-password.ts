import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cambio-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cambio-password.html',
  styleUrl: './cambio-password.scss',
})
export class CambioPassword {
  protected readonly enviando = signal(false);
  protected readonly intentoGuardar = signal(false);

  protected readonly nueva = signal('');
  protected readonly confirmacion = signal('');

  protected readonly invalidNueva = computed(() => this.intentoGuardar() && !this.nueva());
  protected readonly noCoinciden = computed(
    () => this.intentoGuardar() && !!this.nueva() && this.nueva() !== this.confirmacion(),
  );

  constructor(
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  guardar(): void {
    this.intentoGuardar.set(true);

    if (!this.nueva() || this.nueva() !== this.confirmacion()) {
      this.toastService.error(this.nueva() ? 'No coinciden las contraseñas.' : 'Ingresa la contraseña.');
      return;
    }

    this.enviando.set(true);
    this.authService.cambiarPassword(this.nueva(), this.confirmacion()).subscribe({
      next: () => {
        this.enviando.set(false);
        // Igual que antes: tras cambiarla se cierra la sesión para entrar con la nueva.
        this.authService.logout();
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        this.enviando.set(false);
        this.toastService.error('No se pudo cambiar la contraseña.');
      },
    });
  }
}
