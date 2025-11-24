import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TurismoService, Categoria } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Categorias" 
      subtitle="Administra y gestiona las categorias que dividiran los servicios de tu organización"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Gestión de Categorías</h1>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/categorias/create"
            class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Categoría
          </a>
        </div>
      </div>

      <!-- Tabla de categorías -->
      <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden mt-6 transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 text-gray-700 dark:text-gray-300 transition-colors duration-200">Cargando categorías...</span>
          </div>
        } @else if (categorias.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No se encontraron categorías</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Comienza creando una nueva categoría.</p>
            <div class="mt-6">
              <a routerLink="/admin/categorias/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nueva Categoría
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              <thead class="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Nombre</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Descripción</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Icono</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                @for (categoria of categorias; track categoria.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ categoria.nombre }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs transition-colors duration-200">{{ categoria.descripcion || 'Sin descripción' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (categoria.icono_url) {
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                            <img [src]="categoria.icono_url" alt="Icono de categoría" class="h-full w-full object-cover">
                          </div>
                        </div>
                      } @else {
                        <span class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Sin icono</span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-3">
                        <a
                          [routerLink]="['/admin/categorias/edit', categoria.id]"
                          class="p-2 rounded-full text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                          title="Editar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>

                        <button
                          (click)="deleteCategoria(categoria)"
                          class="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
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
export class CategoriaListComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);

  categorias: Categoria[] = [];
  loading = true;

  ngOnInit() {
    this.loadCategorias();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  loadCategorias() {
    this.loading = true;
    this.turismoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loading = false;
      }
    });
  }

  deleteCategoria(categoria: Categoria) {
    if (!categoria.id) return;

    if (confirm(`¿Está seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`)) {
      this.turismoService.deleteCategoria(categoria.id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => c.id !== categoria.id);
          alert("Categoría eliminada correctamente");
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          alert("Error al eliminar la categoría. Por favor, intente nuevamente.");
        }
      });
    }
  }
}
