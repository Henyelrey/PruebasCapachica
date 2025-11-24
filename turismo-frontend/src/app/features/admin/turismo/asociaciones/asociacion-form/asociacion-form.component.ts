import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Asociacion, Municipalidad } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-asociacion-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestión de Asociaciones" 
      subtitle="Administra y gestiona las asociaciones de tu organización"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{{ isEditMode ? 'Editar Asociación' : 'Crear Asociación' }}</h1>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/asociaciones"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
          >
            <svg class="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver al listado
          </a>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-colors duration-300">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 dark:text-white transition-colors duration-300">Cargando...</span>
          </div>
        } @else {
          <form [formGroup]="asociacionForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <!-- Nombre -->
              <div class="sm:col-span-6">
                <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Nombre</label>
                <div class="mt-1 relative">
                  <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="block w-full py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                    [ngClass]="{'border-red-300 dark:border-red-500 pr-10': isFieldInvalid('nombre')}"
                    placeholder="Nombre de la asociación"
                  />
                  @if (isFieldInvalid('nombre')) {
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">El nombre es requerido</p>
                  }
                </div>
              </div>

              <!-- Descripción -->
              <div class="sm:col-span-6">
                <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Descripción</label>
                <div class="mt-1 relative">
                  <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="4"
                    class="block w-full py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                    [ngClass]="{'border-red-300 dark:border-red-500': isFieldInvalid('descripcion')}"
                    placeholder="Descripción breve de la asociación"
                  ></textarea>
                  @if (isFieldInvalid('descripcion')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La descripción es requerida</p>
                  }
                </div>
              </div>

              <!-- Municipalidad -->
              <div class="sm:col-span-3">
                <label for="municipalidad_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Municipalidad</label>
                <div class="mt-1 relative">
                  <select
                    id="municipalidad_id"
                    formControlName="municipalidad_id"
                    class="block w-full py-3 px-4 appearance-none rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                    [ngClass]="{'border-red-300 dark:border-red-500 pr-10': isFieldInvalid('municipalidad_id')}"
                  >
                    <option [ngValue]="null" disabled>Seleccionar municipalidad</option>
                    @for (municipalidad of municipalidades; track municipalidad.id) {
                      <option [ngValue]="municipalidad.id">{{ municipalidad.nombre }}</option>
                    }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  @if (isFieldInvalid('municipalidad_id')) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La municipalidad es requerida</p>
                  }
                </div>
              </div>

              <!-- Imagen -->
              <div class="sm:col-span-3">
                <label for="imagen" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Imagen</label>
                <div class="mt-1 flex items-center">
                  @if (previewImage) {
                    <div class="relative w-24 h-24 rounded-md overflow-hidden mr-4">
                      <img [src]="previewImage" alt="Vista previa" class="w-full h-full object-cover">
                      <button 
                        type="button" 
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        (click)="removeImage()"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  }
                  <label 
                    for="file-upload" 
                    class="cursor-pointer py-3 px-4 rounded-md bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
                  >
                    <span>Subir imagen</span>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept="image/*"
                      class="sr-only" 
                      (change)="onFileSelected($event)"
                    >
                  </label>
                </div>
                <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">PNG, JPG, GIF hasta 2MB</p>
              </div>

              <!-- Coordenadas -->
              <div class="sm:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-5">
                <div class="sm:col-span-2">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Ubicación Geográfica</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Seleccione la ubicación de la asociación.</p>
                </div>

                <!-- Latitud -->
                <div>
                  <label for="latitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Latitud</label>
                  <div class="mt-1 relative">
                    <input
                      type="number"
                      id="latitud"
                      formControlName="latitud"
                      step="0.0000001"
                      class="block w-full py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                      placeholder="-15.645000"
                    >
                  </div>
                </div>

                <!-- Longitud -->
                <div>
                  <label for="longitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Longitud</label>
                  <div class="mt-1 relative">
                    <input
                      type="number"
                      id="longitud"
                      formControlName="longitud"
                      step="0.0000001"
                      class="block w-full py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                      placeholder="-69.834500"
                    >
                  </div>
                </div>

                <!-- Mapa (opcional, si tienes un componente) -->
                <div class="sm:col-span-2">
                  <!-- Aquí podrías incluir un componente de mapa similar al que tienes en servicio-form -->
                </div>
              </div>

              <!-- Teléfono -->
              <div class="sm:col-span-3">
                <label for="telefono" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Teléfono</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="telefono"
                    formControlName="telefono"
                    class="block w-full pl-11 py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                    placeholder="999 999 999"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="sm:col-span-3">
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="block w-full pl-11 py-3 px-4 rounded-md border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <!-- Estado -->
              <div class="sm:col-span-3">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-md p-4 border-2 border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <div class="relative flex items-start">
                    <div class="flex h-6 items-center">
                      <input
                        id="estado"
                        formControlName="estado"
                        type="checkbox"
                        class="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-300"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="estado" class="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Activo</label>
                      <p class="text-gray-500 dark:text-gray-400 transition-colors duration-300">Indica si la asociación está activa actualmente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            @if (error) {
              <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border-2 border-red-200 dark:border-red-800 transition-colors duration-300">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800 dark:text-red-400 transition-colors duration-300">{{ error }}</h3>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                routerLink="/admin/asociaciones"
                class="inline-flex justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="inline-flex justify-center rounded-md border-2 border-transparent bg-primary-600 dark:bg-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300"
                [disabled]="saving || asociacionForm.invalid"
                [ngClass]="{'opacity-70 cursor-not-allowed': saving || asociacionForm.invalid}"
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
export class AsociacionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  previewImage: string | null = null;
  selectedFile: File | null = null;

  asociacionForm!: FormGroup;
  asociacionId: number | null = null;

  municipalidades: Municipalidad[] = [];

  loading = false;
  saving = false;
  submitted = false;
  error = '';

  get isEditMode(): boolean {
    return this.asociacionId !== null;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.initForm();
    this.loadMunicipalidades();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.asociacionId = +id;
      this.loadAsociacion(this.asociacionId);
    }
  }

  initForm() {
    this.asociacionForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      municipalidad_id: [null, Validators.required],
      telefono: [''],
      email: [''],
      estado: [true],
      latitud: [null],
      longitud: [null]
    });
  }

  loadMunicipalidades() {
    this.turismoService.getMunicipalidades().subscribe({
      next: (municipalidades) => {
        this.municipalidades = municipalidades;
      },
      error: (error) => {
        console.error('Error al cargar municipalidades:', error);
        this.error = 'Error al cargar las municipalidades. Por favor, recargue la página e intente nuevamente.';
      }
    });
  }

  loadAsociacion(id: number) {
    this.loading = true;
    this.turismoService.getAsociacion(id).subscribe({
      next: (asociacion) => {
        this.asociacionForm.patchValue({
          nombre: asociacion.nombre,
          descripcion: asociacion.descripcion,
          municipalidad_id: asociacion.municipalidad_id,
          telefono: asociacion.telefono || '',
          email: asociacion.email || '',
          estado: asociacion.estado !== undefined ? asociacion.estado : true,
          latitud: asociacion.latitud || null,
          longitud: asociacion.longitud || null
        });

        // Mostrar imagen previa si existe
        if (asociacion.imagen_url) {
          this.previewImage = asociacion.imagen_url;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar asociación:', error);
        this.error = 'Error al cargar los datos de la asociación. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.asociacionForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.submitted)) || false;
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe exceder 2MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Crear una URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage() {
    this.previewImage = null;
    this.selectedFile = null;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.asociacionForm.invalid) {
      return;
    }

    const formData = { ...this.asociacionForm.value };
    
    // Añadir imagen seleccionada
    if (this.selectedFile) {
      formData.imagen = this.selectedFile;
    }

    this.saving = true;

    if (this.isEditMode && this.asociacionId) {
      // Actualizar asociación existente
      this.turismoService.updateAsociacion(this.asociacionId, formData).subscribe({
        next: () => {
          this.saving = false;
          alert("Asociación actualizada correctamente");
          this.router.navigate(['/admin/asociaciones']);
        },
        error: (error) => {
          console.error('Error al actualizar asociación:', error);
          this.error = error.error?.message || 'Error al actualizar la asociación. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    } else {
      // Crear nueva asociación
      this.turismoService.createAsociacion(formData).subscribe({
        next: () => {
          this.saving = false;
          alert("Asociación creada correctamente");
          this.router.navigate(['/admin/asociaciones']);
        },
        error: (error) => {
          console.error('Error al crear asociación:', error);
          this.error = error.error?.message || 'Error al crear la asociación. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    }
  }
}
