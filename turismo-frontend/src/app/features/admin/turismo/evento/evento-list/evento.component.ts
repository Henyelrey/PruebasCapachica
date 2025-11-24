import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../evento.service';
import { Evento } from '../evento.model';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <!-- Header con fondo profesional -->
    <app-admin-header 
      title="Gestión de Eventos" 
      subtitle="Administra los eventos del sistema"
    ></app-admin-header>
    
    <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Listado de Eventos</h2>
          <div class="mt-4 sm:mt-0">
            <a 
              routerLink="/admin/evento/create" 
              class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Evento
            </a>
          </div>
        </div>
        
        <!-- Filtros -->
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md transition-colors duration-200 border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
              <div class="mt-1">
                <input 
                  type="text" 
                  id="search" 
                  [(ngModel)]="search" 
                  placeholder="Nombre del evento" 
                  class="input-estilo block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
              </div>
            </div>
            
            <div>
              <label for="filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por</label>
              <div class="mt-1">
                <select 
                  id="filter" 
                  [(ngModel)]="filter" 
                  class="select-estilo block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                >
                  <option value="all">Todos</option>
                  <option value="active">Eventos Activos</option>
                  <option value="upcoming">Próximos Eventos</option>
                </select>
              </div>
            </div>
            
            <div class="flex items-end">
              <button 
                type="button" 
                (click)="applyFilters()" 
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Filtrar
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tabla de eventos -->
        <div class="rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
          @if (loading) {
            <div class="flex justify-center items-center p-8">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
              <span class="ml-4 text-gray-900 dark:text-gray-200">Cargando eventos...</span>
            </div>
          } @else if (eventos.length === 0) {
            <div class="p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron eventos</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando un nuevo evento.</p>
              <div class="mt-6">
                <a routerLink="/admin/evento/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200">
                  <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Nuevo Evento
                </a>
              </div>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Evento</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fechas</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duración</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  @for (evento of eventos; track evento.id) {
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0 rounded bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center overflow-hidden">
                            @if (evento.sliders && evento.sliders.length > 0 && evento.sliders[0].imagen) {
                              <img [src]="evento.sliders[0].imagen" [alt]="evento.nombre" class="h-10 w-10 object-cover">
                            } @else {
                              <svg class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            }
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{ evento.nombre }}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                              {{ evento.idioma_principal || 'No especificado' }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ evento.tipo_evento || 'No especificado' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>Inicio: {{ formatDate(evento.fecha_inicio) }} {{ evento.hora_inicio }}</div>
                        <div>Fin: {{ formatDate(evento.fecha_fin) }} {{ evento.hora_fin }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ evento.duracion_horas }} horas
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                          <a 
                            [routerLink]="['/admin/evento/edit', evento.id]" 
                            class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                            title="Editar"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </a>
                          <a 
                            [routerLink]="['/admin/evento', evento.id]" 
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </a>
                          <button 
                            (click)="deleteEvento(evento)" 
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
              <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 sm:px-6">
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
                    </p>
                  </div>
                  <div>
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
                        @if (link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;') {
                          <button
                            (click)="goToPage(+link.label)"
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium transition-colors duration-200"
                            [class.bg-primary-50]="link.active && !isDarkMode()"
                            [class.dark:bg-primary-900]="link.active && isDarkMode()"
                            [class.text-primary-600]="link.active && !isDarkMode()"
                            [class.dark:text-primary-300]="link.active && isDarkMode()"
                            [class.text-gray-700]="!link.active && !isDarkMode()"
                            [class.dark:text-gray-300]="!link.active && isDarkMode()"
                            [class.hover:bg-gray-50]="!link.active && !isDarkMode()"
                            [class.dark:hover:bg-gray-650]="!link.active && isDarkMode()"
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
    </div>
  `,
  styles: [`
    /* Estilos globales para el componente */
    :host {
      display: block;
    }
    
    /* Fixes específicos para Tailwind con dark mode */
    :host ::ng-deep .dark .bg-primary-50 {
      background-color: rgba(79, 70, 229, 0.1) !important;
    }
    
    :host ::ng-deep .dark .dark\\:bg-primary-900\\/40 {
      background-color: rgba(79, 70, 229, 0.4) !important;
    }
    
    :host ::ng-deep .dark .hover\\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
    
    /* Clase personalizada para el hover en paginación para dark mode */
    :host ::ng-deep .dark .dark\\:hover\\:bg-gray-650:hover {
      background-color: #374151 !important;
    }
  `]
})
export class EventoListComponent implements OnInit {
  private eventosService = inject(EventosService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  
  eventos: Evento[] = [];
  loading = true;
  
  
  pagination: any = null;
  currentPage = 1;
  itemsPerPage = 10;
  
  search = '';
  filter = 'all';
  
  ngOnInit() {
    this.loadEventos();
  }
  
  loadEventos() {
    this.loading = true;
    
    if (this.filter === 'active') {
      this.loadActiveEventos();
    } else if (this.filter === 'upcoming') {
      this.loadUpcomingEventos();
    } else {
      this.loadAllEventos();
    }
  }
  
  loadAllEventos() {
    this.eventosService.getEventos(this.currentPage, this.itemsPerPage, this.search).subscribe({
      next: (response) => {
        this.eventos = response.data;
        this.pagination = {
          current_page: response.current_page,
          from: response.from,
          to: response.to,
          total: response.total,
          last_page: response.last_page,
          links: response.links,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.loading = false;
      }
    });
  }
  
  loadActiveEventos() {
    this.eventosService.getEventosActivos().subscribe({
      next: (events) => {
        this.eventos = events;
        this.pagination = null; // No hay paginación para estas llamadas
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar eventos activos:', error);
        this.loading = false;
      }
    });
  }
  
  loadUpcomingEventos() {
    this.eventosService.getEventosProximos().subscribe({
      next: (events) => {
        this.eventos = events;
        this.pagination = null; // No hay paginación para estas llamadas
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar próximos eventos:', error);
        this.loading = false;
      }
    });
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadEventos();
  }
  getEventoImagen(evento: Evento): string | null {
    if (!evento.sliders || evento.sliders.length === 0) {
        return null;
    }
    
    // Intentar obtener slider principal
    const mainSlider = evento.sliders.find(s => s.es_principal);
    
    if (mainSlider) {
        // Priorizar url_completa
        return mainSlider.url_completa || 
            (typeof mainSlider.imagen === 'string' ? mainSlider.imagen : null);
    }
    
    // Si no hay principal, usar el primero
    const firstSlider = evento.sliders[0];
    
    // Priorizar url_completa
    return firstSlider.url_completa || 
            (typeof firstSlider.imagen === 'string' ? firstSlider.imagen : null);
    }
  
  goToPage(page: number) {
    if (page < 1 || (this.pagination && page > this.pagination.last_page)) {
      return;
    }
    
    this.currentPage = page;
    this.loadEventos();
  }
  
  deleteEvento(evento: Evento) {
    if (!evento.id) return;
    
    if (confirm(`¿Estás seguro que deseas eliminar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eventosService.deleteEvento(evento.id).subscribe({
        next: (message) => {
          alert(message);
          // Recargar la lista de eventos
          this.loadEventos();
        },
        error: (error) => {
          console.error('Error al eliminar evento:', error);
          alert('Error al eliminar el evento. Por favor, intente nuevamente.');
        }
      });
    }
  }
  
  formatDate(date?: string): string {
    if (!date) return 'No especificado';
    
    try {
      const formatDate = new Date(date);
      return formatDate.toLocaleDateString();
    } catch (e) {
      return date;
    }
  }
  
  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}