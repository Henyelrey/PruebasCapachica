import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

export interface SliderImage {
  id?: number;
  nombre: string;
  es_principal: boolean;
  orden: number;
  imagen?: string | File | ArrayBuffer | null;
  url_completa?: string;
  titulo?: string;
  descripcion?: string;
}

@Component({
  selector: 'app-slider-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{{ title }}</h3>
        <button 
          type="button"
          (click)="addSlider()"
          class="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Añadir Imagen
        </button>
      </div>
      
      <!-- Vista previa de sliders -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (control of sliderControls; track i; let i = $index) {
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-200">
            <div [formGroup]="getSliderFormGroup(i)">
              <!-- Previsualización de la imagen -->
              <div class="relative aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden transition-colors duration-200">
                @if (getPreviewUrl(i)) {
                  <img [src]="getPreviewUrl(i)" class="h-full w-full object-cover" alt="Vista previa de slider">
                } @else {
                  <div class="text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center p-4 text-center transition-colors duration-200">
                    <svg class="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>Selecciona una imagen</span>
                  </div>
                }
                <button 
                  type="button"
                  class="absolute top-2 right-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  (click)="removeSlider(i)"
                  title="Eliminar slider"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div class="p-4 space-y-3">
                <!-- Nombre -->
                <div>
                  <label [for]="'slider-nombre-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Nombre</label>
                  <div class="mt-2">
                    <input 
                      [id]="'slider-nombre-' + i" 
                      type="text" 
                      formControlName="nombre"
                      class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      (input)="onInputChange()"
                      [ngClass]="{'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500': getSliderFormGroup(i).get('nombre')?.invalid && getSliderFormGroup(i).get('nombre')?.touched}"
                    >
                  </div>
                  @if (getSliderFormGroup(i).get('nombre')?.invalid && getSliderFormGroup(i).get('nombre')?.touched) {
                    <p class="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">El nombre es obligatorio</p>
                  }
                </div>
                
                <!-- Tipo de slider (ahora oculto, solo para mantener compatibilidad) -->
                <input type="hidden" formControlName="es_principal">
                
                <!-- Orden -->
                <div>
                  <label [for]="'slider-orden-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Orden</label>
                  <div class="mt-2">
                    <input 
                      [id]="'slider-orden-' + i" 
                      type="number" 
                      formControlName="orden"
                      min="1"
                      class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                      (input)="onInputChange()"
                    >
                  </div>
                </div>
                
                <!-- Subir archivo -->
                <div>
                  <label [for]="'slider-imagen-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Imagen (máx. 5MB)</label>
                  <div class="mt-2">
                    <input 
                      [id]="'slider-imagen-' + i" 
                      type="file"
                      accept="image/*"
                      (change)="onFileSelected($event, i)"
                      class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-800/30 transition-colors duration-200"
                    >
                  </div>
                  @if (fileErrors[i]) {
                    <p class="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">{{ fileErrors[i] }}</p>
                  }
                </div>
                
                @if (!isSliderPrincipal) {
                  <!-- Título (solo para sliders secundarios) -->
                  <div>
                    <label [for]="'slider-titulo-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Título</label>
                    <div class="mt-2">
                      <input 
                        [id]="'slider-titulo-' + i" 
                        type="text" 
                        formControlName="titulo"
                        class="block w-full h-10 px-3 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        (input)="onInputChange()"
                        [ngClass]="{'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500': !isSliderPrincipal && getSliderFormGroup(i).get('titulo')?.invalid && getSliderFormGroup(i).get('titulo')?.touched}"
                      >
                    </div>
                    @if (!isSliderPrincipal && getSliderFormGroup(i).get('titulo')?.invalid && getSliderFormGroup(i).get('titulo')?.touched) {
                      <p class="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">El título es obligatorio para sliders secundarios</p>
                    }
                  </div>
                  
                  <!-- Descripción (solo para sliders secundarios) -->
                  <div>
                    <label [for]="'slider-descripcion-' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Descripción</label>
                    <div class="mt-2">
                      <textarea 
                        [id]="'slider-descripcion-' + i" 
                        formControlName="descripcion"
                        rows="3"
                        class="block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                        (input)="onInputChange()"
                      ></textarea>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
        
        @if (sliderControls.length === 0) {
          <div class="col-span-full p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg transition-colors duration-200">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">No hay imágenes</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Añade imágenes para los sliders</p>
            <div class="mt-6">
              <button 
                type="button"
                (click)="addSlider()"
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Añadir Imagen
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class SliderUploadComponent implements OnInit {
  @Input() title = 'Imágenes de Slider';
  @Input() slidersFormArray!: FormArray;
  @Input() existingSliders: SliderImage[] = [];
  @Input() isSliderPrincipal: boolean = true; // Indicador si este componente maneja sliders principales
  @Output() changeSlidersEvent = new EventEmitter<SliderImage[]>();
  @Output() deletedSlidersEvent = new EventEmitter<number[]>();
  
  private filePreviewUrls: {[index: number]: string | ArrayBuffer | null} = {};
  private fileStore: {[index: number]: File | null} = {}; // Almacén para archivos de imagen
  private deletedSliderIds: number[] = [];
  fileErrors: {[index: number]: string} = {}; // Para almacenar errores de archivo
  
  // Constante para el tamaño máximo de archivo (5MB)
  private readonly MAX_FILE_SIZE = 12 * 1024 * 1024; // 5MB en bytes
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    // Limpiar FormArray existente
    while (this.slidersFormArray.length !== 0) {
      this.slidersFormArray.removeAt(0);
    }
    
    // Limpiar almacenes
    this.filePreviewUrls = {};
    this.fileStore = {};
    this.deletedSliderIds = [];
    this.fileErrors = {};
    
    // Añadir sliders existentes al FormArray
    if (this.existingSliders && this.existingSliders.length > 0) {
      this.existingSliders.forEach((slider, index) => {
        // Crear un FormGroup para cada slider
        const sliderGroup = this.fb.group({
          id: [slider.id],
          nombre: [slider.nombre, Validators.required],
          es_principal: [this.isSliderPrincipal], // Siempre fijo basado en el tipo de componente
          orden: [slider.orden, Validators.required],
          titulo: [slider.titulo || '', this.isSliderPrincipal ? [] : [Validators.required]],
          descripcion: [slider.descripcion || '']
        });
        
        // Añadir el FormGroup al FormArray
        this.slidersFormArray.push(sliderGroup);
        
        // Guardar la URL para previsualización
        if (slider.url_completa) {
          this.filePreviewUrls[index] = slider.url_completa;
        } else if (typeof slider.imagen === 'string') {
          this.filePreviewUrls[index] = slider.imagen;
        }
      });
      
      // Emitir los sliders iniciales
      this.emitSlidersChange();
    }
  }
  
  get sliderControls() {
    return this.slidersFormArray.controls;
  }
  
  getSliderFormGroup(index: number): FormGroup {
    return this.slidersFormArray.at(index) as FormGroup;
  }
  
  createSliderFormGroup(): FormGroup {
    // Para Angular 19, creamos los controles completos desde el inicio para evitar problemas de tipo
    const controls: {[key: string]: any} = {
      id: [null],
      nombre: ['', Validators.required],
      es_principal: [this.isSliderPrincipal], // Fijo según el tipo de slider
      orden: [this.slidersFormArray.length + 1, Validators.required]
    };
    
    // Añadir campos adicionales para sliders secundarios
    if (!this.isSliderPrincipal) {
      controls['titulo'] = ['', Validators.required];
      controls['descripcion'] = [''];
    } else {
      // Para mantener consistencia en la estructura, añadimos los campos pero los dejamos vacíos
      controls['titulo'] = [''];
      controls['descripcion'] = [''];
    }
    
    return this.fb.group(controls);
  }
  
  addSlider() {
    const index = this.slidersFormArray.length;
    this.slidersFormArray.push(this.createSliderFormGroup());
    
    // Initialize the image preview and file storage for this index
    this.filePreviewUrls[index] = null;
    this.fileStore[index] = null;
    
    console.log(`Added new slider at index ${index}, total: ${this.slidersFormArray.length}`);
    this.emitSlidersChange(); // Emitir cambio al añadir un nuevo slider
  }
  
  removeSlider(index: number) {
    const sliderId = this.getSliderFormGroup(index).get('id')?.value;
    if (sliderId) {
      this.deletedSliderIds.push(sliderId);
      this.deletedSlidersEvent.emit(this.deletedSliderIds);
    }
    
    this.slidersFormArray.removeAt(index);
    delete this.filePreviewUrls[index];
    delete this.fileStore[index];
    delete this.fileErrors[index];
    
    // Reordenar los indices en filePreviewUrls y fileStore
    const newFilePreviewUrls: {[index: number]: string | ArrayBuffer | null} = {};
    const newFileStore: {[index: number]: File | null} = {};
    const newFileErrors: {[index: number]: string} = {};
    
    Object.keys(this.filePreviewUrls).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        newFilePreviewUrls[numKey - 1] = this.filePreviewUrls[numKey];
        newFileStore[numKey - 1] = this.fileStore[numKey];
        if (this.fileErrors[numKey]) {
          newFileErrors[numKey - 1] = this.fileErrors[numKey];
        }
      } else if (numKey < index) {
        newFilePreviewUrls[numKey] = this.filePreviewUrls[numKey];
        newFileStore[numKey] = this.fileStore[numKey];
        if (this.fileErrors[numKey]) {
          newFileErrors[numKey] = this.fileErrors[numKey];
        }
      }
    });
    
    this.filePreviewUrls = newFilePreviewUrls;
    this.fileStore = newFileStore;
    this.fileErrors = newFileErrors;
    
    this.emitSlidersChange();
  }
  
  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > this.MAX_FILE_SIZE) {
        this.fileErrors[index] = `El archivo excede el tamaño máximo de 5MB (Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
        // Limpiar el input de archivo
        input.value = '';
        return;
      }
      
      // Limpiar errores previos si existían
      delete this.fileErrors[index];
      
      // Guardar el archivo en nuestro almacén
      this.fileStore[index] = file;
      
      // Generar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreviewUrls[index] = reader.result;
        this.emitSlidersChange();
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Método para reaccionar a cambios en los inputs
  onInputChange() {
    this.emitSlidersChange();
  }
  
  getPreviewUrl(index: number): string | null {
    return this.filePreviewUrls[index] as string || null;
  }
  
  emitSlidersChange() {
    // Verificar si el formulario tiene elementos
    if (this.slidersFormArray.length === 0) {
      this.changeSlidersEvent.emit([]);
      return;
    }
    
    const sliders: SliderImage[] = this.slidersFormArray.controls.map((control, index) => {
      const formGroup = control as FormGroup;
      const values = formGroup.value;
      
      // Verificar si tenemos un archivo nuevo en el almacén 
      const imagen = this.fileStore[index] || undefined;
      
      const slider: SliderImage = {
        id: values.id,
        nombre: values.nombre || '',
        es_principal: this.isSliderPrincipal, // Siempre basado en el tipo de componente
        orden: values.orden || index + 1,
        // Solo incluir imagen si hay un archivo nuevo o URL existente
        ...(imagen ? { imagen } : {}),
        url_completa: typeof this.filePreviewUrls[index] === 'string' ? this.filePreviewUrls[index] as string : undefined
      };
      
      // Para sliders secundarios, incluir siempre título y descripción
      if (!this.isSliderPrincipal) {
        // Obtener directamente los valores del formulario
        slider.titulo = formGroup.get('titulo')?.value || '';
        slider.descripcion = formGroup.get('descripcion')?.value || '';
      }
      
      return slider;
    });
    
    this.changeSlidersEvent.emit(sliders);
  }
  
  // Método para validar si hay errores de archivo
  hasFileErrors(): boolean {
    return Object.keys(this.fileErrors).length > 0;
  }
  
  // Método para verificar si todos los sliders son válidos
  areAllSlidersValid(): boolean {
    // Verificar si hay errores de archivo
    if (this.hasFileErrors()) {
      return false;
    }
    
    // Verificar si todos los grupos de formularios son válidos
    for (let i = 0; i < this.slidersFormArray.length; i++) {
      const formGroup = this.getSliderFormGroup(i);
      if (formGroup.invalid) {
        return false;
      }
    }
    
    return true;
  }
}