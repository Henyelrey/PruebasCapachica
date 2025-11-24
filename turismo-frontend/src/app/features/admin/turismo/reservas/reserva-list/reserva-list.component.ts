import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, Reserva, PaginatedResponse, FiltrosReserva, EstadisticasReservas } from '../../../../../core/services/reservas.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-reserva-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestionar Reservas" 
      subtitle="Panel general de administración de reservas"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.total || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.pendientes || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmadas</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.confirmadas || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.completadas || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Canceladas</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.canceladas || 0}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y acciones -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm dark:shadow-gray-900 transition-colors duration-200 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Gestión de Reservas</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200" *ngIf="emprendedorId">
              Reservas para el emprendedor #{{ emprendedorId }}
            </p>
          </div>
          <div class="mt-4 sm:mt-0 flex gap-3">
            <a
              routerLink="/admin/reservas/calendario"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Ver Calendario
            </a>
            <a
              routerLink="/admin/reservas/create"
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nueva Reserva
            </a>
          </div>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label for="codigo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Código de Reserva</label>
            <div class="mt-1">
              <input
                type="text"
                id="codigo"
                [(ngModel)]="filtros.codigo"
                (ngModelChange)="aplicarFiltros()"
                placeholder="Código de reserva"
                class="input-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
              >
            </div>
          </div>

          <div>
            <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Estado</label>
            <div class="mt-1">
              <select
                id="estado"
                [(ngModel)]="filtros.estado"
                (ngModelChange)="aplicarFiltros()"
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Fecha de Inicio</label>
            <div class="mt-1">
              <input
                type="date"
                id="fecha"
                [(ngModel)]="filtros.fecha_inicio"
                (ngModelChange)="aplicarFiltros()"
                class="input-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="limpiarFiltros()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando reservas...</p>
      </div>

      <!-- Tabla de reservas -->
      <div *ngIf="!loading()" class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
        <div *ngIf="!reservasPaginadas() || reservasPaginadas()!.data.length === 0" class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No se encontraron reservas</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Comience creando una nueva reserva.</p>
          <div class="mt-6">
            <a routerLink="/admin/reservas/create" class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nueva Reserva
            </a>
          </div>
        </div>

        <div *ngIf="reservasPaginadas() && reservasPaginadas()!.data.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <thead class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Código</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Cliente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Fecha Creación</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Servicios</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Estado</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              <tr *ngFor="let reserva of reservasPaginadas()!.data; trackBy: trackByReserva" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ reserva.codigo_reserva }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                    {{ reserva.usuario?.name || 'Desconocido' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {{ reserva.usuario?.email || '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ formatearFecha(reserva.created_at!) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ reserva.servicios?.length || 0 }} servicios</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200" *ngIf="reserva.servicios && reserva.servicios.length > 0">
                    {{ obtenerPrimerServicio(reserva) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getEstadoClasse(reserva.estado)" class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                    {{ getEstadoTexto(reserva.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <a
                      [routerLink]="['/admin/reservas/detail', reserva.id]"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                      title="Ver detalles"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </a>

                    <a
                      [routerLink]="['/admin/reservas/edit', reserva.id]"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                      title="Editar"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </a>

                    <!-- Botón para cambiar estado -->
                    <div class="relative inline-block text-left">
                      <button
                        (click)="toggleEstadoMenu(reserva, $event)"
                        class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                        title="Cambiar estado"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                      </button>

                      <!-- Menú desplegable para cambiar estado -->
                      <div *ngIf="estadoMenuOpen() && reservaSeleccionada()?.id === reserva.id"
                           class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200">
                        <div class="py-1" role="menu" aria-orientation="vertical">
                          <button
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                            [class.opacity-50]="reserva.estado === 'pendiente'"
                            [class.cursor-not-allowed]="reserva.estado === 'pendiente'"
                            [disabled]="reserva.estado === 'pendiente'"
                            (click)="cambiarEstado(reserva, 'pendiente')"
                          >
                            Pendiente
                          </button>
                          <button
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                            [class.opacity-50]="reserva.estado === 'confirmada'"
                            [class.cursor-not-allowed]="reserva.estado === 'confirmada'"
                            [disabled]="reserva.estado === 'confirmada'"
                            (click)="cambiarEstado(reserva, 'confirmada')"
                          >
                            Confirmada
                          </button>
                          <button
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                            [class.opacity-50]="reserva.estado === 'cancelada'"
                            [class.cursor-not-allowed]="reserva.estado === 'cancelada'"
                            [disabled]="reserva.estado === 'cancelada'"
                            (click)="cambiarEstado(reserva, 'cancelada')"
                          >
                            Cancelada
                          </button>
                          <button
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                            [class.opacity-50]="reserva.estado === 'completada'"
                            [class.cursor-not-allowed]="reserva.estado === 'completada'"
                            [disabled]="reserva.estado === 'completada'"
                            (click)="cambiarEstado(reserva, 'completada')"
                          >
                            Completada
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      (click)="eliminarReserva(reserva)"
                      class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div *ngIf="reservasPaginadas() && reservasPaginadas()!.last_page > 1" 
             class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 transition-colors duration-200">
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Mostrando <span class="font-medium">{{ reservasPaginadas()!.from || 0 }}</span> a 
                <span class="font-medium">{{ reservasPaginadas()!.to || 0 }}</span> de 
                <span class="font-medium">{{ reservasPaginadas()!.total }}</span> resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  (click)="cambiarPagina(paginaActual - 1)"
                  [disabled]="!reservasPaginadas()!.prev_page_url"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>

                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  Página {{ paginaActual }} de {{ reservasPaginadas()!.last_page }}
                </span>

                <button
                  (click)="cambiarPagina(paginaActual + 1)"
                  [disabled]="!reservasPaginadas()!.next_page_url"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReservaListComponent implements OnInit {
  private reservasService = inject(ReservasService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  // Signals
  loading = signal<boolean>(false);
  reservasPaginadas = signal<PaginatedResponse<Reserva> | null>(null);
  estadisticas = signal<EstadisticasReservas | null>(null);
  estadoMenuOpen = signal<boolean>(false);
  reservaSeleccionada = signal<Reserva | null>(null);

  // Filtros reactivos
  filtros: FiltrosReserva = {
    codigo: '',
    estado: '',
    fecha_inicio: ''
  };

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  // Para filtrar por emprendedor específico
  emprendedorId: number | null = null;

  ngOnInit() {
    // Verificar si estamos filtrando por emprendedor desde la URL
    const emprendedorIdParam = this.route.snapshot.paramMap.get('id');
    if (emprendedorIdParam) {
      this.emprendedorId = +emprendedorIdParam;
      this.filtros.emprendedor_id = this.emprendedorId;
    }

    this.cargarReservas();
    this.cargarEstadisticas();

    // Escuchar clics fuera para cerrar menús
    document.addEventListener('click', this.cerrarMenus.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.cerrarMenus.bind(this));
  }

  cerrarMenus() {
    this.estadoMenuOpen.set(false);
    this.reservaSeleccionada.set(null);
  }

  cargarReservas() {
    this.loading.set(true);

    // Si tenemos emprendedor específico, usar endpoint diferente
    if (this.emprendedorId) {
      this.reservasService.getReservasByEmprendedor(this.emprendedorId).subscribe({
        next: (reservas) => {
          // Simular estructura paginada para mantener consistencia
          const paginatedResponse: PaginatedResponse<Reserva> = {
            current_page: 1,
            data: reservas,
            from: 1,
            to: reservas.length,
            total: reservas.length,
            per_page: reservas.length,
            last_page: 1,
            path: '',
            first_page_url: '',
            last_page_url: '',
            next_page_url: null,
            prev_page_url: null,
            links: []
          };
          this.reservasPaginadas.set(paginatedResponse);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar reservas por emprendedor:', error);
          this.loading.set(false);
        }
      });
    } else {
      // Cargar todas las reservas con filtros y paginación
      this.reservasService.getReservas(this.paginaActual, this.elementosPorPagina, this.filtros).subscribe({
        next: (response) => {
          this.reservasPaginadas.set(response);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar reservas:', error);
          this.loading.set(false);
        }
      });
    }
  }

  cargarEstadisticas() {
    this.reservasService.getEstadisticasReservas().subscribe({
      next: (stats) => {
        this.estadisticas.set(stats);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aplicarFiltros() {
    this.paginaActual = 1;
    this.cargarReservas();
  }

  limpiarFiltros() {
    this.filtros = {
      codigo: '',
      estado: '',
      fecha_inicio: ''
    };
    if (this.emprendedorId) {
      this.filtros.emprendedor_id = this.emprendedorId;
    }
    this.aplicarFiltros();
  }

  cambiarPagina(pagina: number) {
    const reservasPag = this.reservasPaginadas();
    if (!reservasPag || pagina < 1 || pagina > reservasPag.last_page) {
      return;
    }
    this.paginaActual = pagina;
    this.cargarReservas();
  }

  toggleEstadoMenu(reserva: Reserva, event: Event) {
    event.stopPropagation();
    
    if (this.estadoMenuOpen() && this.reservaSeleccionada()?.id === reserva.id) {
      this.estadoMenuOpen.set(false);
      this.reservaSeleccionada.set(null);
    } else {
      this.estadoMenuOpen.set(true);
      this.reservaSeleccionada.set(reserva);
    }
  }

  cambiarEstado(reserva: Reserva, nuevoEstado: string) {
    if (!reserva.id || reserva.estado === nuevoEstado) return;

    this.estadoMenuOpen.set(false);
    this.reservaSeleccionada.set(null);

    this.reservasService.cambiarEstadoReserva(reserva.id, nuevoEstado).subscribe({
      next: (reservaActualizada) => {
        // Actualizar en la lista local
        const reservasPag = this.reservasPaginadas();
        if (reservasPag) {
          const index = reservasPag.data.findIndex(r => r.id === reserva.id);
          if (index !== -1) {
            reservasPag.data[index] = reservaActualizada;
            this.reservasPaginadas.set({ ...reservasPag });
          }
        }
        // Recargar estadísticas
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado de la reserva');
      }
    });
  }

  eliminarReserva(reserva: Reserva) {
    if (!reserva.id) return;

    if (confirm(`¿Está seguro de eliminar la reserva "${reserva.codigo_reserva}"? Esta acción no se puede deshacer.`)) {
      this.reservasService.deleteReserva(reserva.id).subscribe({
        next: () => {
          this.cargarReservas();
          this.cargarEstadisticas();
        },
        error: (error) => {
          console.error('Error al eliminar reserva:', error);
          alert('Error al eliminar la reserva');
        }
      });
    }
  }

  // Métodos de utilidad
  trackByReserva(index: number, reserva: Reserva): number {
    return reserva.id || index;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  obtenerPrimerServicio(reserva: Reserva): string {
    if (!reserva.servicios || reserva.servicios.length === 0) return '';
    const primerServicio = reserva.servicios[0];
    return primerServicio.servicio?.nombre || 'Servicio no disponible';
  }

  getEstadoClasse(estado: string): string {
    const clases = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'confirmada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'completada': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}