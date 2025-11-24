import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Categoria } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Categorias" 
      subtitle="Administra y gestiona las categorias que dividiran los servicios de tu organización"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{{ isEditMode ? 'Editar Categoría' : 'Crear Categoría' }}</h1>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/categorias"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver al listado
          </a>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-6 transition-colors duration-200">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 text-gray-700 dark:text-gray-300 transition-colors duration-200">Cargando...</span>
          </div>
        } @else {
          <form [formGroup]="categoriaForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <!-- Nombre -->
              <div class="sm:col-span-6">
                <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Nombre</label>
                <div class="mt-2">
                  <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                    [ngClass]="{'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500': isFieldInvalid('nombre')}"
                  />
                  @if (isFieldInvalid('nombre')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                      <span class="flex items-center">
                        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        El nombre es requerido
                      </span>
                    </p>
                  }
                </div>
              </div>

              <!-- Descripción -->
              <div class="sm:col-span-6">
                <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Descripción</label>
                <div class="mt-2">
                  <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="4"
                    class="block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                  ></textarea>
                </div>
              </div>

              <!-- URL del Icono -->
              <div class="sm:col-span-6">
                <label for="icono_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">URL del Icono</label>
                <div class="mt-2">
                  <input
                    type="text"
                    id="icono_url"
                    formControlName="icono_url"
                    class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                  />
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">URL a una imagen que representa esta categoría</p>
              </div>

              <!-- Vista previa del icono -->
              <div class="sm:col-span-6">
                <div class="flex items-center">
                  <div class="mr-3">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Vista previa</label>
                    <div class="mt-2 h-24 w-24 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden transition-colors duration-200">
                      @if (previewUrl) {
                        <img [src]="previewUrl" alt="Vista previa" class="h-20 w-20 object-contain">
                      } @else {
                        <svg class="h-12 w-12 text-gray-300 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            @if (error) {
              <div class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 my-4 transition-colors duration-200">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800 dark:text-red-200 transition-colors duration-200">{{ error }}</h3>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <button
                type="button"
                routerLink="/admin/categorias"
                class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                [disabled]="saving || categoriaForm.invalid"
                [ngClass]="{'opacity-70 cursor-not-allowed': saving || categoriaForm.invalid}"
              >
                @if (saving) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  {{ isEditMode ? 'Actualizar' : 'Crear' }}
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class CategoriaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  categoriaForm!: FormGroup;
  categoriaId: number | null = null;

  loading = false;
  saving = false;
  submitted = false;
  error = '';
  previewUrl = '';

  get isEditMode(): boolean {
    return this.categoriaId !== null;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoriaId = +id;
      this.loadCategoria(this.categoriaId);
    }

    // Actualizar vista previa cuando cambia la URL del icono
    this.categoriaForm.get('icono_url')?.valueChanges.subscribe(url => {
      this.previewUrl = url;
    });
  }

  initForm() {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      icono_url: ['']
    });
  }

  loadCategoria(id: number) {
    this.loading = true;
    this.turismoService.getCategoria(id).subscribe({
      next: (categoria) => {
        this.categoriaForm.patchValue({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || '',
          icono_url: categoria.icono_url || ''
        });
        this.previewUrl = categoria.icono_url || '';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categoría:', error);
        this.error = 'Error al cargar los datos de la categoría. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.submitted)) || false;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.categoriaForm.invalid) {
      return;
    }

    const formData = this.categoriaForm.value;

    this.saving = true;

    if (this.isEditMode && this.categoriaId) {
      // Actualizar categoría existente
      this.turismoService.updateCategoria(this.categoriaId, formData).subscribe({
        next: () => {
          this.saving = false;
          alert("Categoría actualizada correctamente");
          this.router.navigate(['/admin/categorias']);
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.error = error.error?.message || 'Error al actualizar la categoría. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    } else {
      // Crear nueva categoría
      this.turismoService.createCategoria(formData).subscribe({
        next: () => {
          this.saving = false;
          alert("Categoría creada correctamente");
          this.router.navigate(['/admin/categorias']);
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.error = error.error?.message || 'Error al crear la categoría. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    }
  }
}
