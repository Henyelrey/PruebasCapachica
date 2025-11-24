// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardSummary } from '../../core/services/admin.service';
import { AdminLayoutComponent } from '../../shared/layouts/admin-layout/admin-layout.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
      <div class="space-y-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 lg:text-3xl">Panel de Control</h1>
        
        <!-- Tarjetas de estadísticas -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Tarjeta de usuarios totales -->
          <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios Totales</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ summary?.total_users || 0 }}</p>
              </div>
              <div class="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 text-primary-600 dark:text-primary-400">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4 flex items-center">
              <span class="text-sm font-medium text-green-600 dark:text-green-400">
                {{ summary?.active_users || 0 }} activos
              </span>
              <span class="mx-2 text-gray-500 dark:text-gray-400">|</span>
              <span class="text-sm font-medium text-red-600 dark:text-red-400">
                {{ summary?.inactive_users || 0 }} inactivos
              </span>
            </div>
          </div>
          
          <!-- Tarjeta de roles -->
          <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ summary?.total_roles || 0 }}</p>
              </div>
              <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/roles" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Ver todos los roles →
              </a>
            </div>
          </div>
          
          <!-- Tarjeta de permisos -->
          <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Permisos</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ summary?.total_permissions || 0 }}</p>
              </div>
              <div class="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 text-purple-600 dark:text-purple-400">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
            </div>
            <div class="mt-4">
              <a routerLink="/admin/permissions" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Ver todos los permisos →
              </a>
            </div>
          </div>
          
          <!-- Tarjeta de acciones rápidas -->
          <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
            <div class="flex flex-col h-full justify-between">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Acciones Rápidas</p>
              <div class="mt-4 space-y-2">
                <a 
                  routerLink="/admin/users/create" 
                  class="block w-full rounded-md bg-primary-600 dark:bg-primary-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
                >
                  Nuevo Usuario
                </a>
                <a 
                  routerLink="/admin/roles/create" 
                  class="block w-full rounded-md bg-white dark:bg-gray-700 px-4 py-2 text-center text-sm font-medium text-primary-700 dark:text-primary-400 border border-primary-600 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Nuevo Rol
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Usuarios por rol -->
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Usuarios por Rol</h2>
          <div class="mt-4 space-y-4">
            @if (loading) {
              <div class="flex justify-center items-center p-4">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent dark:border-primary-600"></div>
                <span class="ml-4 dark:text-gray-300">Cargando datos...</span>
              </div>
            } @else if (summary?.users_by_role?.length) {
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                @for (roleData of summary?.users_by_role; track roleData.role) {
                  <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ roleData.role }}</span>
                      <span class="rounded-full bg-primary-100 dark:bg-primary-900/40 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:text-primary-300 transition-colors duration-200">
                        {{ roleData.count }} usuarios
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 dark:text-gray-400">No hay datos disponibles.</p>
            }
          </div>
        </div>
        
        <!-- Usuarios recientes -->
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Usuarios Recientes</h2>
            <a routerLink="/admin/users" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
              Ver todos →
            </a>
          </div>
          
          <div class="mt-4 overflow-hidden">
            @if (loading) {
              <div class="flex justify-center items-center p-4">
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent dark:border-primary-600"></div>
                <span class="ml-4 dark:text-gray-300">Cargando usuarios...</span>
              </div>
            } @else if (summary?.recent_users?.length) {
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @for (user of summary?.recent_users; track user.id) {
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                              <span class="text-primary-800 dark:text-primary-300 font-medium">{{ getUserInitials(user) }}</span>
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900 dark:text-gray-300">{{ user.email }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex flex-wrap gap-1">
                            @for (role of user.roles; track role.id) {
                              <span class="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 transition-colors duration-200">
                                {{ role.name }}
                              </span>
                            }
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {{ formatDate(user.created_at) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div class="flex items-center justify-end space-x-2">
                            <a 
                              [routerLink]="['/admin/users/edit', user.id]" 
                              class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition-colors duration-200"
                              title="Editar"
                            >
                              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </a>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="text-gray-500 dark:text-gray-400">No hay usuarios recientes.</p>
            }
          </div>
        </div>
      </div>
  `,
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private themeService = inject(ThemeService);
  
  summary: DashboardSummary | null = null;
  loading = true;
  
  ngOnInit() {
    this.loadDashboardData();
  }
  
  loadDashboardData() {
    this.loading = true;
    this.adminService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.loading = false;
      }
    });
  }
  
  getUserInitials(user: any): string {
    if (!user || !user.name) return '';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}