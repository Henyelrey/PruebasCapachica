import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminLayoutComponent } from '../../../../shared/layouts/admin-layout/admin-layout.component';
import { Permission, UserPermissions } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
      <div class="space-y-6">
        <div class="sm:flex sm:items-center sm:justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Permisos de Usuario</h1>
          <div class="mt-4 sm:mt-0">
            <a 
              routerLink="/admin/users" 
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
            >
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver al listado
            </a>
          </div>
        </div>
        
        @if (loading) {
          <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div class="flex items-center justify-center p-8">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
              <span class="ml-4 text-gray-700 dark:text-gray-300">Cargando permisos...</span>
            </div>
          </div>
        } 
        @else if (error) {
          <div class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</h3>
              </div>
            </div>
          </div>
        } 
        @else {
          <div class="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
            <div class="border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-800">
              <div class="flex flex-wrap items-center">
                <div class="flex-shrink-0">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50">
                    <span class="text-lg font-medium text-primary-800 dark:text-primary-300">{{ getUserInitials(userPermissions?.user) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-white">{{ userPermissions?.user?.name }}</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ userPermissions?.user?.email }}</p>
                </div>
              </div>
            </div>
            
            <div class="px-6 py-5">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Administrar Permisos</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Seleccione los permisos que desea asignar directamente a este usuario.</p>
              
              <div class="mt-6 space-y-6">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Permisos disponibles</h4>
                  <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    @for (permission of availablePermissions; track permission.id) {
                      <div class="flex items-center">
                        <input 
                          type="checkbox" 
                          [id]="'permission-' + permission.id" 
                          [value]="permission.name" 
                          [checked]="isPermissionSelected(permission.name)"
                          (change)="togglePermission(permission.name)"
                          class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                        />
                        <label [for]="'permission-' + permission.id" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          {{ permission.name }}
                        </label>
                      </div>
                    }
                  </div>
                </div>
                
                <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Permisos desde roles</h4>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Estos permisos provienen de los roles asignados al usuario y no pueden ser modificados directamente.</p>
                  
                  <div class="mt-4">
                    @if (userPermissions?.permissions_via_roles?.length) {
                      <div class="flex flex-wrap gap-2">
                        @for (permission of userPermissions?.permissions_via_roles; track permission) {
                          <span class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {{ permission }}
                          </span>
                        }
                      </div>
                    } @else {
                      <p class="text-sm italic text-gray-500 dark:text-gray-400">Este usuario no tiene permisos asignados a través de roles.</p>
                    }
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button 
                    type="button" 
                    (click)="savePermissions()"
                    class="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                    [disabled]="saving"
                  >
                    @if (saving) {
                      <svg class="-ml-1 mr-2 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    } @else {
                      Guardar Cambios
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
  `,
})
export class UserPermissionsComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  userId: number | null = null;
  userPermissions: UserPermissions | null = null;
  availablePermissions: Permission[] = [];
  selectedPermissions: string[] = [];
  
  loading = true;
  saving = false;
  error = '';
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadPermissions();
      this.loadAllPermissions();
    } else {
      this.error = 'ID de usuario no válido';
      this.loading = false;
    }
  }
  
  loadPermissions() {
    if (!this.userId) return;
    
    this.adminService.getUserPermissions(this.userId).subscribe({
      next: (response) => {
        this.userPermissions = response.data;
        this.selectedPermissions = [...(this.userPermissions?.direct_permissions ?? [])];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos del usuario:', error);
        this.error = 'Error al cargar los permisos del usuario. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }
  
  loadAllPermissions() {
    this.adminService.getPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions;
      },
      error: (error) => {
        console.error('Error al cargar permisos disponibles:', error);
        this.error = 'Error al cargar los permisos disponibles. Por favor, intente nuevamente.';
      }
    });
  }
  
  getUserInitials(user: any): string {
    if (!user || !user.name) return '';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  isPermissionSelected(permissionName: string): boolean {
    return this.selectedPermissions.includes(permissionName);
  }
  
  togglePermission(permissionName: string) {
    const index = this.selectedPermissions.indexOf(permissionName);
    if (index === -1) {
      this.selectedPermissions.push(permissionName);
    } else {
      this.selectedPermissions.splice(index, 1);
    }
  }
  
  savePermissions() {
    if (!this.userId) return;
    
    this.saving = true;
    this.error = '';
    
    this.adminService.assignPermissionsToUser(this.userId, this.selectedPermissions).subscribe({
      next: () => {
        this.saving = false;
        alert('Permisos guardados correctamente');
        this.loadPermissions(); // Recargar los permisos actualizados
      },
      error: (error) => {
        console.error('Error al guardar permisos:', error);
        this.error = error.error?.message || 'Error al guardar los permisos. Por favor, intente nuevamente.';
        this.saving = false;
      }
    });
  }
}