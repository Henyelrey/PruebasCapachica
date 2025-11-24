import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Reserva, Servicio } from '../../../../../core/services/turismo.service';

@Component({
  selector: 'app-reserva-servicio',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reservas por Servicio</h1>
          @if (servicio) {
            <p class="mt-1 text-sm text-gray-500">
              Reservas del servicio: <span class="font-medium">{{ servicio.nombre }}</span>
            </p>
          }
        </div>
        <div class="mt-4 sm:mt-0">
          <a 
            routerLink="/admin/servicios" 
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a Servicios
          </a>
        </div>
      </div>
      
      <!-- Información del servicio -->
      @if (loading) {
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando información...</span>
          </div>
        </div>
      } @else if (servicio) {
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <h2 class="text-lg font-medium text-gray-900">{{ servicio.nombre }}</h2>
              <p class="mt-2 text-gray-700">{{ servicio.descripcion }}</p>
              
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Precio Referencial</h3>
                  <p class="mt-1 text-sm text-gray-900">S/. {{ servicio.precio_referencial || '0.00' }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Estado</h3>
                  <p class="mt-1">
                    <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" 
                          [ngClass]="servicio.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ servicio.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Emprendedor</h3>
                  <p class="mt-1 text-sm text-gray-900">
                    <a [routerLink]="['/admin/emprendedores', servicio.emprendedor_id]" class="text-primary-600 hover:text-primary-900">
                      {{ servicio.emprendedor?.nombre || 'Sin emprendedor' }}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Horarios Disponibles</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ servicio.horarios?.length || 0 }} horarios</p>
                </div>
              </div>
              
              <!-- Categorías -->
              @if (servicio.categorias && servicio.categorias.length > 0) {
                <div class="mt-4">
                  <h3 class="text-sm font-medium text-gray-500">Categorías</h3>
                  <div class="mt-1 flex flex-wrap gap-1">
                    @for (categoria of servicio.categorias; track categoria.id) {
                      <span class="inline-flex rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                        {{ categoria.nombre }}
                      </span>
                    }
                  </div>
                </div>
              }
              
              <!-- Acciones -->
              <div class="mt-6 flex space-x-3">
                <a 
                  [routerLink]="['/admin/servicios/edit', servicio.id]" 
                  class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Editar Servicio
                </a>
                <a 
                  routerLink="/admin/reservas/create" 
                  [queryParams]="{servicio_id: servicio.id}"
                  class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Nueva Reserva
                </a>
              </div>
            </div>
            
            <!-- Panel lateral con estadísticas -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Resumen de Reservas</h3>
              
              <dl class="mt-4 grid grid-cols-1 gap-4">
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <dt class="text-sm font-medium text-gray-500">Total Reservas</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ reservas.length }}</dd>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <dt class="text-sm font-medium text-gray-500">Pendientes</dt>
                  <dd class="mt-1 text-3xl font-semibold text-yellow-600">{{ contarReservasPorEstado('pendiente') }}</dd>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <dt class="text-sm font-medium text-gray-500">Confirmadas</dt>
                  <dd class="mt-1 text-3xl font-semibold text-green-600">{{ contarReservasPorEstado('confirmada') }}</dd>
                </div>
                
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <dt class="text-sm font-medium text-gray-500">Canceladas</dt>
                  <dd class="mt-1 text-3xl font-semibold text-red-600">{{ contarReservasPorEstado('cancelada') }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      }
      
      <!-- Lista de reservas -->
      <div class="rounded-lg bg-white shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Reservas</h2>
        </div>
        
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando reservas...</span>
          </div>
        } @else if (reservas.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No hay reservas para este servicio</h3>
            <div class="mt-6">
              <a 
                routerLink="/admin/reservas/create" 
                [queryParams]="{servicio_id: servicioId}"
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Crear Reserva
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (reserva of reservas; track reserva.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ reserva.codigo_reserva }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        @if (reserva.usuario) {
                          {{ reserva.usuario.name }}
                        } @else {
                          <span class="text-gray-500">Desconocido</span>
                        }
                      </div>
                      <div class="text-xs text-gray-500">
                        @if (reserva.usuario) {
                          {{ reserva.usuario.email }}
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (reserva.servicios && reserva.servicios.length > 0) {
                        <div class="text-sm text-gray-900">{{ formatDate(reserva.servicios[0].fecha_inicio) }}</div>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (reserva.servicios && reserva.servicios.length > 0) {
                        <div class="text-sm text-gray-900">
                          {{ formatTime(reserva.servicios[0].hora_inicio) }} - {{ formatTime(reserva.servicios[0].hora_fin) }}
                        </div>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" 
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800': reserva.estado === 'pendiente',
                              'bg-green-100 text-green-800': reserva.estado === 'confirmada',
                              'bg-red-100 text-red-800': reserva.estado === 'cancelada',
                              'bg-blue-100 text-blue-800': reserva.estado === 'completada'
                            }">
                        {{ getEstadoLabel(reserva.estado) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <a 
                          [routerLink]="['/admin/reservas/detail', reserva.id]" 
                          class="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </a>
                        
                        <a 
                          [routerLink]="['/admin/reservas/edit', reserva.id]" 
                          class="text-primary-600 hover:text-primary-900"
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
        }
      </div>
    </div>
  `,
})
export class ReservaServicioComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  
  // Propiedades
  servicioId: number = 0;
  servicio: Servicio | null = null;
  reservas: Reserva[] = [];
  loading = true;
  
  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.servicioId = +idParam;
      this.cargarServicio();
      this.cargarReservas();
    } else {
      this.loading = false;
    }
  }
  
  cargarServicio() {
    this.turismoService.getServicio(this.servicioId).subscribe({
      next: (servicio) => {
        this.servicio = servicio;
      },
      error: (error) => {
        console.error('Error al cargar el servicio:', error);
        alert('Error al cargar la información del servicio');
      }
    });
  }
  
  cargarReservas() {
    this.turismoService.getReservasByServicio(this.servicioId).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.loading = false;
        alert('Error al cargar las reservas del servicio');
      }
    });
  }
  
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return 'Desconocido';
    }
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  formatTime(timeString?: string): string {
    if (!timeString) return 'N/A';
    // Convertir de formato "HH:MM:SS" a "HH:MM"
    return timeString.substring(0, 5);
  }
  
  contarReservasPorEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }
}