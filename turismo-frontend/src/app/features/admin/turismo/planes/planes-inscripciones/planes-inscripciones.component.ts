import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../../../../core/services/planes.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { PlanInscripcion, InscripcionFiltros, Plan } from '../../../../../core/models/plan.model';
import { PaginatedResponse } from '../../../../../core/models/api.model';

@Component({
  selector: 'app-planes-inscripciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      [title]="getPageTitle()" 
      [subtitle]="getPageSubtitle()"
    >
      <!-- NUEVA: Información del plan si venimos desde detalle -->
      @if (planSeleccionado) {
        <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-700">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <div>
              <div class="text-sm font-semibold text-primary-800 dark:text-primary-200">{{ planSeleccionado.nombre }}</div>
              <div class="text-xs text-primary-600 dark:text-primary-400">
                @if (planSeleccionado.organizador_principal) {
                  Organizador: {{ planSeleccionado.organizador_principal.nombre }}
                } @else if (planSeleccionado.emprendedor) {
                  Emprendedor: {{ planSeleccionado.emprendedor.nombre }}
                }
              </div>
            </div>
          </div>
        </div>
      }
    </app-admin-header>

    <div class="container mx-auto px-2 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Breadcrumb/Navegación mejorada -->
      <div class="flex items-center space-x-2 pb-4">
        <a
          routerLink="/admin/planes"
          class="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver a Planes
        </a>
        
        @if (planSeleccionado) {
          <a
            [routerLink]="['/admin/planes', planSeleccionado.id, 'detail']"
            class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Ver Detalle del Plan
          </a>
        }

        @if (filtros.plan_id) {
          <button
            (click)="limpiarFiltroPlan()"
            class="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Ver Todas las Inscripciones
          </button>
        }
      </div>

      <!-- Estadísticas rápidas -->
      @if (estadisticasRapidas) {
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center transition-colors duration-300">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ estadisticasRapidas.total }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center transition-colors duration-300">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ estadisticasRapidas.pendientes }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Pendientes</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center transition-colors duration-300">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ estadisticasRapidas.confirmadas }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Confirmadas</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center transition-colors duration-300">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ estadisticasRapidas.en_progreso }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">En Progreso</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center transition-colors duration-300">
            <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ estadisticasRapidas.completadas }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Completadas</div>
          </div>
        </div>
      }

      <!-- Filtros mejorados -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-300">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              [(ngModel)]="filtros.estado"
              (change)="onFiltroChange()"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">📋 Pendientes</option>
              <option value="confirmada">✅ Confirmadas</option>
              <option value="en_progreso">🔄 En Progreso</option>
              <option value="completada">🎯 Completadas</option>
              <option value="cancelada">❌ Canceladas</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha desde</label>
            <input
              type="date"
              [(ngModel)]="filtros.fecha_desde"
              (change)="onFiltroChange()"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha hasta</label>
            <input
              type="date"
              [(ngModel)]="filtros.fecha_hasta"
              (change)="onFiltroChange()"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
          </div>

          <!-- NUEVO: Filtro por plan -->
          @if (!planSeleccionado) {
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan específico</label>
              <select
                [(ngModel)]="filtros.plan_id"
                (change)="onFiltroChange()"
                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="">Todos los planes</option>
                @for (plan of planesDisponibles; track plan.id) {
                  <option [value]="plan.id">{{ plan.nombre }}</option>
                }
              </select>
            </div>
          }
          
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

      <!-- Tabla de inscripciones -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
        @if (loading) {
          <div class="flex justify-center items-center p-8 dark:text-white transition-colors duration-300">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando inscripciones...</span>
          </div>
        } @else if (!pagination || pagination.data.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No se encontraron inscripciones</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              @if (planSeleccionado) {
                No hay inscripciones para este plan con los filtros seleccionados.
              } @else {
                No hay inscripciones que coincidan con los filtros seleccionados.
              }
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
              <thead class="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th scope="col" class="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Usuario</th>
                  @if (!planSeleccionado) {
                    <th scope="col" class="hidden md:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Plan</th>
                  }
                  <th scope="col" class="hidden sm:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Participantes</th>
                  <th scope="col" class="hidden lg:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Precio</th>
                  <th scope="col" class="hidden lg:table-cell p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Fecha Inscripción</th>
                  <th scope="col" class="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Estado</th>
                  <th scope="col" class="p-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                @for (inscripcion of pagination.data; track inscripcion.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td class="p-2">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 mr-3">
                          <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <span class="text-primary-800 dark:text-primary-300 font-medium text-xs">
                              {{ getUserInitials(inscripcion.usuario?.name || '') }}
                            </span>
                          </div>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                            {{ inscripcion.usuario?.name || 'Usuario desconocido' }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {{ inscripcion.usuario?.email }}
                          </div>
                          @if (inscripcion.usuario?.phone) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              📞 {{ inscripcion.usuario?.phone }}
                            </div>
                          }
                        </div>
                      </div>
                    </td>

                    @if (!planSeleccionado) {
                      <td class="hidden md:table-cell p-2">
                        <div class="max-w-xs">
                          <div class="text-sm text-gray-900 dark:text-white transition-colors duration-300 truncate">
                            {{ inscripcion.plan?.nombre || 'Plan no disponible' }}
                          </div>
                          <!-- NUEVA: Información del organizador -->
                          @if (inscripcion.plan?.organizador_principal?.nombre) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                              👤 {{ inscripcion.plan?.organizador_principal?.nombre }}
                            </div>
                          } @else if (inscripcion.plan?.emprendedor?.nombre) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                              👤 {{ inscripcion.plan?.emprendedor?.nombre }}
                            </div>
                          }
                        </div>
                      </td>
                    }

                    <td class="hidden sm:table-cell p-2">
                      <div class="flex items-center">
                        <svg class="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span class="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                          {{ inscripcion.numero_participantes }}
                        </span>
                      </div>
                    </td>

                    <td class="hidden lg:table-cell p-2">
                      <div class="text-sm">
                        @if (inscripcion.precio_pagado) {
                          <div class="font-semibold text-green-600 dark:text-green-400">
                            S/ {{ inscripcion.precio_pagado | number:'1.2-2' }}
                          </div>
                          @if (inscripcion.metodo_pago) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {{ inscripcion.metodo_pago }}
                            </div>
                          }
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400">Sin precio</span>
                        }
                      </div>
                    </td>

                    <td class="hidden lg:table-cell p-2">
                      <div class="text-sm">
                        @if (inscripcion.fecha_inscripcion) {
                          <div class="text-gray-900 dark:text-white transition-colors duration-300">
                            {{ inscripcion.fecha_inscripcion | date:'dd/MM/yyyy' }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            {{ inscripcion.fecha_inscripcion | date:'HH:mm' }}
                          </div>
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400">No disponible</span>
                        }
                      </div>
                    </td>

                    <td class="p-2">
                      <div class="flex flex-col space-y-1">
                        @switch (inscripcion.estado) {
                          @case ('pendiente') {
                            <span class="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
                              <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                              </svg>
                              Pendiente
                            </span>
                          }
                          @case ('confirmada') {
                            <span class="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200 transition-colors duration-300">
                              <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                              </svg>
                              Confirmada
                            </span>
                          }
                          @case ('cancelada') {
                            <span class="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-200 transition-colors duration-300">
                              <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                              </svg>
                              Cancelada
                            </span>
                          }
                          @case ('completada') {
                            <span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-200 transition-colors duration-300">
                              <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                              </svg>
                              Completada
                            </span>
                          }
                          @case ('en_progreso') {
                            <span class="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200 transition-colors duration-300">
                              <svg class="h-3 w-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                              </svg>
                              En Progreso
                            </span>
                          }
                          @default {
                            <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                              {{ inscripcion.estado }}
                            </span>
                          }
                        }

                        <!-- NUEVA: Información de fechas del plan -->
                        @if (inscripcion.fecha_inicio_plan) {
                          <div class="text-xs text-gray-500 dark:text-gray-400">
                            🗓️ {{ inscripcion.fecha_inicio_plan | date:'dd/MM/yyyy' }}
                          </div>
                        }
                        @if (inscripcion.dias_para_inicio !== undefined) {
                          <div class="text-xs" 
                               [class.text-red-600]="inscripcion.dias_para_inicio <= 3"
                               [class.text-yellow-600]="inscripcion.dias_para_inicio > 3 && inscripcion.dias_para_inicio <= 7"
                               [class.text-green-600]="inscripcion.dias_para_inicio > 7">
                            @if (inscripcion.dias_para_inicio > 0) {
                              ⏰ En {{ inscripcion.dias_para_inicio }} días
                            } @else if (inscripcion.dias_para_inicio === 0) {
                              🚀 Hoy
                            } @else {
                              ✅ Iniciado
                            }
                          </div>
                        }
                      </div>
                    </td>

                    <td class="p-2 text-right">
                      <div class="flex items-center justify-end space-x-1">
                        <button
                          (click)="verDetalle(inscripcion)"
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Ver detalle"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </button>

                        @if (inscripcion.estado === 'pendiente') {
                          <button
                            (click)="confirmarInscripcion(inscripcion)"
                            class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-300 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Confirmar inscripción"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </button>
                        }

                        @if (inscripcion.estado === 'confirmada' || inscripcion.estado === 'en_progreso') {
                          <button
                            (click)="marcarCompletada(inscripcion)"
                            class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300 p-1 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Marcar como completada"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </button>
                        }

                        @if (inscripcion.estado !== 'completada' && inscripcion.estado !== 'cancelada') {
                          <button
                            (click)="cancelarInscripcion(inscripcion)"
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Cancelar inscripción"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (pagination) {
            <div class="bg-white dark:bg-gray-800 p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div class="flex sm:flex-1 sm:flex sm:items-center sm:justify-between flex-col sm:flex-row">
                <div>
                  <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span class="hidden sm:inline">Mostrando</span> <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> inscripciones
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

    <!-- Modal para detalle de inscripción mejorado -->
    @if (inscripcionSeleccionada) {
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4" (click)="cerrarModal()">
        <div class="relative top-10 mx-auto border w-full max-w-4xl shadow-lg rounded-lg bg-white dark:bg-gray-800 transition-colors duration-300" (click)="$event.stopPropagation()">
          
          <!-- Header del modal -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Detalle de Inscripción</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ID: #{{ inscripcionSeleccionada.id }} • {{ inscripcionSeleccionada.fecha_inscripcion | date:'dd/MM/yyyy HH:mm' }}
              </p>
            </div>
            <button
              (click)="cerrarModal()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Contenido del modal -->
          <div class="p-6 max-h-96 overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Información del usuario -->
              <div class="space-y-4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  👤 Información del Usuario
                </h4>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre:</span>
                    <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.usuario?.name || 'No disponible' }}</p>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                    <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.usuario?.email || 'No disponible' }}</p>
                  </div>
                  @if (inscripcionSeleccionada.usuario?.phone) {
                    <div>
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono:</span>
                      <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.usuario?.phone }}</p>
                    </div>
                  }
                </div>
              </div>
              
              <!-- Información del plan -->
              <div class="space-y-4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  🎯 Información del Plan
                </h4>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Plan:</span>
                    <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.plan?.nombre || 'No disponible' }}</p>
                  </div>
                  @if (inscripcionSeleccionada.plan?.organizador_principal?.nombre) {
                    <div>
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Organizador Principal:</span>
                      <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.plan?.organizador_principal?.nombre }}</p>
                    </div>
                  } @else if (inscripcionSeleccionada.plan?.emprendedor?.nombre) {
                    <div>
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Emprendedor:</span>
                      <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.plan?.emprendedor?.nombre }}</p>
                    </div>
                  }
                  @if (inscripcionSeleccionada.plan?.duracion_dias) {
                    <div>
                      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Duración:</span>
                      <p class="text-sm text-gray-900 dark:text-white">{{ inscripcionSeleccionada.plan?.duracion_dias }} días</p>
                    </div>
                  }
                </div>
              </div>
            </div>
            
            <!-- Detalles de la inscripción -->
            <div class="mt-6 space-y-4">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                📋 Detalles de la Inscripción
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Participantes:</span>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ inscripcionSeleccionada.numero_participantes }}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                  <p class="text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': inscripcionSeleccionada.estado === 'pendiente',
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': inscripcionSeleccionada.estado === 'confirmada',
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': inscripcionSeleccionada.estado === 'en_progreso',
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': inscripcionSeleccionada.estado === 'completada',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': inscripcionSeleccionada.estado === 'cancelada'
                          }">
                      {{ inscripcionSeleccionada.estado | titlecase }}
                    </span>
                  </p>
                </div>
                @if (inscripcionSeleccionada.precio_pagado) {
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Precio Pagado:</span>
                    <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                      S/ {{ inscripcionSeleccionada.precio_pagado | number:'1.2-2' }}
                    </p>
                  </div>
                }
              </div>
              
              @if (inscripcionSeleccionada.metodo_pago) {
                <div>
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Método de pago:</span>
                  <p class="text-sm text-gray-900 dark:text-white capitalize">{{ inscripcionSeleccionada.metodo_pago }}</p>
                </div>
              }
              
              <!-- Fechas del plan -->
              @if (inscripcionSeleccionada.fecha_inicio_plan || inscripcionSeleccionada.fecha_fin_plan) {
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">📅 Fechas del Plan</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @if (inscripcionSeleccionada.fecha_inicio_plan) {
                      <div>
                        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Inicio:</span>
                        <p class="text-sm text-blue-800 dark:text-blue-200">{{ inscripcionSeleccionada.fecha_inicio_plan | date:'dd/MM/yyyy' }}</p>
                      </div>
                    }
                    @if (inscripcionSeleccionada.fecha_fin_plan) {
                      <div>
                        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Fin:</span>
                        <p class="text-sm text-blue-800 dark:text-blue-200">{{ inscripcionSeleccionada.fecha_fin_plan | date:'dd/MM/yyyy' }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
              
              <!-- Notas y comentarios -->
              @if (inscripcionSeleccionada.notas_usuario || inscripcionSeleccionada.requerimientos_especiales || inscripcionSeleccionada.comentarios_adicionales) {
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h5 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">💬 Notas y Comentarios</h5>
                  
                  @if (inscripcionSeleccionada.notas_usuario) {
                    <div class="mb-3">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Notas del usuario:</span>
                      <p class="text-sm text-gray-900 dark:text-white mt-1 p-2 bg-white dark:bg-gray-800 rounded border">{{ inscripcionSeleccionada.notas_usuario }}</p>
                    </div>
                  }
                  
                  @if (inscripcionSeleccionada.requerimientos_especiales) {
                    <div class="mb-3">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Requerimientos especiales:</span>
                      <p class="text-sm text-gray-900 dark:text-white mt-1 p-2 bg-white dark:bg-gray-800 rounded border">{{ inscripcionSeleccionada.requerimientos_especiales }}</p>
                    </div>
                  }
                  
                  @if (inscripcionSeleccionada.comentarios_adicionales) {
                    <div>
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios adicionales:</span>
                      <p class="text-sm text-gray-900 dark:text-white mt-1 p-2 bg-white dark:bg-gray-800 rounded border">{{ inscripcionSeleccionada.comentarios_adicionales }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          
          <!-- Footer del modal con acciones -->
          <div class="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex space-x-2">
              @if (inscripcionSeleccionada.estado === 'pendiente') {
                <button
                  (click)="confirmarInscripcionDesdeModal()"
                  class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Confirmar
                </button>
              }
              
              @if (inscripcionSeleccionada.estado === 'confirmada' || inscripcionSeleccionada.estado === 'en_progreso') {
                <button
                  (click)="marcarCompletadaDesdeModal()"
                  class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Marcar Completada
                </button>
              }
              
              @if (inscripcionSeleccionada.estado !== 'completada' && inscripcionSeleccionada.estado !== 'cancelada') {
                <button
                  (click)="cancelarInscripcionDesdeModal()"
                  class="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancelar
                </button>
              }
            </div>
            
            <button
              (click)="cerrarModal()"
              class="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PlanesInscripcionesComponent implements OnInit {
  private planesService = inject(PlanesService);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pagination: PaginatedResponse<PlanInscripcion> | null = null;
  loading = true;
  currentPage = 1;
  inscripcionSeleccionada: PlanInscripcion | null = null;
  
  // NUEVAS propiedades
  planSeleccionado: Plan | null = null;
  planesDisponibles: Plan[] = [];
  estadisticasRapidas: any = null;
  
  filtros: InscripcionFiltros = {
    page: 1,
    per_page: 15
  };
  
  private filtroTimeout: any;

  ngOnInit() {
    // Verificar si venimos desde un plan específico
    this.route.queryParams.subscribe(params => {
      if (params['planId']) {
        const planId = +params['planId'];
        this.filtros.plan_id = planId;
        this.loadPlanSeleccionado(planId);
      }
    });
    
    this.loadPlanesDisponibles();
    this.loadInscripciones();
    this.loadEstadisticasRapidas();
  }

  // NUEVOS métodos
  loadPlanSeleccionado(planId: number) {
    this.planesService.getPlan(planId).subscribe({
      next: (plan) => {
        this.planSeleccionado = plan;
      },
      error: (error) => {
        console.error('Error al cargar plan seleccionado:', error);
      }
    });
  }

  loadPlanesDisponibles() {
    // Cargar lista de planes para el filtro
    this.planesService.getPlanes({ per_page: 100, estado: 'activo' }).subscribe({
      next: (response) => {
        this.planesDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al cargar planes disponibles:', error);
      }
    });
  }

  loadEstadisticasRapidas() {
    // Calcular estadísticas rápidas basadas en los filtros actuales
    const filtrosStats = { ...this.filtros };
    delete filtrosStats.page;
    delete filtrosStats.per_page;
    
    this.planesService.getAllInscripciones({ ...filtrosStats, per_page: 1000 }).subscribe({
      next: (response) => {
        const inscripciones = response.data;
        this.estadisticasRapidas = {
          total: inscripciones.length,
          pendientes: inscripciones.filter(i => i.estado === 'pendiente').length,
          confirmadas: inscripciones.filter(i => i.estado === 'confirmada').length,
          en_progreso: inscripciones.filter(i => i.estado === 'en_progreso').length,
          completadas: inscripciones.filter(i => i.estado === 'completada').length,
          canceladas: inscripciones.filter(i => i.estado === 'cancelada').length
        };
      },
      error: (error) => {
        console.error('Error al cargar estadísticas rápidas:', error);
      }
    });
  }

  getPageTitle(): string {
    if (this.planSeleccionado) {
      return `Inscripciones - ${this.planSeleccionado.nombre}`;
    }
    return 'Gestión de Inscripciones';
  }

  getPageSubtitle(): string {
    if (this.planSeleccionado) {
      return 'Administra las inscripciones de este plan específico';
    }
    return 'Administra todas las inscripciones a planes turísticos';
  }

  limpiarFiltroPlan() {
    this.planSeleccionado = null;
    this.filtros.plan_id = undefined;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'replace'
    });
    this.loadInscripciones();
    this.loadEstadisticasRapidas();
  }

  // Métodos de acción desde modal
  confirmarInscripcionDesdeModal() {
    if (this.inscripcionSeleccionada) {
      this.confirmarInscripcion(this.inscripcionSeleccionada);
    }
  }

  marcarCompletadaDesdeModal() {
    if (this.inscripcionSeleccionada) {
      this.marcarCompletada(this.inscripcionSeleccionada);
    }
  }

  cancelarInscripcionDesdeModal() {
    if (this.inscripcionSeleccionada) {
      this.cancelarInscripcion(this.inscripcionSeleccionada);
    }
  }

  // Métodos existentes mejorados
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  loadInscripciones() {
    this.loading = true;
    this.filtros.page = this.currentPage;
    
    this.planesService.getAllInscripciones(this.filtros).subscribe({
      next: (response) => {
        this.pagination = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.loading = false;
        alert('Error al cargar las inscripciones. Por favor, intente nuevamente.');
      }
    });
  }

  onFiltroChange() {
    // Debounce para evitar múltiples peticiones
    if (this.filtroTimeout) {
      clearTimeout(this.filtroTimeout);
    }
    
    this.filtroTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadInscripciones();
      this.loadEstadisticasRapidas();
    }, 500);
  }

  limpiarFiltros() {
    const planIdOriginal = this.filtros.plan_id; // Mantener plan seleccionado si existe
    
    this.filtros = {
      page: 1,
      per_page: 15
    };
    
    // Si había un plan seleccionado, mantenerlo
    if (this.planSeleccionado) {
      this.filtros.plan_id = planIdOriginal;
    }
    
    this.currentPage = 1;
    this.loadInscripciones();
    this.loadEstadisticasRapidas();
  }

  goToPage(page: number) {
    if (!this.pagination) return;

    if (page < 1 || page > this.pagination.last_page) {
      return;
    }

    this.currentPage = page;
    this.loadInscripciones();
  }

  isValidPageNumber(value: any): boolean {
    return !isNaN(+value);
  }

  getUserInitials(name: string): string {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  verDetalle(inscripcion: PlanInscripcion) {
    if (!inscripcion.id) return;
    
    // Cargar detalles completos de la inscripción
    this.planesService.getInscripcion(inscripcion.id).subscribe({
      next: (response) => {
        this.inscripcionSeleccionada = response;
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Error al cargar detalle de inscripción:', error);
        alert('Error al cargar el detalle de la inscripción.');
      }
    });
  }

  confirmarInscripcion(inscripcion: PlanInscripcion) {
    if (!inscripcion.id) return;

    // Modal personalizado para fechas
    const modalHtml = `
      <div style="font-family: system-ui; padding: 20px;">
        <h3 style="margin-bottom: 15px; color: #1f2937;">Confirmar Inscripción</h3>
        <p style="margin-bottom: 15px; color: #6b7280;">Ingresa las fechas del plan para ${inscripcion.usuario?.name}:</p>
        
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Fecha de inicio:</label>
          <input type="date" id="fechaInicio" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Fecha de fin (opcional):</label>
          <input type="date" id="fechaFin" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
        </div>
        
        <div style="text-align: right;">
          <button onclick="this.closest('div').parentElement.remove()" style="margin-right: 10px; padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
          <button onclick="confirmarConFechas()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer;">Confirmar</button>
        </div>
      </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHtml;
    modalDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    // Función global temporal para confirmar
    (window as any).confirmarConFechas = () => {
      const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement)?.value;
      const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement)?.value;
      
      if (!fechaInicio) {
        alert('La fecha de inicio es obligatoria');
        return;
      }

      const data: any = {
        estado: 'confirmada',
        fecha_inicio_plan: fechaInicio
      };
      
      if (fechaFin) {
        data.fecha_fin_plan = fechaFin;
      }

      this.planesService.updateInscripcion(inscripcion.id!, data).subscribe({
        next: (inscripcionActualizada) => {
          // Actualizar en la lista local
          Object.assign(inscripcion, inscripcionActualizada);
          
          // Actualizar en el modal si está abierto
          if (this.inscripcionSeleccionada?.id === inscripcion.id) {
            this.inscripcionSeleccionada = inscripcionActualizada;
          }
          
          alert('Inscripción confirmada correctamente');
          modalDiv.remove();
          delete (window as any).confirmarConFechas;
          
          // Recargar estadísticas
          this.loadEstadisticasRapidas();
        },
        error: (error) => {
          console.error('Error al confirmar inscripción:', error);
          alert('Error al confirmar la inscripción. Por favor, intente nuevamente.');
        }
      });
    };

    document.body.appendChild(modalDiv);
  }

  cancelarInscripcion(inscripcion: PlanInscripcion) {
    if (!inscripcion.id) return;

    const motivo = prompt('Motivo de la cancelación (opcional):');
    
    if (confirm(`¿Está seguro de cancelar la inscripción de ${inscripcion.usuario?.name}?`)) {
      this.planesService.cancelarInscripcion(inscripcion.id, motivo || undefined).subscribe({
        next: (inscripcionActualizada) => {
          // Actualizar en la lista local
          Object.assign(inscripcion, inscripcionActualizada);
          
          // Actualizar en el modal si está abierto
          if (this.inscripcionSeleccionada?.id === inscripcion.id) {
            this.inscripcionSeleccionada = inscripcionActualizada;
          }
          
          alert('Inscripción cancelada correctamente');
          
          // Recargar estadísticas
          this.loadEstadisticasRapidas();
        },
        error: (error) => {
          console.error('Error al cancelar inscripción:', error);
          alert('Error al cancelar la inscripción. Por favor, intente nuevamente.');
        }
      });
    }
  }

  marcarCompletada(inscripcion: PlanInscripcion) {
    if (!inscripcion.id) return;

    const comentarios = prompt('Comentarios finales sobre la experiencia (opcional):');
    
    if (confirm(`¿Está seguro de marcar como completada la inscripción de ${inscripcion.usuario?.name}?`)) {
      this.planesService.marcarCompletada(inscripcion.id, comentarios || undefined).subscribe({
        next: (inscripcionActualizada) => {
          // Actualizar en la lista local
          Object.assign(inscripcion, inscripcionActualizada);
          
          // Actualizar en el modal si está abierto
          if (this.inscripcionSeleccionada?.id === inscripcion.id) {
            this.inscripcionSeleccionada = inscripcionActualizada;
          }
          
          alert('Inscripción marcada como completada');
          
          // Recargar estadísticas
          this.loadEstadisticasRapidas();
        },
        error: (error) => {
          console.error('Error al marcar como completada:', error);
          alert('Error al marcar la inscripción como completada. Por favor, intente nuevamente.');
        }
      });
    }
  }

  cerrarModal() {
    this.inscripcionSeleccionada = null;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Método para navegar al detail del plan desde inscripciones
  verPlanDetalle(planId: number) {
    this.router.navigate(['/admin/planes', planId, 'detail']);
  }

  // Método para exportar inscripciones (funcionalidad futura)
  exportarInscripciones() {
    // Implementar exportación a Excel/CSV
    alert('Función de exportación - Próximamente disponible');
  }

  // Método para enviar recordatorio (funcionalidad futura)
  enviarRecordatorio(inscripcion: PlanInscripcion) {
    if (!inscripcion.usuario?.email) {
      alert('El usuario no tiene email registrado');
      return;
    }
    
    if (confirm(`¿Enviar recordatorio por email a ${inscripcion.usuario.name}?`)) {
      // Implementar envío de recordatorio
      alert('Función de envío de recordatorio - Próximamente disponible');
    }
  }

  // Cleanup al destruir el componente
  ngOnDestroy() {
    // Limpiar timeout
    if (this.filtroTimeout) {
      clearTimeout(this.filtroTimeout);
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
    
    // Limpiar función global temporal
    if ((window as any).confirmarConFechas) {
      delete (window as any).confirmarConFechas;
    }
  }
}