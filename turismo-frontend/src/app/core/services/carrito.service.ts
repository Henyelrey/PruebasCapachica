import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Reserva, ReservaServicio } from '../models/user.model';

export interface CarritoItem {
  servicio_id: number;
  emprendedor_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  cantidad?: number;
  notas_cliente?: string;
}

export interface CarritoResponse {
  success: boolean;
  message?: string;
  data: Reserva;
}

export interface CarritoActionResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  // Signals para manejar el estado del carrito
  private readonly _carrito = signal<Reserva | null>(null);
  private readonly _carritoItems = signal<ReservaServicio[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _totalServicios = signal<number>(0);
  
  // Signals públicos readonly
  readonly carrito = this._carrito.asReadonly();
  readonly carritoItems = this._carritoItems.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly totalServicios = this._totalServicios.asReadonly();
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtener el carrito actual del usuario
   */
  obtenerCarrito(): Observable<Reserva> {
    this._isLoading.set(true);
    
    return this.http.get<CarritoResponse>(`${this.API_URL}/reservas/carrito`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(carrito => {
        this._carrito.set(carrito);
        this._carritoItems.set(carrito.servicios || []);
        this._totalServicios.set(carrito.servicios?.length || 0);
      }),
      catchError(error => this.handleError(error)),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Agregar un servicio al carrito
   */
  agregarAlCarrito(item: CarritoItem): Observable<any> {
    this._isLoading.set(true);
    
    return this.http.post<CarritoActionResponse>(`${this.API_URL}/reservas/carrito/agregar`, item, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        // Recargar el carrito después de agregar
        this.obtenerCarrito().subscribe();
      }),
      catchError(error => this.handleError(error)),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Eliminar un servicio específico del carrito
   */
  eliminarDelCarrito(reservaServicioId: number): Observable<any> {
    this._isLoading.set(true);
    
    return this.http.delete<CarritoActionResponse>(`${this.API_URL}/reservas/carrito/servicio/${reservaServicioId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        // Actualizar el estado local
        const itemsActuales = this._carritoItems();
        const itemsActualizados = itemsActuales.filter(item => item.id !== reservaServicioId);
        this._carritoItems.set(itemsActualizados);
        this._totalServicios.set(itemsActualizados.length);
      }),
      catchError(error => this.handleError(error)),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Confirmar la reserva (convertir carrito en reserva definitiva)
   */
  confirmarReserva(): Observable<any> {
    this._isLoading.set(true);
    
    return this.http.post<CarritoActionResponse>(`${this.API_URL}/reservas/carrito/confirmar`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        // Limpiar el carrito local después de confirmar
        this.limpiarCarritoLocal();
      }),
      catchError(error => this.handleError(error)),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Vaciar completamente el carrito
   */
  vaciarCarrito(): Observable<any> {
    this._isLoading.set(true);
    
    return this.http.delete<CarritoActionResponse>(`${this.API_URL}/reservas/carrito/vaciar`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.limpiarCarritoLocal();
      }),
      catchError(error => this.handleError(error)),
      tap(() => this._isLoading.set(false))
    );
  }

  /**
   * Verificar si hay items en el carrito
   */
  tieneItems(): boolean {
    return this._totalServicios() > 0;
  }

  /**
   * Obtener el número total de servicios en el carrito
   */
  getTotalItems(): number {
    return this._totalServicios();
  }

  /**
   * Limpiar el estado local del carrito
   */
  private limpiarCarritoLocal(): void {
    this._carrito.set(null);
    this._carritoItems.set([]);
    this._totalServicios.set(0);
  }

  /**
   * Inicializar el carrito al cargar la aplicación
   */
  inicializarCarrito(): void {
    // Solo cargar si hay un token de autenticación
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.obtenerCarrito().subscribe({
        next: () => {
          console.log('Carrito inicializado correctamente');
        },
        error: (error) => {
          console.log('No se pudo inicializar el carrito:', error);
          // No es un error crítico, el usuario puede no tener carrito aún
        }
      });
    }
  }

  /**
   * Limpiar carrito al cerrar sesión
   */
  limpiarCarritoAlCerrarSesion(): void {
    this.limpiarCarritoLocal();
  }

  /**
   * Manejar errores de la API
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en CarritoService:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Si es un error 401, el usuario no está autenticado
    if (error.status === 401) {
      errorMessage = 'Debe iniciar sesión para acceder al carrito';
      this.limpiarCarritoLocal();
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}