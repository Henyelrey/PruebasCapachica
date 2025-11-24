import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminLayoutComponent } from '../../../../shared/layouts/admin-layout/admin-layout.component';
import { Permission } from '../../../../core/models/user.model';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ThemeService } from '../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, AdminHeaderComponent],
  template: `
      <!-- Header con fondo profesional -->
      <app-admin-header 
        [title]="isEditMode ? 'Editar Rol' : 'Crear Rol'" 
        [subtitle]="isEditMode ? 'Modificar información y permisos del rol' : 'Configura un nuevo rol en el sistema'"
      ></app-admin-header>
      
      <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div class="space-y-6 transition-colors duration-200">
          <div class="sm:flex sm:items-center sm:justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ isEditMode ? 'Formulario de Edición' : 'Formulario de Creación' }}</h2>
            <div class="mt-4 sm:mt-0">
              <a
                routerLink="/admin/roles"
                class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Volver al listado
              </a>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            @if (loading) {
              <div class="flex justify-center items-center p-8">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                <span class="ml-4 dark:text-white transition-colors duration-200">Cargando datos del rol...</span>
              </div>
            } @else {
              <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
                <!-- Campo de Nombre de Rol Mejorado -->
                <div class="space-y-2">
                  <label for="name" class="block text-base font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">Nombre del rol</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      formControlName="name"
                      class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base transition-colors duration-200"
                      [ngClass]="{'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('name')}"
                      placeholder="editor, manager, etc."
                    />
                    @if (isFieldInvalid('name')) {
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">El nombre del rol es requerido</p>
                    }
                  </div>
                </div>

                <!-- Sección de Permisos Mejorada -->
                <div class="mt-8 space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-200">Permisos</h3>
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                      {{ (roleForm.get('permissions')?.value || []).length }} seleccionados
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Seleccione los permisos que tendrán los usuarios con este rol.</p>

                  <div class="mt-4">
                    @if (loading) {
                      <div class="flex justify-center items-center p-4">
                        <div class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary-400 border-r-transparent"></div>
                        <span class="ml-2 text-sm dark:text-gray-300 transition-colors duration-200">Cargando permisos...</span>
                      </div>
                    } @else if (availablePermissions.length === 0) {
                      <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">No hay permisos disponibles.</p>
                    } @else {
                      <!-- Buscador de permisos mejorado -->
                      <div class="mb-4 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Buscar permisos..."
                          [(ngModel)]="searchTerm"
                          [ngModelOptions]="{standalone: true}"
                          class="pl-10 py-3 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base transition-colors duration-200"
                        />
                        @if (searchTerm) {
                          <button 
                            type="button" 
                            (click)="searchTerm = ''" 
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        }
                      </div>

                      <!-- Acciones rápidas mejoradas -->
                      <div class="mb-6 flex flex-wrap gap-2">
                        <button
                          type="button"
                          (click)="selectAllPermissions()"
                          class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg class="-ml-1 mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Seleccionar todo
                        </button>
                        <button
                          type="button"
                          (click)="clearAllPermissions()"
                          class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg class="-ml-1 mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Deseleccionar todo
                        </button>
                      </div>

                      <!-- Secciones de permisos agrupadas mejoradas -->
                      <div class="mt-4 space-y-5">
                        @for (group of getPermissionGroups(); track group.groupName) {
                          <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors duration-200">
                            <div class="flex items-center justify-between">
                              <h3 class="text-base font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ group.groupName }}</h3>
                              <div class="flex items-center gap-2">
                                <button
                                  type="button"
                                  (click)="selectGroupPermissions(group.permissions)"
                                  class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-colors duration-200"
                                >
                                  <svg class="-ml-0.5 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  Seleccionar
                                </button>
                                <button
                                  type="button"
                                  (click)="clearGroupPermissions(group.permissions)"
                                  class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-colors duration-200"
                                >
                                  <svg class="-ml-0.5 mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                  Quitar
                                </button>
                              </div>
                            </div>

                            <div class="mt-3 grid grid-cols-1 gap-y-2 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                              @for (permission of filterPermissions(group.permissions); track permission.id) {
                                <div class="flex items-center px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                  <input
                                    type="checkbox"
                                    [id]="'permission-' + permission.id"
                                    [value]="permission.name"
                                    [checked]="isPermissionSelected(permission.name)"
                                    (change)="togglePermission(permission.name)"
                                    class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 transition-colors duration-200"
                                  />
                                  <label [for]="'permission-' + permission.id" class="ml-3 block text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200 cursor-pointer">
                                    <span class="font-medium">{{ getDisplayName(permission.name) }}</span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400 block">{{ permission.name }}</span>
                                  </label>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  @if (roleForm.get('permissions')?.value.length === 0 && submitted) {
                    <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                          </svg>
                        </div>
                        <div class="ml-3">
                          <h3 class="text-sm font-medium text-red-800 dark:text-red-400 transition-colors duration-200">Seleccione al menos un permiso</h3>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                @if (error) {
                  <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 transition-colors duration-200">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-400 transition-colors duration-200">{{ error }}</h3>
                      </div>
                    </div>
                  </div>
                }

                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    routerLink="/admin/roles"
                    class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 dark:bg-primary-700 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    [disabled]="saving"
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
      </div>
  `,
  styles: [`
    /* Añadir estilos adicionales para el modo oscuro */
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
    
    :host-context(.dark-theme) {
      background-color: #111827;
    }
    
    /* Mejora para que el hover en dark mode sea más oscuro y no blanco */
    .dark .hover\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
    
    /* Estilos para el checkbox cuando está marcado */
    input[type="checkbox"]:checked {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
    }
  `]
})
export class RoleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  roleForm!: FormGroup;
  availablePermissions: Permission[] = [];
  roleId: number | null = null;

  loading = true;
  saving = false;
  submitted = false;
  error = '';
  searchTerm = '';
  
  constructor(private notificationService: NotificationService) {}

  get isEditMode(): boolean {
    return this.roleId !== null;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    this.loading = true;

    if (id) {
      this.roleId = +id;

      // Cargamos tanto los permisos como los datos del rol simultáneamente
      forkJoin({
        permissions: this.adminService.getPermissions(),
        roleData: this.adminService.getRole(this.roleId)
      }).subscribe({
        next: (result) => {
          this.availablePermissions = result.permissions;

          // Procesar datos del rol
          const roleData = result.roleData;
          if (roleData) {
            this.roleForm.patchValue({
              name: roleData.name
            });

            // Extraer nombres de permisos
            const permissionNames = roleData.permissions
              ? roleData.permissions.map((p: any) => p.name)
              : [];

            this.roleForm.get('permissions')?.setValue(permissionNames);
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos:', error);
          this.error = 'Error al cargar los datos. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
    } else {
      // Solo cargamos permisos para el modo creación
      this.adminService.getPermissions().subscribe({
        next: (permissions) => {
          this.availablePermissions = permissions;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar permisos:', error);
          this.error = 'Error al cargar los permisos. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
    }
  }

  initForm() {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: [[], Validators.required]
    });
  }

  loadPermissions() {
    this.adminService.getPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.error = 'Error al cargar los permisos. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  loadRole(id: number) {
    this.loading = true;
    this.adminService.getRole(id).subscribe({
      next: (roleData) => {
        // Asegurar que roleData no es null/undefined
        if (!roleData) {
          this.error = 'No se pudieron cargar los datos del rol';
          this.loading = false;
          return;
        }

        // Establecer nombre del rol
        this.roleForm.patchValue({
          name: roleData.name
        });

        // Extraer nombres de permisos, asumiendo que permissions es un array de objetos
        const permissionNames = roleData.permissions
          ? roleData.permissions.map((p: any) => p.name)
          : [];

        // Asignar permisos al formulario
        this.roleForm.get('permissions')?.setValue(permissionNames);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rol:', error);
        this.error = 'Error al cargar los datos del rol.';
        this.loading = false;
      }
    });
  }

  getPermissionNames(permissions: any): string[] {
    if (!permissions) return [];
    if (!Array.isArray(permissions)) return [];

    if (permissions.length > 0 && typeof permissions[0] === 'string') {
      return permissions as string[];
    }

    return (permissions as any[]).map(p => p.name || '').filter(name => name);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return (field?.invalid && (field?.dirty || field?.touched || this.submitted)) || false;
  }

  isPermissionSelected(permissionName: string): boolean {
    const permissions = this.roleForm.get('permissions')?.value || [];
    return permissions.includes(permissionName);
  }

  togglePermission(permissionName: string) {
    const permissions = [...this.roleForm.get('permissions')?.value || []];

    if (this.isPermissionSelected(permissionName)) {
      const index = permissions.indexOf(permissionName);
      if (index !== -1) {
        permissions.splice(index, 1);
      }
    } else {
      permissions.push(permissionName);
    }

    this.roleForm.get('permissions')?.setValue(permissions);
  }

  selectAllPermissions() {
    const allPermissions = this.availablePermissions.map(p => p.name);
    this.roleForm.get('permissions')?.setValue(allPermissions);
  }

  clearAllPermissions() {
    this.roleForm.get('permissions')?.setValue([]);
  }

  selectGroupPermissions(permissions: Permission[]) {
    const currentPermissions = [...this.roleForm.get('permissions')?.value || []];
    const permissionNames = permissions.map(p => p.name);

    permissionNames.forEach(name => {
      if (!currentPermissions.includes(name)) {
        currentPermissions.push(name);
      }
    });

    this.roleForm.get('permissions')?.setValue(currentPermissions);
  }

  clearGroupPermissions(permissions: Permission[]) {
    const currentPermissions = [...this.roleForm.get('permissions')?.value || []];
    const permissionNames = permissions.map(p => p.name);

    const filteredPermissions = currentPermissions.filter(name => !permissionNames.includes(name));
    this.roleForm.get('permissions')?.setValue(filteredPermissions);
  }

  getPermissionGroups() {
    const groups: { groupName: string, permissions: Permission[] }[] = [];
    const permissionsByPrefix: { [key: string]: Permission[] } = {};

    this.availablePermissions.forEach(permission => {
      const nameParts = permission.name.split('_');
      const prefix = nameParts[0];

      if (!permissionsByPrefix[prefix]) {
        permissionsByPrefix[prefix] = [];
      }

      permissionsByPrefix[prefix].push(permission);
    });

    Object.keys(permissionsByPrefix).forEach(prefix => {
      groups.push({
        groupName: this.capitalizeFirstLetter(prefix),
        permissions: permissionsByPrefix[prefix]
      });
    });

    return groups;
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getDisplayName(permissionName: string): string {
    const parts = permissionName.split('_');
    if (parts.length < 2) return permissionName;

    const action = parts[1];
    return this.capitalizeFirstLetter(action);
  }

  filterPermissions(permissions: Permission[]): Permission[] {
    if (!this.searchTerm.trim()) return permissions;

    return permissions.filter(permission =>
      permission.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.roleForm.invalid) {
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.roleId) {
      // Actualizar rol existente
      this.adminService.updateRole(this.roleId, this.roleForm.value).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.success("Éxito", "Rol actualizado correctamente");
          this.router.navigate(['/admin/roles']);
        },
        error: (error) => {
          console.error('Error al actualizar rol:', error);
          this.error = error.error?.message || 'Error al actualizar el rol. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    } else {
      // Crear nuevo rol
      this.adminService.createRole(this.roleForm.value).subscribe({
        next: () => {
          this.saving = false;
          alert("Rol creado correctamente");
          this.router.navigate(['/admin/roles']);
        },
        error: (error) => {
          console.error('Error al crear rol:', error);
          this.error = error.error?.message || 'Error al crear el rol. Por favor, intente nuevamente.';
          this.saving = false;
        }
      });
    }
  }
}