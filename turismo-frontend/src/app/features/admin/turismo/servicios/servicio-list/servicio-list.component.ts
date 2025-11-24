import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Servicio, Categoria, PaginatedResponse, Emprendedor } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-servicio-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Servicios" 
      subtitle="Administra y gestiona los servicios de tu organización"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Gestión de Servicios</h1>
        <div class="mt-4 sm:mt-0">
          <a 
            routerLink="/admin/servicios/create" 
            class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Servicio
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
            <label for="emprendedor" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Emprendedor</label>
            <div class="mt-1">
              <select 
                id="emprendedor" 
                [(ngModel)]="selectedEmprendedorId" 
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option [ngValue]="null">Todos</option>
                @for (emprendedor of emprendedores; track emprendedor.id) {
                  <option [ngValue]="emprendedor.id">{{ emprendedor.nombre }}</option>
                }
              </select>
            </div>
          </div>
          
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
            <div class="mt-1">
              <select 
                id="categoria" 
                [(ngModel)]="selectedCategoriaId" 
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option [ngValue]="null">Todas</option>
                @for (categoria of categorias; track categoria.id) {
                  <option [ngValue]="categoria.id">{{ categoria.nombre }}</option>
                }
              </select>
            </div>
          </div>
          
          <div>
            <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <div class="mt-1">
              <select 
                id="estado" 
                [(ngModel)]="selectedEstado" 
                class="select-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option [ngValue]="null">Todos</option>
                <option [ngValue]="true">Activos</option>
                <option [ngValue]="false">Inactivos</option>
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
      
      <!-- Tabla de servicios -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
            <span class="ml-4 text-gray-900 dark:text-gray-200">Cargando servicios...</span>
          </div>
        } @else if (!pagination || pagination.data.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron servicios</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comience creando un nuevo servicio.</p>
            <div class="mt-6">
              <a routerLink="/admin/servicios/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Servicio
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                  <th scope="col" class="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Emprendedor</th>
                  <th scope="col" class="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categorías</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horarios</th>
                  <th scope="col" class="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                @for (servicio of pagination.data; track servicio.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ servicio.nombre }}</div>
                    </td>
                    <td class="hidden md:table-cell px-3 py-4">
                      <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{{ servicio.descripcion || 'Sin descripción' }}</div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">S/. {{ servicio.precio_referencial || '0.00' }}</div>
                    </td>
                    <td class="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">
                        @if (servicio.emprendedor) {
                          <a [routerLink]="['/admin/emprendedores', servicio.emprendedor_id, 'servicios']" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200">
                            {{ servicio.emprendedor.nombre }}
                          </a>
                        } @else {
                          <span class="text-gray-500 dark:text-gray-400">Sin emprendedor</span>
                        }
                      </div>
                    </td>
                    <td class="hidden lg:table-cell px-3 py-4">
                      <div class="flex flex-wrap gap-1">
                        @for (categoria of servicio.categorias; track categoria.id) {
                          <span class="inline-flex rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 text-xs font-medium text-primary-800 dark:text-primary-300 transition-colors duration-200">
                            {{ categoria.nombre }}
                          </span>
                        }
                        @if (!servicio.categorias || servicio.categorias.length === 0) {
                          <span class="text-sm text-gray-500 dark:text-gray-400">Sin categorías</span>
                        }
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      @if (servicio.estado) {
                        <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 transition-colors duration-200">
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        @if (servicio.horarios && servicio.horarios.length > 0) {
                          <div class="flex items-center">
                            <svg class="h-4 w-4 text-green-500 dark:text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{{ servicio.horarios.length }} {{ servicio.horarios.length === 1 ? 'horario' : 'horarios' }}</span>
                          </div>
                        } @else {
                          <div class="flex items-center">
                            <svg class="h-4 w-4 text-yellow-500 dark:text-yellow-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span>Sin horarios</span>
                          </div>
                        }
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-1 sm:space-x-2">
                        <a 
                          [routerLink]="['/admin/servicios/edit', servicio.id]" 
                          class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                          title="Editar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>
                        
                        <button 
                          (click)="toggleServicioEstado(servicio)" 
                          [class]="servicio.estado ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'"
                          [title]="servicio.estado ? 'Desactivar' : 'Activar'"
                          class="transition-colors duration-200"
                        >
                          @if (servicio.estado) {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                          } @else {
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          }
                        </button>
                        
                        <a 
                          [routerLink]="['/admin/reservas/servicio', servicio.id]" 
                          class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                          title="Ver reservas"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </a>
                        
                        <button 
                          (click)="deleteServicio(servicio)" 
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
export class ServicioListComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);
  
  pagination: PaginatedResponse<Servicio> | null = null;
  categorias: Categoria[] = [];
  emprendedores: Emprendedor[] = [];
  loading = true;
  
  // Filtros
  searchTerm = '';
  selectedCategoriaId: number | null = null;
  selectedEmprendedorId: number | null = null;
  selectedEstado: boolean | null = null;
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  
  ngOnInit() {
    this.loadCategorias();
    this.loadEmprendedores();
    this.loadServicios();
  }
  
  loadCategorias() {
    this.turismoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }
  
  loadEmprendedores() {
    this.turismoService.getEmprendedores(1, 100).subscribe({
      next: (response) => {
        this.emprendedores = response.data;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
      }
    });
  }
  
  loadServicios() {
    this.loading = true;
    
    // Preparar filtros
    const filters: any = {};
    
    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    
    if (this.selectedCategoriaId !== null) {
      filters.categoria_id = this.selectedCategoriaId;
    }
    
    if (this.selectedEmprendedorId !== null) {
      filters.emprendedor_id = this.selectedEmprendedorId;
    }
    
    if (this.selectedEstado !== null) {
      filters.estado = this.selectedEstado;
    }
    
    this.turismoService.getServicios(this.currentPage, this.itemsPerPage, filters).subscribe({
      next: (response) => {
        this.pagination = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.loading = false;
      }
    });
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadServicios();
  }
  isValidPageNumber(value: any): boolean {
    return !isNaN(+value);
  }
  
  toggleServicioEstado(servicio: Servicio) {
    if (!servicio.id) return;
    
    // Clonar el servicio para no mutar el original
    const servicioActualizado = {
      ...servicio,
      estado: !servicio.estado
    };
    
    this.turismoService.updateServicio(servicio.id, servicioActualizado).subscribe({
      next: (updated) => {
        // Actualizar el servicio en la lista
        if (this.pagination) {
          const index = this.pagination.data.findIndex(s => s.id === servicio.id);
          if (index !== -1) {
            this.pagination.data[index] = updated;
          }
        }
      },
      error: (error) => {
        console.error('Error al actualizar estado del servicio:', error);
        alert('Error al actualizar el estado del servicio. Por favor, intente nuevamente.');
      }
    });
  }
  
  deleteServicio(servicio: Servicio) {
    if (!servicio.id) return;
    
    if (confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"? Esta acción no se puede deshacer.`)) {
      this.turismoService.deleteServicio(servicio.id).subscribe({
        next: () => {
          // Recargar la lista después de eliminar
          this.loadServicios();
          alert('Servicio eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          alert('Error al eliminar el servicio. Por favor, intente nuevamente.');
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
    this.loadServicios();
  }

  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}