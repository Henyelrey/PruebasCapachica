import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventosService } from '../evento.service';
import { Evento, Slider, Horario } from '../evento.model';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { SliderImage, SliderUploadComponent } from '../../../../../shared/components/slider-upload/slider-upload.component';
import { UbicacionMapComponent } from '../../../../../shared/components/ubicacion-map/ubicacion-map.component';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ReactiveFormsModule, 
    AdminHeaderComponent,
    SliderUploadComponent,
    UbicacionMapComponent
  ],
  template: `
    <!-- Header con fondo profesional -->
    <app-admin-header 
      [title]="isEditMode ? 'Editar Evento' : 'Crear Evento'" 
      [subtitle]="isEditMode ? 'Modificar información del evento' : 'Agregar un nuevo evento al sistema'"
    ></app-admin-header>
    
    <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="space-y-6">
        <div class="sm:flex sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ isEditMode ? 'Formulario de Edición' : 'Formulario de Creación' }}</h2>
          <div class="mt-4 sm:mt-0">
            <a 
              routerLink="/admin/evento" 
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver al listado
            </a>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-700">
          @if (loading) {
            <div class="flex justify-center items-center p-8">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
              <span class="ml-4 text-gray-700 dark:text-gray-300">Cargando datos del evento...</span>
            </div>
          } @else {
            <form [formGroup]="eventoForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
              <!-- Información básica -->
              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Información básica</h3>
                
                <!-- Nombre del evento -->
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del evento</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      id="nombre" 
                      formControlName="nombre" 
                      class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200" 
                      [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('nombre')}"
                      placeholder="Ingrese el nombre del evento"
                    />
                    @if (isFieldInvalid('nombre')) {
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p class="mt-2 text-sm text-red-600 dark:text-red-400">El nombre del evento es requerido</p>
                    }
                  </div>
                </div>
                
                <!-- Descripción -->
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <textarea 
                      id="descripcion" 
                      formControlName="descripcion" 
                      rows="4" 
                      class="py-3 px-4 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Ingrese la descripción del evento"
                    ></textarea>
                  </div>
                </div>
                
                <!-- Tipo de evento y idioma principal (fila) -->
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="tipo_evento" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de evento</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        id="tipo_evento" 
                        formControlName="tipo_evento" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Ej: Cultural, Deportivo, etc."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label for="idioma_principal" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Idioma principal</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                        </svg>
                      </div>
                      <select 
                        id="idioma_principal" 
                        formControlName="idioma_principal" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      >
                        <option [ngValue]="null">Seleccionar idioma</option>
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                        <option value="fr">Francés</option>
                        <option value="de">Alemán</option>
                        <option value="it">Italiano</option>
                        <option value="qu">Quechua</option>
                        <option value="ay">Aymara</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <!-- ID Emprendedor -->
                <div>
                  <label for="id_emprendedor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID del Emprendedor</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input 
                      type="number" 
                      id="id_emprendedor" 
                      formControlName="id_emprendedor" 
                      class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="ID del emprendedor organizador"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Fecha y horario -->
              <div class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Fecha y horario</h3>
                
                <!-- Fecha y hora de inicio (fila) -->
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="fecha_inicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de inicio</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input 
                        type="date" 
                        id="fecha_inicio" 
                        formControlName="fecha_inicio" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label for="hora_inicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de inicio</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="time" 
                        id="hora_inicio" 
                        formControlName="hora_inicio" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Fecha y hora de fin (fila) -->
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="fecha_fin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de fin</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input 
                        type="date" 
                        id="fecha_fin" 
                        formControlName="fecha_fin" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label for="hora_fin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de fin</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="time" 
                        id="hora_fin" 
                        formControlName="hora_fin" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Duración en horas -->
                <div>
                  <label for="duracion_horas" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Duración (horas)</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <input 
                      type="number" 
                      id="duracion_horas" 
                      formControlName="duracion_horas" 
                      min="0"
                      step="0.5"
                      class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Duración del evento en horas"
                    />
                  </div>
                </div>
                
                <!-- Horarios específicos -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h4 class="text-base font-medium text-gray-700 dark:text-gray-300">Horarios específicos</h4>
                    <button 
                      type="button" 
                      (click)="addHorario()" 
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                    >
                      <svg class="-ml-0.5 mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Agregar horario
                    </button>
                  </div>
                  
                  <div formArrayName="horarios" class="space-y-4">
                    @for (horario of horarios.controls; track $index) {
                      <div [formGroupName]="$index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
                        <div class="flex justify-between items-center mb-3">
                          <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Horario #{{ $index + 1 }}</h5>
                          <button 
                            type="button" 
                            (click)="removeHorario($index)" 
                            class="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Día de la semana</label>
                            <select 
                              formControlName="dia_semana" 
                              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            >
                              <option value="lunes">Lunes</option>
                              <option value="martes">Martes</option>
                              <option value="miercoles">Miércoles</option>
                              <option value="jueves">Jueves</option>
                              <option value="viernes">Viernes</option>
                              <option value="sabado">Sábado</option>
                              <option value="domingo">Domingo</option>
                            </select>
                          </div>
                          
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Hora de inicio</label>
                            <input 
                              type="time" 
                              formControlName="hora_inicio" 
                              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                          </div>
                          
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Hora de fin</label>
                            <input 
                              type="time" 
                              formControlName="hora_fin" 
                              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                            />
                          </div>
                          
                          <div class="sm:col-span-3">
                            <label class="inline-flex items-center">
                              <input 
                                type="checkbox" 
                                formControlName="activo" 
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                              />
                              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Activo</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                    
                    @if (horarios.controls.length === 0) {
                      <div class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                        No hay horarios específicos. Haga clic en "Agregar horario" para añadir uno.
                      </div>
                    }
                  </div>
                </div>
              </div>
              
              <!-- Ubicación -->
              <div class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Ubicación</h3>
                
                <app-ubicacion-map
                  [latitud]="eventoForm.get('coordenada_x')?.value"
                  [longitud]="eventoForm.get('coordenada_y')?.value"
                  (ubicacionChange)="onMapLocationChange($event)"
                ></app-ubicacion-map>
                
                <!-- Coordenadas -->
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="coordenada_x" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitud</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="number" 
                        id="coordenada_x" 
                        formControlName="coordenada_x" 
                        step="0.000001"
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Ej: -12.046374"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label for="coordenada_y" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitud</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="number" 
                        id="coordenada_y" 
                        formControlName="coordenada_y" 
                        step="0.000001"
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Ej: -77.042793"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Qué llevar -->
              <div class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Información adicional</h3>
                
                <div>
                  <label for="que_llevar" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Qué llevar</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <textarea 
                      id="que_llevar" 
                      formControlName="que_llevar" 
                      rows="3" 
                      class="py-3 px-4 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Indique qué deben llevar los asistentes al evento"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Sliders / Imágenes -->
              <div class="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Imágenes del evento</h3>
                
                <app-slider-upload
                  [title]="'Imágenes principales'"
                  [slidersFormArray]="slidersArray"
                  [existingSliders]="existingSliders"
                  [isSliderPrincipal]="true"
                  (changeSlidersEvent)="onSlidersChange($event)"
                  (deletedSlidersEvent)="onSlidersDeleted($event)"
                ></app-slider-upload>
              </div>
              
              @if (error) {
                <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</h3>
                      @if (validationErrors && validationErrors.length > 0) {
                        <div class="mt-2 text-sm text-red-700 dark:text-red-400">
                          <ul class="list-disc pl-5 space-y-1">
                            @for (error of validationErrors; track $index) {
                              <li>{{ error }}</li>
                            }
                          </ul>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
              
              <div class="flex justify-end space-x-3">
                <button 
                  type="button"
                  routerLink="/admin/evento"
                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit" 
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 dark:bg-primary-700 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 transition-colors duration-200"
                  [disabled]="saving"
                >
                  @if (saving) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  } @else {
                    {{ isEditMode ? 'Actualizar' : 'Crear' }}
                  }
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos adicionales para el modo oscuro y efectos */
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
    
    :host-context(.dark-theme) {
      background-color: #111827;
    }
    
    /* Mejora para que el hover en dark mode sea más oscuro y no blanco */
    .dark .hover\\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
    
    /* Estilos para el checkbox cuando está marcado */
    input[type="checkbox"]:checked {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
    }
    
    /* Estilos para input type="date" y type="time" en dark mode */
    .dark input[type="date"], .dark input[type="time"] {
      color-scheme: dark;
    }
  `]
})
export class EventoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventosService = inject(EventosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  
  eventoForm!: FormGroup;
  slidersArray!: FormArray;
  eventoId: number | null = null;
  
  
  loading = false;
  saving = false;
  error = '';
  validationErrors: string[] = [];
  
  // Sliders y archivos
  existingSliders: SliderImage[] = [];
  sliders: SliderImage[] = [];
  deletedSliderIds: number[] = [];
  
  get isEditMode(): boolean {
    return this.eventoId !== null;
  }
  
  get horarios(): FormArray {
    return this.eventoForm.get('horarios') as FormArray;
  }
  
  ngOnInit() {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = +id;
      this.loading = true;
      this.loadEvento(this.eventoId);
    }
  }
  
  initForm() {
    // Crear FormArray para sliders
    this.slidersArray = this.fb.array([]);
    
    this.eventoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      tipo_evento: [''],
      idioma_principal: [null],
      fecha_inicio: [''],
      hora_inicio: [''],
      fecha_fin: [''],
      hora_fin: [''],
      duracion_horas: [''],
      coordenada_x: [''],
      coordenada_y: [''],
      id_emprendedor: [''],
      que_llevar: [''],
      horarios: this.fb.array([])
    });
  }
  
  loadEvento(id: number) {
    this.eventosService.getEvento(id).subscribe({
      next: (evento) => {
        this.patchFormWithEvento(evento);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'Error al cargar los datos del evento. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }
  
  patchFormWithEvento(evento: Evento) {
    // Convertir horas al formato requerido (ajustar del formato de 24 horas a formato "HH:mm")
    const formatTime = (timeStr?: string) => {
      if (!timeStr) return '';
      // Si ya está en formato HH:mm, devolverlo como está
      if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
      
      try {
        // Si viene con segundos (HH:mm:ss), eliminarlos
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
          return timeStr.substring(0, 5);
        }
        
        // Intentar crear un objeto Date y extraer la hora
        const time = new Date(`2000-01-01T${timeStr}`);
        if (!isNaN(time.getTime())) {
          return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        }
      } catch (e) {
        console.error('Error al formatear la hora:', e);
      }
      
      return timeStr;
    };
    
    // Datos básicos
    this.eventoForm.patchValue({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      tipo_evento: evento.tipo_evento || '',
      idioma_principal: evento.idioma_principal || null,
      fecha_inicio: evento.fecha_inicio || '',
      hora_inicio: formatTime(evento.hora_inicio) || '',
      fecha_fin: evento.fecha_fin || '',
      hora_fin: formatTime(evento.hora_fin) || '',
      duracion_horas: evento.duracion_horas || '',
      coordenada_x: evento.coordenada_x || '',
      coordenada_y: evento.coordenada_y || '',
      id_emprendedor: evento.id_emprendedor || '',
      que_llevar: evento.que_llevar || ''
    });
    
    // Horarios
    this.resetHorarios();
    if (evento.horarios && evento.horarios.length > 0) {
      evento.horarios.forEach(horario => {
        this.addHorario({
          ...horario,
          hora_inicio: formatTime(horario.hora_inicio),
          hora_fin: formatTime(horario.hora_fin)
        });
      });
    } else {
      // Añadir al menos un horario por defecto si no hay ninguno
      this.addHorario();
    }
    
    // Sliders - Preparar para el componente SliderUpload
    if (evento.sliders && evento.sliders.length > 0) {
      this.existingSliders = evento.sliders.map(slider => {
        return {
          id: slider.id ?? undefined, // Reemplaza null por undefined
          nombre: slider.nombre || 'Imagen',
          es_principal: slider.es_principal ?? true,
          orden: slider.orden || 0,
          imagen: typeof slider.imagen === 'string' ? slider.imagen : null,
          url_completa: typeof slider.imagen === 'string' ? slider.imagen : undefined,
          titulo: slider.titulo || '',
          descripcion: slider.descripcion || ''
        };
      });
    }

  }
  
  resetHorarios() {
    while (this.horarios.length !== 0) {
      this.horarios.removeAt(0);
    }
  }
  
  addHorario(horario?: Horario) {
    this.horarios.push(this.fb.group({
      id: [horario?.id || null],
      dia_semana: [horario?.dia_semana || 'lunes', Validators.required],
      hora_inicio: [horario?.hora_inicio || '', Validators.required],
      hora_fin: [horario?.hora_fin || '', Validators.required],
      activo: [horario?.activo ?? true]
    }));
  }

  
  removeHorario(index: number) {
    const horario = this.horarios.at(index);
    const horarioId = horario.get('id')?.value;
    
    // Si tiene ID y estamos en modo edición, podríamos guardarlo para eliminarlo en el backend
    // Pero parece que el backend no requiere esto para horarios
    
    this.horarios.removeAt(index);
  }
  
  onMapLocationChange(coords: {lat: number, lng: number}) {
    this.eventoForm.patchValue({
      coordenada_x: coords.lat,
      coordenada_y: coords.lng
    });
  }
  
  onSlidersChange(sliders: SliderImage[]) {
    this.sliders = sliders;
  }
  
  onSlidersDeleted(sliderIds: number[]) {
    this.deletedSliderIds = sliderIds;
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventoForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.saving)) || false;
  }
  
  formatTimeToHMS(timeStr: string): string {
    if (!timeStr) return '';
    
    // Si ya tiene segundos, devolverlo tal cual
    if (timeStr.includes(':') && timeStr.split(':').length === 3) {
      return timeStr;
    }
    
    // Asegurar formato HH:MM:SS
    if (timeStr.includes(':') && timeStr.split(':').length === 2) {
      return `${timeStr}:00`;
    }
    
    return timeStr;
  }
  
  prepareFormData(): FormData {
    const formData = new FormData();
    const formValues = this.eventoForm.value;
    
    // Asegurarse de que los campos obligatorios estén incluidos
    formData.append('nombre', formValues.nombre || '');
    
    // Formatear campos de hora al formato H:i:s
    if (formValues.hora_inicio) {
      formData.append('hora_inicio', this.formatTimeToHMS(formValues.hora_inicio));
    }
    
    if (formValues.hora_fin) {
      formData.append('hora_fin', this.formatTimeToHMS(formValues.hora_fin));
    }
    
    // Añadir otros campos básicos
    const fieldsToAdd = [
      'descripcion', 'tipo_evento', 'idioma_principal', 'fecha_inicio', 'fecha_fin',
      'duracion_horas', 'coordenada_x', 'coordenada_y', 'id_emprendedor', 
      'ubicacion_referencia', 'que_llevar'
    ];
    
    fieldsToAdd.forEach(field => {
      if (formValues[field] !== null && formValues[field] !== undefined && formValues[field] !== '') {
        formData.append(field, formValues[field].toString());
      }
    });
    
    // Añadir categorías si existen
    if (formValues.categorias && formValues.categorias.length > 0) {
      formValues.categorias.forEach((cat: number, index: number) => {
        formData.append(`categorias[${index}]`, cat.toString());
      });
    } else {
      // Si no hay categorías, enviar al menos una vacía para evitar errores
      formData.append('categorias[]', '');
    }
    
    // Añadir horarios en el formato requerido
    if (formValues.horarios && formValues.horarios.length > 0) {
      formValues.horarios.forEach((horario: any, index: number) => {
        // Formatear las horas en formato correcto
        const horaInicio = this.formatTimeToHMS(horario.hora_inicio);
        const horaFin = this.formatTimeToHMS(horario.hora_fin);
        
        // Añadir cada campo del horario con la notación de índice
        formData.append(`horarios[${index}][dia_semana]`, horario.dia_semana);
        formData.append(`horarios[${index}][hora_inicio]`, horaInicio);
        formData.append(`horarios[${index}][hora_fin]`, horaFin);
        formData.append(`horarios[${index}][activo]`, horario.activo ? 'true' : 'false');
        
        // Si tiene ID, añadirlo también
        if (horario.id) {
          formData.append(`horarios[${index}][id]`, horario.id.toString());
        }
      });
    } else {
      // Si no hay horarios, asegurarse de que se envía al menos un horario vacío
      formData.append(`horarios[0][dia_semana]`, 'lunes');
      formData.append(`horarios[0][hora_inicio]`, '09:00:00');
      formData.append(`horarios[0][hora_fin]`, '18:00:00');
      formData.append(`horarios[0][activo]`, 'true');
    }
    
    // Añadir sliders eliminados
    if (this.deletedSliderIds.length > 0) {
      formData.append('deleted_sliders', JSON.stringify(this.deletedSliderIds));
    }
    
    // Procesar sliders
    if (this.sliders && this.sliders.length > 0) {
      this.sliders.forEach((slider, index) => {
        // Si hay imagen como File, añadirla
        if (slider.imagen instanceof File) {
          formData.append(`sliders[${index}][imagen]`, slider.imagen as File);
        }
        
        // Añadir resto de campos
        formData.append(`sliders[${index}][nombre]`, slider.nombre || `Imagen ${index + 1}`);
        formData.append(`sliders[${index}][es_principal]`, slider.es_principal ? 'true' : 'false');
        formData.append(`sliders[${index}][orden]`, slider.orden.toString());
        
        if (slider.id) {
          formData.append(`sliders[${index}][id]`, slider.id.toString());
        }
        
        if (slider.titulo) {
          formData.append(`sliders[${index}][titulo]`, slider.titulo);
        }
        
        if (slider.descripcion) {
          formData.append(`sliders[${index}][descripcion]`, slider.descripcion);
        }
      });
    }
    

    return formData;
  }
  
  onSubmit() {
    this.saving = true;
    this.error = '';
    this.validationErrors = [];
    
    // Asegurar que el formulario tenga valores válidos en campos requeridos
    const formValues = this.eventoForm.value;
    
    // Si no hay nombre, mostrar error y retornar
    if (!formValues.nombre) {
      this.error = 'El nombre del evento es obligatorio.';
      this.saving = false;
      return;
    }
    
    // Preparar los datos del formulario
    const formData = this.prepareFormData();
    
    // Asegurar que el ID emprendedor sea numérico
    if (formValues.id_emprendedor) {
      formData.set('id_emprendedor', formValues.id_emprendedor.toString());
    }
    
    if (this.isEditMode && this.eventoId) {
      this.eventosService.updateEvento(this.eventoId, formData).subscribe({
        next: (message) => {
          alert(message);
          this.saving = false;
          this.router.navigate(['/admin/evento']);
        },
        error: (error) => {
          console.error('Error al actualizar evento:', error);
          this.handleApiError(error);
          this.saving = false;
        }
      });
    } else {
      this.eventosService.createEvento(formData).subscribe({
        next: (message) => {
          alert(message);
          this.saving = false;
          this.router.navigate(['/admin/evento']);
        },
        error: (error) => {
          console.error('Error al crear evento:', error);
          this.handleApiError(error);
          this.saving = false;
        }
      });
    }
  }
  
  handleApiError(error: any) {
    // Mensaje general de error
    this.error = error.error?.message || 'Error al procesar la solicitud. Por favor, intente nuevamente.';
    
    // Recopilar errores de validación
    this.validationErrors = [];
    
    if (error.error?.errors) {
      const errorObj = error.error.errors;
      for (const field in errorObj) {
        if (Array.isArray(errorObj[field])) {
          errorObj[field].forEach((msg: string) => {
            this.validationErrors.push(`${field}: ${msg}`);
          });
        } else {
          this.validationErrors.push(`${field}: ${errorObj[field]}`);
        }
      }
    }
  }
}