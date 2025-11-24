import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Emprendedor, Asociacion, Slider } from '../../../../../core/services/turismo.service';
import { SliderImage, SliderUploadComponent } from '../../../../../shared/components/slider-upload/slider-upload.component';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-emprendedor-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SliderUploadComponent, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestionar emprendedor" 
      subtitle="Crea o edita un emprendedor para tu municipalidad"
    ></app-admin-header>
    
    <div class="container mx-auto px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{{ isEditMode ? 'Editar' : 'Crear' }} Emprendedor</h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {{ isEditMode ? 'Actualice la información del emprendedor.' : 'Complete el formulario para crear un nuevo emprendedor.' }}
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/emprendedores"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-500 border-r-transparent"></div>
            <span class="ml-4 text-gray-700 dark:text-gray-300 transition-colors duration-200">Cargando...</span>
          </div>
        </div>
      } @else {
        <form [formGroup]="emprendedorForm" (ngSubmit)="submitForm()" class="space-y-6">
          <!-- Pestañas de navegación -->
          <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden transition-colors duration-200">
            <div class="border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <nav class="-mb-px flex space-x-8 px-6 pt-4 overflow-x-auto">
                <button
                  type="button"
                  (click)="activeTab = 'informacion-basica'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200"
                  [ngClass]="{
                    'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'informacion-basica',
                    'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600': activeTab !== 'informacion-basica'
                  }"
                >
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Información Básica
                  </div>
                </button>
                <button
                  type="button"
                  (click)="activeTab = 'detalles-negocio'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200"
                  [ngClass]="{
                    'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'detalles-negocio',
                    'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600': activeTab !== 'detalles-negocio'
                  }"
                >
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Detalles del Negocio
                  </div>
                </button>
                <button
                  type="button"
                  (click)="activeTab = 'imagenes'"
                  class="pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200"
                  [ngClass]="{
                    'border-primary-500 text-primary-600 dark:text-primary-400': activeTab === 'imagenes',
                    'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600': activeTab !== 'imagenes'
                  }"
                >
                  <div class="flex items-center">
                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Imágenes
                  </div>
                </button>
              </nav>
            </div>

            <div class="p-6">
              <!-- Tab: Información Básica -->
              @if (activeTab === 'informacion-basica') {
                <div class="space-y-6">
                  <!-- Información básica -->
                  <div>
                    <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200 flex items-center">
                      <svg class="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Información Básica
                    </h2>
                    <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <!-- Nombre -->
                      <div class="sm:col-span-4">
                        <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Nombre del Emprendimiento</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="nombre"
                            formControlName="nombre"
                            placeholder="Nombre del emprendimiento"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('nombre')?.invalid && emprendedorForm.get('nombre')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('nombre')?.invalid && emprendedorForm.get('nombre')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('nombre')?.invalid && emprendedorForm.get('nombre')?.touched"
                          >
                        </div>
                        @if (emprendedorForm.get('nombre')?.invalid && emprendedorForm.get('nombre')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            El nombre es obligatorio
                          </p>
                        }
                      </div>

                      <!-- Tipo de Servicio -->
                      <div class="sm:col-span-2">
                        <label for="tipo_servicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Tipo de Servicio</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.171 2.171a2 2 0 010 2.828l-8.486 8.486a2 2 0 01-2.828 0l-2.171-2.171a2 2 0 010-2.828L7.343 11"></path>
                            </svg>
                          </div>
                          <select
                            id="tipo_servicio"
                            formControlName="tipo_servicio"
                            class="block w-full pl-10 pr-10 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('tipo_servicio')?.invalid && emprendedorForm.get('tipo_servicio')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('tipo_servicio')?.invalid && emprendedorForm.get('tipo_servicio')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('tipo_servicio')?.invalid && emprendedorForm.get('tipo_servicio')?.touched"
                          >
                            <option value="" class="bg-white dark:bg-gray-700">Seleccione tipo</option>
                            <option value="Artesanía" class="bg-white dark:bg-gray-700">Artesanía</option>
                            <option value="Gastronomía" class="bg-white dark:bg-gray-700">Gastronomía</option>
                            <option value="Alojamiento" class="bg-white dark:bg-gray-700">Alojamiento</option>
                            <option value="Transporte" class="bg-white dark:bg-gray-700">Transporte</option>
                            <option value="Guía" class="bg-white dark:bg-gray-700">Guía Turístico</option>
                            <option value="Alimentación" class="bg-white dark:bg-gray-700">Alimentación</option>
                            <option value="Actividades" class="bg-white dark:bg-gray-700">Actividades</option>
                            <option value="Otro" class="bg-white dark:bg-gray-700">Otro</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </div>
                        @if (emprendedorForm.get('tipo_servicio')?.invalid && emprendedorForm.get('tipo_servicio')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            El tipo de servicio es obligatorio
                          </p>
                        }
                      </div>

                      <!-- Descripción -->
                      <div class="sm:col-span-6">
                        <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Descripción</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute top-3 left-3 flex items-start pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                            </svg>
                          </div>
                          <textarea
                            id="descripcion"
                            formControlName="descripcion"
                            rows="3"
                            placeholder="Describa brevemente el emprendimiento"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('descripcion')?.invalid && emprendedorForm.get('descripcion')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('descripcion')?.invalid && emprendedorForm.get('descripcion')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('descripcion')?.invalid && emprendedorForm.get('descripcion')?.touched"
                          ></textarea>
                        </div>
                        @if (emprendedorForm.get('descripcion')?.invalid && emprendedorForm.get('descripcion')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            La descripción es obligatoria
                          </p>
                        }
                      </div>

                      <!-- Categoría -->
                      <div class="sm:col-span-3">
                        <label for="categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Categoría</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                          </div>
                          <select
                            id="categoria"
                            formControlName="categoria"
                            class="block w-full pl-10 pr-10 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('categoria')?.invalid && emprendedorForm.get('categoria')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('categoria')?.invalid && emprendedorForm.get('categoria')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('categoria')?.invalid && emprendedorForm.get('categoria')?.touched"
                          >
                            <option value="" class="bg-white dark:bg-gray-700">Seleccione categoría</option>
                            <option value="Artesanía" class="bg-white dark:bg-gray-700">Artesanía</option>
                            <option value="Gastronomía" class="bg-white dark:bg-gray-700">Gastronomía</option>
                            <option value="Alojamiento" class="bg-white dark:bg-gray-700">Alojamiento</option>
                            <option value="Aventura" class="bg-white dark:bg-gray-700">Aventura</option>
                            <option value="Cultural" class="bg-white dark:bg-gray-700">Cultural</option>
                            <option value="Transporte" class="bg-white dark:bg-gray-700">Transporte</option>
                            <option value="Alimentación" class="bg-white dark:bg-gray-700">Alimentación</option>
                            <option value="Actividades" class="bg-white dark:bg-gray-700">Actividades</option>
                            <option value="Otro" class="bg-white dark:bg-gray-700">Otro</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </div>
                        @if (emprendedorForm.get('categoria')?.invalid && emprendedorForm.get('categoria')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            La categoría es obligatoria
                          </p>
                        }
                      </div>

                      <!-- Asociación -->
                      <div class="sm:col-span-3">
                        <label for="asociacion_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Asociación</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                          </div>
                          <select
                            id="asociacion_id"
                            formControlName="asociacion_id"
                            class="block w-full pl-10 pr-10 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                            <option [ngValue]="null" class="bg-white dark:bg-gray-700">Sin asociación</option>
                            @for (asociacion of asociaciones; track asociacion.id) {
                              <option [ngValue]="asociacion.id" class="bg-white dark:bg-gray-700">{{ asociacion.nombre }}</option>
                            }
                          </select>
                          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información de contacto -->
                  <div class="pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200 flex items-center">
                      <svg class="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Información de Contacto
                    </h2>
                    <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <!-- Ubicación -->
                      <div class="sm:col-span-6">
                        <label for="ubicacion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Ubicación</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="ubicacion"
                            formControlName="ubicacion"
                            placeholder="Dirección completa"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('ubicacion')?.invalid && emprendedorForm.get('ubicacion')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('ubicacion')?.invalid && emprendedorForm.get('ubicacion')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('ubicacion')?.invalid && emprendedorForm.get('ubicacion')?.touched"
                          >
                        </div>
                        @if (emprendedorForm.get('ubicacion')?.invalid && emprendedorForm.get('ubicacion')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            La ubicación es obligatoria
                          </p>
                        }
                      </div>

                      <!-- Teléfono -->
                      <div class="sm:col-span-3">
                        <label for="telefono" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Teléfono</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="telefono"
                            formControlName="telefono"
                            placeholder="Número de contacto"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('telefono')?.invalid && emprendedorForm.get('telefono')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('telefono')?.invalid && emprendedorForm.get('telefono')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('telefono')?.invalid && emprendedorForm.get('telefono')?.touched"
                          >
                        </div>
                        @if (emprendedorForm.get('telefono')?.invalid && emprendedorForm.get('telefono')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            El teléfono es obligatorio
                          </p>
                        }
                      </div>

                      <!-- Email -->
                      <div class="sm:col-span-3">
                        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Email</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            formControlName="email"
                            placeholder="correo@ejemplo.com"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            [class.border-red-300]="emprendedorForm.get('email')?.invalid && emprendedorForm.get('email')?.touched"
                            [class.focus:border-red-500]="emprendedorForm.get('email')?.invalid && emprendedorForm.get('email')?.touched"
                            [class.focus:ring-red-500]="emprendedorForm.get('email')?.invalid && emprendedorForm.get('email')?.touched"
                          >
                        </div>
                        @if (emprendedorForm.get('email')?.invalid && emprendedorForm.get('email')?.touched) {
                          <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200 flex items-center">
                            <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            El email es obligatorio y debe ser válido
                          </p>
                        }
                      </div>

                      <!-- Página web -->
                      <div class="sm:col-span-3">
                        <label for="pagina_web" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Página Web</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                            </svg>
                          </div>
                          <input
                            type="url"
                            id="pagina_web"
                            formControlName="pagina_web"
                            placeholder="https://ejemplo.com"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>

                      <!-- Horario -->
                      <div class="sm:col-span-3">
                        <label for="horario_atencion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Horario de Atención</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="horario_atencion"
                            formControlName="horario_atencion"
                            placeholder="Ej: Lunes a Viernes 9:00 am - 5:00 pm"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Tab: Detalles del Negocio -->
              @if (activeTab === 'detalles-negocio') {
                <div class="space-y-6">
                  <!-- Detalles del negocio -->
                  <div>
                    <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200 flex items-center">
                      <svg class="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Detalles del Negocio
                    </h2>
                    <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <!-- Rango de precios -->
                      <div class="sm:col-span-2">
                        <label for="precio_rango" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Rango de Precios</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="precio_rango"
                            formControlName="precio_rango"
                            placeholder="Ej: S/. 20 - S/. 100"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>

                      <!-- Capacidad de aforo -->
                      <div class="sm:col-span-2">
                        <label for="capacidad_aforo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Capacidad de Aforo</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="number"
                            id="capacidad_aforo"
                            formControlName="capacidad_aforo"
                            min="0"
                            placeholder="Número de personas"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>

                      <!-- Número de personas que atiende -->
                      <div class="sm:col-span-2">
                        <label for="numero_personas_atiende" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Personas que Atiende</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                          </div>
                          <input
                            type="number"
                            id="numero_personas_atiende"
                            formControlName="numero_personas_atiende"
                            min="0"
                            placeholder="Número de personal"
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>

                      <!-- Métodos de pago -->
                      <div class="sm:col-span-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center">
                          <svg class="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                          Métodos de Pago
                        </label>
                        <div class="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="metodo_efectivo"
                                [checked]="hasPaymentMethod('Efectivo')"
                                (change)="togglePaymentMethod('Efectivo', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="metodo_efectivo" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Efectivo</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="metodo_tarjeta"
                                [checked]="hasPaymentMethod('Tarjeta')"
                                (change)="togglePaymentMethod('Tarjeta', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="metodo_tarjeta" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Tarjeta de Crédito/Débito</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="metodo_transferencia"
                                [checked]="hasPaymentMethod('Transferencia')"
                                (change)="togglePaymentMethod('Transferencia', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="metodo_transferencia" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Transferencia Bancaria</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="metodo_yape"
                                [checked]="hasPaymentMethod('Yape')"
                                (change)="togglePaymentMethod('Yape', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="metodo_yape" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Yape</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="metodo_plin"
                                [checked]="hasPaymentMethod('Plin')"
                                (change)="togglePaymentMethod('Plin', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="metodo_plin" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Plin</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Idiomas hablados -->
                      <div class="sm:col-span-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center">
                          <svg class="mr-2 h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                          </svg>
                          Idiomas Hablados
                        </label>
                        <div class="mt-3 space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="idioma_espanol"
                                [checked]="hasLanguage('Español')"
                                (change)="toggleLanguage('Español', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="idioma_espanol" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Español</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="idioma_ingles"
                                [checked]="hasLanguage('Inglés')"
                                (change)="toggleLanguage('Inglés', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="idioma_ingles" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Inglés</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="idioma_quechua"
                                [checked]="hasLanguage('Quechua')"
                                (change)="toggleLanguage('Quechua', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="idioma_quechua" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Quechua</label>
                            </div>
                            <div class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm transition-colors duration-200">
                              <input
                                type="checkbox"
                                id="idioma_aymara"
                                [checked]="hasLanguage('Aymara')"
                                (change)="toggleLanguage('Aymara', $event)"
                                class="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                              >
                              <label for="idioma_aymara" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">Aymara</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Opciones de acceso -->
                      <div class="sm:col-span-3">
                        <label for="opciones_acceso" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Opciones de Acceso</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="opciones_acceso"
                            formControlName="opciones_acceso"
                            placeholder="Ej: Transporte público, a pie, etc."
                            class="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          >
                        </div>
                      </div>

                      <!-- Facilidades para discapacitados -->
                      <div class="sm:col-span-3">
                        <div class="mt-6 bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm transition-colors duration-200">
                          <div class="flex items-center">
                            <input
                              type="checkbox"
                              id="facilidades_discapacidad"
                              formControlName="facilidades_discapacidad"
                              class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                            >
                            <label for="facilidades_discapacidad" class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                              Cuenta con facilidades para personas con discapacidad
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Tab: Imágenes -->
              @if (activeTab === 'imagenes') {
                <div class="space-y-6">
                  <!-- Sliders Principales -->
                  <app-slider-upload
                    title="Imágenes Principales"
                    [slidersFormArray]="slidersPrincipalesArray"
                    [existingSliders]="slidersPrincipales"
                    [isSliderPrincipal]="true"
                    (changeSlidersEvent)="onSlidersPrincipalesChange($event)"
                    (deletedSlidersEvent)="onDeletedSlidersPrincipalesChange($event)"
                  ></app-slider-upload>

                  <!-- Sliders Secundarios -->
                  <app-slider-upload
                    title="Imágenes Secundarias"
                    [slidersFormArray]="slidersSecundariosArray"
                    [existingSliders]="slidersSecundarios"
                    [isSliderPrincipal]="false"
                    (changeSlidersEvent)="onSlidersSecundariosChange($event)"
                    (deletedSlidersEvent)="onDeletedSlidersSecundariosChange($event)"
                  ></app-slider-upload>
                </div>
              }
            </div>

            <!-- Botones de acción -->
            <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end sm:px-6 transition-colors duration-200">
              <button
                type="button"
                (click)="cancel()"
                class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-3 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="emprendedorForm.invalid || isSubmitting"
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                [class.opacity-50]="emprendedorForm.invalid || isSubmitting"
                [class.cursor-not-allowed]="emprendedorForm.invalid || isSubmitting"
              >
                @if (isSubmitting) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  {{ isEditMode ? 'Actualizar' : 'Crear' }} Emprendedor
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class EmprendedorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  emprendedorForm!: FormGroup;
  emprendedor: Emprendedor | null = null;
  asociaciones: Asociacion[] = [];

  // Sliders
  slidersPrincipales: SliderImage[] = [];
  slidersSecundarios: SliderImage[] = [];

  deletedSlidersPrincipales: number[] = [];
  deletedSlidersSecundarios: number[] = [];

  loading = true;
  isSubmitting = false;
  isEditMode = false;
  emprendedorId: number | null = null;

  paymentMethods: string[] = [];
  languages: string[] = [];

  activeTab = 'informacion-basica';

  get slidersPrincipalesArray(): FormArray {
    return this.emprendedorForm.get('sliders_principales') as FormArray;
  }

  get slidersSecundariosArray(): FormArray {
    return this.emprendedorForm.get('sliders_secundarios') as FormArray;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.initForm();
    this.loadAsociaciones();

    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.emprendedorId = +id;
      this.loadEmprendedor(this.emprendedorId);
    } else {
      this.loading = false;

      // Si viene con asociación preseleccionada por query param
      const asociacionId = this.route.snapshot.queryParams['asociacion_id'];
      if (asociacionId) {
        this.emprendedorForm.patchValue({ asociacion_id: +asociacionId });
      }
    }
  }

  initForm() {
    this.emprendedorForm = this.fb.group({
      nombre: ['', [Validators.required]],
      tipo_servicio: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      ubicacion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pagina_web: [''],
      horario_atencion: [''],
      precio_rango: [''],
      capacidad_aforo: [null],
      numero_personas_atiende: [null],
      categoria: ['', [Validators.required]],
      opciones_acceso: [''],
      facilidades_discapacidad: [false],
      asociacion_id: [null],
      sliders_principales: this.fb.array([]),
      sliders_secundarios: this.fb.array([])
    });
  }

  loadAsociaciones() {
    this.turismoService.getAsociaciones(1, 100).subscribe({
      next: (response) => {
        this.asociaciones = response.data;
      },
      error: (error) => {
        console.error('Error al cargar asociaciones:', error);
      }
    });
  }

  loadEmprendedor(id: number) {
    this.loading = true;
    this.turismoService.getEmprendedor(id).subscribe({
      next: (emprendedor) => {
        console.log('Emprendedor cargado:', emprendedor);

        this.emprendedor = emprendedor;
        this.paymentMethods = emprendedor.metodos_pago || [];
        this.languages = emprendedor.idiomas_hablados || [];

        // Llenar el formulario con los datos del emprendedor
        this.emprendedorForm.patchValue({
          nombre: emprendedor.nombre,
          tipo_servicio: emprendedor.tipo_servicio,
          descripcion: emprendedor.descripcion,
          ubicacion: emprendedor.ubicacion,
          telefono: emprendedor.telefono,
          email: emprendedor.email,
          pagina_web: emprendedor.pagina_web,
          horario_atencion: emprendedor.horario_atencion,
          precio_rango: emprendedor.precio_rango,
          capacidad_aforo: emprendedor.capacidad_aforo,
          numero_personas_atiende: emprendedor.numero_personas_atiende,
          categoria: emprendedor.categoria,
          opciones_acceso: emprendedor.opciones_acceso,
          facilidades_discapacidad: emprendedor.facilidades_discapacidad,
          asociacion_id: emprendedor.asociacion_id
        });

        // Limpiar los arrays de sliders existentes
        this.slidersPrincipales = [];
        this.slidersSecundarios = [];

        // Manejar sliders principales
        // Verifica tanto slidersPrincipales (camelCase) como sliders_principales (snake_case)
        const principales = emprendedor.slidersPrincipales || emprendedor.sliders_principales || [];
        if (principales && principales.length > 0) {
          console.log('Sliders principales encontrados:', principales.length);
          this.slidersPrincipales = principales.map(slider => ({
            id: slider.id,
            nombre: slider.nombre,
            es_principal: true, // Garantizar que es principal
            orden: slider.orden || 1,
            imagen: slider.url_completa || '',
            url_completa: slider.url_completa
          }));
        }

        // Manejar sliders secundarios
        // Verifica tanto slidersSecundarios (camelCase) como sliders_secundarios (snake_case)
        const secundarios = emprendedor.slidersSecundarios || emprendedor.sliders_secundarios || [];
        if (secundarios && secundarios.length > 0) {
          console.log('Sliders secundarios encontrados:', secundarios.length);
          this.slidersSecundarios = secundarios.map(slider => {
            // Verificar si descripcion es un objeto o un string
            let tituloValor = '';
            let descripcionValor = '';

            if (slider.descripcion && typeof slider.descripcion === 'object') {
              tituloValor = (slider.descripcion as any).titulo || '';
              descripcionValor = (slider.descripcion as any).descripcion || '';
            }

            return {
              id: slider.id,
              nombre: slider.nombre,
              es_principal: false, // Garantizar que NO es principal
              orden: slider.orden || 1,
              imagen: slider.url_completa || '',
              url_completa: slider.url_completa,
              titulo: tituloValor,
              descripcion: descripcionValor
            };
          });
        }

        // Verificar que los arrays de sliders contengan los datos esperados
        console.log('Sliders principales procesados:', this.slidersPrincipales);
        console.log('Sliders secundarios procesados:', this.slidersSecundarios);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendedor:', error);
        this.loading = false;
      }
    });
  }

  // Métodos de pago
  hasPaymentMethod(method: string): boolean {
    return this.paymentMethods.includes(method);
  }

  togglePaymentMethod(method: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked && !this.hasPaymentMethod(method)) {
      this.paymentMethods.push(method);
    } else if (!isChecked && this.hasPaymentMethod(method)) {
      this.paymentMethods = this.paymentMethods.filter(m => m !== method);
    }
  }

  // Idiomas
  hasLanguage(language: string): boolean {
    return this.languages.includes(language);
  }
  
  onDeletedSlidersPrincipalesChange(deletedIds: number[]) {
    this.deletedSlidersPrincipales = deletedIds;
  }

  onDeletedSlidersSecundariosChange(deletedIds: number[]) {
    this.deletedSlidersSecundarios = deletedIds;
  }
  
  toggleLanguage(language: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked && !this.hasLanguage(language)) {
      this.languages.push(language);
    } else if (!isChecked && this.hasLanguage(language)) {
      this.languages = this.languages.filter(l => l !== language);
    }
  }

  // Eventos de slider
  onSlidersPrincipalesChange(sliders: SliderImage[]) {
    this.slidersPrincipales = sliders;
  }

  onSlidersSecundariosChange(sliders: SliderImage[]) {
    this.slidersSecundarios = sliders;
  }

  submitForm() {
    if (this.emprendedorForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    // Preparar datos para enviar
    const formData = {...this.emprendedorForm.value};
    formData.metodos_pago = this.paymentMethods || [];
    formData.idiomas_hablados = this.languages || [];

    // Usar los nombres de propiedades en snake_case que espera el API
    formData.sliders_principales = this.slidersPrincipales.map(slider => ({
      ...slider,
      es_principal: true
    }));

    formData.sliders_secundarios = this.slidersSecundarios.map(slider => ({
      ...slider,
      es_principal: false
    }));

    // Añadir los IDs de sliders eliminados
    formData.deleted_sliders = [
      ...this.deletedSlidersPrincipales,
      ...this.deletedSlidersSecundarios
    ];

    // Crear o actualizar emprendedor
    if (this.isEditMode && this.emprendedorId) {
      this.turismoService.updateEmprendedor(this.emprendedorId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert("Emprendedor actualizado correctamente");
          this.router.navigate(['/admin/emprendedores']);
        },
        error: (error) => {
          console.error('Error al actualizar emprendedor:', error);
          this.isSubmitting = false;
          alert("Error al actualizar el emprendedor. Por favor, intente nuevamente.");
        }
      });
    } else {
      this.turismoService.createEmprendedor(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Emprendedor creado correctamente');
          this.router.navigate(['/admin/emprendedores']);
        },
        error: (error) => {
          console.error('Error al crear emprendedor:', error);
          this.isSubmitting = false;
          alert('Error al crear el emprendedor. Por favor, intente nuevamente.');
        }
      });
    }
  }

  cancel() {
    // Si vino de una asociación, volver a la lista de emprendedores de esa asociación
    const asociacionId = this.route.snapshot.queryParams['asociacion_id'];
    if (asociacionId) {
      this.router.navigate(['/admin/asociaciones', asociacionId, 'emprendedores']);
    } else {
      this.router.navigate(['/admin/emprendedores']);
    }
  }
}