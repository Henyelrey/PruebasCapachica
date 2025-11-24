import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environments';
import { Evento, PaginatedEvento, EventoResponse } from './evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  /**
   * Obtiene un listado paginado de eventos
   */
  getEventos(page: number = 1, perPage: number = 10, search?: string): Observable<PaginatedEvento> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<EventoResponse>(`${this.API_URL}/eventos`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data && typeof response.data !== 'string') {
            return response.data as PaginatedEvento;
          }
          throw new Error('Formato de respuesta inesperado');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene los eventos de un emprendedor específico
   */
  getEventosByEmprendedor(emprendedorId: number): Observable<Evento[]> {
    return this.http.get<EventoResponse>(`${this.API_URL}/eventos/emprendedor/${emprendedorId}`)
      .pipe(
        map(response => {
          if (response.success && response.data && typeof response.data !== 'string') {
            if (Array.isArray(response.data)) {
              return response.data as Evento[];
            } else if ('data' in response.data) {
              return (response.data as PaginatedEvento).data;
            }
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene eventos activos
   */
  getEventosActivos(): Observable<Evento[]> {
    return this.http.get<EventoResponse>(`${this.API_URL}/eventos/activos`)
      .pipe(
        map(response => {
          if (response.success && response.data && typeof response.data !== 'string') {
            if (Array.isArray(response.data)) {
              return response.data as Evento[];
            } else if ('data' in response.data) {
              return (response.data as PaginatedEvento).data;
            }
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene próximos eventos
   */
  getEventosProximos(): Observable<Evento[]> {
    return this.http.get<EventoResponse>(`${this.API_URL}/eventos/proximos`)
      .pipe(
        map(response => {
          if (response.success && response.data && typeof response.data !== 'string') {
            if (Array.isArray(response.data)) {
              return response.data as Evento[];
            } else if ('data' in response.data) {
              return (response.data as PaginatedEvento).data;
            }
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un evento por su ID
   */
  getEvento(id: number): Observable<Evento> {
    return this.http.get<EventoResponse>(`${this.API_URL}/eventos/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data && typeof response.data !== 'string' && !('data' in response.data)) {
            return response.data as Evento;
          }
          throw new Error('Evento no encontrado');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Crea un nuevo evento
   */
  createEvento(eventoData: FormData): Observable<string> {
    return this.http.post<EventoResponse>(`${this.API_URL}/eventos`, eventoData)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Evento creado con éxito';
          }
          throw new Error('Error al crear el evento');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un evento existente
   */
  updateEvento(id: number, eventoData: FormData): Observable<string> {
    return this.http.post<EventoResponse>(`${this.API_URL}/eventos/${id}?_method=PUT`, eventoData)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Evento actualizado con éxito';
          }
          throw new Error('Error al actualizar el evento');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un evento
   */
  deleteEvento(id: number): Observable<string> {
    return this.http.delete<EventoResponse>(`${this.API_URL}/eventos/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Evento eliminado con éxito';
          }
          throw new Error('Error al eliminar el evento');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Manejador de errores centralizado
   */
  private handleError(error: HttpErrorResponse) {
    // Log del error
    console.error('Error API:', error);
    
    // Si es un error de validación, devolvemos el error tal cual para que el componente pueda procesarlo
    if (error.status === 422) {
      return throwError(() => error);
    }
    
    // Personalizar el mensaje de error según el tipo de error
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    
    // Devolver un observable con un error amigable para el usuario
    return throwError(() => new Error(errorMessage));
  }
}