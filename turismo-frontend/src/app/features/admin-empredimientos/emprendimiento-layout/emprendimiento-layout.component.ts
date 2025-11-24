// src/app/features/admin-emprendedores/emprendimiento-layout/emprendimiento-layout.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { EmprendimientoNavComponent } from '../../../shared/components/emprendimiento-nav/emprendimiento-nav.component';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento } from '../../../core/models/emprendimiento-admin.model';

@Component({
  selector: 'app-emprendimiento-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, EmprendimientoNavComponent],
  template: `
    <!-- Loading State -->
    <div *ngIf="loading" class="min-h-screen relative">
      <div class="absolute inset-0 bg-[url('https://consultasenlinea.mincetur.gob.pe/fichaInventario/foto.aspx?cod=471157')] bg-cover bg-center bg-no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950/98 via-slate-900/96 to-slate-950/98 backdrop-blur-sm"></div>
      </div>
      <div class="relative flex justify-center items-center py-20">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="min-h-screen relative">
      <div class="absolute inset-0 bg-[url('https://consultasenlinea.mincetur.gob.pe/fichaInventario/foto.aspx?cod=471157')] bg-cover bg-center bg-no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-950/98 via-slate-900/96 to-slate-950/98 backdrop-blur-sm"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="backdrop-blur-lg bg-red-500/10 border border-red-500/20 rounded-2xl p-6 shadow-2xl">
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
              <div class="mt-4 flex gap-3">
                <button (click)="reloadEmprendimiento()"
                        class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
                <button (click)="goBack()"
                        class="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success State with Nav -->
    <app-emprendimiento-nav *ngIf="!loading && !error && emprendimiento" [emprendimiento]="emprendimiento">
      <!-- Router outlet para las rutas hijas -->
      <router-outlet></router-outlet>
    </app-emprendimiento-nav>
  `
})
export class EmprendimientoLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emprendimientoService = inject(EmprendimientoAdminService);

  emprendimiento?: Emprendimiento;
  emprendimientoId?: number;
  loading = true;
  error = '';

  ngOnInit(): void {
    // Escuchar cambios en los parámetros de la ruta padre
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Layout - ID recibido:', id); // Debug

      if (id && !isNaN(+id)) {
        const numericId = +id;
        this.emprendimientoId = numericId;

        // Solo cargar si es un ID diferente o no tenemos datos
        if (numericId !== this.emprendimiento?.id || !this.emprendimiento) {
          this.loadEmprendimiento(numericId);
        }
      } else {
        console.error('ID inválido recibido:', id);
        this.error = 'ID de emprendimiento inválido';
        this.loading = false;
      }
    });
  }

  private loadEmprendimiento(id: number): void {
    console.log('Layout - Cargando emprendimiento con ID:', id); // Debug
    this.loading = true;
    this.error = '';

    this.emprendimientoService.getEmprendimiento(id).subscribe({
      next: (data) => {
        console.log('Layout - Emprendimiento cargado:', data); // Debug
        this.emprendimiento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Layout - Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento.';
        this.loading = false;
      }
    });
  }

  reloadEmprendimiento(): void {
    if (this.emprendimientoId) {
      this.loadEmprendimiento(this.emprendimientoId);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-emprendedores/mis-emprendimientos']);
  }
}
