import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { Emprendimiento, AdminRequest } from '../../../core/models/emprendimiento-admin.model';
import { User } from '../../../core/models/user.model';

interface ValidationErrors {
  [key: string]: string[];
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationErrors;
}

@Component({
  selector: 'app-administradores-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <!-- Loading state glassmorphism -->
    <div *ngIf="loading && !emprendimiento" class="flex items-center justify-center h-64">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Main content glassmorphism -->
    <div *ngIf="!loading || emprendimiento" class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Administradores
          </h1>
          <p class="text-slate-300 dark:text-slate-400 mt-1">
            Gestiona los administradores de {{ emprendimiento?.nombre || 'tu emprendimiento' }}
          </p>
        </div>
        <button (click)="refreshData()" 
                [disabled]="loading"
                class="group flex items-center px-5 py-2.5 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 disabled:opacity-50">
          <svg *ngIf="!loading" class="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <div *ngIf="loading" class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span class="font-medium">Actualizar</span>
        </button>
      </div>

      <!-- Error global -->
      <div *ngIf="globalError" class="backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-red-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-red-200 font-semibold">{{ globalError }}</h3>
            <button (click)="loadEmprendimiento()" 
                    class="mt-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium">
              Reintentar
            </button>
          </div>
        </div>
      </div>

      <!-- Formulario para Agregar Administrador glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 rounded-lg bg-orange-500/20 text-orange-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-white">Agregar Nuevo Administrador</h2>
        </div>

        <form [formGroup]="adminForm" (ngSubmit)="addAdministrador()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-slate-300 dark:text-slate-300">
                Email del Usuario *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email" 
                  class="block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                  [ngClass]="{
                    'border-slate-600/50 bg-white/10 dark:bg-slate-800/30 text-white': !hasFieldError('email'),
                    'border-red-400/50 bg-red-500/10 text-white': hasFieldError('email')
                  }"
                  placeholder="usuario@ejemplo.com">
              </div>
              <!-- Errores del campo email -->
              <div *ngIf="hasFieldError('email')" class="space-y-1">
                <p *ngFor="let error of getFieldErrors('email')" class="text-sm text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ error }}
                </p>
              </div>
              <!-- Errores de validación del frontend -->
              <div *ngIf="adminForm.get('email')?.invalid && adminForm.get('email')?.touched && !hasFieldError('email')" class="space-y-1">
                <p *ngIf="adminForm.get('email')?.errors?.['required']" class="text-sm text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  El email es requerido
                </p>
                <p *ngIf="adminForm.get('email')?.errors?.['email']" class="text-sm text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  El formato del email no es válido
                </p>
              </div>
            </div>
            
            <!-- Rol -->
            <div class="space-y-2">
              <label for="rol" class="block text-sm font-medium text-slate-300 dark:text-slate-300">
                Rol *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <select 
                  id="rol" 
                  formControlName="rol" 
                  class="block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300"
                  [ngClass]="{
                    'border-slate-600/50 bg-white/10 dark:bg-slate-800/30 text-white': !hasFieldError('rol'),
                    'border-red-400/50 bg-red-500/10 text-white': hasFieldError('rol')
                  }">
                  <option value="" class="bg-slate-800 text-white">Seleccionar rol</option>
                  <option value="administrador" class="bg-slate-800 text-white">Administrador</option>
                  <option value="colaborador" class="bg-slate-800 text-white">Colaborador</option>
                  <option value="moderador" class="bg-slate-800 text-white">Moderador</option>
                </select>
              </div>
              <!-- Errores del campo rol -->
              <div *ngIf="hasFieldError('rol')" class="space-y-1">
                <p *ngFor="let error of getFieldErrors('rol')" class="text-sm text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ error }}
                </p>
              </div>
              <!-- Errores de validación del frontend -->
              <div *ngIf="adminForm.get('rol')?.invalid && adminForm.get('rol')?.touched && !hasFieldError('rol')" class="space-y-1">
                <p *ngIf="adminForm.get('rol')?.errors?.['required']" class="text-sm text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  El rol es requerido
                </p>
              </div>
            </div>
          </div>
          
          <!-- Es Principal -->
          <div class="flex items-center gap-3">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                formControlName="es_principal"
                class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-600/50 rounded bg-white/10 transition-all duration-300">
              <span class="ml-3 text-sm text-slate-300 font-medium">
                Administrador Principal
              </span>
            </label>
            <div class="group relative">
              <svg class="h-4 w-4 text-slate-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="absolute bottom-6 left-0 hidden group-hover:block bg-slate-800/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 border border-slate-600/50">
                Los administradores principales no pueden ser eliminados
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="adminForm.invalid || addingAdmin"
              class="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg *ngIf="addingAdmin" class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <svg *ngIf="!addingAdmin" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              {{ addingAdmin ? 'Agregando...' : 'Agregar Administrador' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Lista de Administradores glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
        <div class="p-6 border-b border-white/20 dark:border-slate-600/50">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">
              Administradores Actuales ({{ emprendimiento?.administradores?.length || 0 }})
            </h2>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Sin Administradores -->
          <div *ngIf="!loading && !globalError && (!emprendimiento?.administradores?.length)" class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <h3 class="text-lg font-semibold text-white mb-2">No hay administradores</h3>
            <p class="text-slate-300 dark:text-slate-400">
              Este emprendimiento aún no tiene administradores registrados.
            </p>
          </div>
          
          <!-- Tabla de Administradores -->
          <div *ngIf="!loading && !globalError && (emprendimiento?.administradores ?? []).length > 0" class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="border-b border-white/20 dark:border-slate-600/50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Rol</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-4 text-right text-sm font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10 dark:divide-slate-600/30">
                <tr *ngFor="let admin of emprendimiento?.administradores; trackBy: trackByAdminId" 
                    class="hover:bg-white/5 dark:hover:bg-slate-700/30 transition-all duration-300">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img 
                          *ngIf="admin.foto_perfil_url" 
                          [src]="admin.foto_perfil_url" 
                          [alt]="admin.name"
                          class="h-10 w-10 rounded-full object-cover border-2 border-white/20">
                        <div 
                          *ngIf="!admin.foto_perfil_url" 
                          class="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border-2 border-white/20">
                          <span class="text-sm font-semibold text-orange-300">{{ getInitials(admin.name) }}</span>
                        </div>
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-white">{{ admin.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-300">{{ admin.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full"
                           [ngClass]="{
                             'bg-blue-400': admin.pivot?.rol === 'administrador',
                             'bg-green-400': admin.pivot?.rol === 'colaborador',
                             'bg-purple-400': admin.pivot?.rol === 'moderador'
                           }"></div>
                      <span class="text-sm text-slate-300">{{ admin.pivot?.rol | titlecase }}</span>
                      <span *ngIf="admin.pivot?.es_principal" 
                            class="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-400/30">
                        Principal
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="admin.active ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'">
                      <div class="w-1.5 h-1.5 rounded-full"
                           [ngClass]="admin.active ? 'bg-green-400' : 'bg-red-400'"></div>
                      {{ admin.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      *ngIf="!admin.pivot?.es_principal"
                      (click)="removeAdministrador(admin)"
                      [disabled]="adminStates[admin.id!].removing"
                      class="inline-flex items-center px-3 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium border border-red-400/30 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <svg *ngIf="adminStates[admin.id!]?.removing" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <svg *ngIf="!adminStates[admin.id!]?.removing" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      {{ adminStates[admin.id!].removing ? 'Eliminando...' : 'Eliminar' }}
                    </button>
                    <span *ngIf="admin.pivot?.es_principal" class="text-slate-400 text-sm italic">
                      No removible
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
  `]
})
export class AdministradoresListComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  // Estados para el control de cada administrador
  adminStates: { [key: number]: { removing?: boolean } } = {};
  
  // Propiedades principales
  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  loading = true;
  globalError = '';
  addingAdmin = false;

  // Formulario reactivo
  adminForm!: FormGroup;
  
  // Errores de validación del backend
  validationErrors: ValidationErrors = {};

  ngOnInit(): void {
    this.initForm();
    
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Administradores - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        this.loadEmprendimiento();
      } else {
        console.error('Administradores - ID inválido:', id);
        this.globalError = 'ID de emprendimiento inválido';
      }
    });
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      es_principal: [false]
    });
  }

  /**
   * Carga los datos del emprendimiento y sus administradores
   */
  loadEmprendimiento(): void {
    this.loading = true;
    this.globalError = '';

    this.emprendimientoAdminService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.loading = false;
        
        // Inicializar estados de administradores
        if (data.administradores) {
          data.administradores.forEach(admin => {
            if (admin.id) {
              this.adminStates[admin.id] = {};
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.globalError = err.error?.message || 'Error al cargar el emprendimiento';
        this.loading = false;
      }
    });
  }

  /**
   * Refresca los datos del componente
   */
  refreshData(): void {
    this.loadEmprendimiento();
  }

  /**
   * Agrega un nuevo administrador al emprendimiento
   */
  async addAdministrador(): Promise<void> {
    if (this.adminForm.invalid || this.addingAdmin) return;

    this.addingAdmin = true;
    this.validationErrors = {};
    this.globalError = '';

    try {
      const adminData: AdminRequest = this.adminForm.value;
      
      await this.emprendimientoAdminService.addAdministrador(this.emprendimientoId, adminData).toPromise();
      
      // Reset form
      this.adminForm.reset({
        email: '',
        rol: '',
        es_principal: false
      });
      
      // Marcar como pristine para limpiar validaciones
      this.adminForm.markAsUntouched();
      this.adminForm.markAsPristine();
      
      // Limpiar errores de validación
      this.validationErrors = {};
      
      // Recargar datos
      this.loadEmprendimiento();
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage('Administrador agregado correctamente');
      
    } catch (err: any) {
      console.error('Error al agregar administrador:', err);
      
      // Manejar errores de validación del backend
      if (err.error && err.error.errors) {
        this.validationErrors = err.error.errors;
      } else {
        this.globalError = err.error?.message || 'Error al agregar el administrador';
      }
    } finally {
      this.addingAdmin = false;
    }
  }

  /**
   * Elimina un administrador del emprendimiento
   */
  async removeAdministrador(admin: User): Promise<void> {
    if (!admin.id || this.adminStates[admin.id]?.removing || admin.pivot?.es_principal) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar a ${admin.name} como administrador?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) return;

    // Marcar como eliminando
    this.adminStates[admin.id] = { removing: true };

    try {
      await this.emprendimientoAdminService.removeAdministrador(this.emprendimientoId, admin.id).toPromise();
      
      // Actualizar lista local
      if (this.emprendimiento?.administradores) {
        this.emprendimiento.administradores = this.emprendimiento.administradores.filter(a => a.id !== admin.id);
      }
      
      // Limpiar estado
      delete this.adminStates[admin.id];
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage('Administrador eliminado correctamente');
      
    } catch (err: any) {
      console.error('Error al eliminar administrador:', err);
      this.globalError = err.error?.message || 'Error al eliminar el administrador';
      
      // Restaurar estado
      this.adminStates[admin.id] = { removing: false };
    }
  }

  /**
   * Verifica si un campo tiene errores de validación del backend
   */
  hasFieldError(fieldName: string): boolean {
    return this.validationErrors[fieldName] && this.validationErrors[fieldName].length > 0;
  }

  /**
   * Obtiene los errores de validación del backend para un campo específico
   */
  getFieldErrors(fieldName: string): string[] {
    return this.validationErrors[fieldName] || [];
  }

  /**
   * Obtiene las iniciales de un nombre para mostrar en el avatar
   */
  getInitials(name: string): string {
    if (!name) return '?';
    
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * TrackBy function para mejorar performance en ngFor
   */
  trackByAdminId(index: number, admin: User): number {
    return admin.id || index;
  }

  /**
   * Muestra un mensaje de éxito temporal
   */
  private showSuccessMessage(message: string): void {
    // Implementar notificación toast o alert temporal
    // Por ahora usamos alert, pero se puede mejorar con un servicio de notificaciones
    alert(message);
  }

  /**
   * Getter para obtener el rol traducido
   */
  getRolDisplayName(rol: string): string {
    const roles: { [key: string]: string } = {
      'administrador': 'Administrador',
      'colaborador': 'Colaborador',
      'moderador': 'Moderador'
    };
    return roles[rol] || rol;
  }

  /**
   * Verifica si un usuario puede ser eliminado
   */
  canRemoveAdmin(admin: User): boolean {
    return !admin.pivot?.es_principal && !this.adminStates[admin.id!]?.removing;
  }

  /**
   * Obtiene el color del rol para la UI
   */
  getRolColor(rol: string): string {
    const colors: { [key: string]: string } = {
      'administrador': 'text-blue-300',
      'colaborador': 'text-green-300',
      'moderador': 'text-purple-300'
    };
    return colors[rol] || 'text-gray-300';
  }
}