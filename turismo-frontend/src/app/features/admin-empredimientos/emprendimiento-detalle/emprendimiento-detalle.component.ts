import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormArray } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';
import { SliderUploadComponent, SliderImage } from '../../../shared/components/slider-upload/slider-upload.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-emprendimiento-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SliderUploadComponent],
  template: `
    <!-- Loading State -->
    <div *ngIf="loading" class="flex justify-center py-12">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 dark:border-blue-800/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="backdrop-blur-lg bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/30 rounded-2xl p-6 mb-6 shadow-2xl">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-red-200">Error al procesar</h3>
          <div class="mt-2 text-sm text-red-300">
            <div *ngIf="validationErrors && validationErrors.length > 0; else singleError">
              <ul class="list-disc pl-5">
                <li *ngFor="let error of validationErrors">{{ error }}</li>
              </ul>
            </div>
            <ng-template #singleError>
              <p>{{ error }}</p>
            </ng-template>
          </div>
          <div class="mt-4">
            <button (click)="clearErrors()" 
                    class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success State -->
    <div *ngIf="success" class="backdrop-blur-lg bg-green-500/10 dark:bg-green-900/20 border border-green-500/20 dark:border-green-800/30 rounded-2xl p-6 mb-6 shadow-2xl">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-medium text-green-200">¡Éxito!</h3>
          <div class="mt-2 text-sm text-green-300">
            <p>{{ success }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de Edición -->
    <div *ngIf="emprendimientoForm && !loading" class="space-y-8">
      <!-- Header -->
      <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
        <h2 class="text-2xl font-bold text-white mb-2">Editar Información</h2>
        <p class="text-gray-300 dark:text-blue-300">Actualiza la información de tu emprendimiento</p>
      </div>

      <form [formGroup]="emprendimientoForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- Navegación por pestañas -->
        <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
          <nav class="flex flex-wrap gap-2">
            <button type="button"
                    *ngFor="let section of sections"
                    (click)="activeSection = section.key"
                    [class]="getSectionClasses(section.key)"
                    class="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="section.icon" />
              </svg>
              {{ section.label }}
            </button>
          </nav>
        </div>

        <!-- Contenido del formulario -->
        <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-8 shadow-2xl border border-white/10 dark:border-blue-700/30">
          <!-- Información General -->
          <div *ngIf="activeSection === 'general'" class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-6">Información General</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-2">
                <label for="nombre" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Nombre del Emprendimiento *</label>
                <input type="text" id="nombre" formControlName="nombre" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['nombre'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['nombre'].errors['required']">El nombre es requerido</span>
                </div>
              </div>
            
              <div>
                <label for="tipo_servicio" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Tipo de Servicio *</label>
                <input type="text" id="tipo_servicio" formControlName="tipo_servicio" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['tipo_servicio'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['tipo_servicio'].errors['required']">El tipo de servicio es requerido</span>
                </div>
              </div>
            
              <div>
                <label for="categoria" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Categoría *</label>
                <input type="text" id="categoria" formControlName="categoria" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['categoria'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['categoria'].errors['required']">La categoría es requerida</span>
                </div>
              </div>
            
              <div class="col-span-2">
                <label for="descripcion" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Descripción *</label>
                <textarea id="descripcion" formControlName="descripcion" rows="4" 
                          class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300 resize-none"></textarea>
                <div *ngIf="submitted && f['descripcion'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['descripcion'].errors['required']">La descripción es requerida</span>
                </div>
              </div>
            
              <div class="col-span-2">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" id="estado" formControlName="estado" 
                         class="w-5 h-5 text-orange-600 dark:text-blue-600 bg-white/10 dark:bg-blue-900/30 border-white/20 dark:border-blue-700/50 rounded focus:ring-orange-500 dark:focus:ring-blue-500 focus:ring-2">
                  <span class="text-gray-300 dark:text-blue-300 font-medium">Emprendimiento activo</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Contacto y Ubicación -->
          <div *ngIf="activeSection === 'contacto'" class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-6">Contacto y Ubicación</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="telefono" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Teléfono *</label>
                <input type="text" id="telefono" formControlName="telefono" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['telefono'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['telefono'].errors['required']">El teléfono es requerido</span>
                </div>
              </div>
            
              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Email *</label>
                <input type="email" id="email" formControlName="email" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['email'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['email'].errors['required']">El email es requerido</span>
                  <span *ngIf="f['email'].errors['email']">El email debe ser válido</span>
                </div>
              </div>
            
              <div>
                <label for="pagina_web" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Página Web</label>
                <input type="text" id="pagina_web" formControlName="pagina_web" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
              </div>
            
              <div>
                <label for="ubicacion" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Ubicación *</label>
                <input type="text" id="ubicacion" formControlName="ubicacion" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <div *ngIf="submitted && f['ubicacion'].errors" class="mt-2 text-sm text-red-300">
                  <span *ngIf="f['ubicacion'].errors['required']">La ubicación es requerida</span>
                </div>
              </div>
            
              <div>
                <label for="opciones_acceso" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Opciones de Acceso</label>
                <input type="text" id="opciones_acceso" formControlName="opciones_acceso" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: A pie, transporte público, taxi</p>
              </div>
            
              <div class="col-span-2">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" id="facilidades_discapacidad" formControlName="facilidades_discapacidad" 
                         class="w-5 h-5 text-orange-600 dark:text-blue-600 bg-white/10 dark:bg-blue-900/30 border-white/20 dark:border-blue-700/50 rounded focus:ring-orange-500 dark:focus:ring-blue-500 focus:ring-2">
                  <span class="text-gray-300 dark:text-blue-300 font-medium">Cuenta con facilidades para personas con discapacidad</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Detalles de Servicio -->
          <div *ngIf="activeSection === 'detalles'" class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-6">Detalles de Servicio</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="horario_atencion" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Horario de Atención</label>
                <input type="text" id="horario_atencion" formControlName="horario_atencion" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: Lunes a Domingo: 8:00 am - 8:00 pm</p>
              </div>
            
              <div>
                <label for="precio_rango" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Rango de Precios</label>
                <input type="text" id="precio_rango" formControlName="precio_rango" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: S/. 15 - S/. 35</p>
              </div>
            
              <div>
                <label for="capacidad_aforo" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Capacidad/Aforo</label>
                <input type="number" id="capacidad_aforo" formControlName="capacidad_aforo" min="0" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
              </div>
            
              <div>
                <label for="numero_personas_atiende" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Número de Personas que Atienden</label>
                <input type="number" id="numero_personas_atiende" formControlName="numero_personas_atiende" min="0" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
              </div>
            
              <div>
                <label for="metodos_pago" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Métodos de Pago</label>
                <input type="text" id="metodos_pago" formControlName="metodos_pago" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: Efectivo, Yape, Tarjetas (separados por coma)</p>
              </div>
            
              <div>
                <label for="idiomas_hablados" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Idiomas Hablados</label>
                <input type="text" id="idiomas_hablados" formControlName="idiomas_hablados" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: Español, Quechua, Inglés (separados por coma)</p>
              </div>
            
              <div>
                <label for="certificaciones" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Certificaciones</label>
                <input type="text" id="certificaciones" formControlName="certificaciones" 
                       class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300">
                <p class="mt-1 text-xs text-gray-400 dark:text-blue-400">Ej: Certificación A, Certificación B (separados por coma)</p>
              </div>
            
              <div class="col-span-2">
                <label for="comentarios_resenas" class="block text-sm font-medium text-gray-300 dark:text-blue-300 mb-2">Comentarios y Reseñas</label>
                <textarea id="comentarios_resenas" formControlName="comentarios_resenas" rows="3" 
                          class="w-full px-4 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 border border-white/20 dark:border-blue-700/50 text-white placeholder-gray-400 focus:border-orange-400 dark:focus:border-blue-400 focus:ring-2 focus:ring-orange-400/20 dark:focus:ring-blue-400/20 transition-all duration-300 resize-none"></textarea>
              </div>
            </div>
          </div>
          
          <!-- Imágenes -->
          <div *ngIf="activeSection === 'imagenes'" class="space-y-6">
            <h3 class="text-xl font-bold text-white mb-6">Gestión de Imágenes</h3>
            
            <!-- Sliders Principales -->
            <div class="space-y-4">
              <app-slider-upload
                title="Imágenes Principales"
                [slidersFormArray]="slidersPrincipalesArray"
                [existingSliders]="slidersPrincipales"
                [isSliderPrincipal]="true"
                (changeSlidersEvent)="onSlidersPrincipalesChange($event)"
                (deletedSlidersEvent)="onDeletedSlidersPrincipalesChange($event)"
              ></app-slider-upload>
            </div>
            
            <!-- Sliders Secundarios -->
            <div class="space-y-4">
              <app-slider-upload
                title="Imágenes Secundarias"
                [slidersFormArray]="slidersSecundariosArray"
                [existingSliders]="slidersSecundarios"
                [isSliderPrincipal]="false"
                (changeSlidersEvent)="onSlidersSecundariosChange($event)"
                (deletedSlidersEvent)="onDeletedSlidersSecundariosChange($event)"
              ></app-slider-upload>
            </div>
            
            <!-- Información adicional -->
            <div class="backdrop-blur-lg bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/20 dark:border-blue-800/30 rounded-2xl p-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-blue-200 dark:text-blue-300">Información sobre imágenes</h4>
                  <div class="mt-2 text-sm text-blue-300 dark:text-blue-400">
                    <ul class="list-disc pl-5 space-y-1">
                      <li><strong>Imágenes principales:</strong> Se mostrarán como slider principal</li>
                      <li><strong>Imágenes secundarias:</strong> Galería adicional con título y descripción</li>
                      <li><strong>Tamaño máximo:</strong> 5MB por imagen</li>
                      <li><strong>Formatos:</strong> JPG, PNG, WebP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
          <div class="flex flex-col sm:flex-row gap-4 justify-between">
            <button type="button" (click)="cancel()" 
                    class="flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 dark:bg-blue-900/30 text-white font-medium hover:bg-white/20 dark:hover:bg-blue-800/50 transition-all duration-300 active:scale-95 border border-white/20 dark:border-blue-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            
            <button type="submit" [disabled]="submitting" 
                    class="flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 dark:from-blue-500 dark:to-blue-400 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-500 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="submitting" class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
              <svg *ngIf="!submitting" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmprendimientoDetalleComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  emprendimientoId: number = 0;
  emprendimiento: Emprendimiento | null = null;
  emprendimientoForm: FormGroup | null = null;

  slidersPrincipales: SliderImage[] = [];
  slidersSecundarios: SliderImage[] = [];
  deletedSlidersPrincipales: number[] = [];
  deletedSlidersSecundarios: number[] = [];
  
  loading = true;
  submitting = false;
  submitted = false;
  error = '';
  success = '';
  validationErrors: string[] = [];
  
  activeSection = 'general';

  // Configuración de secciones
  sections = [
    {
      key: 'general',
      label: 'General',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      key: 'contacto',
      label: 'Contacto',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      key: 'detalles',
      label: 'Detalles',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      key: 'imagenes',
      label: 'Imágenes',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];

  constructor(private notificationService: NotificationService) {}
  
  ngOnInit(): void {
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Detalle - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadEmprendimiento();
      } else {
        console.error('Detalle - ID inválido:', id);
        this.error = 'ID de emprendimiento inválido';
        this.loading = false;
      }
    });
  }
  
  get f() {
    return this.emprendimientoForm?.controls || {};
  }

  getSectionClasses(sectionKey: string): string {
    const baseClasses = 'text-white dark:text-blue-200';
    const activeClasses = 'bg-gradient-to-r from-orange-500 to-orange-400 dark:from-blue-500 dark:to-blue-400 shadow-lg';
    const inactiveClasses = 'bg-white/10 dark:bg-blue-900/30 hover:bg-white/20 dark:hover:bg-blue-800/50';
    
    return `${baseClasses} ${this.activeSection === sectionKey ? activeClasses : inactiveClasses}`;
  }
  
  loadEmprendimiento(): void {
    this.loading = true;
    this.error = '';
    this.validationErrors = [];
    
    this.emprendimientoAdminService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  initForm(): void {
    if (!this.emprendimiento) return;
    
    // Procesar arrays para mostrar como strings separados por comas
    let metodosPago = '';
    if (this.emprendimiento.metodos_pago) {
      if (Array.isArray(this.emprendimiento.metodos_pago)) {
        metodosPago = this.emprendimiento.metodos_pago.join(', ');
      } else if (typeof this.emprendimiento.metodos_pago === 'string') {
        try {
          const parsed = JSON.parse(this.emprendimiento.metodos_pago);
          metodosPago = Array.isArray(parsed) ? parsed.join(', ') : this.emprendimiento.metodos_pago;
        } catch {
          metodosPago = this.emprendimiento.metodos_pago;
        }
      }
    }
    
    let idiomasHablados = '';
    if (this.emprendimiento.idiomas_hablados) {
      if (Array.isArray(this.emprendimiento.idiomas_hablados)) {
        idiomasHablados = this.emprendimiento.idiomas_hablados.join(', ');
      } else if (typeof this.emprendimiento.idiomas_hablados === 'string') {
        try {
          const parsed = JSON.parse(this.emprendimiento.idiomas_hablados);
          idiomasHablados = Array.isArray(parsed) ? parsed.join(', ') : this.emprendimiento.idiomas_hablados;
        } catch {
          idiomasHablados = this.emprendimiento.idiomas_hablados;
        }
      }
    }

    // Procesar certificaciones de la misma manera
    let certificaciones = '';
    if (this.emprendimiento.certificaciones) {
      if (Array.isArray(this.emprendimiento.certificaciones)) {
        certificaciones = this.emprendimiento.certificaciones.join(', ');
      } else if (typeof this.emprendimiento.certificaciones === 'string') {
        try {
          const parsed = JSON.parse(this.emprendimiento.certificaciones);
          certificaciones = Array.isArray(parsed) ? parsed.join(', ') : this.emprendimiento.certificaciones;
        } catch {
          certificaciones = this.emprendimiento.certificaciones;
        }
      }
    }
    
    this.emprendimientoForm = this.fb.group({
      nombre: [this.emprendimiento.nombre, [Validators.required]],
      tipo_servicio: [this.emprendimiento.tipo_servicio, [Validators.required]],
      descripcion: [this.emprendimiento.descripcion, [Validators.required]],
      ubicacion: [this.emprendimiento.ubicacion, [Validators.required]],
      telefono: [this.emprendimiento.telefono, [Validators.required]],
      email: [this.emprendimiento.email, [Validators.required, Validators.email]],
      pagina_web: [this.emprendimiento.pagina_web],
      horario_atencion: [this.emprendimiento.horario_atencion],
      precio_rango: [this.emprendimiento.precio_rango],
      metodos_pago: [metodosPago],
      capacidad_aforo: [this.emprendimiento.capacidad_aforo],
      numero_personas_atiende: [this.emprendimiento.numero_personas_atiende],
      comentarios_resenas: [this.emprendimiento.comentarios_resenas],
      categoria: [this.emprendimiento.categoria, [Validators.required]],
      certificaciones: [certificaciones],
      idiomas_hablados: [idiomasHablados],
      opciones_acceso: [this.emprendimiento.opciones_acceso],
      facilidades_discapacidad: [this.emprendimiento.facilidades_discapacidad],
      estado: [this.emprendimiento.estado ?? true],
      asociacion_id: [this.emprendimiento.asociacion_id],
      sliders_principales: this.fb.array([]),
      sliders_secundarios: this.fb.array([])
    });
    this.processExistingSliders();
  }
  
  onSubmit(): void {
    this.submitted = true;
    this.clearErrors();
    
    if (this.emprendimientoForm?.invalid) {
      // Ir a la primera sección con errores
      if (this.f['nombre'].errors || this.f['tipo_servicio'].errors || 
          this.f['categoria'].errors || this.f['descripcion'].errors) {
        this.activeSection = 'general';
      } else if (this.f['telefono'].errors || this.f['email'].errors || this.f['ubicacion'].errors) {
        this.activeSection = 'contacto';
      }
      return;
    }
    
    this.submitting = true;
    const formData = this.prepareFormData();
    
    this.emprendimientoAdminService.updateEmprendimiento(this.emprendimientoId, formData).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.notificationService.success('Emprendimiento actualizado correctamente');
        this.submitting = false;
        this.submitted = false;
        
        // Redirigir a la vista de información del emprendimiento
        setTimeout(() => {
          this.success = '';
          this.router.navigate(['/admin-emprendedores/emprendimiento', this.emprendimientoId]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al actualizar emprendimiento:', err);
        this.handleValidationErrors(err);
        this.submitting = false;
      }
    });
  }

  private handleValidationErrors(err: any): void {
    this.validationErrors = [];
    
    console.log('Error completo:', err); // Debug para ver la estructura del error
    
    if (err.error?.errors) {
      // Procesar errores de validación del backend
      Object.keys(err.error.errors).forEach(field => {
        const fieldErrors = err.error.errors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((errorMsg: string) => {
            this.validationErrors.push(`${this.getFieldDisplayName(field)}: ${errorMsg}`);
          });
        } else if (typeof fieldErrors === 'string') {
          this.validationErrors.push(`${this.getFieldDisplayName(field)}: ${fieldErrors}`);
        }
      });
    }
    
    if (this.validationErrors.length === 0) {
      this.error = err.error?.message || 'Error al actualizar el emprendimiento. Inténtalo de nuevo.';
    } else {
      // Si hay errores de validación, también navegar a la sección correspondiente
      this.navigateToErrorSection();
    }
  }

  private navigateToErrorSection(): void {
    // Buscar en qué sección están los errores y navegar allí
    const errorFields = this.validationErrors.map(error => error.split(':')[0].toLowerCase());
    
    if (errorFields.some(field => ['nombre', 'tipo de servicio', 'descripción', 'categoría'].includes(field))) {
      this.activeSection = 'general';
    } else if (errorFields.some(field => ['teléfono', 'email', 'ubicación'].includes(field))) {
      this.activeSection = 'contacto';
    } else if (errorFields.some(field => ['métodos de pago', 'idiomas hablados', 'certificaciones'].includes(field))) {
      this.activeSection = 'detalles';
    }
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      'nombre': 'Nombre',
      'tipo_servicio': 'Tipo de servicio',
      'descripcion': 'Descripción',
      'ubicacion': 'Ubicación',
      'telefono': 'Teléfono',
      'email': 'Email',
      'categoria': 'Categoría',
      'metodos_pago': 'Métodos de pago',
      'idiomas_hablados': 'Idiomas hablados',
      'certificaciones': 'Certificaciones',
      'pagina_web': 'Página web',
      'horario_atencion': 'Horario de atención',
      'precio_rango': 'Rango de precios',
      'capacidad_aforo': 'Capacidad de aforo',
      'numero_personas_atiende': 'Número de personas que atienden',
      'comentarios_resenas': 'Comentarios y reseñas',
      'opciones_acceso': 'Opciones de acceso'
    };
    return fieldNames[field] || field;
  }

  clearErrors(): void {
    this.error = '';
    this.validationErrors = [];
  }
  
  prepareFormData(): any {
    if (!this.emprendimientoForm) return {};
    
    const formData = { ...this.emprendimientoForm.value };
    
    // Convertir strings separados por comas a arrays
    if (formData.metodos_pago && typeof formData.metodos_pago === 'string') {
      formData.metodos_pago = formData.metodos_pago
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    if (formData.idiomas_hablados && typeof formData.idiomas_hablados === 'string') {
      formData.idiomas_hablados = formData.idiomas_hablados
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }

    // Procesar certificaciones como array
    if (formData.certificaciones && typeof formData.certificaciones === 'string') {
      formData.certificaciones = formData.certificaciones
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    formData.sliders_principales = this.slidersPrincipales.map(slider => ({
      ...slider,
      es_principal: true
    }));
    
    formData.sliders_secundarios = this.slidersSecundarios.map(slider => ({
      ...slider,
      es_principal: false
    }));
    
    // Agregar IDs de sliders eliminados
    formData.deleted_sliders = [
      ...this.deletedSlidersPrincipales,
      ...this.deletedSlidersSecundarios
    ];
    
    console.log('FormData preparado:', formData); // Debug
    
    return formData;
  }
  
  cancel(): void {
    if (this.hasUnsavedChanges()) {
      if (!confirm('¿Estás seguro de que quieres descartar los cambios?')) {
        return;
      }
    }
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  processExistingSliders(): void {
    if (this.emprendimiento?.sliders_principales) {
      this.slidersPrincipales = this.emprendimiento.sliders_principales.map(slider => ({
        id: slider.id,
        nombre: slider.nombre,
        es_principal: true,
        orden: slider.orden || 1,
        url_completa: slider.url_completa,
        imagen: slider.url_completa
      }));
    }
    
    if (this.emprendimiento?.sliders_secundarios) {
      this.slidersSecundarios = this.emprendimiento.sliders_secundarios.map(slider => {
        let titulo = '';
        let descripcion = '';
        
        if (slider.descripcion && typeof slider.descripcion === 'object') {
          titulo = (slider.descripcion as any).titulo || '';
          descripcion = (slider.descripcion as any).descripcion || '';
        }
        
        return {
          id: slider.id,
          nombre: slider.nombre,
          es_principal: false,
          orden: slider.orden || 1,
          url_completa: slider.url_completa,
          imagen: slider.url_completa,
          titulo,
          descripcion
        };
      });
    }
  }

  get slidersPrincipalesArray(): FormArray {
    return this.emprendimientoForm?.get('sliders_principales') as FormArray;
  }

  get slidersSecundariosArray(): FormArray {
    return this.emprendimientoForm?.get('sliders_secundarios') as FormArray;
  }

  // Métodos para manejar cambios en sliders
  onSlidersPrincipalesChange(sliders: SliderImage[]): void {
    this.slidersPrincipales = sliders;
  }

  onSlidersSecundariosChange(sliders: SliderImage[]): void {
    this.slidersSecundarios = sliders;
  }

  onDeletedSlidersPrincipalesChange(deletedIds: number[]): void {
    this.deletedSlidersPrincipales = deletedIds;
  }

  onDeletedSlidersSecundariosChange(deletedIds: number[]): void {
    this.deletedSlidersSecundarios = deletedIds;
  }

  hasUnsavedChanges(): boolean {
    if (!this.emprendimientoForm) return false;
    
    return this.emprendimientoForm.dirty || 
          this.slidersPrincipales.some(s => s.imagen instanceof File) ||
          this.slidersSecundarios.some(s => s.imagen instanceof File) ||
          this.deletedSlidersPrincipales.length > 0 ||
          this.deletedSlidersSecundarios.length > 0;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
    }
  }
}