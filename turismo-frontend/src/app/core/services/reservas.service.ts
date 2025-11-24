import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model'; // Import User model

// Interfaces para el servicio de reservas
export interface Usuario {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  country?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
  phone?: string;
  preferred_language?: string;
  active?: boolean;
  last_login?: string;
  foto_perfil?: string;
  avatar?: string;
  foto_perfil_url?: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio_referencial: string;
  emprendedor_id: number;
  estado: boolean;
  created_at: string;
  updated_at: string;
  capacidad: number;
  latitud: string;
  longitud: string;
  ubicacion_referencia: string;
  emprendedor?: Emprendedor;
  categorias?: CategoriaServicio[];
  horarios?: HorarioServicio[];
}

export interface Emprendedor {
  id: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  pagina_web?: string;
  horario_atencion: string;
  precio_rango: string;
  metodos_pago: string;
  capacidad_aforo: number;
  numero_personas_atiende: number;
  comentarios_resenas?: string;
  imagenes?: string;
  categoria: string;
  certificaciones?: string;
  idiomas_hablados?: string;
  opciones_acceso?: string;
  facilidades_discapacidad?: boolean;
  estado: boolean;
  created_at: string;
  updated_at: string;
  asociacion_id?: number;
}

export interface CategoriaServicio {
  id: number;
  nombre: string;
}

export interface HorarioServicio {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface ReservaServicio {
  id?: number;
  reserva_id?: number;
  servicio_id: number;
  emprendedor_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  cantidad?: number;
  precio?: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas_cliente?: string;
  notas_emprendedor?: string;
  created_at?: string;
  updated_at?: string;
  servicio?: Servicio;
  emprendedor?: Emprendedor;
}

export interface Reserva {
  id?: number;
  usuario_id: number;
  codigo_reserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  created_at?: string;
  updated_at?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  total_servicios?: number;
  usuario?: Usuario;
  servicios?: ReservaServicio[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number;
  to: number;
  total: number;
  per_page: number;
  last_page: number;
  path: string;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  links: PaginationLink[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ReservaResponse {
  success: boolean;
  data: Reserva[] | Reserva;
  message?: string;
}

export interface PaginatedReservaResponse {
  success: boolean;
  data: PaginatedResponse<Reserva>;
  message?: string;
}

export interface DisponibilidadResponse {
  success: boolean;
  disponible: boolean;
}

export interface EstadisticasReservas {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
}

export interface FiltrosReserva {
  codigo?: string;
  estado?: string;
  fecha_inicio?: string;
  usuario_id?: number;
  emprendedor_id?: number;
  servicio_id?: number;
}

export interface CreateReservaRequest {
  usuario_id: number;
  codigo_reserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  servicios: {
    id?: number;
    servicio_id: number;
    emprendedor_id: number;
    fecha_inicio: string;
    fecha_fin?: string;
    hora_inicio: string;
    hora_fin: string;
    duracion_minutos: number;
    cantidad?: number;
    precio?: number;
    estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
    notas_cliente?: string;
    notas_emprendedor?: string;
  }[];
}

export interface UpdateReservaRequest extends CreateReservaRequest {}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // Obtener todas las reservas con paginación y filtros
  getReservas(page: number = 1, perPage: number = 10, filters: FiltrosReserva = {}): Observable<PaginatedResponse<Reserva>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters.codigo) {
      params = params.set('codigo', filters.codigo);
    }

    if (filters.estado) {
      params = params.set('estado', filters.estado);
    }

    if (filters.fecha_inicio) {
      params = params.set('fecha_inicio', filters.fecha_inicio);
    }

    if (filters.usuario_id) {
      params = params.set('usuario_id', filters.usuario_id.toString());
    }

    if (filters.emprendedor_id) {
      params = params.set('emprendedor_id', filters.emprendedor_id.toString());
    }

    if (filters.servicio_id) {
      params = params.set('servicio_id', filters.servicio_id.toString());
    }

    return this.http.get<PaginatedReservaResponse>(`${this.API_URL}/reservas`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener una reserva específica
  getReserva(id: number): Observable<Reserva> {
    return this.http.get<ReservaResponse>(`${this.API_URL}/reservas/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data[0] : response.data)
    );
  }

  // Crear nueva reserva
  createReserva(reserva: CreateReservaRequest): Observable<Reserva> {
    return this.http.post<ReservaResponse>(`${this.API_URL}/reservas`, reserva, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data[0] : response.data)
    );
  }

  // Actualizar reserva
  updateReserva(id: number, reserva: UpdateReservaRequest): Observable<Reserva> {
    return this.http.put<ReservaResponse>(`${this.API_URL}/reservas/${id}`, reserva, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data[0] : response.data)
    );
  }

  // Eliminar reserva
  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/reservas/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Cambiar estado de una reserva
  cambiarEstadoReserva(id: number, estado: string): Observable<Reserva> {
    return this.http.put<ReservaResponse>(`${this.API_URL}/reservas/${id}/estado`, 
      { estado }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data[0] : response.data)
    );
  }

  // Cambiar estado de un servicio específico dentro de una reserva
  cambiarEstadoServicioReserva(servicioReservaId: number, estado: string): Observable<ReservaServicio> {
    return this.http.put<{ success: boolean; data: ReservaServicio; message: string }>(`${this.API_URL}/reserva-servicios/${servicioReservaId}/estado`, 
      { estado }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener reservas por emprendedor
  getReservasByEmprendedor(emprendedorId: number): Observable<Reserva[]> {
    return this.http.get<ReservaResponse>(`${this.API_URL}/reservas/emprendedor/${emprendedorId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data : [response.data])
    );
  }

  // Obtener reservas por servicio
  getReservasByServicio(servicioId: number): Observable<Reserva[]> {
    return this.http.get<ReservaResponse>(`${this.API_URL}/reservas/servicio/${servicioId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => Array.isArray(response.data) ? response.data : [response.data])
    );
  }

  // Obtener servicios de una reserva
  getServiciosReserva(reservaId: number): Observable<ReservaServicio[]> {
    return this.http.get<{ success: boolean; data: ReservaServicio[] }>(`${this.API_URL}/reserva-servicios/reserva/${reservaId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener calendario de reservas
  getCalendarioReservas(fechaInicio: string, fechaFin: string): Observable<ReservaServicio[]> {
    let params = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);

    return this.http.get<{ success: boolean; data: ReservaServicio[] }>(`${this.API_URL}/reserva-servicios/calendario`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Verificar disponibilidad de servicio
  verificarDisponibilidadServicio(
    servicioId: number,
    fechaInicio: string,
    fechaFin: string | null,
    horaInicio: string,
    horaFin: string,
    reservaServicioId?: number
  ): Observable<DisponibilidadResponse> {
    let params = new HttpParams()
      .set('servicio_id', servicioId.toString())
      .set('fecha_inicio', fechaInicio)
      .set('hora_inicio', horaInicio)
      .set('hora_fin', horaFin);

    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin);
    }

    if (reservaServicioId) {
      params = params.set('reserva_servicio_id', reservaServicioId.toString());
    }

    return this.http.get<DisponibilidadResponse>(`${this.API_URL}/reserva-servicios/verificar-disponibilidad`, {
      params,
      headers: this.getHeaders()
    });
  }

  // Obtener todos los servicios disponibles
  getServicios(page: number = 1, perPage: number = 1000): Observable<PaginatedResponse<Servicio>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<{ success: boolean; data: PaginatedResponse<Servicio> }>(`${this.API_URL}/servicios`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener servicio específico
  getServicio(id: number): Observable<Servicio> {
    return this.http.get<{ success: boolean; data: Servicio }>(`${this.API_URL}/servicios/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener todos los emprendedores
  getEmprendedores(page: number = 1, perPage: number = 1000): Observable<PaginatedResponse<Emprendedor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<{ success: boolean; data: PaginatedResponse<Emprendedor> }>(`${this.API_URL}/emprendedores`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener estadísticas de reservas
  getEstadisticasReservas(): Observable<EstadisticasReservas> {
    return this.getReservas(1, 1000).pipe(
      map(response => {
        const reservas = response.data;
        const stats: EstadisticasReservas = {
          total: response.total,
          pendientes: 0,
          confirmadas: 0,
          completadas: 0,
          canceladas: 0
        };

        reservas.forEach(reserva => {
          switch (reserva.estado) {
            case 'pendiente':
              stats.pendientes++;
              break;
            case 'confirmada':
              stats.confirmadas++;
              break;
            case 'completada':
              stats.completadas++;
              break;
            case 'cancelada':
              stats.canceladas++;
              break;
          }
        });

        return stats;
      })
    );
  }

  // Obtener usuarios (deprecated - use UsersService instead)
  getUsuarios(): Observable<User[]> {
    // This method is deprecated, use UsersService.getUsersByRole('user') instead
    return this.http.get<{ success: boolean; data: User[] }>(`${this.API_URL}/usuarios`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Buscar usuarios (deprecated - use UsersService instead)
  buscarUsuarios(query: string): Observable<User[]> {
    // This method is deprecated, use UsersService.searchUsers(query) instead
    let params = new HttpParams().set('q', query);
    
    return this.http.get<{ success: boolean; data: User[] }>(`${this.API_URL}/usuarios/search`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }
}