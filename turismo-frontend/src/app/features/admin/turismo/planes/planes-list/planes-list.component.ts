import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../../../../core/services/planes.service';
import { TurismoService } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { Plan, PlanFiltros, PlanEmprendedor, PlanEmprendedorRequest } from '../../../../../core/models/plan.model';
import { PaginatedResponse } from '../../../../../core/models/api.model';
import { environment } from '../../../../../../environments/environments';

@Component({
  selector: 'app-planes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Planes de Turismo" 
      subtitle="Administra y gestiona todos los planes turísticos del sistema"
    >
    </app-admin-header>

    <div class="container mx-auto px-2 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex items-center space-x-2 pb-5">
        <a
          routerLink="/admin/planes/estadisticas"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Estadísticas
        </a>
        <a
          routerLink="/admin/planes/inscripciones"
          class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Inscripciones
        </a>
        <a
          routerLink="/admin/planes/create"
          class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nuevo Plan
        </a>
      </div>
      
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-300">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              [(ngModel)]="filtros.buscar"
              (input)="onFiltroChange()"
              placeholder="Nombre del plan..."
              class="input-estilo w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              [(ngModel)]="filtros.estado"
              (change)="onFiltroChange()"
              class="select-estilo w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="borrador">Borradores</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dificultad</label>
            <select
              [(ngModel)]="filtros.dificultad"
              (change)="onFiltroChange()"
              class="select-estilo w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Todas</option>
              <option value="facil">Fácil</option>
              <option value="moderado">Moderado</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Público</label>
            <select
              [(ngModel)]="filtros.es_publico"
              (change)="onFiltroChange()"
              class="select-estilo w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Públicos</option>
              <option value="false">Privados</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (días)</label>
            <div class="flex space-x-1">
              <input
                type="number"
                [(ngModel)]="filtros.duracion_min"
                (input)="onFiltroChange()"
                placeholder="Min"
                min="1"
                class="py-2 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
              <input
                type="number"
                [(ngModel)]="filtros.duracion_max"
                (input)="onFiltroChange()"
                placeholder="Max"
                min="1"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
            </div>
          </div>
          
          <div class="flex items-end">
            <button
              (click)="limpiarFiltros()"
              class="w-full inline-flex justify-center items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
            >
              <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de planes -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
        @if (loading) {
          <div class="flex justify-center items-center p-8 dark:text-white transition-colors duration-300">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando planes...</span>
          </div>
        } @else if (!pagination || pagination.data.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No se encontraron planes</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Comience creando un nuevo plan turístico.</p>
            <div class="mt-6">
              <a routerLink="/admin/planes/create" class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Plan
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              <thead class="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th scope="col" class="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Plan</th>
                  <th scope="col" class="hidden md:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Emprendedores</th>
                  <th scope="col" class="hidden sm:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Duración</th>
                  <th scope="col" class="hidden lg:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Precio</th>
                  <th scope="col" class="hidden lg:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Capacidad</th>
                  <th scope="col" class="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Estado</th>
                  <th scope="col" class="p-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                @for (plan of pagination.data; track plan.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td class="p-2">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 mr-3">
                          @if (plan.imagen_principal_url) {
                            <img [src]="env.assetsUrl + plan.imagen_principal_url" [alt]="plan.nombre" 
                                class="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600">
                          } @else {
                            <div class="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                              <svg class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            </div>
                          }
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300 truncate">{{ plan.nombre }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            <span class="inline-flex items-center">
                              <span class="mr-2">{{ getDificultadLabel(plan.dificultad) }}</span>
                              @if (plan.es_publico) {
                                <span class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                                  Público
                                </span>
                              } @else {
                                <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                                  Privado
                                </span>
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <!-- COLUMNA ACTUALIZADA: Emprendedores -->
                    <td class="hidden md:table-cell p-2">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        @if (plan.emprendedores && plan.emprendedores.length > 0) {
                          <!-- Mostrar organizador principal -->
                          @if (plan.organizador_principal) {
                            <div class="font-medium">{{ plan.organizador_principal.nombre }}</div>
                            <div class="text-xs text-primary-600 dark:text-primary-400">Organizador Principal</div>
                          }
                          
                          <!-- Mostrar total de emprendedores si hay más de uno -->
                          @if (plan.total_emprendedores && plan.total_emprendedores > 1) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              +{{ plan.total_emprendedores - 1 }} más
                              <span class="inline-flex items-center ml-1 rounded-full bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                                {{ plan.total_emprendedores }}
                              </span>
                            </div>
                          }
                        } @else if (plan.emprendedor) {
                          <!-- Legacy: emprendedor único -->
                          <div class="font-medium">{{ plan.emprendedor.nombre }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ plan.emprendedor.ubicacion }}</div>
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400 transition-colors duration-300">Sin emprendedor</span>
                        }
                      </div>
                    </td>
                    
                    <td class="hidden sm:table-cell p-2">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        {{ plan.duracion_dias }} {{ plan.duracion_dias === 1 ? 'día' : 'días' }}
                      </div>
                    </td>
                    <td class="hidden lg:table-cell p-2">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        @if (plan.precio_total) {
                          S/ {{ plan.precio_total | number:'1.2-2' }}
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400">Sin precio</span>
                        }
                      </div>
                    </td>
                    <td class="hidden lg:table-cell p-2">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        {{ plan.cupos_disponibles || 0 }} / {{ plan.capacidad }}
                      </div>
                    </td>
                    <td class="p-2">
                      @if (plan.estado === 'activo') {
                        <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200 transition-colors duration-300">
                          Activo
                        </span>
                      } @else if (plan.estado === 'inactivo') {
                        <span class="inline-flex rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-200 transition-colors duration-300">
                          Inactivo
                        </span>
                      } @else {
                        <span class="inline-flex rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                          Borrador
                        </span>
                      }
                    </td>
                    <td class="p-2 text-right">
                      <div class="flex items-center justify-end space-x-1">
                        <a
                          [routerLink]="['/admin/planes', plan.id, 'detail']"
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Ver detalle"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </a>

                        <!-- Botón para gestionar emprendedores -->
                        <button
                          (click)="gestionarEmprendedores(plan)"
                          class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300 p-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          title="Gestionar emprendedores"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </button>

                        <a
                          [routerLink]="['/admin/planes/edit', plan.id]"
                          class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300 p-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          title="Editar"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>

                        <button
                          (click)="cambiarEstado(plan)"
                          class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-300 p-1 rounded-md hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          [title]="plan.estado === 'activo' ? 'Desactivar' : 'Activar'"
                        >
                          @if (plan.estado === 'activo') {
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                            </svg>
                          } @else {
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          }
                        </button>

                        <button
                          (click)="deletePlan(plan)"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Eliminar"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (pagination) {
            <div class="bg-white dark:bg-gray-800 p-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div class="flex sm:flex-1 sm:flex sm:items-center sm:justify-between flex-col sm:flex-row">
                <div>
                  <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span class="hidden sm:inline">Mostrando</span> <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span>
                  </p>
                </div>
                <div class="mt-2 sm:mt-0">
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      (click)="goToPage(currentPage - 1)"
                      [disabled]="!pagination.prev_page_url"
                      class="relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                      [class.opacity-50]="!pagination.prev_page_url"
                      [class.cursor-not-allowed]="!pagination.prev_page_url"
                    >
                      <span class="sr-only">Anterior</span>
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>

                    @for (link of pagination.links; track $index) {
                      @if (link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;' && isValidPageNumber(link.label)) {
                        <button
                          (click)="goToPage(+link.label)"
                          class="relative inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium transition-colors duration-300"
                          [ngClass]="{
                            'bg-primary-50': link.active && !isDarkMode(),
                            'bg-primary-900/40': link.active && isDarkMode(),
                            'text-primary-600': link.active && !isDarkMode(),
                            'text-primary-300': link.active && isDarkMode(),
                            'bg-white': !link.active && !isDarkMode(),
                            'bg-gray-700': !link.active && isDarkMode(),
                            'text-gray-700': !link.active && !isDarkMode(),
                            'text-gray-300': !link.active && isDarkMode(),
                            'hover:bg-gray-50': !link.active && !isDarkMode(),
                            'hover:bg-gray-600': !link.active && isDarkMode()
                          }"
                          [disabled]="link.active"
                        >
                          {{ link.label }}
                        </button>
                      }
                    }

                    <button
                      (click)="goToPage(currentPage + 1)"
                      [disabled]="!pagination.next_page_url"
                      class="relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                      [class.opacity-50]="!pagination.next_page_url"
                      [class.cursor-not-allowed]="!pagination.next_page_url"
                    >
                      <span class="sr-only">Siguiente</span>
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal para gestionar emprendedores -->
    @if (showEmprendedoresModal && selectedPlan) {
      <div class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 transition-opacity duration-300" (click)="closeEmprendedoresModal()">
        <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-300" (click)="$event.stopPropagation()">
          
          <!-- Header del modal -->
          <div class="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Gestionar Emprendedores
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ selectedPlan.nombre }} • Plan ID: {{ selectedPlan.id }}
              </p>
            </div>
            <button
              (click)="closeEmprendedoresModal()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Estadísticas del plan -->
          @if (planMeta) {
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ planMeta.total_emprendedores }}</div>
                <div class="text-xs text-blue-600 dark:text-blue-400">Total</div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ planMeta.organizadores }}</div>
                <div class="text-xs text-green-600 dark:text-green-400">Organizadores</div>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ planMeta.colaboradores }}</div>
                <div class="text-xs text-purple-600 dark:text-purple-400">Colaboradores</div>
              </div>
            </div>
          }

          <!-- Lista de emprendedores actuales -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white">Emprendedores Participantes</h4>
              <button
                (click)="mostrarFormularioAgregar()"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Agregar Emprendedor
              </button>
            </div>
            
            @if (loadingEmprendedores) {
              <div class="flex justify-center py-8">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                <span class="ml-4 text-gray-600 dark:text-gray-400">Cargando emprendedores...</span>
              </div>
            } @else if (planEmprendedores && planEmprendedores.length > 0) {
              <div class="space-y-4 max-h-96 overflow-y-auto">
                @for (emprendedor of planEmprendedores; track emprendedor.id) {
                  <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div class="flex-1">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center">
                            <div class="flex-1">
                              <div class="text-sm font-semibold text-gray-900 dark:text-white">{{ emprendedor.nombre }}</div>
                              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                📍 {{ emprendedor.ubicacion }}
                              </div>
                              @if (emprendedor.telefono) {
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  📞 {{ emprendedor.telefono }}
                                </div>
                              }
                              @if (emprendedor.email) {
                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                  ✉️ {{ emprendedor.email }}
                                </div>
                              }
                            </div>
                            
                            <!-- Badges de rol -->
                            <div class="ml-4 flex flex-col items-end space-y-1">
                              @if (emprendedor.es_organizador_principal) {
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                  <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-rule="evenodd"></path>
                                  </svg>
                                  Organizador Principal
                                </span>
                              } @else if (emprendedor.rol === 'organizador') {
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  🎯 Organizador
                                </span>
                              } @else {
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  🤝 Colaborador
                                </span>
                              }
                              
                              @if (emprendedor.porcentaje_ganancia && emprendedor.porcentaje_ganancia > 0) {
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                  {{ emprendedor.porcentaje_ganancia }}% ganancia
                                </span>
                              }
                            </div>
                          </div>
                          
                          @if (emprendedor.descripcion_participacion) {
                            <div class="text-xs text-gray-600 dark:text-gray-300 mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
                              <span class="font-medium">Participación:</span> {{ emprendedor.descripcion_participacion }}
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                    
                    <!-- Acciones -->
                    <div class="ml-4 flex space-x-2">
                      <button
                        (click)="editarEmprendedor(emprendedor)"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                        title="Editar emprendedor"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      
                      @if (!emprendedor.es_organizador_principal) {
                        <button
                          (click)="removerEmprendedor(emprendedor)"
                          class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          title="Remover emprendedor"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      } @else {
                        <div class="p-2 text-gray-400 dark:text-gray-500" title="No se puede remover al organizador principal">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                          </svg>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sin emprendedores</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No hay emprendedores asignados a este plan</p>
                <div class="mt-6">
                  <button
                    (click)="mostrarFormularioAgregar()"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Agregar Primer Emprendedor
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Footer con acciones -->
          <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              (click)="closeEmprendedoresModal()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal para agregar/editar emprendedor -->
    @if (showFormularioEmprendedor) {
      <div class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-85 overflow-y-auto h-full w-full z-60 transition-opacity duration-300">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-300">
          
          <div class="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ emprendedorEditando ? 'Editar Emprendedor' : 'Agregar Emprendedor' }}
            </h3>
            <button
              (click)="cerrarFormularioEmprendedor()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="guardarEmprendedor()" class="space-y-4">
            
            <!-- Selección de emprendedor (solo al agregar) -->
            @if (!emprendedorEditando) {
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emprendedor <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="formularioEmprendedor.emprendedor_id"
                  name="emprendedor_id"
                  required
                  class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Seleccionar emprendedor...</option>
                  @for (emprendedor of emprendedoresDisponibles; track emprendedor.id) {
                    <option [value]="emprendedor.id">{{ emprendedor.nombre }} - {{ emprendedor.ubicacion }}</option>
                  }
                </select>
              </div>
            }

            <!-- Rol -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rol <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="formularioEmprendedor.rol"
                name="rol"
                required
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                (change)="onRolChange()"
              >
                <option value="organizador">🎯 Organizador</option>
                <option value="colaborador">🤝 Colaborador</option>
              </select>
            </div>

            <!-- Organizador principal (solo si es organizador) -->
            @if (formularioEmprendedor.rol === 'organizador') {
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="formularioEmprendedor.es_organizador_principal"
                  name="es_organizador_principal"
                  id="es_organizador_principal"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  (change)="onOrganizadorPrincipalChange()"
                >
                <label for="es_organizador_principal" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Es el organizador principal del plan
                </label>
              </div>
            }

            <!-- Porcentaje de ganancia -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Porcentaje de Ganancia (%)
              </label>
              <input
                type="number"
                [(ngModel)]="formularioEmprendedor.porcentaje_ganancia"
                name="porcentaje_ganancia"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total actual en el plan: {{ getTotalPorcentajesModal() }}%
              </p>
            </div>

            <!-- Descripción de participación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción de Participación
              </label>
              <textarea
                [(ngModel)]="formularioEmprendedor.descripcion_participacion"
                name="descripcion_participacion"
                rows="3"
                placeholder="Describe el rol específico de este emprendedor en el plan..."
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              ></textarea>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                (click)="cerrarFormularioEmprendedor()"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="guardandoEmprendedor || !formularioValido()"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                @if (guardandoEmprendedor) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ emprendedorEditando ? 'Actualizar' : 'Agregar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class PlanesListComponent implements OnInit {
  env = environment;
  private planesService = inject(PlanesService);
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);

  pagination: PaginatedResponse<Plan> | null = null;
  loading = true;
  currentPage = 1;
  
  filtros: PlanFiltros = {
    page: 1,
    per_page: 10,
    todos: true // Para ver todos los planes en admin
  };
  
  private filtroTimeout: any;

  // PROPIEDADES PARA GESTIÓN DE EMPRENDEDORES
  showEmprendedoresModal = false;
  selectedPlan: Plan | null = null;
  planEmprendedores: PlanEmprendedor[] = [];
  planMeta: any = null;
  loadingEmprendedores = false;

  // PROPIEDADES PARA FORMULARIO DE EMPRENDEDOR
  showFormularioEmprendedor = false;
  emprendedorEditando: PlanEmprendedor | null = null;
  emprendedoresDisponibles: any[] = [];
  guardandoEmprendedor = false;
  
  formularioEmprendedor = {
    emprendedor_id: '',
    rol: 'organizador' as 'organizador' | 'colaborador',
    es_organizador_principal: false,
    descripcion_participacion: '',
    porcentaje_ganancia: 0
  };

  ngOnInit() {
    this.loadPlanes();
    this.loadEmprendedoresDisponibles();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  loadPlanes() {
    this.loading = true;
    this.filtros.page = this.currentPage;
    
    this.planesService.getAllPlanesAdmin(this.filtros).subscribe({
      next: (response) => {
        this.pagination = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
        this.loading = false;
        alert('Error al cargar los planes. Por favor, intente nuevamente.');
      }
    });
  }

  loadEmprendedoresDisponibles() {
    this.turismoService.getEmprendedores(1, 100).subscribe({
      next: (response) => {
        this.emprendedoresDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores disponibles:', error);
      }
    });
  }

  onFiltroChange() {
    if (this.filtroTimeout) {
      clearTimeout(this.filtroTimeout);
    }
    
    this.filtroTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadPlanes();
    }, 500);
  }

  limpiarFiltros() {
    this.filtros = {
      page: 1,
      per_page: 10,
      todos: true
    };
    this.currentPage = 1;
    this.loadPlanes();
  }

  goToPage(page: number) {
    if (!this.pagination) return;

    if (page < 1 || page > this.pagination.last_page) {
      return;
    }

    this.currentPage = page;
    this.loadPlanes();
  }

  isValidPageNumber(value: any): boolean {
    return !isNaN(+value);
  }

  getDificultadLabel(dificultad: string): string {
    const labels: { [key: string]: string } = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return labels[dificultad] || dificultad;
  }

  cambiarEstado(plan: Plan) {
    if (!plan.id) return;

    const nuevoEstado = plan.estado === 'activo' ? 'inactivo' : 'activo';
    const mensaje = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Está seguro de ${mensaje} el plan "${plan.nombre}"?`)) {
      this.planesService.cambiarEstadoPlan(plan.id, nuevoEstado).subscribe({
        next: () => {
          plan.estado = nuevoEstado as any;
          alert(`Plan ${mensaje === 'activar' ? 'activado' : 'desactivado'} correctamente`);
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
          alert('Error al cambiar el estado del plan. Por favor, intente nuevamente.');
        }
      });
    }
  }

  deletePlan(plan: Plan) {
    if (!plan.id) return;

    if (confirm(`¿Está seguro de eliminar el plan "${plan.nombre}"? Esta acción eliminará también todas las inscripciones relacionadas y no se puede deshacer.`)) {
      this.planesService.deletePlan(plan.id).subscribe({
        next: () => {
          this.loadPlanes();
          alert('Plan eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar plan:', error);
          alert('Error al eliminar el plan. Por favor, intente nuevamente.');
        }
      });
    }
  }

  // MÉTODOS PARA GESTIÓN DE EMPRENDEDORES

  gestionarEmprendedores(plan: Plan) {
    if (!plan.id) return;
    
    this.selectedPlan = plan;
    this.showEmprendedoresModal = true;
    this.loadPlanEmprendedores(plan.id);
  }

  closeEmprendedoresModal() {
    this.showEmprendedoresModal = false;
    this.selectedPlan = null;
    this.planEmprendedores = [];
    this.planMeta = null;
  }

  loadPlanEmprendedores(planId: number) {
    this.loadingEmprendedores = true;
    
    this.planesService.getEmprendedoresPlan(planId).subscribe({
      next: (response) => {
        // ARREGLO: Acceder correctamente a la estructura de respuesta
        this.planEmprendedores = response.data || [];
        this.planMeta = response.meta || null;
        this.loadingEmprendedores = false;
        
        console.log('Emprendedores cargados:', this.planEmprendedores);
        console.log('Meta información:', this.planMeta);
      },
      error: (error) => {
        console.error('Error al cargar emprendedores del plan:', error);
        this.loadingEmprendedores = false;
        alert('Error al cargar los emprendedores del plan.');
      }
    });
  }

  // MÉTODOS PARA FORMULARIO DE EMPRENDEDOR

  mostrarFormularioAgregar() {
    this.emprendedorEditando = null;
    this.resetFormularioEmprendedor();
    this.showFormularioEmprendedor = true;
  }

  editarEmprendedor(emprendedor: PlanEmprendedor) {
    this.emprendedorEditando = emprendedor;
    this.formularioEmprendedor = {
      emprendedor_id: emprendedor.id.toString(),
      rol: emprendedor.rol,
      es_organizador_principal: emprendedor.es_organizador_principal,
      descripcion_participacion: emprendedor.descripcion_participacion || '',
      porcentaje_ganancia: emprendedor.porcentaje_ganancia ? parseFloat(emprendedor.porcentaje_ganancia.toString()) : 0
    };
    this.showFormularioEmprendedor = true;
  }

  cerrarFormularioEmprendedor() {
    this.showFormularioEmprendedor = false;
    this.emprendedorEditando = null;
    this.resetFormularioEmprendedor();
  }

  resetFormularioEmprendedor() {
    this.formularioEmprendedor = {
      emprendedor_id: '',
      rol: 'organizador',
      es_organizador_principal: false,
      descripcion_participacion: '',
      porcentaje_ganancia: 0
    };
  }

  onRolChange() {
    // Si cambia a colaborador, no puede ser organizador principal
    if (this.formularioEmprendedor.rol === 'colaborador') {
      this.formularioEmprendedor.es_organizador_principal = false;
    }
  }

  onOrganizadorPrincipalChange() {
    // Si se marca como organizador principal, debe ser organizador
    if (this.formularioEmprendedor.es_organizador_principal) {
      this.formularioEmprendedor.rol = 'organizador';
    }
  }

  getTotalPorcentajesModal(): number {
    let total = 0;
    
    // Sumar porcentajes de emprendedores existentes (excluyendo el que se está editando)
    this.planEmprendedores.forEach(emp => {
      if (!this.emprendedorEditando || emp.id !== this.emprendedorEditando.id) {
        total += emp.porcentaje_ganancia ? parseFloat(emp.porcentaje_ganancia.toString()) : 0;
      }
    });
    
    // Sumar el porcentaje del formulario actual
    total += this.formularioEmprendedor.porcentaje_ganancia || 0;
    
    return Math.round(total * 100) / 100;
  }

  formularioValido(): boolean {
    if (!this.emprendedorEditando && !this.formularioEmprendedor.emprendedor_id) {
      return false;
    }
    
    if (!this.formularioEmprendedor.rol) {
      return false;
    }
    
    if (this.getTotalPorcentajesModal() > 100) {
      return false;
    }
    
    return true;
  }

  guardarEmprendedor() {
    if (!this.formularioValido() || !this.selectedPlan?.id) {
      return;
    }

    this.guardandoEmprendedor = true;

    const data: PlanEmprendedorRequest = {
      emprendedor_id: parseInt(this.formularioEmprendedor.emprendedor_id),
      rol: this.formularioEmprendedor.rol,
      es_organizador_principal: this.formularioEmprendedor.es_organizador_principal,
      descripcion_participacion: this.formularioEmprendedor.descripcion_participacion || undefined,
      porcentaje_ganancia: this.formularioEmprendedor.porcentaje_ganancia || undefined
    };

    const operation = this.emprendedorEditando
      ? this.planesService.actualizarEmprendedorEnPlan(this.selectedPlan.id, this.emprendedorEditando.id, data)
      : this.planesService.agregarEmprendedorAPlan(this.selectedPlan.id, data);

    operation.subscribe({
      next: () => {
        this.guardandoEmprendedor = false;
        this.cerrarFormularioEmprendedor();
        this.loadPlanEmprendedores(this.selectedPlan!.id!);
        this.loadPlanes(); // Recargar la lista para actualizar totales
        
        const mensaje = this.emprendedorEditando 
          ? 'Emprendedor actualizado correctamente'
          : 'Emprendedor agregado correctamente';
        alert(mensaje);
      },
      error: (error) => {
        this.guardandoEmprendedor = false;
        console.error('Error al guardar emprendedor:', error);
        
        let errorMessage = 'Error al guardar el emprendedor';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors) {
          const firstError = Object.values(error.error.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          }
        }
        
        alert(errorMessage);
      }
    });
  }

  removerEmprendedor(emprendedor: PlanEmprendedor) {
    if (!this.selectedPlan?.id) return;

    if (emprendedor.es_organizador_principal) {
      alert('No se puede remover al organizador principal del plan');
      return;
    }

    if (confirm(`¿Está seguro de remover a "${emprendedor.nombre}" de este plan?`)) {
      this.planesService.removerEmprendedorDePlan(this.selectedPlan.id, emprendedor.id).subscribe({
        next: () => {
          this.loadPlanEmprendedores(this.selectedPlan!.id!);
          this.loadPlanes(); // Recargar la lista para actualizar totales
          alert('Emprendedor removido correctamente');
        },
        error: (error) => {
          console.error('Error al remover emprendedor:', error);
          alert('Error al remover el emprendedor del plan.');
        }
      });
    }
  }

  // MÉTODO DE LIMPIEZA
  ngOnDestroy() {
    if (this.filtroTimeout) {
      clearTimeout(this.filtroTimeout);
    }
  }
}