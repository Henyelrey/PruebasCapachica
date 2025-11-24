import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, ReservaServicio } from '../../../../../core/services/reservas.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

interface CeldaCalendario {
  fecha: Date;
  reservas: ReservaServicio[];
  esFueraDeMes: boolean;
  esHoy: boolean;
}

@Component({
  selector: 'app-reserva-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Calendario de Reservas" 
      subtitle="Visualiza todas las reservas programadas en formato de calendario"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      
      <!-- Filtros y controles -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6 transition-colors duration-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendario de Reservas</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestiona y visualiza todas las reservas de servicios turísticos
            </p>
          </div>
          <div class="mt-4 sm:mt-0">
            <a 
              routerLink="/admin/reservas" 
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a Lista
            </a>
          </div>
        </div>

        <!-- Controles de filtro -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label for="fechaInicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
            <div class="mt-1">
              <input
                type="date"
                id="fechaInicio"
                [(ngModel)]="fechaInicio"
                (ngModelChange)="aplicarFiltros()"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
            </div>
          </div>

          <div>
            <label for="fechaFin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
            <div class="mt-1">
              <input
                type="date"
                id="fechaFin"
                [(ngModel)]="fechaFin"
                (ngModelChange)="aplicarFiltros()"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
            </div>
          </div>

          <div>
            <label for="filtroEstado" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <div class="mt-1">
              <select
                id="filtroEstado"
                [(ngModel)]="filtroEstado"
                (ngModelChange)="aplicarFiltros()"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmado">Confirmados</option>
                <option value="cancelado">Cancelados</option>
                <option value="completado">Completados</option>
              </select>
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="cargarReservas()"
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Resumen estadístico -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Servicios</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ reservasServicios().length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ contarPorEstado('pendiente') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmados</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ contarPorEstado('confirmado') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completados</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ contarPorEstado('completado') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
        
        <!-- Loading -->
        <div *ngIf="loading()" class="flex justify-center items-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <span class="ml-4 text-gray-600 dark:text-gray-400">Cargando reservas...</span>
        </div>

        <div *ngIf="!loading()">
          <!-- Navegación del mes -->
          <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              (click)="mesAnterior()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Mes Anterior
            </button>

            <h2 class="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{{ nombreMes() }} {{ anioActual }}</h2>

            <button
              (click)="mesSiguiente()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Mes Siguiente
              <svg class="h-5 w-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <!-- Grid del calendario -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600 transition-colors duration-200">
            <!-- Cabecera de días de la semana -->
            <div *ngFor="let dia of diasSemana" class="bg-gray-100 dark:bg-gray-700 p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200">
              {{ dia }}
            </div>

            <!-- Celdas de días -->
            <div *ngFor="let celda of celdasCalendario(); trackBy: trackByCelda" 
                 [class]="getCeldaClases(celda)"
                 class="min-h-[120px] p-2 transition-colors duration-200">
              
              <!-- Número del día -->
              <div class="flex justify-between items-start mb-1">
                <span [class]="getDiaClases(celda)" class="text-sm font-medium transition-colors duration-200">
                  {{ celda.fecha.getDate() }}
                </span>
                <span *ngIf="celda.reservas.length > 0" 
                      class="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full transition-colors duration-200">
                  {{ celda.reservas.length }}
                </span>
              </div>

              <!-- Eventos del día -->
              <div class="space-y-1 max-h-[80px] overflow-y-auto">
                <div *ngFor="let reserva of celda.reservas | slice:0:3; trackBy: trackByReserva" 
                     class="cursor-pointer"
                     (click)="verDetalleReserva(reserva)">
                  <div [class]="getEventoClases(reserva)" 
                       class="px-2 py-1 rounded text-xs border-l-2 transition-colors duration-200"
                       [title]="getReservaTooltip(reserva)">
                    <div class="font-medium truncate">{{ obtenerHoraFormateada(reserva.hora_inicio) }}</div>
                    <div class="truncate opacity-90">{{ reserva.servicio?.nombre || 'Sin nombre' }}</div>
                  </div>
                </div>
                
                <!-- Indicador de más eventos -->
                <div *ngIf="celda.reservas.length > 3" 
                     class="text-xs text-gray-500 dark:text-gray-400 pl-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                     (click)="verMasEventos(celda)">
                  +{{ celda.reservas.length - 3 }} más...
                </div>
              </div>
            </div>
          </div>

          <!-- Leyenda -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 mr-2 bg-yellow-100 dark:bg-yellow-800 border-l-2 border-yellow-400 dark:border-yellow-600 rounded-sm transition-colors duration-200"></span>
                <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">Pendiente</span>
              </div>
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 mr-2 bg-green-100 dark:bg-green-800 border-l-2 border-green-400 dark:border-green-600 rounded-sm transition-colors duration-200"></span>
                <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">Confirmado</span>
              </div>
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 mr-2 bg-red-100 dark:bg-red-800 border-l-2 border-red-400 dark:border-red-600 rounded-sm transition-colors duration-200"></span>
                <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">Cancelado</span>
              </div>
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 mr-2 bg-blue-100 dark:bg-blue-800 border-l-2 border-blue-400 dark:border-blue-600 rounded-sm transition-colors duration-200"></span>
                <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-200">Completado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle de día -->
      <div *ngIf="mostrarModalDia()" 
           class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Reservas del {{ diaSeleccionado() ? formatearFecha(diaSeleccionado()!.fecha) : '' }}
            </h3>
            <button (click)="cerrarModalDia()" 
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <div *ngIf="!diaSeleccionado()?.reservas?.length" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">No hay reservas para este día</p>
            </div>
            
            <div *ngIf="diaSeleccionado()?.reservas?.length" class="space-y-4">
              <div *ngFor="let reserva of diaSeleccionado()!.reservas; trackBy: trackByReserva" 
                   class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span [class]="getEventoClases(reserva)" 
                            class="px-2 py-1 rounded text-xs font-medium border-l-2">
                        {{ getEstadoTexto(reserva.estado) }}
                      </span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ obtenerHoraFormateada(reserva.hora_inicio) }} - {{ obtenerHoraFormateada(reserva.hora_fin) }}
                      </span>
                    </div>
                    
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {{ reserva.servicio?.nombre || 'Servicio no disponible' }}
                    </h4>
                    
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {{ reserva.emprendedor?.nombre || 'Emprendedor no disponible' }}
                    </p>
                    
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Duración:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-1">{{ reserva.duracion_minutos }} min</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Precio:</span>
                        <span class="text-gray-600 dark:text-gray-400 ml-1">S/ {{ (reserva.precio || 0).toFixed(2) }}</span>
                      </div>
                    </div>
                    
                    <div *ngIf="reserva.notas_cliente" class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <span class="font-medium text-blue-800 dark:text-blue-300">Cliente:</span>
                      <span class="text-blue-700 dark:text-blue-400 ml-1">{{ reserva.notas_cliente }}</span>
                    </div>
                  </div>
                  
                  <div class="flex space-x-2 ml-4">
                    <a [routerLink]="['/admin/reservas/detail', reserva.reserva_id]" 
                       class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                       title="Ver detalle de reserva">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReservaCalendarioComponent implements OnInit {
  private reservasService = inject(ReservasService);
  private themeService = inject(ThemeService);

  // Signals
  loading = signal<boolean>(false);
  reservasServicios = signal<ReservaServicio[]>([]);
  mostrarModalDia = signal<boolean>(false);
  diaSeleccionado = signal<CeldaCalendario | null>(null);

  // Filtros
  fechaInicio: string;
  fechaFin: string;
  filtroEstado: string = '';

  // Calendario
  mesActual: number;
  anioActual: number;
  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Computed
  celdasCalendario = computed(() => this.generarCalendario());
  nombreMes = computed(() => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[this.mesActual];
  });

  constructor() {
    // Inicializar fechas con el mes actual
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();

    // Establecer rango de fechas para el mes actual
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    this.fechaInicio = this.formatearFecha(primerDia);

    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    this.fechaFin = this.formatearFecha(ultimoDia);
  }

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert("Por favor, seleccione fechas válidas");
      return;
    }

    this.loading.set(true);

    this.reservasService.getCalendarioReservas(this.fechaInicio, this.fechaFin).subscribe({
      next: (reservas) => {
        // Filtrar por estado si está seleccionado
        let reservasFiltradas = reservas;
        if (this.filtroEstado) {
          reservasFiltradas = reservas.filter(r => r.estado === this.filtroEstado);
        }
        
        this.reservasServicios.set(reservasFiltradas);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.loading.set(false);
        alert("Error al cargar las reservas. Por favor, intente nuevamente.");
      }
    });
  }

  aplicarFiltros() {
    this.cargarReservas();
  }

  mesAnterior() {
    this.mesActual--;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    }
    this.actualizarRangoFechas();
    this.cargarReservas();
  }

  mesSiguiente() {
    this.mesActual++;
    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }
    this.actualizarRangoFechas();
    this.cargarReservas();
  }

  private actualizarRangoFechas() {
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    this.fechaInicio = this.formatearFecha(primerDia);

    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    this.fechaFin = this.formatearFecha(ultimoDia);
  }

  private generarCalendario(): CeldaCalendario[] {
    const celdas: CeldaCalendario[] = [];
    const reservas = this.reservasServicios();

    // Obtener primer día del mes actual
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);

    // Calcular primer día que aparecerá en el calendario
    const diaInicio = new Date(primerDia);
    const diaSemanaInicio = primerDia.getDay();
    diaInicio.setDate(primerDia.getDate() - diaSemanaInicio);

    // Calcular último día que aparecerá en el calendario
    const diaFin = new Date(ultimoDia);
    const diaSemanaFin = ultimoDia.getDay();
    diaFin.setDate(ultimoDia.getDate() + (6 - diaSemanaFin));

    // Generar todas las celdas del calendario
    let fecha = new Date(diaInicio);
    const hoy = new Date();

    while (fecha <= diaFin) {
      const reservasDia = reservas.filter(r => {
        const fechaReserva = new Date(r.fecha_inicio);
        return fechaReserva.getFullYear() === fecha.getFullYear() &&
               fechaReserva.getMonth() === fecha.getMonth() &&
               fechaReserva.getDate() === fecha.getDate();
      });

      celdas.push({
        fecha: new Date(fecha),
        reservas: reservasDia,
        esFueraDeMes: fecha.getMonth() !== this.mesActual,
        esHoy: fecha.toDateString() === hoy.toDateString()
      });

      fecha.setDate(fecha.getDate() + 1);
    }

    return celdas;
  }

  verDetalleReserva(reserva: ReservaServicio) {
    if (reserva.reserva_id) {
      // Navegar al detalle de la reserva
      window.open(`/admin/reservas/detail/${reserva.reserva_id}`, '_blank');
    }
  }

  verMasEventos(celda: CeldaCalendario) {
    this.diaSeleccionado.set(celda);
    this.mostrarModalDia.set(true);
  }

  cerrarModalDia() {
    this.mostrarModalDia.set(false);
    this.diaSeleccionado.set(null);
  }

  // Métodos de utilidad
  contarPorEstado(estado: string): number {
    return this.reservasServicios().filter(r => r.estado === estado).length;
  }

  trackByCelda(index: number, celda: CeldaCalendario): string {
    return celda.fecha.toISOString();
  }

  trackByReserva(index: number, reserva: ReservaServicio): number {
    return reserva.id || index;
  }

  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  obtenerHoraFormateada(horaString: string): string {
    return horaString.substring(0, 5); // HH:MM
  }

  getCeldaClases(celda: CeldaCalendario): string {
    let clases = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    
    if (celda.esFueraDeMes) {
      clases += ' opacity-50';
    }
    
    if (celda.esHoy) {
      clases += ' ring-2 ring-primary-500 dark:ring-primary-400';
    }
    
    return clases;
  }

  getDiaClases(celda: CeldaCalendario): string {
    let clases = '';
    
    if (celda.esHoy) {
      clases += 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center';
    } else if (celda.esFueraDeMes) {
      clases += 'text-gray-400 dark:text-gray-600';
    } else {
      clases += 'text-gray-900 dark:text-white';
    }
    
    return clases;
  }

  getEventoClases(reserva: ReservaServicio): string {
    const baseClases = 'block transition-colors duration-200';
    
    switch (reserva.estado) {
      case 'pendiente':
        return `${baseClases} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-400 dark:border-yellow-600`;
      case 'confirmado':
        return `${baseClases} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-400 dark:border-green-600`;
      case 'cancelado':
        return `${baseClases} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-400 dark:border-red-600`;
      case 'completado':
        return `${baseClases} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-400 dark:border-blue-600`;
      default:
        return `${baseClases} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-500`;
    }
  }

  getEstadoTexto(estado: string): string {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'cancelado': 'Cancelado',
      'completado': 'Completado'
    };
    return textos[estado as keyof typeof textos] || estado;
  }

  getReservaTooltip(reserva: ReservaServicio): string {
    return `${reserva.servicio?.nombre || 'Sin nombre'}
Horario: ${this.obtenerHoraFormateada(reserva.hora_inicio)} - ${this.obtenerHoraFormateada(reserva.hora_fin)}
Estado: ${this.getEstadoTexto(reserva.estado)}
Emprendedor: ${reserva.emprendedor?.nombre || 'No disponible'}`;
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}