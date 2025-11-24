import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TurismoService, Asociacion, Emprendedor } from '../../../../../core/services/turismo.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-asociacion-emprendedores',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Asociaciones" 
      subtitle="Administra y gestiona las asociaciones de tu organización"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Emprendedores de {{ asociacion?.nombre }}</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200" *ngIf="asociacion">
            Gestione los emprendedores que pertenecen a esta asociación.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <a 
            routerLink="/admin/asociaciones" 
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
          
          <a 
            routerLink="/admin/emprendedores/create" 
            [queryParams]="{asociacion_id: asociacionId}"
            class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Emprendedor
          </a>
        </div>
      </div>
      
      <!-- Lista de emprendedores -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-500 border-r-transparent"></div>
            <span class="ml-4 text-gray-700 dark:text-gray-200 transition-colors duration-200">Cargando emprendedores...</span>
          </div>
        } @else if (emprendedores.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No hay emprendedores</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Comience creando un nuevo emprendedor para esta asociación.</p>
            <div class="mt-6">
              <a 
                routerLink="/admin/emprendedores/create" 
                [queryParams]="{asociacion_id: asociacionId}"
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
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
              <thead class="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <tr>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Nombre</th>
                  <th scope="col" class="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Tipo de Servicio</th>
                  <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Ubicación</th>
                  <th scope="col" class="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Contacto</th>
                  <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Categoría</th>
                  <th scope="col" class="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                @for (emprendedor of emprendedores; track emprendedor.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <td class="px-3 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        @if (emprendedor.sliders_principales && emprendedor.sliders_principales.length > 0) {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                            <img [src]="emprendedor.sliders_principales[0].url_completa" alt="Imagen de emprendedor" class="h-full w-full object-cover">
                          </div>
                        } @else if (emprendedor.imagenes && emprendedor.imagenes.length > 0) {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 transition-colors duration-200">
                            <img [src]="emprendedor.imagenes[0]" alt="Imagen de emprendedor" class="h-full w-full object-cover">
                          </div>
                        } @else {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center transition-colors duration-200">
                            <span class="text-primary-800 dark:text-primary-300 font-medium transition-colors duration-200">{{ getEmprendedorInitials(emprendedor) }}</span>
                          </div>
                        }
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ emprendedor.nombre }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{{ emprendedor.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ emprendedor.tipo_servicio }}</div>
                    </td>
                    <td class="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{{ emprendedor.ubicacion }}</div>
                    </td>
                    <td class="hidden lg:table-cell px-3 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        <div>{{ emprendedor.telefono }}</div>
                        @if (emprendedor.pagina_web) {
                          <div class="truncate max-w-[150px]">{{ emprendedor.pagina_web }}</div>
                        }
                      </div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
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
        }
      </div>
    </div>
  `,
})
export class AsociacionEmprendedoresComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  asociacionId: number | null = null;
  asociacion: Asociacion | null = null;
  emprendedores: Emprendedor[] = [];
  
  loading = true;
  error = '';
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.asociacionId = +id;
      this.loadAsociacion();
      this.loadEmprendedores();
    } else {
      this.error = 'ID de asociación no válido';
      this.loading = false;
    }
  }
  
  loadAsociacion() {
    if (!this.asociacionId) return;
    
    this.turismoService.getAsociacion(this.asociacionId).subscribe({
      next: (asociacion) => {
        this.asociacion = asociacion;
      },
      error: (error) => {
        console.error('Error al cargar asociación:', error);
        this.error = 'Error al cargar los datos de la asociación.';
      }
    });
  }
  
  loadEmprendedores() {
    if (!this.asociacionId) return;
    
    this.loading = true;
    this.turismoService.getEmprendedoresByAsociacion(this.asociacionId).subscribe({
      next: (emprendedores) => {
        this.emprendedores = emprendedores;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
        this.error = 'Error al cargar los emprendedores.';
        this.loading = false;
      }
    });
  }
  
  getEmprendedorInitials(emprendedor: Emprendedor): string {
    if (!emprendedor.nombre) return '';
    
    const nameParts = emprendedor.nombre.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  deleteEmprendedor(emprendedor: Emprendedor) {
    if (!emprendedor.id) return;
    
    if (confirm(`¿Está seguro de eliminar el emprendedor "${emprendedor.nombre}"? Esta acción eliminará también todos los servicios relacionados y no se puede deshacer.`)) {
      this.turismoService.deleteEmprendedor(emprendedor.id).subscribe({
        next: () => {
          this.emprendedores = this.emprendedores.filter(e => e.id !== emprendedor.id);
          alert('Emprendedor eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar emprendedor:', error);
          alert('Error al eliminar el emprendedor. Por favor, intente nuevamente.');
        }
      });
    }
  }
}