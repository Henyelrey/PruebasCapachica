import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../../../../core/services/planes.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { Plan, PlanInscripcion } from '../../../../../core/models/plan.model';
import { PaginatedResponse } from '../../../../../core/models/api.model';
import { environment } from '../../../../../../environments/environments';

interface EstadisticasInscripciones {
  total: number;
  pendientes: number;
  confirmadas: number;
  canceladas: number;
  completadas: number;
  en_progreso: number;
}

@Component({
  selector: 'app-mis-inscripciones',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Mis inscripciones" 
      subtitle="Gestiona tus inscripciones a planes turísticos"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.total || 0}}</p>
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.pendientes || 0}}</p>
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
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.confirmadas || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">En progreso</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{estadisticas()?.en_progreso || 0}}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
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
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <select [(ngModel)]="filtroEstado" (ngModelChange)="aplicarFiltros()" 
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <input type="text" [(ngModel)]="busqueda" (ngModelChange)="aplicarFiltros()" 
                 placeholder="Buscar por nombre del plan..."
                 class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1">
                 
          <button (click)="cargarInscripciones()" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando inscripciones...</p>
      </div>

      <!-- Sin inscripciones -->
      <div *ngIf="!loading() && inscripcionesFiltradas().length === 0" class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tienes inscripciones</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Comienza explorando nuestros planes turísticos.</p>
        <button [routerLink]="['/planes']" 
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Explorar planes
        </button>
      </div>

      <!-- Lista de inscripciones -->
      <div *ngIf="!loading() && inscripcionesFiltradas().length > 0" class="space-y-6">
        <div *ngFor="let inscripcion of inscripcionesFiltradas()" 
             class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          
          <!-- Header de la inscripción -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{inscripcion.plan?.nombre}}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Inscrito el {{formatearFecha(inscripcion.created_at!)}}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {{inscripcion.numero_participantes}} participante(s) • {{inscripcion.plan?.duracion_dias}} día(s)
                </p>
              </div>
              
              <div class="flex items-center space-x-2">
                <span [class]="getEstadoClasse(inscripcion.estado)" 
                      class="px-2 py-1 rounded-full text-xs font-medium">
                  {{getEstadoTexto(inscripcion.estado)}}
                </span>
                
                <button (click)="toggleInscripcionExpanded(inscripcion.id!)" 
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-5 h-5 transition-transform" 
                       [class.rotate-180]="inscripcionExpandida() === inscripcion.id"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Contenido expandible -->
          <div *ngIf="inscripcionExpandida() === inscripcion.id" class="px-6 py-4">
            
            <!-- Información del plan -->
            <div class="mb-6">
              <div class="flex items-start space-x-4">
                <!-- Imagen del plan -->
                <div class="w-20 h-20 flex-shrink-0">
                  <img *ngIf="inscripcion.plan?.imagen_principal_url" 
                    [src]="getImagenUrl(inscripcion.plan?.imagen_principal_url ?? '')"
                    [alt]="inscripcion.plan?.nombre"
                    class="w-full h-full object-cover rounded-lg">

                  <div *ngIf="!inscripcion.plan?.imagen_principal_url" 
                       class="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div class="flex-1">
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {{inscripcion.plan?.descripcion}}
                  </p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-gray-700 dark:text-gray-300">Organizador:</span>
                      <span class="text-gray-600 dark:text-gray-400 ml-1">
                        {{inscripcion.plan?.organizador_principal?.nombre || 'No especificado'}}
                      </span>
                    </div>
                    
                    <div>
                      <span class="font-medium text-gray-700 dark:text-gray-300">Dificultad:</span>
                      <span class="text-gray-600 dark:text-gray-400 ml-1">
                        {{getDificultadLabel(inscripcion.plan?.dificultad)}}
                      </span>
                    </div>
                    
                    <div>
                      <span class="font-medium text-gray-700 dark:text-gray-300">Precio total:</span>
                      <span class="text-gray-600 dark:text-gray-400 ml-1">
                        S/ {{inscripcion.precio_total_calculado || (inscripcion.plan?.precio_total || 0) * inscripcion.numero_participantes}}
                      </span>
                    </div>

                    <div>
                      <span class="font-medium text-gray-700 dark:text-gray-300">Método de pago:</span>
                      <span class="text-gray-600 dark:text-gray-400 ml-1">
                        {{getMetodoPagoTexto(inscripcion.metodo_pago)}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fechas del plan (si están disponibles) -->
            <div *ngIf="inscripcion.fecha_inicio_plan || inscripcion.fecha_fin_plan" 
                 class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 class="font-medium text-blue-800 dark:text-blue-300 mb-2">📅 Fechas del plan</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div *ngIf="inscripcion.fecha_inicio_plan">
                  <span class="font-medium text-blue-700 dark:text-blue-400">Fecha inicio:</span>
                  <span class="text-blue-600 dark:text-blue-300 ml-1">
                    {{formatearFecha(inscripcion.fecha_inicio_plan)}}
                  </span>
                </div>
                <div *ngIf="inscripcion.fecha_fin_plan">
                  <span class="font-medium text-blue-700 dark:text-blue-400">Fecha fin:</span>
                  <span class="text-blue-600 dark:text-blue-300 ml-1">
                    {{formatearFecha(inscripcion.fecha_fin_plan)}}
                  </span>
                </div>
              </div>
              
              <div *ngIf="getDiasParaInicio(inscripcion) !== null" 
                   class="mt-2 text-sm text-blue-600 dark:text-blue-400">
                <span *ngIf="getDiasParaInicio(inscripcion)! > 0">
                  ⏱️ Faltan {{getDiasParaInicio(inscripcion)}} días para el inicio
                </span>
                <span *ngIf="getDiasParaInicio(inscripcion)! === 0">
                  🎉 ¡El plan comienza hoy!
                </span>
                <span *ngIf="getDiasParaInicio(inscripcion)! < 0">
                  📍 Plan en curso o finalizado
                </span>
              </div>
            </div>

            <!-- Requerimientos especiales y comentarios -->
            <div class="mb-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="inscripcion.requerimientos_especiales">
                  <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Requerimientos especiales:</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    {{inscripcion.requerimientos_especiales}}
                  </p>
                </div>
                
                <div *ngIf="inscripcion.comentarios_adicionales">
                  <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Comentarios adicionales:</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {{inscripcion.comentarios_adicionales}}
                  </p>
                </div>
              </div>
            </div>

            <!-- Notas del organizador (si están disponibles) -->
            <div *ngIf="inscripcion.notas" class="mb-4">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Notas del organizador:</h4>
              <p class="text-gray-600 dark:text-gray-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded">
                {{inscripcion.notas}}
              </p>
            </div>

            <!-- Acciones de la inscripción -->
            <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <!-- Pago (solo para pendientes) -->
              <button *ngIf="inscripcion.estado === 'pendiente'" 
                      (click)="abrirModalPago(inscripcion)" 
                      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                Proceder al pago
              </button>
              
              <!-- Cancelar (para pendientes y confirmadas) -->
              <button *ngIf="inscripcion.estado === 'pendiente' || inscripcion.estado === 'confirmada'" 
                      (click)="cancelarInscripcion(inscripcion)" 
                      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancelar inscripción
              </button>
              
              <!-- Marcar como completada (para confirmadas y en progreso) -->
              <button *ngIf="inscripcion.estado === 'confirmada' || inscripcion.estado === 'en_progreso'" 
                      (click)="marcarComoCompletada(inscripcion)" 
                      class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Marcar como completada
              </button>
              
              <!-- Ver plan completo -->
              <button (click)="verDetallePlan(inscripcion.plan_id)" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Ver detalle del plan
              </button>
              
              <!-- Editar inscripción (solo para pendientes) -->
              <button *ngIf="inscripcion.estado === 'pendiente'" 
                      (click)="editarInscripcion(inscripcion)" 
                      class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div *ngIf="!loading() && totalPaginas() > 1" 
           class="flex justify-center mt-8">
        <nav class="flex items-center space-x-2">
          <button (click)="cambiarPagina(paginaActual - 1)"
                  [disabled]="paginaActual === 1"
                  class="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            Anterior
          </button>
          
          <span class="px-4 py-2 text-gray-700 dark:text-gray-300">
            Página {{paginaActual}} de {{totalPaginas()}}
          </span>
          
          <button (click)="cambiarPagina(paginaActual + 1)"
                  [disabled]="paginaActual === totalPaginas()"
                  class="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
            Siguiente
          </button>
        </nav>
      </div>
    </div>

    <!-- Modal de Pago -->
    <div *ngIf="mostrarModalPago()" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Proceder al pago
        </h3>
        
        <div class="mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Plan: {{inscripcionParaPago()?.plan?.nombre}}
          </p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            Total: S/ {{inscripcionParaPago()?.precio_total_calculado || 
            ((inscripcionParaPago()?.plan?.precio_total || 0) * (inscripcionParaPago()?.numero_participantes || 1))}}
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
                  [disabled]="!metodoPagoSeleccionado() || procesandoPago()"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {{procesandoPago() ? 'Procesando...' : 'Proceder al pago'}}
          </button>
          
          <button (click)="cerrarModalPago()" 
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Edición -->
    <div *ngIf="mostrarModalEdicion()" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editar inscripción
        </h3>
        
        <div class="space-y-4">
          <!-- Número de participantes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de participantes
            </label>
            <div class="flex items-center space-x-2">
              <button type="button" 
                      (click)="decrementarParticipantes()"
                      class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                -
              </button>
              <input type="number" 
                     [(ngModel)]="datosEdicion.numero_participantes"
                     min="1" 
                     class="w-20 text-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <button type="button" 
                      (click)="incrementarParticipantes()"
                      class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                +
              </button>
            </div>
          </div>

          <!-- Método de pago -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de pago
            </label>
            <select [(ngModel)]="datosEdicion.metodo_pago"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
          </div>

          <!-- Requerimientos especiales -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requerimientos especiales
            </label>
            <textarea [(ngModel)]="datosEdicion.requerimientos_especiales"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>

          <!-- Comentarios adicionales -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comentarios adicionales
            </label>
            <textarea [(ngModel)]="datosEdicion.comentarios_adicionales"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button (click)="guardarEdicion()" 
                  [disabled]="guardandoEdicion()"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {{guardandoEdicion() ? 'Guardando...' : 'Guardar cambios'}}
          </button>
          
          <button (click)="cerrarModalEdicion()" 
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelación -->
    <div *ngIf="mostrarModalCancelacion()" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cancelar inscripción
        </h3>
        
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          ¿Estás seguro de que deseas cancelar tu inscripción al plan "{{inscripcionParaCancelar()?.plan?.nombre}}"?
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Motivo de cancelación (opcional)
          </label>
          <textarea [(ngModel)]="motivoCancelacion"
                    rows="3"
                    placeholder="Explica el motivo de la cancelación..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
        </div>

        <div class="flex space-x-3">
          <button (click)="confirmarCancelacion()" 
                  [disabled]="cancelandoInscripcion()"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
            {{cancelandoInscripcion() ? 'Cancelando...' : 'Confirmar cancelación'}}
          </button>
          
          <button (click)="cerrarModalCancelacion()" 
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
            Mantener inscripción
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MisInscripcionesComponent implements OnInit {
  env = environment;
  private planesService = inject(PlanesService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Signals para el estado del componente
  loading = signal<boolean>(false);
  inscripciones = signal<PlanInscripcion[]>([]);
  estadisticas = signal<EstadisticasInscripciones | null>(null);
  totalElementos = signal<number>(0);
  totalPaginas = signal<number>(1);
  inscripcionExpandida = signal<number | null>(null);

  // Signals para modales
  mostrarModalPago = signal<boolean>(false);
  mostrarModalEdicion = signal<boolean>(false);
  mostrarModalCancelacion = signal<boolean>(false);
  inscripcionParaPago = signal<PlanInscripcion | null>(null);
  inscripcionParaEditar = signal<PlanInscripcion | null>(null);
  inscripcionParaCancelar = signal<PlanInscripcion | null>(null);

  // Signals para acciones
  procesandoPago = signal<boolean>(false);
  guardandoEdicion = signal<boolean>(false);
  cancelandoInscripcion = signal<boolean>(false);
  metodoPagoSeleccionado = signal<string>('');

  // Filtros
  filtroEstado = '';
  busqueda = '';
  paginaActual = 1;

  // Datos temporales
  datosEdicion: any = {};
  motivoCancelacion = '';

  // Computed para filtrar inscripciones
  inscripcionesFiltradas = computed(() => {
    let inscripciones = this.inscripciones();
    
    if (this.filtroEstado) {
      inscripciones = inscripciones.filter(i => i.estado === this.filtroEstado);
    }
    
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      inscripciones = inscripciones.filter(i => 
        i.plan?.nombre.toLowerCase().includes(busquedaLower)
      );
    }
    
    return inscripciones;
  });

  ngOnInit() {
    this.cargarInscripciones();
    this.calcularEstadisticas();
  }

  cargarInscripciones() {
  this.loading.set(true);

  this.planesService.getMisInscripciones(this.paginaActual, this.filtroEstado).subscribe({
        next: (response: PaginatedResponse<PlanInscripcion>) => {
        // Asumimos que response es directamente PaginatedResponse<PlanInscripcion>
        this.inscripciones.set(response.data); // ✅ Ya no uses response.data

        // Manejar diferentes estructuras de paginación
        if ('meta' in response) {
            // Estructura con meta (Laravel típica)
            const meta = (response as any).meta;
            this.totalElementos.set(meta.total || 0);
            this.totalPaginas.set(meta.last_page || 1);
        } else if ('total' in response) {
            // Otra estructura con total y per_page en la raíz
            const total = (response as any).total || 0;
            const perPage = (response as any).per_page || 10;
            this.totalElementos.set(total);
            this.totalPaginas.set(Math.ceil(total / perPage));
        } else {
            // Fallback si no hay metadatos de paginación
            const dataArray = (response as any).data ?? [];
            this.totalElementos.set(dataArray.length);
            this.totalPaginas.set(1);
        }

        this.loading.set(false);
        this.calcularEstadisticas();
        },
        error: (error) => {
        console.error('Error al cargar inscripciones:', error);
        this.loading.set(false);
        }
    });
    }


  calcularEstadisticas() {
    // Podríamos obtener todas las inscripciones para calcular estadísticas completas
    // o usar las inscripciones actuales como una muestra
    const inscripciones = this.inscripciones();
    const stats: EstadisticasInscripciones = {
      total: this.totalElementos(),
      pendientes: inscripciones.filter(i => i.estado === 'pendiente').length,
      confirmadas: inscripciones.filter(i => i.estado === 'confirmada').length,
      canceladas: inscripciones.filter(i => i.estado === 'cancelada').length,
      completadas: inscripciones.filter(i => i.estado === 'completada').length,
      en_progreso: inscripciones.filter(i => i.estado === 'en_progreso').length
    };
    
    this.estadisticas.set(stats);
  }

  aplicarFiltros() {
    this.paginaActual = 1;
    this.cargarInscripciones();
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual = pagina;
      this.cargarInscripciones();
    }
  }

  toggleInscripcionExpanded(inscripcionId: number) {
    const currentExpanded = this.inscripcionExpandida();
    this.inscripcionExpandida.set(currentExpanded === inscripcionId ? null : inscripcionId);
  }

  // Gestión de pago
  abrirModalPago(inscripcion: PlanInscripcion) {
    this.inscripcionParaPago.set(inscripcion);
    this.mostrarModalPago.set(true);
    this.metodoPagoSeleccionado.set('yape');
  }

  cerrarModalPago() {
    this.mostrarModalPago.set(false);
    this.inscripcionParaPago.set(null);
    this.metodoPagoSeleccionado.set('');
    this.procesandoPago.set(false);
  }

  procesarPago() {
    const inscripcion = this.inscripcionParaPago();
    const metodoPago = this.metodoPagoSeleccionado();
    
    if (!inscripcion || !metodoPago) return;

    this.procesandoPago.set(true);

    // Calcular monto total
    const montoTotal = inscripcion.precio_total_calculado || 
                      ((inscripcion.plan?.precio_total || 0) * inscripcion.numero_participantes);

    // Cerrar modal y redirigir a la página de pago
    this.cerrarModalPago();
    
    // Redirigir a la página de pago correspondiente
    const rutaPago = `/pagos/${metodoPago}`;
    this.router.navigate([rutaPago], {
      queryParams: { 
        inscripcion: inscripcion.id,
        plan: inscripcion.plan?.nombre,
        monto: montoTotal
      }
    });
  }

  // Gestión de edición
  editarInscripcion(inscripcion: PlanInscripcion) {
    this.inscripcionParaEditar.set(inscripcion);
    this.datosEdicion = {
      numero_participantes: inscripcion.numero_participantes,
      metodo_pago: inscripcion.metodo_pago,
      requerimientos_especiales: inscripcion.requerimientos_especiales || '',
      comentarios_adicionales: inscripcion.comentarios_adicionales || ''
    };
    this.mostrarModalEdicion.set(true);
  }

  cerrarModalEdicion() {
    this.mostrarModalEdicion.set(false);
    this.inscripcionParaEditar.set(null);
    this.datosEdicion = {};
    this.guardandoEdicion.set(false);
  }

  incrementarParticipantes() {
    this.datosEdicion.numero_participantes = Math.max(1, this.datosEdicion.numero_participantes + 1);
  }

  decrementarParticipantes() {
    this.datosEdicion.numero_participantes = Math.max(1, this.datosEdicion.numero_participantes - 1);
  }

  guardarEdicion() {
    const inscripcion = this.inscripcionParaEditar();
    if (!inscripcion) return;

    this.guardandoEdicion.set(true);

    this.planesService.updateInscripcion(inscripcion.id!, this.datosEdicion).subscribe({
      next: (inscripcionActualizada) => {
        // Actualizar en la lista local
        const inscripciones = this.inscripciones();
        const index = inscripciones.findIndex(i => i.id === inscripcion.id);
        if (index !== -1) {
          inscripciones[index] = inscripcionActualizada;
          this.inscripciones.set([...inscripciones]);
        }
        
        this.cerrarModalEdicion();
      },
      error: (error) => {
        console.error('Error al actualizar inscripción:', error);
        this.guardandoEdicion.set(false);
      }
    });
  }

  // Gestión de cancelación
  cancelarInscripcion(inscripcion: PlanInscripcion) {
    this.inscripcionParaCancelar.set(inscripcion);
    this.motivoCancelacion = '';
    this.mostrarModalCancelacion.set(true);
  }

  cerrarModalCancelacion() {
    this.mostrarModalCancelacion.set(false);
    this.inscripcionParaCancelar.set(null);
    this.motivoCancelacion = '';
    this.cancelandoInscripcion.set(false);
  }

  confirmarCancelacion() {
    const inscripcion = this.inscripcionParaCancelar();
    if (!inscripcion) return;

    this.cancelandoInscripcion.set(true);

    this.planesService.cancelarInscripcion(inscripcion.id!, this.motivoCancelacion).subscribe({
      next: (inscripcionCancelada) => {
        // Actualizar en la lista local
        const inscripciones = this.inscripciones();
        const index = inscripciones.findIndex(i => i.id === inscripcion.id);
        if (index !== -1) {
          inscripciones[index] = inscripcionCancelada;
          this.inscripciones.set([...inscripciones]);
        }
        
        this.calcularEstadisticas();
        this.cerrarModalCancelacion();
      },
      error: (error) => {
        console.error('Error al cancelar inscripción:', error);
        this.cancelandoInscripcion.set(false);
      }
    });
  }

  // Marcar como completada
  marcarComoCompletada(inscripcion: PlanInscripcion) {
    const comentarios = prompt('Comentarios sobre la experiencia (opcional):');
    
    this.planesService.marcarCompletada(inscripcion.id!, comentarios || undefined).subscribe({
      next: (inscripcionCompletada) => {
        // Actualizar en la lista local
        const inscripciones = this.inscripciones();
        const index = inscripciones.findIndex(i => i.id === inscripcion.id);
        if (index !== -1) {
          inscripciones[index] = inscripcionCompletada;
          this.inscripciones.set([...inscripciones]);
        }
        
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al marcar como completada:', error);
      }
    });
  }

  // Navegación
  verDetallePlan(planId: number) {
    this.router.navigate(['/planes', planId]);
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDiasParaInicio(inscripcion: PlanInscripcion): number | null {
    if (!inscripcion.fecha_inicio_plan) return null;
    
    const hoy = new Date();
    const fechaInicio = new Date(inscripcion.fecha_inicio_plan);
    const diffTime = fechaInicio.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getEstadoClasse(estado: string): string {
    const clases = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'confirmada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'en_progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'completada': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return clases[estado as keyof typeof clases] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'en_progreso': 'En progreso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  getMetodoPagoTexto(metodo?: string): string {
    if (!metodo) return 'No especificado';
    
    const textos = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'yape': 'Yape',
      'plin': 'Plin',
      'tarjeta': 'Tarjeta'
    };
    return textos[metodo as keyof typeof textos] || metodo;
  }

  getDificultadLabel(dificultad?: string): string {
    if (!dificultad) return 'No especificado';
    
    const labels = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return labels[dificultad as keyof typeof labels] || dificultad;
  }

  getImagenUrl(imagenPath: string): string {
    if (imagenPath.startsWith('http')) {
        return imagenPath;
    }

    return `${this.env.assetsUrl}${imagenPath}`;
  }


  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}