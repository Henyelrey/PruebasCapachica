import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { PlanesService } from '../../../../../core/services/planes.service';
import { TurismoService } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { Plan, PlanFormData, PlanEmprendedorFormData } from '../../../../../core/models/plan.model';

@Component({
  selector: 'app-planes-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      [title]="isEditMode ? 'Editar Plan' : 'Crear Nuevo Plan'" 
      [subtitle]="isEditMode ? 'Modifica la información del plan turístico' : 'Crea un nuevo plan turístico paso a paso'"
    >
    </app-admin-header>

    <div class="container mx-auto px-2 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      @if (loading) {
        <div class="flex justify-center items-center p-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
          <span class="ml-4 text-gray-600 dark:text-gray-300">
            {{ isEditMode ? 'Cargando plan...' : 'Preparando formulario...' }}
          </span>
        </div>
      } @else {
        <div class="flex items-center space-x-2 pb-5">
          <a
            routerLink="/admin/planes"
            class="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Cancelar
          </a>
        </div>
        
        <form [formGroup]="planForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Información básica -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Datos principales del plan turístico</p>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Plan <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="nombre"
                    placeholder="Ej: Tour Mágico por el Lago Titicaca"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    [class.border-red-500]="planForm.get('nombre')?.invalid && planForm.get('nombre')?.touched"
                  >
                  @if (planForm.get('nombre')?.invalid && planForm.get('nombre')?.touched) {
                    <p class="text-red-500 text-xs mt-1">El nombre del plan es obligatorio</p>
                  }
                </div>
                
                <!-- CAMPO LEGACY MANTENIDO POR COMPATIBILIDAD -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Emprendedor Principal (Legacy)
                  </label>
                  <select
                    formControlName="emprendedor_id"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    (change)="onEmprendedorLegacyChange()"
                  >
                    <option value="">Seleccionar emprendedor...</option>
                    @for (emprendedor of emprendedoresDisponibles; track emprendedor.id) {
                      <option [value]="emprendedor.id">{{ emprendedor.nombre }} - {{ emprendedor.ubicacion }}</option>
                    }
                  </select>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Este campo se mantiene por compatibilidad. Usa la sección "Emprendedores Participantes" para gestión completa.
                  </p>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción <span class="text-red-500">*</span>
                </label>
                <textarea
                  formControlName="descripcion"
                  rows="3"
                  placeholder="Describe la experiencia que ofrece este plan..."
                  class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  [class.border-red-500]="planForm.get('descripcion')?.invalid && planForm.get('descripcion')?.touched"
                ></textarea>
                @if (planForm.get('descripcion')?.invalid && planForm.get('descripcion')?.touched) {
                  <p class="text-red-500 text-xs mt-1">La descripción es obligatoria</p>
                }
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qué Incluye
                </label>
                <textarea
                  formControlName="que_incluye"
                  rows="3"
                  placeholder="Alojamiento, alimentación, transporte, guía, etc..."
                  class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duración (días) <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    formControlName="duracion_dias"
                    min="1"
                    max="365"
                    placeholder="3"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    [class.border-red-500]="planForm.get('duracion_dias')?.invalid && planForm.get('duracion_dias')?.touched"
                    (blur)="updateDiasArray()"
                  >
                  @if (planForm.get('duracion_dias')?.invalid && planForm.get('duracion_dias')?.touched) {
                    <p class="text-red-500 text-xs mt-1">La duración debe ser entre 1 y 365 días</p>
                  }
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capacidad <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    formControlName="capacidad"
                    min="1"
                    max="1000"
                    placeholder="20"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    [class.border-red-500]="planForm.get('capacidad')?.invalid && planForm.get('capacidad')?.touched"
                  >
                  @if (planForm.get('capacidad')?.invalid && planForm.get('capacidad')?.touched) {
                    <p class="text-red-500 text-xs mt-1">La capacidad debe ser entre 1 y 1000 personas</p>
                  }
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio Total (S/)
                  </label>
                  <input
                    type="number"
                    formControlName="precio_total"
                    min="0"
                    step="0.01"
                    placeholder="450.00"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dificultad <span class="text-red-500">*</span>
                  </label>
                  <select
                    formControlName="dificultad"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    [class.border-red-500]="planForm.get('dificultad')?.invalid && planForm.get('dificultad')?.touched"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="facil">🟢 Fácil</option>
                    <option value="moderado">🟡 Moderado</option>
                    <option value="dificil">🔴 Difícil</option>
                  </select>
                  @if (planForm.get('dificultad')?.invalid && planForm.get('dificultad')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Selecciona el nivel de dificultad</p>
                  }
                </div>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requerimientos
                  </label>
                  <textarea
                    formControlName="requerimientos"
                    rows="2"
                    placeholder="Documento de identidad, edad mínima, etc..."
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Qué Llevar
                  </label>
                  <textarea
                    formControlName="que_llevar"
                    rows="2"
                    placeholder="Mochila, ropa abrigada, protector solar, etc..."
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  ></textarea>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="es_publico"
                    id="es_publico"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                  >
                  <label for="es_publico" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Plan público (visible para todos los usuarios)
                  </label>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estado <span class="text-red-500">*</span>
                  </label>
                  <select
                    formControlName="estado"
                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="borrador">📝 Borrador</option>
                    <option value="activo">✅ Activo</option>
                    <option value="inactivo">❌ Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- NUEVA SECCIÓN: Emprendedores Participantes -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Emprendedores Participantes</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gestiona los emprendedores que participan en este plan y sus roles
              </p>
            </div>
            <div class="p-6">
              <div formArrayName="emprendedores" class="space-y-4">
                @for (emprendedorControl of getEmprendedoresFormArray().controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-md font-medium text-gray-900 dark:text-white">
                        Emprendedor {{ i + 1 }}
                        @if (emprendedorControl.get('es_organizador_principal')?.value) {
                          <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                            Organizador Principal
                          </span>
                        }
                      </h4>
                      <button
                        type="button"
                        (click)="removeEmprendedor(i)"
                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        [disabled]="getEmprendedoresFormArray().length === 1"
                        [class.opacity-50]="getEmprendedoresFormArray().length === 1"
                        [class.cursor-not-allowed]="getEmprendedoresFormArray().length === 1"
                        title="Eliminar emprendedor"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Emprendedor <span class="text-red-500">*</span>
                        </label>
                        <select
                          formControlName="emprendedor_id"
                          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          (change)="onEmprendedorChange(i)"
                        >
                          <option value="">Seleccionar emprendedor...</option>
                          @for (emprendedor of emprendedoresDisponibles; track emprendedor.id) {
                            <option [value]="emprendedor.id">{{ emprendedor.nombre }}</option>
                          }
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rol <span class="text-red-500">*</span>
                        </label>
                        <select
                          formControlName="rol"
                          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          (change)="onRolChange(i)"
                        >
                          <option value="organizador">🎯 Organizador</option>
                          <option value="colaborador">🤝 Colaborador</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Porcentaje Ganancia (%)
                        </label>
                        <input
                          type="number"
                          formControlName="porcentaje_ganancia"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0.00"
                          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Total actual: {{ getTotalPorcentajes() }}%
                        </p>
                      </div>
                    </div>
                    
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción de Participación
                      </label>
                      <textarea
                        formControlName="descripcion_participacion"
                        rows="2"
                        placeholder="Describe el rol específico de este emprendedor en el plan..."
                        class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      ></textarea>
                    </div>
                    
                    <div class="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        formControlName="es_organizador_principal"
                        [id]="'organizador_principal_' + i"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded"
                        (change)="onOrganizadorPrincipalChange(i)"
                      >
                      <label [for]="'organizador_principal_' + i" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Es el organizador principal del plan
                      </label>
                    </div>
                  </div>
                }
              </div>
              
              <div class="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  (click)="addEmprendedor()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  [disabled]="getEmprendedoresFormArray().length >= 10"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Agregar Emprendedor
                </button>
                
                @if (getTotalPorcentajes() > 100) {
                  <div class="text-red-600 text-sm">
                    ⚠️ El total de porcentajes ({{ getTotalPorcentajes() }}%) excede el 100%
                  </div>
                }
              </div>
              
              @if (getEmprendedoresFormArray().length === 0) {
                <div class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sin emprendedores</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Agrega al menos un emprendedor organizador para crear el plan</p>
                  <div class="mt-6">
                    <button
                      type="button"
                      (click)="addEmprendedor()"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Agregar Primer Emprendedor
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Imágenes -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Imágenes</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sube imágenes atractivas del plan</p>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imagen Principal
                </label>
                <input
                  type="file"
                  (change)="onImagenPrincipalSelected($event)"
                  accept="image/*"
                  class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                >
                @if (imagenPrincipalPreview) {
                  <div class="mt-2">
                    <img [src]="imagenPrincipalPreview" alt="Vista previa" class="h-32 w-48 object-cover rounded-md border border-gray-200 dark:border-gray-600">
                  </div>
                }
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Galería de Imágenes (máximo 10)
                </label>
                <input
                  type="file"
                  (change)="onImagenesGaleriaSelected($event)"
                  accept="image/*"
                  multiple
                  class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                >
                @if (imagenesGaleriaPreviews.length > 0) {
                  <div class="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    @for (preview of imagenesGaleriaPreviews; track $index) {
                      <div class="relative">
                        <img [src]="preview" alt="Vista previa" class="h-20 w-20 object-cover rounded-md border border-gray-200 dark:border-gray-600">
                        <button
                          type="button"
                          (click)="removeImagenGaleria($index)"
                          class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Itinerario por días -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Itinerario por Días</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Define las actividades para cada día del plan</p>
            </div>
            <div class="p-6">
              @if (planForm.get('duracion_dias')?.value > 0) {
                <div formArrayName="dias" class="space-y-6">
                  @for (diaControl of getDiasFormArray().controls; track $index; let i = $index) {
                    <div [formGroupName]="i" class="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div class="flex items-center mb-4">
                        <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium mr-3">
                          {{ i + 1 }}
                        </span>
                        <h4 class="text-lg font-medium text-gray-900 dark:text-white">Día {{ i + 1 }}</h4>
                      </div>
                      
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Título del día <span class="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            formControlName="titulo"
                            placeholder="Ej: Bienvenida y exploración inicial"
                            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          >
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hora inicio
                            </label>
                            <input
                              type="time"
                              formControlName="hora_inicio"
                              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                          </div>
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Hora fin
                            </label>
                            <input
                              type="time"
                              formControlName="hora_fin"
                              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción del día <span class="text-red-500">*</span>
                        </label>
                        <textarea
                          formControlName="descripcion"
                          rows="2"
                          placeholder="Describe las actividades y experiencias de este día..."
                          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        ></textarea>
                      </div>
                      
                      <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notas adicionales
                        </label>
                        <textarea
                          formControlName="notas_adicionales"
                          rows="1"
                          placeholder="Información extra, recomendaciones especiales..."
                          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        ></textarea>
                      </div>
                      
                      <!-- Servicios del día -->
                      <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <div class="flex items-center justify-between mb-3">
                          <h5 class="text-md font-medium text-gray-900 dark:text-white">Servicios/Actividades</h5>
                          <button
                            type="button"
                            (click)="addServicio(i)"
                            class="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Agregar Servicio
                          </button>
                        </div>
                        
                        <div formArrayName="servicios" class="space-y-3">
                          @for (servicioControl of getServiciosFormArray(i).controls; track $index; let j = $index) {
                            <div [formGroupName]="j" class="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                              <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Servicio {{ j + 1 }}</span>
                                <button
                                  type="button"
                                  (click)="removeServicio(i, j)"
                                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </div>
                              
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Servicio <span class="text-red-500">*</span>
                                  </label>
                                  <select
                                    formControlName="servicio_id"
                                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  >
                                    <option value="">Seleccionar servicio...</option>
                                    @for (servicio of serviciosDisponibles; track servicio.id) {
                                      <option [value]="servicio.id">{{ servicio.nombre }} - {{ servicio.emprendedor?.nombre }}</option>
                                    }
                                  </select>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-2">
                                  <div>
                                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Hora inicio
                                    </label>
                                    <input
                                      type="time"
                                      formControlName="hora_inicio"
                                      class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                  </div>
                                  <div>
                                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Hora fin
                                    </label>
                                    <input
                                      type="time"
                                      formControlName="hora_fin"
                                      class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    >
                                  </div>
                                </div>
                              </div>
                              
                              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                <div>
                                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Duración (min)
                                  </label>
                                  <input
                                    type="number"
                                    formControlName="duracion_minutos"
                                    min="0"
                                    placeholder="60"
                                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  >
                                </div>
                                
                                <div>
                                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Precio adicional (S/)
                                  </label>
                                  <input
                                    type="number"
                                    formControlName="precio_adicional"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                  >
                                </div>
                                
                                <div class="flex items-center justify-center">
                                  <label class="flex items-center">
                                    <input
                                      type="checkbox"
                                      formControlName="es_opcional"
                                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-600 rounded"
                                    >
                                    <span class="ml-2 text-xs text-gray-700 dark:text-gray-300">Es opcional</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div class="mt-3">
                                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Notas del servicio
                                </label>
                                <input
                                  type="text"
                                  formControlName="notas"
                                  placeholder="Notas específicas para este servicio..."
                                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Define la duración del plan</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Especifica cuántos días durará el plan para crear el itinerario</p>
                </div>
              }
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <a
                routerLink="/admin/planes"
                class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </a>
              
              @if (isEditMode) {
                <button
                  type="button"
                  (click)="saveDraft()"
                  [disabled]="saving || !hasValidEmprendedores()"
                  class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md shadow-sm bg-yellow-50 dark:bg-yellow-900/20 text-sm font-medium text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (saving) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Guardar como Borrador
                </button>
              }
              
              <button
                type="submit"
                [disabled]="planForm.invalid || saving || !hasValidEmprendedores() || getTotalPorcentajes() > 100"
                class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (saving) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isEditMode ? 'Actualizar Plan' : 'Crear Plan' }}
              </button>
            </div>
            
            <!-- Validaciones -->
            @if (!hasValidEmprendedores()) {
              <div class="mt-3 text-red-600 text-sm">
                ⚠️ Debes agregar al menos un emprendedor organizador
              </div>
            }
            
            @if (!hasOrganizadorPrincipal()) {
              <div class="mt-1 text-red-600 text-sm">
                ⚠️ Debe haber exactamente un organizador principal
              </div>
            }
            
            @if (getTotalPorcentajes() > 100) {
              <div class="mt-1 text-red-600 text-sm">
                ⚠️ El total de porcentajes de ganancia no puede exceder 100%
              </div>
            }
          </div>
        </form>
      }
    </div>
  `,
})
export class PlanesFormComponent implements OnInit {
  private planesService = inject(PlanesService);
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  planForm!: FormGroup;
  loading = true;
  saving = false;
  isEditMode = false;
  planId: number | null = null;
  
  // Datos para selects
  emprendedoresDisponibles: any[] = [];
  serviciosDisponibles: any[] = [];
  
  // Imágenes
  imagenPrincipalFile: File | null = null;
  imagenPrincipalPreview: string | null = null;
  imagenesGaleriaFiles: File[] = [];
  imagenesGaleriaPreviews: string[] = [];

  ngOnInit() {
    this.initForm();
    this.loadData();
    
    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.planId = +params['id'];
        this.loadPlan(this.planId);
      } else {
        // En modo creación, agregar un emprendedor por defecto
        this.addEmprendedor();
        this.loading = false;
      }
    });
  }

  initForm() {
    this.planForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: ['', [Validators.required]],
      que_incluye: [''],
      capacidad: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      duracion_dias: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
      es_publico: [true],
      estado: ['borrador', [Validators.required]],
      emprendedor_id: [''], // Legacy - mantener por compatibilidad
      precio_total: [''],
      dificultad: ['', [Validators.required]],
      requerimientos: [''],
      que_llevar: [''],
      emprendedores: this.fb.array([]), // NUEVO: Array de emprendedores
      dias: this.fb.array([])
    });
  }

  loadData() {
    // Cargar emprendedores disponibles
    this.turismoService.getEmprendedores(1, 100).subscribe({
      next: (response) => {
        this.emprendedoresDisponibles = response.data;
        this.loadAllServicios(); // Cargar todos los servicios al inicio
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
        alert('Error al cargar los emprendedores disponibles');
      }
    });
  }

  loadAllServicios() {
    // Cargar todos los servicios disponibles
    this.turismoService.getServicios(1, 500).subscribe({
      next: (response) => {
        this.serviciosDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  loadPlan(id: number) {
    this.planesService.getPlan(id).subscribe({
      next: (plan) => {
        this.fillForm(plan);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar plan:', error);
        this.loading = false;
        alert('Error al cargar el plan');
        this.router.navigate(['/admin/planes']);
      }
    });
  }

  fillForm(plan: Plan) {
    // Llenar campos básicos
    this.planForm.patchValue({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      que_incluye: plan.que_incluye,
      capacidad: plan.capacidad,
      duracion_dias: plan.duracion_dias,
      es_publico: plan.es_publico,
      estado: plan.estado,
      emprendedor_id: plan.emprendedor_id, // Legacy
      precio_total: plan.precio_total,
      dificultad: plan.dificultad,
      requerimientos: plan.requerimientos,
      que_llevar: plan.que_llevar
    });
    
    // Cargar imagen principal
    if (plan.imagen_principal_url) {
      this.imagenPrincipalPreview = plan.imagen_principal_url;
    }
    
    // Cargar galería
    if (plan.imagenes_galeria_urls) {
      this.imagenesGaleriaPreviews = [...plan.imagenes_galeria_urls];
    }
    
    // NUEVO: Llenar emprendedores
    if (plan.emprendedores && plan.emprendedores.length > 0) {
      // Limpiar array actual
      const emprendedoresArray = this.getEmprendedoresFormArray();
      while (emprendedoresArray.length !== 0) {
        emprendedoresArray.removeAt(0);
      }
      
      // Agregar emprendedores del plan
      plan.emprendedores.forEach(emprendedor => {
        emprendedoresArray.push(this.createEmprendedorFormGroup({
          emprendedor_id: emprendedor.id,
          rol: emprendedor.rol,
          es_organizador_principal: emprendedor.es_organizador_principal,
          descripcion_participacion: emprendedor.descripcion_participacion,
          porcentaje_ganancia: emprendedor.porcentaje_ganancia
        }));
      });
    } else if (plan.emprendedor_id) {
      // Compatibilidad con emprendedor legacy
      this.addEmprendedor();
      const emprendedorArray = this.getEmprendedoresFormArray();
      emprendedorArray.at(0).patchValue({
        emprendedor_id: plan.emprendedor_id,
        rol: 'organizador',
        es_organizador_principal: true
      });
    }
    
    // Crear array de días
    this.updateDiasArray();
    
    // Llenar datos de días si existen
    if (plan.dias && plan.dias.length > 0) {
      plan.dias.forEach((dia, index) => {
        const diaFormGroup = this.getDiasFormArray().at(index) as FormGroup;
        if (diaFormGroup) {
          diaFormGroup.patchValue({
            titulo: dia.titulo,
            descripcion: dia.descripcion,
            hora_inicio: dia.hora_inicio,
            hora_fin: dia.hora_fin,
            notas_adicionales: dia.notas_adicionales
          });
          
          // Llenar servicios del día
          if (dia.servicios && dia.servicios.length > 0) {
            const serviciosArray = diaFormGroup.get('servicios') as FormArray;
            dia.servicios.forEach(servicio => {
              serviciosArray.push(this.createServicioFormGroup(servicio));
            });
          }
        }
      });
    }
  }

  // NUEVOS MÉTODOS PARA GESTIÓN DE EMPRENDEDORES

  getEmprendedoresFormArray(): FormArray {
    return this.planForm.get('emprendedores') as FormArray;
  }

  createEmprendedorFormGroup(emprendedor?: any): FormGroup {
    return this.fb.group({
      emprendedor_id: [emprendedor?.emprendedor_id || '', [Validators.required]],
      rol: [emprendedor?.rol || 'organizador', [Validators.required]],
      es_organizador_principal: [emprendedor?.es_organizador_principal || false],
      descripcion_participacion: [emprendedor?.descripcion_participacion || ''],
      porcentaje_ganancia: [emprendedor?.porcentaje_ganancia || 0, [Validators.min(0), Validators.max(100)]]
    });
  }

  addEmprendedor() {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    if (emprendedoresArray.length >= 10) {
      alert('No puedes agregar más de 10 emprendedores por plan');
      return;
    }
    
    // Si es el primer emprendedor, hacerlo organizador principal
    const esPrimero = emprendedoresArray.length === 0;
    
    emprendedoresArray.push(this.createEmprendedorFormGroup({
      rol: 'organizador',
      es_organizador_principal: esPrimero
    }));
  }

  removeEmprendedor(index: number) {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    if (emprendedoresArray.length <= 1) {
      alert('Debe haber al menos un emprendedor en el plan');
      return;
    }
    
    const emprendedorControl = emprendedoresArray.at(index);
    const eraOrganizadorPrincipal = emprendedorControl.get('es_organizador_principal')?.value;
    
    emprendedoresArray.removeAt(index);
    
    // Si se eliminó el organizador principal, asignar a otro organizador
    if (eraOrganizadorPrincipal) {
      this.assignNewOrganizadorPrincipal();
    }
  }

  onEmprendedorChange(index: number) {
    // Lógica cuando cambia el emprendedor seleccionado
    const emprendedorControl = this.getEmprendedoresFormArray().at(index);
    const emprendedorId = emprendedorControl.get('emprendedor_id')?.value;
    
    if (emprendedorId) {
      // Verificar duplicados
      this.checkDuplicateEmprendedores(index);
    }
  }

  onRolChange(index: number) {
    const emprendedorControl = this.getEmprendedoresFormArray().at(index);
    const rol = emprendedorControl.get('rol')?.value;
    
    // Si cambia de organizador a colaborador, no puede ser organizador principal
    if (rol === 'colaborador') {
      emprendedorControl.get('es_organizador_principal')?.setValue(false);
      this.assignNewOrganizadorPrincipal();
    }
  }

  onOrganizadorPrincipalChange(index: number) {
    const emprendedorControl = this.getEmprendedoresFormArray().at(index);
    const esOrganizadorPrincipal = emprendedorControl.get('es_organizador_principal')?.value;
    
    if (esOrganizadorPrincipal) {
      // Solo puede haber un organizador principal
      this.getEmprendedoresFormArray().controls.forEach((control, i) => {
        if (i !== index) {
          control.get('es_organizador_principal')?.setValue(false);
        }
      });
      
      // Si es organizador principal, debe ser organizador
      emprendedorControl.get('rol')?.setValue('organizador');
    }
  }

  onEmprendedorLegacyChange() {
    // Cuando cambia el emprendedor legacy, sincronizar con el primer emprendedor del array
    const emprendedorId = this.planForm.get('emprendedor_id')?.value;
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    if (emprendedorId && emprendedoresArray.length > 0) {
      emprendedoresArray.at(0).get('emprendedor_id')?.setValue(emprendedorId);
    }
  }

  checkDuplicateEmprendedores(currentIndex: number) {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    const currentEmprendedorId = emprendedoresArray.at(currentIndex).get('emprendedor_id')?.value;
    
    // Verificar si hay duplicados
    const duplicates = emprendedoresArray.controls.filter((control, index) => 
      index !== currentIndex && control.get('emprendedor_id')?.value === currentEmprendedorId
    );
    
    if (duplicates.length > 0) {
      alert('Este emprendedor ya está agregado al plan');
      emprendedoresArray.at(currentIndex).get('emprendedor_id')?.setValue('');
    }
  }

  assignNewOrganizadorPrincipal() {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    // Buscar si hay algún organizador principal
    const tieneOrganizadorPrincipal = emprendedoresArray.controls.some(control => 
      control.get('es_organizador_principal')?.value
    );
    
    // Si no hay organizador principal, asignar al primer organizador disponible
    if (!tieneOrganizadorPrincipal) {
      const primerOrganizador = emprendedoresArray.controls.find(control => 
        control.get('rol')?.value === 'organizador'
      );
      
      if (primerOrganizador) {
        primerOrganizador.get('es_organizador_principal')?.setValue(true);
      }
    }
  }
getTotalPorcentajes(): number {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    let total = 0;
    
    emprendedoresArray.controls.forEach(control => {
      const porcentaje = control.get('porcentaje_ganancia')?.value || 0;
      total += parseFloat(porcentaje);
    });
    
    return Math.round(total * 100) / 100; // Redondear a 2 decimales
  }

  hasValidEmprendedores(): boolean {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    if (emprendedoresArray.length === 0) {
      return false;
    }
    
    // Verificar que todos tengan emprendedor_id y rol
    return emprendedoresArray.controls.every(control => {
      const emprendedorId = control.get('emprendedor_id')?.value;
      const rol = control.get('rol')?.value;
      return emprendedorId && rol;
    });
  }

  hasOrganizadorPrincipal(): boolean {
    const emprendedoresArray = this.getEmprendedoresFormArray();
    
    const organizadoresPrincipales = emprendedoresArray.controls.filter(control => 
      control.get('es_organizador_principal')?.value
    );
    
    return organizadoresPrincipales.length === 1;
  }

  // MÉTODOS PARA GESTIÓN DE DÍAS

  getDiasFormArray(): FormArray {
    return this.planForm.get('dias') as FormArray;
  }

  createDiaFormGroup(diaData?: any): FormGroup {
    return this.fb.group({
      numero_dia: [diaData?.numero_dia || 1],
      titulo: [diaData?.titulo || '', [Validators.required]],
      descripcion: [diaData?.descripcion || '', [Validators.required]],
      hora_inicio: [diaData?.hora_inicio || ''],
      hora_fin: [diaData?.hora_fin || ''],
      duracion_estimada_minutos: [diaData?.duracion_estimada_minutos || ''],
      notas_adicionales: [diaData?.notas_adicionales || ''],
      orden: [diaData?.orden || 1],
      servicios: this.fb.array([])
    });
  }

  updateDiasArray() {
    const duracionDias = this.planForm.get('duracion_dias')?.value || 0;
    const diasArray = this.getDiasFormArray();
    
    // Limpiar array actual
    while (diasArray.length !== 0) {
      diasArray.removeAt(0);
    }
    
    // Crear nuevos días
    for (let i = 1; i <= duracionDias; i++) {
      diasArray.push(this.createDiaFormGroup({
        numero_dia: i,
        orden: i
      }));
    }
  }

  // MÉTODOS PARA GESTIÓN DE SERVICIOS

  getServiciosFormArray(diaIndex: number): FormArray {
    return this.getDiasFormArray().at(diaIndex).get('servicios') as FormArray;
  }

  createServicioFormGroup(servicioData?: any): FormGroup {
    return this.fb.group({
      servicio_id: [servicioData?.servicio_id || '', [Validators.required]],
      hora_inicio: [servicioData?.hora_inicio || ''],
      hora_fin: [servicioData?.hora_fin || ''],
      duracion_minutos: [servicioData?.duracion_minutos || ''],
      notas: [servicioData?.notas || ''],
      orden: [servicioData?.orden || 1],
      es_opcional: [servicioData?.es_opcional || false],
      precio_adicional: [servicioData?.precio_adicional || '']
    });
  }

  addServicio(diaIndex: number) {
    const serviciosArray = this.getServiciosFormArray(diaIndex);
    serviciosArray.push(this.createServicioFormGroup({
      orden: serviciosArray.length + 1
    }));
  }

  removeServicio(diaIndex: number, servicioIndex: number) {
    const serviciosArray = this.getServiciosFormArray(diaIndex);
    serviciosArray.removeAt(servicioIndex);
    
    // Reordenar
    serviciosArray.controls.forEach((control, index) => {
      control.get('orden')?.setValue(index + 1);
    });
  }

  // MÉTODOS PARA GESTIÓN DE IMÁGENES

  onImagenPrincipalSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }
      
      this.imagenPrincipalFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPrincipalPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImagenesGaleriaSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    if (files.length === 0) return;
    
    // Validar límite total (máximo 10 imágenes)
    if (this.imagenesGaleriaFiles.length + files.length > 10) {
      alert('Máximo 10 imágenes permitidas en la galería');
      return;
    }
    
    files.forEach(file => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es un archivo de imagen válido`);
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 5MB permitido`);
        return;
      }
      
      this.imagenesGaleriaFiles.push(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenesGaleriaPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
    
    // Limpiar input
    event.target.value = '';
  }

  removeImagenGaleria(index: number) {
    this.imagenesGaleriaFiles.splice(index, 1);
    this.imagenesGaleriaPreviews.splice(index, 1);
  }

  // MÉTODOS DE VALIDACIÓN DETALLADA

  canSubmitForm(): boolean {
    return this.planForm.valid && 
           this.hasValidEmprendedores() && 
           this.hasOrganizadorPrincipal() && 
           this.getTotalPorcentajes() <= 100;
  }

  showValidationDetails(): boolean {
    // Mostrar detalles si hay errores y el usuario ha interactuado con el formulario
    return !this.canSubmitForm() && this.hasUserInteracted();
  }

  hasUserInteracted(): boolean {
    // Verificar si el usuario ha tocado algún campo o hay emprendedores agregados
    return this.planForm.touched || this.getEmprendedoresFormArray().length > 0;
  }

  isFormSectionValid(section: string): boolean {
    switch (section) {
      case 'basic':
        const basicFields = ['nombre', 'descripcion', 'capacidad', 'duracion_dias', 'dificultad', 'estado'];
        return basicFields.every(field => {
          const control = this.planForm.get(field);
          return control?.valid || false;
        });
      default:
        return false;
    }
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];
    
      // Errores de campos básicos
      if (this.planForm.get('nombre')?.invalid && this.planForm.get('nombre')?.touched) {
        errors.push('El nombre del plan es obligatorio');
      }
      
      if (this.planForm.get('descripcion')?.invalid && this.planForm.get('descripcion')?.touched) {
        errors.push('La descripción del plan es obligatoria');
      }
      
      if (this.planForm.get('capacidad')?.invalid && this.planForm.get('capacidad')?.touched) {
        errors.push('La capacidad debe ser entre 1 y 1000 personas');
      }
      
      if (this.planForm.get('duracion_dias')?.invalid && this.planForm.get('duracion_dias')?.touched) {
        errors.push('La duración debe ser entre 1 y 365 días');
      }
      
      if (this.planForm.get('dificultad')?.invalid && this.planForm.get('dificultad')?.touched) {
        errors.push('Debes seleccionar el nivel de dificultad');
      }
      
      // Errores de emprendedores
      if (!this.hasValidEmprendedores()) {
        if (this.getEmprendedoresFormArray().length === 0) {
          errors.push('Debes agregar al menos un emprendedor al plan');
        } else {
          const invalidEmprendedores = this.getEmprendedoresFormArray().controls.filter(control => {
            const emprendedorId = control.get('emprendedor_id')?.value;
            const rol = control.get('rol')?.value;
            return !emprendedorId || !rol;
          });
          
          if (invalidEmprendedores.length > 0) {
            errors.push(`Hay ${invalidEmprendedores.length} emprendedor(es) con datos incompletos`);
          }
        }
      }
      
      if (!this.hasOrganizadorPrincipal()) {
        const organizadoresPrincipales = this.getEmprendedoresFormArray().controls.filter(control => 
          control.get('es_organizador_principal')?.value
        ).length;
        
        if (organizadoresPrincipales === 0) {
          errors.push('Debe haber al menos un organizador principal');
        } else if (organizadoresPrincipales > 1) {
          errors.push('Solo puede haber un organizador principal');
        }
      }
      
      if (this.getTotalPorcentajes() > 100) {
        errors.push(`El total de porcentajes (${this.getTotalPorcentajes()}%) excede el 100% permitido`);
      }
      
      // Errores de días
      const diasArray = this.getDiasFormArray();
      diasArray.controls.forEach((diaControl, index) => {
        const diaGroup = diaControl as FormGroup;
        
        if (diaGroup.get('titulo')?.invalid && diaGroup.get('titulo')?.touched) {
          errors.push(`El título del día ${index + 1} es obligatorio`);
        }
        
        if (diaGroup.get('descripcion')?.invalid && diaGroup.get('descripcion')?.touched) {
          errors.push(`La descripción del día ${index + 1} es obligatoria`);
        }
        
        // Validar servicios del día
        const serviciosArray = diaGroup.get('servicios') as FormArray;
        serviciosArray.controls.forEach((servicioControl, servicioIndex) => {
          const servicioGroup = servicioControl as FormGroup;
          if (servicioGroup.get('servicio_id')?.invalid && servicioGroup.get('servicio_id')?.touched) {
            errors.push(`El servicio ${servicioIndex + 1} del día ${index + 1} debe tener un servicio seleccionado`);
          }
        });
      });
      
      return errors;
    }

    getSubmitButtonTitle(): string {
    if (this.saving) {
      return 'Guardando...';
    }

    if (!this.canSubmitForm()) {
      const errors = this.getValidationErrors();
      if (errors.length > 0) {
        return `No se puede enviar: ${errors[0]}`;
      }
      return 'Completa todos los campos obligatorios';
    }

    return this.isEditMode ? 'Actualizar el plan' : 'Crear el plan';
  }

  validateForm(): boolean {
    // Validar formulario básico
    if (this.planForm.invalid) {
      this.markFormGroupTouched(this.planForm);
      return false;
    }

    // Validar emprendedores
    if (!this.hasValidEmprendedores()) {
      alert('Debes agregar al menos un emprendedor válido');
      return false;
    }

    if (!this.hasOrganizadorPrincipal()) {
      alert('Debe haber exactamente un organizador principal');
      return false;
    }

    // Validar porcentajes
    if (this.getTotalPorcentajes() > 100) {
      alert('El total de porcentajes de ganancia no puede exceder 100%');
      return false;
    }

    // Validar días
    const diasArray = this.getDiasFormArray();
    for (let i = 0; i < diasArray.length; i++) {
      const diaControl = diasArray.at(i) as FormGroup;
      if (diaControl.invalid) {
        this.markFormGroupTouched(diaControl);
        alert(`Hay errores en el día ${i + 1}. Por favor revisa los campos obligatorios.`);
        return false;
      }
    }

    return true;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  preparePlanFormData(): PlanFormData {
    const formValue = this.planForm.value;

    const emprendedores: PlanEmprendedorFormData[] = formValue.emprendedores
      .filter((emp: any) => emp.emprendedor_id && emp.rol)
      .map((emp: any) => ({
        emprendedor_id: parseInt(emp.emprendedor_id),
        rol: emp.rol,
        es_organizador_principal: emp.es_organizador_principal || false,
        descripcion_participacion: emp.descripcion_participacion || undefined,
        porcentaje_ganancia: emp.porcentaje_ganancia ? parseFloat(emp.porcentaje_ganancia) : undefined
      }));

    const dias = formValue.dias.map((dia: any, index: number) => ({
      numero_dia: index + 1,
      titulo: dia.titulo,
      descripcion: dia.descripcion,
      hora_inicio: dia.hora_inicio || undefined,
      hora_fin: dia.hora_fin || undefined,
      duracion_estimada_minutos: dia.duracion_estimada_minutos ? parseInt(dia.duracion_estimada_minutos) : undefined,
      notas_adicionales: dia.notas_adicionales || undefined,
      orden: index + 1,
      servicios: dia.servicios
        .filter((serv: any) => serv.servicio_id)
        .map((serv: any, servIndex: number) => ({
          servicio_id: parseInt(serv.servicio_id),
          hora_inicio: serv.hora_inicio || undefined,
          hora_fin: serv.hora_fin || undefined,
          duracion_minutos: serv.duracion_minutos ? parseInt(serv.duracion_minutos) : undefined,
          notas: serv.notas || undefined,
          orden: servIndex + 1,
          es_opcional: serv.es_opcional || false,
          precio_adicional: serv.precio_adicional ? parseFloat(serv.precio_adicional) : undefined
        }))
    }));

    const planData: PlanFormData = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      que_incluye: formValue.que_incluye || undefined,
      capacidad: parseInt(formValue.capacidad),
      duracion_dias: parseInt(formValue.duracion_dias),
      es_publico: formValue.es_publico || false,
      estado: formValue.estado,
      emprendedor_id: formValue.emprendedor_id ? parseInt(formValue.emprendedor_id) : undefined,
      precio_total: formValue.precio_total ? parseFloat(formValue.precio_total) : undefined,
      dificultad: formValue.dificultad,
      requerimientos: formValue.requerimientos || undefined,
      que_llevar: formValue.que_llevar || undefined,
      imagen_principal: this.imagenPrincipalFile || undefined,
      imagenes_galeria: this.imagenesGaleriaFiles.length > 0 ? this.imagenesGaleriaFiles : undefined,
      emprendedores: emprendedores,
      dias: dias
    };

    return planData;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    const planData = this.preparePlanFormData();

    const operation = this.isEditMode
      ? this.planesService.updatePlan(this.planId!, planData)
      : this.planesService.createPlan(planData);

    operation.subscribe({
      next: (plan) => {
        this.saving = false;
        const message = this.isEditMode ? 'Plan actualizado exitosamente' : 'Plan creado exitosamente';
        alert(message);
        this.router.navigate(['/admin/planes', plan.id, 'detail']);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error al guardar plan:', error);

        let errorMessage = 'Error al guardar el plan';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors) {
          const firstError = Object.values(error.error.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          }
        }

        alert(errorMessage);
      }
    });
  }

  saveDraft() {
    if (!this.hasValidEmprendedores()) {
      alert('Debes agregar al menos un emprendedor válido para guardar como borrador');
      return;
    }

    const estadoOriginal = this.planForm.get('estado')?.value;
    this.planForm.get('estado')?.setValue('borrador');

    this.saving = true;
    const planData = this.preparePlanFormData();

    if (this.isEditMode && this.planId) {
      this.planesService.updatePlan(this.planId, planData).subscribe({
        next: (plan) => {
          this.saving = false;
          alert('Borrador guardado exitosamente');
          if (estadoOriginal !== 'borrador') {
            this.planForm.get('estado')?.setValue(estadoOriginal);
          }
        },
        error: (error) => {
          this.saving = false;
          console.error('Error al guardar borrador:', error);
          alert('Error al guardar el borrador');
          this.planForm.get('estado')?.setValue(estadoOriginal);
        }
      });
    }
  }

  getEmprendedorNombre(emprendedorId: number): string {
    const emprendedor = this.emprendedoresDisponibles.find(e => e.id === emprendedorId);
    return emprendedor ? emprendedor.nombre : '';
  }

  getServicioNombre(servicioId: number): string {
    const servicio = this.serviciosDisponibles.find(s => s.id === servicioId);
    return servicio ? `${servicio.nombre} - ${servicio.emprendedor?.nombre}` : '';
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnDestroy() {
    if (this.imagenPrincipalPreview && this.imagenPrincipalPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagenPrincipalPreview);
    }

    this.imagenesGaleriaPreviews.forEach(preview => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
  }
}