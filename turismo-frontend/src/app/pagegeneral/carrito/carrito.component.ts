import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { AuthService } from '../../core/services/auth.service';
import { Reserva, ReservaServicio } from '../../core/models/user.model';

interface ServicioAgrupado {
  servicioId: number;
  servicio: any;
  emprendedor: any;
  horarios: {
    id: number;
    fecha_inicio: string;
    hora_inicio: string;
    hora_fin: string;
    duracion_minutos: number;
    notas_cliente?: string;
  }[];
  imagen?: string;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div class="container mx-auto px-4 py-8">
        <!-- Header del carrito -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Carrito de Planes Turísticos
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Revisa y confirma tus planes de turismo seleccionados
          </p>
        </div>

        <!-- Loading state -->
        <div *ngIf="carritoService.isLoading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando carrito...</p>
        </div>

        <!-- Carrito vacío -->
        <div *ngIf="!carritoService.isLoading() && !carritoService.tieneItems()" 
             class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
          </svg>
          <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Tu carrito está vacío
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Explora nuestros servicios turísticos y agrega planes a tu carrito
          </p>
          <button routerLink="/servicios" 
                  class="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            Explorar Servicios
          </button>
        </div>

        <!-- Contenido del carrito -->
        <div *ngIf="!carritoService.isLoading() && carritoService.tieneItems()" class="grid lg:grid-cols-3 gap-8">
          <!-- Lista de servicios agrupados -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div class="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <h2 class="text-xl font-semibold flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  Servicios seleccionados ({{ carritoService.totalServicios() }})
                </h2>
              </div>
              
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <div *ngFor="let servicioGroup of serviciosAgrupados(); trackBy: trackByServicioId" 
                     class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300">
                  
                  <!-- Información del servicio agrupado -->
                  <div class="flex flex-col lg:flex-row lg:items-start gap-6">
                    <!-- Imagen del servicio -->
                    <div class="flex-shrink-0">
                      <div class="relative group">
                        <img *ngIf="servicioGroup.imagen; else placeholderImage" 
                             [src]="servicioGroup.imagen" 
                             [alt]="servicioGroup.servicio?.nombre"
                             class="w-32 h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                             (error)="onImageError($event)">
                        <ng-template #placeholderImage>
                          <div class="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                            <svg class="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                        </ng-template>
                        <!-- Badge de cantidad de horarios -->
                        <div class="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          {{ servicioGroup.horarios.length }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Detalles del servicio -->
                    <div class="flex-grow">
                      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div class="flex-grow">
                          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            {{ servicioGroup.servicio?.nombre || 'Servicio' }}
                            <span class="text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                              {{ servicioGroup.horarios.length }} horario{{ servicioGroup.horarios.length > 1 ? 's' : '' }}
                            </span>
                          </h3>
                          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            {{ servicioGroup.emprendedor?.nombre }}
                          </p>
                          
                          <!-- Lista de horarios -->
                          <div class="space-y-3">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Horarios seleccionados:
                            </h4>
                            <div class="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
                              <div *ngFor="let horario of servicioGroup.horarios; trackBy: trackByHorarioId" 
                                   class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-primary-500">
                                <div class="flex flex-col gap-2">
                                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="font-medium">{{ formatearFecha(horario.fecha_inicio) }}</span>
                                  </div>
                                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>{{ horario.hora_inicio }} - {{ horario.hora_fin }}</span>
                                    <span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                                      {{ horario.duracion_minutos }}min
                                    </span>
                                  </div>
                                  
                                  <!-- Notas del cliente -->
                                  <div *ngIf="horario.notas_cliente" class="mt-2">
                                    <p class="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                      <span class="font-medium">Notas:</span> {{ horario.notas_cliente }}
                                    </p>
                                  </div>
                                  
                                  <!-- Botón para eliminar horario específico -->
                                  <div class="flex justify-end mt-2">
                                    <button (click)="eliminarDelCarrito(horario.id)" 
                                            [disabled]="isRemoving()"
                                            class="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors duration-200 disabled:opacity-50 flex items-center gap-1">
                                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Acciones del servicio completo -->
                        <div class="flex flex-col items-end gap-2 lg:ml-4">
                          <button (click)="eliminarServicioCompleto(servicioGroup.servicioId)" 
                                  [disabled]="isRemoving()"
                                  class="btn-danger px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Eliminar todo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumen del carrito -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg sticky top-24 overflow-hidden">
              <div class="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Resumen de Reserva
                </h3>
              </div>
              
              <div class="p-6">
                <!-- Estadísticas -->
                <div class="space-y-4 mb-6">
                  <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Servicios únicos:
                    </span>
                    <span class="font-bold text-primary-600 dark:text-primary-400 text-lg">{{ serviciosAgrupados().length }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Total horarios:
                    </span>
                    <span class="font-bold text-primary-600 dark:text-primary-400 text-lg">{{ carritoService.totalServicios() }}</span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span class="text-gray-600 dark:text-gray-400">Estado:</span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Pendiente
                    </span>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div class="space-y-3">
                  <button (click)="confirmarReserva()" 
                          [disabled]="isConfirming() || carritoService.isLoading()"
                          class="btn-primary w-full py-4 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none shadow-lg">
                    <span *ngIf="!isConfirming()" class="flex items-center justify-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Confirmar Reserva
                    </span>
                    <span *ngIf="isConfirming()" class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirmando...
                    </span>
                  </button>
                  
                  <button (click)="vaciarCarrito()" 
                          [disabled]="isClearing() || carritoService.isLoading()"
                          class="btn-secondary w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none">
                    <span *ngIf="!isClearing()" class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Vaciar Carrito
                    </span>
                    <span *ngIf="isClearing()">Vaciando...</span>
                  </button>
                </div>
                
                <!-- Continuar comprando -->
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button routerLink="/servicios" 
                          class="w-full text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Continuar agregando servicios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de error -->
        <div *ngIf="errorMessage()" 
             class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
          <div class="flex">
            <svg class="flex-shrink-0 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-200 font-medium">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de éxito -->
        <div *ngIf="successMessage()" 
             class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-pulse">
          <div class="flex">
            <svg class="flex-shrink-0 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-green-800 dark:text-green-200 font-medium">{{ successMessage() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
    
    .sticky {
      position: sticky;
    }

    /* Esquema de colores dinámico */
    :host {
      --primary-50: theme('colors.orange.50');
      --primary-100: theme('colors.orange.100');
      --primary-200: theme('colors.orange.200');
      --primary-300: theme('colors.orange.300');
      --primary-400: theme('colors.orange.400');
      --primary-500: theme('colors.orange.500');
      --primary-600: theme('colors.orange.600');
      --primary-700: theme('colors.orange.700');
      --primary-800: theme('colors.orange.800');
      --primary-900: theme('colors.orange.900');
    }

    :host-context(.dark) {
      --primary-50: theme('colors.blue.50');
      --primary-100: theme('colors.blue.100');
      --primary-200: theme('colors.blue.200');
      --primary-300: theme('colors.blue.300');
      --primary-400: theme('colors.blue.400');
      --primary-500: theme('colors.blue.500');
      --primary-600: theme('colors.blue.600');
      --primary-700: theme('colors.blue.700');
      --primary-800: theme('colors.blue.800');
      --primary-900: theme('colors.blue.900');
    }

    .border-primary-500 {
      border-color: var(--primary-500);
    }

    .text-primary-600 {
      color: var(--primary-600);
    }

    .text-primary-400 {
      color: var(--primary-400);
    }

    .text-primary-500 {
      color: var(--primary-500);
    }

    .text-primary-700 {
      color: var(--primary-700);
    }

    .text-primary-300 {
      color: var(--primary-300);
    }

    .text-primary-800 {
      color: var(--primary-800);
    }

    .text-primary-200 {
      color: var(--primary-200);
    }

    .bg-primary-600 {
      background-color: var(--primary-600);
    }

    .bg-primary-500 {
      background-color: var(--primary-500);
    }

    .bg-primary-400 {
      background-color: var(--primary-400);
    }

    .bg-primary-100 {
      background-color: var(--primary-100);
    }

    .bg-primary-900 {
      background-color: var(--primary-900);
    }

    .from-primary-400 {
      --tw-gradient-from: var(--primary-400);
    }

    .to-primary-600 {
      --tw-gradient-to: var(--primary-600);
    }

    .from-primary-500 {
      --tw-gradient-from: var(--primary-500);
    }

    .hover\\:text-primary-700:hover {
      color: var(--primary-700);
    }

    .hover\\:text-primary-300:hover {
      color: var(--primary-300);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .btn-primary:disabled {
      background: #9CA3AF;
      box-shadow: none;
    }

    .btn-secondary {
      background-color: #F3F4F6;
      color: #374151;
      border: 1px solid #D1D5DB;
    }

    :host-context(.dark) .btn-secondary {
      background-color: #374151;
      color: #F3F4F6;
      border-color: #4B5563;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #E5E7EB;
      border-color: #9CA3AF;
    }

    :host-context(.dark) .btn-secondary:hover:not(:disabled) {
      background-color: #4B5563;
      border-color: #6B7280;
    }

    .btn-danger {
      background-color: #EF4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #DC2626;
    }
  `]
})
export class CarritoComponent implements OnInit {
  carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  
  // Signals para el estado del componente
  private readonly _isConfirming = signal(false);
  private readonly _isClearing = signal(false);
  private readonly _isRemoving = signal(false);
  private readonly _errorMessage = signal<string>('');
  private readonly _successMessage = signal<string>('');
  
  // Signals públicos readonly
  readonly isConfirming = this._isConfirming.asReadonly();
  readonly isClearing = this._isClearing.asReadonly();
  readonly isRemoving = this._isRemoving.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();

  // Computed para agrupar servicios
  readonly serviciosAgrupados = computed(() => {
    const items = this.carritoService.carritoItems();
    const grupos = new Map<number, ServicioAgrupado>();

    items.forEach(item => {
      const servicioId = item.servicio?.id || item.servicio_id;
      if (!servicioId) return;

      if (!grupos.has(servicioId)) {
        grupos.set(servicioId, {
          servicioId,
          servicio: item.servicio,
          emprendedor: item.emprendedor,
          horarios: [],
          imagen: this.obtenerImagenServicio(item.servicio)
        });
      }

      const grupo = grupos.get(servicioId)!;
      grupo.horarios.push({
        id: item.id!,
        fecha_inicio: item.fecha_inicio,
        hora_inicio: item.hora_inicio,
        hora_fin: item.hora_fin,
        duracion_minutos: item.duracion_minutos,
        notas_cliente: item.notas_cliente
      });
    });

    // Ordenar horarios por fecha y hora
    grupos.forEach(grupo => {
      grupo.horarios.sort((a, b) => {
        const fechaA = new Date(`${a.fecha_inicio}T${a.hora_inicio}`);
        const fechaB = new Date(`${b.fecha_inicio}T${b.hora_inicio}`);
        return fechaA.getTime() - fechaB.getTime();
      });
    });

    return Array.from(grupos.values());
  });

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login?redirect=/carrito';
      return;
    }

    // Cargar el carrito
    this.cargarCarrito();
  }

  private cargarCarrito() {
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito) => {
        console.log('Carrito cargado:', carrito);
      },
      error: (error) => {
        console.error('Error al cargar carrito:', error);
        this._errorMessage.set(error.message || 'Error al cargar el carrito');
      }
    });
  }

  private obtenerImagenServicio(servicio: any): string | undefined {
    if (!servicio) return undefined;
    
    // Intentar diferentes propiedades donde podría estar la imagen
    const posiblesImagenes = [
      servicio.imagen,
      servicio.imagen_url,
      servicio.foto,
      servicio.foto_url,
      servicio.images?.[0],
      servicio.imagenes?.[0]
    ];

    for (const imagen of posiblesImagenes) {
      if (imagen && typeof imagen === 'string') {
        // Si es una URL completa, devolverla tal como está
        if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
          return imagen;
        }
        // Si es una ruta relativa, construir la URL completa
        if (imagen.startsWith('/')) {
          return `${window.location.origin}${imagen}`;
        }
        // Si no tiene protocolo, asumir que es una ruta relativa
        return `${window.location.origin}/${imagen}`;
      }
    }

    return undefined;
  }

  eliminarDelCarrito(itemId: number) {
    if (!itemId) {
      this._errorMessage.set('ID de servicio no válido');
      return;
    }

    this._isRemoving.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.eliminarDelCarrito(itemId).subscribe({
      next: (response) => {
        this._successMessage.set('Horario eliminado del carrito');
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this._successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error al eliminar del carrito:', error);
        this._errorMessage.set(error.message || 'Error al eliminar el horario');
      },
      complete: () => {
        this._isRemoving.set(false);
      }
    });
  }

  eliminarServicioCompleto(servicioId: number) {
    const servicioGroup = this.serviciosAgrupados().find(g => g.servicioId === servicioId);
    if (!servicioGroup) return;

    const nombreServicio = servicioGroup.servicio?.nombre || 'este servicio';
    const cantidadHorarios = servicioGroup.horarios.length;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar "${nombreServicio}" con todos sus ${cantidadHorarios} horario${cantidadHorarios > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) {
      return;
    }

    this._isRemoving.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    // Eliminar todos los horarios de este servicio
    const promesasEliminacion = servicioGroup.horarios.map(horario => 
      this.carritoService.eliminarDelCarrito(horario.id).toPromise()
    );

    Promise.all(promesasEliminacion)
      .then(() => {
        this._successMessage.set(`Servicio "${nombreServicio}" eliminado completamente del carrito`);
        setTimeout(() => this._successMessage.set(''), 3000);
      })
      .catch((error) => {
        console.error('Error al eliminar servicio completo:', error);
        this._errorMessage.set('Error al eliminar el servicio completo');
      })
      .finally(() => {
        this._isRemoving.set(false);
      });
  }

  confirmarReserva() {
    this._isConfirming.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.confirmarReserva().subscribe({
      next: (response) => {
        this._successMessage.set('¡Reserva confirmada exitosamente!');
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          window.location.href = '/admin/reservas/mis-reservas';
        }, 2000);
      },
      error: (error) => {
        console.error('Error al confirmar reserva:', error);
        this._errorMessage.set(error.message || 'Error al confirmar la reserva');
      },
      complete: () => {
        this._isConfirming.set(false);
      }
    });
  }

  vaciarCarrito() {
    const totalServicios = this.serviciosAgrupados().length;
    const totalHorarios = this.carritoService.totalServicios();
    
    if (!confirm(`¿Estás seguro de que quieres vaciar todo el carrito? Se eliminarán ${totalServicios} servicio${totalServicios > 1 ? 's' : ''} con ${totalHorarios} horario${totalHorarios > 1 ? 's' : ''} en total. Esta acción no se puede deshacer.`)) {
      return;
    }

    this._isClearing.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.vaciarCarrito().subscribe({
      next: (response) => {
        this._successMessage.set('Carrito vaciado exitosamente');
      },
      error: (error) => {
        console.error('Error al vaciar carrito:', error);
        this._errorMessage.set(error.message || 'Error al vaciar el carrito');
      },
      complete: () => {
        this._isClearing.set(false);
      }
    });
  }

  // Función para trackear servicios agrupados en ngFor
  trackByServicioId(index: number, item: ServicioAgrupado): number {
    return item.servicioId;
  }

  // Función para trackear horarios en ngFor
  trackByHorarioId(index: number, horario: any): number {
    return horario.id || index;
  }

  // Función para formatear fechas
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      const hoy = new Date();
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);

      // Comparar solo las fechas (sin tiempo)
      const fechaComparar = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const hoyComparar = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const mananaComparar = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate());

      if (fechaComparar.getTime() === hoyComparar.getTime()) {
        return 'Hoy';
      } else if (fechaComparar.getTime() === mananaComparar.getTime()) {
        return 'Mañana';
      } else {
        return date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== hoy.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      return fecha;
    }
  }

  // Manejar errores de carga de imagen
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // El placeholder se mostrará automáticamente
  }

  // Limpiar mensajes cuando se navega
  private limpiarMensajes() {
    this._errorMessage.set('');
    this._successMessage.set('');
  }
}