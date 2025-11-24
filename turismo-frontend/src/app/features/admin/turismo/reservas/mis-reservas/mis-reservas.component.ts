import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Reserva, ReservaServicio } from '../../../../../core/services/turismo.service';
import { MisReservasService, MensajeChat } from '../../../../../core/services/mis-reservas.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

interface EditandoHorario {
  servicioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  verificandoDisponibilidad: boolean;
  disponible: boolean | null;
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Mis reservas" 
      subtitle="Gestiona tus reservas de servicios turísticos"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas?.total || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas?.pendientes || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas?.confirmadas || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas?.completadas || 0}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <select [(ngModel)]="filtroEstado" (ngModelChange)="aplicarFiltros()" 
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <input type="text" [(ngModel)]="busqueda" (ngModelChange)="aplicarFiltros()" 
                 placeholder="Buscar por código o servicio..."
                 class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1">
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando reservas...</p>
      </div>

      <!-- Sin reservas -->
      <div *ngIf="!loading && reservasFiltradas.length === 0" class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tienes reservas</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Comienza explorando nuestros servicios turísticos.</p>
        <button [routerLink]="['/servicios']" 
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Explorar servicios
        </button>
      </div>

      <!-- Lista de reservas -->
      <div *ngIf="!loading && reservasFiltradas.length > 0" class="space-y-6">
        <div *ngFor="let reserva of reservasFiltradas" 
             class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          
          <!-- Header de la reserva -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Reserva #{{reserva.codigo_reserva}}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Creada el {{formatearFecha(reserva.created_at!)}}
                </p>
              </div>
              
              <div class="flex items-center space-x-2">
                <span [class]="getEstadoClasse(reserva.estado)" 
                      class="px-2 py-1 rounded-full text-xs font-medium">
                  {{getEstadoTexto(reserva.estado)}}
                </span>
                
                <button (click)="toggleReservaExpanded(reserva.id!)" 
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-5 h-5 transition-transform" 
                       [class.rotate-180]="reservaExpandida === reserva.id"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido expandible -->
          <div *ngIf="reservaExpandida === reserva.id" class="px-6 py-4">
            
            <!-- Notas de la reserva -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas de la reserva
              </label>
              <div *ngIf="!editandoNotas[reserva.id!]" class="flex items-center space-x-2">
                <p class="text-gray-900 dark:text-white flex-1">
                  {{reserva.notas || 'Sin notas adicionales'}}
                </p>
                <button (click)="iniciarEdicionNotas(reserva.id!, reserva.notas || '')" 
                        class="text-blue-600 hover:text-blue-800 text-sm">
                  Editar
                </button>
              </div>
              
              <div *ngIf="editandoNotas[reserva.id!]" class="space-y-2">
                <textarea [(ngModel)]="nuevasNotas[reserva.id!]" 
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="3" placeholder="Agregar notas..."></textarea>
                <div class="flex space-x-2">
                  <button (click)="guardarNotas(reserva)" 
                          [disabled]="guardandoNotas[reserva.id!]"
                          class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                    {{guardandoNotas[reserva.id!] ? 'Guardando...' : 'Guardar'}}
                  </button>
                  <button (click)="cancelarEdicionNotas(reserva.id!)" 
                          class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- Servicios de la reserva -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-900 dark:text-white">Servicios incluidos:</h4>
              
              <div *ngFor="let servicio of reserva.servicios" 
                   class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                
                <div class="flex items-start space-x-4">
                  <!-- Imagen del servicio -->
                  <ng-container *ngIf="servicio.servicio?.sliders?.[0] as primerSlider">
                    <img [src]="primerSlider.url_completa"
                        [alt]="servicio.servicio?.nombre"
                        class="w-16 h-16 object-cover rounded-lg">
                    </ng-container>

                  
                  <ng-container *ngIf="!(servicio.servicio?.sliders?.[0])">
                    <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    </ng-container>


                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900 dark:text-white">
                          {{servicio.servicio?.nombre}}
                        </h5>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{servicio.emprendedor?.nombre}}
                        </p>
                      </div>
                      
                      <span [class]="getEstadoClasse(servicio.estado)" 
                            class="px-2 py-1 rounded-full text-xs font-medium">
                        {{getEstadoTexto(servicio.estado)}}
                      </span>
                    </div>

                    <!-- Horario actual o edición -->
                    <div class="mt-2">
                      <div *ngIf="!editandoHorario[servicio.id!]" class="text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Fecha:</strong> {{formatearFecha(servicio.fecha_inicio)}}</p>
                        <p><strong>Horario:</strong> {{servicio.hora_inicio}} - {{servicio.hora_fin}}</p>
                        <p><strong>Duración:</strong> {{servicio.duracion_minutos}} minutos</p>
                        
                        <div class="mt-2 flex space-x-2">
                          <button *ngIf="servicio.estado === 'pendiente'" 
                                  (click)="iniciarEdicionHorario(servicio)" 
                                  class="text-blue-600 hover:text-blue-800 text-sm">
                            Cambiar horario
                          </button>
                        </div>
                      </div>

                      <!-- Formulario de edición de horario -->
                      <div *ngIf="editandoHorario[servicio.id!]" class="space-y-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                            <input type="date" 
                                   [(ngModel)]="datosEdicionHorario[servicio.id!].fecha"
                                   (ngModelChange)="verificarDisponibilidadEdicion(servicio.id!)"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                            <input type="time" 
                                   [(ngModel)]="datosEdicionHorario[servicio.id!].horaInicio"
                                   (ngModelChange)="verificarDisponibilidadEdicion(servicio.id!)"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                            <input type="time" 
                                   [(ngModel)]="datosEdicionHorario[servicio.id!].horaFin"
                                   (ngModelChange)="verificarDisponibilidadEdicion(servicio.id!)"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                          </div>
                        </div>

                        <!-- Estado de disponibilidad -->
                        <div *ngIf="datosEdicionHorario[servicio.id!].verificandoDisponibilidad" 
                             class="text-sm text-blue-600 dark:text-blue-400">
                          Verificando disponibilidad...
                        </div>
                        
                        <div *ngIf="datosEdicionHorario[servicio.id!].disponible === true" 
                             class="text-sm text-green-600 dark:text-green-400">
                          ✓ Horario disponible
                        </div>
                        
                        <div *ngIf="datosEdicionHorario[servicio.id!].disponible === false" 
                             class="text-sm text-red-600 dark:text-red-400">
                          ✗ Horario no disponible
                        </div>

                        <div class="flex space-x-2">
                          <button (click)="guardarCambioHorario(servicio)" 
                                  [disabled]="!datosEdicionHorario[servicio.id!].disponible || guardandoHorario[servicio.id!]"
                                  class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                            {{guardandoHorario[servicio.id!] ? 'Guardando...' : 'Guardar cambios'}}
                          </button>
                          <button (click)="cancelarEdicionHorario(servicio.id!)" 
                                  class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Notas del servicio -->
                    <div class="mt-3">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Notas:</strong> {{servicio.notas_cliente || 'Sin notas específicas'}}
                      </p>
                    </div>

                    <!-- Acciones del servicio -->
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button *ngIf="servicio.estado === 'pendiente'" 
                              (click)="cambiarEstadoServicio(servicio.id!, 'confirmado')" 
                              class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Confirmar servicio
                      </button>
                      
                      <button *ngIf="servicio.estado === 'pendiente' || servicio.estado === 'confirmado'" 
                              (click)="cambiarEstadoServicio(servicio.id!, 'cancelado')" 
                              class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Cancelar servicio
                      </button>
                      
                      <button (click)="abrirChat(reserva, servicio)" 
                              class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Chat con emprendedor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones de la reserva -->
            <div class="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button *ngIf="reserva.estado === 'pendiente'" 
                      (click)="abrirModalPago(reserva)" 
                      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                💳 Confirmar y pagar
              </button>
              
              <button *ngIf="reserva.estado === 'pendiente' || reserva.estado === 'confirmada'" 
                      (click)="cambiarEstadoReserva(reserva.id!, 'cancelada')" 
                      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Cancelar reserva
              </button>
              
              <button *ngIf="reserva.estado === 'confirmada'" 
                      (click)="cambiarEstadoReserva(reserva.id!, 'completada')" 
                      class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Marcar como completada
              </button>
              
              <button (click)="verDetalleReserva(reserva.id!)" 
                      class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Ver detalle completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Pago -->
    <div *ngIf="mostrarModalPago" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar pago
        </h3>
        
        <div class="mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Reserva: #{{reservaParaPago?.codigo_reserva}}
          </p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            Total de servicios: {{reservaParaPago?.servicios?.length || 0}}
          </p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Método de pago:
          </label>
          
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="radio" [(ngModel)]="metodoPagoSeleccionado" value="yape" 
                     class="form-radio text-blue-600">
              <span class="ml-2 text-gray-900 dark:text-white">💜 Yape</span>
            </label>
            
            <label class="flex items-center">
              <input type="radio" [(ngModel)]="metodoPagoSeleccionado" value="visa" 
                     class="form-radio text-blue-600">
              <span class="ml-2 text-gray-900 dark:text-white">💳 Visa</span>
            </label>
            
            <label class="flex items-center">
              <input type="radio" [(ngModel)]="metodoPagoSeleccionado" value="mastercard" 
                     class="form-radio text-blue-600">
              <span class="ml-2 text-gray-900 dark:text-white">💳 Mastercard</span>
            </label>
          </div>
        </div>

        <div class="flex space-x-3">
          <button (click)="procesarPago()" 
                  [disabled]="!metodoPagoSeleccionado || procesandoPago"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {{procesandoPago ? 'Procesando...' : 'Proceder al pago'}}
          </button>
          
          <button (click)="cerrarModalPago()" 
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Chat -->
    <div *ngIf="mostrarChat" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full h-96 flex flex-col">
        
        <!-- Header del chat -->
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Chat con {{emprendedorChat?.nombre}}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Reserva #{{reservaChat?.codigo_reserva}}
            </p>
          </div>
          
          <button (click)="cerrarChat()" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mensajes -->
        <div class="flex-1 p-4 overflow-y-auto space-y-3">
          <div *ngFor="let mensaje of mensajesChat" 
               [class]="mensaje.emisor === 'usuario' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="mensaje.emisor === 'usuario' 
                   ? 'bg-blue-600 text-white max-w-xs lg:max-w-md px-3 py-2 rounded-lg' 
                   : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white max-w-xs lg:max-w-md px-3 py-2 rounded-lg'">
              <p class="text-sm">{{mensaje.mensaje}}</p>
              <p class="text-xs opacity-75 mt-1">
                {{formatearHora(mensaje.created_at)}}
              </p>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex space-x-2">
            <input type="text" [(ngModel)]="nuevoMensaje" 
                   (keyup.enter)="enviarMensaje()"
                   placeholder="Escribe tu mensaje..."
                   class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
            
            <button (click)="enviarMensaje()" 
                    [disabled]="!nuevoMensaje.trim() || enviandoMensaje"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {{enviandoMensaje ? '...' : 'Enviar'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MisReservasComponent implements OnInit {
  private misReservasService = inject(MisReservasService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Datos principales
  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  estadisticas: any = null;
  loading = true;

  // Filtros
  filtroEstado = '';
  busqueda = '';

  // Estados de UI
  reservaExpandida: number | null = null;
  
  // Edición de notas
  editandoNotas: { [key: number]: boolean } = {};
  nuevasNotas: { [key: number]: string } = {};
  guardandoNotas: { [key: number]: boolean } = {};

  // Edición de horarios
  editandoHorario: { [key: number]: boolean } = {};
  datosEdicionHorario: { [key: number]: EditandoHorario } = {};
  guardandoHorario: { [key: number]: boolean } = {};

  // Modal de pago
  mostrarModalPago = false;
  reservaParaPago: Reserva | null = null;
  metodoPagoSeleccionado: 'yape' | 'visa' | 'mastercard' | '' = '';
  procesandoPago = false;

  // Chat
  mostrarChat = false;
  reservaChat: Reserva | null = null;
  emprendedorChat: any = null;
  mensajesChat: MensajeChat[] = [];
  nuevoMensaje = '';
  enviandoMensaje = false;

  ngOnInit() {
    this.cargarReservas();
    this.cargarEstadisticas();
  }

  cargarReservas() {
    this.loading = true;
    this.misReservasService.getMisReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.loading = false;
      }
    });
  }

  cargarEstadisticas() {
    this.misReservasService.getEstadisticasReservas().subscribe({
      next: (stats) => {
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aplicarFiltros() {
    this.reservasFiltradas = this.reservas.filter(reserva => {
      const coincideEstado = !this.filtroEstado || reserva.estado === this.filtroEstado;
      const coincideBusqueda = !this.busqueda || 
        reserva.codigo_reserva.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        reserva.servicios?.some(s => 
          s.servicio?.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          s.emprendedor?.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
        );
      
      return coincideEstado && coincideBusqueda;
    });
  }

  toggleReservaExpanded(reservaId: number) {
    this.reservaExpandida = this.reservaExpandida === reservaId ? null : reservaId;
  }

  // Gestión de notas
  iniciarEdicionNotas(reservaId: number, notasActuales: string) {
    this.editandoNotas[reservaId] = true;
    this.nuevasNotas[reservaId] = notasActuales;
  }

  cancelarEdicionNotas(reservaId: number) {
    this.editandoNotas[reservaId] = false;
    delete this.nuevasNotas[reservaId];
  }

  guardarNotas(reserva: Reserva) {
    const reservaId = reserva.id!;
    this.guardandoNotas[reservaId] = true;
    
    const datosActualizacion = {
      ...reserva,
      notas: this.nuevasNotas[reservaId]
    };

    this.misReservasService.actualizarReserva(reservaId, datosActualizacion).subscribe({
      next: (reservaActualizada) => {
        const index = this.reservas.findIndex(r => r.id === reservaId);
        if (index !== -1) {
          this.reservas[index] = reservaActualizada;
          this.aplicarFiltros();
        }
        this.editandoNotas[reservaId] = false;
        this.guardandoNotas[reservaId] = false;
      },
      error: (error) => {
        console.error('Error al guardar notas:', error);
        this.guardandoNotas[reservaId] = false;
      }
    });
  }

  // Gestión de horarios
  iniciarEdicionHorario(servicio: ReservaServicio) {
    const servicioId = servicio.id!;
    this.editandoHorario[servicioId] = true;
    this.datosEdicionHorario[servicioId] = {
      servicioId: servicio.servicio_id,
      fecha: servicio.fecha_inicio.split('T')[0],
      horaInicio: servicio.hora_inicio,
      horaFin: servicio.hora_fin,
      verificandoDisponibilidad: false,
      disponible: null
    };
  }

  cancelarEdicionHorario(servicioId: number) {
    this.editandoHorario[servicioId] = false;
    delete this.datosEdicionHorario[servicioId];
  }

  verificarDisponibilidadEdicion(servicioReservaId: number) {
    const datos = this.datosEdicionHorario[servicioReservaId];
    if (!datos.fecha || !datos.horaInicio || !datos.horaFin) {
      datos.disponible = null;
      return;
    }

    datos.verificandoDisponibilidad = true;
    datos.disponible = null;

    this.misReservasService.verificarDisponibilidad({
      servicio_id: datos.servicioId,
      fecha_inicio: datos.fecha,
      hora_inicio: datos.horaInicio,
      hora_fin: datos.horaFin,
      reserva_servicio_id: servicioReservaId
    }).subscribe({
      next: (disponible) => {
        datos.verificandoDisponibilidad = false;
        datos.disponible = disponible;
      },
      error: (error) => {
        console.error('Error al verificar disponibilidad:', error);
        datos.verificandoDisponibilidad = false;
        datos.disponible = false;
      }
    });
  }

  guardarCambioHorario(servicio: ReservaServicio) {
    const servicioId = servicio.id!;
    const datos = this.datosEdicionHorario[servicioId];
    
    if (!datos.disponible) return;

    this.guardandoHorario[servicioId] = true;

    // Calcular duración en minutos
    const inicio = new Date(`2000-01-01T${datos.horaInicio}`);
    const fin = new Date(`2000-01-01T${datos.horaFin}`);
    const duracionMinutos = (fin.getTime() - inicio.getTime()) / (1000 * 60);

    const servicioActualizado = {
      ...servicio,
      fecha_inicio: datos.fecha,
      hora_inicio: datos.horaInicio,
      hora_fin: datos.horaFin,
      duracion_minutos: duracionMinutos
    };

    this.misReservasService.cambiarEstadoServicioReserva(servicioId, 'pendiente').subscribe({
      next: () => {
        // Actualizar en la lista local
        const reserva = this.reservas.find(r => 
          r.servicios?.some(s => s.id === servicioId)
        );
        if (reserva) {
          const servicioIndex = reserva.servicios!.findIndex(s => s.id === servicioId);
          if (servicioIndex !== -1) {
            reserva.servicios![servicioIndex] = servicioActualizado;
            this.aplicarFiltros();
          }
        }
        
        this.editandoHorario[servicioId] = false;
        this.guardandoHorario[servicioId] = false;
      },
      error: (error) => {
        console.error('Error al guardar cambio de horario:', error);
        this.guardandoHorario[servicioId] = false;
      }
    });
  }

  // Cambio de estados
  cambiarEstadoReserva(reservaId: number, nuevoEstado: string) {
    this.misReservasService.cambiarEstadoReserva(reservaId, nuevoEstado).subscribe({
      next: (reservaActualizada) => {
        const index = this.reservas.findIndex(r => r.id === reservaId);
        if (index !== -1) {
          this.reservas[index] = reservaActualizada;
          this.aplicarFiltros();
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado de reserva:', error);
      }
    });
  }

  cambiarEstadoServicio(servicioId: number, nuevoEstado: string) {
    this.misReservasService.cambiarEstadoServicioReserva(servicioId, nuevoEstado).subscribe({
      next: (servicioActualizado) => {
        // Actualizar en la lista local
        const reserva = this.reservas.find(r => 
          r.servicios?.some(s => s.id === servicioId)
        );
        if (reserva) {
          const servicioIndex = reserva.servicios!.findIndex(s => s.id === servicioId);
          if (servicioIndex !== -1) {
            reserva.servicios![servicioIndex] = servicioActualizado;
            this.aplicarFiltros();
          }
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado de servicio:', error);
      }
    });
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
    this.reservaParaPago = null;
    this.metodoPagoSeleccionado = '';
    this.procesandoPago = false;
  }

  limpiarDatosPago() {
    this.reservaParaPago = null;
    this.metodoPagoSeleccionado = '';
    this.procesandoPago = false;
  }

  // Navegación y rutas de pago
  abrirModalPago(reserva: Reserva) {
    this.reservaParaPago = reserva;
    this.mostrarModalPago = true;
    this.metodoPagoSeleccionado = '';
  }

  procesarPago() {
    if (!this.reservaParaPago || !this.metodoPagoSeleccionado) return;

    this.procesandoPago = true;

    // Guardar referencias antes de que se limpien
    const reservaParaPago = this.reservaParaPago;
    const metodoPago = this.metodoPagoSeleccionado;

    this.misReservasService.procesarPago(
      reservaParaPago.id!, 
      metodoPago as 'yape' | 'visa' | 'mastercard'
    ).subscribe({
      next: (resultado) => {
        if (resultado.success) {
          // Cerrar modal sin limpiar datos aún
          this.mostrarModalPago = false;
          
          // Redirigir a la página de pago correspondiente
          const rutaPago = `/pagos/${metodoPago}`;
          this.router.navigate([rutaPago], {
            queryParams: { 
              reserva: reservaParaPago.codigo_reserva,
              monto: this.calcularMontoTotal(reservaParaPago)
            }
          }).then(() => {
            // Limpiar datos después de la navegación exitosa
            this.limpiarDatosPago();
          });
        }
      },
      error: (error) => {
        console.error('Error al procesar pago:', error);
        this.procesandoPago = false;
      }
    });
  }

  calcularMontoTotal(reserva: Reserva): number {
    // Calcular total basado en precios de servicios
    let total = 0;
    reserva.servicios?.forEach(servicio => {
      if (servicio.servicio?.precio_referencial) {
        total += parseFloat(servicio.servicio.precio_referencial.toString());
      }
    });
    return total || 50; // Valor por defecto si no hay precios
  }

  // Chat
  abrirChat(reserva: Reserva, servicio: ReservaServicio) {
    this.reservaChat = reserva;
    this.emprendedorChat = servicio.emprendedor;
    this.mostrarChat = true;
    this.cargarMensajesChat(reserva.id!, servicio.emprendedor_id);
  }

  cerrarChat() {
    this.mostrarChat = false;
    this.reservaChat = null;
    this.emprendedorChat = null;
    this.mensajesChat = [];
    this.nuevoMensaje = '';
  }

  cargarMensajesChat(reservaId: number, emprendedorId: number) {
    this.misReservasService.getMensajesChat(reservaId, emprendedorId).subscribe({
      next: (mensajes) => {
        this.mensajesChat = mensajes;
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
      }
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.reservaChat || !this.emprendedorChat) return;

    this.enviandoMensaje = true;

    this.misReservasService.enviarMensaje({
      reserva_id: this.reservaChat.id!,
      emprendedor_id: this.emprendedorChat.id,
      mensaje: this.nuevoMensaje.trim()
    }).subscribe({
      next: (nuevoMensaje) => {
        this.mensajesChat.push(nuevoMensaje);
        this.nuevoMensaje = '';
        this.enviandoMensaje = false;
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.enviandoMensaje = false;
      }
    });
  }

  // Navegación
  verDetalleReserva(reservaId: number) {
    this.router.navigate(['/admin/reservas/detail', reservaId]);
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoClasse(estado: string): string {
    const clases = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'confirmada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'confirmado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'completada': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'completado': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'confirmado': 'Confirmado',
      'completada': 'Completada',
      'completado': 'Completado',
      'cancelada': 'Cancelada',
      'cancelado': 'Cancelado'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}