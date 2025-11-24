import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, PaginatedResponse, Servicio, Categoria, Emprendedor } from '../../../core/services/turismo.service';
import { UbicacionMapComponent } from '../../../shared/components/ubicacion-map/ubicacion-map.component';


// Interfaces específicas para servicios
export interface ServicioDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  emprendedor_id: number;
  estado?: boolean;
  capacidad?: string;
  latitud?: number;
  longitud?: number;
  ubicacion_referencia?: string;
  emprendedor?: {
    id: number;
    nombre: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    ubicacion: string;
    precio_rango?: string;
    categoria: string;
  };
  categorias?: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
    icono_url?: string;
  }>;
  horarios?: Array<{
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
  }>;
  sliders?: Array<{
    id: number;
    url: string;
    url_completa: string;
    nombre: string;
    orden: number;
  }>;
}

export interface CategoriaServicio {
  id: number;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
}

export interface EmprendedorBasico {
  id: number;
  nombre: string;
  tipo_servicio: string;
  categoria: string;
}

interface FiltrosServicios {
  categoria?: number;
  emprendedor?: number;
  ubicacion?: {
    latitud: number;
    longitud: number;
    distancia: number;
  };
  busqueda?: string;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UbicacionMapComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <!-- Hero Section -->
<!-- Hero Section -->
<section class="relative text-white py-20" style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url('https://pe.all.biz/img/pe/service_catalog/5971.jpeg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
  <div class="relative container mx-auto px-4 text-center">
    <h1 class="text-4xl md:text-6xl font-bold mb-6">
      Servicios Turísticos
    </h1>
    <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
      Descubre la auténtica experiencia de Capachica con nuestros servicios locales
    </p>
    
    <!-- Barra de búsqueda principal -->
    <div class="max-w-2xl mx-auto">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="filtros.busqueda"
          (ngModelChange)="onBusquedaChange($event)"
          placeholder="Buscar servicios, emprendedores o actividades..."
          class="w-full px-6 py-4 text-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 text-lg"
        >
        <button
          (click)="buscarServicios()"
          class="absolute right-2 top-2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
        <!-- Indicador de búsqueda activa -->
        <div *ngIf="filtros.busqueda" class="absolute right-14 top-1/2 transform -translate-y-1/2">
          <span class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-full">
            {{ serviciosFiltrados().length }} resultados
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Filtro de Categorías Superior -->
<div class="mb-0">
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center justify-center mb-6">
      <div class="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">Categorías</h3>
    </div>
    
    <!-- Botones de categorías en horizontal -->
    <div class="flex flex-wrap justify-center gap-4">
      <!-- Botón "Todas las categorías" -->
      <button
        (click)="seleccionarCategoria(null)"
        [class]="filtros.categoria === null ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        class="px-4 py-2 rounded-xl transition-all duration-300 font-medium whitespace-nowrap border border-gray-200 dark:border-gray-600 hover:shadow-md transform hover:-translate-y-0.5 flex items-center"
      >
        <!-- Icono para "Todas las categorías" -->
        <svg class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
        Todas las categorías
        <span class="ml-2 text-xs px-2 py-1 rounded-full bg-white/20">{{ servicios().length }}</span>
      </button>
      
      <!-- Botones de categorías individuales -->
      <button
        *ngFor="let categoria of categorias()"
        (click)="seleccionarCategoria(categoria.id)"
        [class]="filtros.categoria === categoria.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        class="px-4 py-2 rounded-xl transition-all duration-300 font-medium whitespace-nowrap border border-gray-200 dark:border-gray-600 hover:shadow-md transform hover:-translate-y-0.5 flex items-center"
      >
        <!-- Iconos dinámicos basados en el nombre/tipo de categoría -->
        <ng-container [ngSwitch]="getIconoCategoria(categoria.nombre)">
          
          <!-- Hospedaje/Hoteles -->
          <svg *ngSwitchCase="'hospedaje'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          
          <!-- Hoteles -->
          <svg *ngSwitchCase="'hoteles'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          
          <!-- Alimentos/Restaurantes -->
          <svg *ngSwitchCase="'alimentos'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
          </svg>
          
          <!-- Restaurantes -->
          <svg *ngSwitchCase="'restaurantes'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
          </svg>
          
          <!-- Guías Turísticos -->
          <svg *ngSwitchCase="'guias'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          
          <!-- Tours -->
          <svg *ngSwitchCase="'tours'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          
          <!-- Transporte -->
          <svg *ngSwitchCase="'transporte'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          
          <!-- Actividades/Entretenimiento -->
          <svg *ngSwitchCase="'actividades'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10c0 7-3 13-7 13s-7-6-7-13a7 7 0 0114 0z"></path>
          </svg>
          
          <!-- Entretenimiento -->
          <svg *ngSwitchCase="'entretenimiento'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          
          <!-- Aventura -->
          <svg *ngSwitchCase="'aventura'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
          
          <!-- Cultura -->
          <svg *ngSwitchCase="'cultura'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>
          </svg>
          
          <!-- Naturaleza -->
          <svg *ngSwitchCase="'naturaleza'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
          </svg>
          
          <!-- Compras/Shopping -->
          <svg *ngSwitchCase="'compras'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          
          <!-- Eventos -->
          <svg *ngSwitchCase="'eventos'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          
          <!-- Spa/Bienestar -->
          <svg *ngSwitchCase="'spa'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          
          <!-- Deportes -->
          <svg *ngSwitchCase="'deportes'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          
          <!-- Turismo Rural -->
          <svg *ngSwitchCase="'rural'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          
          <!-- Fotografía Turística -->
          <svg *ngSwitchCase="'fotografia'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          
          <!-- Servicios Turísticos -->
          <svg *ngSwitchCase="'servicios'" class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V9a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0v.01M8 6v6h8V6m-8 6v.01M16 12v.01"></path>
          </svg>
          
          <!-- Icono por defecto -->
          <svg *ngSwitchDefault class="w-4 h-4 mr-2 text-orange-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          
        </ng-container>
        
        {{ categoria.nombre }}
        <span 
          [class]="filtros.categoria === categoria.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'"
          class="ml-2 text-xs px-2 py-1 rounded-full"
        >
          {{ contarServiciosPorCategoria(categoria.id) }}
        </span>
      </button>
    </div>
  </div>
</div>

<!-- Filtros y Contenido -->
<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col lg:flex-row gap-8">
    
    <!-- Panel de Filtros Colapsable Lateral -->
    <aside class="transition-all duration-300 ease-in-out" 
           [class]="mostrarFiltros() ? 'lg:w-1/4' : 'lg:w-16'">
      <!-- Header del Panel con Botón de Colapso -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 overflow-hidden">
        <div class="flex items-center p-4 border-b border-gray-200 dark:border-gray-600"
             [class]="mostrarFiltros() ? 'justify-between' : 'justify-center'">
          
          <!-- Título (solo visible cuando está expandido) -->
          <h3 *ngIf="mostrarFiltros()" class="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center">
            <svg class="w-6 h-6 text-amber-500 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
            </svg>
            Filtros
          </h3>
          
          <!-- Botón de Colapso -->
          <button 
            (click)="toggleFiltros()"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-500 flex items-center"
            [attr.aria-label]="mostrarFiltros() ? 'Ocultar filtros' : 'Mostrar filtros'"
          >
            <!-- Ícono del filtro (siempre visible) -->
            <svg *ngIf="!mostrarFiltros()" class="w-6 h-6 text-amber-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
            </svg>
            
            <!-- Flecha (cambia de dirección) -->
            <svg 
              class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300"
              [class.rotate-180]="!mostrarFiltros()"
              [class.ml-2]="mostrarFiltros()"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
        
        <!-- Contenido de Filtros (Colapsable) -->
        <div 
          *ngIf="mostrarFiltros()"
          class="transition-all duration-300 ease-in-out"
        >
          <div class="p-4 space-y-6">
            
            <!-- Filtro por Emprendedores -->
            <div>
              <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center text-sm uppercase tracking-wide">
                <div class="w-6 h-6 bg-green-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-2">
                  <svg class="w-4 h-4 text-green-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                Emprendedores
              </h4>
              <div class="relative">
                <select
                  [(ngModel)]="filtros.emprendedor"
                  class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none transition-all duration-200"
                >
                  <option [value]="null">Todos los emprendedores</option>
                  <option *ngFor="let emprendedor of emprendedores()" [value]="emprendedor.id">
                    {{ emprendedor.nombre }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Filtro por Ubicación -->
            <div>
              <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center text-sm uppercase tracking-wide">
                <div class="w-6 h-6 bg-purple-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-2">
                  <svg class="w-4 h-4 text-purple-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                Ubicación
              </h4>
                        
              <div class="space-y-4">
                <label class="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
                  <input
                    type="checkbox"
                    [(ngModel)]="mostrarFiltroUbicacion"
                    class="mr-3 text-amber-600 dark:text-blue-500 focus:ring-amber-500 dark:focus:ring-blue-500 focus:ring-2 rounded"
                  >
                  <span class="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-blue-400 transition-colors">Activar filtro por ubicación</span>
                </label>
                            
                <div *ngIf="mostrarFiltroUbicacion" class="space-y-4 pl-4 border-l-2 border-purple-200 dark:border-blue-600">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Radio de búsqueda
                    </label>
                    <div class="relative">
                      <select
                        [(ngModel)]="radioDistancia"
                        (change)="actualizarFiltroUbicacion()"
                        class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none"
                      >
                        <option value="1">1 km</option>
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="20">20 km</option>
                        <option value="50">50 km</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                                
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <app-ubicacion-map
                      [latitud]="ubicacionSeleccionada()?.latitud"
                      [longitud]="ubicacionSeleccionada()?.longitud"
                      (ubicacionChange)="onUbicacionSeleccionada($event)"
                    ></app-ubicacion-map>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <!-- Botón Aplicar Filtros -->
              <button
                (click)="aplicarFiltros()"
                [disabled]="aplicandoFiltros() || (!tieneFiltosPorAplicar())"
                class="w-full bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 hover:from-amber-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                <span *ngIf="!aplicandoFiltros()">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                  </svg>
                  Aplicar Filtros
                </span>
                <span *ngIf="aplicandoFiltros()" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aplicando...
                </span>
              </button>
              
              <!-- Botón para limpiar filtros -->
              <button
                (click)="limpiarFiltros()"
                [disabled]="!tieneFiltrosActivos()"
                class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center font-medium border border-gray-200 dark:border-gray-600"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="transition-all duration-300 ease-in-out"
          [class]="mostrarFiltros() ? 'lg:w-3/4' : 'lg:w-full lg:pl-8'">
      <!-- Información de resultados -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent mb-2">
              {{ serviciosFiltrados().length }} servicios encontrados
            </h2>
            <div class="flex flex-wrap gap-2 text-sm">
              <span *ngIf="filtros.categoria" class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-blue-900 text-amber-800 dark:text-blue-200">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                {{ obtenerNombreCategoria(filtros.categoria) }}
              </span>
              <span *ngIf="filtros.emprendedor" class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-blue-900 text-green-800 dark:text-blue-200">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ obtenerNombreEmprendedor(filtros.emprendedor) }}
              </span>
              <span *ngIf="filtros.ubicacion" class="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-blue-900 text-purple-800 dark:text-blue-200">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                {{ filtros.ubicacion.distancia }}km
              </span>
              <span *ngIf="filtros.busqueda" class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                "{{ filtros.busqueda }}"
              </span>
              <span *ngIf="!tieneFiltrosActivos()" class="text-gray-500 dark:text-gray-400 italic">
                Mostrando todos los servicios disponibles
              </span>
            </div>
          </div>
          
          <!-- Selector de vista -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 shadow-inner">
            <button
              (click)="vistaGrid.set(true)"
              [class]="vistaGrid() ? 'bg-white dark:bg-gray-600 shadow-md text-amber-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'"
              class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span class="hidden sm:inline">Grid</span>
            </button>
            <button
              (click)="vistaGrid.set(false)"
              [class]="!vistaGrid() ? 'bg-white dark:bg-gray-600 shadow-md text-amber-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'"
              class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span class="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="cargando() || aplicandoFiltros()" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-amber-200 dark:border-blue-300 border-t-amber-600 dark:border-t-blue-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-400 dark:border-r-blue-500 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <div class="mt-6 text-center">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {{ cargando() ? 'Cargando servicios...' : 'Aplicando filtros...' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Por favor espera un momento
          </p>
        </div>
      </div>

      <!-- Lista de Servicios -->
      <div *ngIf="!cargando() && !aplicandoFiltros() && serviciosFiltrados().length > 0">
        <!-- Vista Grid -->
        <div *ngIf="vistaGrid()" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div *ngFor="let servicio of serviciosFiltrados()" 
               class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
               (click)="verDetalle(servicio.id)">
            
            <!-- Imagen del servicio -->
            <div class="relative h-56 overflow-hidden">
              <img 
                [src]="obtenerImagenPrincipal(servicio)" 
                [alt]="servicio.nombre"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onerror="this.src='/assets/general/placeholder-service.jpg'"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div class="absolute top-4 left-4">
                <span class="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  {{ servicio.categorias?.[0]?.nombre || 'Servicio' }}
                </span>
              </div>
              <div *ngIf="servicio.precio_referencial" class="absolute top-4 right-4">
                <span class="bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  S/. {{ servicio.precio_referencial }}
                </span>
              </div>
              <div class="absolute bottom-4 left-4 right-4">
                <div class="flex items-center text-white text-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  <span class="truncate">{{ servicio.ubicacion_referencia || 'Ubicación no especificada' }}</span>
                </div>
              </div>
            </div>

            <!-- Contenido -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-amber-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                {{ servicio.nombre }}
              </h3>
              
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                {{ servicio.descripcion || 'Servicio turístico disponible para tu disfrute' }}
              </p>
              
              <!-- Información del emprendedor -->
              <div class="flex items-center mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 dark:from-blue-400 dark:to-blue-600 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ servicio.emprendedor?.nombre }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Emprendedor local</p>
                </div>
              </div>
              
              <!-- Horarios disponibles -->
              <div *ngIf="servicio.horarios && servicio.horarios.length > 0" class="mb-6">
                <div class="flex items-center mb-2">
                  <svg class="w-4 h-4 text-green-500 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Disponible:</span>
                </div>
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let horario of obtenerHorariosUnicos(servicio.horarios).slice(0, 3)" 
                        class="inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-blue-900 dark:to-blue-800 text-green-800 dark:text-blue-200 text-xs px-2 py-1 rounded-md font-medium">
                    {{ formatearDia(horario.dia_semana) }}
                  </span>
                  <span *ngIf="obtenerHorariosUnicos(servicio.horarios).length > 3" 
                        class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-md">
                    +{{ obtenerHorariosUnicos(servicio.horarios).length - 3 }}
                  </span>
                </div>
              </div>
              
              <!-- Botón de acción -->
              <button 
                (click)="verDetalle(servicio.id); $event.stopPropagation()"
                class="w-full bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 hover:from-amber-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <!-- Vista Lista -->
        <div *ngIf="!vistaGrid()" class="space-y-6">
          <div *ngFor="let servicio of serviciosFiltrados()" 
               class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer border border-gray-100 dark:border-gray-700"
               (click)="verDetalle(servicio.id)">
            
            <div class="flex flex-col lg:flex-row">
              <!-- Imagen -->
              <div class="relative lg:w-80 h-64 lg:h-auto overflow-hidden">
                <img 
                  [src]="obtenerImagenPrincipal(servicio)" 
                  [alt]="servicio.nombre"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onerror="this.src='/assets/general/placeholder-service.jpg'"
                >
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:to-black/30"></div>
                <div class="absolute top-4 left-4">
                  <span class="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {{ servicio.categorias?.[0]?.nombre || 'Servicio' }}
                  </span>
                </div>
                <div *ngIf="servicio.precio_referencial" class="absolute top-4 right-4">
                  <span class="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    S/. {{ servicio.precio_referencial }}
                  </span>
                </div>
              </div>

              <!-- Contenido -->
              <div class="flex-1 p-8">
                <div class="flex flex-col h-full">
                  <!-- Header -->
                  <div class="flex-1">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 group-hover:text-amber-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {{ servicio.nombre }}
                    </h3>
                    
                    <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {{ servicio.descripcion || 'Servicio turístico disponible para tu disfrute' }}
                    </p>
                    
                    <!-- Información del emprendedor -->
                    <div class="flex items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 dark:from-blue-400 dark:to-blue-600 rounded-full flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-gray-800 dark:text-gray-200 text-lg">{{ servicio.emprendedor?.nombre }}</p>
                        <p class="text-gray-500 dark:text-gray-400">Emprendedor local</p>
                      </div>
                    </div>
                    
                    <!-- Ubicación -->
                    <div class="flex items-center mb-4 text-gray-600 dark:text-gray-400">
                      <svg class="w-5 h-5 mr-3 text-purple-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      </svg>
                      <span>{{ servicio.ubicacion_referencia || 'Ubicación no especificada' }}</span>
                    </div>
                    
                    <!-- Horarios -->
                    <div *ngIf="servicio.horarios && servicio.horarios.length > 0" class="mb-6">
                      <div class="flex items-center mb-3">
                        <svg class="w-5 h-5 text-green-500 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Horarios disponibles:</span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let horario of obtenerHorariosUnicos(servicio.horarios)" 
                              class="inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-blue-900 dark:to-blue-800 text-green-800 dark:text-blue-200 px-3 py-2 rounded-lg font-medium">
                          {{ formatearDia(horario.dia_semana) }} {{ horario.hora_inicio }} - {{ horario.hora_fin }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botón de acción -->
                  <div class="mt-auto">
                    <button 
                      (click)="verDetalle(servicio.id); $event.stopPropagation()"
                      class="w-full lg:w-auto bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 hover:from-amber-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white py-4 px-8 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!cargando() && !aplicandoFiltros() && serviciosFiltrados().length === 0" 
           class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
            No se encontraron servicios
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Intenta ajustar los filtros o realizar una búsqueda diferente para encontrar servicios disponibles.
          </p>
          <button
            (click)="limpiarFiltros()"
            class="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-blue-600 hover:from-amber-600 hover:to-orange-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </main>
  </div>
</div>


</div>
  `,
  styles: [`
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
    
    /* Estilos personalizados para el componente */
    :host {
      display: block;
    }
    
    /* Animaciones suaves */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hover effects */
    .group:hover .group-hover\:scale-110 {
      transform: scale(1.1);
    }
    
    .group:hover .group-hover\:text-amber-600 {
      color: #d97706;
    }
      

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .animation-delay-150 {
    animation-delay: 150ms;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
  }
  
  .transform {
    transition: transform 0.3s ease;
  }
  
  .hover\:-translate-y-2:hover {
    transform: translateY(-8px);
  }
  
  .hover\:-translate-y-1:hover {
    transform: translateY(-4px);
  }
  
  .hover\:scale-105:hover {
    transform: scale(1.05);
  }

  `]
})
export class ServiciosComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private router = inject(Router);

  // Signals
  servicios = signal<ServicioDetalle[]>([]);
  serviciosOriginales = signal<ServicioDetalle[]>([]); // Para mantener la lista original
  categorias = signal<CategoriaServicio[]>([]);
  emprendedores = signal<EmprendedorBasico[]>([]);
  cargando = signal<boolean>(false);
  vistaGrid = signal<boolean>(true);
  mostrarFiltroUbicacion = signal<boolean>(false);
  ubicacionSeleccionada = signal<{latitud: number, longitud: number} | null>(null);
  aplicandoFiltros = signal<boolean>(false);
  favoritos = signal<number[]>([]);
  mostrarFiltros = signal<boolean>(true);

  // Filtros
  filtros: FiltrosServicios = {};
  radioDistancia = 10;

  // Computed - Solo para filtros frontend (búsqueda por texto)
  serviciosFiltrados = computed(() => {
    let serviciosFiltrados = [...this.servicios()];

    // Solo filtro por búsqueda en frontend (en tiempo real)
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      serviciosFiltrados = serviciosFiltrados.filter(servicio =>
        servicio.nombre.toLowerCase().includes(busqueda) ||
        servicio.descripcion?.toLowerCase().includes(busqueda) ||
        servicio.emprendedor?.nombre.toLowerCase().includes(busqueda) ||
        servicio.categorias?.some(cat => cat.nombre.toLowerCase().includes(busqueda))
      );
    }

    return serviciosFiltrados;
  });

  ngOnInit() {
    this.cargarDatosIniciales();
    this.cargarFavoritosDesdeStorage();
    this.cargarPreferenciaFiltros();
  }

  private async cargarDatosIniciales() {
    this.cargando.set(true);
    
    try {
      // Cargar servicios, categorías y emprendedores en paralelo
      const [serviciosResponse, categoriasResponse, emprendedoresResponse] = await Promise.all([
        this.turismoService.getServicios(1, 100).toPromise(), // Aumentamos el límite
        this.turismoService.getCategorias().toPromise(),
        this.turismoService.getEmprendedores(1, 100).toPromise()
      ]);

      if (serviciosResponse) {
        const serviciosTransformados = serviciosResponse.data.map(servicio => this.transformarServicio(servicio));
        this.serviciosOriginales.set(serviciosTransformados); // Guardar originales
        this.servicios.set(serviciosTransformados);
      }

      if (categoriasResponse) {
        const categoriasTransformadas = categoriasResponse.map(cat => ({
          id: cat.id || 0,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          icono_url: cat.icono_url
        }));
        this.categorias.set(categoriasTransformadas);
      }

      if (emprendedoresResponse) {
        // Extraer emprendedores únicos
        const emprendedoresUnicos = emprendedoresResponse.data.map(emp => ({
          id: emp.id || 0,
          nombre: emp.nombre,
          tipo_servicio: emp.tipo_servicio,
          categoria: emp.categoria
        }));
        this.emprendedores.set(emprendedoresUnicos);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  private cargarPreferenciaFiltros(): void {
  try {
    const preferencia = localStorage.getItem('mostrar_filtros');
    if (preferencia !== null) {
      const mostrar = JSON.parse(preferencia);
      this.mostrarFiltros.set(mostrar);
    }
  } catch (error) {
    console.error('Error al cargar preferencia de filtros:', error);
    this.mostrarFiltros.set(true); // valor por defecto
  }
}

  private transformarServicio(servicio: Servicio): ServicioDetalle {
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
      categorias: servicio.categorias?.map(cat => ({
        id: cat.id || 0,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        icono_url: cat.icono_url
      })),
      horarios: servicio.horarios?.map(horario => ({
        id: horario.id || 0,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        activo: horario.activo || false
      })),
      sliders: servicio.sliders?.map(slider => ({
        id: slider.id || 0,
        url: slider.url || '',
        url_completa: slider.url_completa || '',
        nombre: slider.nombre,
        orden: slider.orden
      }))
    };
  }

  buscarServicios() {
    // Solo actualiza la búsqueda en tiempo real (frontend)
    // El computed serviciosFiltrados se encarga del filtrado
  }

  onBusquedaChange(valor: string) {
    this.filtros.busqueda = valor;
    // La búsqueda se aplica automáticamente a través del computed
  }

  async aplicarFiltros() {
    // Si solo hay filtro de búsqueda, no hacer petición HTTP
    if (this.soloTieneFiltrosBusqueda()) {
      console.log('Solo filtro de búsqueda, aplicando en frontend');
      return;
    }

    this.aplicandoFiltros.set(true);
    
    try {
      let serviciosResultado: ServicioDetalle[] = [];

      // Si tiene filtros de categoría o emprendedor, hacer petición específica
      if (this.filtros.categoria) {
        console.log('Aplicando filtro por categoría:', this.filtros.categoria);
        const serviciosCategoria = await this.turismoService.getServiciosByCategoria(this.filtros.categoria).toPromise();
        if (serviciosCategoria) {
          serviciosResultado = serviciosCategoria.map(servicio => this.transformarServicio(servicio));
        }
      } else if (this.filtros.emprendedor) {
        console.log('Aplicando filtro por emprendedor:', this.filtros.emprendedor);
        const serviciosEmprendedor = await this.turismoService.getServiciosByEmprendedor(this.filtros.emprendedor).toPromise();
        if (serviciosEmprendedor) {
          serviciosResultado = serviciosEmprendedor.map(servicio => this.transformarServicio(servicio));
        }
      } else if (this.filtros.ubicacion) {
        console.log('Aplicando filtro por ubicación');
        await this.aplicarFiltroUbicacion();
        return;
      } else {
        // Si no hay filtros específicos, cargar todos
        serviciosResultado = [...this.serviciosOriginales()];
      }

      this.servicios.set(serviciosResultado);
      console.log('Filtros aplicados. Servicios encontrados:', serviciosResultado.length);
      
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      // En caso de error, mostrar servicios originales
      this.servicios.set([...this.serviciosOriginales()]);
    } finally {
      this.aplicandoFiltros.set(false);
    }
  }

  private soloTieneFiltrosBusqueda(): boolean {
    return Boolean(this.filtros.busqueda) && 
           !this.filtros.categoria && 
           !this.filtros.emprendedor && 
           !this.filtros.ubicacion;
  }

  async aplicarFiltroUbicacion() {
    if (!this.filtros.ubicacion) return;

    this.cargando.set(true);
    
    try {
      const serviciosCercanos = await this.turismoService.getServiciosByUbicacion(
        this.filtros.ubicacion.latitud,
        this.filtros.ubicacion.longitud,
        this.filtros.ubicacion.distancia
      ).toPromise();

      if (serviciosCercanos) {
        const serviciosTransformados = serviciosCercanos.map(servicio => this.transformarServicio(servicio));
        this.servicios.set(serviciosTransformados);
      }
    } catch (error) {
      console.error('Error al buscar servicios por ubicación:', error);
      // En caso de error, mantener los servicios actuales
      console.log('Manteniendo servicios actuales debido al error');
    } finally {
      this.cargando.set(false);
    }
  }

  onUbicacionSeleccionada(ubicacion: {lat: number, lng: number}) {
    this.ubicacionSeleccionada.set({
      latitud: ubicacion.lat,
      longitud: ubicacion.lng
    });
    
    this.filtros.ubicacion = {
      latitud: ubicacion.lat,
      longitud: ubicacion.lng,
      distancia: this.radioDistancia
    };
    
    this.aplicarFiltroUbicacion();
  }

  actualizarFiltroUbicacion() {
    if (this.ubicacionSeleccionada()) {
      this.filtros.ubicacion = {
        latitud: this.ubicacionSeleccionada()!.latitud,
        longitud: this.ubicacionSeleccionada()!.longitud,
        distancia: this.radioDistancia
      };
      this.aplicarFiltroUbicacion();
    }
  }

  seleccionarCategoria(categoriaId: number | undefined | null) {
    this.filtros.categoria = categoriaId || undefined;
    this.aplicarFiltros(); // Esto aplicará automáticamente los filtros
  }
  limpiarFiltros() {
    this.filtros = {};
    this.mostrarFiltroUbicacion.set(false);
    this.ubicacionSeleccionada.set(null);
    this.radioDistancia = 10;
    
    // Restaurar servicios originales
    this.servicios.set([...this.serviciosOriginales()]);
    console.log('Filtros limpiados. Mostrando todos los servicios.');
  }

  verDetalle(servicioId: number) {
    this.router.navigate(['/servicios', servicioId]);
  }

  // Método para contactar emprendedor
  contactarEmprendedor(emprendedor: any): void {
    if (!emprendedor) {
      console.error('No se encontró información del emprendedor');
      return;
    }

    // Crear mensaje de WhatsApp
    const mensaje = `Hola ${emprendedor.nombre}, estoy interesado en sus servicios turísticos. ¿Podría brindarme más información?`;
    const numeroTelefono = emprendedor.telefono || emprendedor.whatsapp;
    
    if (numeroTelefono) {
      // Limpiar el número de teléfono (remover espacios, guiones, etc.)
      const numeroLimpio = numeroTelefono.replace(/\D/g, '');
      const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    } else {
      // Si no hay WhatsApp, mostrar información de contacto disponible
      const contactoInfo = [];
      if (emprendedor.email) contactoInfo.push(`Email: ${emprendedor.email}`);
      if (emprendedor.telefono) contactoInfo.push(`Teléfono: ${emprendedor.telefono}`);
      
      if (contactoInfo.length > 0) {
        alert(`Información de contacto:\n${contactoInfo.join('\n')}`);
      } else {
        alert('No se encontró información de contacto para este emprendedor');
      }
    }
  }

  // Método para alternar favorito
  toggleFavorito(servicioId: number): void {
    const favoritosActuales = this.favoritos();
    const index = favoritosActuales.indexOf(servicioId);
    
    if (index > -1) {
      // Remover de favoritos
      const nuevosFavoritos = favoritosActuales.filter(id => id !== servicioId);
      this.favoritos.set(nuevosFavoritos);
      this.mostrarNotificacion('Servicio removido de favoritos', 'info');
    } else {
      // Agregar a favoritos
      const nuevosFavoritos = [...favoritosActuales, servicioId];
      this.favoritos.set(nuevosFavoritos);
      this.mostrarNotificacion('Servicio agregado a favoritos', 'success');
    }
    
    // Opcional: Guardar favoritos en localStorage
    this.guardarFavoritosEnStorage();
  }

  toggleFiltros() {
  const estadoActual = this.mostrarFiltros();
  this.mostrarFiltros.set(!estadoActual);
  
  // Opcional: Guardar la preferencia del usuario en localStorage
  try {
    localStorage.setItem('mostrar_filtros', JSON.stringify(!estadoActual));
  } catch (error) {
    console.error('Error al guardar preferencia de filtros:', error);
  }
}

  // Método para verificar si es favorito
  esFavorito(servicioId: number): boolean {
    return this.favoritos().includes(servicioId);
  }

  // Método para guardar favoritos en localStorage
  private guardarFavoritosEnStorage(): void {
    try {
      localStorage.setItem('favoritos_servicios', JSON.stringify(this.favoritos()));
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
    }
  }

  // Método para cargar favoritos desde localStorage
  private cargarFavoritosDesdeStorage(): void {
    try {
      const favoritosGuardados = localStorage.getItem('favoritos_servicios');
      if (favoritosGuardados) {
        const favoritos = JSON.parse(favoritosGuardados);
        this.favoritos.set(favoritos);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      this.favoritos.set([]);
    }
  }

  // Método para mostrar notificaciones
  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info'): void {
    // Si tienes un servicio de notificaciones, úsalo aquí
    // Ejemplo básico con alert (reemplazar por tu sistema de notificaciones)
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    
    // Alternativa con toast/snackbar si tienes implementado
    // this.toastr.success(mensaje); // Para ngx-toastr
    // this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 }); // Para Angular Material
  }

  // Métodos utilitarios
  contarServiciosPorCategoria(categoriaId: number): number {
    return this.serviciosOriginales().filter(servicio =>
      servicio.categorias?.some(cat => cat.id === categoriaId)
    ).length;
  }

  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias().find(cat => cat.id === categoriaId);
    return categoria?.nombre || '';
  }

  obtenerNombreEmprendedor(emprendedorId: number): string {
    const emprendedor = this.emprendedores().find(emp => emp.id === emprendedorId);
    return emprendedor?.nombre || '';
  }

  obtenerImagenPrincipal(servicio: ServicioDetalle): string {
    if (servicio.sliders && servicio.sliders.length > 0) {
      return servicio.sliders[0].url_completa || '/assets/general/placeholder-service.jpg';
    }
    return '/assets/general/placeholder-service.jpg';
  }

  obtenerHorariosUnicos(horarios: any[]): any[] {
    if (!horarios || horarios.length === 0) return [];
    
    const horariosUnicos = horarios.reduce((acc, horario) => {
      const existe = acc.find((h: any) => h.dia_semana === horario.dia_semana);
      if (!existe && horario.activo) {
        acc.push(horario);
      }
      return acc;
    }, []);
    
    return horariosUnicos;
  }

  // Métodos auxiliares para botones
  tieneFiltosPorAplicar(): boolean {
    return Boolean(this.filtros.categoria || this.filtros.emprendedor || this.filtros.ubicacion);
  }

  tieneFiltrosActivos(): boolean {
    return Boolean(this.filtros.categoria || this.filtros.emprendedor || this.filtros.ubicacion || this.filtros.busqueda);
  }

  formatearDia(dia: string | number): string {
    const dias = {
      1: 'Lun',
      2: 'Mar', 
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
      7: 'Dom',
      'lunes': 'Lun',
      'martes': 'Mar',
      'miercoles': 'Mié',
      'miércoles': 'Mié',
      'jueves': 'Jue',
      'viernes': 'Vie',
      'sabado': 'Sáb',
      'sábado': 'Sáb',
      'domingo': 'Dom'
    };
    
    return dias[dia as keyof typeof dias] || dia.toString();
  }
  // Método para obtener el tipo de icono basado en el nombre de la categoría
getIconoCategoria(nombreCategoria: string): string {
  const nombre = nombreCategoria.toLowerCase();
  
  // Mapeo de palabras clave a tipos de iconos para turismo
  if (nombre.includes('hospedaje') || nombre.includes('alojamiento') || nombre.includes('estadía') || 
      nombre.includes('dormir') || nombre.includes('hostal') || nombre.includes('cabaña') ||
      nombre.includes('apartamento') || nombre.includes('residencia')) {
    return 'hospedaje';
  }
  
  if (nombre.includes('hotel') || nombre.includes('resort') || nombre.includes('lodge') || 
      nombre.includes('posada') || nombre.includes('inn')) {
    return 'hoteles';
  }
  
  if (nombre.includes('alimento') || nombre.includes('comida') || nombre.includes('gastronomía') || 
      nombre.includes('cocina') || nombre.includes('culinari') || nombre.includes('food') ||
      nombre.includes('bebida') || nombre.includes('bar') || nombre.includes('café')) {
    return 'alimentos';
  }
  
  if (nombre.includes('restaurante') || nombre.includes('resto') || nombre.includes('comer') || 
      nombre.includes('menú') || nombre.includes('chef')) {
    return 'restaurantes';
  }
  
  if (nombre.includes('guía') || nombre.includes('guia') || nombre.includes('guías') || 
      nombre.includes('conductor') || nombre.includes('acompañante') || nombre.includes('interprete')) {
    return 'guias';
  }
  
  if (nombre.includes('tour') || nombre.includes('excurs') || nombre.includes('circuito') || 
      nombre.includes('recorr') || nombre.includes('visita') || nombre.includes('paseo')) {
    return 'tours';
  }
  
  if (nombre.includes('transporte') || nombre.includes('traslado') || nombre.includes('vehiculo') || 
      nombre.includes('bus') || nombre.includes('taxi') || nombre.includes('transfer') ||
      nombre.includes('movilidad') || nombre.includes('auto') || nombre.includes('van')) {
    return 'transporte';
  }
  
  if (nombre.includes('actividad') || nombre.includes('recreaci') || nombre.includes('diversión') || 
      nombre.includes('juego') || nombre.includes('experiencia')) {
    return 'actividades';
  }
  
  if (nombre.includes('entretenimiento') || nombre.includes('espectáculo') || nombre.includes('show') || 
      nombre.includes('teatro') || nombre.includes('música') || nombre.includes('baile') ||
      nombre.includes('fiesta') || nombre.includes('nightlife')) {
    return 'entretenimiento';
  }
  
  if (nombre.includes('aventura') || nombre.includes('extremo') || nombre.includes('adrenalina') || 
      nombre.includes('escalada') || nombre.includes('rafting') || nombre.includes('canopy') ||
      nombre.includes('trekking') || nombre.includes('hiking')) {
    return 'aventura';
  }
  
  if (nombre.includes('cultura') || nombre.includes('cultural') || nombre.includes('museo') || 
      nombre.includes('historia') || nombre.includes('tradici') || nombre.includes('patrimon') ||
      nombre.includes('arte') || nombre.includes('monumento') || nombre.includes('arqueolog')) {
    return 'cultura';
  }
  
  if (nombre.includes('naturaleza') || nombre.includes('natural') || nombre.includes('ecológ') || 
      nombre.includes('parque') || nombre.includes('reserva') || nombre.includes('fauna') ||
      nombre.includes('flora') || nombre.includes('bosque') || nombre.includes('montaña') ||
      nombre.includes('playa') || nombre.includes('lago') || nombre.includes('río')) {
    return 'naturaleza';
  }
  
  if (nombre.includes('compra') || nombre.includes('shopping') || nombre.includes('mercado') || 
      nombre.includes('artesanía') || nombre.includes('souvenir') || nombre.includes('tienda') ||
      nombre.includes('comercio') || nombre.includes('mall') || nombre.includes('centro comercial')) {
    return 'compras';
  }
  
  if (nombre.includes('evento') || nombre.includes('festival') || nombre.includes('celebraci') || 
      nombre.includes('ceremonia') || nombre.includes('congreso') || nombre.includes('conferencia') ||
      nombre.includes('feria') || nombre.includes('carnaval')) {
    return 'eventos';
  }
  
  if (nombre.includes('spa') || nombre.includes('bienestar') || nombre.includes('relax') || 
      nombre.includes('masaje') || nombre.includes('wellness') || nombre.includes('termal') ||
      nombre.includes('terapia') || nombre.includes('salud')) {
    return 'spa';
  }
  
  if (nombre.includes('deporte') || nombre.includes('deportiv') || nombre.includes('golf') || 
      nombre.includes('tenis') || nombre.includes('nataci') || nombre.includes('gimnasio') ||
      nombre.includes('fitness') || nombre.includes('surf') || nombre.includes('buceo') ||
      nombre.includes('pesca') || nombre.includes('esquí')) {
    return 'deportes';
  }
  
  if (nombre.includes('rural') || nombre.includes('campo') || nombre.includes('granja') || 
      nombre.includes('finca') || nombre.includes('agroturis') || nombre.includes('rancho') ||
      nombre.includes('estancia') || nombre.includes('hacienda')) {
    return 'rural';
  }
  
  if (nombre.includes('fotograf') || nombre.includes('foto') || nombre.includes('sesión') || 
      nombre.includes('album') || nombre.includes('recuerdo') || nombre.includes('imagen')) {
    return 'fotografia';
  }
  
  if (nombre.includes('servicio') || nombre.includes('asistencia') || nombre.includes('consultoría') || 
      nombre.includes('información') || nombre.includes('asesor') || nombre.includes('apoyo') ||
      nombre.includes('gestión') || nombre.includes('organización')) {
    return 'servicios';
  }
  
  // Retorna 'default' si no coincide con ninguna categoría
  return 'default';
}

}