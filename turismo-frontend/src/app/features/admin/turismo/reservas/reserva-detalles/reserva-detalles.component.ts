import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, Reserva, ReservaServicio } from '../../../../../core/services/reservas.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-reserva-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      [title]="'Detalle de Reserva' + (reserva() ? ' - ' + reserva()!.codigo_reserva : '')" 
      subtitle="Información completa de la reserva"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Loading -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando información de la reserva...</p>
      </div>

      <!-- Reserva no encontrada -->
      <div *ngIf="!loading() && !reserva()" class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Reserva no encontrada</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            La reserva que estás buscando no existe o ha sido eliminada.
          </p>
          <div class="mt-6">
            <a 
              routerLink="/admin/reservas" 
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Volver a la lista de reservas
            </a>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="!loading() && reserva()" class="space-y-6">
        
        <!-- Información principal de la reserva -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Información de la Reserva</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Código: {{ reserva()!.codigo_reserva }}</p>
            </div>
            <div class="flex space-x-3">
              <a 
                [routerLink]="['/admin/reservas/edit', reserva()!.id]" 
                class="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </a>
              <a 
                routerLink="/admin/reservas" 
                class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver
              </a>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2">
                <!-- Información básica -->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h3>
                    <p class="mt-1 text-sm text-gray-900 dark:text-white">
                      {{ reserva()!.usuario?.name || 'Cliente no registrado' }}
                      <span *ngIf="reserva()!.usuario?.email" class="block text-xs text-gray-500 dark:text-gray-400">
                        {{ reserva()!.usuario?.email }}
                      </span>
                      <span *ngIf="reserva()!.usuario?.phone" class="block text-xs text-gray-500 dark:text-gray-400">
                        {{ reserva()!.usuario?.phone }}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
                    <div class="mt-1 flex items-center">
                      <span [class]="getEstadoClasse(reserva()!.estado)" class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                        {{ getEstadoTexto(reserva()!.estado) }}
                      </span>
                      
                      <!-- Botón para cambiar estado -->
                      <div class="relative ml-2">
                        <button 
                          (click)="toggleEstadoMenu($event)"
                          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          title="Cambiar estado"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                        
                        <!-- Menú desplegable para cambiar estado -->
                        <div *ngIf="estadoMenuOpen()" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200">
                          <div class="py-1">
                            <button 
                              class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                              (click)="cambiarEstado('pendiente')"
                              [disabled]="reserva()!.estado === 'pendiente'"
                              [class.opacity-50]="reserva()!.estado === 'pendiente'"
                              [class.cursor-not-allowed]="reserva()!.estado === 'pendiente'"
                            >
                              Pendiente
                            </button>
                            <button 
                              class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                              (click)="cambiarEstado('confirmada')"
                              [disabled]="reserva()!.estado === 'confirmada'"
                              [class.opacity-50]="reserva()!.estado === 'confirmada'"
                              [class.cursor-not-allowed]="reserva()!.estado === 'confirmada'"
                            >
                              Confirmada
                            </button>
                            <button 
                              class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                              (click)="cambiarEstado('cancelada')"
                              [disabled]="reserva()!.estado === 'cancelada'"
                              [class.opacity-50]="reserva()!.estado === 'cancelada'"
                              [class.cursor-not-allowed]="reserva()!.estado === 'cancelada'"
                            >
                              Cancelada
                            </button>
                            <button 
                              class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                              (click)="cambiarEstado('completada')"
                              [disabled]="reserva()!.estado === 'completada'"
                              [class.opacity-50]="reserva()!.estado === 'completada'"
                              [class.cursor-not-allowed]="reserva()!.estado === 'completada'"
                            >
                              Completada
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Reserva</h3>
                    <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatearFecha(reserva()!.created_at!) }}</p>
                  </div>
                  
                  <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Última Actualización</h3>
                    <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatearFecha(reserva()!.updated_at!) }}</p>
                  </div>
                </div>
                
                <!-- Notas -->
                <div *ngIf="reserva()!.notas" class="mb-6">
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notas Generales</h3>
                  <p class="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{{ reserva()!.notas }}</p>
                </div>
                
                <!-- Acciones -->
                <div class="flex space-x-3">
                  <button 
                    (click)="imprimirReserva()"
                    class="inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Imprimir
                  </button>
                  <button 
                    (click)="mostrarConfirmacionEliminacion.set(true)"
                    class="inline-flex items-center rounded-md bg-red-100 dark:bg-red-900 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                  >
                    <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
              
              <!-- Panel lateral con resumen -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Resumen</h3>
                
                <div class="space-y-4">
                  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors duration-200">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Servicios</dt>
                    <dd class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ reserva()!.servicios?.length || 0 }}</dd>
                  </div>
                  
                  <div *ngIf="totalReserva() > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors duration-200">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Estimado</dt>
                    <dd class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">S/ {{ totalReserva().toFixed(2) }}</dd>
                  </div>

                  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors duration-200">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Estados de Servicios</dt>
                    <dd class="mt-1 space-y-1">
                      <div *ngFor="let estado of estadosServicios()" class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-300">{{ getEstadoServicioTexto(estado.estado) }}:</span>
                        <span class="font-medium text-gray-900 dark:text-white">{{ estado.cantidad }}</span>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Servicios reservados -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Servicios Reservados</h2>
          </div>
          
          <div *ngIf="!reserva()!.servicios || reserva()!.servicios!.length === 0" class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay servicios reservados</h3>
            <div class="mt-6">
              <a 
                [routerLink]="['/admin/reservas/edit', reserva()!.id]" 
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Añadir servicios
              </a>
            </div>
          </div>

          <div *ngIf="reserva()!.servicios && reserva()!.servicios!.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicio</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Emprendedor</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Horario</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let servicio of reserva()!.servicios; trackBy: trackByServicio" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ servicio.servicio?.nombre || 'Servicio no disponible' }}
                    </div>
                    <div *ngIf="servicio.servicio?.descripcion" class="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {{ servicio.servicio?.descripcion }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ servicio.emprendedor?.nombre || 'Emprendedor no disponible' }}
                    </div>
                    <div *ngIf="servicio.emprendedor?.telefono" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ servicio.emprendedor?.telefono }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ formatearFecha(servicio.fecha_inicio) }}</div>
                    <div *ngIf="servicio.fecha_fin && servicio.fecha_inicio !== servicio.fecha_fin" class="text-xs text-gray-500 dark:text-gray-400">
                      hasta {{ formatearFecha(servicio.fecha_fin) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">
                      {{ formatearHora(servicio.hora_inicio) }} - {{ formatearHora(servicio.hora_fin) }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ servicio.duracion_minutos }} min.
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getEstadoServicioClasse(servicio.estado)" class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium">
                      {{ getEstadoServicioTexto(servicio.estado) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="text-gray-900 dark:text-white">S/ {{ (servicio.precio || 0).toFixed(2) }}</div>
                    <div *ngIf="servicio.cantidad && servicio.cantidad > 1" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ servicio.cantidad }} unidades
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="relative inline-block text-left">
                      <button 
                        (click)="toggleServicioEstadoMenu(servicio, $event)"
                        class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                        title="Cambiar estado"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                      </button>
                      
                      <!-- Menú desplegable para cambiar estado del servicio -->
                      <div *ngIf="servicioEstadoMenuOpen() && servicioSeleccionado()?.id === servicio.id"
                           class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200">
                        <div class="py-1">
                          <button 
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                            (click)="cambiarEstadoServicio(servicio, 'pendiente')"
                            [disabled]="servicio.estado === 'pendiente'"
                            [class.opacity-50]="servicio.estado === 'pendiente'"
                            [class.cursor-not-allowed]="servicio.estado === 'pendiente'"
                          >
                            Pendiente
                          </button>
                          <button 
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                            (click)="cambiarEstadoServicio(servicio, 'confirmado')"
                            [disabled]="servicio.estado === 'confirmado'"
                            [class.opacity-50]="servicio.estado === 'confirmado'"
                            [class.cursor-not-allowed]="servicio.estado === 'confirmado'"
                          >
                            Confirmado
                          </button>
                          <button 
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                            (click)="cambiarEstadoServicio(servicio, 'cancelado')"
                            [disabled]="servicio.estado === 'cancelado'"
                            [class.opacity-50]="servicio.estado === 'cancelado'"
                            [class.cursor-not-allowed]="servicio.estado === 'cancelado'"
                          >
                            Cancelado
                          </button>
                          <button 
                            class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200" 
                            (click)="cambiarEstadoServicio(servicio, 'completado')"
                            [disabled]="servicio.estado === 'completado'"
                            [class.opacity-50]="servicio.estado === 'completado'"
                            [class.cursor-not-allowed]="servicio.estado === 'completado'"
                          >
                            Completado
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <td colspan="5" class="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">Total:</td>
                  <td class="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">S/ {{ totalReserva().toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Notas de servicios -->
          <div *ngIf="reserva()!.servicios && tieneNotasServicios()" class="border-t border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Notas de Servicios</h3>
            <div class="space-y-4">
              <div *ngFor="let servicio of reserva()!.servicios" class="space-y-2">
                <div *ngIf="servicio.notas_cliente || servicio.notas_emprendedor">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ servicio.servicio?.nombre }}</h4>
                  <div *ngIf="servicio.notas_cliente" class="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <span class="font-medium">Cliente:</span> {{ servicio.notas_cliente }}
                  </div>
                  <div *ngIf="servicio.notas_emprendedor" class="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    <span class="font-medium">Emprendedor:</span> {{ servicio.notas_emprendedor }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Historial de cambios -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Historial de Cambios</h2>
          </div>
          
          <div class="p-6">
            <div class="flow-root">
              <ul class="-mb-8">
                <!-- Evento de creación -->
                <li>
                  <div class="relative pb-8">
                    <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600" aria-hidden="true"></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-500 dark:text-gray-400">Reserva creada con estado <span class="font-medium text-gray-900 dark:text-white">{{ getEstadoTexto(reserva()!.estado) }}</span></p>
                        </div>
                        <div class="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {{ formatearFecha(reserva()!.created_at!) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                
                <!-- Estado actual -->
                <li>
                  <div class="relative pb-8">
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-500 dark:text-gray-400">Estado actual <span class="font-medium text-gray-900 dark:text-white">{{ getEstadoTexto(reserva()!.estado) }}</span></p>
                        </div>
                        <div class="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {{ formatearFecha(reserva()!.updated_at!) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar -->
      <div *ngIf="mostrarConfirmacionEliminacion()" 
           class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 transition-colors duration-200">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">Eliminar Reserva</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              (click)="eliminarReserva()"
              [disabled]="eliminandoReserva()"
            >
              <span *ngIf="!eliminandoReserva()">Eliminar</span>
              <span *ngIf="eliminandoReserva()" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </span>
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
              (click)="mostrarConfirmacionEliminacion.set(false)"
              [disabled]="eliminandoReserva()"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReservaDetailComponent implements OnInit {
  private reservasService = inject(ReservasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Signals
  loading = signal<boolean>(false);
  reserva = signal<Reserva | null>(null);
  estadoMenuOpen = signal<boolean>(false);
  servicioEstadoMenuOpen = signal<boolean>(false);
  servicioSeleccionado = signal<ReservaServicio | null>(null);
  mostrarConfirmacionEliminacion = signal<boolean>(false);
  eliminandoReserva = signal<boolean>(false);

  // Computed values
  totalReserva = computed(() => {
    const reservaActual = this.reserva();
    if (!reservaActual?.servicios) return 0;
    
    return reservaActual.servicios.reduce((total, servicio) => {
      return total + (servicio.precio || 0) * (servicio.cantidad || 1);
    }, 0);
  });

  estadosServicios = computed(() => {
    const reservaActual = this.reserva();
    if (!reservaActual?.servicios) return [];

    const contadores: { [key: string]: number } = {};
    reservaActual.servicios.forEach(servicio => {
      contadores[servicio.estado] = (contadores[servicio.estado] || 0) + 1;
    });

    return Object.entries(contadores).map(([estado, cantidad]) => ({
      estado,
      cantidad
    }));
  });

  private reservaId: number = 0;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.reservaId = +idParam;
      this.cargarReserva();
    } else {
      this.loading.set(false);
    }

    // Escuchar clics fuera para cerrar menús
    document.addEventListener('click', this.cerrarMenus.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.cerrarMenus.bind(this));
  }

  cerrarMenus() {
    this.estadoMenuOpen.set(false);
    this.servicioEstadoMenuOpen.set(false);
    this.servicioSeleccionado.set(null);
  }

  cargarReserva() {
    this.loading.set(true);
    
    this.reservasService.getReserva(this.reservaId).subscribe({
      next: (reserva) => {
        this.reserva.set(reserva);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar la reserva:', error);
        this.loading.set(false);
      }
    });
  }

  toggleEstadoMenu(event: Event) {
    event.stopPropagation();
    this.estadoMenuOpen.set(!this.estadoMenuOpen());
    this.servicioEstadoMenuOpen.set(false);
    this.servicioSeleccionado.set(null);
  }

  toggleServicioEstadoMenu(servicio: ReservaServicio, event: Event) {
    event.stopPropagation();
    
    if (this.servicioEstadoMenuOpen() && this.servicioSeleccionado()?.id === servicio.id) {
      this.servicioEstadoMenuOpen.set(false);
      this.servicioSeleccionado.set(null);
    } else {
      this.servicioEstadoMenuOpen.set(true);
      this.servicioSeleccionado.set(servicio);
      this.estadoMenuOpen.set(false);
    }
  }

  cambiarEstado(nuevoEstado: string) {
    const reservaActual = this.reserva();
    if (!reservaActual?.id || reservaActual.estado === nuevoEstado) return;

    this.estadoMenuOpen.set(false);

    this.reservasService.cambiarEstadoReserva(reservaActual.id, nuevoEstado).subscribe({
      next: (reservaActualizada) => {
        this.reserva.set(reservaActualizada);
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la reserva:', error);
        alert('Error al cambiar el estado de la reserva. Por favor, intente nuevamente.');
      }
    });
  }

  cambiarEstadoServicio(servicio: ReservaServicio, nuevoEstado: string) {
    if (!servicio.id || servicio.estado === nuevoEstado) return;

    this.servicioEstadoMenuOpen.set(false);
    this.servicioSeleccionado.set(null);

    this.reservasService.cambiarEstadoServicioReserva(servicio.id, nuevoEstado).subscribe({
      next: (servicioActualizado) => {
        const reservaActual = this.reserva();
        if (reservaActual?.servicios) {
          const index = reservaActual.servicios.findIndex(s => s.id === servicio.id);
          if (index !== -1) {
            reservaActual.servicios[index] = servicioActualizado;
            this.reserva.set({ ...reservaActual });
          }
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del servicio:', error);
        alert('Error al cambiar el estado del servicio. Por favor, intente nuevamente.');
      }
    });
  }

  eliminarReserva() {
    const reservaActual = this.reserva();
    if (!reservaActual?.id) return;

    this.eliminandoReserva.set(true);

    this.reservasService.deleteReserva(reservaActual.id).subscribe({
      next: () => {
        this.mostrarConfirmacionEliminacion.set(false);
        this.eliminandoReserva.set(false);
        this.router.navigate(['/admin/reservas']);
      },
      error: (error) => {
        console.error('Error al eliminar la reserva:', error);
        this.eliminandoReserva.set(false);
        alert('Error al eliminar la reserva. Por favor, intente nuevamente.');
      }
    });
  }

  imprimirReserva() {
    window.print();
  }

  tieneNotasServicios(): boolean {
    const reservaActual = this.reserva();
    if (!reservaActual?.servicios) return false;
    
    return reservaActual.servicios.some(s => s.notas_cliente || s.notas_emprendedor);
  }

  // Métodos de utilidad
  trackByServicio(index: number, servicio: ReservaServicio): number {
    return servicio.id || index;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return 'N/A';
    return hora.substring(0, 5); // HH:MM
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

  getEstadoServicioClasse(estado: string): string {
    const clases = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'confirmado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'completado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }

  getEstadoServicioTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}