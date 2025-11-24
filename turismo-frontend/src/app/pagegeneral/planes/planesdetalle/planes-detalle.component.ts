import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanesService } from '../../../core/services/planes.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Plan, PlanInscripcion } from '../../../core/models/plan.model';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-planes-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="relative bg-[#fdf4ec] dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-20 font-sans min-h-screen transition-colors duration-300">
      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">Cargando información del plan...</p>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="container mx-auto px-6 py-20">
        <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg text-center transition-colors duration-300">
          <h2 class="text-xl font-bold mb-2">Error al cargar el plan</h2>
          <p class="mb-4">{{ error() }}</p>
          <button
            (click)="cargarPlan()"
            class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Reintentar
          </button>
        </div>
      </div>
      <!-- Contenido del plan -->
      <div *ngIf="plan() && !loading()">

        <!-- Imagen de fondo detrás del encabezado -->
        <div class="absolute inset-0 z-0">
          @if (plan()!.imagen_principal_url) {
            <img [src]="env.assetsUrl + plan()!.imagen_principal_url"
                 [alt]="plan()!.nombre"
                 class="w-full h-full object-cover opacity-20 blur-sm">
          } @else {
            <div class="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 opacity-20"></div>
          }
        </div>

        <!-- Imagen de fondo solo para encabezado -->
        <div class="absolute top-0 left-0 right-0 h-[550px] z-0">
          @if (plan()!.imagen_principal_url) {
            <img [src]="env.assetsUrl + plan()!.imagen_principal_url"
                 [alt]="plan()!.nombre"
                 class="w-full h-full object-cover">
          } @else {
            <div class="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-700 dark:to-amber-900"></div>
          }
          <!-- Overlay oscuro para modo oscuro -->
          <div class="absolute inset-0 bg-black opacity-0 dark:opacity-40 transition-opacity duration-300"></div>
        </div>

        <!-- Encabezado sobre imagen -->
        <div class="relative z-10 text-center container mx-auto px-6 py-32">
          <h1 class="text-5xl md:text-6xl font-extrabold text-white drop-shadow-2xl font-serif mb-4 tracking-wide">
            {{ plan()!.nombre }}
          </h1>
          <p class="text-xl md:text-2xl text-white font-medium italic drop-shadow-md tracking-wide">
            {{ plan()!.descripcion }}
          </p>

          <!-- Badges informativos -->
          <div class="flex justify-center gap-4 mt-6">
            <span class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              {{ plan()!.duracion_dias }} {{ plan()!.duracion_dias === 1 ? 'Día' : 'Días' }}
            </span>
            <span class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              {{ getDificultadLabel(plan()!.dificultad!) }}
            </span>
            <span class="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              S/ {{ plan()!.precio_total || 0 }}
            </span>
          </div>
        </div>

        <!-- Contenido del formulario y detalles -->
        <div class="relative z-10 container mx-auto px-6 mt-[-80px]">
          <div class="grid lg:grid-cols-3 gap-8">

            <!-- Columna izquierda - Contenido principal (2/3) -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Galería de imágenes mejorada -->
              <div *ngIf="plan() as p" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div *ngIf="p.imagenes_galeria_urls && p.imagenes_galeria_urls.length > 0">
                  <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Galería de Imágenes
                    </h3>
                  </div>
                  <div class="p-6">
                    <!-- Grid uniforme centrado -->
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                      <div *ngFor="let imagen of p.imagenes_galeria_urls; let i = index"
                          class="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                          (click)="abrirImagenModal(env.assetsUrl + imagen)">
                        <img [src]="env.assetsUrl + imagen"
                            [alt]="p.nombre"
                            class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                            (error)="onImageError($event)">
                        <!-- Overlay con gradiente más sutil -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <!-- Botón de zoom más elegante -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div class="bg-white/20 backdrop-blur-md rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        <!-- Número de imagen -->
                        <div class="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                          {{ i + 1 }}/{{ p.imagenes_galeria_urls.length }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Itinerario del Plan mejorado -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden" *ngIf="plan() as p">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 5a4 4 0 100 8m0 0v3m0-3h3m-3 0h-3" />
                      </svg>
                    </div>
                    Itinerario del Plan
                    <div class="ml-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                      {{ p.duracion_dias }} {{ p.duracion_dias === 1 ? 'Día' : 'Días' }}
                    </div>
                  </h3>
                </div>

                <div class="p-6">
                  <div class="space-y-6" *ngIf="p.dias && p.dias.length > 0">
                    <div *ngFor="let dia of p.dias; let i = index"
                        class="relative">

                      <!-- Timeline line - solo si no es el último elemento -->
                      <div *ngIf="i < p.dias.length - 1"
                          class="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600 z-0"></div>

                      <div class="relative z-10 flex gap-4">
                        <!-- Ícono del día con número -->
                        <div class="flex-shrink-0">
                          <div class="relative">
                            <!-- Círculo principal con gradiente -->
                            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300"
                                [ngClass]="{
                                  'bg-gradient-to-br from-blue-400 to-blue-600': i % 4 === 0,
                                  'bg-gradient-to-br from-emerald-400 to-emerald-600': i % 4 === 1,
                                  'bg-gradient-to-br from-amber-400 to-amber-600': i % 4 === 2,
                                  'bg-gradient-to-br from-purple-400 to-purple-600': i % 4 === 3
                                }">
                              <!-- Ícono según el tipo de día -->
                              <div class="text-center">
                                <svg *ngIf="i === 0" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-yellow-900 dark:text-yellow-100 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <svg *ngIf="i === 1" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-900 dark:text-orange-100 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                                <svg *ngIf="i === 2" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-amber-900 dark:text-yellow-100 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                <svg *ngIf="i >= 3" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-900 dark:text-purple-100 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>

                                
                              </div>
                            </div>

                            <!-- Número del día -->
                            <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center">
                              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ dia.numero_dia }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Contenido del día -->
                        <div class="flex-1 min-w-0">
                          <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300">

                            <!-- Header del día -->
                            <div class="flex items-start justify-between mb-4">
                              <div class="flex-1">
                                <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                  {{ dia.titulo }}
                                </h4>
                                <div class="flex items-center gap-2">
                                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 5a4 4 0 100 8m0 0v3m0-3h3m-3 0h-3" />
                                    </svg>
                                    Día {{ dia.numero_dia }}
                                  </span>
                                </div>
                              </div>

                              <!-- Horario destacado -->
                              <div *ngIf="dia.hora_inicio || dia.hora_fin"
                                  class="flex flex-col items-end gap-1 bg-white dark:bg-gray-700 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                                <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span class="text-xs font-medium uppercase tracking-wide">Horario</span>
                                </div>
                                <div class="text-lg font-bold text-gray-900 dark:text-white">
                                  <span *ngIf="dia.hora_inicio">{{ dia.hora_inicio }}</span>
                                  <span *ngIf="dia.hora_fin" class="text-gray-400 mx-1">-</span>
                                  <span *ngIf="dia.hora_fin">{{ dia.hora_fin }}</span>
                                </div>
                              </div>
                            </div>

                            <!-- Descripción -->
                            <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-base">
                              {{ dia.descripcion }}
                            </p>

                            <!-- Notas adicionales -->
                            <div *ngIf="dia.notas_adicionales"
                                class="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-xl">
                              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div class="flex-1">
                                <h5 class="font-semibold text-blue-800 dark:text-blue-300 mb-1 text-sm">Nota importante</h5>
                                <p class="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">{{ dia.notas_adicionales }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Estado vacío -->
                  <div *ngIf="!p.dias || p.dias.length === 0" class="text-center py-16">
                    <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 5a4 4 0 100 8m0 0v3m0-3h3m-3 0h-3" />
                      </svg>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Itinerario en preparación</h4>
                    <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      El itinerario detallado se proporcionará al confirmar la inscripción. Nuestro equipo está preparando una experiencia única para ti.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Qué incluye mejorado -->
              <div *ngIf="plan()!.que_incluye" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    ¿Qué incluye?
                  </h3>
                </div>
                <div class="p-6">
                  <div class="prose prose-gray dark:prose-invert max-w-none">
                    <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ plan()!.que_incluye }}</p>
                  </div>
                </div>
              </div>

              <!-- Requerimientos y qué llevar mejorados -->
              <div class="grid md:grid-cols-2 gap-6">
                <div *ngIf="plan()!.requerimientos" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div class="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800">
                    <h4 class="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Requerimientos
                    </h4>
                  </div>
                  <div class="p-4">
                    <p class="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{{ plan()!.requerimientos }}</p>
                  </div>
                </div>

                <div *ngIf="plan()!.que_llevar" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Qué llevar
                    </h4>
                  </div>
                  <div class="p-4">
                    <p class="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{{ plan()!.que_llevar }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna derecha - Sidebar (1/3) -->
            <div class="lg:col-span-1">
              <div class="sticky top-8 space-y-6">

                <!-- Card de Información del Plan -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <!-- Header con precio -->
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-100 dark:border-gray-700">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        S/ {{ plan()!.precio_total || 0 }}
                      </div>
                      <div class="text-sm text-blue-500 dark:text-blue-300">
                        Por persona
                      </div>
                    </div>
                  </div>

                  <!-- Detalles del plan -->
                  <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 5a4 4 0 100 8m0 0v3m0-3h3m-3 0h-3" />
                        </svg>
                        Duración
                      </span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ plan()!.duracion_dias }} {{ plan()!.duracion_dias === 1 ? 'Día' : 'Días' }}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Dificultad
                      </span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ getDificultadLabel(plan()!.dificultad!) }}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cupos
                      </span>
                      <span class="font-medium" [ngClass]="{
                        'text-green-600 dark:text-green-400': cuposDisponibles() > 0,
                        'text-red-600 dark:text-red-400': cuposDisponibles() === 0
                      }">
                        {{ cuposDisponibles() }} disponibles
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Formulario de Inscripción -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                  <!-- Estado sin cupos -->
                  <div *ngIf="plan()!.cupos_disponibles === 0" class="p-6">
                    <div class="text-center">
                      <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Sin cupos disponibles</h3>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">Este plan no tiene cupos disponibles en este momento.</p>
                    </div>
                  </div>

                  <!-- Usuario no logueado -->
                  <div *ngIf="plan()!.cupos_disponibles !== 0 && !isLoggedIn()" class="p-6">
                    <div class="text-center">
                      <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Reserva tu cupo</h3>
                      <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">Inicia sesión para inscribirte a este plan</p>

                      <div class="space-y-3">
                        <button
                          (click)="irALogin()"
                          class="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Iniciar Sesión
                        </button>
                        <button
                          (click)="irARegistro()"
                          class="w-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 py-3 px-4 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                        >
                          Crear Cuenta
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Formulario activo -->
                  <div *ngIf="plan()!.cupos_disponibles !== 0 && isLoggedIn()">
                    <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div class="text-lg font-semibold">Formulario de Inscripción</div>
                          <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">Completa los datos para reservar tu cupo</div>
                        </div>
                      </h3>
                    </div>

                    <form [formGroup]="inscripcionForm" (ngSubmit)="onSubmitInscripcion()" class="p-6 space-y-6">

                      <!-- Número de participantes -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Número de Participantes
                        </label>

                        <div class="space-y-6">
                          <div class="relative">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent h-px top-1/2"></div>
                            <div class="relative bg-white dark:bg-gray-800 px-6 py-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">

                              <div class="text-center mb-8">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Selecciona participantes</h4>
                                <div class="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
                              </div>

                              <div class="flex items-center justify-center space-x-8">
                                <button type="button"
                                        (click)="decrementarParticipantes()"
                                        [disabled]="inscripcionForm.get('numero_participantes')?.value <= 1"
                                        class="group p-4 rounded-2xl border-2 border-dashed transition-all duration-300"
                                        [ngClass]="{
                                          'border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20': inscripcionForm.get('numero_participantes')?.value > 1,
                                          'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed': inscripcionForm.get('numero_participantes')?.value <= 1
                                        }">
                                  <svg class="w-7 h-7 transition-colors duration-300"
                                      [ngClass]="{
                                        'text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400': inscripcionForm.get('numero_participantes')?.value > 1,
                                        'text-gray-300 dark:text-gray-600': inscripcionForm.get('numero_participantes')?.value <= 1
                                      }"
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" />
                                  </svg>
                                </button>

                                <div class="relative">
                                  <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                                    <span class="text-3xl font-bold text-blue-700 dark:text-blue-300">{{ inscripcionForm.get('numero_participantes')?.value }}</span>
                                  </div>
                                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                                    {{ inscripcionForm.get('numero_participantes')?.value === 1 ? 'Persona' : 'Personas' }}
                                  </div>
                                </div>

                                <button type="button"
                                        (click)="incrementarParticipantes()"
                                        [disabled]="inscripcionForm.get('numero_participantes')?.value >= cuposDisponibles()"
                                        class="group p-4 rounded-2xl border-2 border-dashed transition-all duration-300"
                                        [ngClass]="{
                                          'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20': inscripcionForm.get('numero_participantes')?.value < cuposDisponibles(),
                                          'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed': inscripcionForm.get('numero_participantes')?.value >= cuposDisponibles()
                                        }">
                                  <svg class="w-7 h-7 transition-colors duration-300"
                                      [ngClass]="{
                                        'text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400': inscripcionForm.get('numero_participantes')?.value < cuposDisponibles(),
                                        'text-gray-300 dark:text-gray-600': inscripcionForm.get('numero_participantes')?.value >= cuposDisponibles()
                                      }"
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                      <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div class="flex items-center gap-1">
                          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span class="font-medium">{{ plan()!.cupos_disponibles || 0 }} cupos restantes</span>
                        </div>
                      </div>
                    </div>

                        <!-- Input oculto para el formulario -->
                        <input type="hidden" formControlName="numero_participantes">
                      </div>

                      <!-- Total calculado -->
                      <div *ngIf="totalCalculado() > 0" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
                        <div class="text-sm text-green-600 dark:text-green-400 mb-1">Total a pagar</div>
                        <div class="text-2xl font-bold text-green-700 dark:text-green-300">
                          S/ {{ totalCalculado() }}
                        </div>
                        <div class="text-xs text-green-600 dark:text-green-400 mt-1">
                          {{ inscripcionForm.get('numero_participantes')?.value }} × S/ {{ plan()!.precio_total || 0 }}
                        </div>
                      </div>

                      <!-- Método de pago -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Método de pago
                        </label>
                        <select formControlName="metodo_pago"
                                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300">
                          <option value="efectivo">💵 Efectivo</option>
                          <option value="transferencia">🏦 Transferencia</option>
                          <option value="yape">📱 Yape</option>
                          <option value="plin">💳 Plin</option>
                        </select>
                      </div>

                      <!-- Requerimientos especiales -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Requerimientos especiales
                        </label>
                        <textarea formControlName="requerimientos_especiales"
                                  rows="3"
                                  placeholder="Alergias, necesidades médicas, etc."
                                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 resize-none"></textarea>
                      </div>

                      <!-- Comentarios adicionales -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Comentarios adicionales
                        </label>
                        <textarea formControlName="comentarios_adicionales"
                                  rows="3"
                                  placeholder="Cualquier comentario o solicitud..."
                                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 resize-none"></textarea>
                      </div>

                      <!-- Botones -->
                      <div class="space-y-3 pt-4">
                        <button type="submit"
                                [disabled]="!inscripcionForm.valid || enviandoInscripcion()"
                                class="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                          <svg *ngIf="!enviandoInscripcion()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <div *ngIf="enviandoInscripcion()" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {{ enviandoInscripcion() ? 'Inscribiendo...' : 'Inscribirse Ahora' }}
                        </button>

                        <button type="button"
                                (click)="volverALista()"
                                class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Volver a Planes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Información del Organizador -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Organizador Principal
                    </h3>
                  </div>

                  <div class="p-6">
                    <div class="flex items-start gap-4">
                      <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 dark:text-white">Casa Hospedaje Samary</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Comunidad limitante a 1000 metros de altura principal
                        </p>
                        <div class="flex items-center gap-4 mt-3 text-sm">
                          <a href="tel:+51942753533" class="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            942 753 533
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <div class="lg:col-span-1">
              <!-- Aquí irá el formulario mejorado en el siguiente paso -->
            </div>
          </div>
        </div>
          </div>


      <!-- Modal de imagen (opcional) -->
      <div *ngIf="imagenModalAbierta()"
           class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
           (click)="cerrarImagenModal()">
        <div class="relative max-w-4xl max-h-full p-4">
          <img [src]="imagenModalSrc()"
               [alt]="plan()?.nombre"
               class="max-w-full max-h-full object-contain rounded-lg">
          <button (click)="cerrarImagenModal()"
                  class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal de éxito -->
      <div *ngIf="mostrarExito()"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 transition-colors duration-300">
          <div class="text-center">
            <div class="mb-4">
              <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Inscripción Exitosa!</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Tu inscripción ha sido enviada. El organizador revisará tu solicitud y te contactará pronto.
            </p>
            <div class="space-y-3">
              <button
                (click)="irAMisInscripciones()"
                class="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300">
                Ver Mis Inscripciones
              </button>
              <button
                (click)="cerrarModalExito()"
                class="w-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-300">
                Continuar Navegando
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class PlanesDetalleComponent implements OnInit {
  env = environment;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planesService = inject(PlanesService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  // Signals
  loading = signal<boolean>(false);
  error = signal<string>('');
  plan = signal<Plan | null>(null);
  enviandoInscripcion = signal<boolean>(false);
  mostrarExito = signal<boolean>(false);
  imagenModalAbierta = signal<boolean>(false);
  imagenModalSrc = signal<string>('');

  // Computed
  totalCalculado(): number {
    const participantes = this.inscripcionForm.get('numero_participantes')?.value || 0;
    const precioPorPersona = this.plan()?.precio_total || 0;
    return participantes * precioPorPersona;
  }

  // Form
  inscripcionForm: FormGroup;

  constructor() {
    this.inscripcionForm = this.fb.group({
      numero_participantes: [1, [Validators.required, Validators.min(1)]],
      metodo_pago: ['efectivo', Validators.required],
      requerimientos_especiales: [''],
      comentarios_adicionales: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const planId = +params['id'];
      if (planId) {
        this.cargarPlan(planId);
      }
    });
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  cuposDisponibles = computed(() => {
    return this.plan()?.cupos_disponibles || 0;
  });

  cargarPlan(id?: number) {
    const planId = id || +this.route.snapshot.params['id'];

    this.loading.set(true);
    this.error.set('');

    this.planesService.getPlanPublico(planId).subscribe({
      next: (plan) => {
        this.plan.set(plan);
        this.loading.set(false);

        // Actualizar validadores basados en cupos disponibles
        if (plan.cupos_disponibles !== undefined) {
          this.inscripcionForm.get('numero_participantes')?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(plan.cupos_disponibles)
          ]);
          this.inscripcionForm.get('numero_participantes')?.updateValueAndValidity();
        }
      },
      error: (err) => {
        this.error.set('No se pudo cargar la información del plan. Verifica que el plan existe y está disponible.');
        this.loading.set(false);
        console.error('Error al cargar plan:', err);
      }
    });
  }

  // Método onSubmitInscripcion() ACTUALIZADO con mejor manejo de errores
    onSubmitInscripcion() {
    if (!this.inscripcionForm.valid || !this.plan() || !this.isLoggedIn()) {
        return;
    }

    this.enviandoInscripcion.set(true);

    const inscripcionData = {
        plan_id: this.plan()!.id!,
        numero_participantes: this.inscripcionForm.get('numero_participantes')?.value,
        metodo_pago: this.inscripcionForm.get('metodo_pago')?.value,
        requerimientos_especiales: this.inscripcionForm.get('requerimientos_especiales')?.value,
        comentarios_adicionales: this.inscripcionForm.get('comentarios_adicionales')?.value
    };

    this.planesService.inscribirseAPlan(inscripcionData).subscribe({
        next: (inscripcion) => {
        this.enviandoInscripcion.set(false);
        this.mostrarExito.set(true);
        this.inscripcionForm.reset({
            numero_participantes: 1,
            metodo_pago: 'efectivo',
            requerimientos_especiales: '',
            comentarios_adicionales: ''
        });

        // Recargar el plan para actualizar cupos disponibles
        this.cargarPlan();
        },
        error: (err) => {
        this.enviandoInscripcion.set(false);
        console.error('Error al inscribirse:', err);

        let errorMessage = 'Error al procesar la inscripción. Inténtalo nuevamente.';

        // Verificar si hay errores específicos de validación
        if (err.error && err.error.errors) {
            // Obtener el primer error específico de los campos
            const fieldErrors = err.error.errors;
            const firstFieldWithError = Object.keys(fieldErrors)[0];

            if (firstFieldWithError && fieldErrors[firstFieldWithError]) {
            // Mostrar el primer error del primer campo con errores
            errorMessage = Array.isArray(fieldErrors[firstFieldWithError])
                ? fieldErrors[firstFieldWithError][0]
                : fieldErrors[firstFieldWithError];
            }
        } else if (err.error?.message) {
            // Si no hay errores de campo pero hay un mensaje general
            errorMessage = err.error.message;
        }

        alert(errorMessage); // Podrías usar un toast o modal más elegante
        }
    });
    }

  incrementParticipantes() {
    const current = this.inscripcionForm.get('numero_participantes')?.value || 1;
    const max = this.plan()?.cupos_disponibles || 1;

    if (current < max) {
      this.inscripcionForm.patchValue({
        numero_participantes: current + 1
      });
    }
  }

  decrementParticipantes() {
    const current = this.inscripcionForm.get('numero_participantes')?.value || 1;

    if (current > 1) {
      this.inscripcionForm.patchValue({
        numero_participantes: current - 1
      });
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  irALogin() {
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: {
        redirect: currentUrl,
        action: 'inscripcion',
        planId: this.plan()?.id
      }
    });
  }

  incrementarParticipantes(): void {
    const currentValue = this.inscripcionForm.get('numero_participantes')?.value || 1;
    const maxCupos = this.cuposDisponibles();

    if (currentValue < maxCupos) {
      this.inscripcionForm.patchValue({
        numero_participantes: currentValue + 1
      });
    }
  }

  decrementarParticipantes(): void {
    const currentValue = this.inscripcionForm.get('numero_participantes')?.value || 1;

    if (currentValue > 1) {
      this.inscripcionForm.patchValue({
        numero_participantes: currentValue - 1
      });
    }
  }


  irARegistro() {
    const currentUrl = this.router.url;
    this.router.navigate(['/register'], {
      queryParams: {
        redirect: currentUrl,
        action: 'inscripcion',
        planId: this.plan()?.id
      }
    });
  }

  volverALista() {
    this.router.navigate(['/planes']);
  }

  irAMisInscripciones() {
    this.mostrarExito.set(false);
    this.router.navigate(['/dashboard/inscripciones']); // Ajustar según tu estructura de rutas
  }

  cerrarModalExito() {
    this.mostrarExito.set(false);
  }

  abrirImagenModal(imagenUrl: string) {
    this.imagenModalSrc.set(imagenUrl);
    this.imagenModalAbierta.set(true);
  }

  cerrarImagenModal() {
    this.imagenModalAbierta.set(false);
    this.imagenModalSrc.set('');
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/default-plan.jpg';
  }

  getDificultadLabel(dificultad: string): string {
    const labels: {[key: string]: string} = {
      'facil': 'Fácil',
      'moderado': 'Moderado',
      'dificil': 'Difícil'
    };
    return labels[dificultad] || dificultad;
  }
}