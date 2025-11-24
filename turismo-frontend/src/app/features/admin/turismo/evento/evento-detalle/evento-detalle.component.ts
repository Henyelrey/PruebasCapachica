import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../evento.service';
import { Evento, Slider, Horario } from '../evento.model';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { UbicacionMapComponent } from '../../../../../shared/components/ubicacion-map/ubicacion-map.component';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent, UbicacionMapComponent],
  template: `
    <!-- Header con fondo profesional -->
    <app-admin-header 
      title="Detalle de Evento" 
      subtitle="Información completa del evento"
    ></app-admin-header>
    
    <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="space-y-6">
        <div class="sm:flex sm:items-center sm:justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ evento?.nombre || 'Cargando evento...' }}</h2>
          <div class="mt-4 sm:mt-0 flex space-x-3">
            <a 
              routerLink="/admin/evento" 
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver al listado
            </a>
            
            @if (evento?.id) {
              <a 
                [routerLink]="['/admin/evento/edit', evento?.id]" 
                class="inline-flex items-center rounded-md border border-transparent bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar evento
              </a>
            }
          </div>
        </div>
        
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
            <span class="ml-4 text-gray-700 dark:text-gray-300">Cargando datos del evento...</span>
          </div>
        } @else if (error) {
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
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Columna izquierda con información principal -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Imágenes del evento -->
              @if (evento?.sliders && (evento?.sliders?.length ?? 0) > 0) {
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                  <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Imágenes del evento</h3>
                    
                    <!-- Imagen principal grande -->
                    @if (getMainSlider()) {
                      <div class="mb-4 rounded-lg overflow-hidden h-80 bg-gray-100 dark:bg-gray-700">
                        <img [src]="getSliderImageUrl(getMainSlider())" [alt]="getMainSlider()?.titulo || evento?.nombre" class="w-full h-full object-cover">
                      </div>
                    }
                    
                    <!-- Grid de miniaturas -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      @for (slider of evento?.sliders; track $index) {
                        <div class="rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700">
                          <img [src]="getSliderImageUrl(slider)" [alt]="slider.titulo || 'Imagen ' + ($index + 1)" class="w-full h-full object-cover">
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
              
              <!-- Información principal -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del evento</h3>
                  
                  <div class="space-y-4">
                    <!-- Nombre y tipo -->
                    <div>
                      <h4 class="text-base font-medium text-gray-800 dark:text-gray-200">{{ evento?.nombre }}</h4>
                      <div class="mt-1 flex items-center">
                        <span class="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 transition-colors duration-200">
                          {{ evento?.tipo_evento || 'Tipo no especificado' }}
                        </span>
                        <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Idioma: {{ evento?.idioma_principal || 'No especificado' }}</span>
                      </div>
                    </div>
                    
                    <!-- Descripción -->
                    <div>
                      <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</h5>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ evento?.descripcion || 'No hay descripción disponible.' }}</p>
                    </div>
                    
                    <!-- Fechas -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha y hora de inicio</h5>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span class="inline-flex items-center">
                            <svg class="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {{ formatDate(evento?.fecha_inicio) }}
                          </span>
                          <span class="ml-3 inline-flex items-center">
                            <svg class="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{ evento?.hora_inicio || 'No especificada' }}
                          </span>
                        </p>
                      </div>
                      
                      <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha y hora de fin</h5>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span class="inline-flex items-center">
                            <svg class="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {{ formatDate(evento?.fecha_fin) }}
                          </span>
                          <span class="ml-3 inline-flex items-center">
                            <svg class="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {{ evento?.hora_fin || 'No especificada' }}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <!-- Duración -->
                    <div>
                      <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Duración</h5>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span class="inline-flex items-center">
                          <svg class="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {{ evento?.duracion_horas || '0' }} horas
                        </span>
                      </p>
                    </div>
                    
                    <!-- Qué llevar -->
                    @if (evento?.que_llevar) {
                      <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300">Qué llevar</h5>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ evento?.que_llevar }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
              
              <!-- Horarios específicos -->
              @if (evento?.horarios && (evento?.horarios?.length ?? 0) > 0) {
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                  <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Horarios específicos</h3>
                    
                    <div class="overflow-hidden">
                      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Día</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hora inicio</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hora fin</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          @for (horario of evento?.horarios; track $index) {
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ formatDiaSemana(horario.dia_semana) }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ horario.hora_inicio }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {{ horario.hora_fin }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                @if (horario.activo) {
                                  <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                                    Activo
                                  </span>
                                } @else {
                                  <span class="inline-flex rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 transition-colors duration-200">
                                    Inactivo
                                  </span>
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }
            </div>
            
            <!-- Columna derecha con información adicional -->
            <div class="space-y-6">
              <!-- Datos del emprendedor -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Datos del organizador</h3>
                  
                  <div class="space-y-3">
                    @if (evento?.emprendedor) {
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                          <svg class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ evento?.emprendedor.nombre || 'Nombre no disponible' }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ evento?.emprendedor.email || 'Email no disponible' }}</p>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg class="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">ID Emprendedor: {{ evento?.id_emprendedor || 'No especificado' }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">Datos del emprendedor no disponibles</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
              
              <!-- Sección de ubicación -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Ubicación</h3>
                  
                  @if (evento?.coordenada_x && evento?.coordenada_y) {
                    <div class="space-y-3">
                      <!-- Mapa interactivo -->
                      <div class="h-60 rounded-lg overflow-hidden">
                        <app-ubicacion-map
                          [latitud]="parseCoordinate(evento?.coordenada_x)"
                          [longitud]="parseCoordinate(evento?.coordenada_y)"
                          [readOnly]="true"
                        ></app-ubicacion-map>
                      </div>
                      
                      <!-- Detalles de ubicación -->
                      <div class="mt-3">
                        <div class="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Latitud</p>
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ evento?.coordenada_x }}</p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Longitud</p>
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ evento?.coordenada_y }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <p class="text-sm text-gray-500 dark:text-gray-400">No hay información de ubicación disponible para este evento.</p>
                  }
                </div>
              </div>
              
              <!-- Información técnica -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Información técnica</h3>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300">ID del evento</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ evento?.id }}</p>
                    </div>
                    <div>
                      <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300">Fecha de creación</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatFullDate(evento?.created_at) }}</p>
                    </div>
                    <div>
                      <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300">Última actualización</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ formatFullDate(evento?.updated_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Acciones -->
              <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Acciones</h3>
                  
                  <div class="space-y-3">
                    @if (evento?.id) {
                      <a 
                        [routerLink]="['/admin/evento/edit', evento?.id]" 
                        class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                      >
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Editar evento
                      </a>
                      
                      <button 
                        (click)="deleteEvento()"
                        class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Eliminar evento
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Estilos adicionales para el modo oscuro y efectos */
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
    
    :host-context(.dark-theme) {
      background-color: #111827;
    }
    
    /* Mejora para que el hover en dark mode sea más oscuro y no blanco */
    .dark .hover\\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
  `]
})
export class EventoDetalleComponent implements OnInit {
  private eventosService = inject(EventosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  
  evento: Evento | null = null;
  loading = true;
  error = '';
  

  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvento(+id);
    } else {
      this.error = 'ID de evento no proporcionado';
      this.loading = false;
    }
  }
  
  loadEvento(id: number) {
    this.loading = true;
    this.eventosService.getEvento(id).subscribe({
      next: (evento) => {
        this.evento = evento;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar evento:', error);
        this.error = 'Error al cargar los datos del evento. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }
  
  getMainSlider(): Slider | undefined {
    if (!this.evento?.sliders || this.evento.sliders.length === 0) {
      return undefined;
    }
    
    // Buscar slider marcado como principal
    const mainSlider = this.evento.sliders.find(s => s.es_principal);
    if (mainSlider) {
      return mainSlider;
    }
    
    // Si no hay principal, usar el primero
    return this.evento.sliders[0];
  }

  // Añadir este método para obtener la URL de la imagen
  getSliderImageUrl(slider?: Slider): string | null {
      if (!slider) return null;
      
      // Priorizar url_completa
      if (slider.url_completa) {
        return slider.url_completa;
      }
      
      if (typeof slider.imagen === 'string' && slider.imagen) {
        return slider.imagen;
      }
      
      if (slider.url_completa) {
        return slider.url_completa;
      }
      
      return null;
  }
  
  deleteEvento() {
    if (!this.evento?.id) return;
    
    if (confirm(`¿Estás seguro que deseas eliminar el evento "${this.evento.nombre}"? Esta acción no se puede deshacer.`)) {
      this.eventosService.deleteEvento(this.evento.id).subscribe({
        next: (message) => {
          alert(message);
          this.router.navigate(['/admin/evento']);
        },
        error: (error) => {
          console.error('Error al eliminar evento:', error);
          this.error = 'Error al eliminar el evento. Por favor, intente nuevamente.';
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
  
  formatFullDate(date?: string): string {
    if (!date) return 'No especificado';
    
    try {
      const formatDate = new Date(date);
      return formatDate.toLocaleString();
    } catch (e) {
      return date;
    }
  }
  parseCoordinate(coord: number | string | undefined): number | null {
    if (coord === undefined || coord === null) return null;
    try {
      return typeof coord === 'string' ? parseFloat(coord) : coord;
    } catch (e) {
      console.error('Error al convertir coordenada:', e);
      return null;
    }
  }
  formatDiaSemana(dia: string): string {
    const dias = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miercoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };
    
    return dias[dia as keyof typeof dias] || dia;
  }
}