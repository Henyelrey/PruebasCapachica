import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { 
  Emprendimiento, 
  Plan,
  Inscripcion,
  MetaEmprendedorResponse,
  ResumenPlanes,
  EstadisticasPlan
} from '../../../core/models/emprendimiento-admin.model';
import { environment } from '../../../../environments/environments';


@Component({
  selector: 'app-planes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Planes Turísticos
          </h1>
          <p class="text-slate-300 dark:text-slate-400 mt-1">
            Administra los planes turísticos en los que participas
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <button (click)="refreshData()" 
                  [disabled]="loading"
                  class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60">
            <svg *ngIf="!loading" class="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <div *ngIf="loading" class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span class="font-medium">Actualizar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Dashboard glassmorphism -->
    <div *ngIf="resumenPlanes" class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Total Planes -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-white">Total Planes</h3>
              <p class="text-3xl font-bold text-blue-400">{{ resumenPlanes.total_planes_participando }}</p>
              <p class="text-sm text-slate-400">{{ resumenPlanes.planes_activos_participando }} activos</p>
            </div>
          </div>
        </div>

        <!-- Planes Organizando -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-white">Organizando</h3>
              <p class="text-3xl font-bold text-green-400">{{ resumenPlanes.planes_organizando }}</p>
              <p class="text-sm text-slate-400">{{ resumenPlanes.planes_activos_organizando }} activos</p>
            </div>
          </div>
        </div>

        <!-- Planes Colaborando -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-white">Colaborando</h3>
              <p class="text-3xl font-bold text-purple-400">{{ resumenPlanes.planes_colaborando }}</p>
              <p class="text-sm text-slate-400">{{ resumenPlanes.planes_activos_colaborando }} activos</p>
            </div>
          </div>
        </div>

        <!-- Ingresos Estimados -->
        <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-500/30 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-white">Ingresos Estimados</h3>
              <p class="text-3xl font-bold text-yellow-400">S/. {{ resumenPlanes.ingresos_estimados_total | number:'1.2-2' }}</p>
              <p class="text-sm text-slate-400">{{ resumenPlanes.inscripciones_confirmadas }} inscripciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters glassmorphism -->
    <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Tipo de Rol Filter -->
        <div>
          <label for="tipo_rol" class="block text-sm font-medium text-slate-300 mb-2">
            Mi Rol
          </label>
          <select
            id="tipo_rol"
            [(ngModel)]="filters.tipo_rol"
            (change)="applyFilters()"
            class="w-full px-3 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
            <option value="" class="bg-slate-800 text-white">Todos</option>
            <option value="organizador" class="bg-slate-800 text-white">Organizador</option>
            <option value="colaborador" class="bg-slate-800 text-white">Colaborador</option>
          </select>
        </div>

        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-slate-300 mb-2">
            Buscar planes
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              id="search"
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              placeholder="Nombre del plan..."
              class="block w-full pl-10 pr-3 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
          </div>
        </div>

        <!-- Solo Activos Filter -->
        <div class="flex items-center mt-6">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              [(ngModel)]="filters.solo_activos"
              (change)="applyFilters()"
              class="h-4 w-4 text-orange-400 focus:ring-orange-400 border-slate-600 rounded bg-white/10">
            <span class="ml-2 text-sm text-slate-300">
              Solo planes activos
            </span>
          </label>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            (click)="clearFilters()"
            class="w-full px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State glassmorphism -->
    <div *ngIf="loading && !planes.length" class="flex justify-center items-center py-20">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Error State glassmorphism -->
    <div *ngIf="error" class="mb-8">
      <div class="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-200">Error al cargar los planes</h3>
            <div class="mt-2 text-sm text-red-300">{{ error }}</div>
            <div class="mt-4">
              <button (click)="loadPlanes()" 
                      class="bg-red-500/20 px-3 py-2 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/30 transition-all duration-300">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State glassmorphism -->
    <div *ngIf="!loading && !error && planes.length === 0" class="text-center py-16">
      <div class="backdrop-blur-sm bg-white/5 dark:bg-slate-800/30 rounded-2xl p-12 border border-white/10 dark:border-slate-600/30">
        <svg class="mx-auto h-24 w-24 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-xl font-semibold text-white mb-2">No hay planes</h3>
        <p class="text-slate-400 mb-6">
          {{ hasActiveFilters() ? 'No se encontraron planes con los filtros aplicados.' : 'Aún no participas en ningún plan turístico.' }}
        </p>
        <div *ngIf="hasActiveFilters()">
          <button (click)="clearFilters()"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-orange-600 bg-orange-100/20 hover:bg-orange-100/30 transition-all duration-300">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Planes Grid glassmorphism -->
    <div *ngIf="!loading && !error && planes.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div *ngFor="let plan of planes; trackBy: trackByPlan" 
            class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 group">
          
          <!-- Plan Image -->
          <div class="relative h-48 overflow-hidden">
            <ng-container *ngIf="getImageUrl(plan.imagen_principal_url) as imageUrl; else noImageTemplate">
              <img [src]="imageUrl" 
                  [alt]="plan.nombre" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  (error)="onImageError($event)">
            </ng-container>
            <ng-template #noImageTemplate>
              <div class="w-full h-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 flex items-center justify-center">
                <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </ng-template>
            
            <!-- Status Badges -->
            <div class="absolute top-4 right-4 flex flex-col space-y-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm"
                    [ngClass]="{
                      'bg-green-500/30 text-green-200 border border-green-400/50': plan.estado === 'activo',
                      'bg-red-500/30 text-red-200 border border-red-400/50': plan.estado === 'inactivo',
                      'bg-gray-500/30 text-gray-200 border border-gray-400/50': plan.estado === 'borrador'
                    }">
                {{ plan.estado | titlecase }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm"
                    [ngClass]="{
                      'bg-blue-500/30 text-blue-200 border border-blue-400/50': plan.mi_rol?.rol === 'organizador',
                      'bg-purple-500/30 text-purple-200 border border-purple-400/50': plan.mi_rol?.rol === 'colaborador'
                    }">
                {{ plan.mi_rol?.rol | titlecase }}
              </span>
              <span *ngIf="plan.mi_rol?.es_organizador_principal" 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/30 text-yellow-200 border border-yellow-400/50 backdrop-blur-sm">
                Principal
              </span>
            </div>

            <!-- Difficulty Badge -->
            <div class="absolute top-4 left-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm"
                    [ngClass]="{
                      'bg-green-500/30 text-green-200 border border-green-400/50': plan.dificultad === 'facil',
                      'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50': plan.dificultad === 'moderado',
                      'bg-red-500/30 text-red-200 border border-red-400/50': plan.dificultad === 'dificil'
                    }">
                {{ getDificultadLabel(plan.dificultad) }}
              </span>
            </div>

            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          <!-- Plan Content -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-white line-clamp-2 group-hover:text-orange-300 transition-colors duration-300">
                {{ plan.nombre }}
              </h3>
            </div>
            
            <p class="text-slate-300 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              {{ plan.descripcion }}
            </p>

            <!-- Plan Details -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between text-sm p-2 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-lg">
                <span class="text-slate-400">Duración:</span>
                <span class="font-medium text-white">{{ plan.duracion_dias }} día{{ plan.duracion_dias > 1 ? 's' : '' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm p-2 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-lg">
                <span class="text-slate-400">Capacidad:</span>
                <span class="font-medium text-white">{{ plan.capacidad }} personas</span>
              </div>
              <div class="flex items-center justify-between text-sm p-2 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-lg">
                <span class="text-slate-400">Disponibles:</span>
                <span class="font-medium" 
                      [ngClass]="{
                        'text-green-400': plan.cupos_disponibles && plan.cupos_disponibles > 5,
                        'text-yellow-400': plan.cupos_disponibles && plan.cupos_disponibles <= 5 && plan.cupos_disponibles > 0,
                        'text-red-400': plan.cupos_disponibles === 0
                      }">
                  {{ plan.cupos_disponibles || 0 }} cupos
                </span>
              </div>
              <div class="flex items-center justify-between text-sm p-2 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-lg">
                <span class="text-slate-400">Precio:</span>
                <span class="font-bold text-green-400">S/. {{ plan.precio_total | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- My Participation Info -->
            <div *ngIf="plan.mi_rol" class="bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl p-3 mb-4">
              <h4 class="text-sm font-medium text-white mb-2">Mi Participación</h4>
              <div class="text-xs text-slate-300 space-y-1">
                <p><strong>Rol:</strong> {{ plan.mi_rol.rol | titlecase }}</p>
                <p *ngIf="plan.mi_rol.descripcion_participacion"><strong>Descripción:</strong> {{ plan.mi_rol.descripcion_participacion }}</p>
                <p><strong>% Ganancia:</strong> {{ plan.mi_rol.porcentaje_ganancia }}%</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button (click)="viewPlanDetails(plan)" 
                      class="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white text-center py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-orange-500 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl">
                Ver Detalles
              </button>
              
              <div class="grid grid-cols-2 gap-3">
                <button (click)="viewInscripciones(plan)" 
                        class="bg-gradient-to-r from-blue-500 to-blue-400 text-white text-center py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl">
                  Inscripciones
                </button>
                <button (click)="viewEstadisticas(plan)" 
                        class="bg-gradient-to-r from-green-500 to-green-400 text-white text-center py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-green-500 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl">
                  Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination glassmorphism -->
      <div *ngIf="meta && meta.total > 0" class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-300">
            Mostrando {{ (currentPage - 1) * 10 + 1 }} a {{ Math.min(currentPage * 10, meta.total) }} de {{ meta.total }} planes
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="loadPage(currentPage - 1)"
              [disabled]="currentPage <= 1 || loading"
              class="px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
              Anterior
            </button>
            
            <span class="px-4 py-2 text-sm font-medium text-slate-300">
              Página {{ currentPage }}
            </span>
            
            <button
              (click)="loadPage(currentPage + 1)"
              [disabled]="!hasNextPage() || loading"
              class="px-4 py-2 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->

    <!-- Plan Details Modal -->
    <div *ngIf="selectedPlan && activeModal === 'details'" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
      <div class="relative bg-slate-900/95 backdrop-blur-xl border border-white/20 w-full max-w-4xl shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 p-6 z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              {{ selectedPlan.nombre }}
            </h3>
            <button (click)="closeModal()" 
                    class="text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-xl hover:bg-white/10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Image -->
          <div *ngIf="getImageUrl(selectedPlan.imagen_principal_url)" class="relative h-64 rounded-xl overflow-hidden">
            <img [src]="getImageUrl(selectedPlan.imagen_principal_url)" 
                [alt]="selectedPlan.nombre" 
                class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>
          
          <!-- Main Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <h4 class="font-semibold text-white mb-2 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Descripción
                </h4>
                <p class="text-slate-300 text-sm leading-relaxed">{{ selectedPlan.descripcion }}</p>
              </div>
              
              <div *ngIf="selectedPlan.que_incluye">
                <h4 class="font-semibold text-white mb-2 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Qué incluye
                </h4>
                <p class="text-slate-300 text-sm leading-relaxed">{{ selectedPlan.que_incluye }}</p>
              </div>
              
              <div *ngIf="selectedPlan.requerimientos">
                <h4 class="font-semibold text-white mb-2 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  Requerimientos
                </h4>
                <p class="text-slate-300 text-sm leading-relaxed">{{ selectedPlan.requerimientos }}</p>
              </div>
              
              <div *ngIf="selectedPlan.que_llevar">
                <h4 class="font-semibold text-white mb-2 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Qué llevar
                </h4>
                <p class="text-slate-300 text-sm leading-relaxed">{{ selectedPlan.que_llevar }}</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <!-- Plan Stats -->
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <h4 class="font-semibold text-white mb-3">Información del Plan</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Duración:</span>
                    <span class="text-white font-medium">{{ selectedPlan.duracion_dias }} días</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Capacidad:</span>
                    <span class="text-white font-medium">{{ selectedPlan.capacidad }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Disponibles:</span>
                    <span class="font-medium" [ngClass]="{
                      'text-green-400': selectedPlan.cupos_disponibles && selectedPlan.cupos_disponibles > 5,
                      'text-yellow-400': selectedPlan.cupos_disponibles && selectedPlan.cupos_disponibles <= 5 && selectedPlan.cupos_disponibles > 0,
                      'text-red-400': selectedPlan.cupos_disponibles === 0
                    }">{{ selectedPlan.cupos_disponibles || 0 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Dificultad:</span>
                    <span class="text-white font-medium">{{ getDificultadLabel(selectedPlan.dificultad) }}</span>
                  </div>
                  <div class="flex justify-between col-span-2">
                    <span class="text-slate-400">Precio:</span>
                    <span class="text-green-400 font-bold text-lg">S/. {{ selectedPlan.precio_total | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- My Role Info -->
              <div *ngIf="selectedPlan.mi_rol" class="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 class="font-semibold text-white mb-3">Mi Participación</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Rol:</span>
                    <span class="text-white font-medium">{{ selectedPlan.mi_rol.rol | titlecase }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">% Ganancia:</span>
                    <span class="text-green-400 font-medium">{{ selectedPlan.mi_rol.porcentaje_ganancia }}%</span>
                  </div>
                  <div *ngIf="selectedPlan.mi_rol.descripcion_participacion" class="pt-2 border-t border-white/10">
                    <span class="text-slate-400 text-xs">Descripción:</span>
                    <p class="text-white text-sm mt-1">{{ selectedPlan.mi_rol.descripcion_participacion }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-6">
          <div class="flex justify-end space-x-3">
            <button (click)="closeModal()" 
                    class="px-6 py-2.5 bg-white/10 text-slate-300 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium">
              Cerrar
            </button>
            <button (click)="viewInscripciones(selectedPlan)" 
                    class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-300 font-semibold">
              Ver Inscripciones
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Inscripciones Modal -->
    <div *ngIf="selectedPlan && activeModal === 'inscripciones'" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
      <div class="relative bg-slate-900/95 backdrop-blur-xl border border-white/20 w-full max-w-6xl shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 p-6 z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Inscripciones - {{ selectedPlan.nombre }}
            </h3>
            <button (click)="closeModal()" 
                    class="text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-xl hover:bg-white/10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div *ngIf="loadingInscripciones" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div *ngIf="!loadingInscripciones && inscripciones.length === 0" class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <h4 class="text-lg font-medium text-white mb-2">No hay inscripciones</h4>
            <p class="text-slate-400">Este plan aún no tiene inscripciones registradas.</p>
          </div>
          
          <div *ngIf="!loadingInscripciones && inscripciones.length > 0" class="space-y-4">
            <div *ngFor="let inscripcion of inscripciones" 
                class="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h5 class="font-medium text-white">{{ inscripcion.usuario?.name || 'Usuario' }}</h5>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-500/30 text-green-200': inscripcion.estado === 'confirmado',
                            'bg-yellow-500/30 text-yellow-200': inscripcion.estado === 'pendiente',
                            'bg-red-500/30 text-red-200': inscripcion.estado === 'cancelado',
                            'bg-blue-500/30 text-blue-200': inscripcion.estado === 'completado'
                          }">
                      {{ inscripcion.estado | titlecase }}
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="text-slate-400">Participantes:</span>
                      <span class="text-white ml-2">{{ inscripcion.numero_participantes }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400">Precio pagado:</span>
                      <span class="text-green-400 ml-2 font-medium">S/. {{ inscripcion.precio_pagado | number:'1.2-2' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400">Fecha:</span>
                      <span class="text-white ml-2">{{ inscripcion.fecha_inscripcion | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                  <div *ngIf="inscripcion.notas" class="mt-2 text-sm">
                    <span class="text-slate-400">Notas:</span>
                    <p class="text-slate-300 mt-1">{{ inscripcion.notas }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-6">
          <div class="flex justify-end">
            <button (click)="closeModal()" 
                    class="px-6 py-2.5 bg-white/10 text-slate-300 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas Modal -->
    <div *ngIf="selectedPlan && activeModal === 'estadisticas'" 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
        (click)="closeModal()">
      <div class="relative bg-slate-900/95 backdrop-blur-xl border border-white/20 w-full max-w-4xl shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()">
        <div class="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/20 p-6 z-10">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Estadísticas - {{ selectedPlan.nombre }}
            </h3>
            <button (click)="closeModal()" 
                    class="text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-xl hover:bg-white/10">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div *ngIf="loadingEstadisticas" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div *ngIf="!loadingEstadisticas && estadisticasPlan" class="space-y-6">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-blue-400 mb-1">{{ estadisticasPlan.total_inscripciones }}</div>
                <div class="text-sm text-slate-400">Total Inscripciones</div>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-green-400 mb-1">{{ estadisticasPlan.inscripciones_confirmadas }}</div>
                <div class="text-sm text-slate-400">Confirmadas</div>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-yellow-400 mb-1">{{ estadisticasPlan.inscripciones_pendientes }}</div>
                <div class="text-sm text-slate-400">Pendientes</div>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-red-400 mb-1">{{ estadisticasPlan.inscripciones_canceladas }}</div>
                <div class="text-sm text-slate-400">Canceladas</div>
              </div>
            </div>
            
            <!-- Additional Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 class="font-semibold text-white mb-3">Participantes y Ingresos</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Total Participantes:</span>
                    <span class="text-white font-medium">{{ estadisticasPlan.total_participantes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Ingresos Totales:</span>
                    <span class="text-green-400 font-bold">S/. {{ estadisticasPlan.ingresos_totales | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">% Ocupación:</span>
                    <span class="text-white font-medium">{{ estadisticasPlan.porcentaje_ocupacion }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Cupos Disponibles:</span>
                    <span class="text-white font-medium">{{ estadisticasPlan.cupos_disponibles }}</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 class="font-semibold text-white mb-3">Mi Participación</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Mi Rol:</span>
                    <span class="text-white font-medium">{{ estadisticasPlan.mi_participacion.rol | titlecase }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Gestionar Inscripciones:</span>
                    <span class="font-medium" [ngClass]="{
                      'text-green-400': estadisticasPlan.mi_participacion.puede_gestionar_inscripciones,
                      'text-red-400': !estadisticasPlan.mi_participacion.puede_gestionar_inscripciones
                    }">
                      {{ estadisticasPlan.mi_participacion.puede_gestionar_inscripciones ? 'Sí' : 'No' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Editar Plan:</span>
                    <span class="font-medium" [ngClass]="{
                      'text-green-400': estadisticasPlan.mi_participacion.puede_editar_plan,
                      'text-red-400': !estadisticasPlan.mi_participacion.puede_editar_plan
                    }">
                      {{ estadisticasPlan.mi_participacion.puede_editar_plan ? 'Sí' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-6">
          <div class="flex justify-end">
            <button (click)="closeModal()" 
                    class="px-6 py-2.5 bg-white/10 text-slate-300 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    
    .line-clamp-3 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    
    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }
    
    /* Scroll suave para modals */
    .overflow-y-auto {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    }
    
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class PlanesListComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  planes: Plan[] = [];
  meta?: MetaEmprendedorResponse;
  resumenPlanes?: ResumenPlanes;
  selectedPlan?: Plan;

  env = environment;
  activeModal: 'details' | 'inscripciones' | 'estadisticas' | null = null;
  inscripciones: Inscripcion[] = [];
  estadisticasPlan?: EstadisticasPlan;
  loadingInscripciones = false;
  loadingEstadisticas = false;
  
  loading = true;
  error = '';
  currentPage = 1;
  searchTerm = '';
  searchTimeout?: any;

  filters = {
    solo_activos: true,
    tipo_rol: '' as 'organizador' | 'colaborador' | ''
  };

  // Expose Math to template
  Math = Math;

  ngOnInit(): void {
  // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Planes - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadData();
      } else {
        console.error('Planes - ID inválido:', id);
      }
    });
  }

  private loadData(): void {
    this.loadPlanes();
    this.loadResumen();
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

  loadPlanes(page: number = 1): void {
    this.loading = true;
    this.error = '';
    this.currentPage = page;

    const params = {
      solo_activos: this.filters.solo_activos,
      tipo_rol: this.filters.tipo_rol || undefined,
      page: page
    };

    this.emprendimientoAdminService.getPlanesPorEmprendedor(this.emprendimientoId, params).subscribe({
      next: (data) => {
        this.planes = data.data;
        this.meta = data.meta;
        this.loading = false;
        
        // If search term is active, filter locally
        if (this.searchTerm.trim()) {
          this.filterBySearch();
        }
      },
      error: (err) => {
        console.error('Error al cargar planes:', err);
        this.error = err.error?.message || 'Error al cargar los planes';
        this.loading = false;
      }
    });
  }
  // Método para obtener URL de imagen completa
  getImageUrl(imagePath?: string): string | null {
    if (!imagePath) return null;
    
    // Si ya es una URL completa, devolverla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, construir la URL completa
    return `${this.env.assetsUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  // Método para manejar errores de imagen
  onImageError(event: any): void {
    event.target.src = '/assets/images/default-plan.jpg';
  }

  private loadResumen(): void {
    this.emprendimientoAdminService.getResumenPlanes(this.emprendimientoId).subscribe({
      next: (data) => {
        this.resumenPlanes = data;
      },
      error: (err) => {
        console.error('Error al cargar resumen de planes:', err);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadPlanes(1);
  }

  clearFilters(): void {
    this.filters = {
      solo_activos: true,
      tipo_rol: ''
    };
    this.searchTerm = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.tipo_rol || !this.filters.solo_activos || this.searchTerm.trim());
  }

  onSearchChange(): void {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.filterBySearch();
    }, 300);
  }

  private filterBySearch(): void {
    if (!this.searchTerm.trim()) {
      return;
    }

    this.emprendimientoAdminService.searchPlanes(this.emprendimientoId, this.searchTerm).subscribe({
      next: (data) => {
        this.planes = data;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
      }
    });
  }

  refreshData(): void {
    this.loadPlanes(this.currentPage);
    this.loadResumen();
  }

  loadPage(page: number): void {
    if (page >= 1) {
      this.loadPlanes(page);
    }
  }

  hasNextPage(): boolean {
    if (!this.meta) return false;
    return this.currentPage * 10 < this.meta.total;
  }

  getDificultadLabel(dificultad: string): string {
    const labels = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return labels[dificultad as keyof typeof labels] || dificultad;
  }

  viewPlanDetails(plan: Plan): void {
    this.selectedPlan = plan;
    this.activeModal = 'details';
  }

  closeModal(): void {
    this.selectedPlan = undefined;
    this.activeModal = null;
    this.inscripciones = [];
    this.estadisticasPlan = undefined;
  }

  viewInscripciones(plan: Plan): void {
    this.selectedPlan = plan;
    this.activeModal = 'inscripciones';
    this.loadInscripciones(plan.id);
  }

  viewEstadisticas(plan: Plan): void {
    this.selectedPlan = plan;
    this.activeModal = 'estadisticas';
    this.loadEstadisticas(plan.id);
  }

  // Track by function for performance
  trackByPlan(index: number, plan: Plan): number {
    return plan.id;
  }
  private loadInscripciones(planId: number): void {
    this.loadingInscripciones = true;
    this.inscripciones = [];
    
    this.emprendimientoAdminService.getInscripcionesPlan(this.emprendimientoId, planId).subscribe({
      next: (response) => {
        this.inscripciones = response.data;
        this.loadingInscripciones = false;
      },
      error: (err) => {
        console.error('Error al cargar inscripciones:', err);
        this.loadingInscripciones = false;
        // Mostrar mensaje de error si es necesario
      }
    });
  }

  // Método para cargar estadísticas
  private loadEstadisticas(planId: number): void {
    this.loadingEstadisticas = true;
    this.estadisticasPlan = undefined;
    
    this.emprendimientoAdminService.getEstadisticasPlan(this.emprendimientoId, planId).subscribe({
      next: (stats) => {
        this.estadisticasPlan = stats;
        this.loadingEstadisticas = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.loadingEstadisticas = false;
        // Mostrar mensaje de error si es necesario
      }
    });
  }
  
  
}