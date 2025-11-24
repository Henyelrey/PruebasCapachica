import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarEvent, CalendarModule, CalendarUtils } from 'angular-calendar';
import { Emprendedor, Evento, EventosService } from './evento.service';
import { addMonths, subMonths } from 'date-fns';
import { Location } from '@angular/common';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, RouterModule],
  providers: [CalendarUtils],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  constructor(
    private eventosService: EventosService,
    private location: Location
  ) { }

  // Estados principales
  eventos: Evento[] = [];
  eventoDestacado: Evento | undefined;
  eventoCercano: Evento | null = null;
  isLoading = true;
  
  // Calendario
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  mostrarModalCalendario = false;

  // Filtros
  filtroNombre: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroTipo: string = '';

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarEventoCercano();
  }

  cargarEventos(): void {
    this.isLoading = true;
    this.eventosService.getEventos().subscribe({
      next: (data) => {
        this.eventos = data;
        this.procesarEventos();
        this.actualizarCalendario();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando eventos:', error);
        this.isLoading = false;
      }
    });
  }

  procesarEventos(): void {
    if (this.eventos.length > 0) {
      // Evento destacado
      this.eventoDestacado = this.eventos.find(e => e.destacado) || this.eventos[0];

      // Evento más cercano
      const ahora = new Date();
      const eventosFuturos = this.eventos.filter(evento =>
        new Date(`${evento.fecha_inicio}T${evento.hora_inicio}`) >= ahora
      );

      eventosFuturos.sort((a, b) =>
        new Date(`${a.fecha_inicio}T${a.hora_inicio}`).getTime() -
        new Date(`${b.fecha_inicio}T${b.hora_inicio}`).getTime()
      );

      this.eventoCercano = eventosFuturos[0] || null;
    }
  }

  cargarEventoCercano(): void {
    this.eventosService.getProximosEventos().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          const eventosOrdenados = res.data.sort((a: any, b: any) =>
            new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
          );
          this.eventoCercano = eventosOrdenados[0];
        }
      },
      error: (err) => {
        console.error('Error al cargar el evento más cercano', err);
      }
    });
  }

  // Getter para eventos filtrados
  get eventosFiltrados(): Evento[] {
    return this.eventos.filter(evento => {
      const nombreCoincide = !this.filtroNombre.trim() ||
        evento.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const fechaInicio = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
      const fechaFin = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;
      const fechaEvento = new Date(`${evento.fecha_inicio}T${evento.hora_inicio || '00:00'}`);

      const dentroDelRango =
        (!fechaInicio || fechaEvento >= fechaInicio) &&
        (!fechaFin || fechaEvento <= fechaFin);

      const tipoCoincide = !this.filtroTipo || 
        evento.tipo_evento?.toLowerCase() === this.filtroTipo.toLowerCase();

      return nombreCoincide && dentroDelRango && tipoCoincide;
    });
  }

  get tiposEventosUnicos(): string[] {
    const tipos = this.eventos
      .map(e => e.tipo_evento?.trim())
      .filter((tipo): tipo is string => typeof tipo === 'string' && tipo.length > 0);
    return Array.from(new Set(tipos));
  }

  actualizarCalendario(): void {
    this.calendarEvents = this.eventosFiltrados.map(evento => ({
      start: new Date(`${evento.fecha_inicio}T${evento.hora_inicio || '08:00'}`),
      end: new Date(`${evento.fecha_fin}T${evento.hora_fin || '18:00'}`),
      title: evento.nombre,
      allDay: false,
      color: {
        primary: '#f97316',
        secondary: '#fed7aa'
      }
    }));
  }

  // Métodos de filtros
  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtroTipo = '';
    this.actualizarCalendario();
  }

  aplicarFiltros(): void {
    this.actualizarCalendario();
  }

  // Navegación
  goBack(): void {
    this.location.back();
  }

  // Calendario
  openCalendar(): void {
    this.mostrarModalCalendario = !this.mostrarModalCalendario;
  }

  siguienteMes(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  anteriorMes(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  // Utilidades
  getSliderImage(evento: Evento | null): string {
    if (!evento) return 'assets/default-image.jpg';
    
    // Si tiene sliders, usar la primera imagen
    if (evento.sliders && evento.sliders.length > 0) {
      return evento.sliders[0].url_completa;
    }
    
    // Si no tiene sliders, usar imagen por defecto
    return 'assets/default-image.jpg';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // HH:mm
  }

  // Métodos para eventos del calendario
  onEventClick(event: CalendarEvent): void {
    // Encontrar el evento correspondiente
    const evento = this.eventos.find(e => e.nombre === event.title);
    if (evento) {
      // Navegar al detalle del evento
      // this.router.navigate(['/eventos/eventosdetalle', evento.id]);
    }
  }

  onDayClick(day: any): void {
    // Lógica para cuando se hace clic en un día del calendario
    console.log('Día seleccionado:', day);
  }

  // Métodos adicionales que podrían ser útiles
  compartirEvento(evento: Evento): void {
    if (navigator.share) {
      navigator.share({
        title: evento.nombre,
        text: evento.descripcion,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        console.log('URL copiada al portapapeles');
      });
    }
  }

  toggleFavorito(evento: Evento): void {
    // Lógica para agregar/quitar de favoritos
    console.log('Toggle favorito para:', evento.nombre);
  }

  agregarAlCalendario(evento: Evento): void {
    // Crear evento para el calendario del dispositivo
    const startDate = new Date(`${evento.fecha_inicio}T${evento.hora_inicio}`);
    const endDate = new Date(`${evento.fecha_fin}T${evento.hora_fin}`);
    
    const calendarEvent = {
      title: evento.nombre,
      start: startDate,
      end: endDate,
      description: evento.descripcion,
      location: evento.ubicacion || ''
    };

    // Generar URL para Google Calendar
    const googleCalendarUrl = this.generateGoogleCalendarUrl(calendarEvent);
    window.open(googleCalendarUrl, '_blank');
  }

  private generateGoogleCalendarUrl(event: any): string {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: event.title,
      dates: `${this.formatDateForGoogle(event.start)}/${this.formatDateForGoogle(event.end)}`,
      details: event.description || '',
      location: event.location || ''
    });
    
    return `${baseUrl}&${params.toString()}`;
  }

  private formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Método para scroll suave
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}