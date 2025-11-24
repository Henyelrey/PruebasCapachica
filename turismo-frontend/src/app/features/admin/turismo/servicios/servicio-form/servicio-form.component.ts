import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Servicio, Categoria, Emprendedor, ServicioHorario } from '../../../../../core/services/turismo.service';
import { SliderImage, SliderUploadComponent } from '../../../../../shared/components/slider-upload/slider-upload.component';
import { UbicacionMapComponent } from '../../../../../shared/components/ubicacion-map/ubicacion-map.component';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SliderUploadComponent, UbicacionMapComponent, AdminHeaderComponent],
  template: `
    
<app-admin-header 
    title="Gestión de servicios" 
    subtitle="Administra y gestiona los servicios de tu organización"
  ></app-admin-header>
  
  <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{{ isEditMode ? 'Editar' : 'Crear' }} Servicio</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
          {{ isEditMode ? 'Actualice la información del servicio.' : 'Complete el formulario para crear un nuevo servicio.' }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <a
          [routerLink]="backLink"
          class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver
        </a>
      </div>
    </div>

    @if (loading) {
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm mt-6 transition-colors duration-200">
        <div class="flex justify-center items-center p-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
          <span class="ml-4 text-gray-700 dark:text-gray-300 transition-colors duration-200">Cargando...</span>
        </div>
      </div>
    } @else {
      <form [formGroup]="servicioForm" (ngSubmit)="submitForm()" class="space-y-6 mt-6">
        <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div class="p-6 space-y-6">
            <!-- Información básica -->
            <div>
              <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">Información del Servicio</h2>
              <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Nombre -->
                <div class="sm:col-span-4">
                  <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Nombre del Servicio</label>
                  <div class="mt-2">
                    <input
                      type="text"
                      id="nombre"
                      formControlName="nombre"
                      class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      [ngClass]="{'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500': servicioForm.get('nombre')?.invalid && servicioForm.get('nombre')?.touched}"
                    >
                  </div>
                  @if (servicioForm.get('nombre')?.invalid && servicioForm.get('nombre')?.touched) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">El nombre es obligatorio</p>
                  }
                </div>

                <!-- Precio referencial -->
                <div class="sm:col-span-2">
                  <label for="precio_referencial" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Precio Referencial</label>
                  <div class="mt-2 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span class="text-gray-500 dark:text-gray-400 sm:text-sm transition-colors duration-200">S/.</span>
                    </div>
                    <input
                      type="number"
                      id="precio_referencial"
                      formControlName="precio_referencial"
                      min="0"
                      step="0.01"
                      class="block w-full h-10 pl-9 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                    >
                  </div>
                </div>

                <!-- Capacidad -->
                <div class="sm:col-span-2">
                  <label for="capacidad" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Capacidad</label>
                  <div class="mt-2">
                    <input
                      type="number"
                      id="capacidad"
                      formControlName="capacidad"
                      min="1"
                      step="1"
                      class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                    >
                  </div>
                </div>

                <!-- Descripción -->
                <div class="sm:col-span-6">
                  <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Descripción</label>
                  <div class="mt-2">
                    <textarea
                      id="descripcion"
                      formControlName="descripcion"
                      rows="3"
                      class="block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                    ></textarea>
                  </div>
                </div>

                <!-- Emprendedor -->
                <div class="sm:col-span-3">
                  <label for="emprendedor_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Emprendedor</label>
                  <div class="mt-2">
                    <select
                      id="emprendedor_id"
                      formControlName="emprendedor_id"
                      class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      [attr.disabled]="isEmprendedorPreselected ? true : null"
                      [ngClass]="{'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500': servicioForm.get('emprendedor_id')?.invalid && servicioForm.get('emprendedor_id')?.touched}"
                    >
                      <option value="">Seleccione emprendedor</option>
                      @for (emprendedor of emprendedores; track emprendedor.id) {
                        <option [value]="emprendedor.id">{{ emprendedor.nombre }}</option>
                      }
                    </select>
                  </div>
                  @if (servicioForm.get('emprendedor_id')?.invalid && servicioForm.get('emprendedor_id')?.touched) {
                    <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">El emprendedor es obligatorio</p>
                  }
                </div>

                <!-- Estado -->
                <div class="sm:col-span-3">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Estado</label>
                  <div class="mt-2">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="estado"
                        formControlName="estado"
                        class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                      >
                      <label for="estado" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                        Servicio activo
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Ubicación Geográfica -->
                <div class="sm:col-span-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">Ubicación Geográfica</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">Seleccione la ubicación donde se ofrece el servicio.</p>

                  <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <!-- Latitud y Longitud -->
                    <div class="sm:col-span-3">
                      <label for="latitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Latitud</label>
                      <div class="mt-2">
                        <input
                          type="number"
                          id="latitud"
                          formControlName="latitud"
                          step="0.0000001"
                          class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        >
                      </div>
                    </div>

                    <div class="sm:col-span-3">
                      <label for="longitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Longitud</label>
                      <div class="mt-2">
                        <input
                          type="number"
                          id="longitud"
                          formControlName="longitud"
                          step="0.0000001"
                          class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        >
                      </div>
                    </div>

                    <!-- Referencia de ubicación -->
                    <div class="sm:col-span-6">
                      <label for="ubicacion_referencia" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Referencia de ubicación</label>
                      <div class="mt-2">
                        <input
                          type="text"
                          id="ubicacion_referencia"
                          formControlName="ubicacion_referencia"
                          class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                          placeholder="Ej: A 200m del muelle principal de Llachón"
                        >
                      </div>
                    </div>

                    <!-- Componente de mapa -->
                    <div class="sm:col-span-6">
                      <app-ubicacion-map
                        [latitud]="servicioForm.get('latitud')?.value"
                        [longitud]="servicioForm.get('longitud')?.value"
                        (ubicacionChange)="onUbicacionChange($event)"
                      ></app-ubicacion-map>
                    </div>
                  </div>
                </div>

                <!-- Horarios -->
                <div class="sm:col-span-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
                  <div class="flex justify-between items-center">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors">Horarios Disponibles</h3>
                    <button
                      type="button"
                      (click)="addHorario()"
                      class="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Añadir Horario
                    </button>
                  </div>

                  <!-- Lista de horarios -->
                  <div class="mt-4">
                    @if (horariosArray.controls.length === 0) {
                      <div class="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 transition-colors duration-200">
                        <div class="flex">
                          <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400 dark:text-yellow-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                          </div>
                          <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300 transition-colors duration-200">Atención</h3>
                            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-200 transition-colors duration-200">
                              <p>No hay horarios disponibles definidos. Este servicio no estará disponible para reservas hasta que se añada al menos un horario.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    } @else {
                      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md transition-colors duration-200">
                        <ul class="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                          @for (control of horariosArray.controls; track i; let i = $index) {
                            <li class="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                              <div [formGroup]="getHorarioFormGroup(i)" class="flex flex-wrap gap-4 items-center">
                                <!-- Día de la semana -->
                                <div class="w-48">
                                  <label [for]="'dia-semana-' + i" class="block text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Día de la semana</label>
                                  <select
                                    [id]="'dia-semana-' + i"
                                    formControlName="dia_semana"
                                    class="mt-1 block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                  >
                                    <option value="lunes">Lunes</option>
                                    <option value="martes">Martes</option>
                                    <option value="miercoles">Miércoles</option>
                                    <option value="jueves">Jueves</option>
                                    <option value="viernes">Viernes</option>
                                    <option value="sabado">Sábado</option>
                                    <option value="domingo">Domingo</option>
                                  </select>
                                </div>

                                <!-- Hora de inicio -->
                                <div class="w-32">
                                  <label [for]="'hora-inicio-' + i" class="block text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Hora inicio</label>
                                  <input
                                    [id]="'hora-inicio-' + i"
                                    type="time"
                                    formControlName="hora_inicio"
                                    class="mt-1 block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                  >
                                </div>

                                <!-- Hora de fin -->
                                <div class="w-32">
                                  <label [for]="'hora-fin-' + i" class="block text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Hora fin</label>
                                  <input
                                    [id]="'hora-fin-' + i"
                                    type="time"
                                    formControlName="hora_fin"
                                    class="mt-1 block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                  >
                                </div>

                                <!-- Activo -->
                                <div class="w-24">
                                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Estado</label>
                                  <div class="mt-1 flex items-center">
                                    <input
                                      [id]="'horario-activo-' + i"
                                      type="checkbox"
                                      formControlName="activo"
                                      class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                                    >
                                    <label [for]="'horario-activo-' + i" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                      Activo
                                    </label>
                                  </div>
                                </div>

                                <!-- Eliminar -->
                                <div class="flex-grow flex justify-end">
                                  <button
                                    type="button"
                                    (click)="removeHorario(i)"
                                    class="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                    title="Eliminar horario"
                                  >
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                </div>

                                <!-- Mensajes de error -->
                                @if (getHorarioFormGroup(i).get('hora_fin')?.value &&
                                     getHorarioFormGroup(i).get('hora_inicio')?.value &&
                                     getHorarioFormGroup(i).get('hora_fin')?.value <= getHorarioFormGroup(i).get('hora_inicio')?.value) {
                                  <div class="w-full text-red-600 dark:text-red-400 text-sm transition-colors duration-200">
                                    <div class="flex items-center">
                                      <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                      </svg>
                                      La hora de fin debe ser posterior a la hora de inicio
                                    </div>
                                  </div>
                                }
                              </div>
                            </li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                </div>

                <!-- Categorías -->
                <div class="sm:col-span-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
                  <label class="block text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">Categorías</label>
                  <div class="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      @for (categoria of categorias; track categoria.id) {
                        <div class="relative flex items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                          <div class="flex items-center h-5">
                            <input
                              type="checkbox"
                              [id]="'categoria_' + categoria.id"
                              [checked]="isSelectedCategoria(categoria.id || 0)"
                              (change)="toggleCategoria(categoria.id || 0, $event)"
                              class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 transition-colors duration-200"
                            >
                          </div>
                          <div class="ml-3 text-sm">
                            <label [for]="'categoria_' + categoria.id" class="font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">{{ categoria.nombre }}</label>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Sliders / Imágenes -->
                <div class="sm:col-span-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
                  <app-slider-upload
                    title="Imágenes del Servicio"
                    [slidersFormArray]="slidersArray"
                    [existingSliders]="sliders"
                    (changeSlidersEvent)="onSlidersChange($event)"
                    (deletedSlidersEvent)="onDeletedSlidersChange($event)"
                  ></app-slider-upload>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right sm:px-6 transition-colors duration-200">
            <button
              type="button"
              (click)="cancel()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-2 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting || (servicioForm.invalid && !isFormValid())"
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              [class.opacity-50]="isSubmitting || (servicioForm.invalid && !isFormValid())"
              [class.cursor-not-allowed]="isSubmitting || (servicioForm.invalid && !isFormValid())"
            >
              <ng-container *ngIf="isSubmitting; else textoNormal">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </ng-container>
              <ng-template #textoNormal>
                {{ isEditMode ? 'Actualizar' : 'Crear' }} Servicio
              </ng-template>
            </button>
          </div>
        </div>
      </form>
    }
  </div>
  `,
})
export class ServicioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  servicioForm!: FormGroup;
  servicio: Servicio | null = null;
  categorias: Categoria[] = [];
  emprendedores: Emprendedor[] = [];
  sliders: SliderImage[] = [];
  deletedSliderIds: number[] = [];

  loading = true;
  isSubmitting = false;
  isEditMode = false;
  servicioId: number | null = null;

  selectedCategorias: number[] = [];
  isEmprendedorPreselected = false;
  backLink = '/admin/servicios';

  ngOnInit() {
    this.initForm();
    this.loadCategorias();
    this.loadEmprendedores();

    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.servicioId = +id;
      this.loadServicio(this.servicioId);
    } else {
      // Si viene con emprendedor preseleccionado por query param
      const emprendedorId = this.route.snapshot.queryParams['emprendedor_id'];
      if (emprendedorId) {
        this.isEmprendedorPreselected = true;
        this.servicioForm.patchValue({ emprendedor_id: +emprendedorId });
        this.backLink = `/admin/emprendedores/${emprendedorId}/servicios`;
      }

      this.loading = false;
    }
  }

  initForm() {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      precio_referencial: [0],
      capacidad: [1, [Validators.required, Validators.min(1)]], // Nuevo campo de capacidad con valor predeterminado de 1
      emprendedor_id: ['', [Validators.required]],
      estado: [true],
      latitud: [null],
      longitud: [null],
      ubicacion_referencia: [''],
      sliders: this.fb.array([]),
      horarios: this.fb.array([])
    });
  }

  get slidersArray(): FormArray {
    return this.servicioForm.get('sliders') as FormArray;
  }

  get horariosArray(): FormArray {
    return this.servicioForm.get('horarios') as FormArray;
  }

  loadCategorias() {
    this.turismoService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadEmprendedores() {
    // Cargar todos los emprendedores (primera página con tamaño grande)
    this.turismoService.getEmprendedores(1, 100).subscribe({
      next: (response) => {
        this.emprendedores = response.data;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
      }
    });
  }

  loadServicio(id: number) {
    this.loading = true;
    this.turismoService.getServicio(id).subscribe({
      next: (servicio) => {
        this.servicio = servicio;

        // Llenar el formulario con los datos del servicio
        this.servicioForm.patchValue({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio_referencial: servicio.precio_referencial,
          emprendedor_id: servicio.emprendedor_id,
          estado: servicio.estado,
          latitud: servicio.latitud,
          longitud: servicio.longitud,
          ubicacion_referencia: servicio.ubicacion_referencia,
          capacidad: servicio.capacidad || 1 // Asignar el valor de capacidad o un valor predeterminado
        });

        // Cargar horarios
        if (servicio.horarios && servicio.horarios.length > 0) {
          // Limpiar primero el array de horarios para evitar duplicados
          while (this.horariosArray.length !== 0) {
            this.horariosArray.removeAt(0);
          }
          // Añadir los horarios existentes
          servicio.horarios.forEach(horario => {
            this.addHorario(horario);
          });
        }

        // Guardar las categorías seleccionadas
        if (servicio.categorias && servicio.categorias.length > 0) {
          this.selectedCategorias = servicio.categorias.map(c => c.id || 0).filter(id => id > 0);
        }

        // Establecer la ruta de regreso si viene de un emprendedor
        if (servicio.emprendedor_id) {
          this.backLink = `/admin/emprendedores/${servicio.emprendedor_id}/servicios`;
        }

        this.loading = false;

        // Cargar sliders
        if (servicio.sliders && servicio.sliders.length > 0) {
          this.sliders = servicio.sliders.map(slider => ({
            id: slider.id,
            nombre: slider.nombre,
            es_principal: slider.es_principal,
            orden: slider.orden,
            imagen: slider.url_completa || '',
            url_completa: slider.url_completa
          }));
        }
      },
      error: (error) => {
        console.error('Error al cargar servicio:', error);
        this.loading = false;
      }
    });
  }

  // Métodos para horarios
  getHorarioFormGroup(index: number): FormGroup {
    return this.horariosArray.at(index) as FormGroup;
  }

  createHorarioFormGroup(horario?: ServicioHorario): FormGroup {
    return this.fb.group({
      id: [horario?.id || null],
      dia_semana: [horario?.dia_semana || 'lunes', Validators.required],
      hora_inicio: [horario?.hora_inicio || '09:00:00', Validators.required],
      hora_fin: [horario?.hora_fin || '18:00:00', Validators.required],
      activo: [horario?.activo !== undefined ? horario.activo : true]
    });
  }

  addHorario(horario?: ServicioHorario) {
    this.horariosArray.push(this.createHorarioFormGroup(horario));
  }

  removeHorario(index: number) {
    this.horariosArray.removeAt(index);
  }

  invalidHorarios(): boolean {
    if (this.horariosArray.length === 0) {
      return false; // No es inválido, simplemente no hay horarios
    }

    for (let i = 0; i < this.horariosArray.length; i++) {
      const group = this.getHorarioFormGroup(i);
      const inicio = group.get('hora_inicio')?.value;
      const fin = group.get('hora_fin')?.value;

      if (!inicio || !fin || inicio >= fin) {
        return true; // Horario inválido
      }
    }

    return false;
  }

  // Método para manejar cambios de ubicación desde el mapa
  onUbicacionChange(event: {lat: number, lng: number}) {
    this.servicioForm.patchValue({
      latitud: event.lat,
      longitud: event.lng
    });
  }

  // Categorías
  isSelectedCategoria(categoriaId: number): boolean {
    return this.selectedCategorias.includes(categoriaId);
  }

  toggleCategoria(categoriaId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked && !this.isSelectedCategoria(categoriaId)) {
      this.selectedCategorias.push(categoriaId);
    } else if (!isChecked && this.isSelectedCategoria(categoriaId)) {
      this.selectedCategorias = this.selectedCategorias.filter(id => id !== categoriaId);
    }
  }

  // Sliders
  onSlidersChange(sliders: SliderImage[]) {
    this.sliders = sliders;
  }

  onDeletedSlidersChange(deletedIds: number[]) {
    this.deletedSliderIds = deletedIds;
  }

  submitForm() {
    if (this.servicioForm.invalid || this.invalidHorarios() || this.isSubmitting) return;

    this.isSubmitting = true;

    // Preparar datos para enviar
    const formData = this.servicioForm.value;
    formData.categorias = this.selectedCategorias;

    // Convertir tiempos a formato correcto (añadir segundos si faltan)
    formData.horarios = formData.horarios.map((horario: any) => {
      // Asegurar que hora_inicio y hora_fin tengan formato correcto (HH:MM:SS)
      if (horario.hora_inicio && !horario.hora_inicio.includes(':')) {
        horario.hora_inicio = `${horario.hora_inicio}:00`;
      }
      if (horario.hora_fin && !horario.hora_fin.includes(':')) {
        horario.hora_fin = `${horario.hora_fin}:00`;
      }

      // Si solo tiene HH:MM, añadir segundos
      if (horario.hora_inicio && horario.hora_inicio.split(':').length === 2) {
        horario.hora_inicio = `${horario.hora_inicio}:00`;
      }
      if (horario.hora_fin && horario.hora_fin.split(':').length === 2) {
        horario.hora_fin = `${horario.hora_fin}:00`;
      }

      return horario;
    });

    // Añadir sliders al formData
    formData.sliders = this.sliders.map(slider => ({
      ...slider,
      // Mantener el ID si existe (para actualizaciones)
      id: slider.id || undefined,
      // Si es un archivo nuevo, mantener la referencia al archivo
      imagen: slider.imagen instanceof File ? slider.imagen : undefined,
      // Asegurarse de que es_principal tenga un valor
      es_principal: slider.es_principal === undefined ? true : slider.es_principal,
      // Si tiene orden, mantenerlo, si no asignar uno basado en la posición
      orden: slider.orden || this.sliders.indexOf(slider) + 1
    }));

    // Añadir los IDs de sliders eliminados
    formData.deleted_sliders = this.deletedSliderIds;

    // Crear o actualizar servicio
    if (this.isEditMode && this.servicioId) {
      this.turismoService.updateServicio(this.servicioId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Servicio actualizado correctamente');
          this.navigateBack();
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          this.isSubmitting = false;
          alert('Error al actualizar el servicio. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.turismoService.createServicio(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Servicio creado correctamente');
          this.navigateBack();
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          this.isSubmitting = false;
          alert('Error al crear el servicio. Por favor, intente nuevamente.');
        }
      });
    }
  }
  // Método para verificar si el formulario es válido independientemente de las validaciones normales
  isFormValid(): boolean {
    // Verificar campos básicos obligatorios
    if (!this.servicioForm.get('nombre')?.value || !this.servicioForm.get('emprendedor_id')?.value) {
      return false;
    }

    // En modo edición, permitir enviar si no hay cambios en los horarios
    if (this.isEditMode && this.horariosArray.length > 0) {
      return true;
    }

    // Verificar si los horarios son válidos - solo si hay horarios
    if (this.horariosArray.length > 0) {
      for (let i = 0; i < this.horariosArray.length; i++) {
        const group = this.getHorarioFormGroup(i);
        const inicio = group.get('hora_inicio')?.value;
        const fin = group.get('hora_fin')?.value;

        if (!inicio || !fin || inicio >= fin) {
          return false;
        }
      }
    }

    return true;
  }

  cancel() {
    this.navigateBack();
  }

  navigateBack() {
    this.router.navigateByUrl(this.backLink);
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
