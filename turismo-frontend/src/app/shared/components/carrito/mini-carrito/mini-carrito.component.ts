import { Component, inject, signal, HostListener, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../../../core/services/carrito.service';
import { ReservaServicio } from '../../../../core/services/turismo.service';

interface ServicioAgrupado {
  servicio: any;
  emprendedor: any;
  horarios: Array<{
    id: number;
    fecha_inicio: string;
    hora_inicio: string;
    fecha_fin?: string;
    hora_fin?: string;
  }>;
  totalItems: number;
}

@Component({
  selector: 'app-mini-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative inline-block">
      <!-- Botón del carrito -->
      <button 
        (click)="toggleDropdown()"
        class="relative p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-orange-100 dark:hover:bg-blue-800 focus:outline-none transition-colors duration-200"
        [title]="'Mi carrito de planes (' + carritoService.getTotalItems() + ')'"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
        </svg>
        
        <!-- Badge con número de items -->
        <span *ngIf="carritoService.getTotalItems() > 0" 
          class="absolute -top-1 -right-1 bg-orange-500 dark:bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse"
        >
          {{ carritoService.getTotalItems() }}
        </span>
      </button>

      <!-- Dropdown del carrito -->
      <div 
        *ngIf="isOpen()"
        class="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] overflow-hidden"
      >
        <!-- Header del dropdown -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-blue-900 dark:to-blue-800">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Mi Carrito
            </h3>
            <button 
              (click)="closeDropdown()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del carrito -->
        <div class="max-h-80 overflow-y-auto custom-scrollbar">
          <!-- Carrito vacío -->
          <div *ngIf="!carritoService.tieneItems()" class="p-8 text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-blue-800 dark:to-blue-900 rounded-full flex items-center justify-center">
              <svg class="h-8 w-8 text-orange-400 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
              </svg>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Tu carrito está vacío
            </p>
            <p class="text-gray-500 dark:text-gray-500 text-xs">
              Agrega algunos servicios para comenzar
            </p>
          </div>

          <!-- Items del carrito agrupados -->
          <div *ngIf="carritoService.tieneItems()" class="divide-y divide-gray-100 dark:divide-gray-700">
            <div 
              *ngFor="let grupo of serviciosAgrupados().slice(0, 3); trackBy: trackByServicioId"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div class="flex items-start gap-3">
                <!-- Imagen del servicio -->
                <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 dark:from-blue-500 dark:to-blue-700">
                  <img 
                    *ngIf="grupo.servicio?.imagen; else iconoDefault"
                    [src]="grupo.servicio.imagen" 
                    [alt]="grupo.servicio?.nombre"
                    class="w-full h-full object-cover"
                    (error)="onImageError($event)"
                  />
                  <ng-template #iconoDefault>
                    <div class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                  </ng-template>
                </div>

                <!-- Información del servicio -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex-grow">
                      <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {{ grupo.servicio?.nombre || 'Servicio' }}
                      </h4>
                      <p class="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"></path>
                        </svg>
                        {{ grupo.emprendedor?.nombre }}
                      </p>
                    </div>
                    
                    <!-- Badge con cantidad -->
                    <span *ngIf="grupo.totalItems > 1" 
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-blue-800 dark:text-blue-200"
                    >
                      {{ grupo.totalItems }}x
                    </span>
                  </div>

                  <!-- Horarios del servicio -->
                  <div class="mt-2 space-y-1">
                    <div 
                      *ngFor="let horario of grupo.horarios.slice(0, 2); trackBy: trackByHorarioId"
                      class="flex items-center justify-between text-xs"
                    >
                      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>{{ formatearFecha(horario.fecha_inicio) }}</span>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{{ horario.hora_inicio }}</span>
                      </div>
                      
                      <!-- Botón eliminar horario específico -->
                      <button 
                        (click)="eliminarItem(horario.id)"
                        class="text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Eliminar este horario"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Mostrar más horarios si hay -->
                    <div *ngIf="grupo.horarios.length > 2" class="text-xs text-gray-500 dark:text-gray-400 pl-5">
                      + {{ grupo.horarios.length - 2 }} horario(s) más
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mostrar más servicios si hay -->
            <div *ngIf="serviciosAgrupados().length > 3" class="p-4 text-center bg-gray-50 dark:bg-gray-700/30">
              <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Y {{ serviciosAgrupados().length - 3 }} servicio(s) más...
              </p>
            </div>
          </div>
        </div>

        <!-- Footer del dropdown -->
        <div *ngIf="carritoService.tieneItems()" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Total de reservas:
              </span>
              <span class="font-semibold text-gray-900 dark:text-white bg-orange-100 dark:bg-blue-800 px-2 py-1 rounded-full text-xs">
                {{ carritoService.getTotalItems() }}
              </span>
            </div>
            
            <div class="flex gap-2">
              <button 
                routerLink="/carrito"
                (click)="closeDropdown()"
                class="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver carrito
              </button>
              <button 
                (click)="confirmarReserva()"
                class="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Confirmar
              </button>
            </div>
          </div>
        </div>

        <!-- Footer si está vacío -->
        <div *ngIf="!carritoService.tieneItems()" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            routerLink="/servicios"
            (click)="closeDropdown()"
            class="w-full bg-orange-600 hover:bg-orange-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Explorar servicios
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar dropdown -->
    <div 
      *ngIf="isOpen()"
      class="fixed inset-0 z-40 bg-black/10 dark:bg-black/20"
      (click)="closeDropdown()"
    ></div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .7;
      }
    }

    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #f97316 transparent;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #f97316;
      border-radius: 2px;
    }

    .dark .custom-scrollbar {
      scrollbar-color: #3b82f6 transparent;
    }

    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #3b82f6;
    }

    /* Animaciones de entrada */
    .animate-slide-down {
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class MiniCarritoComponent {
  carritoService = inject(CarritoService);
  private elementRef = inject(ElementRef);

  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  // Computed para agrupar servicios
  serviciosAgrupados = computed(() => {
    const items = this.carritoService.carritoItems();
    const grupos = new Map<string, ServicioAgrupado>();

    items.forEach(item => {
      const key = `${item.servicio?.id || 'sin-servicio'}-${item.emprendedor?.id || 'sin-emprendedor'}`;
      
      if (grupos.has(key)) {
        const grupo = grupos.get(key)!;
        grupo.horarios.push({
          id: item.id!,
          fecha_inicio: item.fecha_inicio,
          hora_inicio: item.hora_inicio,
          fecha_fin: item.fecha_fin,
          hora_fin: item.hora_fin
        });
        grupo.totalItems++;
      } else {
        grupos.set(key, {
          servicio: item.servicio,
          emprendedor: item.emprendedor,
          horarios: [{
            id: item.id!,
            fecha_inicio: item.fecha_inicio,
            hora_inicio: item.hora_inicio,
            fecha_fin: item.fecha_fin,
            hora_fin: item.hora_fin
          }],
          totalItems: 1
        });
      }
    });

    return Array.from(grupos.values());
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    this._isOpen.update(value => !value);
    
    // Cargar carrito si se abre y no está cargado
    if (this._isOpen() && !this.carritoService.tieneItems()) {
      this.carritoService.obtenerCarrito().subscribe({
        error: (error) => {
          console.log('Error al cargar carrito en mini-carrito:', error);
        }
      });
    }
  }

  closeDropdown() {
    this._isOpen.set(false);
  }

  eliminarItem(itemId: number) {
    if (!itemId) return;

    this.carritoService.eliminarDelCarrito(itemId).subscribe({
      next: () => {
        // El carrito se actualiza automáticamente
      },
      error: (error) => {
        console.error('Error al eliminar item del carrito:', error);
      }
    });
  }

  confirmarReserva() {
    this.carritoService.confirmarReserva().subscribe({
      next: () => {
        this.closeDropdown();
        // Redirigir al dashboard
        window.location.href = '/dashboard?tab=reservas';
      },
      error: (error) => {
        console.error('Error al confirmar reserva:', error);
        // Abrir carrito completo para ver el error
        window.location.href = '/carrito';
      }
    });
  }

  onImageError(event: Event) {
    // Si la imagen falla al cargar, ocultar el elemento img para mostrar el ícono por defecto
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  trackByServicioId(index: number, grupo: ServicioAgrupado): string {
    return `${grupo.servicio?.id || 'sin-servicio'}-${grupo.emprendedor?.id || 'sin-emprendedor'}`;
  }

  trackByHorarioId(index: number, horario: any): number {
    return horario.id || index;
  }

  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  }
}