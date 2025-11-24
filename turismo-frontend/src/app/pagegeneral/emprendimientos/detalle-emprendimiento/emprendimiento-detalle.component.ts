import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EmprendimientosService } from '../emprendimientos.service';
import { Emprendimiento, ServicioEmprendimiento } from '../emprendimiento.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-emprendimiento-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Loading State -->
      <div *ngIf="cargando()" class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 dark:border-blue-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando emprendimiento...</p>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div *ngIf="!cargando() && emprendimiento()" class="pb-12">
        <!-- Hero Section con Galería -->
        <section class="relative">
          <!-- Imagen Principal -->
          <div class="relative h-96 md:h-[500px] overflow-hidden">
            <img
              [src]="imagenPrincipalActual()"
              [alt]="emprendimiento()!.nombre"
              class="w-full h-full object-cover"
              onerror="this.src='/assets/general/placeholder-business.jpg'"
            >

            <!-- Gradiente para mejorar legibilidad del texto -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            <!-- Navegación de imágenes -->
            <div *ngIf="todasLasImagenes().length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-10">
              <button
                (click)="imagenAnterior()"
                class="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                (click)="imagenSiguiente()"
                class="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            <!-- Indicadores de imagen -->
            <div *ngIf="todasLasImagenes().length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div class="flex space-x-2">
                <button
                  *ngFor="let imagen of todasLasImagenes(); let i = index"
                  (click)="seleccionarImagen(i)"
                  [class]="i === indiceImagenActual() ? 'bg-white' : 'bg-white/50'"
                  class="w-3 h-3 rounded-full transition-colors duration-200">
                </button>
              </div>
            </div>

            <!-- Nombre del emprendimiento centrado en la imagen -->
            <div class="absolute inset-0 flex items-center justify-center z-15">
              <div class="text-center">
                <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl mb-4 px-4">
                  {{ emprendimiento()!.nombre }}
                </h1>
                <p class="text-lg md:text-xl text-white/90 drop-shadow-lg font-medium">
                  Un viaje auténtico hacia nuestras raíces
                </p>
              </div>
            </div>
            <!-- Botón de regreso -->
            <button
              (click)="volver()"
              class="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 z-30"
              title="Volver"
              aria-label="Volver a la página anterior">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
          </div>
        </section>

        <!-- Contenido -->
        <div class="container mx-auto px-4 mt-8 relative z-10" style="margin-top: 2rem;">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Información Principal -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Descripción -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Acerca de este emprendimiento</h2>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ emprendimiento()!.descripcion }}</p>

                <!-- Certificaciones -->
                <div *ngIf="emprendimiento()!.certificaciones" class="mt-4">
                  <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Certificaciones</h3>
                  <div class="bg-orange-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span class="text-orange-700 dark:text-blue-300">{{ emprendimiento()!.certificaciones }}</span>
                  </div>
                </div>
              </div>

              <!-- Servicios -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  Servicios Disponibles
                  <span class="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({{ emprendimiento()!.servicios?.length || 0 }})
                  </span>
                </h2>

                <div *ngIf="emprendimiento()!.servicios && emprendimiento()!.servicios!.length > 0; else noServicios"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div *ngFor="let servicio of emprendimiento()!.servicios"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    (click)="verServicio(servicio.id)">
                    <!-- Imagen del servicio -->
                    <img *ngIf="servicio.sliders && servicio.sliders.length > 0"
                        [src]="servicio.sliders[0].url_completa"
                        [alt]="servicio.nombre"
                        class="w-full h-32 object-cover rounded-md mb-3"
                        onerror="this.src='/assets/general/placeholder-service.jpg'" />

                          <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">{{ servicio.nombre }}</h3>
                          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ servicio.descripcion }}</p>

                          <div class="flex justify-between items-center">
                            <span class="text-orange-600 dark:text-blue-400 font-bold">
                              S/. {{ servicio.precio_referencial }}
                            </span>
                            <span class="text-xs text-gray-500 dark:text-gray-500">
                              {{ servicio.categorias?.[0]?.nombre || 'Servicio' }}
                            </span>
                          </div>
                    <!-- Horarios del servicio -->
                    <div *ngIf="servicio.horarios && servicio.horarios.length > 0" class="mt-2">
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let horario of obtenerHorariosUnicos(servicio.horarios).slice(0, 3)"
                              class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                          {{ formatearDia(horario.dia_semana) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #noServicios>
                  <div class="text-center py-8">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-500">No hay servicios disponibles en este momento</p>
                  </div>
                </ng-template>
              </div>

<!-- Galería Secundaria - Con tamaños fijos -->
<div *ngIf="emprendimiento()!.sliders_secundarios && emprendimiento()!.sliders_secundarios.length > 0"
    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Galería</h2>

  <!-- Grid con tamaños consistentes -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div *ngFor="let slider of emprendimiento()!.sliders_secundarios"
         class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
         (click)="abrirImagenModal(slider)">

      <!-- Contenedor de imagen con tamaño fijo -->
      <div class="relative overflow-hidden group">
        <!-- Imagen con dimensiones fijas y consistentes -->
        <img
          [src]="slider.url_completa"
          [alt]="slider.nombre"
          class="w-full h-64 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          onerror="this.src='/assets/general/placeholder-gallery.jpg'"
        >

        <!-- Overlay con ícono de ampliación -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
          </svg>
        </div>
      </div>

      <!-- Texto debajo de la imagen con altura mínima -->
      <div *ngIf="slider.descripcion" class="p-4 min-h-[120px] flex flex-col justify-between">
        <div>
          <h5 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2"
             style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            {{ slider.descripcion.titulo }}
          </h5>
          <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3"
             style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            {{ slider.descripcion.descripcion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal de Imagen con tamaño controlado -->
<div *ngIf="imagenModal()"
     class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
     (click)="cerrarImagenModal()">

  <!-- Contenedor del modal con tamaño máximo controlado -->
  <div class="relative w-full max-w-5xl max-h-full flex items-center justify-center"
       (click)="$event.stopPropagation()">

    <!-- Contenedor de imagen SIN fondo blanco -->
    <div class="relative w-[600px] h-[400px]">
      <!-- Botón cerrar DENTRO del contenedor de la imagen -->
      <button (click)="cerrarImagenModal()"
              class="absolute top-2 right-2 z-20 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Imagen principal con tamaño FIJO mediano -->
      <img [src]="imagenModal()!.url_completa"
           [alt]="imagenModal()!.nombre"
           class="w-full h-full object-cover rounded-lg shadow-2xl">

      <!-- Información de la imagen - DENTRO del contenedor de la imagen -->
      <div *ngIf="imagenModal()!.descripcion"
           class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent text-white p-4 rounded-b-lg">
        <h3 class="text-xl font-bold mb-2 line-clamp-2">{{ imagenModal()!.descripcion.titulo }}</h3>
        <p class="text-gray-200 text-sm line-clamp-3">{{ imagenModal()!.descripcion.descripcion }}</p>
      </div>
    </div>
  </div>
</div>            </div>

            <!-- Información de Contacto y Detalles -->
            <div class="space-y-14">

              <!-- Información de Contacto -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Información de Contacto</h2>

                <div class="space-y-3">
                  <!-- Teléfono -->
                  <div class="flex items-center">
                    <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <a [href]="'tel:' + emprendimiento()!.telefono"
                       class="text-orange-600 dark:text-blue-400 hover:underline">
                      {{ emprendimiento()!.telefono }}
                    </a>
                  </div>

                  <!-- Email -->
                  <div class="flex items-center">
                    <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <a [href]="'mailto:' + emprendimiento()!.email"
                       class="text-orange-600 dark:text-blue-400 hover:underline">
                      {{ emprendimiento()!.email }}
                    </a>
                  </div>

                  <!-- Página Web -->
                  <div *ngIf="emprendimiento()!.pagina_web" class="flex items-center">
                    <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                    </svg>
                    <a [href]="emprendimiento()!.pagina_web" target="_blank"
                       class="text-orange-600 dark:text-blue-400 hover:underline">
                      Visitar sitio web
                    </a>
                  </div>

                  <!-- Ubicación -->
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    <span class="text-gray-600 dark:text-gray-400">{{ emprendimiento()!.ubicacion }}</span>
                  </div>
                </div>

                <!-- Horario de Atención -->
                <div *ngIf="emprendimiento()!.horario_atencion" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Horario de Atención</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ emprendimiento()!.horario_atencion }}</p>
                </div>
              </div>

              <!-- Detalles del Negocio -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Detalles del Negocio</h2>

                <div class="space-y-4">
                  <!-- Capacidad -->
                  <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">Capacidad máxima</span>
                    <span class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimiento()!.capacidad_aforo }} personas</span>
                  </div>

                  <!-- Personal -->
                  <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">Personal que atiende</span>
                    <span class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimiento()!.numero_personas_atiende }} personas</span>
                  </div>

                  <!-- Accesibilidad -->
                  <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">Accesible para discapacidad</span>
                    <span [class]="emprendimiento()!.facilidades_discapacidad ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                          class="font-semibold">
                      {{ emprendimiento()!.facilidades_discapacidad ? 'Sí' : 'No' }}
                    </span>
                  </div>

                  <!-- Opciones de Acceso -->
                  <div *ngIf="emprendimiento()!.opciones_acceso" class="py-2">
                    <span class="text-gray-600 dark:text-gray-400 block mb-1">Opciones de acceso</span>
                    <span class="text-gray-800 dark:text-gray-200">{{ emprendimiento()!.opciones_acceso }}</span>
                  </div>
                </div>
              </div>

              <!-- Métodos de Pago -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Métodos de Pago</h2>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let metodo of procesarMetodosPago()"
                        class="inline-block bg-orange-100 dark:bg-blue-900 text-orange-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {{ metodo }}
                  </span>
                </div>
              </div>

              <!-- Idiomas -->
              <div *ngIf="emprendimiento()!.idiomas_hablados && emprendimiento()!.idiomas_hablados.length > 0"
                   class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Idiomas</h2>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let idioma of procesarIdiomasHablados()"
                        class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {{ idioma }}
                  </span>
                </div>
              </div>

              <!-- Asociación -->
              <div *ngIf="emprendimiento()!.asociacion" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Asociación</h2>
                <div class="flex items-center space-x-4">
                  <img *ngIf="emprendimiento()!.asociacion!.imagen_url"
                       [src]="emprendimiento()!.asociacion!.imagen_url"
                       [alt]="emprendimiento()!.asociacion!.nombre"
                       class="w-16 h-16 rounded-full object-cover"
                       onerror="this.src='/assets/general/placeholder-association.jpg'">
                  <div>
                    <h3 class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimiento()!.asociacion!.nombre }}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">{{ emprendimiento()!.asociacion!.descripcion }}</p>
                    <div class="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-500">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      {{ emprendimiento()!.asociacion!.telefono }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reseñas -->
              <div *ngIf="emprendimiento()!.comentarios_resenas" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Reseñas de Visitantes</h2>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-orange-500 dark:bg-blue-500 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-grow">
                      <p class="text-gray-600 dark:text-gray-400 italic">"{{ emprendimiento()!.comentarios_resenas }}"</p>
                      <div class="flex items-center mt-2">
                        <div class="flex text-yellow-400">
                          <svg *ngFor="let star of [1,2,3,4,5]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-500 ml-2">Visitante verificado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="space-y-3">
                <a
                  [href]="'mailto:' + emprendimiento()!.email"
                  class="w-full bg-orange-500 hover:bg-orange-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Enviar Email
                </a>


                <a
                  [href]="'mailto:' + emprendimiento()!.email"
                  class="w-full bg-orange-500 hover:bg-orange-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Enviar Email
                </a>

                <button
                  (click)="compartir()"
                  class="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                  </svg>
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!cargando() && !emprendimiento()" class="flex justify-center items-center min-h-screen">
        <div class="text-center">
          <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Emprendimiento no encontrado</h2>
          <p class="text-gray-500 dark:text-gray-500 mb-4">El emprendimiento que buscas no existe o ha sido eliminado.</p>
          <button
            (click)="volver()"
            class="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-lg transition-colors duration-200">
            Volver a Emprendimientos
          </button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* Transiciones suaves para la galería */
    .transition-opacity {
      transition: opacity 0.3s ease-in-out;
    }

    /* Estilos para los botones de navegación de imágenes */
    .transition-colors {
      transition: background-color 0.2s ease-in-out;
    }

    /* Animación para las cards de servicios */
    .transition-shadow {
      transition: box-shadow 0.2s ease-in-out;
    }
  `]
})
export class EmprendimientoDetalleComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  // Signals existentes
  emprendimiento = signal<Emprendimiento | null>(null);
  cargando = signal<boolean>(false);
  indiceImagenActual = signal<number>(0);

  // Nuevos signals para el modal de galería
  imagenModal = signal<any>(null);
  indiceModalActual = signal<number>(0);

  calificacionPromedio = computed(() => {
    const emp = this.emprendimiento();
    if (!emp) return 0;
    return this.emprendimientosService.calcularCalificacionPromedio(emp);
  });

  // Computed existentes
  todasLasImagenes = computed(() => {
    const emp = this.emprendimiento();
    if (!emp) return [];

    const imagenes: string[] = [];

    // Agregar imágenes principales
    if (emp.sliders_principales) {
      imagenes.push(...emp.sliders_principales.map(slider => slider.url_completa));
    }

    // Agregar imágenes secundarias
    if (emp.sliders_secundarios) {
      imagenes.push(...emp.sliders_secundarios.map(slider => slider.url_completa));
    }

    return imagenes.length > 0 ? imagenes : ['/assets/general/placeholder-business.jpg'];
  });

  // Nuevo computed para las imágenes de la galería secundaria
  imagenesGaleriaSecundaria = computed(() => {
    const emp = this.emprendimiento();
    if (!emp || !emp.sliders_secundarios) return [];
    return emp.sliders_secundarios;
  });

  imagenPrincipalActual = computed(() => {
    const imagenes = this.todasLasImagenes();
    const indice = this.indiceImagenActual();
    return imagenes[indice] || '/assets/general/placeholder-business.jpg';
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarEmprendimiento(id);
      }
    });
  }

  private async cargarEmprendimiento(id: number) {
    this.cargando.set(true);

    try {
      const emprendimiento = await this.emprendimientosService.getEmprendimiento(id).toPromise();
      if (emprendimiento) {
        this.emprendimiento.set(emprendimiento);
      }
    } catch (error) {
      console.error('Error al cargar emprendimiento:', error);
      this.emprendimiento.set(null);
    } finally {
      this.cargando.set(false);
    }
  }

  // Navegación de imágenes principales (existente)
  imagenSiguiente() {
    const totalImagenes = this.todasLasImagenes().length;
    const indiceActual = this.indiceImagenActual();
    this.indiceImagenActual.set((indiceActual + 1) % totalImagenes);
  }

  imagenAnterior() {
    const totalImagenes = this.todasLasImagenes().length;
    const indiceActual = this.indiceImagenActual();
    this.indiceImagenActual.set((indiceActual - 1 + totalImagenes) % totalImagenes);
  }

  seleccionarImagen(indice: number) {
    this.indiceImagenActual.set(indice);
  }

  // NUEVOS MÉTODOS PARA EL MODAL DE GALERÍA
  abrirImagenModal(slider: any) {
    this.imagenModal.set(slider);
    const imagenesGaleria = this.imagenesGaleriaSecundaria();
    this.indiceModalActual.set(imagenesGaleria.findIndex(s => s === slider));
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  }

  cerrarImagenModal() {
    this.imagenModal.set(null);
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  imagenModalAnterior() {
    const imagenesGaleria = this.imagenesGaleriaSecundaria();
    if (imagenesGaleria && imagenesGaleria.length > 0) {
      const indiceActual = this.indiceModalActual();
      const nuevoIndice = indiceActual > 0 ? indiceActual - 1 : imagenesGaleria.length - 1;
      this.indiceModalActual.set(nuevoIndice);
      this.imagenModal.set(imagenesGaleria[nuevoIndice]);
    }
  }

  imagenModalSiguiente() {
    const imagenesGaleria = this.imagenesGaleriaSecundaria();
    if (imagenesGaleria && imagenesGaleria.length > 0) {
      const indiceActual = this.indiceModalActual();
      const nuevoIndice = indiceActual < imagenesGaleria.length - 1 ? indiceActual + 1 : 0;
      this.indiceModalActual.set(nuevoIndice);
      this.imagenModal.set(imagenesGaleria[nuevoIndice]);
    }
  }

  // Listener para cerrar modal con tecla Escape
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.imagenModal()) {
      this.cerrarImagenModal();
    }
  }

  // Listener para navegación con teclado en el modal
  @HostListener('document:keydown.arrowLeft', ['$event'])
  onArrowLeft(event: KeyboardEvent) {
    if (this.imagenModal()) {
      event.preventDefault();
      this.imagenModalAnterior();
    }
  }

  @HostListener('document:keydown.arrowRight', ['$event'])
  onArrowRight(event: KeyboardEvent) {
    if (this.imagenModal()) {
      event.preventDefault();
      this.imagenModalSiguiente();
    }
  }

  // Navegación existente
  volver() {
    this.router.navigate(['/emprendimientos']);
  }

  verServicio(servicioId: number) {
    this.router.navigate(['/servicios', servicioId]);
  }

  // Métodos utilitarios existentes
  procesarMetodosPago(): string[] {
    const emp = this.emprendimiento();
    if (!emp) return [];
    return this.emprendimientosService.procesarMetodosPago(emp.metodos_pago);
  }

  procesarIdiomasHablados(): string[] {
    const emp = this.emprendimiento();
    if (!emp) return [];
    return this.emprendimientosService.procesarIdiomasHablados(emp.idiomas_hablados);
  }

  calcularCalificacionPromedio(): number {
    const emp = this.emprendimiento();
    if (!emp) return 0;
    return this.emprendimientosService.calcularCalificacionPromedio(emp);
  }

  estaAbierto(): boolean {
    const emp = this.emprendimiento();
    if (!emp) return false;
    return this.emprendimientosService.estaAbierto(emp.horario_atencion || '');
  }

  obtenerHorariosUnicos(horarios: any[]): any[] {
    const diasUnicos = new Set();
    return horarios.filter(horario => {
      if (horario.activo && !diasUnicos.has(horario.dia_semana)) {
        diasUnicos.add(horario.dia_semana);
        return true;
      }
      return false;
    });
  }

  formatearDia(dia: string): string {
    const dias: {[key: string]: string} = {
      'lunes': 'Lun',
      'martes': 'Mar',
      'miercoles': 'Mié',
      'jueves': 'Jue',
      'viernes': 'Vie',
      'sabado': 'Sáb',
      'domingo': 'Dom'
    };
    return dias[dia.toLowerCase()] || dia;
  }

  compartir() {
    if (navigator.share) {
      navigator.share({
        title: this.emprendimiento()?.nombre,
        text: this.emprendimiento()?.descripcion,
        url: window.location.href
      });
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      // Aquí podrías mostrar un toast de confirmación
      alert('URL copiada al portapapeles');
    }
  }
}
