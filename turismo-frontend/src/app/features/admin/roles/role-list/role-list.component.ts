import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, Permission } from '../../../../core/services/admin.service';
import { AdminLayoutComponent } from '../../../../shared/layouts/admin-layout/admin-layout.component';
import { Role } from '../../../../core/models/user.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminHeaderComponent],
  template: `
      <!-- Header con fondo profesional -->
      <app-admin-header 
        title="Gestión de Roles" 
        subtitle="Administra los roles y sus permisos en el sistema"
      ></app-admin-header>
      
      <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Listado de Roles</h2>
            <div class="mt-4 sm:mt-0">
              <a
                routerLink="/admin/roles/create"
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Rol
              </a>
            </div>
          </div>

          <div class="rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            @if (loading) {
              <div class="flex justify-center items-center p-8">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
                <span class="ml-4 text-gray-900 dark:text-gray-200">Cargando roles...</span>
              </div>
            } @else if (roles.length === 0) {
              <div class="p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron roles</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando un nuevo rol.</p>
                <div class="mt-6">
                  <a routerLink="/admin/roles/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200">
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Nuevo Rol
                  </a>
                </div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Permisos</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @for (role of roles; track role.id) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <span class="text-blue-800 dark:text-blue-300 font-medium">{{ getRoleInitials(role) }}</span>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ role.name }}</div>
                              <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ role.id }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex flex-wrap gap-1 max-w-md">
                            @if (getPermissions(role).length) {
                              @for (permission of getPermissions(role).slice(0, 5); track permission) {
                                <span class="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 transition-colors duration-200">
                                  {{ permission }}
                                </span>
                              }
                              @if (getPermissions(role).length > 5) {
                                <span class="inline-flex rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300 transition-colors duration-200">
                                  +{{ getPermissions(role).length - 5 }} más
                                </span>
                              }
                            } @else {
                              <span class="text-xs text-gray-500 dark:text-gray-400">Sin permisos</span>
                            }
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div class="flex items-center justify-end space-x-2">
                            <a
                              [routerLink]="['/admin/roles/edit', role.id]"
                              class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                              title="Editar"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </a>
                            <button
                              (click)="deleteRole(role)"
                              class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                              title="Eliminar"
                              [disabled]="isDefaultRole(role.name)"
                            >
                              <svg class="h-5 w-5" [class.opacity-50]="isDefaultRole(role.name)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  `]
})
export class RoleListComponent implements OnInit {
  private adminService = inject(AdminService);
  private themeService = inject(ThemeService);

  roles: Role[] = [];
  loading = true;


  // Roles que no se pueden eliminar
  defaultRoles = ['admin', 'user'];

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles recibidos:', roles);
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.loading = false;
      }
    });
  }

  getRoleInitials(role: Role): string {
    if (!role || !role.name) return '';

    const nameParts = role.name.split(/[-_\s]/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }

  getPermissions(role: Role): string[] {
    if (!role.permissions || role.permissions.length === 0) {
      return [];
    }

    // Si los permisos son objetos completos (como en la respuesta API)
    if (typeof role.permissions[0] === 'object') {
      return (role.permissions as Permission[]).map(p => p.name);
    }

    // Si ya son strings
    return role.permissions as string[];
  }

  isDefaultRole(roleName: string): boolean {
    return this.defaultRoles.includes(roleName);
  }

  deleteRole(role: Role) {
    if (this.isDefaultRole(role.name)) {
      alert('No se pueden eliminar los roles predeterminados del sistema.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`)) {
      this.adminService.deleteRole(role.id).subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== role.id);
          alert(`El rol "${role.name}" ha sido eliminado correctamente.`);
        },
        error: (error) => {
          console.error('Error al eliminar rol:', error);
          alert(`Error al eliminar el rol: ${error.error?.message || 'Ha ocurrido un error'}`);
        }
      });
    }
  }

  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}