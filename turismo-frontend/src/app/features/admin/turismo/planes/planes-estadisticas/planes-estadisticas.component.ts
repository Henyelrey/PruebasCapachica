// src/app/features/admin/turismo/planes/planes-estadisticas/planes-estadisticas.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlanesService } from '../../../../../core/services/planes.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { EstadisticasGenerales } from '../../../../../core/models/plan.model';

@Component({
  selector: 'app-planes-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Estadísticas de Planes" 
      subtitle="Análisis general del sistema de planes turísticos"
    >
    </app-admin-header>

    <div class="container mx-auto px-2 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex items-center space-x-2 pb-5">
        <a
          routerLink="/admin/planes"
          class="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver a Planes
        </a>
        <a
          routerLink="/admin/planes/inscripciones"
          class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Ver Inscripciones
        </a>
      </div>
      @if (loading) {
        <div class="flex justify-center items-center p-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
          <span class="ml-4 text-gray-600 dark:text-gray-300">Cargando estadísticas...</span>
        </div>
      } @else if (estadisticas) {
        
        <!-- Métricas principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de Planes</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.total_planes | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Planes Activos</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.planes_activos | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Inscripciones</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.total_inscripciones | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ingresos Totales</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">S/ {{ estadisticas.ingresos_totales | number:'1.2-2' }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas secundarias -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Planes Públicos</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.planes_publicos | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Emprendedores con Planes</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.emprendedores_con_planes | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-pink-100 dark:bg-pink-900/40 rounded-md flex items-center justify-center">
                    <svg class="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Inscripciones Confirmadas</dt>
                    <dd class="text-lg font-medium text-gray-900 dark:text-white">{{ estadisticas.inscripciones_confirmadas | number }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos y distribuciones -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <!-- Distribución por estado -->
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribución por Estado</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Activos</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_estado.activos }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_estado.activos, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Inactivos</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_estado.inactivos }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_estado.inactivos, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Borradores</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_estado.borradores }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-yellow-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_estado.borradores, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Distribución por dificultad -->
          <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribución por Dificultad</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Fácil</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_dificultad.facil }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_dificultad.facil, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Moderado</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_dificultad.moderado }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-orange-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_dificultad.moderado, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Difícil</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white mr-2">{{ estadisticas.planes_por_dificultad.dificil }}</span>
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getPercentage(estadisticas.planes_por_dificultad.dificil, estadisticas.total_planes)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Métricas de inscripciones -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg transition-colors duration-300">
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Estado de Inscripciones</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ estadisticas.inscripciones_confirmadas | number }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Confirmadas</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ estadisticas.inscripciones_pendientes | number }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Pendientes</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ estadisticas.total_inscripciones | number }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>

      } @else {
        <div class="text-center p-8">
          <div class="text-gray-500 dark:text-gray-400">No se pudieron cargar las estadísticas</div>
          <button 
            (click)="loadEstadisticas()"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Reintentar
          </button>
        </div>
      }
    </div>
  `,
})
export class PlanesEstadisticasComponent implements OnInit {
  private planesService = inject(PlanesService);
  private themeService = inject(ThemeService);

  estadisticas: EstadisticasGenerales | null = null;
  loading = true;

  ngOnInit() {
    this.loadEstadisticas();
  }

  loadEstadisticas() {
    this.loading = true;
    this.planesService.getEstadisticasGenerales().subscribe({
      next: (response) => {
        this.estadisticas = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
        alert('Error al cargar las estadísticas. Por favor, intente nuevamente.');
      }
    });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}