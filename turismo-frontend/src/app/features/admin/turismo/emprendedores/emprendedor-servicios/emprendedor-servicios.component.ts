import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TurismoService, Emprendedor, Servicio } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';
import { environment } from '../../../../../../environments/environments';

@Component({
  selector: 'app-emprendedor-servicios',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Servicios del emprendimiento" 
      subtitle="Administra y gestiona los servicios de cada emprendedor"
    ></app-admin-header>
    
    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Servicios de {{ emprendedor?.nombre }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200" *ngIf="emprendedor">
            Gestione los servicios que ofrece este emprendedor.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <a 
            routerLink="/admin/emprendedores" 
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
          
          <a 
            routerLink="/admin/servicios/create" 
            [queryParams]="{emprendedor_id: emprendedorId}"
            class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Servicio
          </a>
        </div>
      </div>
      
      <!-- Información del emprendedor -->
      @if (emprendedor) {
        <div class="mt-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div class="p-6">
            <div class="sm:flex sm:items-center">
              @if (emprendedor.imagenes && emprendedor.imagenes.length > 0) {
                <div class="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 sm:mr-6 transition-colors duration-200">
                  <img [src]="emprendedor.imagenes[0]" alt="Imagen de emprendedor" class="h-full w-full object-cover">
                </div>
              } @else if (emprendedor.sliders_principales && emprendedor.sliders_principales.length > 0) {
                <div class="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 sm:mr-6 transition-colors duration-200">
                  <img [src]="emprendedor.sliders_principales[0].url_completa" alt="Imagen de emprendedor" class="h-full w-full object-cover">
                </div>
              } @else {
                <div class="h-20 w-20 flex-shrink-0 rounded-md bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center sm:mr-6 transition-colors duration-200">
                  <span class="text-2xl text-primary-800 dark:text-primary-300 font-medium transition-colors duration-200">{{ getEmprendedorInitials() }}</span>
                </div>
              }
              
              <div class="mt-4 sm:mt-0">
                <div class="flex items-center">
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{{ emprendedor.nombre }}</h2>
                  <span class="ml-3 inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                    {{ emprendedor.categoria }}
                  </span>
                </div>
                <div class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{{ emprendedor.descripcion }}</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ emprendedor.ubicacion }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    {{ emprendedor.telefono }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      
      <!-- Lista de servicios -->
      <div class="mt-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
            <span class="ml-4 text-gray-900 dark:text-gray-200 transition-colors duration-200">Cargando servicios...</span>
          </div>
        } @else if (servicios.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No hay servicios</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Comience creando un nuevo servicio para este emprendedor.</p>
            <div class="mt-6">
              <a 
                routerLink="/admin/servicios/create" 
                [queryParams]="{emprendedor_id: emprendedorId}"
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
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
              <thead class="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Servicio</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Descripción</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 hidden md:table-cell">Precio</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200 hidden lg:table-cell">Categorías</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Estado</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                @for (servicio of servicios; track servicio.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                          @if (getServicioImage(servicio)) {
                            <img [src]="getServicioImage(servicio)" alt="Imagen de {{ servicio.nombre }}" class="h-full w-full object-cover">
                          } @else {
                            <div class="h-full w-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 transition-colors duration-200">
                              <span class="text-primary-800 dark:text-primary-300 font-medium transition-colors duration-200">{{ getServicioInitials(servicio) }}</span>
                            </div>
                          }
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ servicio.nombre }}</div>
                          @if (servicio.horarios && servicio.horarios.length > 0) {
                            <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                              <span class="flex items-center">
                                <svg class="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {{ formatHorarios(servicio.horarios) }}
                              </span>
                            </div>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs transition-colors duration-200">
                        {{ servicio.descripcion || 'Sin descripción' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                        S/. {{ servicio.precio_referencial || '0.00' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                      <div class="flex flex-wrap gap-1">
                        @for (categoria of servicio.categorias; track categoria.id) {
                          <span class="inline-flex rounded-full bg-primary-100 dark:bg-primary-900/40 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:text-primary-300 transition-colors duration-200">
                            {{ categoria.nombre }}
                          </span>
                        }
                        @if (!servicio.categorias || servicio.categorias.length === 0) {
                          <span class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Sin categorías</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (servicio.estado) {
                        <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 transition-colors duration-200">
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
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
                          [class]="servicio.estado ? 
                            'text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors duration-200' : 
                            'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200'"
                          [title]="servicio.estado ? 'Desactivar' : 'Activar'"
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
        }
      </div>
    </div>
  `,
})
export class EmprendedorServiciosComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly apiUrl = environment.apiUrl;

  emprendedorId: number | null = null;
  emprendedor: Emprendedor | null = null;
  servicios: Servicio[] = [];
  
  loading = true;
  error = '';
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.emprendedorId = +id;
      this.loadEmprendedor();
      this.loadServicios();
    } else {
      this.error = 'ID de emprendedor no válido';
      this.loading = false;
    }
  }
  
  loadEmprendedor() {
    if (!this.emprendedorId) return;
    
    this.turismoService.getEmprendedor(this.emprendedorId).subscribe({
      next: (emprendedor) => {
        this.emprendedor = emprendedor;
      },
      error: (error) => {
        console.error('Error al cargar emprendedor:', error);
        this.error = 'Error al cargar los datos del emprendedor.';
      }
    });
  }
  
  loadServicios() {
    if (!this.emprendedorId) return;
    
    this.loading = true;
    this.turismoService.getServiciosByEmprendedor(this.emprendedorId).subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.error = 'Error al cargar los servicios.';
        this.loading = false;
      }
    });
  }
  
  getEmprendedorInitials(): string {
    if (!this.emprendedor?.nombre) return '';
    
    const nameParts = this.emprendedor.nombre.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  getServicioInitials(servicio: Servicio): string {
    if (!servicio.nombre) return '';
    
    const nameParts = servicio.nombre.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  // Método para obtener la imagen del servicio
  getEmprendedorImage(emprendedor: Emprendedor): string | null {
    if (emprendedor.sliders_principales && emprendedor.sliders_principales.length > 0) {
      return emprendedor.sliders_principales[0].url_completa || null;
    }
    if (emprendedor.imagenes && emprendedor.imagenes.length > 0) {
      return emprendedor.imagenes[0];
    }
    return null;
  }

  // URL base para imágenes almacenadas
  getBaseStorageUrl(): string {
    // Extraer la base URL del API
    return `${this.apiUrl}/storage`;
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
        const index = this.servicios.findIndex(s => s.id === servicio.id);
        if (index !== -1) {
          this.servicios[index] = updated;
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
          // Actualizar la lista de servicios
          this.servicios = this.servicios.filter(s => s.id !== servicio.id);
          alert('Servicio eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          alert('Error al eliminar el servicio. Por favor, intente nuevamente.');
        }
      });
    }
  }
  
  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  getServicioImage(servicio: Servicio): string | null {
    // Primero verificamos si hay sliders
    if (servicio.sliders && servicio.sliders.length > 0) {
      return servicio.sliders[0].url_completa || null;
    }
    return null;
  }

  formatHorarios(horarios: any[]): string {
    if (!horarios || horarios.length === 0) return 'Sin horarios';
    
    // Ordenar los días de la semana
    const diasOrden = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const horarioActivo = horarios.filter(h => h.activo !== false).sort((a, b) => 
      diasOrden.indexOf(a.dia_semana.toLowerCase()) - diasOrden.indexOf(b.dia_semana.toLowerCase())
    );
    
    if (horarioActivo.length === 0) return 'Sin horarios activos';
    
    // Si hay muchos horarios, simplificar
    if (horarioActivo.length > 2) {
      const primerHorario = horarioActivo[0];
      return `${primerHorario.dia_semana} a ${horarioActivo[horarioActivo.length-1].dia_semana}: ${this.formatHora(primerHorario.hora_inicio)} - ${this.formatHora(primerHorario.hora_fin)}`;
    }
    
    // Mostrar horarios individuales
    return horarioActivo.map(h => 
      `${h.dia_semana}: ${this.formatHora(h.hora_inicio)} - ${this.formatHora(h.hora_fin)}`
    ).join(', ');
  }
  
  formatHora(hora: string): string {
    if (!hora) return '';
    const partes = hora.split(':');
    if (partes.length < 2) return hora;
    
    return `${partes[0]}:${partes[1]}`;
  }
}