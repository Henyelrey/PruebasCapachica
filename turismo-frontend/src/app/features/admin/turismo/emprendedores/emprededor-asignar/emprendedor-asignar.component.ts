import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Emprendedor } from '../../../../../core/services/turismo.service';
import { UsersService } from '../../../../../core/services/users.service';
import { User } from '../../../../../core/models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../../environments/environments';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

// Extendemos la interfaz Emprendedor para incluir administradores
interface EmprendedorWithAdmins extends Emprendedor {
  administradores?: User[];
}

@Component({
  selector: 'app-asignar-administrador',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Asignar Administrador" 
      subtitle="Gestiona los administradores del emprendedor"
    ></app-admin-header>

    <div class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Administradores de {{ emprendedor?.nombre || 'Emprendedor' }}</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestione quién puede administrar este emprendedor en el sistema
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/emprendedores"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-300"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
        </div>
      </div>

      <!-- Cargando -->
      @if (loading) {
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 text-gray-900 dark:text-white">Cargando datos del emprendedor...</span>
          </div>
        </div>
      }

      <!-- Formulario para agregar administrador -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Agregar nuevo administrador</h2>
        
        <!-- Buscador de usuarios -->
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email del usuario</label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                type="email"
                id="email"
                [(ngModel)]="searchEmail"
                (keyup.enter)="searchUsers()"
                placeholder="Buscar usuario por email"
                class="input-estilo block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
              >
              <button 
                type="button" 
                (click)="searchUsers()"
                class="absolute inset-y-0 right-0 px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none"
              >
                <svg class="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
            @if (searchError) {
              <p class="mt-2 text-sm text-red-600 dark:text-red-400">{{ searchError }}</p>
            }
          </div>

          <!-- Resultados de búsqueda -->
          @if (searchResults.length > 0) {
            <div class="mt-4">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resultados de la búsqueda</h3>
              <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (user of searchResults; track user.id) {
                  <li class="py-3 flex justify-between items-center">
                    <div>
                      <div class="flex items-center">
                        @if (user.foto_perfil_url) {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                            <img [src]="user.foto_perfil_url" alt="{{ user.name }}" class="h-full w-full object-cover">
                          </div>
                        } @else {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <span class="text-primary-800 dark:text-primary-300 font-medium">{{ getUserInitials(user) }}</span>
                          </div>
                        }
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        (click)="assignAdmin(user)"
                        [disabled]="isUserAdmin(user)"
                        class="inline-flex items-center rounded-md bg-primary-600 dark:bg-primary-700 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ isUserAdmin(user) ? 'Ya es administrador' : 'Asignar como administrador' }}
                      </button>
                    </div>
                  </li>
                }
              </ul>
            </div>
          }

          @if (showNoResults) {
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-md p-4 mt-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">No se encontraron resultados</h3>
                  <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>No se encontraron usuarios con el email "{{ searchEmail }}". Verifica que el email sea correcto.</p>
                  </div>
                </div>
              </div>
            </div>
          }

          @if (isSubmitting) {
            <div class="flex justify-center mt-4">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
              <span class="ml-2 text-gray-700 dark:text-gray-300">Procesando...</span>
            </div>
          }
        </div>
      </div>

      <!-- Lista de administradores actuales -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Administradores actuales</h2>
        
        @if (administradores && administradores.length > 0) {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Administrador</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Es Principal</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                @for (admin of administradores; track admin.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        @if (admin.foto_perfil_url) {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
                            <img [src]="admin.foto_perfil_url" alt="{{ admin.name }}" class="h-full w-full object-cover">
                          </div>
                        } @else {
                          <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <span class="text-primary-800 dark:text-primary-300 font-medium">{{ getUserInitials(admin) }}</span>
                          </div>
                        }
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ admin.name }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ admin.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ admin.pivot?.rol || 'administrador' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (admin.pivot?.es_principal) {
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                          Sí
                        </span>
                      } @else {
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          No
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        type="button" 
                        (click)="removeAdmin(admin)"
                        [disabled]="isRemoving[admin.id || 0] || (admin.pivot?.es_principal && administradores.length === 1)"
                        class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        [title]="admin.pivot?.es_principal && administradores.length === 1 ? 'No puede eliminar al único administrador principal' : 'Eliminar'"
                      >
                        @if (isRemoving[admin.id || 0]) {
                          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        } @else {
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        }
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="text-center py-6">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay administradores</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Este emprendedor no tiene administradores asignados.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AsignarAdministradorComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private usersService = inject(UsersService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly API_URL = environment.apiUrl;

  emprendedorId: number | null = null;
  emprendedor: EmprendedorWithAdmins | null = null;
  loading = true;
  
  // Referencia a los administradores para evitar usar emprendedor.administradores
  administradores: User[] = [];
  
  // Búsqueda de usuarios
  searchEmail = '';
  searchResults: User[] = [];
  searchError = '';
  showNoResults = false;
  isSubmitting = false;

  // Estado de eliminación de administradores
  isRemoving: { [key: number]: boolean } = {};

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.emprendedorId = +id;
      this.loadEmprendedor();
    } else {
      this.loading = false;
      this.searchError = 'ID de emprendedor no válido';
    }
  }

  loadEmprendedor() {
    if (!this.emprendedorId) return;
    
    this.loading = true;
    this.turismoService.getEmprendedor(this.emprendedorId).subscribe({
      next: (emprendedor) => {
        this.emprendedor = emprendedor as EmprendedorWithAdmins;
        // Guardar referencia a los administradores
        this.administradores = this.emprendedor?.administradores || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendedor:', error);
        this.loading = false;
        this.searchError = 'Error al cargar los datos del emprendedor.';
      }
    });
  }

  searchUsers() {
    if (!this.searchEmail.trim()) {
      this.searchError = 'Ingrese un email para buscar';
      return;
    }

    this.searchError = '';
    this.isSubmitting = true;
    this.showNoResults = false;
    
    this.usersService.searchUsers(this.searchEmail).subscribe({
      next: (users) => {
        this.searchResults = users.filter(user => 
          // Filtrar usuarios que ya son administradores
          !this.isUserAdmin(user)
        );
        this.isSubmitting = false;
        this.showNoResults = users.length === 0;

        if (users.length > 0 && this.searchResults.length === 0) {
          this.searchError = 'Todos los usuarios encontrados ya son administradores de este emprendedor';
        }
      },
      error: (error) => {
        console.error('Error al buscar usuarios:', error);
        this.searchError = 'Error al buscar usuarios. Por favor, intente nuevamente.';
        this.isSubmitting = false;
      }
    });
  }

  getUserInitials(user: User): string {
    if (!user.name) return '';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  }

  isUserAdmin(user: User): boolean {
    if (!this.administradores || this.administradores.length === 0) return false;
    
    return this.administradores.some(admin => admin.id === user.id);
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  assignAdmin(user: User) {
    if (!this.emprendedorId) return;
    
    this.isSubmitting = true;
    
    // Por defecto, asignar como administrador y es_principal = true
    const payload = {
      email: user.email,
      rol: 'administrador',
      es_principal: true
    };

    this.http.post(
      `${this.API_URL}/emprendedores/${this.emprendedorId}/administradores`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Recargar los datos del emprendedor para actualizar la lista de administradores
        this.loadEmprendedor();
        // Limpiar la búsqueda
        this.searchEmail = '';
        this.searchResults = [];
      },
      error: (error) => {
        console.error('Error al asignar administrador:', error);
        this.isSubmitting = false;
        this.searchError = 'Error al asignar administrador. Por favor, intente nuevamente.';
      }
    });
  }

  removeAdmin(admin: User) {
    if (!this.emprendedorId || !admin.id) return;
    
    // Verificar si es el único administrador principal
    if (admin.pivot?.es_principal && this.administradores.length === 1) {
      alert('No puede eliminar al único administrador principal del emprendedor');
      return;
    }
    
    if (confirm(`¿Está seguro de eliminar a ${admin.name} como administrador?`)) {
      // Asegurarse de que admin.id sea un número
      const adminId = admin.id;
      if (adminId) {
        this.isRemoving[adminId] = true;
        
        this.http.delete(
          `${this.API_URL}/emprendedores/${this.emprendedorId}/administradores/${adminId}`,
          { headers: this.getHeaders() }
        ).subscribe({
          next: () => {
            // Actualizar estado
            this.isRemoving[adminId] = false;
            // Recargar datos
            this.loadEmprendedor();
          },
          error: (error) => {
            console.error('Error al eliminar administrador:', error);
            this.isRemoving[adminId] = false;
            alert('Error al eliminar administrador. Por favor, intente nuevamente.');
          }
        });
      }
    }
  }
}