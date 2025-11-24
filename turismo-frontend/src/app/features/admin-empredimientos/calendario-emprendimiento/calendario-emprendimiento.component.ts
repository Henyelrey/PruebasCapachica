import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientoAdminService } from '../../../core/services/emprendimiento-admin.service';
import { 
  Emprendimiento, 
  CalendarioEmprendimiento,
  CalendarioEvento,
  EventoCalendario,
  EventoBackend
} from '../../../core/models/emprendimiento-admin.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  eventos: EventoCalendario[];
  totalEventos: number;
  ingresosDia: number;
}

@Component({
  selector: 'app-calendario-emprendimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Loading state glassmorphism -->
    <div *ngIf="loading && !calendarDays.length" class="flex items-center justify-center h-64">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-orange-200/30 rounded-full"></div>
        <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>

    <!-- Error state glassmorphism -->
    <div *ngIf="error && !loading" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Error al cargar el calendario</h3>
      <p class="text-slate-300 dark:text-slate-400 mb-4">{{ error }}</p>
      <button (click)="loadCalendar()" 
              class="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors duration-300">
        Reintentar
      </button>
    </div>

    <!-- Calendar content glassmorphism -->
    <div *ngIf="!loading || calendarDays.length" class="space-y-8">
      <!-- Header con navegación -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Calendario
          </h1>
          <div class="flex items-center gap-2">
            <button (click)="previousMonth()" 
                    class="p-2 rounded-xl bg-white/10 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 text-slate-200 hover:bg-white/20 dark:hover:bg-slate-700/60 transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 class="text-xl font-semibold text-white min-w-[200px] text-center">
              {{ getMonthName() }} {{ currentDate.getFullYear() }}
            </h2>
            <button (click)="nextMonth()" 
                    class="p-2 rounded-xl bg-white/10 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 text-slate-200 hover:bg-white/20 dark:hover:bg-slate-700/60 transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Summary Stats -->
          <div *ngIf="calendarioData" class="flex items-center gap-6 text-sm">
            <div class="text-center">
              <p class="font-semibold text-white">{{ calendarioData.total_reservas }}</p>
              <p class="text-slate-300 dark:text-slate-400">Reservas</p>
            </div>
            <div class="text-center">
              <p class="font-semibold text-green-300">S/ {{ calendarioData.ingresos_periodo }}</p>
              <p class="text-slate-300 dark:text-slate-400">Ingresos</p>
            </div>
          </div>
          
          <button (click)="goToToday()" 
                  class="px-4 py-2 rounded-xl bg-white/10 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 text-white hover:bg-white/20 dark:hover:bg-slate-700/60 transition-all duration-300 font-medium">
            Hoy
          </button>
          <button (click)="refreshData()" 
                  [disabled]="loading"
                  class="group flex items-center px-4 py-2 rounded-xl bg-white/10 dark:bg-slate-800/60 text-white hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 dark:border-slate-700/50 hover:border-white/20 dark:hover:border-slate-600/60 disabled:opacity-50">
            <svg *ngIf="!loading" class="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <div *ngIf="loading" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Calendar Grid glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
        
        <!-- Days of Week Header -->
        <div class="grid grid-cols-7 bg-white/10 dark:bg-slate-700/50 border-b border-white/20 dark:border-slate-600/50">
          <div *ngFor="let day of daysOfWeek" 
               class="p-4 text-center text-sm font-semibold text-slate-200 dark:text-slate-300 border-r border-white/10 dark:border-slate-600/30 last:border-r-0">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7">
          <div *ngFor="let day of calendarDays; trackBy: trackByDay" 
               class="relative border-r border-b border-white/10 dark:border-slate-600/30 last:border-r-0 h-32 overflow-hidden cursor-pointer group"
               [ngClass]="{
                 'bg-white/5 dark:bg-slate-700/30': !day.isCurrentMonth,
                 'bg-white/8 dark:bg-slate-800/30': day.isCurrentMonth,
                 'bg-orange-500/20 border-orange-400/50': day.isToday,
                 'bg-blue-500/20 border-blue-400/50': day.isSelected
               }"
               (click)="selectDay(day)">
            
            <!-- Day Number -->
            <div class="p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold"
                      [ngClass]="{
                        'text-slate-400 dark:text-slate-500': !day.isCurrentMonth,
                        'text-white': day.isCurrentMonth && !day.isToday,
                        'text-orange-200 font-bold': day.isToday
                      }">
                  {{ day.date.getDate() }}
                </span>
                
                <!-- Events indicator badge -->
                <div *ngIf="day.totalEventos > 0" 
                     class="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/30 text-orange-200 border border-orange-400/30">
                  {{ day.totalEventos }}
                </div>
              </div>
              
              <!-- Income indicator -->
              <div *ngIf="day.ingresosDia > 0" class="text-xs text-green-300 font-medium">
                S/ {{ day.ingresosDia | number:'1.0-0' }}
              </div>
            </div>

            <!-- Events Preview -->
            <div class="px-3 pb-2 space-y-1">
              <div *ngFor="let evento of day.eventos.slice(0, 2); trackBy: trackByEvento" 
                   class="text-xs p-1.5 rounded-lg truncate"
                   [ngClass]="getEventoClass(evento)"
                   [title]="evento.titulo + ' - ' + evento.hora_inicio + ' a ' + evento.hora_fin">
                {{ evento.titulo }}
              </div>
              <div *ngIf="day.eventos.length > 2" 
                   class="text-xs text-slate-400 dark:text-slate-500 pl-1.5 font-medium">
                +{{ day.eventos.length - 2 }} más
              </div>
            </div>

            <!-- Hover effect -->
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>

      <!-- Selected Day Details glassmorphism -->
      <div *ngIf="selectedDay" class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl overflow-hidden">
        <div class="px-6 py-4 bg-white/10 dark:bg-slate-700/40 border-b border-white/20 dark:border-slate-600/50">
          <h3 class="text-xl font-semibold text-white">
            Eventos del {{ formatSelectedDayDate() }}
          </h3>
          <div *ngIf="selectedDay.totalEventos > 0" class="mt-2 flex items-center space-x-6 text-sm">
            <span class="text-slate-300 dark:text-slate-400">
              {{ selectedDay.totalEventos }} evento{{ selectedDay.totalEventos > 1 ? 's' : '' }}
            </span>
            <span *ngIf="selectedDay.ingresosDia > 0" class="text-green-300 font-semibold">
              Ingresos: S/ {{ selectedDay.ingresosDia | number:'1.2-2' }}
            </span>
          </div>
        </div>
        
        <div class="p-6">
          <!-- No events -->
          <div *ngIf="selectedDay.eventos.length === 0" class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-semibold text-white mb-2">No hay eventos</h3>
            <p class="text-slate-300 dark:text-slate-400">
              No tienes reservas ni eventos programados para este día.
            </p>
          </div>

          <!-- Events list -->
          <div *ngIf="selectedDay.eventos.length > 0" class="space-y-4">
            <div *ngFor="let evento of selectedDay.eventos; trackBy: trackByEvento" 
                 class="backdrop-blur-sm bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/30 rounded-xl p-5 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-300 shadow-lg">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="w-3 h-3 rounded-full bg-orange-400 shadow-lg shadow-orange-400/50"></div>
                    <h4 class="text-lg font-semibold text-white">
                      {{ evento.titulo }}
                    </h4>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          [ngClass]="getEventoEstadoBadge(evento.estado)">
                      {{ evento.estado | titlecase }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div>
                        <span class="text-slate-400">Horario:</span>
                        <p class="font-semibold text-white">
                          {{ evento.hora_inicio }} - {{ evento.hora_fin }}
                        </p>
                      </div>
                    </div>
                    <div *ngIf="evento.cliente" class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <div>
                        <span class="text-slate-400">Cliente:</span>
                        <p class="font-semibold text-white">
                          {{ evento.cliente }}
                        </p>
                      </div>
                    </div>
                    <div *ngIf="evento.servicio" class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <div>
                        <span class="text-slate-400">Servicio:</span>
                        <p class="font-semibold text-white">
                          {{ evento.servicio }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="evento.precio" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    <span class="text-slate-400 text-sm">Precio:</span>
                    <span class="font-semibold text-green-300">
                      S/ {{ evento.precio | number:'1.2-2' }}
                    </span>
                  </div>
                </div>

                <!-- Event Actions -->
                <div class="ml-4">
                  <button [routerLink]="['../reservas']"
                          class="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-all duration-300 text-sm font-semibold border border-orange-400/30 hover:border-orange-400/50">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend glassmorphism -->
      <div class="backdrop-blur-sm bg-white/10 dark:bg-slate-800/40 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Leyenda</h3>
        <div class="flex flex-wrap items-center gap-6 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50"></div>
            <span class="text-slate-300 dark:text-slate-300">Reservas</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
            <span class="text-slate-300 dark:text-slate-300">Planes</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-orange-500/20 border border-orange-400/50 rounded"></div>
            <span class="text-slate-300 dark:text-slate-300">Día actual</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-500/20 border border-blue-400/50 rounded"></div>
            <span class="text-slate-300 dark:text-slate-300">Día seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Mejoras para transiciones suaves */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    }
  `]
})
export class CalendarioEmprendimientoComponent implements OnInit {
  private emprendimientoAdminService = inject(EmprendimientoAdminService);
  private route = inject(ActivatedRoute);

  emprendimientoId!: number;
  emprendimiento?: Emprendimiento;
  calendarioData?: CalendarioEmprendimiento;
  loading = true;
  error = '';

  currentDate = new Date();
  selectedDay?: CalendarDay;
  calendarDays: CalendarDay[] = [];

  daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  ngOnInit(): void {
    // Obtener el ID de la ruta padre
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Calendario - ID recibido:', id); // Debug
      
      if (id && !isNaN(+id)) {
        this.emprendimientoId = +id;
        // Cargar automáticamente el calendario al inicializar
        this.loadCalendar();
      } else {
        console.error('Calendario - ID inválido:', id);
        this.error = 'ID de emprendimiento inválido';
        this.loading = false;
      }
    });
  }

  loadCalendar(): void {
    this.loading = true;
    this.error = '';

    const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    const fechaInicio = this.formatDate(startOfMonth);
    const fechaFin = this.formatDate(endOfMonth);

    console.log('Cargando calendario para:', { emprendimientoId: this.emprendimientoId, fechaInicio, fechaFin }); // Debug

    this.emprendimientoAdminService.getCalendario(this.emprendimientoId, fechaInicio, fechaFin).subscribe({
      next: (data) => {
        console.log('Datos del calendario recibidos:', data); // Debug
        this.calendarioData = data;
        this.buildCalendar();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar calendario:', err);
        this.error = err.error?.message || 'Error al cargar el calendario';
        this.loading = false;
        // Build empty calendar even on error
        this.buildCalendar();
      }
    });
  }

  private buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday before or on the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the last Saturday after or on the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    
    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      const eventosDia = this.getEventosForDate(dateStr);
      
      const day: CalendarDay = {
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isSameDay(currentDate, today),
        isSelected: this.selectedDay ? this.isSameDay(currentDate, this.selectedDay.date) : false,
        eventos: eventosDia,
        totalEventos: eventosDia.length,
        ingresosDia: this.calculateDayIngresos(eventosDia)
      };
      
      days.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    this.calendarDays = days;
    console.log('Calendario construido con', days.length, 'días'); // Debug
  }

  private getEventosForDate(dateStr: string): EventoCalendario[] {
    if (!this.calendarioData?.eventos_por_dia) return [];

    const eventosPorDia = this.calendarioData.eventos_por_dia;
    const eventosKeys = Object.keys(eventosPorDia);
    const matchingKey = eventosKeys.find(key => key.startsWith(dateStr));

    if (typeof matchingKey === 'string' && eventosPorDia[matchingKey]) {
      const eventosArray = eventosPorDia[matchingKey];
      return eventosArray.map((evento: EventoBackend) => ({
        id: evento.id,
        titulo: evento.titulo,
        hora_inicio: evento.hora_inicio,
        hora_fin: evento.hora_fin,
        estado: evento.estado,
        cliente: evento.cliente,
        servicio: evento.titulo,
        precio: evento.precio,
        tipo: 'reserva' as const
      }));
    }

    return [];
  }

  private calculateDayIngresos(eventos: EventoCalendario[]): number {
    return eventos.reduce((total, evento) => {
      if (evento.precio) {
        return total + parseFloat(evento.precio.toString());
      }
      return total;
    }, 0);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Función para obtener el nombre del mes
  getMonthName(): string {
    return this.monthNames[this.currentDate.getMonth()];
  }

  // Función para formatear la fecha del día seleccionado
  formatSelectedDayDate(): string {
    if (!this.selectedDay) return '';
    
    const date = this.selectedDay.date;
    const day = date.getDate();
    const month = this.monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  }

  selectDay(day: CalendarDay): void {
    // Update selection state
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDay = day;
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.selectedDay = undefined;
    this.loadCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedDay = undefined;
    this.loadCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDay = undefined;
    this.loadCalendar();
    
    // After calendar is built, select today
    setTimeout(() => {
      const todayDay = this.calendarDays.find(day => day.isToday);
      if (todayDay) {
        this.selectDay(todayDay);
      }
    }, 100);
  }

  refreshData(): void {
    this.loadCalendar();
  }

  getEventoClass(evento: EventoCalendario): string {
    return 'bg-orange-500/20 text-orange-200 border border-orange-400/30';
  }

getEventoEstadoBadge(estado: string): string {
    const classes = {
      'pendiente': 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
      'confirmado': 'bg-green-500/20 text-green-300 border border-green-400/30',
      'confirmada': 'bg-green-500/20 text-green-300 border border-green-400/30',
      'cancelado': 'bg-red-500/20 text-red-300 border border-red-400/30',
      'cancelada': 'bg-red-500/20 text-red-300 border border-red-400/30',
      'completado': 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
      'completada': 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
    };
    
    return classes[estado.toLowerCase() as keyof typeof classes] || 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
  }

  // TrackBy functions para optimizar el rendimiento
  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  trackByEvento(index: number, evento: EventoCalendario): number {
    return evento.id;
  }
}