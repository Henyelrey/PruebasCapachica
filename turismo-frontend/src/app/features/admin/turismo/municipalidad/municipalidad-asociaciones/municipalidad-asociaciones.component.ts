import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Municipalidad, Asociacion } from '../../../../../core/services/turismo.service';

@Component({
  selector: 'app-municipalidad-asociaciones',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Asociaciones de {{ municipalidad?.nombre }}</h1>
          <p class="mt-1 text-sm text-gray-500" *ngIf="municipalidad">
            Gestione las asociaciones vinculadas a esta municipalidad.
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <a 
            routerLink="/admin/municipalidad" 
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
          
          <button 
            type="button"
            (click)="showAddForm = true"
            class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Asociación
          </button>
        </div>
      </div>
      
      <!-- Formulario para añadir nueva asociación -->
      @if (showAddForm) {
        <div class="bg-white shadow-sm rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">{{ editingAsociacion ? 'Editar' : 'Añadir' }} Asociación</h2>
            <button 
              type="button"
              (click)="cancelForm()"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form [formGroup]="asociacionForm" (ngSubmit)="saveAsociacion()" class="space-y-4">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
              <div class="mt-1">
                <input 
                  type="text" 
                  id="nombre" 
                  formControlName="nombre" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  [ngClass]="{'border-red-300': isFieldInvalid('nombre')}"
                />
                @if (isFieldInvalid('nombre')) {
                  <p class="mt-2 text-sm text-red-600">El nombre es requerido</p>
                }
              </div>
            </div>
            
            <!-- Descripción -->
            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
              <div class="mt-1">
                <textarea 
                  id="descripcion" 
                  formControlName="descripcion"
                  rows="3" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  [ngClass]="{'border-red-300': isFieldInvalid('descripcion')}"
                ></textarea>
                @if (isFieldInvalid('descripcion')) {
                  <p class="mt-2 text-sm text-red-600">La descripción es requerida</p>
                }
              </div>
            </div>
            
            <!-- Ubicación -->
            <div>
              <label for="ubicacion" class="block text-sm font-medium text-gray-700">Ubicación</label>
              <div class="mt-1">
                <input 
                  type="text" 
                  id="ubicacion" 
                  formControlName="ubicacion" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <!-- Información de contacto -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
                <div class="mt-1">
                  <input 
                    type="tel" 
                    id="telefono" 
                    formControlName="telefono" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <div class="mt-1">
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <!-- Estado -->
            <div>
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="estado" 
                  formControlName="estado" 
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label for="estado" class="ml-2 block text-sm text-gray-700">Activo</label>
              </div>
            </div>
            
            @if (error) {
              <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
                  </div>
                </div>
              </div>
            }
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button"
                (click)="cancelForm()"
                class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              
              <button 
                type="submit" 
                class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                [disabled]="saving || asociacionForm.invalid"
              >
                @if (saving) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  {{ editingAsociacion ? 'Actualizar' : 'Guardar' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
      
      <!-- Lista de asociaciones -->
      <div class="rounded-lg bg-white shadow-sm overflow-hidden">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando asociaciones...</span>
          </div>
        } @else if (asociaciones.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay asociaciones</h3>
            <p class="mt-1 text-sm text-gray-500">Comience creando una nueva asociación para esta municipalidad.</p>
            <div class="mt-6">
              <button 
                type="button"
                (click)="showAddForm = true"
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nueva Asociación
              </button>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (asociacion of asociaciones; track asociacion.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ asociacion.nombre }}</div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-500 truncate max-w-xs">{{ asociacion.descripcion }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ asociacion.ubicacion || 'No disponible' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">
                        @if (asociacion.telefono) {
                          <div>{{ asociacion.telefono }}</div>
                        }
                        @if (asociacion.email) {
                          <div>{{ asociacion.email }}</div>
                        }
                        @if (!asociacion.telefono && !asociacion.email) {
                          <div>Sin información</div>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (asociacion.estado) {
                        <span class="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Inactivo
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <button 
                          (click)="editAsociacion(asociacion)" 
                          class="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        
                        <a 
                          [routerLink]="['/admin/asociaciones', asociacion.id, 'emprendedores']" 
                          class="text-green-600 hover:text-green-900"
                          title="Ver emprendedores"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </a>
                        
                        <button 
                          (click)="deleteAsociacion(asociacion)" 
                          class="text-red-600 hover:text-red-900"
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
export class MunicipalidadAsociacionesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  municipalidadId: number | null = null;
  municipalidad: Municipalidad | null = null;
  asociaciones: Asociacion[] = [];
  
  asociacionForm!: FormGroup;
  editingAsociacion: Asociacion | null = null;
  
  loading = true;
  saving = false;
  submitted = false;
  error = '';
  showAddForm = false;
  
  ngOnInit() {
    this.initForm();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.municipalidadId = +id;
      this.loadMunicipalidad();
      this.loadAsociaciones();
    } else {
      this.error = 'ID de municipalidad no válido';
      this.loading = false;
    }
  }
  
  initForm() {
    this.asociacionForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: [''],
      telefono: [''],
      email: [''],
      estado: [true]
    });
  }
  
  loadMunicipalidad() {
    if (!this.municipalidadId) return;
    
    this.turismoService.getMunicipalidad(this.municipalidadId).subscribe({
      next: (municipalidad) => {
        this.municipalidad = municipalidad;
      },
      error: (error) => {
        console.error('Error al cargar municipalidad:', error);
        this.error = 'Error al cargar los datos de la municipalidad.';
      }
    });
  }
  
  loadAsociaciones() {
    if (!this.municipalidadId) return;
    
    this.loading = true;
    this.turismoService.getAsociacionesByMunicipalidad(this.municipalidadId).subscribe({
      next: (asociaciones) => {
        this.asociaciones = asociaciones;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar asociaciones:', error);
        this.error = 'Error al cargar las asociaciones.';
        this.loading = false;
      }
    });
  }
  
  editAsociacion(asociacion: Asociacion) {
    this.editingAsociacion = asociacion;
    this.asociacionForm.patchValue({
      nombre: asociacion.nombre,
      descripcion: asociacion.descripcion,
      ubicacion: asociacion.ubicacion || '',
      telefono: asociacion.telefono || '',
      email: asociacion.email || '',
      estado: asociacion.estado !== undefined ? asociacion.estado : true
    });
    this.showAddForm = true;
  }
  
  saveAsociacion() {
    this.submitted = true;
    this.error = '';
    
    if (this.asociacionForm.invalid) {
      return;
    }
    
    const formData = {
      ...this.asociacionForm.value,
      municipalidad_id: this.municipalidadId
    };
    
    this.saving = true;
    
    if (this.editingAsociacion && this.editingAsociacion.id) {
      // Actualizar asociación existente
      this.turismoService.updateAsociacion(this.editingAsociacion.id, formData).subscribe({
        next: (updatedAsociacion) => {
          // Actualizar la lista de asociaciones
          const index = this.asociaciones.findIndex(a => a.id === this.editingAsociacion!.id);
          if (index !== -1) {
            this.asociaciones[index] = updatedAsociacion;
          }
          
          this.saving = false;
          this.resetForm();
          alert('Asociación actualizada correctamente');
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
        next: (newAsociacion) => {
          this.asociaciones.push(newAsociacion);
          this.saving = false;
          this.resetForm();
          alert('Asociación creada correctamente');
        },
        error: (error) => {
          console.error('Error al crear asociación:', error);
          this.error = error.error?.message || 'Error al crear la asociación. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    }
  }
  
  deleteAsociacion(asociacion: Asociacion) {
    if (!asociacion.id) return;
    
    if (confirm(`¿Está seguro de eliminar la asociación "${asociacion.nombre}"? Esta acción eliminará también todos los emprendedores relacionados y no se puede deshacer.`)) {
      this.turismoService.deleteAsociacion(asociacion.id).subscribe({
        next: () => {
          this.asociaciones = this.asociaciones.filter(a => a.id !== asociacion.id);
          alert('Asociación eliminada correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar asociación:', error);
          alert('Error al eliminar la asociación. Por favor, intente nuevamente.');
        }
      });
    }
  }
  
  cancelForm() {
    this.resetForm();
  }
  
  resetForm() {
    this.asociacionForm.reset({
      estado: true
    });
    this.editingAsociacion = null;
    this.showAddForm = false;
    this.submitted = false;
    this.error = '';
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.asociacionForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.submitted)) || false;
  }
}