import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { TurismoService, PaginatedResponse, Servicio, Categoria, Emprendedor } from '../../../core/services/turismo.service';

// Interfaces específicas para el servicio de servicios
export interface ServicioFiltros {
  categoria?: number;
  emprendedor?: number;
  precio_min?: number;
  precio_max?: number;
  ubicacion?: {
    latitud: number;
    longitud: number;
    distancia: number;
  };
  busqueda?: string;
  estado?: boolean;
}

export interface ServicioListItem {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  emprendedor_id: number;
  estado?: boolean;
  capacidad?: string;
  latitud?: number;
  longitud?: number;
  ubicacion_referencia?: string;
  imagen_principal?: string;
  emprendedor?: {
    id: number;
    nombre: string;
    tipo_servicio: string;
    categoria: string;
  };
  categorias?: Array<{
    id: number;
    nombre: string;
    icono_url?: string;
  }>;
  horarios_resumen?: string[];
}

export interface ServicioCompleto extends ServicioListItem {
  horarios?: Array<{
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
  }>;
  sliders?: Array<{
    id: number;
    url: string;
    url_completa: string;
    nombre: string;
    orden: number;
  }>;
  emprendedor_completo?: {
    id: number;
    nombre: string;
    tipo_servicio: string;
    descripcion: string;
    ubicacion: string;
    telefono: string;
    email: string;
    precio_rango?: string;
    categoria: string;
    horario_atencion?: string;
    metodos_pago?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private turismoService = inject(TurismoService);

  /**
   * Obtiene la lista de servicios con filtros aplicados
   */
  getServicios(filtros: ServicioFiltros = {}, page: number = 1, perPage: number = 15): Observable<PaginatedResponse<ServicioListItem>> {
    return this.turismoService.getServicios(page, perPage, this.prepararFiltros(filtros))
      .pipe(
        map(response => ({
          ...response,
          data: response.data.map(servicio => this.transformarServicioLista(servicio))
        })),
        catchError(error => {
          console.error('Error obteniendo servicios:', error);
          return of({
            current_page: 1,
            data: [],
            first_page_url: '',
            from: 0,
            last_page: 1,
            last_page_url: '',
            links: [],
            next_page_url: null,
            path: '',
            per_page: perPage,
            prev_page_url: null,
            to: 0,
            total: 0
          });
        })
      );
  }

  /**
   * Obtiene un servicio específico por ID
   */
  getServicio(id: number): Observable<ServicioCompleto | null> {
    return this.turismoService.getServicio(id)
      .pipe(
        map(servicio => this.transformarServicioCompleto(servicio)),
        catchError(error => {
          console.error('Error obteniendo servicio:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene servicios por categoría
   */
  getServiciosPorCategoria(categoriaId: number): Observable<ServicioListItem[]> {
    return this.turismoService.getServiciosByCategoria(categoriaId)
      .pipe(
        map(servicios => servicios.map(servicio => this.transformarServicioLista(servicio))),
        catchError(error => {
          console.error('Error obteniendo servicios por categoría:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene servicios por emprendedor
   */
  getServiciosPorEmprendedor(emprendedorId: number): Observable<ServicioListItem[]> {
    return this.turismoService.getServiciosByEmprendedor(emprendedorId)
      .pipe(
        map(servicios => servicios.map(servicio => this.transformarServicioLista(servicio))),
        catchError(error => {
          console.error('Error obteniendo servicios por emprendedor:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene servicios por ubicación
   */
  getServiciosPorUbicacion(latitud: number, longitud: number, distancia: number = 10): Observable<ServicioListItem[]> {
    return this.turismoService.getServiciosByUbicacion(latitud, longitud, distancia)
      .pipe(
        map(servicios => servicios.map(servicio => this.transformarServicioLista(servicio))),
        catchError(error => {
          console.error('Error obteniendo servicios por ubicación:', error);
          return of([]);
        })
      );
  }

  /**
   * Verifica la disponibilidad de un servicio
   */
  verificarDisponibilidad(servicioId: number, fecha: string, horaInicio: string, horaFin: string): Observable<boolean> {
    return this.turismoService.verificarDisponibilidadServicio(servicioId, fecha, horaInicio, horaFin)
      .pipe(
        map(response => response.disponible),
        catchError(error => {
          console.error('Error verificando disponibilidad:', error);
          return of(false);
        })
      );
  }

  /**
   * Busca servicios por texto
   */
  buscarServicios(query: string, filtros: ServicioFiltros = {}): Observable<ServicioListItem[]> {
    const filtrosConBusqueda = { ...filtros, busqueda: query };
    
    return this.getServicios(filtrosConBusqueda, 1, 50)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene categorías disponibles
   */
  getCategorias(): Observable<Array<{id: number, nombre: string, descripcion?: string, icono_url?: string}>> {
    return this.turismoService.getCategorias()
      .pipe(
        map(categorias => categorias.map(cat => ({
          id: cat.id || 0,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          icono_url: cat.icono_url
        }))),
        catchError(error => {
          console.error('Error obteniendo categorías:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene lista de emprendedores únicos
   */
  getEmprendedores(): Observable<Array<{id: number, nombre: string, tipo_servicio: string, categoria: string}>> {
    return this.turismoService.getEmprendedores(1, 100)
      .pipe(
        map(response => response.data.map(emp => ({
          id: emp.id || 0,
          nombre: emp.nombre,
          tipo_servicio: emp.tipo_servicio,
          categoria: emp.categoria
        }))),
        catchError(error => {
          console.error('Error obteniendo emprendedores:', error);
          return of([]);
        })
      );
  }

  // Métodos privados para transformación de datos

  private prepararFiltros(filtros: ServicioFiltros): any {
    const filtrosAPI: any = {};

    if (filtros.categoria) {
      filtrosAPI.categoria_id = filtros.categoria;
    }

    if (filtros.emprendedor) {
      filtrosAPI.emprendedor_id = filtros.emprendedor;
    }

    if (filtros.precio_min) {
      filtrosAPI.precio_min = filtros.precio_min;
    }

    if (filtros.precio_max) {
      filtrosAPI.precio_max = filtros.precio_max;
    }

    if (filtros.busqueda) {
      filtrosAPI.search = filtros.busqueda;
    }

    if (filtros.estado !== undefined) {
      filtrosAPI.estado = filtros.estado;
    }

    return filtrosAPI;
  }

  private transformarServicioLista(servicio: Servicio): ServicioListItem {
    return {
      id: servicio.id || 0,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio_referencial: servicio.precio_referencial ? parseFloat(servicio.precio_referencial.toString()) : undefined,
      emprendedor_id: servicio.emprendedor_id,
      estado: servicio.estado,
      capacidad: servicio.capacidad,
      latitud: servicio.latitud ? parseFloat(servicio.latitud.toString()) : undefined,
      longitud: servicio.longitud ? parseFloat(servicio.longitud.toString()) : undefined,
      ubicacion_referencia: servicio.ubicacion_referencia,
      imagen_principal: this.extraerImagenPrincipal(servicio.sliders),
      emprendedor: servicio.emprendedor ? {
        id: servicio.emprendedor.id || 0,
        nombre: servicio.emprendedor.nombre,
        tipo_servicio: servicio.emprendedor.tipo_servicio,
        categoria: servicio.emprendedor.categoria
      } : undefined,
      categorias: servicio.categorias?.map((cat) => ({
        id: cat.id || 0,
        nombre: cat.nombre,
        icono_url: cat.icono_url
      })),
      horarios_resumen: this.extraerHorariosResumen(servicio.horarios)
    };
  }

  private transformarServicioCompleto(servicio: Servicio): ServicioCompleto {
    const servicioBase = this.transformarServicioLista(servicio);
    
    return {
      ...servicioBase,
      horarios: servicio.horarios?.map((horario) => ({
        id: horario.id || 0,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        activo: horario.activo || false
      })),
      sliders: servicio.sliders?.map((slider) => ({
        id: slider.id || 0,
        url: slider.url || '',
        url_completa: slider.url_completa || '',
        nombre: slider.nombre,
        orden: slider.orden
      })),
      emprendedor_completo: servicio.emprendedor ? {
        id: servicio.emprendedor.id || 0,
        nombre: servicio.emprendedor.nombre,
        tipo_servicio: servicio.emprendedor.tipo_servicio,
        descripcion: servicio.emprendedor.descripcion,
        ubicacion: servicio.emprendedor.ubicacion,
        telefono: servicio.emprendedor.telefono,
        email: servicio.emprendedor.email,
        precio_rango: servicio.emprendedor.precio_rango,
        categoria: servicio.emprendedor.categoria,
        horario_atencion: servicio.emprendedor.horario_atencion,
        metodos_pago: servicio.emprendedor.metodos_pago
      } : undefined
    };
  }

  private extraerImagenPrincipal(sliders?: any[]): string {
    if (sliders && sliders.length > 0) {
      const imagenPrincipal = sliders.find(slider => slider.es_principal) || sliders[0];
      return imagenPrincipal.url_completa || '/assets/general/placeholder-service.jpg';
    }
    return '/assets/general/placeholder-service.jpg';
  }

  private extraerHorariosResumen(horarios?: any[]): string[] {
    if (!horarios || horarios.length === 0) return [];

    const diasActivos = horarios
      .filter(horario => horario.activo)
      .map(horario => this.formatearDiaCorto(horario.dia_semana));

    return [...new Set(diasActivos)];
  }

  private formatearDiaCorto(dia: string): string {
    const dias: {[key: string]: string} = {
      'lunes': 'Lun',
      'martes': 'Mar',
      'miercoles': 'Mié',
      'jueves': 'Jue',
      'viernes': 'Vie',
      'sabado': 'Sáb',
      'domingo': 'Dom'
    };
    return dias[dia.toLowerCase()] || dia;
  }

  /**
   * Métodos utilitarios públicos
   */

  public formatearPrecio(precio: number): string {
    return `S/. ${precio.toFixed(2)}`;
  }

  public formatearCapacidad(capacidad: string | number): string {
    if (typeof capacidad === 'number') {
      return `${capacidad} personas`;
    }
    return capacidad.toString();
  }

  public validarHorario(horaInicio: string, horaFin: string): boolean {
    const inicio = new Date(`1970-01-01T${horaInicio}`);
    const fin = new Date(`1970-01-01T${horaFin}`);
    return fin > inicio;
  }

  public calcularDuracion(horaInicio: string, horaFin: string): number {
    const inicio = new Date(`1970-01-01T${horaInicio}`);
    const fin = new Date(`1970-01-01T${horaFin}`);
    return (fin.getTime() - inicio.getTime()) / (1000 * 60); // minutos
  }
}