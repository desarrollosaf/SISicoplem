import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InactivityService } from '../../core/services/inactivity.service';

interface NavItem {
  label: string;
  route?: string;
  /** Enlace externo (se abre en otra pestaña). */
  href?: string;
}

const NAV: NavItem[] = [
  { label: 'Procedimientos', route: '/registro' },
  { label: 'Registro de documentos', route: '/documentos' },
  { label: 'Manual de usuario', href: 'assets/archivos/manual-sicoplem.pdf' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit, OnDestroy {
  protected readonly user;
  protected readonly nav = NAV;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    protected readonly inactivity: InactivityService,
  ) {
    this.user = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.inactivity.start();
  }

  ngOnDestroy(): void {
    this.inactivity.stop();
  }

  logout(): void {
    this.inactivity.stop();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  cerrarMenuMovil(): void {
    const menu = document.getElementById('mainNav');
    if (!menu || !menu.classList.contains('show')) return;

    const bootstrapGlobal = (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap;
    bootstrapGlobal?.Collapse.getOrCreateInstance(menu).hide();
  }
}

interface BootstrapGlobal {
  Collapse: {
    getOrCreateInstance(element: Element): { hide(): void };
  };
}
