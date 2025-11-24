import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento, Servicio, Horario } from '../../../core/models/emprendimiento-admin.model';
import { SliderUploadComponent, SliderImage } from '../../../shared/components/slider-upload/slider-upload.component';
import { UbicacionMapComponent } from '../../../shared/components/ubicacion-map/ubicacion-map.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    SliderUploadComponent, 
    UbicacionMapComponent
  ],
  template: `
    <!-- Success/Error Messages glassmorphism -->
      <div *ngIf="success" class="fixed top-4 right-4 z-50 max-w-md">
        <div class="backdrop-blur-sm bg-green-500/20 border border-green-500/30 rounded-2xl p-4 shadow-xl">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-200">{{ success }}</p>
            </div>
            <div class="ml-auto pl-3">
              <button (click)="success = ''" class="text-green-300 hover:text-green-400 transition-colors duration-300">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State glassmorphism -->
      <div *ngIf="loading" class="flex justify-center items-center py-20">
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
              <svg class="h-6 w-6 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-red-200 font-semibold">Error al cargar el formulario</h3>
              <p class="text-red-300 text-sm">{{ error }}</p>
              <button (click)="retryLoad()" 
                      class="mt-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Errors glassmorphism -->
      <div *ngIf="validationErrors && getObjectKeys(validationErrors).length > 0" class="mb-8">
        <div class="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-red-200 font-semibold mb-2">Errores de validación</h3>
              <ul class="text-red-300 text-sm space-y-1">
                <li *ngFor="let error of getValidationErrorsList()">{{ error }}</li>
              </ul>
            </div>
            <div class="ml-auto pl-3">
              <button (click)="clearValidationErrors()" class="text-red-300 hover:text-red-400 transition-colors duration-300">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Header del formulario -->
      <div *ngIf="!loading && !error" class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
              {{ isEditMode ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}
            </h1>
            <p class="text-slate-300 dark:text-slate-400 mt-1">
              {{ emprendimiento?.nombre || 'Cargando...' }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <a [routerLink]="['/admin-emprendedores/emprendimiento', emprendimientoId, 'servicios']"
              class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60">
              <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-medium">Volver a Servicios</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Form glassmorphism -->
      <div *ngIf="!loading && !error">
        <form [formGroup]="servicioForm" (ngSubmit)="onSubmit()">
          
          <!-- Tabs Container glassmorphism -->
          <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
            
            <!-- Tabs Navigation -->
            <div class="border-b border-white/10 dark:border-slate-700/50">
              <nav class="-mb-px flex space-x-8 px-6 pt-4 overflow-x-auto">
                <button
                  type="button"
                  (click)="activeTab = 'informacion'"
                  [class.border-orange-400]="activeTab === 'informacion'"
                  [class.text-orange-300]="activeTab === 'informacion'"
                  [class.border-transparent]="activeTab !== 'informacion'"
                  [class.text-slate-400]="activeTab !== 'informacion'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:text-slate-300 hover:border-slate-400 transition-all duration-300">
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Información Básica
                  </div>
                </button>
                <button
                  type="button"
                  (click)="activeTab = 'ubicacion'"
                  [class.border-orange-400]="activeTab === 'ubicacion'"
                  [class.text-orange-300]="activeTab === 'ubicacion'"
                  [class.border-transparent]="activeTab !== 'ubicacion'"
                  [class.text-slate-400]="activeTab !== 'ubicacion'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:text-slate-300 hover:border-slate-400 transition-all duration-300">
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    Ubicación
                  </div>
                </button>
                <button
                  type="button"
                  (click)="activeTab = 'horarios'"
                  [class.border-orange-400]="activeTab === 'horarios'"
                  [class.text-orange-300]="activeTab === 'horarios'"
                  [class.border-transparent]="activeTab !== 'horarios'"
                  [class.text-slate-400]="activeTab !== 'horarios'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:text-slate-300 hover:border-slate-400 transition-all duration-300">
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Horarios
                  </div>
                </button>
                <button
                  type="button"
                  (click)="activeTab = 'imagenes'"
                  [class.border-orange-400]="activeTab === 'imagenes'"
                  [class.text-orange-300]="activeTab === 'imagenes'"
                  [class.border-transparent]="activeTab !== 'imagenes'"
                  [class.text-slate-400]="activeTab !== 'imagenes'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap hover:text-slate-300 hover:border-slate-400 transition-all duration-300">
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Imágenes
                  </div>
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Tab: Información Básica -->
              <div *ngIf="activeTab === 'informacion'" class="space-y-6">
                <h3 class="text-lg font-medium text-white mb-6">Información Básica</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Nombre del Servicio -->
                  <div class="md:col-span-2">
                    <label for="nombre" class="block text-sm font-medium text-slate-300 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      formControlName="nombre"
                      class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                      placeholder="Ej: Tour en kayak por el lago"
                      [class.border-red-400]="isFieldInvalid('nombre')"
                      [class.focus:border-red-400]="isFieldInvalid('nombre')">
                    <div *ngIf="isFieldInvalid('nombre')" class="mt-1 text-sm text-red-300">
                      <span *ngIf="servicioForm.get('nombre')?.errors?.['required']">El nombre del servicio es requerido</span>
                      <span *ngIf="servicioForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 3 caracteres</span>
                    </div>
                  </div>

                  <!-- Precio Referencial -->
                  <div>
                    <label for="precio_referencial" class="block text-sm font-medium text-slate-300 mb-2">
                      Precio Referencial (S/.) *
                    </label>
                    <input
                      type="number"
                      id="precio_referencial"
                      formControlName="precio_referencial"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                      placeholder="0.00"
                      [class.border-red-400]="isFieldInvalid('precio_referencial')"
                      [class.focus:border-red-400]="isFieldInvalid('precio_referencial')">
                    <div *ngIf="isFieldInvalid('precio_referencial')" class="mt-1 text-sm text-red-300">
                      <span *ngIf="servicioForm.get('precio_referencial')?.errors?.['required']">El precio es requerido</span>
                      <span *ngIf="servicioForm.get('precio_referencial')?.errors?.['min']">El precio debe ser mayor a 0</span>
                    </div>
                  </div>

                  <!-- Capacidad -->
                  <div>
                    <label for="capacidad" class="block text-sm font-medium text-slate-300 mb-2">
                      Capacidad *
                    </label>
                    <input
                      type="number"
                      id="capacidad"
                      formControlName="capacidad"
                      min="1"
                      class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                      placeholder="1"
                      [class.border-red-400]="isFieldInvalid('capacidad')"
                      [class.focus:border-red-400]="isFieldInvalid('capacidad')">
                    <div *ngIf="isFieldInvalid('capacidad')" class="mt-1 text-sm text-red-300">
                      <span *ngIf="servicioForm.get('capacidad')?.errors?.['required']">La capacidad es requerida</span>
                      <span *ngIf="servicioForm.get('capacidad')?.errors?.['min']">La capacidad debe ser mayor a 0</span>
                    </div>
                  </div>
                </div>

                <!-- Descripción -->
                <div>
                  <label for="descripcion" class="block text-sm font-medium text-slate-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="4"
                    class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                    placeholder="Describe detalladamente tu servicio..."
                    [class.border-red-400]="isFieldInvalid('descripcion')"
                    [class.focus:border-red-400]="isFieldInvalid('descripcion')"></textarea>
                  <div *ngIf="isFieldInvalid('descripcion')" class="mt-1 text-sm text-red-300">
                    <span *ngIf="servicioForm.get('descripcion')?.errors?.['required']">La descripción es requerida</span>
                    <span *ngIf="servicioForm.get('descripcion')?.errors?.['minlength']">La descripción debe tener al menos 10 caracteres</span>
                  </div>
                </div>

                <!-- Estado -->
                <div class="flex items-center p-4 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      formControlName="estado"
                      class="h-5 w-5 text-orange-400 focus:ring-orange-400 border-slate-600 rounded bg-white/10">
                    <span class="ml-3 text-slate-300">
                      <span class="text-sm font-medium">Servicio activo</span>
                      <p class="text-xs text-slate-400 mt-1">
                        Los servicios inactivos no serán visibles para los clientes
                      </p>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Tab: Ubicación -->
              <div *ngIf="activeTab === 'ubicacion'" class="space-y-6">
                <h3 class="text-lg font-medium text-white mb-6">Ubicación del Servicio</h3>
                
                <!-- Ubicación de Referencia -->
                <div>
                  <label for="ubicacion_referencia" class="block text-sm font-medium text-slate-300 mb-2">
                    Ubicación de Referencia
                  </label>
                  <input
                    type="text"
                    id="ubicacion_referencia"
                    formControlName="ubicacion_referencia"
                    class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                    placeholder="Ej: Muelle turístico del lago Titicaca">
                </div>

                <!-- Mapa Interactivo -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Ubicación en el Mapa
                  </label>
                  <div class="overflow-hidden rounded-xl border border-white/20 dark:border-slate-600/50">
                    <app-ubicacion-map
                      [latitud]="servicioForm.get('latitud')?.value"
                      [longitud]="servicioForm.get('longitud')?.value"
                      [readOnly]="false"
                      [zoom]="13"
                      (ubicacionChange)="onUbicacionChange($event)">
                    </app-ubicacion-map>
                  </div>
                </div>

                <!-- Coordenadas (readonly) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="latitud" class="block text-sm font-medium text-slate-300 mb-2">
                      Latitud
                    </label>
                    <input
                      type="number"
                      id="latitud"
                      formControlName="latitud"
                      step="any"
                      readonly
                      class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/5 dark:bg-slate-800/20 text-slate-400 cursor-not-allowed"
                      placeholder="Selecciona en el mapa">
                  </div>
                  <div>
                    <label for="longitud" class="block text-sm font-medium text-slate-300 mb-2">
                      Longitud
                    </label>
                    <input
                      type="number"
                      id="longitud"
                      formControlName="longitud"
                      step="any"
                      readonly
                      class="w-full px-3 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/5 dark:bg-slate-800/20 text-slate-400 cursor-not-allowed"
                      placeholder="Selecciona en el mapa">
                  </div>
                </div>
              </div>

              <!-- Tab: Horarios -->
              <div *ngIf="activeTab === 'horarios'" class="space-y-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-white">Horarios de Atención</h3>
                  <button
                    type="button"
                    (click)="addHorario()"
                    class="group flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 hover:shadow-xl">
                    <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Agregar Horario
                  </button>
                </div>

                <div formArrayName="horarios" class="space-y-4">
                  <div *ngFor="let horario of horarios.controls; let i = index" 
                      [formGroupName]="i" 
                      class="backdrop-blur-sm bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl p-4 shadow-lg">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-sm font-medium text-white">
                        Horario {{ i + 1 }}
                      </h4>
                      <button
                        type="button"
                        (click)="removeHorario(i)"
                        class="group text-red-300 hover:text-red-400 transition-colors duration-300">
                        <svg class="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <!-- Día de la Semana -->
                      <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">
                          Día de la Semana *
                        </label>
                        <select
                          formControlName="dia_semana"
                          class="w-full px-3 py-2.5 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 text-sm"
                          [class.border-red-400]="isHorarioFieldInvalid(i, 'dia_semana')">
                          <option value="" class="bg-slate-800 text-white">Seleccionar</option>
                          <option value="lunes" class="bg-slate-800 text-white">Lunes</option>
                          <option value="martes" class="bg-slate-800 text-white">Martes</option>
                          <option value="miercoles" class="bg-slate-800 text-white">Miércoles</option>
                          <option value="jueves" class="bg-slate-800 text-white">Jueves</option>
                          <option value="viernes" class="bg-slate-800 text-white">Viernes</option>
                          <option value="sabado" class="bg-slate-800 text-white">Sábado</option>
                          <option value="domingo" class="bg-slate-800 text-white">Domingo</option>
                        </select>
                        <div *ngIf="isHorarioFieldInvalid(i, 'dia_semana')" class="mt-1 text-sm text-red-300">
                          El día es requerido
                        </div>
                      </div>

                      <!-- Hora Inicio -->
                      <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">
                          Hora Inicio *
                        </label>
                        <input
                          type="time"
                          formControlName="hora_inicio"
                          class="w-full px-3 py-2.5 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 text-sm"
                          [class.border-red-400]="isHorarioFieldInvalid(i, 'hora_inicio')">
                        <div *ngIf="isHorarioFieldInvalid(i, 'hora_inicio')" class="mt-1 text-sm text-red-300">
                          La hora de inicio es requerida
                        </div>
                      </div>

                      <!-- Hora Fin -->
                      <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">
                          Hora Fin *
                        </label>
                        <input
                          type="time"
                          formControlName="hora_fin"
                          class="w-full px-3 py-2.5 border border-white/20 dark:border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 text-sm"
                          [class.border-red-400]="isHorarioFieldInvalid(i, 'hora_fin')">
                        <div *ngIf="isHorarioFieldInvalid(i, 'hora_fin')" class="mt-1 text-sm text-red-300">
                          La hora de fin es requerida
                        </div>
                      </div>

                      <!-- Activo -->
                      <div class="flex items-center">
                        <label class="flex items-center mt-6 cursor-pointer">
                          <input
                            type="checkbox"
                            formControlName="activo"
                            class="h-4 w-4 text-orange-400 focus:ring-orange-400 border-slate-600 rounded bg-white/10">
                          <span class="ml-2 text-sm text-slate-300">
                            Activo
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div *ngIf="horarios.length === 0" class="text-center py-12 border-2 border-dashed border-white/20 dark:border-slate-600/50 rounded-xl bg-white/5 dark:bg-slate-800/20">
                  <svg class="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 class="text-lg font-medium text-white mb-2">No hay horarios definidos</h3>
                  <p class="text-slate-400 mb-4">Haz clic en "Agregar Horario" para comenzar.</p>
                  <button
                    type="button"
                    (click)="addHorario()"
                    class="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-medium hover:from-orange-600 hover:to-orange-500 transition-all duration-300">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Agregar primer horario
                  </button>
                </div>
              </div>

              <!-- Tab: Imágenes -->
              <div *ngIf="activeTab === 'imagenes'" class="space-y-6">
                <h3 class="text-lg font-medium text-white mb-6">Imágenes del Servicio</h3>
                
                <!-- Sliders del Servicio -->
                <app-slider-upload
                  title="Imágenes del Servicio"
                  [slidersFormArray]="slidersArray"
                  [existingSliders]="sliders"
                  [isSliderPrincipal]="false"
                  (changeSlidersEvent)="onSlidersChange($event)"
                  (deletedSlidersEvent)="onDeletedSlidersChange($event)">
                </app-slider-upload>
                
                <!-- Información adicional -->
                <div class="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 shadow-lg">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h4 class="text-sm font-medium text-blue-200 mb-2">Consejos para las imágenes</h4>
                      <div class="text-sm text-blue-300">
                        <ul class="list-disc pl-5 space-y-1">
                          <li>Sube imágenes de alta calidad que muestren tu servicio</li>
                          <li>Incluye tanto imágenes del lugar como de la actividad</li>
                          <li>Tamaño máximo: 5MB por imagen</li>
                          <li>Formatos recomendados: JPG, PNG</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="bg-white/5 dark:bg-slate-800/30 px-6 py-4 border-t border-white/10 dark:border-slate-700/50">
              <div class="flex items-center justify-between">
                <div class="flex space-x-3">
                  <button *ngIf="activeTab !== 'informacion'" 
                          type="button" 
                          (click)="goToPreviousTab()" 
                          class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 font-medium">
                    <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Anterior
                  </button>
                  
                  <button type="button" 
                          (click)="cancel()" 
                          class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 font-medium">
                    <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Cancelar
                  </button>
                </div>
                
                <div class="flex items-center space-x-4">
                  <div class="text-sm text-slate-400">
                    * Campos requeridos
                  </div>
                  
                  <div class="flex space-x-3">
                    <button *ngIf="activeTab !== 'imagenes'" 
                            type="button" 
                            (click)="goToNextTab()" 
                            class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 font-medium">
                      Siguiente
                      <svg class="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    
                    <button
                      type="submit"
                      [disabled]="servicioForm.invalid || saving"
                      class="group flex items-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-orange-400">
                      <div *ngIf="saving" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <svg *ngIf="!saving" class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {{ saving ? 'Guardando...' : (isEditMode ? 'Actualizar Servicio' : 'Crear Servicio') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }
    
    /* Estilo personalizado para inputs de tiempo */
    input[type="time"] {
      color-scheme: dark;
    }
    
    /* Mejoras para select en modo oscuro */
    select option {
      background-color: rgb(30 41 59);
      color: white;
    }
    
    /* Scroll suave para tabs */
    .overflow-x-auto {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .overflow-x-auto::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class ServicioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  emprendimientoId!: number;
  servicioId?: number;
  emprendimiento?: Emprendimiento;
  servicio?: Servicio;
  
  isEditMode = false;
  loading = true;
  saving = false;
  error = '';
  success = '';
  validationErrors: any = {};

  servicioForm!: FormGroup;
  activeTab: 'informacion' | 'ubicacion' | 'horarios' | 'imagenes' = 'informacion';

  // Sliders
  sliders: SliderImage[] = [];
  deletedSliders: number[] = [];

  constructor(private notificationService: NotificationService) {}
  

  // Mapeo de días de la semana
  private readonly diasSemana: Record<string, string> = {
    'lunes': 'lunes',
    'martes': 'martes', 
    'miercoles': 'miercoles',
    'miércoles': 'miercoles',
    'jueves': 'jueves',
    'viernes': 'viernes',
    'sabado': 'sabado',
    'sábado': 'sabado',
    'domingo': 'domingo'
  };

  ngOnInit(): void {
    this.initForm();
    
    this.route.parent?.paramMap.subscribe(params => {
      const emprendimientoId = params.get('id');
      console.log('ServicioForm - Emprendimiento ID recibido:', emprendimientoId);
      
      if (emprendimientoId && !isNaN(+emprendimientoId)) {
        this.emprendimientoId = +emprendimientoId;
        
        this.route.paramMap.subscribe(currentParams => {
          const servicioId = currentParams.get('servicioId');
          console.log('ServicioForm - Servicio ID recibido:', servicioId);
          
          this.servicioId = servicioId ? +servicioId : undefined;
          this.isEditMode = !!this.servicioId;
          
          this.loadData();
        });
      } else {
        console.error('ServicioForm - ID de emprendimiento inválido:', emprendimientoId);
        this.error = 'ID de emprendimiento inválido';
        this.loading = false;
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
    }
  }

  private initForm(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio_referencial: ['', [Validators.required, Validators.min(0.01)]],
      capacidad: ['', [Validators.required, Validators.min(1)]],
      emprendedor_id: [''],
      estado: [true],
      latitud: [''],
      longitud: [''],
      ubicacion_referencia: [''],
      horarios: this.fb.array([]),
      sliders: this.fb.array([])
    });
  }

  get horarios(): FormArray {
    return this.servicioForm.get('horarios') as FormArray;
  }

  get slidersArray(): FormArray {
    return this.servicioForm.get('sliders') as FormArray;
  }

  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.servicioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isHorarioFieldInvalid(index: number, fieldName: string): boolean {
    const horarioGroup = this.horarios.at(index) as FormGroup;
    const field = horarioGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  hasUnsavedChanges(): boolean {
    return this.servicioForm.dirty || 
           this.sliders.some(s => s.imagen instanceof File) ||
           this.deletedSliders.length > 0;
  }

  // Método helper para Object.keys en el template
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Manejo de errores de validación
  getValidationErrorsList(): string[] {
    const errors: string[] = [];
    
    Object.keys(this.validationErrors).forEach(field => {
      const fieldErrors = this.validationErrors[field];
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(error => {
          let translatedError = error;
          if (error.includes('required')) {
            const fieldName = this.getFieldDisplayName(field);
            translatedError = `El campo ${fieldName} es requerido`;
          }
          errors.push(translatedError);
        });
      }
    });
    
    return errors;
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
      'nombre': 'nombre',
      'descripcion': 'descripción', 
      'precio_referencial': 'precio referencial',
      'capacidad': 'capacidad',
      'emprendedor_id': 'emprendimiento'
    };
    
    return fieldNames[field] || field;
  }

  clearValidationErrors(): void {
    this.validationErrors = {};
  }

  // Navegación entre tabs
  goToPreviousTab(): void {
    const tabs = ['informacion', 'ubicacion', 'horarios', 'imagenes'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex > 0) {
      this.activeTab = tabs[currentIndex - 1] as any;
    }
  }

  goToNextTab(): void {
    const tabs = ['informacion', 'ubicacion', 'horarios', 'imagenes'];
    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.activeTab = tabs[currentIndex + 1] as any;
    }
  }

  // Carga de datos
  private loadData(): void {
    this.loadEmprendimiento();
    
    if (this.isEditMode && this.servicioId) {
      this.loadServicio();
    } else {
      this.loading = false;
      this.servicioForm.patchValue({
        emprendedor_id: this.emprendimientoId
      });
    }
  }

  private loadEmprendimiento(): void {
    this.emprendimientoAdminService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = 'Error al cargar la información del emprendimiento';
      }
    });
  }

  private loadServicio(): void {
    if (!this.servicioId) return;
    
    this.emprendimientoAdminService.getServicio(this.servicioId).subscribe({
      next: (data) => {
        console.log('Servicio cargado:', data);
        this.servicio = data;
        this.populateForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
        this.error = 'Error al cargar el servicio';
        this.loading = false;
      }
    });
  }

  private populateForm(): void {
    if (!this.servicio) return;

    console.log('Poblando formulario con servicio:', this.servicio);

    this.servicioForm.patchValue({
      nombre: this.servicio.nombre,
      descripcion: this.servicio.descripcion,
      precio_referencial: this.servicio.precio_referencial,
      capacidad: this.servicio.capacidad || 1,
      emprendedor_id: this.servicio.emprendedor_id,
      estado: this.servicio.estado !== false,
      latitud: this.servicio.latitud,
      longitud: this.servicio.longitud,
      ubicacion_referencia: this.servicio.ubicacion_referencia
    });

    if (this.servicio.horarios && this.servicio.horarios.length > 0) {
      console.log('Horarios del servicio:', this.servicio.horarios);
      this.servicio.horarios.forEach(horario => {
        console.log('Procesando horario:', horario);
        this.horarios.push(this.createHorarioGroup(horario));
      });
    }

    if (this.servicio.sliders && this.servicio.sliders.length > 0) {
      this.sliders = this.servicio.sliders.map(slider => ({
        id: slider.id,
        nombre: slider.nombre,
        es_principal: slider.es_principal,
        orden: slider.orden,
        url_completa: slider.url_completa,
        imagen: slider.url_completa,
        titulo: slider.titulo || '',
        descripcion: typeof slider.descripcion === 'string' ? slider.descripcion : slider.descripcion?.descripcion || ''
      }));
    }
  }

  // Manejo de ubicación
  onUbicacionChange(ubicacion: {lat: number, lng: number}): void {
    this.servicioForm.patchValue({
      latitud: ubicacion.lat,
      longitud: ubicacion.lng
    });
  }

  // Manejo de horarios
  addHorario(): void {
    this.horarios.push(this.createHorarioGroup());
  }

  removeHorario(index: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      this.horarios.removeAt(index);
    }
  }

  private createHorarioGroup(horario?: Horario): FormGroup {
    let diaNormalizado = '';
    if (horario?.dia_semana) {
      const diaLower = horario.dia_semana.toLowerCase();
      diaNormalizado = this.diasSemana[diaLower] || diaLower;
    }

    console.log('Creando grupo de horario:', {
      original: horario?.dia_semana,
      normalizado: diaNormalizado,
      hora_inicio: horario?.hora_inicio,
      hora_fin: horario?.hora_fin
    });

    return this.fb.group({
      id: [horario?.id || null],
      dia_semana: [diaNormalizado, Validators.required],
      hora_inicio: [horario?.hora_inicio || '', Validators.required],
      hora_fin: [horario?.hora_fin || '', Validators.required],
      activo: [horario?.activo !== false]
    });
  }

  // Manejo de sliders
  onSlidersChange(sliders: SliderImage[]): void {
    this.sliders = sliders;
  }

  onDeletedSlidersChange(deletedIds: number[]): void {
    this.deletedSliders = deletedIds;
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.servicioForm.invalid || this.saving) {
      this.markFormGroupTouched(this.servicioForm);
      this.goToFirstInvalidTab();
      return;
    }

    this.saving = true;
    this.validationErrors = {};
    const formData = this.prepareFormData();

    console.log('Enviando datos:', formData);

    if (this.isEditMode && this.servicioId) {
      this.emprendimientoAdminService.updateServicio(this.servicioId, formData).subscribe({
        next: (data) => {
          this.notificationService.success("Éxito", "Servicio actualizado correctamente");
          this.saving = false;
          setTimeout(() => this.navigateToServices(), 2000);
        },
        error: (err) => {
          console.error('Error al actualizar servicio:', err);
          this.handleFormError(err);
          this.saving = false;
        }
      });
    } else {
      this.emprendimientoAdminService.createServicio(formData).subscribe({
        next: (data) => {
          this.notificationService.success("Éxito", "Servicio creado correctamente");
          this.saving = false;
          setTimeout(() => this.navigateToServices(), 2000);
        },
        error: (err) => {
          console.error('Error al crear servicio:', err);
          this.handleFormError(err);
          this.saving = false;
        }
      });
    }
  }

  private handleFormError(err: any): void {
    if (err.error?.errors) {
      this.validationErrors = err.error.errors;
      this.error = '';
    } else {
      this.error = err.error?.message || 'Error al procesar el formulario';
      this.validationErrors = {};
    }
  }

  private prepareFormData(): any {
    const formData = { ...this.servicioForm.value };
    
    // Convertir horarios al formato correcto
    if (formData.horarios && Array.isArray(formData.horarios)) {
      formData.horarios = formData.horarios.map((horario: any) => ({
        ...horario,
        hora_inicio: this.convertTimeFormat(horario.hora_inicio),
        hora_fin: this.convertTimeFormat(horario.hora_fin)
      }));
    }
    
    // Procesar sliders
    formData.sliders = this.sliders.map(slider => ({
      ...slider,
      es_principal: false // Los servicios no tienen sliders principales
    }));
    
    // Agregar IDs de sliders eliminados
    formData.deleted_sliders = this.deletedSliders;
        
    return formData;
  }

  private convertTimeFormat(time: string): string {
    if (!time) return '';
    
    // Si ya tiene formato HH:MM:SS, devolver como está
    if (time.split(':').length === 3) {
      return time;
    }
    
    // Si tiene formato HH:MM, agregar :00
    if (time.split(':').length === 2) {
      return `${time}:00`;
    }
    
    return time;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  private goToFirstInvalidTab(): void {
    // Ir a la primera pestaña con errores
    const basicFields = ['nombre', 'descripcion', 'precio_referencial', 'capacidad'];
    const hasBasicErrors = basicFields.some(field => this.isFieldInvalid(field));
    
    if (hasBasicErrors) {
      this.activeTab = 'informacion';
    } else if (this.horarios.invalid) {
      this.activeTab = 'horarios';
    }
  }

  // Métodos de utilidad
  retryLoad(): void {
    this.error = '';
    this.loading = true;
    this.loadData();
  }

  cancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
        this.navigateToServices();
      }
    } else {
      this.navigateToServices();
    }
  }

  private navigateToServices(): void {
    this.router.navigate(['/admin-emprendedores/emprendimiento', this.emprendimientoId, 'servicios']);
  }
}