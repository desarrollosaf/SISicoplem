import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './landing-layout.html',
  styleUrl: './landing-layout.scss',
})
export class LandingLayout {
  cerrarMenuMovil(): void {
    const menu = document.getElementById('landingNav');
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
