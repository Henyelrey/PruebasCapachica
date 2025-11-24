import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { 
  Emprendimiento, 
  PaginatedEmprendimientos,
  PaginatedAsociaciones,
  FiltrosEmprendimientos,
  Asociacion 
} from './emprendimiento.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmprendimientosService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  constructor() { }

  /**
   * Obtener todos los emprendimientos con paginación
   */
  getEmprendimientos(page: number = 1, perPage: number = 15): Observable<PaginatedEmprendimientos> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<ApiResponse<PaginatedEmprendimientos>>(`${this.API_URL}/emprendedores`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Obtener un emprendimiento específico por ID
   */
  getEmprendimiento(id: number): Observable<Emprendimiento> {
    return this.http.get<ApiResponse<Emprendimiento>>(`${this.API_URL}/emprendedores/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener emprendimientos por asociación
   */
  getEmprendimientosByAsociacion(asociacionId: number): Observable<Emprendimiento[]> {
    return this.http.get<ApiResponse<Emprendimiento[]>>(`${this.API_URL}/emprendedores/asociacion/${asociacionId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener todas las asociaciones con paginación
   */
  getAsociaciones(page: number = 1, perPage: number = 15): Observable<PaginatedAsociaciones> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<ApiResponse<PaginatedAsociaciones>>(`${this.API_URL}/asociaciones`, { params })
      .pipe(map(response => response.data));
  }


  /**
   * Obtener una asociación específica
   */
  getAsociacion(id: number): Observable<Asociacion> {
    return this.http.get<ApiResponse<Asociacion>>(`${this.API_URL}/asociaciones/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener asociaciones por municipalidad
   */
  getAsociacionesByMunicipalidad(municipalidadId: number): Observable<Asociacion[]> {
    return this.http.get<ApiResponse<Asociacion[]>>(`${this.API_URL}/asociaciones/municipalidad/${municipalidadId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Buscar emprendimientos con filtros
   */
  buscarEmprendimientos(filtros: FiltrosEmprendimientos, page: number = 1, perPage: number = 15): Observable<PaginatedEmprendimientos> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filtros.busqueda) {
      params = params.set('search', filtros.busqueda);
    }
    if (filtros.asociacion) {
      params = params.set('asociacion_id', filtros.asociacion.toString());
    }
    if (filtros.categoria) {
      params = params.set('categoria', filtros.categoria);
    }
    if (filtros.tipo_servicio) {
      params = params.set('tipo_servicio', filtros.tipo_servicio);
    }
    if (filtros.municipalidad) {
      params = params.set('municipalidad_id', filtros.municipalidad.toString());
    }
    if (filtros.facilidades_discapacidad !== undefined) {
      params = params.set('facilidades_discapacidad', filtros.facilidades_discapacidad.toString());
    }
    if (filtros.metodos_pago && filtros.metodos_pago.length > 0) {
      filtros.metodos_pago.forEach(metodo => {
        params = params.append('metodos_pago[]', metodo);
      });
    }
    if (filtros.precio_rango?.min) {
      params = params.set('precio_min', filtros.precio_rango.min.toString());
    }
    if (filtros.precio_rango?.max) {
      params = params.set('precio_max', filtros.precio_rango.max.toString());
    }

    return this.http.get<ApiResponse<PaginatedEmprendimientos>>(`${this.API_URL}/emprendedores`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Obtener categorías únicas de emprendimientos
   */
  getCategorias(): Observable<string[]> {
    return this.getEmprendimientos(1, 100).pipe(
      map(response => {
        const categorias = new Set<string>();
        response.data.forEach(emp => {
          if (emp.categoria) {
            categorias.add(emp.categoria);
          }
        });
        return Array.from(categorias).sort();
      })
    );
  }

  /**
   * Obtener tipos de servicio únicos
   */
  getTiposServicio(): Observable<string[]> {
    return this.getEmprendimientos(1, 100).pipe(
      map(response => {
        const tipos = new Set<string>();
        response.data.forEach(emp => {
          if (emp.tipo_servicio) {
            tipos.add(emp.tipo_servicio);
          }
        });
        return Array.from(tipos).sort();
      })
    );
  }

  /**
   * Obtener métodos de pago únicos
   */
  getMetodosPago(): Observable<string[]> {
    return this.getEmprendimientos(1, 100).pipe(
      map(response => {
        const metodos = new Set<string>();
        response.data.forEach(emp => {
          if (emp.metodos_pago && Array.isArray(emp.metodos_pago)) {
            emp.metodos_pago.forEach(metodo => metodos.add(metodo));
          }
        });
        return Array.from(metodos).sort();
      })
    );
  }

  /**
   * Métodos auxiliares para procesamiento de datos
   */
  
  obtenerImagenPrincipal(emprendimiento: Emprendimiento): string {
    if (emprendimiento.sliders_principales && emprendimiento.sliders_principales.length > 0) {
      return emprendimiento.sliders_principales[0].url_completa || '/assets/general/placeholder-business.jpg';
    }
    return '/assets/general/placeholder-business.jpg';
  }

  obtenerImagenesSecundarias(emprendimiento: Emprendimiento): string[] {
    if (emprendimiento.sliders_secundarios && emprendimiento.sliders_secundarios.length > 0) {
      return emprendimiento.sliders_secundarios.map(slider => slider.url_completa);
    }
    return [];
  }

  procesarMetodosPago(metodos: any): string[] {
    if (Array.isArray(metodos)) {
      return metodos;
    }
    if (typeof metodos === 'string') {
      try {
        return JSON.parse(metodos);
      } catch {
        return metodos.split(',').map((m: string) => m.trim());
      }
    }
    return [];
  }

  procesarIdiomasHablados(idiomas: any): string[] {
    if (Array.isArray(idiomas)) {
      return idiomas;
    }
    if (typeof idiomas === 'string') {
      try {
        return JSON.parse(idiomas);
      } catch {
        return idiomas.split(',').map((i: string) => i.trim());
      }
    }
    return [];
  }

  calcularCalificacionPromedio(emprendimiento: Emprendimiento): number {
    // Por ahora retornamos un valor aleatorio para demostración
    // En el futuro se puede implementar con reseñas reales
    return Math.round((Math.random() * 2 + 3) * 10) / 10; // Entre 3.0 y 5.0
  }

  formatearPrecioRango(rango: string): { min: number; max: number } | null {
    if (!rango) return null;
    
    const matches = rango.match(/S\/\.\s*(\d+)\s*-\s*S\/\.\s*(\d+)/);
    if (matches) {
      return {
        min: parseInt(matches[1]),
        max: parseInt(matches[2])
      };
    }
    return null;
  }

  estaAbierto(horario: string): boolean {
    if (!horario) return false;
    
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    
    // Parsing básico del horario (se puede mejorar)
    const matches = horario.match(/(\d{1,2}):(\d{2})\s*(?:am|pm)?\s*-\s*(\d{1,2}):(\d{2})\s*(?:am|pm)?/i);
    if (matches) {
      const horaInicio = parseInt(matches[1]);
      const minutoInicio = parseInt(matches[2]);
      const horaFin = parseInt(matches[3]);
      const minutoFin = parseInt(matches[4]);
      
      const tiempoActual = horaActual * 60 + minutoActual;
      const tiempoInicio = horaInicio * 60 + minutoInicio;
      const tiempoFin = horaFin * 60 + minutoFin;
      
      return tiempoActual >= tiempoInicio && tiempoActual <= tiempoFin;
    }
    
    return false;
  }
}