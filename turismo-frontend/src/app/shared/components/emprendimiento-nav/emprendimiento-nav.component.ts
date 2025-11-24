import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

@Component({
  selector: 'app-emprendimiento-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen relative">
      <!-- Background Pattern Equilibrado -->
      <div class="absolute inset-0 bg-[url('https://consultasenlinea.mincetur.gob.pe/fichaInventario/foto.aspx?cod=471157')] bg-cover bg-center bg-no-repeat">
        <!-- Overlay equilibrado para ambos modos -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-800/85 via-slate-700/80 to-slate-800/85
                    dark:from-slate-950/92 dark:via-slate-900/88 dark:to-slate-950/92"></div>
      </div>

      <!-- Content -->
      <div class="relative min-h-screen">
        <!-- Header equilibrado -->
        <header class="backdrop-blur-md bg-slate-600/20 dark:bg-slate-900/50 border-b border-slate-500/30 dark:border-slate-700/40 sticky top-0 z-50 shadow-xl">
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <!-- Información del Emprendimiento -->
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div class="flex items-center gap-3">
                <!-- Imagen del emprendimiento -->
                <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-600/25 dark:bg-slate-800/60 flex-shrink-0 ring-1 ring-slate-500/30 dark:ring-slate-700/50 shadow-lg">
                  <ng-container *ngIf="getMainImage(emprendimiento) as mainImage; else noImageTemplate">
                    <img [src]="mainImage"
                         [alt]="emprendimiento?.nombre"
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </ng-container>
                  <ng-template #noImageTemplate>
                    <div class="w-full h-full bg-slate-700/80 dark:bg-slate-900/90 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </ng-template>
                </div>

                <div class="space-y-1">
                  <h1 class="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-300 bg-clip-text text-transparent drop-shadow-sm">
                    {{ emprendimiento?.nombre || 'Cargando...' }}
                  </h1>
                  <p class="text-sm text-slate-100 dark:text-slate-400 font-medium">
                    {{ emprendimiento?.tipo_servicio }} • {{ emprendimiento?.categoria }}
                  </p>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full shadow-sm"
                            [ngClass]="emprendimiento?.estado ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-400 shadow-red-400/50'"></span>
                      <span class="text-xs text-slate-100 dark:text-slate-400 font-medium">
                        {{ emprendimiento?.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de acción optimizados -->
              <div class="flex items-center space-x-3">
                <a routerLink="/mis-emprendimientos"
                   class="group flex items-center px-5 py-2.5 rounded-xl bg-slate-600/25 dark:bg-slate-800/70 text-white hover:bg-slate-600/35 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-500/30 dark:border-slate-700/50 hover:border-slate-500/40 dark:hover:border-slate-600/60">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span class="font-medium">Volver</span>
                </a>

                <button (click)="toggleDarkMode()"
                        class="group p-3 rounded-xl bg-slate-600/25 dark:bg-slate-800/70 text-slate-100 dark:text-slate-300 shadow-lg hover:bg-slate-600/35 dark:hover:bg-slate-700/80 transition-all duration-300 border border-slate-500/30 dark:border-slate-700/50 hover:border-slate-500/40 dark:hover:border-slate-600/60 hover:shadow-xl"
                        [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">
                  <ng-container *ngIf="isDarkMode; else sunIcon">
                    <svg class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                    </svg>
                  </ng-container>
                  <ng-template #sunIcon>
                    <svg class="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5" stroke-width="2" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
                    </svg>
                  </ng-template>
                </button>

                <button (click)="logout()"
                        class="group flex items-center px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl border border-red-500 hover:border-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span class="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>

            <!-- Navegación mejorada -->
            <nav class="flex flex-wrap gap-2">
              <a *ngFor="let item of navigationItems"
                 [routerLink]="item.route"
                 routerLinkActive="bg-gradient-to-r from-orange-500 to-orange-400 dark:from-orange-600 dark:to-orange-500 text-white shadow-lg ring-2 ring-orange-400/50 dark:ring-orange-500/50"
                 [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                 class="group flex items-center px-4 py-3 rounded-xl bg-slate-600/20 dark:bg-slate-800/60 text-slate-50 dark:text-slate-300 font-medium hover:bg-slate-600/30 dark:hover:bg-slate-700/70 transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg border border-slate-500/30 dark:border-slate-700/40 hover:border-slate-500/40 dark:hover:border-slate-600/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
                </svg>
                <span class="text-sm">{{ item.label }}</span>
                <span *ngIf="item.badge"
                      class="ml-3 px-2.5 py-1 text-xs bg-red-500 dark:bg-red-600 text-white rounded-full shadow-md animate-pulse">
                  {{ item.badge }}
                </span>
              </a>
            </nav>
          </div>
        </header>

        <!-- Contenido principal con mejor balance -->
        <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div class="backdrop-blur-sm bg-slate-700/15 dark:bg-slate-900/35 rounded-2xl border border-slate-500/25 dark:border-slate-700/35 shadow-2xl min-h-[calc(100vh-12rem)]">
            <div class="p-6 sm:p-8">
              <ng-content></ng-content>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Estilos para los enlaces de navegación */
    .nav-link {
      @apply bg-orange-50/15 text-black hover:bg-orange-50/25
             border border-orange-200/20 hover:border-orange-200/40
             shadow-orange-900/20;
    }

    /* Modo oscuro para enlaces normales */
    :host-context(.dark) .nav-link {
      @apply bg-blue-800/50 text-blue-200 hover:bg-blue-700/70
             border-blue-700/40 hover:border-blue-600/50
             shadow-blue-900/30;
    }

    /* Estado activo para modo claro */
    .nav-link-active {
      @apply bg-gradient-to-r from-orange-500 to-orange-400
             text-white shadow-lg ring-2 ring-orange-400/50
             border-orange-400 hover:border-orange-300;
    }

    /* Estado activo para modo oscuro */
    :host-context(.dark) .nav-link-active {
      @apply bg-gradient-to-r from-blue-600 to-blue-500
             text-white shadow-lg ring-2 ring-blue-500/50
             border-blue-500 hover:border-blue-400;
    }

    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }

    /* Mejora para el scroll suave */
    html {
      scroll-behavior: smooth;
    }

    /* Animación personalizada para badges */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    /* Mejoras adicionales para el tema */
    .dark {
      color-scheme: dark;
    }

    /* Transiciones suaves entre modos */
    .transition-theme {
      transition: background-color 0.5s ease-in-out,
                  border-color 0.5s ease-in-out,
                  color 0.5s ease-in-out;
    }
  `]
})
export class EmprendimientoNavComponent implements OnInit {
  @Input() emprendimiento?: Emprendimiento;

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private emprendimientoService = inject(EmprendimientoAdminService);

  isDarkMode = false;
  navigationItems: Array<{
    label: string;
    route: string;
    icon: string;
    exact?: boolean;
    badge?: number;
  }> = [];

  ngOnInit(): void {
    this.initDarkMode();
    this.setupNavigation();
    this.loadEmprendimientoIfNeeded();
  }

  private initDarkMode(): void {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      this.isDarkMode = savedMode === 'true';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private setupNavigation(): void {
    const emprendimientoId = this.route.snapshot.paramMap.get('id');
    if (!emprendimientoId) return;

    this.navigationItems = [
      {
        label: 'Información',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}`,
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        exact: true
      },
      {
        label: 'Dashboard',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/dashboard`,
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      },
      {
        label: 'Servicios',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/servicios`,
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      },
      {
        label: 'Reservas',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/reservas`,
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        label: 'Planes',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/planes`,
        icon: 'M19 11H5m14-4H5m14 8H5m14-4h.01'
      },
      {
        label: 'Calendario',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/calendario`,
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        label: 'Administradores',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/administradores`,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      {
        label: 'Estadísticas',
        route: `/admin-emprendedores/emprendimiento/${emprendimientoId}/estadisticas`,
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      }
    ];
  }

  private loadEmprendimientoIfNeeded(): void {
    if (!this.emprendimiento) {
      const emprendimientoId = this.route.snapshot.paramMap.get('id');
      if (emprendimientoId) {
        this.emprendimientoService.getEmprendimiento(+emprendimientoId).subscribe({
          next: (data) => {
            this.emprendimiento = data;
          },
          error: (error) => {
            console.error('Error loading emprendimiento:', error);
          }
        });
      }
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // La redirección la maneja el servicio de auth
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }

  getMainImage(emprendimiento?: Emprendimiento): string | null {
    if (emprendimiento?.sliders_principales?.length) {
      return emprendimiento.sliders_principales[0].url_completa || null;
    }
    return null;
  }
}
