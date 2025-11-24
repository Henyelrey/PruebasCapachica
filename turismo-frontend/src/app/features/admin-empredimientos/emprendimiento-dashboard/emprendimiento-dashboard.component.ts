import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { DashboardEmprendimiento, Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

@Component({
  selector: 'app-emprendimiento-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loading state compatible con el navbar glassmorphism -->
    <div *ngIf="loading && !dashboard" class="flex items-center justify-center h-64">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Error state compatible -->
    <div *ngIf="error && !loading" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Error al cargar el dashboard</h3>
      <p class="text-slate-300 dark:text-slate-400 mb-4">{{ error }}</p>
      <button (click)="loadDashboard()" 
              class="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors duration-300">
        Reintentar
      </button>
    </div>

    <!-- Dashboard content glassmorphism style -->
    <div *ngIf="!loading && dashboard && !error" class="space-y-8">
      <!-- Header con botón refresh -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p class="text-slate-300 dark:text-slate-400 mt-1">
            Resumen de actividad y estadísticas de tu emprendimiento
          </p>
        </div>
        <button (click)="refreshData()" 
                [disabled]="loading"
                class="group flex items-center px-5 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 disabled:opacity-50">
          <svg *ngIf="!loading" class="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <div *ngIf="loading" class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span class="font-medium">Actualizar</span>
        </button>
      </div>

      <!-- Stats Grid glassmorphism -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Reservas Hoy -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-300 dark:text-slate-400 text-sm font-medium mb-1">Reservas Hoy</p>
              <p class="text-3xl font-bold text-white">{{ dashboard.reservas_hoy }}</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-500/20 text-blue-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Reservas Pendientes -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-300 dark:text-slate-400 text-sm font-medium mb-1">Pendientes</p>
              <p class="text-3xl font-bold text-white">{{ dashboard.reservas_pendientes }}</p>
            </div>
            <div class="p-3 rounded-xl bg-yellow-500/20 text-yellow-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Ingresos del Mes -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-300 dark:text-slate-400 text-sm font-medium mb-1">Ingresos del Mes</p>
              <p class="text-3xl font-bold text-white">S/ {{ dashboard.ingresos_mes }}</p>
            </div>
            <div class="p-3 rounded-xl bg-green-500/20 text-green-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Servicios Activos -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-300 dark:text-slate-400 text-sm font-medium mb-1">Servicios Activos</p>
              <p class="text-3xl font-bold text-white">{{ dashboard.servicios_activos }}</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-500/20 text-purple-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Grid glassmorphism -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Servicios Populares -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-white">Servicios Más Populares</h3>
            <div class="p-2 rounded-lg bg-orange-500/20 text-orange-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>
          
          <div class="space-y-4">
            <div *ngFor="let servicio of dashboard.servicios_populares; trackBy: trackByServicioId" 
                 class="flex items-center justify-between p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-300">
              <div class="flex-1">
                <h4 class="text-white font-medium mb-1">{{ servicio.servicio.nombre }}</h4>
                <div class="flex items-center gap-4 text-sm">
                  <span class="text-slate-300 dark:text-slate-400">
                    {{ servicio.total_reservas }} reservas
                  </span>
                  <span class="text-green-300 font-medium">
                    S/ {{ servicio.ingresos_generados }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                  <span class="text-orange-300 font-bold">{{ servicio.total_reservas }}</span>
                </div>
              </div>
            </div>
            
            <div *ngIf="dashboard.servicios_populares.length === 0" 
                 class="text-center py-8 text-slate-400 dark:text-slate-500">
              <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <p>No hay datos de servicios aún</p>
            </div>
          </div>
        </div>

        <!-- Reservas Próximas -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-white">Próximas Reservas</h3>
            <div class="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          
          <div class="space-y-4">
            <div *ngFor="let reserva of dashboard.reservas_proximas; trackBy: trackByReservaId" 
                 class="p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-300">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-white font-medium">{{ reserva.codigo_reserva }}</h4>
                      <span class="px-2 py-1 text-xs rounded-full font-medium"
                            [ngClass]="{
                              'bg-yellow-500/20 text-yellow-300': reserva.estado === 'pendiente',
                              'bg-green-500/20 text-green-300': reserva.estado === 'confirmada',
                              'bg-red-500/20 text-red-300': reserva.estado === 'cancelada',
                              'bg-blue-500/20 text-blue-300': reserva.estado === 'completada'
                            }">
                        {{ reserva.estado | titlecase }}
                      </span>
                    </div>
                    <p class="text-slate-300 dark:text-slate-400 text-sm mb-1">
                      Cliente: {{ reserva.usuario.name }}
                    </p>
                    <p class="text-slate-400 dark:text-slate-500 text-xs">
                      {{ reserva.created_at | date:'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white font-medium text-sm">{{ reserva.servicios.length }} servicios</p>
                </div>
              </div>
            </div>
            
            <div *ngIf="dashboard.reservas_proximas.length === 0" 
                 class="text-center py-8 text-slate-400 dark:text-slate-500">
              <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p>No hay reservas próximas</p>
            </div>
          </div>
          
          <div *ngIf="dashboard.reservas_proximas.length > 0" class="mt-6">
            <a [routerLink]="['../reservas']" 
               class="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl">
              Ver todas las reservas
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Actions glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <h3 class="text-xl font-semibold text-white mb-6">Acciones Rápidas</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a [routerLink]="['../servicios']" 
             class="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg">
            <div class="p-3 rounded-xl bg-blue-500/20 text-blue-300 mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <span class="text-white font-medium text-sm text-center">Gestionar Servicios</span>
          </a>

          <a [routerLink]="['../reservas']" 
             class="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg">
            <div class="p-3 rounded-xl bg-green-500/20 text-green-300 mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-white font-medium text-sm text-center">Ver Reservas</span>
          </a>

          <a [routerLink]="['../planes']" 
             class="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg">
            <div class="p-3 rounded-xl bg-purple-500/20 text-purple-300 mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-4H5m14 8H5m14-4h.01"/>
              </svg>
            </div>
            <span class="text-white font-medium text-sm text-center">Gestionar Planes</span>
          </a>

          <a [routerLink]="['../calendario']" 
             class="group flex flex-col items-center p-4 rounded-xl bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg">
            <div class="p-3 rounded-xl bg-orange-500/20 text-orange-300 mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-white font-medium text-sm text-center">Ver Calendario</span>
          </a>
        </div>
      </div>

      <!-- Summary Stats glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <h3 class="text-xl font-semibold text-white mb-6">Resumen General</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-white mb-1">{{ dashboard.total_reservas_confirmadas }}</h4>
            <p class="text-slate-300 dark:text-slate-400 text-sm">Total Confirmadas</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-white mb-1">S/ {{ dashboard.ingresos_mes }}</h4>
            <p class="text-slate-300 dark:text-slate-400 text-sm">Ingresos Mes Actual</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
              <svg class="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-white mb-1">{{ dashboard.servicios_activos }}</h4>
            <p class="text-slate-300 dark:text-slate-400 text-sm">Servicios Disponibles</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }
  `]
})
export class EmprendimientoDashboardComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  dashboard?: DashboardEmprendimiento;
  loading = true;
  error = '';

  ngOnInit(): void {
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Dashboard - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadData();
      } else {
        console.error('Dashboard - ID inválido:', id);
      }
    });
  }

  private loadData(): void {
    this.loadDashboard();
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

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.emprendimientoAdminService.getDashboard(this.emprendimientoId).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.error = err.error?.message || 'Error al cargar el dashboard';
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadDashboard();
  }

  trackByServicioId(index: number, item: any): number {
    return item.servicio_id;
  }

  trackByReservaId(index: number, item: any): number {
    return item.id;
  }
}