import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminLayoutComponent } from '../../../../shared/layouts/admin-layout/admin-layout.component';
import { Permission } from '../../../../core/models/user.model';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
      <div class="space-y-6 transition-colors duration-300">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Permisos del Sistema</h1>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-colors duration-300">
          <div class="p-6">
            <p class="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Los permisos son las acciones específicas que los usuarios pueden realizar en el sistema.
              Estos permisos se asignan a roles, y los roles se asignan a usuarios.
            </p>

            <!-- Buscador -->
            <div class="mt-4">
              <div class="relative rounded-md shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Buscar permisos..."
                  class="py-2 block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          @if (loading) {
            <div class="flex justify-center items-center p-8">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
              <span class="ml-4 dark:text-white transition-colors duration-300">Cargando permisos...</span>
            </div>
          } @else if (getPermissionGroups().length === 0) {
            <div class="p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">No se encontraron permisos</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">No hay permisos disponibles en el sistema.</p>
            </div>
          } @else {
            <div class="px-6 pb-6">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                @for (group of getPermissionGroups(); track group.groupName) {
                  <div class="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden transition-colors duration-300">
                    <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{{ group.groupName }}</h3>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{{ group.permissions.length }} permisos</p>
                    </div>
                    <div class="p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
                      <ul class="space-y-2">
                        @for (permission of filterPermissions(group.permissions); track permission.id) {
                          <li class="flex items-start">
                            <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                              <span class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{{ permission.name }}</span>
                              <p class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">ID: {{ permission.id }}</p>
                            </div>
                          </li>
                        }
                      </ul>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
  `,
})
export class PermissionListComponent implements OnInit {
  private adminService = inject(AdminService);
  private themeService = inject(ThemeService);

  permissions: Permission[] = [];
  loading = true;
  searchTerm = '';

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.loading = true;
    this.adminService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.loading = false;
      }
    });
  }

  getPermissionGroups() {
    const groups: { groupName: string, permissions: Permission[] }[] = [];
    const permissionsByPrefix: { [key: string]: Permission[] } = {};

    this.permissions.forEach(permission => {
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
        permissions: permissionsByPrefix[prefix].sort((a, b) => a.name.localeCompare(b.name))
      });
    });

    return groups.sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  filterPermissions(permissions: Permission[]): Permission[] {
    if (!this.searchTerm.trim()) return permissions;

    return permissions.filter(permission =>
      permission.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
