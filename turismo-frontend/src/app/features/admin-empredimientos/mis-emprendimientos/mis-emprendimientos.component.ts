import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

@Component({
  selector: 'app-mis-emprendimientos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen relative">
      <!-- Background Pattern -->
            <div class="absolute inset-0 bg-[url('https://consultasenlinea.mincetur.gob.pe/fichaInventario/foto.aspx?cod=471157')] bg-cover bg-center bg-no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-900/60 dark:from-blue-900/50 dark:via-blue-900/40 dark:to-blue-900/50"></div>
      </div>

      <!-- Content -->
      <div class="relative min-h-screen">
        <!-- Barra Superior con Glassmorphism -->
        <header class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 border-b border-white/10 dark:border-blue-700/30 sticky top-0 z-50 w-full">
          <div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <div class="text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                Mis Emprendimientos
              </h1>
              <p class="text-xs sm:text-sm text-gray-300 dark:text-blue-300 mt-1">
                Gestiona y administra tus negocios
              </p>
            </div>
            <div class="flex flex-wrap items-center space-x-0 sm:space-x-4 gap-2 sm:gap-0 w-full sm:w-auto justify-center sm:justify-end">
              <!-- Botón Selección Panel -->
              <a routerLink="/seleccion-panel"
                 class="group flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/10 dark:bg-blue-800/30 text-white hover:bg-white/20 dark:hover:bg-blue-800/50 transition-all duration-300 text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Selección Panel
              </a>
              <a routerLink="/dashboard" 
                 class="group flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/10 dark:bg-blue-800/30 text-white hover:bg-white/20 dark:hover:bg-blue-800/50 transition-all duration-300 text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard Principal
              </a>
              <button (click)="logout()" 
                      class="group flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/10 dark:bg-blue-800/30 text-white hover:bg-white/20 dark:hover:bg-blue-800/50 transition-all duration-300 text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
              <button (click)="toggleDarkMode()"
                      class="p-2 rounded-full bg-white/20 dark:bg-blue-800/40 text-gray-800 dark:text-blue-200 shadow hover:bg-white/40 dark:hover:bg-blue-700/60 transition-colors text-sm sm:text-base"
                      [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">
                <ng-container *ngIf="isDarkMode; else sunIcon">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                  </svg>
                </ng-container>
                <ng-template #sunIcon>
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" stroke-width="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
                  </svg>
                </ng-template>
              </button>
            </div>
          </div>
        </header>

        <!-- Contenido Principal -->
        <main class="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-8 py-8 overflow-x-auto">
          <!-- Estado de Carga -->
          <div *ngIf="loading" class="flex justify-center py-12">
            <div class="relative">
              <div class="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-200/30 dark:border-blue-800/30 rounded-full"></div>
              <div class="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-400 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="backdrop-blur-lg bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/30 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl">
            <div class="flex flex-col sm:flex-row">
              <div class="flex-shrink-0 flex justify-center sm:justify-start">
                <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-0 sm:ml-4 mt-2 sm:mt-0">
                <h3 class="text-base sm:text-lg font-medium text-red-200">Error al cargar tus emprendimientos</h3>
                <div class="mt-2 text-xs sm:text-sm text-red-300">
                  <p>{{ error }}</p>
                </div>
                <div class="mt-4">
                  <button (click)="loadEmprendimientos()" 
                          class="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin Emprendimientos -->
          <div *ngIf="!loading && !error && emprendimientos.length === 0" 
               class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-8 sm:p-12 text-center shadow-2xl border border-white/10 dark:border-blue-700/30">
            <div class="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-400/20 dark:from-blue-500/20 dark:to-blue-400/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-12 sm:w-12 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">No tienes emprendimientos</h3>
            <p class="text-gray-300 dark:text-blue-300 text-sm sm:text-base">No hay emprendimientos asociados a tu cuenta.</p>
          </div>

          <!-- Lista de Emprendimientos -->
          <div *ngIf="!loading && !error && emprendimientos.length > 0"
               [ngClass]="getGridClasses()">
            <ng-container *ngFor="let emprendimiento of emprendimientos; let i = index">
              <div class="group relative rounded-3xl shadow-2xl overflow-hidden bg-transparent animate-fade-in min-h-[400px] flex flex-col"
                   style="animation-delay: {{i * 150}}ms">
                <!-- Imagen de fondo del emprendimiento -->
                <div class="relative h-56 sm:h-96 md:h-[500px]">
                  <ng-container *ngIf="getMainImage(emprendimiento) as mainImage; else noImageTemplate">
                    <img [src]="mainImage"
                         [alt]="emprendimiento.nombre"
                         class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </ng-container>
                  <ng-template #noImageTemplate>
                    <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800/80 to-gray-900/90 dark:from-blue-800/80 dark:to-blue-900/90 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </ng-template>
                  <!-- Overlay degradado -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20"></div>
                  <!-- Contenido superpuesto -->
                  <div class="absolute inset-0 flex flex-col justify-between p-4 sm:p-8">
                    <!-- Header con estado -->
                    <div class="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div class="flex flex-wrap gap-2">
                        <span class="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/80 to-blue-400/80 text-white shadow-md backdrop-blur-sm">
                          {{ emprendimiento.categoria }}
                        </span>
                        <span class="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold" 
                              [ngClass]="emprendimiento.estado ? 'bg-gradient-to-r from-green-500/80 to-green-400/80 text-white shadow-md backdrop-blur-sm' : 'bg-gradient-to-r from-red-500/80 to-red-400/80 text-white shadow-md backdrop-blur-sm'">
                          {{ emprendimiento.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </div>
                      <!-- Estadísticas rápidas -->
                      <div class="text-right">
                        <div class="flex flex-col gap-1">
                          <div class="flex items-center justify-end gap-2 text-white/80">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span class="text-xs sm:text-sm font-medium">{{ getServiciosCount(emprendimiento) }} servicios</span>
                          </div>
                          <div class="flex items-center justify-end gap-2 text-white/80">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span class="text-xs sm:text-sm font-medium">{{ getAdministradoresCount(emprendimiento) }} admins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Información principal -->
                    <div class="text-center">
                      <h2 class="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 sm:mb-3">
                        {{ emprendimiento.nombre }}
                      </h2>
                      <p class="text-lg sm:text-xl md:text-2xl font-semibold text-orange-300 dark:text-blue-300 drop-shadow mb-2 sm:mb-4">
                        {{ emprendimiento.tipo_servicio }}
                      </p>
                      <p class="text-gray-200 text-base sm:text-lg mb-4 sm:mb-6 line-clamp-2 max-w-full sm:max-w-2xl mx-auto">
                        {{ emprendimiento.descripcion }}
                      </p>
                    </div>
                    <!-- Información de contacto y ubicación -->
                    <div class="space-y-2 sm:space-y-3">
                      <div class="flex flex-wrap gap-2 sm:gap-4 justify-center text-white/90">
                        <div class="flex items-center gap-1 sm:gap-2 bg-white/10 dark:bg-blue-800/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-300 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span class="text-xs sm:text-sm font-medium">{{ emprendimiento.ubicacion }}</span>
                        </div>
                        <div class="flex items-center gap-1 sm:gap-2 bg-white/10 dark:bg-blue-800/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-300 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span class="text-xs sm:text-sm font-medium">{{ emprendimiento.telefono }}</span>
                        </div>
                        <div class="flex items-center gap-1 sm:gap-2 bg-white/10 dark:bg-blue-800/20 backdrop-blur-sm rounded-full px-2 sm:px-4 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-300 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span class="text-xs sm:text-sm font-medium">{{ emprendimiento.email }}</span>
                        </div>
                      </div>
                      <!-- Botón de gestión principal -->
                      <div class="flex justify-center pt-2 sm:pt-4">
                        <a [routerLink]="['/admin-emprendedores/emprendimiento', emprendimiento.id]" 
                           class="group flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 dark:from-blue-500 dark:to-blue-400 text-white font-bold text-base sm:text-lg shadow-2xl hover:from-orange-600 hover:to-orange-500 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 active:scale-95 transform hover:scale-105">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Gestionar Emprendimiento
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.6s ease-out forwards;
      opacity: 0;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MisEmprendimientosComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private authService = inject(AuthService);

  emprendimientos: Emprendimiento[] = [];
  loading = true;
  error = '';
  isDarkMode = false;

  ngOnInit(): void {
    this.loadEmprendimientos();
    this.initDarkMode();
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

  loadEmprendimientos(): void {
    this.loading = true;
    this.error = '';

    this.emprendimientoAdminService.getMisEmprendimientos().subscribe({
      next: (data) => {
        this.emprendimientos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos:', err);
        this.error = err.error?.message || 'Error al cargar los emprendimientos. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
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

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  // Método para determinar las clases del grid según la cantidad de emprendimientos
  // Método mejorado para determinar las clases del grid según la cantidad de emprendimientos
// Método mejorado para determinar las clases del grid según la cantidad de emprendimientos
getGridClasses(): string {
  const count = this.emprendimientos.length;
  if (count === 1) {
    return 'grid grid-cols-1 max-w-4xl mx-auto';
  } else {
    // Para 2 o más elementos: siempre 2 columnas máximo con filas automáticas
    return 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto';
  }
}

  // Métodos helper para el template
  getMainImage(emprendimiento: Emprendimiento): string | null {
    if (emprendimiento.sliders_principales?.length) {
      return emprendimiento.sliders_principales[0].url_completa || null;
    }
    return null;
  }

  getServiciosCount(emprendimiento: Emprendimiento): number {
    return emprendimiento.servicios?.length || 0;
  }

  getAdministradoresCount(emprendimiento: Emprendimiento): number {
    return emprendimiento.administradores?.length || 0;
  }
}
