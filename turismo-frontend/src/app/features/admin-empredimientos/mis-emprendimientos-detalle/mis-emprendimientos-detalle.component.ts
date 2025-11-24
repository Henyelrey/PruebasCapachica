import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EmprendimientoNavComponent } from '../../../shared/components/emprendimiento-nav/emprendimiento-nav.component';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

@Component({
  selector: 'app-mis-emprendimientos-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
      <!-- Contenido del detalle -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-orange-200/30 dark:border-blue-800/30 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-orange-400 dark:border-blue-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="backdrop-blur-lg bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/30 rounded-2xl p-6 mb-6 shadow-2xl">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-red-200">Error al cargar el emprendimiento</h3>
            <div class="mt-2 text-sm text-red-300">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button (click)="loadEmprendimiento()" 
                      class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="!loading && !error && emprendimiento" class="space-y-8">
        <!-- Header con imagen principal -->
        <div class="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl">
          <ng-container *ngIf="getMainImage(emprendimiento) as mainImage; else noImageHeader">
            <img [src]="mainImage" 
                 [alt]="emprendimiento.nombre" 
                 class="w-full h-full object-cover" />
          </ng-container>
          <ng-template #noImageHeader>
            <div class="w-full h-full bg-gradient-to-br from-gray-800/80 to-gray-900/90 dark:from-blue-800/80 dark:to-blue-900/90 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </ng-template>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex flex-wrap gap-3 mb-4">
              <span class="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/80 to-blue-400/80 text-white shadow-md backdrop-blur-sm">
                {{ emprendimiento.categoria }}
              </span>
              <span class="px-4 py-2 rounded-full text-sm font-semibold" 
                    [ngClass]="emprendimiento.estado ? 'bg-gradient-to-r from-green-500/80 to-green-400/80 text-white shadow-md backdrop-blur-sm' : 'bg-gradient-to-r from-red-500/80 to-red-400/80 text-white shadow-md backdrop-blur-sm'">
                {{ emprendimiento.estado ? 'Activo' : 'Inactivo' }}
              </span>
              <span class="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500/80 to-purple-400/80 text-white shadow-md backdrop-blur-sm">
                {{ getServiciosCount(emprendimiento) }} servicios
              </span>
              <span class="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-500/80 to-gray-400/80 text-white shadow-md backdrop-blur-sm">
                {{ getAdministradoresCount(emprendimiento) }} administradores
              </span>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
              {{ emprendimiento.nombre }}
            </h1>
            <p class="text-xl text-orange-300 dark:text-blue-300 font-semibold drop-shadow">
              {{ emprendimiento.tipo_servicio }}
            </p>
          </div>
        </div>

        <!-- Grid de información y acciones -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Información principal -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Descripción -->
            <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Descripción
              </h3>
              <p class="text-gray-200 dark:text-blue-200 leading-relaxed">
                {{ emprendimiento.descripcion }}
              </p>
            </div>

            <!-- Información de contacto -->
            <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Información de Contacto
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-400/20 dark:bg-blue-400/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 dark:text-blue-400">Teléfono</p>
                    <p class="text-white font-medium">{{ emprendimiento.telefono }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-400/20 dark:bg-blue-400/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 dark:text-blue-400">Email</p>
                    <p class="text-white font-medium">{{ emprendimiento.email }}</p>
                  </div>
                </div>
                <div *ngIf="emprendimiento.pagina_web" class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-400/20 dark:bg-blue-400/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400 dark:text-blue-400">Página Web</p>
                    <a [href]="emprendimiento.pagina_web" target="_blank" 
                       class="text-orange-400 dark:text-blue-400 font-medium hover:underline">
                      {{ emprendimiento.pagina_web }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Información Adicional
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngIf="emprendimiento.horario_atencion">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Horario de Atención</p>
                  <p class="text-white">{{ emprendimiento.horario_atencion }}</p>
                </div>
                <div *ngIf="emprendimiento.precio_rango">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Rango de Precios</p>
                  <p class="text-white">{{ emprendimiento.precio_rango }}</p>
                </div>
                <div *ngIf="emprendimiento.capacidad_aforo">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Capacidad de Aforo</p>
                  <p class="text-white">{{ emprendimiento.capacidad_aforo }} personas</p>
                </div>
                <div *ngIf="emprendimiento.numero_personas_atiende">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Personas que Atiende</p>
                  <p class="text-white">{{ emprendimiento.numero_personas_atiende }} personas</p>
                </div>
                <div *ngIf="emprendimiento.certificaciones">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Certificaciones</p>
                  <p class="text-white">{{ emprendimiento.certificaciones }}</p>
                </div>
                <div *ngIf="emprendimiento.idiomas_hablados">
                  <p class="text-sm text-gray-400 dark:text-blue-400 mb-1">Idiomas</p>
                  <p class="text-white">{{ emprendimiento.idiomas_hablados }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel de acciones -->
          <div class="space-y-6">
            <!-- Acciones principales -->
            <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Acciones Rápidas
              </h3>
              <div class="space-y-3">
                <button (click)="editarEmprendimiento()" 
                        class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 dark:from-blue-500 dark:to-blue-400 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-500 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar Información
                </button>
                <a [routerLink]="['/admin-emprendedores/emprendimiento', emprendimiento.id, 'servicios']"
                   class="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 text-white font-bold shadow-lg hover:from-purple-600 hover:to-purple-500 transition-all duration-300 active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Servicio
                </a>
              </div>
            </div>

            <!-- Estadísticas rápidas -->
            <div class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-white/5 dark:bg-blue-900/20 rounded-lg">
                  <span class="text-gray-300 dark:text-blue-300">Servicios Activos</span>
                  <span class="text-white font-bold text-lg">{{ getServiciosCount(emprendimiento) }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white/5 dark:bg-blue-900/20 rounded-lg">
                  <span class="text-gray-300 dark:text-blue-300">Administradores</span>
                  <span class="text-white font-bold text-lg">{{ getAdministradoresCount(emprendimiento) }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white/5 dark:bg-blue-900/20 rounded-lg">
                  <span class="text-gray-300 dark:text-blue-300">Estado</span>
                  <span class="font-bold text-lg" 
                        [ngClass]="emprendimiento.estado ? 'text-green-400' : 'text-red-400'">
                    {{ emprendimiento.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Galería de imágenes -->
            <div *ngIf="emprendimiento.sliders_secundarios && emprendimiento.sliders_secundarios.length > 0" 
                 class="backdrop-blur-lg bg-white/10 dark:bg-blue-800/20 rounded-2xl p-6 shadow-2xl border border-white/10 dark:border-blue-700/30">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-orange-400 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Galería
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <div *ngFor="let slider of emprendimiento.sliders_secundarios.slice(0, 4); let i = index" 
                     class="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                  <img [src]="slider.url_completa" 
                       [alt]="slider.nombre"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div *ngIf="i === 3 && emprendimiento.sliders_secundarios!.length > 4" 
                       class="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span class="text-white font-bold text-lg">+{{ emprendimiento.sliders_secundarios!.length - 4 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  `
})
export class MisEmprendimientoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emprendimientoService = inject(EmprendimientoAdminService);
  
  emprendimiento?: Emprendimiento;
  loading = true;
  error = '';
  emprendimientoId!: number;

  ngOnInit(): void {
    this.emprendimientoId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEmprendimiento();
  }

  loadEmprendimiento(): void {
    this.loading = true;
    this.error = '';
    
    this.emprendimientoService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  editarEmprendimiento(): void {
    if (this.emprendimiento) {
      // Navega a la ruta de edición del emprendimiento dentro del layout admin
      this.router.navigate(['/admin-emprendedores/emprendimiento', this.emprendimiento.id, 'mis-emprendimientos', this.emprendimiento.id]);
    }
  }

  getMainImage(emprendimiento: Emprendimiento): string | null {
    if (emprendimiento.sliders_principales?.length) {
      return emprendimiento.sliders_principales[0].url_completa || null;
    }
    return null;
  }

  getServiciosCount(emprendimiento: Emprendimiento): number {
    return emprendimiento.servicios?.length || 0;
  }

  getAdministradoresCount(emprendimiento: Emprendimiento): number {
    return emprendimiento.administradores?.length || 0;
  }
}