// src/app/features/admin/turismo/planes/planes-detail/planes-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PlanesService } from '../../../../../core/services/planes.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { Plan, PlanEstadisticas } from '../../../../../core/models/plan.model';
import { environment } from '../../../../../../environments/environments';

@Component({
  selector: 'app-planes-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
    <app-admin-header 
      [title]="plan?.nombre || 'Detalle del Plan'" 
      subtitle="Información completa del plan turístico colaborativo"
    >
      <div class="flex items-center space-x-2">
        <a
          routerLink="/admin/planes"
          class="inline-flex items-center rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver a Planes
        </a>
        @if (plan) {
          <a
            [routerLink]="['/admin/planes/edit', plan.id]"
            class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar Plan
          </a>
        }
      </div>
    </app-admin-header>

    <div class="container mx-auto px-2 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      @if (loading) {
        <div class="flex justify-center items-center p-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
          <span class="ml-4 text-gray-600 dark:text-gray-300">Cargando detalle del plan...</span>
        </div>
      } @else if (!plan) {
        <div class="text-center p-8">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Plan no encontrado</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">El plan solicitado no existe o no tienes permisos para verlo.</p>
        </div>
      } @else {
        
        <!-- Información principal del plan -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6 transition-colors duration-300">
          <div class="relative">
            @if (plan.imagen_principal_url) {
              <img [src]="getImageUrl(plan.imagen_principal_url)" [alt]="plan.nombre" class="w-full h-64 object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            } @else {
              <div class="w-full h-64 bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
                <svg class="h-16 w-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            }
            
            <!-- Badges superpuestos -->
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
              @switch (plan.estado) {
                @case ('activo') {
                  <span class="inline-flex items-center rounded-full bg-green-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-green-800">
                    ✓ Activo
                  </span>
                }
                @case ('inactivo') {
                  <span class="inline-flex items-center rounded-full bg-red-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-red-800">
                    ✗ Inactivo
                  </span>
                }
                @case ('borrador') {
                  <span class="inline-flex items-center rounded-full bg-yellow-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-yellow-800">
                    📝 Borrador
                  </span>
                }
              }
              
              @if (plan.es_publico) {
                <span class="inline-flex items-center rounded-full bg-blue-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-blue-800">
                  🌐 Público
                </span>
              } @else {
                <span class="inline-flex items-center rounded-full bg-gray-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-gray-800">
                  🔒 Privado
                </span>
              }

              <!-- NUEVO: Badge de plan colaborativo -->
              @if (plan.emprendedores && plan.emprendedores.length > 1) {
                <span class="inline-flex items-center rounded-full bg-purple-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-purple-800">
                  🤝 Colaborativo
                </span>
              }
            </div>
            
            <!-- Dificultad -->
            <div class="absolute top-4 right-4">
              @switch (plan.dificultad) {
                @case ('facil') {
                  <span class="inline-flex items-center rounded-full bg-green-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-green-800">
                    🟢 Fácil
                  </span>
                }
                @case ('moderado') {
                  <span class="inline-flex items-center rounded-full bg-yellow-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-yellow-800">
                    🟡 Moderado
                  </span>
                }
                @case ('dificil') {
                  <span class="inline-flex items-center rounded-full bg-red-100/90 backdrop-blur-sm px-3 py-1 text-sm font-medium text-red-800">
                    🔴 Difícil
                  </span>
                }
              }
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ plan.nombre }}</h1>
                
                <!-- NUEVA SECCIÓN: Información de emprendedores -->
                @if (plan.emprendedores && plan.emprendedores.length > 0) {
                  <div class="space-y-2">
                    <!-- Organizador principal -->
                    @if (plan.organizador_principal) {
                      <div class="flex items-center text-sm">
                        <svg class="h-4 w-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                        </svg>
                        <span class="text-gray-600 dark:text-gray-400 font-medium">Organizador Principal:</span>
                        <span class="text-gray-800 dark:text-gray-200 ml-1">
                          {{ plan.organizador_principal.nombre }} • {{ plan.organizador_principal.ubicacion }}
                        </span>
                      </div>
                    }

                    <!-- Lista de todos los emprendedores -->
                    @if (plan.emprendedores.length > 1) {
                      <div class="flex items-start text-sm">
                        <svg class="h-4 w-4 text-blue-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span class="text-gray-600 dark:text-gray-400 font-medium">Equipo:</span>
                        <div class="ml-1 flex flex-wrap gap-1">
                          @for (emprendedor of plan.emprendedores; track emprendedor.id; let i = $index) {
                            <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                                  [class.bg-yellow-100]="emprendedor.es_organizador_principal && !isDarkMode()"
                                  [class.dark:bg-yellow-900]="emprendedor.es_organizador_principal && isDarkMode()"
                                  [class.text-yellow-800]="emprendedor.es_organizador_principal && !isDarkMode()"
                                  [class.dark:text-yellow-200]="emprendedor.es_organizador_principal && isDarkMode()"
                                  [class.bg-blue-100]="!emprendedor.es_organizador_principal && !isDarkMode()"
                                  [class.dark:bg-blue-900]="!emprendedor.es_organizador_principal && isDarkMode()"
                                  [class.text-blue-800]="!emprendedor.es_organizador_principal && !isDarkMode()"
                                  [class.dark:text-blue-200]="!emprendedor.es_organizador_principal && isDarkMode()">
                              {{ emprendedor.nombre }}
                              @if (emprendedor.es_organizador_principal) {
                                <svg class="h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-rule="evenodd"></path>
                                </svg>
                              }
                            </span>
                            @if (i < plan.emprendedores.length - 1) {
                              <span class="text-gray-400">•</span>
                            }
                          }
                        </div>
                      </div>
                    }
                  </div>
                } @else if (plan.emprendedor) {
                  <!-- Fallback para emprendedor legacy -->
                  <div class="flex items-center text-sm">
                    <svg class="h-4 w-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-gray-600 dark:text-gray-400">Por</span>
                    <span class="text-gray-800 dark:text-gray-200 ml-1 font-medium">
                      {{ plan.emprendedor.nombre }} • {{ plan.emprendedor.ubicacion }}
                    </span>
                  </div>
                }
              </div>
              
              <div class="mt-4 lg:mt-0 lg:ml-4">
                @if (plan.precio_total) {
                  <div class="text-right">
                    <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      S/ {{ plan.precio_total | number:'1.2-2' }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">por persona</div>
                  </div>
                }
              </div>
            </div>
            
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ plan.descripcion }}</p>
          </div>
        </div>

        <!-- Información detallada -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          <!-- Detalles del plan -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- NUEVA SECCIÓN: Emprendedores Participantes (Detallado) -->
            @if (plan.emprendedores && plan.emprendedores.length > 0) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Equipo de Emprendedores ({{ plan.emprendedores.length }})
                </h3>
                
                <div class="space-y-4">
                  @for (emprendedor of plan.emprendedores; track emprendedor.id) {
                    <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                         [ngClass]="[
                            emprendedor.es_organizador_principal && !isDarkMode() ? 'bg-yellow-50' : '',
                            emprendedor.es_organizador_principal && isDarkMode() ? 'dark:bg-yellow-900/20' : ''
                          ]">
                      
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center mb-2">
                            <h4 class="text-md font-semibold text-gray-900 dark:text-white">
                              {{ emprendedor.nombre }}
                            </h4>
                            
                            @if (emprendedor.es_organizador_principal) {
                              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-rule="evenodd"></path>
                                </svg>
                                Organizador Principal
                              </span>
                            } @else {
                              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    [class.bg-blue-100]="emprendedor.rol === 'organizador' && !isDarkMode()"
                                    [class.dark:bg-blue-900]="emprendedor.rol === 'organizador' && isDarkMode()"
                                    [class.text-blue-800]="emprendedor.rol === 'organizador' && !isDarkMode()"
                                    [class.dark:text-blue-200]="emprendedor.rol === 'organizador' && isDarkMode()"
                                    [class.bg-green-100]="emprendedor.rol === 'colaborador' && !isDarkMode()"
                                    [class.dark:bg-green-900]="emprendedor.rol === 'colaborador' && isDarkMode()"
                                    [class.text-green-800]="emprendedor.rol === 'colaborador' && !isDarkMode()"
                                    [class.dark:text-green-200]="emprendedor.rol === 'colaborador' && isDarkMode()">
                                {{ emprendedor.rol === 'organizador' ? '🎯 Organizador' : '🤝 Colaborador' }}
                              </span>
                            }
                          </div>
                          
                          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div class="flex items-center">
                              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {{ emprendedor.ubicacion }}
                            </div>
                            
                            @if (emprendedor.telefono) {
                              <div class="flex items-center">
                                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                {{ emprendedor.telefono }}
                              </div>
                            }
                            
                            @if (emprendedor.email) {
                              <div class="flex items-center">
                                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                {{ emprendedor.email }}
                              </div>
                            }
                          </div>
                          
                          @if (emprendedor.descripcion_participacion) {
                            <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              <span class="font-medium">Participación:</span> {{ emprendedor.descripcion_participacion }}
                            </div>
                          }
                        </div>
                        
                        @if (emprendedor.porcentaje_ganancia) {
                          <div class="text-right">
                            <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
                              {{ emprendedor.porcentaje_ganancia }}%
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">ganancia</div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
            
            <!-- Lo que incluye -->
            @if (plan.que_incluye) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Qué incluye
                </h3>
                <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ plan.que_incluye }}</div>
              </div>
            }
            
            <!-- Requerimientos -->
            @if (plan.requerimientos) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Requerimientos
                </h3>
                <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ plan.requerimientos }}</div>
              </div>
            }
            
            <!-- Qué llevar -->
            @if (plan.que_llevar) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg class="h-5 w-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Qué llevar
                </h3>
                <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ plan.que_llevar }}</div>
              </div>
            }

            <!-- Itinerario por días -->
            @if (plan.dias && plan.dias.length > 0) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="h-5 w-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Itinerario ({{ plan.duracion_dias }} {{ plan.duracion_dias === 1 ? 'día' : 'días' }})
                </h3>
                
                <div class="space-y-6">
                  @for (dia of plan.dias; track dia.id) {
                    <div class="border-l-4 border-primary-500 pl-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center">
                          <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-bold mr-3">
                            {{ dia.numero_dia }}
                          </span>
                          <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ dia.titulo }}</h4>
                            @if (dia.hora_inicio && dia.hora_fin) {
                              <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ dia.hora_inicio }} - {{ dia.hora_fin }}
                              </span>
                            }
                          </div>
                        </div>
                        @if (dia.duracion_estimada_minutos) {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {{ formatDuration(dia.duracion_estimada_minutos) }}
                          </span>
                        }
                      </div>
                      
                      <p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ dia.descripcion }}</p>
                      
                      <!-- Servicios del día -->
                      @if (dia.servicios && dia.servicios.length > 0) {
                        <div class="space-y-3">
                          <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            Actividades programadas:
                          </h5>
                          @for (servicioDia of dia.servicios; track servicioDia.id) {
                            <div class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div class="flex-1">
                                <div class="flex items-center">
                                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ servicioDia.servicio?.nombre }}
                                  </span>
                                  @if (servicioDia.hora_inicio && servicioDia.hora_fin) {
                                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                      {{ servicioDia.hora_inicio }} - {{ servicioDia.hora_fin }}
                                    </span>
                                  }
                                  @if (servicioDia.duracion_minutos) {
                                    <span class="text-xs text-blue-600 dark:text-blue-400 ml-2">
                                      ({{ formatDuration(servicioDia.duracion_minutos) }})
                                    </span>
                                  }
                                </div>
                                
                                @if (servicioDia.servicio?.emprendedor?.nombre) {
                                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Proveedor: {{ servicioDia.servicio?.emprendedor?.nombre }}
                                  </div>
                                }
                                
                                @if (servicioDia.notas) {
                                  <div class="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                    {{ servicioDia.notas }}
                                  </div>
                                }
                              </div>
                              
                              <div class="flex items-center space-x-2">
                                @if (servicioDia.es_opcional) {
                                  <span class="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                    Opcional
                                  </span>
                                }
                                @if (servicioDia.precio_adicional) {
                                  <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                    +S/ {{ servicioDia.precio_adicional | number:'1.2-2' }}
                                  </span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                      
                      @if (dia.notas_adicionales) {
                        <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r">
                          <div class="flex items-start">
                            <svg class="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                            <div>
                              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Nota importante:</p>
                              <p class="text-sm text-yellow-700 dark:text-yellow-300">{{ dia.notas_adicionales }}</p>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Panel lateral -->
          <div class="space-y-6">
            
            <!-- Información básica -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información básica</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Duración</dt>
                  <dd class="text-sm text-gray-900 dark:text-white">{{ plan.duracion_dias }} {{ plan.duracion_dias === 1 ? 'día' : 'días' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Capacidad</dt>
                  <dd class="text-sm text-gray-900 dark:text-white">{{ plan.capacidad }} personas</dd>
                </div>
                @if (plan.cupos_disponibles !== undefined) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Cupos disponibles</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">{{ plan.cupos_disponibles }}</dd>
                  </div>
                }
                @if (plan.total_emprendedores) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Emprendedores participantes</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">{{ plan.total_emprendedores }}</dd>
                  </div>
                }
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Creado por</dt>
                  <dd class="text-sm text-gray-900 dark:text-white">
                    {{ plan.creado_por?.name || 'Usuario desconocido' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creación</dt>
                  <dd class="text-sm text-gray-900 dark:text-white">
                    {{ plan.created_at | date:'dd/MM/yyyy HH:mm' }}
                  </dd>
                </div>
                @if (plan.updated_at && plan.updated_at !== plan.created_at) {
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">
                      {{ plan.updated_at | date:'dd/MM/yyyy HH:mm' }}
                    </dd>
                  </div>
                }
              </dl>
            </div>

            <!-- Estadísticas mejoradas -->
            @if (estadisticas) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Estadísticas
                </h3>
                
                <!-- Inscripciones -->
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ estadisticas.total_inscripciones }}</div>
                      <div class="text-xs text-blue-600 dark:text-blue-400">Total</div>
                    </div>
                    <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ estadisticas.inscripciones_confirmadas }}</div>
                      <div class="text-xs text-green-600 dark:text-green-400">Confirmadas</div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ estadisticas.inscripciones_pendientes }}</div>
                      <div class="text-xs text-yellow-600 dark:text-yellow-400">Pendientes</div>
                    </div>
                    <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ estadisticas.inscripciones_canceladas }}</div>
                      <div class="text-xs text-red-600 dark:text-red-400">Canceladas</div>
                    </div>
                  </div>
                </div>
                
                <hr class="my-4 border-gray-200 dark:border-gray-600">
                
                <!-- Métricas adicionales -->
                <dl class="space-y-3">
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total participantes</dt>
                    <dd class="text-sm text-gray-900 dark:text-white font-semibold">{{ estadisticas.total_participantes }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos totales</dt>
                    <dd class="text-sm text-gray-900 dark:text-white font-semibold">S/ {{ estadisticas.ingresos_totales | number:'1.2-2' }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio participantes/inscripción</dt>
                    <dd class="text-sm text-gray-900 dark:text-white">{{ estadisticas.promedio_participantes_por_inscripcion | number:'1.1-1' }}</dd>
                  </div>
                  
                  <div>
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">% Ocupación</dt>
                    <dd class="text-sm font-semibold"
                        [class.text-green-600]="estadisticas.porcentaje_ocupacion >= 80"
                        [class.dark:text-green-400]="estadisticas.porcentaje_ocupacion >= 80"
                        [class.text-yellow-600]="estadisticas.porcentaje_ocupacion >= 50 && estadisticas.porcentaje_ocupacion < 80"
                        [class.dark:text-yellow-400]="estadisticas.porcentaje_ocupacion >= 50 && estadisticas.porcentaje_ocupacion < 80"
                        [class.text-red-600]="estadisticas.porcentaje_ocupacion < 50"
                        [class.dark:text-red-400]="estadisticas.porcentaje_ocupacion < 50">
                      {{ estadisticas.porcentaje_ocupacion | number:'1.1-1' }}%
                    </dd>
                  </div>
                  
                  <!-- NUEVAS ESTADÍSTICAS COLABORATIVAS -->
                  @if (estadisticas.total_emprendedores) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Emprendedores colaborando</dt>
                      <dd class="text-sm text-gray-900 dark:text-white font-semibold">{{ estadisticas.total_emprendedores }}</dd>
                    </div>
                  }
                  
                  @if (estadisticas.organizador_principal) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Organizador principal</dt>
                      <dd class="text-sm text-gray-900 dark:text-white">{{ estadisticas.organizador_principal }}</dd>
                    </div>
                  }
                </dl>
              </div>
            }

            <!-- Acciones rápidas -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones</h3>
              <div class="space-y-3">
                <button
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  (click)="verInscripciones()"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Ver Inscripciones
                </button>
                
                <button
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                  (click)="duplicarPlan()"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Duplicar Plan
                </button>
                
                @if (plan.estado === 'activo') {
                  <button
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                    (click)="pausarPlan()"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Pausar Plan
                  </button>
                } @else if (plan.estado === 'inactivo') {
                  <button
                    class="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 dark:border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    (click)="activarPlan()"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-6 4h8M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"></path>
                    </svg>
                    Activar Plan
                  </button>
                }
              </div>
            </div>

            <!-- Galería de imágenes mejorada -->
            @if (plan.imagenes_galeria_urls && plan.imagenes_galeria_urls.length > 0) {
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Galería ({{ plan.imagenes_galeria_urls.length }})
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  @for (imagen of plan.imagenes_galeria_urls; track $index) {
                    <div class="relative group">
                      <img 
                        [src]="getImageUrl(imagen)" 
                        [alt]="'Imagen ' + ($index + 1) + ' de ' + plan.nombre"
                        class="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 border border-gray-200 dark:border-gray-600"
                        (click)="abrirImagenModal(getImageUrl(imagen))"
                      >
                      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-md flex items-center justify-center">
                        <svg class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                        </svg>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Modal para imagen ampliada mejorado -->
    @if (imagenModalUrl) {
      <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" (click)="cerrarImagenModal()">
        <div class="max-w-4xl max-h-full relative">
          <img 
            [src]="imagenModalUrl" 
            [alt]="plan?.nombre"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          >
          <button
            (click)="cerrarImagenModal()"
            class="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-full p-2 shadow-lg transition-colors duration-200"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class PlanesDetailComponent implements OnInit {
  private planesService = inject(PlanesService);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  plan: Plan | null = null;
  estadisticas: PlanEstadisticas | null = null;
  loading = true;
  imagenModalUrl: string | null = null;
  env = environment;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const planId = +params['id'];
      if (planId) {
        this.loadPlan(planId);
        this.loadEstadisticas(planId);
      }
    });
  }

  loadPlan(id: number) {
    this.loading = true;
    this.planesService.getPlan(id).subscribe({
      next: (response) => {
        this.plan = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar plan:', error);
        this.loading = false;
        alert('Error al cargar el plan. Por favor, intente nuevamente.');
      }
    });
  }

  loadEstadisticas(id: number) {
    this.planesService.getEstadisticasPlan(id).subscribe({
      next: (response) => {
        this.estadisticas = response;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        // No mostrar error para estadísticas, solo no mostrarlas
      }
    });
  }

  // NUEVOS MÉTODOS PARA FUNCIONALIDADES ADICIONALES

  verInscripciones() {
    if (this.plan?.id) {
      // Navegar a la página de inscripciones del plan con query params
      this.router.navigate(['/admin/planes/inscripciones'], {
        queryParams: { planId: this.plan.id }
      });
    }
  }

  duplicarPlan() {
    if (this.plan?.id) {
      if (confirm('¿Estás seguro de que quieres duplicar este plan? Se creará una copia con estado "borrador".')) {
        // Implementar lógica de duplicación
        console.log('Duplicar plan:', this.plan.id);
        alert('Función de duplicar plan - Implementar en el servicio');
      }
    }
  }

  pausarPlan() {
    if (this.plan?.id) {
      if (confirm('¿Estás seguro de que quieres pausar este plan? No estará disponible para nuevas inscripciones.')) {
        this.cambiarEstadoPlan('inactivo');
      }
    }
  }

  activarPlan() {
    if (this.plan?.id) {
      if (confirm('¿Estás seguro de que quieres activar este plan? Estará disponible para inscripciones.')) {
        this.cambiarEstadoPlan('activo');
      }
    }
  }

  private cambiarEstadoPlan(nuevoEstado: string) {
    if (!this.plan?.id) return;

    this.planesService.cambiarEstadoPlan(this.plan.id, nuevoEstado).subscribe({
      next: (planActualizado) => {
        this.plan = planActualizado;
        const mensaje = nuevoEstado === 'activo' ? 'Plan activado exitosamente' : 'Plan pausado exitosamente';
        alert(mensaje);
      },
      error: (error) => {
        console.error('Error al cambiar estado del plan:', error);
        alert('Error al cambiar el estado del plan. Por favor, intente nuevamente.');
      }
    });
  }

  // MÉTODOS DE UTILIDAD

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // Si ya es una URL completa, retornarla tal como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta relativa, agregar la URL base de assets
    return this.env.assetsUrl + imagePath;
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  abrirImagenModal(url: string) {
    this.imagenModalUrl = url;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarImagenModal() {
    this.imagenModalUrl = null;
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  // MÉTODOS PARA GESTIÓN DE EMPRENDEDORES (si se necesitan en el futuro)

  getEmprendedorRolBadgeClass(emprendedor: any): string {
    if (emprendedor.es_organizador_principal) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    } else if (emprendedor.rol === 'organizador') {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    } else {
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    }
  }

  getEmprendedorRolIcon(emprendedor: any): string {
    if (emprendedor.es_organizador_principal) {
      return '⭐';
    } else if (emprendedor.rol === 'organizador') {
      return '🎯';
    } else {
      return '🤝';
    }
  }

  getEmprendedorRolText(emprendedor: any): string {
    if (emprendedor.es_organizador_principal) {
      return 'Organizador Principal';
    } else if (emprendedor.rol === 'organizador') {
      return 'Organizador';
    } else {
      return 'Colaborador';
    }
  }

  // Cleanup al destruir el componente
  ngOnDestroy() {
    // Asegurar que el scroll del body se restaure
    document.body.style.overflow = 'auto';
  }
}