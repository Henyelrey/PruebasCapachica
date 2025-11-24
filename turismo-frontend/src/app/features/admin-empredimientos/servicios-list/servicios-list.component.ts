import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento, Servicio } from '../../../core/models/emprendimiento-admin.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Loading state glassmorphism -->
    <div *ngIf="loading && servicios.length === 0" class="flex items-center justify-center h-64">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Main content glassmorphism -->
    <div *ngIf="!loading || servicios.length > 0" class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Servicios
          </h1>
          <p class="text-slate-300 dark:text-slate-400 mt-1">
            Administra los servicios que ofreces en {{ emprendimiento?.nombre || 'tu emprendimiento' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a [routerLink]="['nuevo']"
             class="group flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 hover:shadow-xl">
            <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Nuevo Servicio</span>
          </a>
          <button (click)="refreshData()" 
                  [disabled]="loading"
                  class="group flex items-center px-4 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 disabled:opacity-50">
            <svg *ngIf="!loading" class="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <div *ngIf="loading" class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span class="font-medium">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Search and Filters glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label for="search" class="block text-sm font-medium text-slate-300">
              Buscar servicios
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                id="search"
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Nombre del servicio..."
                class="block w-full pl-10 pr-3 py-3 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
            </div>
          </div>
          
          <div class="space-y-2">
            <label for="estado" class="block text-sm font-medium text-slate-300">
              Estado
            </label>
            <select
              id="estado"
              [(ngModel)]="filtroEstado"
              (change)="applyFilters()"
              class="block w-full px-3 py-3 border border-slate-600/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300">
              <option value="" class="bg-slate-800 text-white">Todos</option>
              <option value="true" class="bg-slate-800 text-white">Activos</option>
              <option value="false" class="bg-slate-800 text-white">Inactivos</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="w-full px-4 py-3 border border-white/20 dark:border-slate-600/50 rounded-xl text-sm font-medium text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Error state glassmorphism -->
      <div *ngIf="error" class="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-red-200 font-semibold">Error al cargar los servicios</h3>
            <p class="text-red-300 text-sm">{{ error }}</p>
            <button (click)="loadServicios()" 
                    class="mt-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium">
              Reintentar
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State glassmorphism -->
      <div *ngIf="!loading && !error && servicios.length === 0" class="text-center py-16">
        <svg class="mx-auto h-20 w-20 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h3 class="text-xl font-semibold text-white mb-2">No hay servicios</h3>
        <p class="text-slate-300 dark:text-slate-400 mb-6">
          Comienza creando tu primer servicio para este emprendimiento.
        </p>
        <a [routerLink]="['nuevo']"
           class="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Crear primer servicio
        </a>
      </div>

      <!-- Services Grid glassmorphism -->
      <div *ngIf="!loading && !error && filteredServicios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let servicio of filteredServicios" 
             class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden hover:shadow-2xl hover:bg-white/15 dark:hover:bg-slate-700/50 transition-all duration-300 group">
          
          <!-- Service Image -->
          <div class="relative h-48 overflow-hidden">
            <ng-container *ngIf="getServiceImage(servicio) as imageUrl; else noImageTemplate">
              <img [src]="imageUrl" 
                   [alt]="servicio.nombre" 
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </ng-container>
            <ng-template #noImageTemplate>
              <div class="w-full h-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 flex items-center justify-center">
                <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </ng-template>
            
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                    [ngClass]="{
                      'bg-green-500/20 text-green-300 border-green-400/30': servicio.estado,
                      'bg-red-500/20 text-red-300 border-red-400/30': !servicio.estado
                    }">
                <div class="w-1.5 h-1.5 rounded-full mr-1"
                     [ngClass]="{
                       'bg-green-400': servicio.estado,
                       'bg-red-400': !servicio.estado
                     }"></div>
                {{ servicio.estado ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>

          <!-- Service Content -->
          <div class="p-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors duration-300">
                {{ servicio.nombre }}
              </h3>
              <p class="text-slate-300 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                {{ servicio.descripcion }}
              </p>
            </div>
            
            <!-- Price -->
            <div class="mb-4 p-3 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-xl">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-green-300">
                  S/ {{ servicio.precio_referencial | number:'1.2-2' }}
                </span>
                <span class="text-xs text-slate-400">
                  precio referencial
                </span>
              </div>
            </div>

            <!-- Location -->
            <div *ngIf="servicio.ubicacion_referencia" class="flex items-center text-sm text-slate-300 mb-4 p-2 bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 rounded-lg">
              <svg class="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">{{ servicio.ubicacion_referencia }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <a [routerLink]="['/admin-emprendedores/emprendimiento', emprendimientoId, 'servicios', servicio.id]"
                 class="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl group">
                <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </a>
              
              <button (click)="toggleServicioEstado(servicio)"
                      [disabled]="servicio.updating"
                      class="flex items-center justify-center px-4 py-2.5 rounded-xl border border-white/20 dark:border-slate-600/50 text-slate-300 bg-white/10 dark:bg-slate-800/30 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="servicio.updating" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <svg *ngIf="!servicio.updating && servicio.estado" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg *ngIf="!servicio.updating && !servicio.estado" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm">
                  {{ servicio.updating ? 'Actualizando...' : (servicio.estado ? 'Desactivar' : 'Activar') }}
                </span>
              </button>
              
              <button (click)="deleteServicio(servicio)"
                      [disabled]="servicio.deleting"
                      class="flex items-center justify-center p-2.5 rounded-xl text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group">
                <svg *ngIf="servicio.deleting" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <svg *ngIf="!servicio.deleting" class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results glassmorphism -->
      <div *ngIf="!loading && !error && servicios.length > 0 && filteredServicios.length === 0" 
           class="text-center py-16">
        <svg class="mx-auto h-16 w-16 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h3 class="text-lg font-semibold text-white mb-2">No se encontraron servicios</h3>
        <p class="text-slate-300 dark:text-slate-400 mb-6">
          Intenta ajustar los filtros de búsqueda.
        </p>
        <button (click)="clearFilters()"
                class="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold hover:from-orange-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl">
          Limpiar filtros
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }
    
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    
    .line-clamp-3 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  `]
})
export class ServiciosListComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  servicios: (Servicio & { updating?: boolean; deleting?: boolean })[] = [];
  filteredServicios: (Servicio & { updating?: boolean; deleting?: boolean })[] = [];
  loading = true;
  error = '';

  // Filtros
  searchTerm = '';
  filtroEstado = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Servicios - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadData();
      } else {
        console.error('Servicios - ID inválido:', id);
        this.error = 'ID de emprendimiento inválido';
      }
    });
  }

  private loadData(): void {
    this.loadEmprendimiento();
    this.loadServicios();
  }

  private loadEmprendimiento(): void {
    this.emprendimientoAdminService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
      }
    });
  }

  loadServicios(): void {
    console.log('Servicios - Cargando servicios para emprendimiento:', this.emprendimientoId); // Debug
    this.loading = true;
    this.error = '';

    this.emprendimientoAdminService.getServicios(this.emprendimientoId).subscribe({
      next: (data) => {
        console.log('Servicios - Servicios cargados:', data); // Debug
        this.servicios = data.map(servicio => ({ ...servicio, updating: false, deleting: false }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error = err.error?.message || 'Error al cargar los servicios';
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadServicios();
  }

  applyFilters(): void {
    let filtered = [...this.servicios];

    // Filtro por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(servicio =>
        servicio.nombre.toLowerCase().includes(term) ||
        servicio.descripcion.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== '') {
      const estado = this.filtroEstado === 'true';
      filtered = filtered.filter(servicio => servicio.estado === estado);
    }

    this.filteredServicios = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.applyFilters();
  }

  getServiceImage(servicio: Servicio): string | null {
    if (servicio.sliders && servicio.sliders.length > 0) {
      return servicio.sliders[0].url_completa || servicio.sliders[0].url || null;
    }
    return null;
  }

  async toggleServicioEstado(servicio: Servicio & { updating?: boolean }): Promise<void> {
    if (servicio.updating || !servicio.id) return;

    const confirmMessage = servicio.estado 
      ? '¿Estás seguro de que quieres desactivar este servicio?' 
      : '¿Estás seguro de que quieres activar este servicio?';

    if (!confirm(confirmMessage)) return;

    servicio.updating = true;

    try {
      const updatedServicio = await this.emprendimientoAdminService.updateServicio(
        servicio.id,
        { ...servicio, estado: !servicio.estado }
      ).toPromise();

      if (updatedServicio) {
        // Actualizar el servicio en la lista
        const index = this.servicios.findIndex(s => s.id === servicio.id);
        if (index !== -1) {
          this.servicios[index] = { ...updatedServicio, updating: false, deleting: false };
          this.applyFilters();
        }

        // Mostrar mensaje de éxito
        const actionText = updatedServicio.estado ? 'activado' : 'desactivado';
        this.notificationService.success("Éxito",`Servicio ${actionText} correctamente`);
      }
    } catch (err: any) {
      console.error('Error al actualizar servicio:', err);
      this.notificationService.error(err.error?.message || 'Error al actualizar el servicio');
    } finally {
      servicio.updating = false;
    }
  }

  async deleteServicio(servicio: Servicio & { deleting?: boolean }): Promise<void> {
    if (servicio.deleting || !servicio.id) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar el servicio "${servicio.nombre}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) return;

    servicio.deleting = true;

    try {
      await this.emprendimientoAdminService.deleteServicio(servicio.id).toPromise();
      
      // Remover el servicio de la lista
      this.servicios = this.servicios.filter(s => s.id !== servicio.id);
      this.applyFilters();
      
      // Mostrar mensaje de éxito
      alert('Servicio eliminado correctamente');
    } catch (err: any) {
      console.error('Error al eliminar servicio:', err);
      alert(err.error?.message || 'Error al eliminar el servicio');
      servicio.deleting = false;
    }
  }
}