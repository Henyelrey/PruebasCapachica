import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva, ReservaServicio } from './turismo.service';

export interface MisReservasResponse {
  success: boolean;
  data: Reserva[];
  message?: string;
}

export interface ActualizarReservaRequest {
  usuario_id?: number;
  codigo_reserva?: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  servicios?: {
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

export interface CambiarEstadoRequest {
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

export interface VerificarDisponibilidadRequest {
  servicio_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_inicio: string;
  hora_fin: string;
  reserva_servicio_id?: number;
}

export interface DisponibilidadResponse {
  success: boolean;
  disponible: boolean;
}

export interface MensajeChat {
  id: number;
  reserva_id: number;
  usuario_id: number;
  emprendedor_id: number;
  mensaje: string;
  emisor: 'usuario' | 'emprendedor';
  leido: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnviarMensajeRequest {
  reserva_id: number;
  emprendedor_id: number;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class MisReservasService {
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

  // Obtener todas las reservas del usuario autenticado
  getMisReservas(): Observable<Reserva[]> {
    return this.http.get<MisReservasResponse>(`${this.API_URL}/reservas/mis-reservas`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Obtener una reserva específica con detalles
  getReservaDetalle(id: number): Observable<Reserva> {
    return this.http.get<{ success: boolean; data: Reserva }>(`${this.API_URL}/reservas/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Actualizar una reserva completa
  actualizarReserva(id: number, datos: ActualizarReservaRequest): Observable<Reserva> {
    return this.http.put<{ success: boolean; data: Reserva; message: string }>(`${this.API_URL}/reservas/${id}`, datos, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  // Cambiar solo el estado de una reserva
  cambiarEstadoReserva(id: number, estado: string): Observable<Reserva> {
    return this.http.put<{ success: boolean; data: Reserva; message: string }>(`${this.API_URL}/reservas/${id}/estado`, 
      { estado }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
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

  // Verificar disponibilidad para cambios en horarios
  verificarDisponibilidad(params: VerificarDisponibilidadRequest): Observable<boolean> {
    let httpParams = new HttpParams()
      .set('servicio_id', params.servicio_id.toString())
      .set('fecha_inicio', params.fecha_inicio)
      .set('hora_inicio', params.hora_inicio)
      .set('hora_fin', params.hora_fin);

    if (params.fecha_fin) {
      httpParams = httpParams.set('fecha_fin', params.fecha_fin);
    }

    if (params.reserva_servicio_id) {
      httpParams = httpParams.set('reserva_servicio_id', params.reserva_servicio_id.toString());
    }

    return this.http.get<DisponibilidadResponse>(`${this.API_URL}/reserva-servicios/verificar-disponibilidad`, {
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(
      map(response => response.disponible)
    );
  }

  // Simular proceso de pago (estático por ahora)
  procesarPago(reservaId: number, metodoPago: 'yape' | 'visa' | 'mastercard'): Observable<{ success: boolean; url_pago?: string }> {
    // Por ahora retornamos una URL simulada
    const urlsSimuladas = {
      yape: '/pagos/yape',
      visa: '/pagos/visa', 
      mastercard: '/pagos/mastercard'
    };

    return new Observable(observer => {
      // Simular un pequeño delay
      setTimeout(() => {
        try {
          observer.next({
            success: true,
            url_pago: urlsSimuladas[metodoPago]
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 500); // Reducir tiempo de espera
    });
  }

  // Métodos para chat (simulados por ahora ya que no están en el backend)
  getMensajesChat(reservaId: number, emprendedorId: number): Observable<MensajeChat[]> {
    // Simulación - en el futuro será una llamada real al API
    return new Observable(observer => {
      const mensajesSimulados: MensajeChat[] = [
        {
          id: 1,
          reserva_id: reservaId,
          usuario_id: 1,
          emprendedor_id: emprendedorId,
          mensaje: "Hola, tengo algunas preguntas sobre mi reserva",
          emisor: 'usuario',
          leido: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          reserva_id: reservaId,
          usuario_id: 1,
          emprendedor_id: emprendedorId,
          mensaje: "¡Hola! Claro, estoy aquí para ayudarte. ¿Qué necesitas saber?",
          emisor: 'emprendedor',
          leido: true,
          created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
        }
      ];

      setTimeout(() => {
        observer.next(mensajesSimulados);
        observer.complete();
      }, 500);
    });
  }

  enviarMensaje(datos: EnviarMensajeRequest): Observable<MensajeChat> {
    // Simulación - en el futuro será una llamada real al API
    return new Observable(observer => {
      const nuevoMensaje: MensajeChat = {
        id: Date.now(),
        reserva_id: datos.reserva_id,
        usuario_id: 1, // Usuario actual
        emprendedor_id: datos.emprendedor_id,
        mensaje: datos.mensaje,
        emisor: 'usuario',
        leido: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTimeout(() => {
        observer.next(nuevoMensaje);
        observer.complete();
      }, 500);
    });
  }

  // Método para obtener resumen de estadísticas de reservas
  getEstadisticasReservas(): Observable<{
    total: number;
    pendientes: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
  }> {
    return this.getMisReservas().pipe(
      map(reservas => {
        const stats = {
          total: reservas.length,
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
}