import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Emprendedor, PaginatedResponse } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-emprendedor-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Emprendedores" 
      subtitle="Administra y gestiona los emprendedores de tu organización"
    ></app-admin-header>
    
    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gestión de Emprendedores</h1>
        <div class="mt-4 sm:mt-0">
          <a 
            routerLink="/admin/emprendedores/create" 
            class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Emprendedor
          </a>
        </div>
      </div>
      
      <!-- Filtros -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-colors duration-200 mb-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
            <div class="mt-1">
              <input 
                type="text" 
                id="search" 
                [(ngModel)]="searchTerm" 
                placeholder="Nombre o descripción" 
                class="input-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
            </div>
          </div>
          
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
            <div class="mt-1">
              <select 
                id="categoria" 
                [(ngModel)]="selectedCategoria" 
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="">Todas</option>
                <option value="Artesanía">Artesanía</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Alojamiento">Alojamiento</option>
                <option value="Guía">Guía</option>
                <option value="Transporte">Transporte</option>
                <option value="Actividades">Actividades</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          
          <div>
            <label for="asociacion_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Asociación</label>
            <div class="mt-1">
              <select 
                id="asociacion_id" 
                [(ngModel)]="selectedAsociacionId" 
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option [ngValue]="null">Todas</option>
                <option [ngValue]="0">Sin asociación</option>
                @for (asociacion of asociaciones; track asociacion.id) {
                  <option [ngValue]="asociacion.id">{{ asociacion.nombre }}</option>
                }
              </select>
            </div>
          </div>
          
          <div class="flex items-end">
            <button 
              type="button" 
              (click)="applyFilters()" 
              class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filtrar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tabla de emprendedores -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
            <span class="ml-4 text-gray-900 dark:text-gray-200">Cargando emprendedores...</span>
          </div>
        } @else if (!pagination || pagination.data.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron emprendedores</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comience creando un nuevo emprendedor.</p>
            <div class="mt-6">
              <a routerLink="/admin/emprendedores/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Emprendedor
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Emprendedor</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo de Servicio</th>
                  <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" class="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asociación</th>
                  <th scope="col" class="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th scope="col" class="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                @for (emprendedor of pagination.data; track emprendedor.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                          @if (getEmprendedorImage(emprendedor)) {
                            <img [src]="getEmprendedorImage(emprendedor)" alt="Imagen de {{ emprendedor.nombre }}" class="h-full w-full object-cover">
                          } @else {
                            <div class="h-full w-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/40">
                              <span class="text-primary-800 dark:text-primary-300 font-medium">{{ getEmprendedorInitials(emprendedor) }}</span>
                            </div>
                          }
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ emprendedor.nombre }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ emprendedor.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ emprendedor.tipo_servicio }}</div>
                    </td>
                    <td class="hidden md:table-cell px-3 py-4">
                      <div class="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{{ emprendedor.ubicacion }}</div>
                    </td>
                    <td class="hidden lg:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">
                        @if (emprendedor.asociacion) {
                          {{ emprendedor.asociacion.nombre }}
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400">Sin asociación</span>
                        }
                      </div>
                    </td>
                    <td class="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                      <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                        {{ emprendedor.categoria }}
                      </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-1 sm:space-x-2">
                        <a 
                          [routerLink]="['/admin/emprendedores/edit', emprendedor.id]" 
                          class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                          title="Editar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>
                        
                        <a 
                          [routerLink]="['/admin/emprendedores', emprendedor.id, 'servicios']" 
                          class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200"
                          title="Ver servicios"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                          </svg>
                        </a>
                        
                        <a 
                          [routerLink]="['/admin/emprendedores', emprendedor.id, 'asignaradministrador']" 
                          class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                          title="Asignar administrador"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </a>
                        
                        <a 
                          [routerLink]="['/admin/reservas/emprendedor', emprendedor.id]" 
                          class="hidden sm:inline-block text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors duration-200"
                          title="Ver reservas"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </a>
                        
                        <button 
                          (click)="deleteEmprendedor(emprendedor)" 
                          class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                          title="Eliminar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          @if (pagination) {
            <div class="bg-white dark:bg-gray-800 px-3 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 sm:px-4">
              <div class="flex sm:flex-1 sm:flex sm:items-center sm:justify-between flex-col sm:flex-row">
                <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
                  </p>
                </div>
                <div class="mt-2 sm:mt-0">
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      (click)="goToPage(currentPage - 1)"
                      [disabled]="!pagination.prev_page_url"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-200"
                      [class.opacity-50]="!pagination.prev_page_url"
                      [class.cursor-not-allowed]="!pagination.prev_page_url"
                    >
                      <span class="sr-only">Anterior</span>
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    
                    @for (link of pagination.links; track $index) {
                      @if (link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;' && isValidPageNumber(link.label)) {
                        <button
                          (click)="goToPage(+link.label)"
                          class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium transition-colors duration-200"
                          [ngClass]="{
                            'bg-primary-50': link.active && !isDarkMode(),
                            'dark:bg-primary-900/40': link.active && isDarkMode(),
                            'text-primary-600': link.active && !isDarkMode(),
                            'dark:text-primary-300': link.active && isDarkMode(),
                            'text-gray-700': !link.active && !isDarkMode(),
                            'dark:text-gray-300': !link.active && isDarkMode(),
                            'hover:bg-gray-50': !link.active && !isDarkMode(),
                            'dark:hover:bg-gray-650': !link.active && isDarkMode()
                          }"
                          [disabled]="link.active"
                        >
                          {{ link.label }}
                        </button>
                      }
                    }
                    
                    <button
                      (click)="goToPage(currentPage + 1)"
                      [disabled]="!pagination.next_page_url"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-200"
                      [class.opacity-50]="!pagination.next_page_url"
                      [class.cursor-not-allowed]="!pagination.next_page_url"
                    >
                      <span class="sr-only">Siguiente</span>
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class EmprendedorListComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);
  
  pagination: PaginatedResponse<Emprendedor> | null = null;
  asociaciones: any[] = [];
  loading = true;
  
  // Filtros
  searchTerm = '';
  selectedCategoria = '';
  selectedAsociacionId: number | null = null;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  
  ngOnInit() {
    this.loadAsociaciones();
    this.loadEmprendedores();
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
  
  loadEmprendedores() {
    this.loading = true;
    
    this.turismoService.getEmprendedores(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.pagination = response;
        this.loading = false;
        
        // Filtramos los resultados en el cliente si hay filtros activos
        if (this.searchTerm || this.selectedCategoria || this.selectedAsociacionId !== null) {
          this.filterResultsLocally();
        }
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
        this.loading = false;
      }
    });
  }
  
  // Método para obtener la imagen del emprendedor
  getEmprendedorImage(emprendedor: Emprendedor): string | null {
    // Primero verificamos si hay sliders principales
    if (emprendedor.sliders_principales && emprendedor.sliders_principales.length > 0) {
      return emprendedor.sliders_principales[0].url_completa || null;
    }
    
    // Luego verificamos las imágenes
    if (emprendedor.imagenes) {
      // Puede ser un string o un array
      if (typeof emprendedor.imagenes === 'string') {
        try {
          // Intentar parsear como JSON (formato "[\"imagen1.jpg\",\"imagen2.jpg\"]")
          const imgArray = JSON.parse(emprendedor.imagenes);
          if (Array.isArray(imgArray) && imgArray.length > 0) {
            // Si es una ruta relativa, asumimos que necesita prefijo
            if (imgArray[0].startsWith('http')) {
              return imgArray[0];
            } else {
              // Agregar prefijo de la URL base de imágenes
              return `${this.getBaseStorageUrl()}/${imgArray[0]}`;
            }
          }
        } catch (e) {
          // Si no se puede parsear, usar el string directamente
          return emprendedor.imagenes;
        }
      } else if (Array.isArray(emprendedor.imagenes) && emprendedor.imagenes.length > 0) {
        return emprendedor.imagenes[0];
      }
    }
    
    return null;
  }
  
  // URL base para imágenes almacenadas
  getBaseStorageUrl(): string {
    // Extraer la base URL del API
    const apiUrl = this.turismoService['API_URL'] || 'http://127.0.0.1:8000';
    return `${apiUrl}/storage`;
  }
  
  // Método para filtrar resultados localmente
  filterResultsLocally() {
    if (!this.pagination || !this.pagination.data) return;
    
    // Hacemos una copia de los datos originales
    const originalData = [...this.pagination.data];
    
    // Filtramos según los criterios
    let filteredData = originalData;
    
    // Filtro por término de búsqueda
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(emp => 
        emp.nombre?.toLowerCase().includes(searchLower) || 
        emp.descripcion?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por categoría
    if (this.selectedCategoria) {
      filteredData = filteredData.filter(emp => 
        emp.categoria === this.selectedCategoria
      );
    }
    
    // Filtro por asociación
    if (this.selectedAsociacionId !== null) {
      if (this.selectedAsociacionId === 0) {
        // Sin asociación
        filteredData = filteredData.filter(emp => !emp.asociacion_id);
      } else {
        // Con la asociación específica
        filteredData = filteredData.filter(emp => 
          emp.asociacion_id === this.selectedAsociacionId
        );
      }
    }
    
    // Actualizamos los datos filtrados
    if (this.pagination) {
      this.pagination = {
        ...this.pagination,
        data: filteredData,
        total: filteredData.length,
        from: filteredData.length > 0 ? 1 : 0,
        to: filteredData.length
      };
    }
  }
  
  getEmprendedorInitials(emprendedor: Emprendedor): string {
    if (!emprendedor.nombre) return '';
    
    const nameParts = emprendedor.nombre.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadEmprendedores();
  }
  
  deleteEmprendedor(emprendedor: Emprendedor) {
    if (!emprendedor.id) return;
    
    if (confirm(`¿Está seguro de eliminar el emprendedor "${emprendedor.nombre}"? Esta acción eliminará también todos los servicios relacionados y no se puede deshacer.`)) {
      this.turismoService.deleteEmprendedor(emprendedor.id).subscribe({
        next: () => {
          // Recargar la lista después de eliminar
          this.loadEmprendedores();
          alert('Emprendedor eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar emprendedor:', error);
          alert('Error al eliminar el emprendedor. Por favor, intente nuevamente.');
        }
      });
    }
  }
  
  goToPage(page: number) {
    if (!this.pagination) return;
    
    if (page < 1 || page > this.pagination.last_page) {
      return;
    }
    
    this.currentPage = page;
    this.loadEmprendedores();
  }
  
  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  isValidPageNumber(value: any): boolean {
    return !isNaN(+value);
  }
}