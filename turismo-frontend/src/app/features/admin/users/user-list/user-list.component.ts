import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, PaginatedResponse } from '../../../../core/services/admin.service';
import { ExtendedUser } from '../../../../core/models/user.model';
import { ThemeService } from '../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
      <!-- Header con fondo profesional -->
      <app-admin-header 
        title="Gestión de Usuarios" 
        subtitle="Administra los usuarios del sistema"
      ></app-admin-header>
      
      <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Listado de Usuarios</h2>
            <div class="mt-4 sm:mt-0">
              <a 
                routerLink="/admin/users/create" 
                class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nuevo Usuario
              </a>
            </div>
          </div>
          
          <!-- Filtros -->
          <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
                <div class="mt-1">
                  <input 
                    type="text" 
                    id="search" 
                    [(ngModel)]="filters.search" 
                    placeholder="Nombre o email" 
                    class="input-estilo block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  >
                </div>
              </div>
              
              <div>
                <label for="active" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <div class="mt-1">
                  <select 
                    id="active" 
                    [(ngModel)]="filters.active" 
                    class="select-estilo block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  >
                    <option [ngValue]="undefined">Todos</option>
                    <option [ngValue]="true">Activos</option>
                    <option [ngValue]="false">Inactivos</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                <div class="mt-1">
                  <select 
                    id="role" 
                    [(ngModel)]="filters.role" 
                    class="select-estilo block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  >
                    <option value="">Todos</option>
                    @for (role of roles; track role.id) {
                      <option [value]="role.name">{{ role.name }}</option>
                    }
                  </select>
                </div>
              </div>
              
              <div class="flex items-end">
                <button 
                  type="button" 
                  (click)="applyFilters()" 
                  class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                  </svg>
                  Filtrar
                </button>
              </div>
            </div>
          </div>
          
          <!-- Tabla de usuarios -->
          <div class="rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden transition-colors duration-200 border border-gray-200 dark:border-gray-700">
            @if (loading) {
              <div class="flex justify-center items-center p-8">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 dark:border-primary-600 border-r-transparent"></div>
                <span class="ml-4 text-gray-900 dark:text-gray-200">Cargando usuarios...</span>
              </div>
            } @else if (users.length === 0) {
              <div class="p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron usuarios</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza creando un nuevo usuario.</p>
                <div class="mt-6">
                  <a routerLink="/admin/users/create" class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200">
                    <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Nuevo Usuario
                  </a>
                </div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Teléfono</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @for (user of users; track user.id) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                              @if (user.foto_perfil) {
                                <img [src]="user.foto_perfil" [alt]="user.name" class="h-10 w-10 rounded-full object-cover">
                              } @else {
                                <span class="text-primary-800 dark:text-primary-300 font-medium">{{ getUserInitials(user) }}</span>
                              }
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                              <div *ngIf="user.country" class="text-xs text-gray-500 dark:text-gray-400">
                                {{ user.country }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {{ user.email }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {{ user.phone || 'No especificado' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex flex-wrap gap-1">
                            @if (user.roles?.length) {
                              @for (role of user.roles; track $index) {
                                <span class="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 transition-colors duration-200">
                                  {{ role }}
                                </span>
                              }
                            } @else {
                              <span class="text-xs text-gray-500 dark:text-gray-400">Sin roles</span>
                            }
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          @if (user.active) {
                            <span class="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300 transition-colors duration-200">
                              Activo
                            </span>
                          } @else {
                            <span class="inline-flex rounded-full bg-red-100 dark:bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:text-red-300 transition-colors duration-200">
                              Inactivo
                            </span>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div class="flex items-center justify-end space-x-2">
                            @if (user.active) {
                              <button 
                                (click)="deactivateUser(user)" 
                                class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                                title="Desactivar"
                              >
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                                </svg>
                              </button>
                            } @else {
                              <button 
                                (click)="activateUser(user)" 
                                class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200"
                                title="Activar"
                              >
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </button>
                            }
                            
                            <a 
                              [routerLink]="['/admin/users/edit', user.id]" 
                              class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                              title="Editar"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </a>
                            
                            <a 
                              [routerLink]="['/admin/users', user.id, 'permissions']" 
                              class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                              title="Permisos"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                              </svg>
                            </a>
                            
                            <button 
                              (click)="deleteUser(user)" 
                              class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
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
              
              <!-- Paginación -->
              @if (pagination) {
                <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 sm:px-6">
                  <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p class="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          (click)="goToPage(currentPage - 1)"
                          [disabled]="!pagination.prev_page_url"
                          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-200"
                          [class.opacity-50]="!pagination.prev_page_url"
                          [class.cursor-not-allowed]="!pagination.prev_page_url"
                        >
                          <span class="sr-only">Anterior</span>
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        
                        @for (link of pagination.links; track $index) {
                          @if (link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;') {
                            <button
                              (click)="goToPage(+link.label)"
                              class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium transition-colors duration-200"
                              [class.bg-primary-50]="link.active && !isDarkMode()"
                              [class.dark:bg-primary-900]="link.active && isDarkMode()"
                              [class.text-primary-600]="link.active && !isDarkMode()"
                              [class.dark:text-primary-300]="link.active && isDarkMode()"
                              [class.text-gray-700]="!link.active && !isDarkMode()"
                              [class.dark:text-gray-300]="!link.active && isDarkMode()"
                              [class.hover:bg-gray-50]="!link.active && !isDarkMode()"
                              [class.dark:hover:bg-gray-650]="!link.active && isDarkMode()"
                              [disabled]="link.active"
                            >
                              {{ link.label }}
                            </button>
                          }
                        }

                        
                        <button
                          (click)="goToPage(currentPage + 1)"
                          [disabled]="!pagination.next_page_url"
                          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors duration-200"
                          [class.opacity-50]="!pagination.next_page_url"
                          [class.cursor-not-allowed]="!pagination.next_page_url"
                        >
                          <span class="sr-only">Siguiente</span>
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
  `,
  styles: [`
    /* Estilos globales para el componente */
    :host {
      display: block;
    }
    
    /* Fixes específicos para Tailwind con dark mode */
    :host ::ng-deep .dark .bg-primary-50 {
      background-color: rgba(79, 70, 229, 0.1) !important;
    }
    
    :host ::ng-deep .dark .dark\\:bg-primary-900\\/40 {
      background-color: rgba(79, 70, 229, 0.4) !important;
    }
    
    :host ::ng-deep .dark .hover\\:bg-gray-50:hover {
      background-color: #374151 !important;
    }
    
    /* Clase personalizada para encabezados de tablas en dark mode */
    :host ::ng-deep .dark .dark\\:bg-gray-750 {
      background-color: #1f2937 !important;
    }
    
    /* Clase personalizada para el hover en paginación para dark mode */
    :host ::ng-deep .dark .dark\\:hover\\:bg-gray-650:hover {
      background-color: #374151 !important;
    }
  `]
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);
  private themeService = inject(ThemeService);
  
  users: ExtendedUser[] = [];
  roles: any[] = [];
  loading = true;
  
  pagination: any = null;
  currentPage = 1;
  itemsPerPage = 10;
  
  filters = {
    search: '',
    active: undefined as boolean | undefined,
    role: ''
  };
  
  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }
  
  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
  }
  
  loadUsers() {
    this.loading = true;
    this.adminService.getUsers(
      this.currentPage, 
      this.itemsPerPage, 
      this.filters.active, 
      this.filters.role, 
      this.filters.search
    ).subscribe({
      next: (response) => {
        this.users = response.data;
        this.pagination = {
          current_page: response.current_page,
          from: response.from,
          to: response.to,
          total: response.total,
          last_page: response.last_page,
          links: response.links,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  getUserInitials(user: ExtendedUser): string {
    if (!user || !user.name) return '';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  applyFilters() {
    this.currentPage = 1;
    this.loadUsers();
  }
  
  goToPage(page: number) {
    if (page < 1 || (this.pagination && page > this.pagination.last_page)) {
      return;
    }
    
    this.currentPage = page;
    this.loadUsers();
  }
  
  activateUser(user: ExtendedUser) {
    if (!user.id) return;
    
    if (confirm(`¿Estás seguro de que deseas activar al usuario ${user.name}?`)) {
      this.adminService.activateUser(user.id).subscribe({
        next: () => {
          user.active = true;
          alert(`El usuario ${user.name} ha sido activado correctamente.`);
        },
        error: (error) => {
          console.error('Error al activar usuario:', error);
          alert(`Error al activar al usuario: ${error.error?.message || 'Ha ocurrido un error'}`);
        }
      });
    }
  }
  
  deactivateUser(user: ExtendedUser) {
    if (!user.id) return;
    
    if (confirm(`¿Estás seguro de que deseas desactivar al usuario ${user.name}?`)) {
      this.adminService.deactivateUser(user.id).subscribe({
        next: () => {
          user.active = false;
          alert(`El usuario ${user.name} ha sido desactivado correctamente.`);
        },
        error: (error) => {
          console.error('Error al desactivar usuario:', error);
          alert(`Error al desactivar al usuario: ${error.error?.message || 'Ha ocurrido un error'}`);
        }
      });
    }
  }
  
  deleteUser(user: ExtendedUser) {
    if (!user.id) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          alert(`El usuario ${user.name} ha sido eliminado correctamente.`);
          
          // Si ya no hay usuarios en la página actual y no es la primera página, ir a la anterior
          if (this.users.length === 0 && this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
          } else {
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          alert(`Error al eliminar al usuario: ${error.error?.message || 'Ha ocurrido un error'}`);
        }
      });
    }
  }
  
  // Helper method to check if dark mode is active
  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}