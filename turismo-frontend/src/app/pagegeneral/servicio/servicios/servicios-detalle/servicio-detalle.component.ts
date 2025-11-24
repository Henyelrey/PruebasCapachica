import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService } from '../../../../core/services/turismo.service';
import { UbicacionMapComponent } from '../../../../shared/components/ubicacion-map/ubicacion-map.component';
import { ServicioDetalle } from '../servicios.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CarritoService, CarritoItem } from '../../../../core/services/carrito.service';

@Component({
  selector: 'app-servicio-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UbicacionMapComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">

      <!-- Loading State -->
      <div *ngIf="cargando()" class="container mx-auto px-4 py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando servicio...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="container mx-auto px-4 py-20">
        <div class="text-center">
          <svg class="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-9-5.5a9 9 0 1118 0"></path>
          </svg>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Servicio no encontrado</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">El servicio que buscas no existe o ha sido eliminado.</p>
          <button
            (click)="volverAServicios()"
            class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Volver a Servicios
          </button>
        </div>
      </div>

      <!-- Contenido del Servicio -->
      <div *ngIf="!cargando() && !error() && servicio()" class="container mx-auto px-4 py-8">

        <!-- Breadcrumb -->
        <nav class="flex mb-8" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
             <!-- <a routerLink="/home" class="inline-flex items-center text-gray-700 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Inicio
              </a>  -->
            </li>
           <!-- <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <a routerLink="/servicios" class="ml-1 text-gray-700 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 md:ml-2">Servicios</a>
              </div>
            </li> -->
            <!--  <li aria-current="page">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-gray-500 md:ml-2 dark:text-gray-400">{{ servicio()?.nombre }}</span>
              </div>
            </li> -->
          </ol>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Contenido Principal -->
          <div class="lg:col-span-2">

            <!-- Galería de Imágenes -->
            <div class="mt-8">
              <div class="relative h-96 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  [src]="imagenActual"
                  [alt]="servicio()?.nombre"
                  class="w-full h-full object-cover "
                  onerror="this.src='/assets/general/placeholder-service.jpg'"
                >

                <!-- Navegación de galería -->
                <div *ngIf="servicio()?.sliders && servicio()!.sliders!.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div class="flex space-x-2 bg-black/50 rounded-full px-3 py-2">
                    <button
                      *ngFor="let slider of servicio()?.sliders; let i = index"
                      (click)="cambiarImagen(i)"
                      [class]="imagenIndex() === i ? 'bg-white' : 'bg-white/50'"
                      class="w-3 h-3 rounded-full transition-all duration-200"
                    ></button>
                  </div>
                </div>

                <!-- Botones de navegación -->
                <button
                  *ngIf="servicio()?.sliders && servicio()!.sliders!.length > 1"
                  (click)="imagenAnterior()"
                  class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>

                <button
                  *ngIf="servicio()?.sliders && servicio()!.sliders!.length > 1"
                  (click)="imagenSiguiente()"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Información del Servicio -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div class="mb-4 md:mb-0">
                  <div class="flex items-center mb-2">
                    <span *ngIf="servicio()?.categorias?.[0]"
                          class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      {{ servicio()?.categorias?.[0]?.nombre }}
                    </span>
                    <span *ngIf="servicio()?.estado"
                          class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      Disponible
                    </span>
                  </div>
                  <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {{ servicio()?.nombre }}
                  </h1>
                </div>

                <div *ngIf="servicio()?.precio_referencial" class="text-right">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Precio referencial</p>
                  <p class="text-3xl md:text-4xl font-bold text-amber-600">
                    S/. {{ servicio()?.precio_referencial }}
                  </p>
                </div>
              </div>

              <p *ngIf="servicio()?.descripcion" class="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                {{ servicio()?.descripcion }}
              </p>

              <!-- Información adicional -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="servicio()?.capacidad">
                  <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Capacidad
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ servicio()?.capacidad }} personas</p>
                </div>

                <div *ngIf="servicio()?.ubicacion_referencia">
                  <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    Ubicación
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ servicio()?.ubicacion_referencia }}</p>
                </div>
              </div>
            </div>

            <!-- Horarios de Disponibilidad -->
            <div *ngIf="servicio()?.horarios && servicio()!.horarios!.length > 0"
                 class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Horarios de Disponibilidad
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let horario of obtenerHorariosAgrupados()"
                     [class]="horario.activo ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'"
                     class="border rounded-lg p-4">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                      {{ formatearDiaCompleto(horario.dia_semana) }}
                    </h3>
                    <span [class]="horario.activo ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'"
                          class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ horario.activo ? 'Disponible' : 'No disponible' }}
                    </span>
                  </div>
                  <p *ngIf="horario.activo" class="text-gray-600 dark:text-gray-400 mt-2">
                    {{ formatearHora(horario.hora_inicio) }} - {{ formatearHora(horario.hora_fin) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Verificador de Disponibilidad -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Verificar Disponibilidad
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="fechaConsulta"
                    [min]="fechaMinima"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de inicio
                  </label>
                  <input
                    type="time"
                    [(ngModel)]="horaInicio"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    [(ngModel)]="horaFin"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                </div>
              </div>

              <button
                (click)="verificarDisponibilidad()"
                [disabled]="!fechaConsulta || !horaInicio || !horaFin || verificandoDisponibilidad()"
                class="w-full md:w-auto bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition-colors duration-200 font-medium"
              >
                <span *ngIf="!verificandoDisponibilidad()">Verificar Disponibilidad</span>
                <span *ngIf="verificandoDisponibilidad()" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              </button>

              <!-- Resultado de disponibilidad -->
              <div *ngIf="resultadoDisponibilidad !== null" class="mt-4 p-4 rounded-lg"
                   [class]="resultadoDisponibilidad ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
                <div class="flex items-center">
                  <svg *ngIf="resultadoDisponibilidad" class="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg *ngIf="!resultadoDisponibilidad" class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span [class]="resultadoDisponibilidad ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'"
                        class="font-medium">
                    {{ resultadoDisponibilidad ? '¡Servicio disponible!' : 'Servicio no disponible' }}
                  </span>
                </div>
                <p [class]="resultadoDisponibilidad ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'"
                   class="mt-1 text-sm">
                  {{ resultadoDisponibilidad ? 'Puedes agregar este servicio a tu carrito para la fecha y horario seleccionados.' : 'El servicio no está disponible en la fecha y horario seleccionados. Intenta con otro horario.' }}
                </p>
              </div>
            </div>

            <!-- Mapa de Ubicación -->
            <div *ngIf="servicio()?.latitud && servicio()?.longitud"
                 class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Ubicación del Servicio
              </h2>

              <div class="h-64">
                <app-ubicacion-map
                  [latitud]="servicio()?.latitud"
                  [longitud]="servicio()?.longitud"
                  [readOnly]="true"
                ></app-ubicacion-map>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">

            <!-- Información del Emprendedor -->
            <div *ngIf="servicio()?.emprendedor" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 sticky top-24">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Emprendedor
              </h3>

              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ servicio()?.emprendedor?.nombre }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ servicio()?.emprendedor?.tipo_servicio }}</p>
                </div>

                <div *ngIf="servicio()?.emprendedor?.telefono" class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ servicio()?.emprendedor?.telefono }}</span>
                </div>

                <div *ngIf="servicio()?.emprendedor?.email" class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ servicio()?.emprendedor?.email }}</span>
                </div>

                <div *ngIf="servicio()?.emprendedor?.ubicacion" class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ servicio()?.emprendedor?.ubicacion }}</span>
                </div>

                <div *ngIf="servicio()?.emprendedor?.precio_rango" class="flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ servicio()?.emprendedor?.precio_rango }}</span>
                </div>

                <!-- Mensajes del carrito -->
                <div *ngIf="mensajeCarrito()" class="mb-4 p-3 rounded-lg"
                    [class]="tipoMensajeCarrito() === 'success' ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
                <div class="flex items-center">
                    <svg *ngIf="tipoMensajeCarrito() === 'success'" class="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <svg *ngIf="tipoMensajeCarrito() === 'error'" class="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span [class]="tipoMensajeCarrito() === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'"
                        class="text-sm font-medium">
                    {{ mensajeCarrito() }}
                    </span>
                </div>
                </div>

                <!-- Botones de acción -->
                <div class="pt-4 space-y-3">
                <!-- Botón principal: Agregar al carrito -->
                <button
                    *ngIf="estaAutenticado() && resultadoDisponibilidad === true"
                    (click)="agregarAlCarrito()"
                    [disabled]="agregandoAlCarrito()"
                    class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                    <span *ngIf="!agregandoAlCarrito()" class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
                    </svg>
                    Agregar al Carrito
                    </span>
                    <span *ngIf="agregandoAlCarrito()" class="flex items-center">
                    <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agregando...
                    </span>
                </button>

                <!-- Botón: Verificar disponibilidad primero -->
                <button
                    *ngIf="estaAutenticado() && resultadoDisponibilidad !== true && (fechaConsulta || horaInicio || horaFin)"
                    disabled
                    class="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                >
                    Verifica disponibilidad primero
                </button>

                <!-- Botón: Seleccionar fecha y hora -->
                <button
                    *ngIf="estaAutenticado() && !fechaConsulta && !horaInicio && !horaFin"
                    disabled
                    class="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                >
                    Selecciona fecha y hora
                </button>

                <!-- Botón: Iniciar sesión -->
                <button
                    *ngIf="!estaAutenticado()"
                    (click)="irAlLogin()"
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Iniciar Sesión para Reservar
                </button>

                <!-- Botón: Ver carrito (solo si está autenticado y tiene items) -->
                <button
                    *ngIf="estaAutenticado() && getTotalItemsCarrito() > 0"
                    (click)="irAlCarrito()"
                    class="w-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
                    </svg>
                    Ver Mi Carrito ({{ getTotalItemsCarrito() }})
                </button>

                <!-- Botón: WhatsApp -->
                <button
                    *ngIf="servicio()?.emprendedor?.telefono"
                    (click)="contactarWhatsApp()"
                    class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.089z"/>
                    </svg>
                    Contactar por WhatsApp
                </button>

                <!-- Botón: Volver a servicios -->
                <button
                    (click)="volverAServicios()"
                    class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                >
                    ← Volver a Servicios
                </button>
                </div>

            <!-- Servicios Relacionados -->
            <div *ngIf="serviciosRelacionados().length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                Servicios Relacionados
              </h3>

              <div class="space-y-4">
                <div *ngFor="let servicioRel of serviciosRelacionados().slice(0, 3)"
                     (click)="verOtroServicio(servicioRel.id)"
                     class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                  <h4 class="font-medium text-gray-800 dark:text-gray-200 text-sm">{{ servicioRel.nombre }}</h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ servicioRel.emprendedor?.nombre }}</p>
                  <p *ngIf="servicioRel.precio_referencial" class="text-xs text-amber-600 font-semibold mt-1">
                    S/. {{ servicioRel.precio_referencial }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `]
})
export class ServicioDetalleComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);

  // Signals
  servicio = signal<ServicioDetalle | null>(null);
  serviciosRelacionados = signal<ServicioDetalle[]>([]);
  cargando = signal<boolean>(false);
  error = signal<boolean>(false);
  imagenIndex = signal<number>(0);
  verificandoDisponibilidad = signal<boolean>(false);
  agregandoAlCarrito = signal<boolean>(false);
  mensajeCarrito = signal<string>('');
  tipoMensajeCarrito = signal<'success' | 'error' | null>(null);

  // Estados para verificación de disponibilidad
  fechaConsulta = '';
  horaInicio = '';
  horaFin = '';
  resultadoDisponibilidad: boolean | null = null;
  fechaMinima = '';

  // Método para obtener imagen actual (reemplaza el computed)
  get imagenActual(): string {
    const serv = this.servicio();
    if (serv?.sliders && serv.sliders.length > 0) {
      return serv.sliders[this.imagenIndex()].url_completa;
    }
    return '/assets/general/placeholder-service.jpg';
  }

  ngOnInit() {
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.cargarServicio(id);
      }
    });
  }

  private async cargarServicio(id: number) {
    this.cargando.set(true);
    this.error.set(false);
    this.resultadoDisponibilidad = null;

    try {
      const servicio = await this.turismoService.getServicio(id).toPromise();

      if (servicio) {
        const servicioTransformado = this.transformarServicio(servicio);
        this.servicio.set(servicioTransformado);
        this.imagenIndex.set(0);
        await this.cargarServiciosRelacionados(servicioTransformado);
      } else {
        this.error.set(true);
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error);
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }

  private transformarServicio(servicio: any): ServicioDetalle {
    return {
      id: servicio.id || 0,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio_referencial: servicio.precio_referencial ? parseFloat(servicio.precio_referencial.toString()) : undefined,
      emprendedor_id: servicio.emprendedor_id,
      estado: servicio.estado,
      capacidad: servicio.capacidad,
      latitud: servicio.latitud ? parseFloat(servicio.latitud.toString()) : undefined,
      longitud: servicio.longitud ? parseFloat(servicio.longitud.toString()) : undefined,
      ubicacion_referencia: servicio.ubicacion_referencia,
      emprendedor: servicio.emprendedor ? {
        id: servicio.emprendedor.id || 0,
        nombre: servicio.emprendedor.nombre,
        tipo_servicio: servicio.emprendedor.tipo_servicio,
        telefono: servicio.emprendedor.telefono,
        email: servicio.emprendedor.email,
        ubicacion: servicio.emprendedor.ubicacion,
        precio_rango: servicio.emprendedor.precio_rango,
        categoria: servicio.emprendedor.categoria
      } : undefined,
      categorias: servicio.categorias?.map((cat: any) => ({
        id: cat.id || 0,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        icono_url: cat.icono_url
      })),
      horarios: servicio.horarios?.map((horario: any) => ({
        id: horario.id || 0,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        activo: horario.activo || false
      })),
      sliders: servicio.sliders?.map((slider: any) => ({
        id: slider.id || 0,
        url: slider.url || '',
        url_completa: slider.url_completa || '',
        nombre: slider.nombre,
        orden: slider.orden
      }))
    };
  }

  private async cargarServiciosRelacionados(servicio: ServicioDetalle) {
    try {
      if (servicio.categorias && servicio.categorias.length > 0) {
        const serviciosCategoria = await this.turismoService.getServiciosByCategoria(
          servicio.categorias[0].id
        ).toPromise();

        if (serviciosCategoria) {
          // Filtrar el servicio actual y tomar máximo 5
          const relacionados = serviciosCategoria
            .filter(s => s.id !== servicio.id)
            .slice(0, 5)
            .map(s => this.transformarServicio(s));
          this.serviciosRelacionados.set(relacionados);
        }
      }
    } catch (error) {
      console.error('Error al cargar servicios relacionados:', error);
    }
  }

  async verificarDisponibilidad() {
    if (!this.fechaConsulta || !this.horaInicio || !this.horaFin || !this.servicio()) {
      return;
    }

    this.verificandoDisponibilidad.set(true);

    try {
      const resultado = await this.turismoService.verificarDisponibilidadServicio(
        this.servicio()!.id,
        this.fechaConsulta,
        this.horaInicio + ':00',
        this.horaFin + ':00'
      ).toPromise();

      this.resultadoDisponibilidad = resultado?.disponible || false;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      this.resultadoDisponibilidad = false;
    } finally {
      this.verificandoDisponibilidad.set(false);
    }
  }

  // Métodos para galería de imágenes
  cambiarImagen(index: number) {
    this.imagenIndex.set(index);
  }

  imagenAnterior() {
    const serv = this.servicio();
    if (serv?.sliders && serv.sliders.length > 0) {
      const currentIndex = this.imagenIndex();
      const newIndex = currentIndex === 0 ? serv.sliders.length - 1 : currentIndex - 1;
      this.imagenIndex.set(newIndex);
    }
  }

  imagenSiguiente() {
    const serv = this.servicio();
    if (serv?.sliders && serv.sliders.length > 0) {
      const currentIndex = this.imagenIndex();
      const newIndex = currentIndex === serv.sliders.length - 1 ? 0 : currentIndex + 1;
      this.imagenIndex.set(newIndex);
    }
  }

  // Métodos de navegación
  volverAServicios() {
    this.router.navigate(['/servicios']);
  }

  verOtroServicio(servicioId: number) {
    this.router.navigate(['/servicios', servicioId]);
  }

  contactarWhatsApp() {
    const servicio = this.servicio();
    if (servicio?.emprendedor?.telefono) {
      const telefono = servicio.emprendedor.telefono.replace(/\D/g, '');
      const mensaje = `Hola, estoy interesado en el servicio "${servicio.nombre}". ¿Podrías darme más información?`;
      const url = `https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }

  // Métodos utilitarios
  obtenerHorariosAgrupados() {
    const servicio = this.servicio();
    if (!servicio?.horarios) return [];

    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const horariosAgrupados = new Map();

    // Agrupar horarios por día
    servicio.horarios.forEach(horario => {
      if (!horariosAgrupados.has(horario.dia_semana)) {
        horariosAgrupados.set(horario.dia_semana, horario);
      }
    });

    // Ordenar por días de la semana y agregar días faltantes
    return diasOrden.map(dia => {
      return horariosAgrupados.get(dia) || {
        dia_semana: dia,
        hora_inicio: '',
        hora_fin: '',
        activo: false
      };
    });
  }

  formatearDiaCompleto(dia: string): string {
    const dias: {[key: string]: string} = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miercoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };
    return dias[dia.toLowerCase()] || dia;
  }

  formatearHora(hora: string): string {
    if (!hora) return '';

    // Convertir de formato 24h a 12h
    const [horas, minutos] = hora.split(':');
    const hora24 = parseInt(horas);
    const hora12 = hora24 === 0 ? 12 : hora24 > 12 ? hora24 - 12 : hora24;
    const periodo = hora24 >= 12 ? 'PM' : 'AM';

    return `${hora12}:${minutos} ${periodo}`;
  }
  estaAutenticado(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Redirige al login con parámetro de retorno
   */
  irAlLogin() {
    const currentUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: { redirect: currentUrl }
    });
  }

  /**
   * Agrega el servicio al carrito
   */
  async agregarAlCarrito() {
    if (!this.estaAutenticado()) {
      this.irAlLogin();
      return;
    }

    if (!this.validarDatosCarrito()) {
      return;
    }

    this.agregandoAlCarrito.set(true);
    this.limpiarMensajesCarrito();

    try {
      const servicio = this.servicio()!;
      const duracionMinutos = this.calcularDuracionMinutos();

      const item: CarritoItem = {
        servicio_id: servicio.id,
        emprendedor_id: servicio.emprendedor_id,
        fecha_inicio: this.fechaConsulta,
        fecha_fin: this.fechaConsulta, // Mismo día por ahora
        hora_inicio: this.horaInicio + ':00',
        hora_fin: this.horaFin + ':00',
        duracion_minutos: duracionMinutos,
        cantidad: 1,
        notas_cliente: `Servicio: ${servicio.nombre}`
      };

      await this.carritoService.agregarAlCarrito(item).toPromise();

      this.mostrarMensajeExito('¡Servicio agregado al carrito exitosamente!');

      // Limpiar formulario después de agregar
      this.limpiarFormularioDisponibilidad();

    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      this.mostrarMensajeError(error?.message || 'Error al agregar el servicio al carrito');
    } finally {
      this.agregandoAlCarrito.set(false);
    }
  }

  /**
   * Va directamente al carrito
   */
  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  /**
   * Valida que los datos necesarios estén completos
   */
  private validarDatosCarrito(): boolean {
    if (!this.fechaConsulta) {
      this.mostrarMensajeError('Selecciona una fecha para la reserva');
      return false;
    }

    if (!this.horaInicio) {
      this.mostrarMensajeError('Selecciona una hora de inicio');
      return false;
    }

    if (!this.horaFin) {
      this.mostrarMensajeError('Selecciona una hora de fin');
      return false;
    }

    if (this.resultadoDisponibilidad !== true) {
      this.mostrarMensajeError('Primero verifica la disponibilidad del servicio');
      return false;
    }

    const fechaSeleccionada = new Date(this.fechaConsulta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this.mostrarMensajeError('La fecha no puede ser anterior a hoy');
      return false;
    }

    if (!this.validarHorarios()) {
      this.mostrarMensajeError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }

    return true;
  }

  /**
   * Valida que los horarios sean lógicos
   */
  private validarHorarios(): boolean {
    const inicio = new Date(`1970-01-01T${this.horaInicio}:00`);
    const fin = new Date(`1970-01-01T${this.horaFin}:00`);
    return fin > inicio;
  }

  /**
   * Calcula la duración en minutos
   */
  calcularDuracionMinutos(): number {
    if (!this.horaInicio || !this.horaFin) return 0;

    const inicio = new Date(`1970-01-01T${this.horaInicio}:00`);
    const fin = new Date(`1970-01-01T${this.horaFin}:00`);
    return Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60));
  }

  /**
   * Limpia el formulario de disponibilidad
   */
  private limpiarFormularioDisponibilidad() {
    this.fechaConsulta = '';
    this.horaInicio = '';
    this.horaFin = '';
    this.resultadoDisponibilidad = null;
  }

  /**
   * Muestra mensaje de éxito
   */
  private mostrarMensajeExito(mensaje: string) {
    this.mensajeCarrito.set(mensaje);
    this.tipoMensajeCarrito.set('success');
    setTimeout(() => this.limpiarMensajesCarrito(), 5000);
  }

  /**
   * Muestra mensaje de error
   */
  private mostrarMensajeError(mensaje: string) {
    this.mensajeCarrito.set(mensaje);
    this.tipoMensajeCarrito.set('error');
    setTimeout(() => this.limpiarMensajesCarrito(), 5000);
  }

  /**
   * Limpia los mensajes del carrito
   */
  private limpiarMensajesCarrito() {
    this.mensajeCarrito.set('');
    this.tipoMensajeCarrito.set(null);
  }

  /**
   * Obtiene el número total de items en el carrito
   */
  getTotalItemsCarrito(): number {
    return this.carritoService.getTotalItems();
  }
}
