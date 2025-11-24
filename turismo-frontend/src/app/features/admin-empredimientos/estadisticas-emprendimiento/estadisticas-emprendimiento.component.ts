import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { 
  Emprendimiento,
  ServicioPopular
} from '../../../core/models/emprendimiento-admin.model';
import { EmprendimientoNavComponent } from '../../../shared/components/emprendimiento-nav/emprendimiento-nav.component';

interface EstadisticasConsolidadas {
  reservas: {
    total: number;
    confirmadas: number;
    pendientes: number;
    canceladas: number;
    ingresos_totales: number;
  };
  planes: {
    total_activos: number;
    inscripciones_totales: number;
    ingresos_estimados: number;
  };
  servicios: {
    mas_solicitados: ServicioPopular[];
    ocupacion_promedio: number;
  };
}

interface PeriodoAnalisis {
  fecha_inicio: string;
  fecha_fin: string;
  nombre: string;
}

@Component({
  selector: 'app-estadisticas-emprendimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <nav class="flex mb-3" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                  <li class="inline-flex items-center">
                    <a routerLink="/admin-emprendedores/mis-emprendimientos" 
                       class="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
                      Mis Emprendimientos
                    </a>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <a [routerLink]="['/admin-emprendedores/emprendimiento', emprendimientoId, 'dashboard']" 
                         class="ml-1 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400">
                        {{ emprendimiento?.nombre || 'Emprendimiento' }}
                      </a>
                    </div>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="ml-1 text-gray-500 dark:text-gray-400">Estadísticas</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Estadísticas - {{ emprendimiento?.nombre || 'Cargando...' }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1">
                Análisis detallado del rendimiento de tu emprendimiento
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <button (click)="exportReport()" 
                      [disabled]="loading || !estadisticas"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Exportar Reporte
              </button>
              <button (click)="refreshData()" 
                      [disabled]="loading"
                      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                <svg *ngIf="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <div *ngIf="loading" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Period Selector -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Período de Análisis</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Actualmente analizando: {{ periodoActual.nombre }}
              </p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <!-- Quick Period Buttons -->
              <button *ngFor="let periodo of periodosRapidos" 
                      (click)="setPeriodoRapido(periodo)"
                      [class]="'px-3 py-2 text-sm font-medium rounded-md transition-colors ' + 
                               (periodoActual.nombre === periodo.nombre ? 
                                'bg-orange-600 text-white' : 
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600')">
                {{ periodo.nombre }}
              </button>
              
              <!-- Custom Period -->
              <div class="flex items-center space-x-2">
                <input
                  type="date"
                  [(ngModel)]="periodoCustom.fecha_inicio"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white">
                <span class="text-gray-500 dark:text-gray-400 text-sm">a</span>
                <input
                  type="date"
                  [(ngModel)]="periodoCustom.fecha_fin"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white">
                <button (click)="aplicarPeriodoCustom()"
                        [disabled]="!periodoCustom.fecha_inicio || !periodoCustom.fecha_fin"
                        class="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading && !estadisticas" class="flex justify-center items-center py-20">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error al cargar las estadísticas</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">{{ error }}</div>
              <div class="mt-4">
                <button (click)="loadEstadisticas()" 
                        class="bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Dashboard -->
      <main *ngIf="estadisticas && !error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Reservas -->
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium opacity-90">Total Reservas</h3>
                <p class="text-3xl font-bold">{{ estadisticas.reservas.total }}</p>
                <div class="flex items-center mt-2 text-sm opacity-80">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  {{ getReservasTrend() }}% vs período anterior
                </div>
              </div>
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Ingresos Totales -->
          <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium opacity-90">Ingresos Totales</h3>
                <p class="text-3xl font-bold">S/. {{ estadisticas.reservas.ingresos_totales | number:'1.2-2' }}</p>
                <div class="flex items-center mt-2 text-sm opacity-80">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  {{ getIngresosTrend() }}% vs período anterior
                </div>
              </div>
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Tasa de Conversión -->
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium opacity-90">Tasa de Conversión</h3>
                <p class="text-3xl font-bold">{{ getTasaConversion() }}%</p>
                <div class="text-sm opacity-80 mt-2">
                  {{ estadisticas.reservas.confirmadas }}/{{ estadisticas.reservas.total }} confirmadas
                </div>
              </div>
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Ocupación Promedio -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium opacity-90">Ocupación Promedio</h3>
                <p class="text-3xl font-bold">{{ estadisticas.servicios.ocupacion_promedio | number:'1.1-1' }}%</p>
                <div class="text-sm opacity-80 mt-2">
                  Basado en capacidad de servicios
                </div>
              </div>
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Reservas Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Reservas por Estado -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Reservas por Estado</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <!-- Confirmadas -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span class="text-gray-700 dark:text-gray-300">Confirmadas</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ estadisticas.reservas.confirmadas }}</span>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ getPercentage(estadisticas.reservas.confirmadas, estadisticas.reservas.total) }}%
                    </div>
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="getPercentage(estadisticas.reservas.confirmadas, estadisticas.reservas.total)"></div>
                </div>

                <!-- Pendientes -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span class="text-gray-700 dark:text-gray-300">Pendientes</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ estadisticas.reservas.pendientes }}</span>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ getPercentage(estadisticas.reservas.pendientes, estadisticas.reservas.total) }}%
                    </div>
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="getPercentage(estadisticas.reservas.pendientes, estadisticas.reservas.total)"></div>
                </div>

                <!-- Canceladas -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span class="text-gray-700 dark:text-gray-300">Canceladas</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ estadisticas.reservas.canceladas }}</span>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ getPercentage(estadisticas.reservas.canceladas, estadisticas.reservas.total) }}%
                    </div>
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-red-500 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="getPercentage(estadisticas.reservas.canceladas, estadisticas.reservas.total)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Planes Overview -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Resumen de Planes</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ estadisticas.planes.total_activos }}</div>
                  <div class="text-sm text-blue-800 dark:text-blue-300">Planes Activos</div>
                </div>
                <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ estadisticas.planes.inscripciones_totales }}</div>
                  <div class="text-sm text-green-800 dark:text-green-300">Inscripciones</div>
                </div>
              </div>
              <div class="mt-4 text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  S/. {{ estadisticas.planes.ingresos_estimados | number:'1.2-2' }}
                </div>
                <div class="text-sm text-purple-800 dark:text-purple-300">Ingresos Estimados de Planes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Servicios Más Populares -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Servicios Más Populares</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Ranking basado en cantidad de reservas</p>
          </div>
          <div class="p-6">
            <div *ngIf="estadisticas.servicios.mas_solicitados.length === 0" class="text-center py-8">
              <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay datos de servicios</h3>
              <p class="mt-2 text-gray-500 dark:text-gray-400">
                No se encontraron reservas para este período.
              </p>
            </div>

            <div *ngIf="estadisticas.servicios.mas_solicitados.length > 0" class="space-y-4">
              <div *ngFor="let servicio of estadisticas.servicios.mas_solicitados; let i = index; trackBy: trackByServicio" 
                   class="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                
                <!-- Ranking Badge -->
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                     [ngClass]="{
                       'bg-yellow-500 text-white': i === 0,
                       'bg-gray-400 text-white': i === 1,
                       'bg-orange-600 text-white': i === 2,
                       'bg-blue-500 text-white': i > 2
                     }">
                  {{ i + 1 }}
                </div>

                <!-- Service Info -->
                <div class="flex-1 ml-4">
                  <h4 class="text-lg font-medium text-gray-900 dark:text-white">{{ servicio.nombre }}</h4>
                  <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>{{ servicio.total_reservas }} reservas</span>
                    <span>•</span>
                    <span>S/. {{ servicio.ingresos_totales | number:'1.2-2' }} en ingresos</span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="flex-shrink-0 w-24">
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                         [style.width.%]="getServicioPopularityPercentage(servicio, estadisticas.servicios.mas_solicitados)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Insights y Recomendaciones -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Insights y Recomendaciones</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Análisis automático basado en tus datos</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Performance Insights -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900 dark:text-white flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Análisis de Rendimiento
                </h4>
                
                <div class="space-y-3">
                  <div *ngFor="let insight of getPerformanceInsights()" 
                       class="flex items-start p-3 rounded-lg"
                       [ngClass]="{
                         'bg-green-50 dark:bg-green-900/20': insight.type === 'success',
                         'bg-yellow-50 dark:bg-yellow-900/20': insight.type === 'warning',
                         'bg-blue-50 dark:bg-blue-900/20': insight.type === 'info'
                       }">
                    <div class="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3"
                         [ngClass]="{
                           'bg-green-500': insight.type === 'success',
                           'bg-yellow-500': insight.type === 'warning',
                           'bg-blue-500': insight.type === 'info'
                         }"></div>
                    <p class="text-sm"
                       [ngClass]="{
                         'text-green-800 dark:text-green-300': insight.type === 'success',
                         'text-yellow-800 dark:text-yellow-300': insight.type === 'warning',
                         'text-blue-800 dark:text-blue-300': insight.type === 'info'
                       }">
                      {{ insight.message }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Recommendations -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900 dark:text-white flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  Recomendaciones
                </h4>
                
                <div class="space-y-3">
                  <div *ngFor="let recommendation of getRecommendations()" 
                       class="flex items-start p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div class="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p class="text-sm text-orange-800 dark:text-orange-300 font-medium">{{ recommendation.title }}</p>
                      <p class="text-sm text-orange-700 dark:text-orange-400 mt-1">{{ recommendation.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparative Analysis -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Análisis Comparativo</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Comparación con período anterior</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Reservas Comparison -->
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center justify-center mb-2">
                  <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Reservas</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ estadisticas.reservas.total }}</div>
                <div class="flex items-center justify-center text-sm"
                     [ngClass]="{
                       'text-green-600 dark:text-green-400': getReservasTrend() > 0,
                       'text-red-600 dark:text-red-400': getReservasTrend() < 0,
                       'text-gray-600 dark:text-gray-400': getReservasTrend() === 0
                     }">
                  <svg *ngIf="getReservasTrend() > 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <svg *ngIf="getReservasTrend() < 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                  {{ Math.abs(getReservasTrend()) }}% vs anterior
                </div>
              </div>

              <!-- Ingresos Comparison -->
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center justify-center mb-2">
                  <svg class="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Ingresos</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  S/. {{ estadisticas.reservas.ingresos_totales | number:'1.0-0' }}
                </div>
                <div class="flex items-center justify-center text-sm"
                     [ngClass]="{
                       'text-green-600 dark:text-green-400': getIngresosTrend() > 0,
                       'text-red-600 dark:text-red-400': getIngresosTrend() < 0,
                       'text-gray-600 dark:text-gray-400': getIngresosTrend() === 0
                     }">
                  <svg *ngIf="getIngresosTrend() > 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <svg *ngIf="getIngresosTrend() < 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                  {{ Math.abs(getIngresosTrend()) }}% vs anterior
                </div>
              </div>

              <!-- Conversion Rate Comparison -->
              <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center justify-center mb-2">
                  <svg class="w-6 h-6 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="font-medium text-gray-900 dark:text-white">Conversión</span>
                </div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ getTasaConversion() }}%</div>
                <div class="flex items-center justify-center text-sm"
                     [ngClass]="{
                       'text-green-600 dark:text-green-400': getConversionTrend() > 0,
                       'text-red-600 dark:text-red-400': getConversionTrend() < 0,
                       'text-gray-600 dark:text-gray-400': getConversionTrend() === 0
                     }">
                  <svg *ngIf="getConversionTrend() > 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <svg *ngIf="getConversionTrend() < 0" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                  {{ Math.abs(getConversionTrend()) }}pp vs anterior
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EstadisticasEmprendimientoComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  estadisticas?: EstadisticasConsolidadas;
  loading = true;
  error = '';

  // Period management
  periodoActual: PeriodoAnalisis = {
    fecha_inicio: '',
    fecha_fin: '',
    nombre: 'Último mes'
  };

  periodoCustom = {
    fecha_inicio: '',
    fecha_fin: ''
  };

  periodosRapidos: PeriodoAnalisis[] = [];

  // Expose Math to template
  Math = Math;

  ngOnInit(): void {
  // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Estadisticas - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.initPeriodos();
        this.loadData();
      } else {
        console.error('Estadisticas - ID inválido:', id);
      }
    });
  }

  private initPeriodos(): void {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.periodosRapidos = [
      {
        nombre: 'Último mes',
        fecha_inicio: this.formatDate(lastMonth),
        fecha_fin: this.formatDate(today)
      },
      {
        nombre: 'Últimos 3 meses',
        fecha_inicio: this.formatDate(last3Months),
        fecha_fin: this.formatDate(today)
      },
      {
        nombre: 'Este mes',
        fecha_inicio: this.formatDate(thisMonth),
        fecha_fin: this.formatDate(today)
      },
      {
        nombre: 'Último año',
        fecha_inicio: this.formatDate(lastYear),
        fecha_fin: this.formatDate(today)
      }
    ];

    // Set default period
    this.periodoActual = this.periodosRapidos[0];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadData(): void {
    this.loadEstadisticas();
  }

  private loadEmprendimiento(): void {
    this.emprendimientoAdminService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
      }
    });
  }

  loadEstadisticas(): void {
    this.loading = true;
    this.error = '';

    this.emprendimientoAdminService.getEstadisticasConsolidadas(
      this.emprendimientoId,
      {
        fecha_inicio: this.periodoActual.fecha_inicio,
        fecha_fin: this.periodoActual.fecha_fin
      }
    ).subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = err.error?.message || 'Error al cargar las estadísticas';
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadEstadisticas();
  }

  setPeriodoRapido(periodo: PeriodoAnalisis): void {
    this.periodoActual = { ...periodo };
    this.loadEstadisticas();
  }

  aplicarPeriodoCustom(): void {
    if (!this.periodoCustom.fecha_inicio || !this.periodoCustom.fecha_fin) return;

    this.periodoActual = {
      nombre: 'Período personalizado',
      fecha_inicio: this.periodoCustom.fecha_inicio,
      fecha_fin: this.periodoCustom.fecha_fin
    };

    this.loadEstadisticas();
  }

  // Helper methods for calculations
  getTasaConversion(): number {
    if (!this.estadisticas || this.estadisticas.reservas.total === 0) return 0;
    return Math.round((this.estadisticas.reservas.confirmadas / this.estadisticas.reservas.total) * 100);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getServicioPopularityPercentage(servicio: ServicioPopular, servicios: ServicioPopular[]): number {
    if (servicios.length === 0) return 0;
    const maxReservas = Math.max(...servicios.map(s => s.total_reservas));
    return maxReservas > 0 ? (servicio.total_reservas / maxReservas) * 100 : 0;
  }

  // Mock trend calculations (would need historical data in real implementation)
  getReservasTrend(): number {
    // Simulate trend calculation
    return Math.floor(Math.random() * 30) - 10; // Random between -10 and +20
  }

  getIngresosTrend(): number {
    // Simulate trend calculation
    return Math.floor(Math.random() * 25) - 5; // Random between -5 and +20
  }

  getConversionTrend(): number {
    // Simulate trend calculation (in percentage points)
    return Math.floor(Math.random() * 10) - 3; // Random between -3 and +7
  }

  getPerformanceInsights(): Array<{ type: 'success' | 'warning' | 'info', message: string }> {
    const insights: Array<{ type: 'success' | 'warning' | 'info', message: string }> = [];

    if (!this.estadisticas) return insights;

    const tasaConversion = this.getTasaConversion();
    const ocupacion = this.estadisticas.servicios.ocupacion_promedio;

    if (tasaConversion >= 80) {
        insights.push({
        type: 'success',
        message: `Excelente tasa de conversión del ${tasaConversion}%. Tus clientes están muy satisfechos con el servicio.`
        });
    } else if (tasaConversion < 50) {
        insights.push({
        type: 'warning',
        message: `La tasa de conversión del ${tasaConversion}% está por debajo del promedio. Considera revisar tus procesos de confirmación.`
        });
    }

    if (ocupacion >= 75) {
        insights.push({
        type: 'success',
        message: `Alta ocupación del ${ocupacion.toFixed(1)}%. Considera expandir tu capacidad o aumentar precios.`
        });
    } else if (ocupacion < 30) {
        insights.push({
        type: 'warning',
        message: `Baja ocupación del ${ocupacion.toFixed(1)}%. Revisa tu estrategia de marketing y precios.`
        });
    }

    if (this.estadisticas.reservas.pendientes > this.estadisticas.reservas.confirmadas) {
        insights.push({
        type: 'info',
        message: 'Tienes más reservas pendientes que confirmadas. Considera automatizar el proceso de confirmación.'
        });
    }

    return insights;
  }


  getRecommendations(): Array<{ title: string, description: string }> {
    const recommendations: Array<{ title: string, description: string }> = [];

    if (!this.estadisticas) return recommendations;

    if (this.estadisticas.servicios.mas_solicitados.length > 0) {
        const topService = this.estadisticas.servicios.mas_solicitados[0];
        recommendations.push({
        title: 'Optimiza tu servicio estrella',
        description: `"${topService.nombre}" es tu servicio más popular. Considera crear paquetes especiales o aumentar su disponibilidad.`
        });
    }

    if (this.estadisticas.reservas.canceladas > this.estadisticas.reservas.confirmadas * 0.2) {
        recommendations.push({
        title: 'Reduce las cancelaciones',
        description: 'Implementa políticas de cancelación más claras y confirmaciones automáticas para reducir la tasa de cancelación.'
        });
    }

    if (this.estadisticas.planes.total_activos > 0) {
        recommendations.push({
        title: 'Promociona tus planes',
        description: 'Tienes planes activos con buen potencial. Considera campañas específicas para aumentar las inscripciones.'
        });
    }

    recommendations.push({
        title: 'Mejora la experiencia del cliente',
        description: 'Implementa un sistema de feedback post-servicio para identificar áreas de mejora y aumentar la satisfacción.'
    });

    return recommendations;
  }

  async exportReport(): Promise<void> {
    if (!this.estadisticas) return;

    try {
      // Create CSV content
      const csvContent = this.generateCSVReport();
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `estadisticas-${this.emprendimiento?.nombre}-${this.periodoActual.fecha_inicio}-${this.periodoActual.fecha_fin}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al exportar reporte:', err);
      alert('Error al exportar el reporte');
    }
  }

  private generateCSVReport(): string {
    if (!this.estadisticas) return '';

    const rows = [
      ['Reporte de Estadísticas'],
      ['Emprendimiento', this.emprendimiento?.nombre || ''],
      ['Período', `${this.periodoActual.fecha_inicio} a ${this.periodoActual.fecha_fin}`],
      ['Generado el', new Date().toLocaleDateString()],
      [''],
      ['RESERVAS'],
      ['Total de reservas', this.estadisticas.reservas.total],
      ['Reservas confirmadas', this.estadisticas.reservas.confirmadas],
      ['Reservas pendientes', this.estadisticas.reservas.pendientes],
      ['Reservas canceladas', this.estadisticas.reservas.canceladas],
      ['Tasa de conversión', `${this.getTasaConversion()}%`],
      ['Ingresos totales', `S/. ${this.estadisticas.reservas.ingresos_totales}`],
      [''],
      ['PLANES'],
      ['Planes activos', this.estadisticas.planes.total_activos],
      ['Total inscripciones', this.estadisticas.planes.inscripciones_totales],
      ['Ingresos estimados', `S/. ${this.estadisticas.planes.ingresos_estimados}`],
      [''],
      ['SERVICIOS'],
      ['Ocupación promedio', `${this.estadisticas.servicios.ocupacion_promedio}%`],
      [''],
      ['SERVICIOS MÁS POPULARES'],
      ['Posición', 'Servicio', 'Reservas', 'Ingresos']
    ];

    this.estadisticas.servicios.mas_solicitados.forEach((servicio, index) => {
      rows.push([
        (index + 1).toString(),
        servicio.nombre,
        servicio.total_reservas.toString(),
        `S/. ${servicio.ingresos_totales}`
      ]);
    });

    return rows.map(row => row.join(',')).join('\n');
  }

  // Track by function for performance
  trackByServicio(index: number, servicio: ServicioPopular): number {
    return servicio.servicio_id;
  }
}