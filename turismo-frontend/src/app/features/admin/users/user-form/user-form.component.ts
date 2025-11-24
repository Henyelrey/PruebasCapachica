import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminLayoutComponent } from '../../../../shared/layouts/admin-layout/admin-layout.component';
import { Role, User } from '../../../../core/models/user.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminHeaderComponent],
  template: `
      <!-- Header con fondo profesional -->
      <app-admin-header 
        [title]="isEditMode ? 'Editar Usuario' : 'Crear Usuario'" 
        [subtitle]="isEditMode ? 'Modificar información del usuario' : 'Agregar un nuevo usuario al sistema'"
      ></app-admin-header>
      
      <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div class="space-y-6">
          <div class="sm:flex sm:items-center sm:justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ isEditMode ? 'Formulario de Edición' : 'Formulario de Creación' }}</h2>
            <div class="mt-4 sm:mt-0">
              <a 
                routerLink="/admin/users" 
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
                <span class="ml-4 text-gray-700 dark:text-gray-300">Cargando datos del usuario...</span>
              </div>
            } @else {
              <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
                <!-- Foto de perfil -->
                <div class="sm:col-span-6 flex flex-col items-center sm:items-start">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto de perfil</label>
                  <div class="flex items-center">
                    <div class="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                      @if (imagePreview) {
                        <img [src]="imagePreview" alt="Vista previa de la foto" class="h-full w-full object-cover" />
                      } @else {
                        <svg class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      }
                    </div>
                    <div class="ml-5 flex flex-col space-y-2">
                      <label for="foto_perfil" class="relative cursor-pointer rounded-md bg-white dark:bg-gray-700 font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none">
                        <span class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 transition-colors duration-200">
                          <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          Subir foto
                        </span>
                        <input #fileInput id="foto_perfil" type="file" class="sr-only" (change)="onFileSelected($event)" accept="image/*" />
                      </label>
                      @if (imagePreview && !isUserPhoto) {
                        <button 
                          type="button" 
                          (click)="removeSelectedImage()"
                          class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition-colors duration-200"
                        >
                          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Eliminar
                        </button>
                      } @else if (imagePreview && isUserPhoto) {
                        <button 
                          type="button" 
                          (click)="removeUserPhoto()"
                          class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 transition-colors duration-200"
                        >
                          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Eliminar foto actual
                        </button>
                      }
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <!-- Nombre -->
                  <div class="sm:col-span-6">
                    <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        id="name" 
                        formControlName="name" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200" 
                        [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('name')}"
                        placeholder="Ingrese el nombre completo"
                      />
                      @if (isFieldInvalid('name')) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">El nombre completo es requerido</p>
                      }
                    </div>
                  </div>
                  
                  <!-- Email -->
                  <div class="sm:col-span-3">
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input 
                        type="email" 
                        id="email" 
                        formControlName="email" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"  
                        [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('email')}"
                        placeholder="correo@ejemplo.com"
                      />
                      @if (isFieldInvalid('email')) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                          @if (userForm.get('email')?.errors?.['required']) {
                            El correo electrónico es requerido
                          } @else if (userForm.get('email')?.errors?.['email']) {
                            Ingrese un correo electrónico válido
                          }
                        </p>
                      }
                    </div>
                  </div>
                  
                  <!-- Teléfono -->
                  <div class="sm:col-span-3">
                    <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <input 
                        type="tel" 
                        id="phone" 
                        formControlName="phone" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"  
                        [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('phone')}"
                        placeholder="999888777"
                      />
                      @if (isFieldInvalid('phone')) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">El teléfono es requerido</p>
                      }
                    </div>
                  </div>
                  
                  <!-- País -->
                  <div class="sm:col-span-3">
                    <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        id="country" 
                        formControlName="country" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Ingrese el país"
                      />
                    </div>
                  </div>
                  
                  <!-- Dirección -->
                  <div class="sm:col-span-3">
                    <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        id="address" 
                        formControlName="address" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        placeholder="Ingrese la dirección"
                      />
                    </div>
                  </div>
                  
                  <!-- Fecha de nacimiento -->
                  <div class="sm:col-span-3">
                    <label for="birth_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de nacimiento</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input 
                        type="date" 
                        id="birth_date" 
                        formControlName="birth_date" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                  
                  <!-- Género -->
                  <div class="sm:col-span-3">
                    <label for="gender" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Género</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <select 
                        id="gender" 
                        formControlName="gender" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      >
                        <option [ngValue]="null">Seleccionar género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                        <option value="prefer_not_to_say">Prefiero no decirlo</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Idioma preferido -->
                  <div class="sm:col-span-3">
                    <label for="preferred_language" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Idioma preferido</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                        </svg>
                      </div>
                      <select 
                        id="preferred_language" 
                        formControlName="preferred_language" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      >
                        <option [ngValue]="null">Seleccionar idioma</option>
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="pt">Portugués</option>
                        <option value="fr">Francés</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Contraseña -->
                  <div class="sm:col-span-3">
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                      <input 
                        type="password" 
                        id="password" 
                        formControlName="password" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"  
                        [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('password')}"
                        placeholder="Ingrese la contraseña"
                      />
                      @if (isFieldInvalid('password')) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                          @if (userForm.get('password')?.errors?.['required']) {
                            La contraseña es requerida
                          } @else if (userForm.get('password')?.errors?.['minlength']) {
                            La contraseña debe tener al menos 8 caracteres
                          }
                        </p>
                      }
                      @if (isEditMode) {
                        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Dejar en blanco para mantener la contraseña actual</p>
                      }
                    </div>
                  </div>
                  
                  <!-- Confirmar Contraseña -->
                  <div class="sm:col-span-3">
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar contraseña</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <input 
                        type="password" 
                        id="password_confirmation" 
                        formControlName="password_confirmation" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"  
                        [ngClass]="{'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': isFieldInvalid('password_confirmation')}"
                        placeholder="Confirme la contraseña"
                      />
                      @if (isFieldInvalid('password_confirmation')) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                          @if (userForm.get('password_confirmation')?.errors?.['required']) {
                            La confirmación de contraseña es requerida
                          } @else if (userForm.get('password_confirmation')?.errors?.['mustMatch']) {
                            Las contraseñas no coinciden
                          }
                        </p>
                      }
                    </div>
                  </div>
                  
                  <!-- Estado -->
                  <div class="sm:col-span-3">
                    <label for="active" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <select 
                        id="active" 
                        formControlName="active" 
                        class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200" 
                      >
                        <option [ngValue]="true">Activo</option>
                        <option [ngValue]="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Roles -->
                  <div class="sm:col-span-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles</label>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      @for (role of availableRoles; track role.id) {
                        <div class="relative flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-150 border border-gray-200 dark:border-gray-700">
                          <div class="flex items-center h-5">
                            <input 
                              type="checkbox" 
                              [id]="'role-' + role.id" 
                              [value]="role.name" 
                              (change)="onRoleChange($event)" 
                              [checked]="isRoleSelected(role.name)"
                              class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200" 
                            />
                          </div>
                          <div class="ml-3 text-sm">
                            <label [for]="'role-' + role.id" class="font-medium text-gray-700 dark:text-gray-300">
                              {{ role.name }}
                            </label>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">ID: {{ role.id }}</p>
                          </div>
                        </div>
                      }
                    </div>
                    @if (userForm.get('roles')?.value.length === 0 && submitted) {
                      <p class="mt-2 text-sm text-red-600 dark:text-red-400">Seleccione al menos un rol</p>
                    }
                  </div>
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
                      </div>
                    </div>
                  </div>
                }
                
                <div class="flex justify-end space-x-3">
                  <button 
                    type="button"
                    routerLink="/admin/users"
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
    /* Añadir estilos adicionales para el modo oscuro */
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
    
    :host-context(.dark-theme) {
      background-color: #111827;
    }
    
    /* Mejora para que el hover en dark mode sea más oscuro y no blanco */
    .dark .hover\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
    
    /* Estilos para el checkbox cuando está marcado */
    input[type="checkbox"]:checked {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
    }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  userForm!: FormGroup;
  availableRoles: Role[] = [];
  userId: number | null = null;
  originalRoles: string[] = [];
  
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isUserPhoto: boolean = false;
  photoRemoved: boolean = false;
  
  get isEditMode(): boolean {
    return this.userId !== null;
  }
  
  ngOnInit() {
    this.initForm();
    this.loadRoles();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      // Cargamos los datos del usuario
      this.loading = true;
      this.loadUser(this.userId);
    }
  }
  
  initForm() {
    // Inicializamos el formulario con valores por defecto
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', this.isEditMode ? [] : [Validators.required]],
      active: [true],
      country: [''],
      birth_date: [''],
      address: [''],
      gender: [''],
      preferred_language: [''],
      roles: [[]]
    }, {
      validators: this.mustMatch('password', 'password_confirmation')
    });
    
    // Añadimos un log para depurar
    console.log('Formulario inicializado:', this.userForm.value);
  }
  
  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.error = 'Error al cargar los roles. Por favor, intente nuevamente.';
      }
    });
  }
  
  loadUser(id: number) {
    this.loading = true;
    this.adminService.getUser(id).subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);
        
        try {
          if (response && response.success && response.data) {
            // En esta estructura, los datos del usuario están directamente en response.data, no en response.data.user
            const userData = response.data;
            
            if (userData) {
              console.log('Datos de usuario encontrados:', userData);
              
              // Actualizar el formulario con los datos obtenidos usando patchValue para mayor eficiencia
              this.userForm.patchValue({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                // Convertir correctamente el valor active
                active: !!userData.active, // Convertir a booleano
                country: userData.country || '',
                address: userData.address || '',
                gender: userData.gender || '',
                preferred_language: userData.preferred_language || ''
              });
              
              // Manejar la fecha de nacimiento correctamente
              if (userData.birth_date) {
                try {
                  // Asegurarnos de que esté en formato YYYY-MM-DD para input type="date"
                  const dateObj = new Date(userData.birth_date);
                  if (!isNaN(dateObj.getTime())) { // Verificar si es una fecha válida
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    this.userForm.get('birth_date')?.setValue(formattedDate);
                  } else {
                    this.userForm.get('birth_date')?.setValue(userData.birth_date);
                  }
                } catch (error) {
                  console.error('Error al procesar la fecha:', error);
                }
              }
              
              // Si hay una foto de perfil, mostrarla
              if (userData.foto_perfil) {
                console.log('Foto de perfil encontrada:', userData.foto_perfil);
                this.imagePreview = userData.foto_perfil;
                this.isUserPhoto = true;
              }
              
              // Actualizar roles - ahora son un array simple de strings
              if (userData.roles && Array.isArray(userData.roles)) {
                console.log('Roles encontrados:', userData.roles);
                this.originalRoles = [...userData.roles]; // Guardar roles originales
                this.userForm.get('roles')?.setValue(userData.roles);
              } else {
                console.warn('No se encontraron roles en la respuesta');
                this.userForm.get('roles')?.setValue([]);
              }
              
              // Cargar roles disponibles de la respuesta si están presentes
              if (response.available_roles && Array.isArray(response.available_roles)) {
                this.availableRoles = response.available_roles;
              }
              
              console.log('Formulario actualizado:', this.userForm.value);
            } else {
              console.error('No se encontraron datos de usuario en la respuesta');
              this.error = 'No se encontraron datos del usuario.';
            }
          } else {
            console.error('Formato de respuesta inesperado', response);
            this.error = 'Error al cargar los datos del usuario.';
          }
        } catch (err) {
          console.error('Error al procesar datos del usuario:', err);
          this.error = 'Error al procesar los datos del usuario: ' + (err instanceof Error ? err.message : String(err));
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.error = 'Error al cargar los datos del usuario: ' + 
                    (error.error?.message || error.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Crear un URL para previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.isUserPhoto = false;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  removeSelectedImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  removeUserPhoto() {
    if (this.userId) {
      if (confirm('¿Está seguro de que desea eliminar la foto de perfil? Esta acción no se puede deshacer.')) {
        this.adminService.deleteUserProfilePhoto(this.userId).subscribe({
          next: () => {
            this.imagePreview = null;
            this.isUserPhoto = false;
            this.photoRemoved = true;
            alert('Foto de perfil eliminada correctamente');
          },
          error: (error) => {
            console.error('Error al eliminar foto de perfil:', error);
            this.error = 'Error al eliminar la foto de perfil.';
          }
        });
      }
    }
  }
  
  onRoleChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const roleName = checkbox.value;
    const roles = [...this.userForm.get('roles')?.value || []];
    
    if (checkbox.checked) {
      if (!roles.includes(roleName)) {
        roles.push(roleName);
      }
    } else {
      const index = roles.indexOf(roleName);
      if (index !== -1) {
        roles.splice(index, 1);
      }
    }
    
    this.userForm.get('roles')?.setValue(roles);
  }
  
  isRoleSelected(roleName: string): boolean {
    const roles = this.userForm.get('roles')?.value || [];
    return roles.includes(roleName);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.submitted)) || false;
  }
  
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      
      if (!control.value) {
        return null;
      }
      
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }
      
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      
      return null;
    };
  }
  
  prepareFormData(): FormData {
    // Crear FormData para enviar datos del formulario
    const formData = new FormData();
    const formValues = this.userForm.value;
    
    // Añadir todos los campos del formulario
    Object.keys(formValues).forEach(key => {
      // No incluir password si está vacío en modo edición
      if (key === 'password' && this.isEditMode && !formValues[key]) {
        return;
      }
      // No incluir password_confirmation
      if (key === 'password_confirmation') {
        return;
      }
      // No incluir roles en FormData, se enviarán por separado
      if (key === 'roles') {
        return;
      }
      
      // Convertir booleanos a 1/0 para el campo active
      if (key === 'active' && formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key] ? '1' : '0');
      }
      // Solo añadir otros valores que no sean null o undefined
      else if (formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });
    
    // Añadir archivo si hay uno seleccionado
    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile);
    }
    
    return formData;
  }
  
  onSubmit() {
    this.submitted = true;
    this.error = '';
    
    if (this.userForm.invalid) {
      return;
    }
    
    const formData = this.prepareFormData();
    const newRoles = this.userForm.get('roles')?.value || [];
    
    this.saving = true;
    
    if (this.isEditMode && this.userId) {
      // Actualizar usuario existente
      this.adminService.updateUser(this.userId, formData).subscribe({
        next: (response) => {
          console.log('Usuario actualizado:', response);
          
          // Verificar si los roles han cambiado
          const rolesChanged = this.haveRolesChanged(this.originalRoles, newRoles);
          
          if (rolesChanged) {
            this.updateUserRoles(this.userId, newRoles);
          } else {
            this.saving = false;
            alert('Usuario actualizado correctamente');
            this.router.navigate(['/admin/users']);
          }
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.error = error.error?.message || 'Error al actualizar el usuario. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    } else {
      // Para creación, añadir roles al FormData como array
      if (newRoles && newRoles.length > 0) {
        // Limpiar cualquier valor existente primero
        formData.delete('roles[]');
        
        // Añadir cada rol individualmente con la notación para arrays en PHP
        newRoles.forEach((role: string) => {
          formData.append('roles[]', role);
        });
      }
      
      // Crear nuevo usuario
      this.adminService.createUser(formData).subscribe({
        next: (response) => {
          this.saving = false;
          alert('Usuario creado correctamente');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.error = error.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    }
  }
  
  haveRolesChanged(originalRoles: string[], newRoles: string[]): boolean {
    if (originalRoles.length !== newRoles.length) {
      return true;
    }
    
    // Ordenar para comparación consistente
    const sortedOriginal = [...originalRoles].sort();
    const sortedNew = [...newRoles].sort();
    
    // Comparar cada elemento
    for (let i = 0; i < sortedOriginal.length; i++) {
      if (sortedOriginal[i] !== sortedNew[i]) {
        return true;
      }
    }
    
    return false;
  }
  
  // Método para actualizar roles de usuario
  updateUserRoles(userId: number | null, roles: string[]) {
    if (userId === null) {
      console.error('ID de usuario no válido');
      this.error = 'Error al actualizar roles: ID de usuario no válido';
      this.saving = false;
      return;
    }
    
    this.adminService.assignRolesToUser(userId, roles).subscribe({
      next: () => {
        this.saving = false;
        this.originalRoles = [...roles]; // Actualizar roles originales
        alert('Usuario y roles actualizados correctamente');
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        console.error('Error al actualizar roles:', error);
        this.error = error.error?.message || 'Error al actualizar los roles. Por favor, intente nuevamente.';
        this.saving = false;
      }
    });
  }
}