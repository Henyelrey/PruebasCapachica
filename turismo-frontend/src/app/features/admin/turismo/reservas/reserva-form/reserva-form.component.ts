import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ReservasService, Reserva, Servicio, ReservaServicio, Emprendedor, Usuario, CreateReservaRequest, UpdateReservaRequest, PaginatedResponse } from '../../../../../core/services/reservas.service';
import { UsersService } from '../../../../../core/services/users.service';
import { User } from '../../../../../core/models/user.model';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      [title]="(isEditMode() ? 'Editar' : 'Crear') + ' Reserva'" 
      [subtitle]="isEditMode() ? 'Actualice la información de la reserva' : 'Complete el formulario para crear una nueva reserva'"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Loading -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ isEditMode() ? 'Cargando información de la reserva...' : 'Cargando datos necesarios...' }}</p>
      </div>

      <!-- Formulario -->
      <div *ngIf="!loading()">
        <form [formGroup]="reservaForm" (ngSubmit)="submitForm()" class="space-y-6">
          
          <!-- Información básica de la reserva -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Información de la Reserva</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Complete los datos básicos de la reserva</p>
            </div>

            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                <!-- Cliente con modal -->
                <div class="sm:col-span-3">
                  <label for="usuario_seleccionado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente *</label>
                  <div class="mt-1 flex">
                    <input
                      type="text"
                      id="usuario_seleccionado"
                      [value]="usuarioSeleccionado() ? usuarioSeleccionado()!.name + ' (' + usuarioSeleccionado()!.email + ')' : ''"
                      readonly
                      placeholder="Seleccionar cliente..."
                      class="block w-full rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm"
                    >
                    <button
                      type="button"
                      (click)="abrirModalUsuarios()"
                      class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  </div>
                  <div *ngIf="reservaForm.get('usuario_id')?.errors?.['required'] && reservaForm.get('usuario_id')?.touched" 
                      class="mt-2 text-sm text-red-600 dark:text-red-400">
                    El cliente es obligatorio
                  </div>
                </div>

                <!-- Código de reserva -->
                <div class="sm:col-span-3">
                  <label for="codigo_reserva" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código de Reserva *</label>
                  <div class="mt-1">
                    <input
                      type="text"
                      id="codigo_reserva"
                      formControlName="codigo_reserva"
                      [readonly]="isEditMode()"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      [class.bg-gray-100]="isEditMode()"
                      [class.dark:bg-gray-600]="isEditMode()"
                    >
                  </div>
                  <div *ngIf="reservaForm.get('codigo_reserva')?.errors?.['required'] && reservaForm.get('codigo_reserva')?.touched" 
                      class="mt-2 text-sm text-red-600 dark:text-red-400">
                    El código de reserva es obligatorio
                  </div>
                </div>

                <!-- Estado de la reserva -->
                <div class="sm:col-span-2">
                  <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado *</label>
                  <div class="mt-1">
                    <select
                      id="estado"
                      formControlName="estado"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                </div>

                <!-- Botón generar código -->
                <div class="sm:col-span-1 flex items-end" *ngIf="!isEditMode()">
                  <button
                    type="button"
                    (click)="generarNuevoCodigo()"
                    class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="Generar nuevo código"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                </div>

                <!-- Notas generales -->
                <div class="sm:col-span-6">
                  <label for="notas" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas Generales</label>
                  <div class="mt-1">
                    <textarea
                      id="notas"
                      formControlName="notas"
                      rows="3"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      placeholder="Notas adicionales sobre la reserva..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Servicios de la reserva -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Servicios Reservados</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Añada los servicios que se incluyen en esta reserva</p>
              </div>
              <button
                type="button"
                (click)="addServicio()"
                class="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Añadir Servicio
              </button>
            </div>

            <!-- Mensaje cuando no hay servicios -->
            <div *ngIf="serviciosArray.controls.length === 0" class="p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Añada al menos un servicio</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Debe añadir al menos un servicio a la reserva para poder continuar.
              </p>
              <div class="mt-6">
                <button
                  type="button"
                  (click)="addServicio()"
                  class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Añadir Primer Servicio
                </button>
              </div>
            </div>

            <!-- Lista de servicios -->
            <div *ngIf="serviciosArray.controls.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
              <div *ngFor="let control of serviciosArray.controls; let i = index; trackBy: trackByServicio" 
                  [formGroup]="getServicioFormGroup(i)" 
                  class="p-6 space-y-6">
                
                <!-- Header del servicio -->
                <div class="flex justify-between items-center">
                  <h3 class="text-md font-medium text-gray-900 dark:text-white">Servicio #{{ i + 1 }}</h3>
                  <button
                    type="button"
                    (click)="removeServicio(i)"
                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                    title="Eliminar servicio"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  
                  <!-- Selección de servicio -->
                  <div class="sm:col-span-3">
                    <label [for]="'servicio_id-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio *</label>
                    <div class="mt-1">
                      <select
                        [id]="'servicio_id-' + i"
                        formControlName="servicio_id"
                        (change)="onServicioChange(i)"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                        <option value="">Seleccionar servicio</option>
                        <option *ngFor="let servicio of serviciosDisponibles(); trackBy: trackByServicioDisponible" [value]="servicio.id">
                          {{ servicio.nombre }} - {{ servicio.emprendedor?.nombre }}
                        </option>
                      </select>
                    </div>
                    <div *ngIf="getServicioFormGroup(i).get('servicio_id')?.errors?.['required'] && getServicioFormGroup(i).get('servicio_id')?.touched" 
                        class="mt-2 text-sm text-red-600 dark:text-red-400">
                      El servicio es obligatorio
                    </div>
                  </div>

                  <!-- Emprendedor (readonly) -->
                  <div class="sm:col-span-3">
                    <label [for]="'emprendedor_id-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Emprendedor</label>
                    <div class="mt-1">
                      <input
                        type="text"
                        [id]="'emprendedor_id-' + i"
                        [value]="getEmprendedorNombre(i)"
                        readonly
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm"
                        placeholder="Se asigna automáticamente"
                      >
                    </div>
                  </div>

                  <!-- Fecha de inicio -->
                  <div class="sm:col-span-2">
                    <label [for]="'fecha_inicio-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de inicio *</label>
                    <div class="mt-1">
                      <input
                        type="date"
                        [id]="'fecha_inicio-' + i"
                        formControlName="fecha_inicio"
                        (change)="onFechaHoraChange(i)"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                    <div *ngIf="getServicioFormGroup(i).get('fecha_inicio')?.errors?.['required'] && getServicioFormGroup(i).get('fecha_inicio')?.touched" 
                        class="mt-2 text-sm text-red-600 dark:text-red-400">
                      La fecha de inicio es obligatoria
                    </div>
                  </div>

                  <!-- Fecha de fin (opcional) -->
                  <div class="sm:col-span-2">
                    <label [for]="'fecha_fin-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de fin (opcional)</label>
                    <div class="mt-1">
                      <input
                        type="date"
                        [id]="'fecha_fin-' + i"
                        formControlName="fecha_fin"
                        [min]="getServicioFormGroup(i).get('fecha_inicio')?.value"
                        (change)="onFechaHoraChange(i)"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                  </div>

                  <!-- Estado del servicio -->
                  <div class="sm:col-span-2">
                    <label [for]="'estado-servicio-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <div class="mt-1">
                      <select
                        [id]="'estado-servicio-' + i"
                        formControlName="estado"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="completado">Completado</option>
                      </select>
                    </div>
                  </div>

                  <!-- Hora de inicio -->
                  <div class="sm:col-span-2">
                    <label [for]="'hora_inicio-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de inicio *</label>
                    <div class="mt-1">
                      <input
                        type="time"
                        [id]="'hora_inicio-' + i"
                        formControlName="hora_inicio"
                        (change)="onFechaHoraChange(i)"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                    <div *ngIf="getServicioFormGroup(i).get('hora_inicio')?.errors?.['required'] && getServicioFormGroup(i).get('hora_inicio')?.touched" 
                        class="mt-2 text-sm text-red-600 dark:text-red-400">
                      La hora de inicio es obligatoria
                    </div>
                  </div>

                  <!-- Hora de fin -->
                  <div class="sm:col-span-2">
                    <label [for]="'hora_fin-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de fin *</label>
                    <div class="mt-1">
                      <input
                        type="time"
                        [id]="'hora_fin-' + i"
                        formControlName="hora_fin"
                        (change)="onFechaHoraChange(i)"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                    <div *ngIf="getServicioFormGroup(i).get('hora_fin')?.errors?.['required'] && getServicioFormGroup(i).get('hora_fin')?.touched" 
                        class="mt-2 text-sm text-red-600 dark:text-red-400">
                      La hora de fin es obligatoria
                    </div>
                    <div *ngIf="horaFinInvalida(i)" 
                        class="mt-2 text-sm text-red-600 dark:text-red-400">
                      La hora de fin debe ser posterior a la hora de inicio
                    </div>
                  </div>

                  <!-- Duración (readonly calculada) -->
                  <div class="sm:col-span-2">
                    <label [for]="'duracion_minutos-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Duración (minutos)</label>
                    <div class="mt-1">
                      <input
                        type="number"
                        [id]="'duracion_minutos-' + i"
                        formControlName="duracion_minutos"
                        readonly
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm"
                      >
                    </div>
                  </div>

                  <!-- Cantidad -->
                  <div class="sm:col-span-2">
                    <label [for]="'cantidad-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                    <div class="mt-1">
                      <input
                        type="number"
                        [id]="'cantidad-' + i"
                        formControlName="cantidad"
                        min="1"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                  </div>

                  <!-- Precio -->
                  <div class="sm:col-span-2">
                    <label [for]="'precio-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio (S/)</label>
                    <div class="mt-1">
                      <input
                        type="number"
                        [id]="'precio-' + i"
                        formControlName="precio"
                        min="0"
                        step="0.01"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      >
                    </div>
                  </div>

                  <!-- Notas del cliente -->
                  <div class="sm:col-span-3">
                    <label [for]="'notas_cliente-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas del cliente</label>
                    <div class="mt-1">
                      <textarea
                        [id]="'notas_cliente-' + i"
                        formControlName="notas_cliente"
                        rows="2"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        placeholder="Notas o solicitudes especiales..."
                      ></textarea>
                    </div>
                  </div>

                  <!-- Notas del emprendedor -->
                  <div class="sm:col-span-3">
                    <label [for]="'notas_emprendedor-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas del emprendedor</label>
                    <div class="mt-1">
                      <textarea
                        [id]="'notas_emprendedor-' + i"
                        formControlName="notas_emprendedor"
                        rows="2"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        placeholder="Notas internas del emprendedor..."
                      ></textarea>
                    </div>
                  </div>

                  <!-- Indicador de disponibilidad -->
                  <div class="sm:col-span-6">
                    <div *ngIf="verificandoDisponibilidad[i]" class="flex items-center text-gray-500 dark:text-gray-400">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando disponibilidad...
                    </div>
                    <div *ngIf="disponibilidadVerificada[i] && !verificandoDisponibilidad[i]">
                      <div *ngIf="servicioDisponible[i]" class="flex items-center text-green-600 dark:text-green-400">
                        <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Servicio disponible en la fecha y horario seleccionados
                      </div>
                      <div *ngIf="!servicioDisponible[i]" class="flex items-center text-red-600 dark:text-red-400">
                        <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        El servicio no está disponible en la fecha y horario seleccionados
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen total -->
            <div *ngIf="serviciosArray.controls.length > 0" class="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-900 dark:text-white">Total estimado:</span>
                <span class="text-lg font-semibold text-gray-900 dark:text-white">S/ {{ calcularTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
            <div class="px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                (click)="cancelar()"
                class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!formularioValido() || isSubmitting()"
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg *ngIf="isSubmitting()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting() ? 'Guardando...' : (isEditMode() ? 'Actualizar' : 'Crear') + ' Reserva' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Modal de selección de usuarios -->
        <div *ngIf="mostrarModalUsuarios()" 
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden transition-colors duration-200">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar Cliente</h3>
              <button (click)="cerrarModalUsuarios()" 
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Búsqueda -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="busquedaUsuario"
                  (ngModelChange)="buscarUsuarios()"
                  placeholder="Buscar por nombre o email..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                >
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Lista de usuarios -->
            <div class="overflow-y-auto max-h-96">
              <!-- Loading usuarios -->
              <div *ngIf="cargandoUsuarios()" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p class="mt-2 text-gray-600 dark:text-gray-400">Buscando usuarios...</p>
              </div>

              <!-- Sin resultados -->
              <div *ngIf="!cargandoUsuarios() && usuariosBusqueda().length === 0" class="p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron usuarios</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ busquedaUsuario ? 'Intenta con otros términos de búsqueda' : 'Escribe para buscar usuarios' }}
                </p>
              </div>

              <!-- Lista de usuarios encontrados -->
              <div *ngIf="!cargandoUsuarios() && usuariosBusqueda().length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
                <div *ngFor="let usuario of usuariosBusqueda(); trackBy: trackByUsuario" 
                    (click)="seleccionarUsuario(usuario)"
                    class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                  <div class="flex items-center space-x-4">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                      <img *ngIf="usuario.foto_perfil || usuario.foto_perfil_url || usuario.avatar" 
                          [src]="usuario.foto_perfil || usuario.foto_perfil_url || usuario.avatar" 
                          [alt]="usuario.name"
                          class="h-10 w-10 rounded-full object-cover">
                      <div *ngIf="!usuario.foto_perfil && !usuario.foto_perfil_url && !usuario.avatar" 
                          class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <svg class="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Info del usuario -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ usuario.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ usuario.email }}</p>
                      <div class="flex items-center mt-1 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span *ngIf="usuario.phone">📞 {{ usuario.phone }}</span>
                        <span *ngIf="usuario.country">🌍 {{ usuario.country }}</span>
                        <span [class]="usuario.active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                          {{ usuario.active ? '✓ Activo' : '✗ Inactivo' }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Roles -->
                    <div class="flex-shrink-0">
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let role of usuario.roles" 
                              class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                              [class]="getRoleClass(role.name)">
                          {{ getRoleLabel(role.name) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReservaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservasService = inject(ReservasService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Signals
  loading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  reserva = signal<Reserva | null>(null);
  serviciosDisponibles = signal<Servicio[]>([]);
  emprendedores = signal<Emprendedor[]>([]);
  usuarios = signal<User[]>([]);
  
  // Modal usuarios
  mostrarModalUsuarios = signal<boolean>(false);
  usuariosBusqueda = signal<User[]>([]);
  cargandoUsuarios = signal<boolean>(false);
  usuarioSeleccionado = signal<User | null>(null);
  busquedaUsuario = '';

  // Form
  reservaForm!: FormGroup;
  private reservaId: number | null = null;
  private servicioPreseleccionadoId: number | null = null;

  // Control de disponibilidad
  verificandoDisponibilidad: {[index: number]: boolean} = {};
  disponibilidadVerificada: {[index: number]: boolean} = {};
  servicioDisponible: {[index: number]: boolean} = {};

  // Computed
  formularioValido = computed(() => {
    if (!this.reservaForm) return false;
    
    const formValido = this.reservaForm.valid;
    const tieneServicios = this.serviciosArray.length > 0;
    const serviciosVerificados = this.numServiciosVerificados() === this.serviciosArray.length;
    const hayServiciosDisponibles = !this.hayServiciosNoDisponibles();
    
    return formValido && tieneServicios && serviciosVerificados && hayServiciosDisponibles;
  });

  get serviciosArray(): FormArray {
    return this.reservaForm.get('servicios') as FormArray;
  }

  ngOnInit() {
    this.initForm();
    this.cargarDatosIniciales();

    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.reservaId = +id;
      this.cargarReserva(this.reservaId);
    } else {
      // Verificar si viene con servicio preseleccionado
      const servicioId = this.route.snapshot.queryParams['servicio_id'];
      if (servicioId !== undefined && servicioId !== null) {
        this.servicioPreseleccionadoId = +servicioId;
      }

      // Generar código de reserva
      this.reservaForm.patchValue({
        codigo_reserva: this.generarCodigoReserva()
      });

      this.loading.set(false);

      // Añadir servicio preseleccionado si existe
      if (this.servicioPreseleccionadoId !== undefined) {
        setTimeout(() => this.addServicio(this.servicioPreseleccionadoId!), 100);
      }
    }
  }

  initForm() {
    this.reservaForm = this.fb.group({
      usuario_id: ['', [Validators.required]],
      codigo_reserva: ['', [Validators.required]],
      estado: ['pendiente', [Validators.required]],
      notas: [''],
      servicios: this.fb.array([])
    });
  }

  async cargarDatosIniciales() {
    this.loading.set(true);
    
    try {
      // Cargar en paralelo servicios y emprendedores
      const [servicios, emprendedores] = await Promise.all([
        this.reservasService.getServicios(1, 1000).toPromise(),
        this.reservasService.getEmprendedores(1, 1000).toPromise()
      ]);
      
      this.serviciosDisponibles.set(servicios?.data || []);
      this.emprendedores.set(emprendedores?.data || []);
      
      // Cargar usuarios iniciales para el modal
      this.cargarUsuariosIniciales();
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      alert('Error al cargar los datos necesarios');
    }
    
    if (!this.isEditMode()) {
      this.loading.set(false);
    }
  }

  async cargarUsuariosIniciales() {
    try {
      const usuarios = await this.usersService.getUsersByRole('user').toPromise();
      this.usuarios.set(usuarios || []);
      this.usuariosBusqueda.set(usuarios || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  cargarReserva(id: number) {
    this.reservasService.getReserva(id).subscribe({
      next: (reserva) => {
        this.reserva.set(reserva);
        
        // Llenar formulario con datos de la reserva
        this.reservaForm.patchValue({
          usuario_id: reserva.usuario_id,
          codigo_reserva: reserva.codigo_reserva,
          estado: reserva.estado,
          notas: reserva.notas || ''
        });

        // Establecer usuario seleccionado - Convert Usuario to User
        if (reserva.usuario) {
          const user: User = {
            id: reserva.usuario.id,
            name: reserva.usuario.name,
            email: reserva.usuario.email,
            phone: reserva.usuario.phone ?? '', // 👈 corrección aquí
            country: reserva.usuario.country,
            active: reserva.usuario.active,
            foto_perfil: reserva.usuario.foto_perfil,
            foto_perfil_url: reserva.usuario.foto_perfil_url,
            avatar: reserva.usuario.avatar,
            roles: []
          };
          this.usuarioSeleccionado.set(user);
        }

        
        // Cargar servicios de la reserva
        if (reserva.servicios && reserva.servicios.length > 0) {
          reserva.servicios.forEach((servicio, index) => {
            this.addServicio(undefined, servicio);
            // Marcar como verificado y disponible
            this.disponibilidadVerificada[index] = true;
            this.servicioDisponible[index] = true;
            this.verificandoDisponibilidad[index] = false;
          });
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reserva:', error);
        this.loading.set(false);
        alert('Error al cargar la reserva');
      }
    });
  }

  getServicioFormGroup(index: number): FormGroup {
    return this.serviciosArray.at(index) as FormGroup;
  }

  createServicioFormGroup(reservaServicio?: ReservaServicio): FormGroup {
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().slice(0, 5);

    return this.fb.group({
      id: [reservaServicio?.id || null],
      servicio_id: [reservaServicio?.servicio_id || this.servicioPreseleccionadoId || '', [Validators.required]],
      emprendedor_id: [reservaServicio?.emprendedor_id || '', [Validators.required]],
      fecha_inicio: [
        reservaServicio?.fecha_inicio ? reservaServicio.fecha_inicio.split('T')[0] : fechaActual, 
        [Validators.required]
      ],
      fecha_fin: [
        reservaServicio?.fecha_fin ? reservaServicio.fecha_fin.split('T')[0] : null
      ],
      hora_inicio: [reservaServicio?.hora_inicio || horaActual, [Validators.required]],
      hora_fin: [reservaServicio?.hora_fin || this.sumarHoras(horaActual, 1), [Validators.required]],
      duracion_minutos: [reservaServicio?.duracion_minutos || 60, [Validators.required, Validators.min(1)]],
      cantidad: [reservaServicio?.cantidad || 1, [Validators.min(1)]],
      precio: [reservaServicio?.precio || 0, [Validators.min(0)]],
      estado: [reservaServicio?.estado || 'pendiente', [Validators.required]],
      notas_cliente: [reservaServicio?.notas_cliente || ''],
      notas_emprendedor: [reservaServicio?.notas_emprendedor || '']
    });
  }

  addServicio(servicioId?: number, reservaServicio?: ReservaServicio) {
    const index = this.serviciosArray.length;
    this.serviciosArray.push(this.createServicioFormGroup(reservaServicio));

    // Inicializar estado de disponibilidad
    this.verificandoDisponibilidad[index] = false;
    this.disponibilidadVerificada[index] = false;
    this.servicioDisponible[index] = false;

    // Si se especifica un servicio, seleccionarlo
    if (servicioId && !reservaServicio) {
      this.getServicioFormGroup(index).patchValue({ servicio_id: servicioId });
      this.onServicioChange(index);
    }
  }

  removeServicio(index: number) {
    this.serviciosArray.removeAt(index);
    this.reindexarDisponibilidad(index);
  }

  onServicioChange(index: number) {
    const servicioId = this.getServicioFormGroup(index).get('servicio_id')?.value;
    if (!servicioId) return;

    // Buscar el servicio seleccionado
    const servicio = this.serviciosDisponibles().find(s => s.id == servicioId);
    if (!servicio) return;

    // Actualizar emprendedor y precio automáticamente
    this.getServicioFormGroup(index).patchValue({
      emprendedor_id: servicio.emprendedor_id,
      precio: servicio.precio_referencial || 0
    });

    // Verificar disponibilidad
    this.verificarDisponibilidad(index);
  }

  onFechaHoraChange(index: number) {
    this.calcularDuracion(index);
    this.verificarDisponibilidad(index);
  }

  calcularDuracion(index: number) {
    const formGroup = this.getServicioFormGroup(index);
    const horaInicio = formGroup.get('hora_inicio')?.value;
    const horaFin = formGroup.get('hora_fin')?.value;

    if (horaInicio && horaFin) {
      const inicioMinutos = this.horaAMinutos(horaInicio);
      const finMinutos = this.horaAMinutos(horaFin);

      let duracionMinutos = finMinutos - inicioMinutos;
      if (duracionMinutos <= 0) {
        duracionMinutos += 24 * 60; // Día siguiente
      }

      formGroup.patchValue({ duracion_minutos: duracionMinutos });
    }
  }

  verificarDisponibilidad(index: number) {
    const formGroup = this.getServicioFormGroup(index);
    const servicioId = formGroup.get('servicio_id')?.value;
    const fechaInicio = formGroup.get('fecha_inicio')?.value;
    const fechaFin = formGroup.get('fecha_fin')?.value;
    const horaInicio = formGroup.get('hora_inicio')?.value;
    const horaFin = formGroup.get('hora_fin')?.value;
    const reservaServicioId = formGroup.get('id')?.value;

    if (!servicioId || !fechaInicio || !horaInicio || !horaFin) {
      this.disponibilidadVerificada[index] = false;
      return;
    }

    this.verificandoDisponibilidad[index] = true;
    this.disponibilidadVerificada[index] = false;

    this.reservasService.verificarDisponibilidadServicio(
      servicioId,
      fechaInicio,
      fechaFin,
      this.formatearHora(horaInicio),
      this.formatearHora(horaFin),
      reservaServicioId
    ).subscribe({
      next: (result) => {
        this.verificandoDisponibilidad[index] = false;
        this.disponibilidadVerificada[index] = true;
        this.servicioDisponible[index] = result.disponible;
      },
      error: (error) => {
        console.error('Error al verificar disponibilidad:', error);
        this.verificandoDisponibilidad[index] = false;
        this.disponibilidadVerificada[index] = true;
        this.servicioDisponible[index] = false;
      }
    });
  }

  submitForm() {
    if (!this.formularioValido() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const formData = this.prepararDatos();

    const operacion = this.isEditMode() && this.reservaId
      ? this.reservasService.updateReserva(this.reservaId, formData)
      : this.reservasService.createReserva(formData);

    operacion.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const mensaje = this.isEditMode() ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente';
        alert(mensaje);
        this.router.navigate(['/admin/reservas']);
      },
      error: (error) => {
        console.error('Error al guardar reserva:', error);
        this.isSubmitting.set(false);
        alert('Error al guardar la reserva. Por favor, intente nuevamente.');
      }
    });
  }

  prepararDatos(): CreateReservaRequest | UpdateReservaRequest {
    const formValue = this.reservaForm.value;
    
    return {
      usuario_id: formValue.usuario_id,
      codigo_reserva: formValue.codigo_reserva,
      estado: formValue.estado,
      notas: formValue.notas || '',
      servicios: formValue.servicios.map((servicio: any) => ({
        ...servicio,
        hora_inicio: this.formatearHora(servicio.hora_inicio),
        hora_fin: this.formatearHora(servicio.hora_fin)
      }))
    };
  }

  cancelar() {
    this.router.navigate(['/admin/reservas']);
  }

  generarNuevoCodigo() {
    this.reservaForm.patchValue({
      codigo_reserva: this.generarCodigoReserva()
    });
  }

  calcularTotal(): number {
    if (!this.reservaForm) return 0;
    
    return this.serviciosArray.controls.reduce((total, control) => {
      const precio = control.get('precio')?.value || 0;
      const cantidad = control.get('cantidad')?.value || 1;
      return total + (precio * cantidad);
    }, 0);
  }

  // Métodos del modal de usuarios
  abrirModalUsuarios() {
    this.mostrarModalUsuarios.set(true);
    this.busquedaUsuario = '';
    // Mostrar usuarios ya cargados
    const usuariosActuales = this.usuarios();
    this.usuariosBusqueda.set(usuariosActuales);
  }

  cerrarModalUsuarios() {
    this.mostrarModalUsuarios.set(false);
    this.busquedaUsuario = '';
    this.usuariosBusqueda.set([]);
  }

  seleccionarUsuario(usuario: User) {
    this.usuarioSeleccionado.set(usuario);
    this.reservaForm.patchValue({ usuario_id: usuario.id });
    this.cerrarModalUsuarios();
  }

  buscarUsuarios() {
    if (!this.busquedaUsuario.trim()) {
      // Si no hay búsqueda, mostrar usuarios cargados inicialmente
      this.usuariosBusqueda.set(this.usuarios());
      return;
    }

    this.cargandoUsuarios.set(true);
    
    this.usersService.searchUsers(this.busquedaUsuario).subscribe({
      next: (usuarios: User[]) => {
        this.usuariosBusqueda.set(usuarios);
        this.cargandoUsuarios.set(false);
      },
      error: (error: any) => {
        console.error('Error al buscar usuarios:', error);
        this.cargandoUsuarios.set(false);
        // En caso de error, filtrar localmente
        const usuariosActuales = this.usuarios();
        const filtrados = usuariosActuales.filter(u => 
          u.name.toLowerCase().includes(this.busquedaUsuario.toLowerCase()) ||
          u.email.toLowerCase().includes(this.busquedaUsuario.toLowerCase())
        );
        this.usuariosBusqueda.set(filtrados);
      }
    });
  }

  getRoleClass(role: string): string {
    const clases = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'emprendedor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'user': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'moderador': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return clases[role as keyof typeof clases] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }

  getRoleLabel(role: string): string {
    const labels = {
      'admin': 'Admin',
      'emprendedor': 'Emprendedor',
      'user': 'Usuario',
      'moderador': 'Moderador'
    };
    return labels[role as keyof typeof labels] || role;
  }

  // Métodos de utilidad
  trackByUsuario(index: number, usuario: User): number {
    return usuario.id ?? 0;
  }


  trackByServicioDisponible(index: number, servicio: Servicio): number {
    return servicio.id;
  }

  trackByServicio(index: number): number {
    return index;
  }

  getEmprendedorNombre(index: number): string {
    const emprendedorId = this.getServicioFormGroup(index).get('emprendedor_id')?.value;
    if (!emprendedorId) return '';
    
    const emprendedor = this.emprendedores().find(e => e.id === emprendedorId);
    return emprendedor?.nombre || '';
  }

  horaFinInvalida(index: number): boolean {
    const formGroup = this.getServicioFormGroup(index);
    const horaInicio = formGroup.get('hora_inicio')?.value;
    const horaFin = formGroup.get('hora_fin')?.value;
    
    if (!horaInicio || !horaFin) return false;
    
    return horaFin <= horaInicio;
  }

  hayServiciosNoDisponibles(): boolean {
    return Object.keys(this.disponibilidadVerificada).some(key => {
      const index = parseInt(key);
      return this.disponibilidadVerificada[index] && !this.servicioDisponible[index];
    });
  }

  numServiciosVerificados(): number {
    return Object.values(this.disponibilidadVerificada).filter(v => v).length;
  }

  private reindexarDisponibilidad(indexEliminado: number) {
    const newVerificando: {[index: number]: boolean} = {};
    const newVerificada: {[index: number]: boolean} = {};
    const newDisponible: {[index: number]: boolean} = {};

    Object.keys(this.verificandoDisponibilidad).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > indexEliminado) {
        newVerificando[numKey - 1] = this.verificandoDisponibilidad[numKey];
        newVerificada[numKey - 1] = this.disponibilidadVerificada[numKey];
        newDisponible[numKey - 1] = this.servicioDisponible[numKey];
      } else if (numKey < indexEliminado) {
        newVerificando[numKey] = this.verificandoDisponibilidad[numKey];
        newVerificada[numKey] = this.disponibilidadVerificada[numKey];
        newDisponible[numKey] = this.servicioDisponible[numKey];
      }
    });

    this.verificandoDisponibilidad = newVerificando;
    this.disponibilidadVerificada = newVerificada;
    this.servicioDisponible = newDisponible;
  }

  private generarCodigoReserva(): string {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().substr(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `RES-${year}${month}${day}-${codigo}`;
  }

  private sumarHoras(hora: string, horas: number): string {
    const [h, m] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(h, m, 0);
    fecha.setTime(fecha.getTime() + horas * 60 * 60 * 1000);

    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  }

  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private formatearHora(hora: string): string {
    if (!hora) return '00:00:00';
    
    const partes = hora.split(':');
    while (partes.length < 3) {
      partes.push('00');
    }

    return partes.map(p => p.padStart(2, '0')).join(':');
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}