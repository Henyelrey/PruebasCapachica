import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../models/api.model';
import {
  Reserva,
  ReservaServicio,
  Plan,
  Inscripcion,
  EstadisticasPlan,
  ResumenPlanes,
  DashboardEmprendimiento,
  CalendarioEmprendimiento,
  UpdateReservaRequest,
  UpdateEstadoServicioRequest,
  AgregarEmprendedorPlanRequest,
  CambiarOrganizadorRequest,
  PaginatedResponse,
  MetaPlanResponse,
  MetaEmprendedorResponse,
  EmprendedorPlan,
  EmprendedorInfo,
  Emprendimiento,
  Servicio,
  AdminRequest,
  ServicioPopular
} from '../models/emprendimiento-admin.model';

@Injectable({
  providedIn: 'root'
})
export class EmprendimientoAdminService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  constructor() { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ==================== GESTIÓN DE EMPRENDIMIENTOS ====================
  
  /**
   * Obtener todos los emprendimientos donde el usuario es administrador
   */
  getMisEmprendimientos(): Observable<Emprendimiento[]> {
    return this.http.get<ApiResponse<Emprendimiento[]>>(`${this.API_URL}/mis-emprendimientos`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener detalle completo de un emprendimiento específico
   */
  getEmprendimiento(id: number): Observable<Emprendimiento> {
    return this.http.get<ApiResponse<Emprendimiento>>(`${this.API_URL}/mis-emprendimientos/${id}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Actualizar información del emprendimiento
   */
  updateEmprendimiento(id: number, data: any): Observable<Emprendimiento> {
    const formData = this.prepareFormData(data);
    formData.append('_method', 'PUT');
    
    return this.http.post<ApiResponse<Emprendimiento>>(`${this.API_URL}/emprendedores/${id}`, formData)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener dashboard con estadísticas del emprendimiento
   */
  getDashboard(emprendimientoId: number): Observable<DashboardEmprendimiento> {
    return this.http.get<ApiResponse<DashboardEmprendimiento>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/dashboard`
    ).pipe(map(response => response.data!));
  }

  /**
   * Obtener calendario de eventos del emprendimiento
   */
  getCalendario(emprendimientoId: number, fechaInicio?: string, fechaFin?: string): Observable<CalendarioEmprendimiento> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);

    return this.http.get<ApiResponse<CalendarioEmprendimiento>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/calendario`,
      { params }
    ).pipe(map(response => response.data!));
  }

  // ==================== GESTIÓN DE ADMINISTRADORES ====================

  /**
   * Agregar un administrador al emprendimiento
   */
  addAdministrador(emprendimientoId: number, data: AdminRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/administradores`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }

  /**
   * Eliminar un administrador del emprendimiento
   */
  removeAdministrador(emprendimientoId: number, userId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/administradores/${userId}`
    );
  }

    // ==================== GESTIÓN DE SERVICIOS ====================

  /**
   * Obtener todos los servicios de un emprendimiento
   */
  getServicios(emprendimientoId: number): Observable<Servicio[]> {
    return this.http.get<ApiResponse<Servicio[]>>(
      `${this.API_URL}/emprendedores/${emprendimientoId}/servicios`
    ).pipe(map(response => response.data || []));
  }

  /**
   * Obtener un servicio específico
   */
  getServicio(id: number): Observable<Servicio> {
    return this.http.get<ApiResponse<Servicio>>(`${this.API_URL}/servicios/${id}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Crear un nuevo servicio
   */
  createServicio(data: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(data);
    return this.http.post<ApiResponse<Servicio>>(`${this.API_URL}/servicios`, formData)
      .pipe(map(response => response.data!));
  }

  /**
   * Actualizar un servicio
   */
  updateServicio(id: number, data: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(data);
    formData.append('_method', 'PUT');
    
    return this.http.post<ApiResponse<Servicio>>(`${this.API_URL}/servicios/${id}`, formData)
      .pipe(map(response => response.data!));
  }

  /**
   * Eliminar un servicio
   */
  deleteServicio(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/servicios/${id}`);
  }

  /**
   * Verificar disponibilidad de un servicio
   */
  checkDisponibilidad(params: {
    servicio_id: number;
    fecha_inicio: string;
    fecha_fin?: string;
    hora_inicio?: string;
    hora_fin?: string;
  }): Observable<{ disponible: boolean }> {
    return this.http.get<ApiResponse<{ disponible: boolean }>>(
      `${this.API_URL}/reserva-servicios/verificar-disponibilidad`,
      { params: params as any }
    ).pipe(map(response => response.data!));
  }

  // ==================== GESTIÓN DE RESERVAS ====================

  /**
   * Obtener todas las reservas de un emprendimiento con paginación
   */
  getReservasEmprendimiento(emprendimientoId: number, page: number = 1): Observable<PaginatedResponse<Reserva>> {
    const params = new HttpParams().set('page', page.toString());
    
    return this.http.get<ApiResponse<PaginatedResponse<Reserva>>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/reservas`,
      { params }
    ).pipe(map(response => response.data!));
  }

  /**
   * Obtener reservas por emprendedor
   */
  getReservasPorEmprendedor(emprendedorId: number): Observable<Reserva[]> {
    return this.http.get<ApiResponse<Reserva[]>>(
      `${this.API_URL}/reservas/emprendedor/${emprendedorId}`
    ).pipe(map(response => response.data || []));
  }

  /**
   * Obtener reservas por servicio
   */
  getReservasPorServicio(servicioId: number): Observable<Reserva[]> {
    return this.http.get<ApiResponse<Reserva[]>>(
      `${this.API_URL}/reservas/servicio/${servicioId}`
    ).pipe(map(response => response.data || []));
  }

  /**
   * Actualizar una reserva completa
   */
  updateReserva(reservaId: number, data: UpdateReservaRequest): Observable<Reserva> {
    return this.http.put<ApiResponse<Reserva>>(
      `${this.API_URL}/reservas/${reservaId}`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data!));
  }

  /**
   * Obtener servicios de una reserva específica
   */
  getServiciosReserva(reservaId: number): Observable<ReservaServicio[]> {
    return this.http.get<ApiResponse<ReservaServicio[]>>(
      `${this.API_URL}/reserva-servicios/reserva/${reservaId}`
    ).pipe(map(response => response.data || []));
  }

  /**
   * Actualizar estado de un servicio en la reserva
   */
  updateEstadoServicioReserva(servicioReservaId: number, data: UpdateEstadoServicioRequest): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.API_URL}/reserva-servicios/${servicioReservaId}/estado`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }

  /**
   * Obtener calendario de reservas
   */
  getCalendarioReservas(params?: {
    emprendedor_id?: number;
    servicio_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.API_URL}/reserva-servicios/calendario`,
      { params: params as any }
    ).pipe(map(response => response.data));
  }

  // ==================== GESTIÓN DE PLANES ====================

  /**
   * Obtener todos los planes donde participa un emprendedor
   */
  getPlanesPorEmprendedor(
    emprendedorId: number,
    params?: {
      solo_activos?: boolean;
      tipo_rol?: 'organizador' | 'colaborador';
      page?: number;
    }
  ): Observable<{ data: Plan[], meta: MetaEmprendedorResponse }> {
    let httpParams = new HttpParams();
    if (params?.solo_activos !== undefined) {
      httpParams = httpParams.set('solo_activos', params.solo_activos.toString());
    }
    if (params?.tipo_rol) {
      httpParams = httpParams.set('tipo_rol', params.tipo_rol);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<ApiResponse<Plan[]>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes`,
      { params: httpParams }
    ).pipe(
      map(response => ({
        data: response.data || [],
        meta: (response as any).meta
      }))
    );
  }

  /**
   * Obtener un plan específico donde participa el emprendedor
   */
  getPlanEmprendedor(emprendedorId: number, planId: number): Observable<Plan> {
    return this.http.get<ApiResponse<Plan>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}`
    ).pipe(map(response => response.data!));
  }

  /**
   * Obtener inscripciones de un plan
   */
  getInscripcionesPlan(
    emprendedorId: number,
    planId: number,
    params?: {
      estado?: 'pendiente' | 'confirmado' | 'cancelado';
      fecha_desde?: string;
      fecha_hasta?: string;
    }
  ): Observable<{ data: Inscripcion[], meta: MetaPlanResponse }> {
    let httpParams = new HttpParams();
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.fecha_desde) httpParams = httpParams.set('fecha_desde', params.fecha_desde);
    if (params?.fecha_hasta) httpParams = httpParams.set('fecha_hasta', params.fecha_hasta);

    return this.http.get<ApiResponse<Inscripcion[]>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones`,
      { params: httpParams }
    ).pipe(
      map(response => ({
        data: response.data || [],
        meta: (response as any).meta
      }))
    );
  }

  /**
   * Obtener estadísticas de un plan
   */
  getEstadisticasPlan(emprendedorId: number, planId: number): Observable<EstadisticasPlan> {
    return this.http.get<ApiResponse<EstadisticasPlan>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/estadisticas`
    ).pipe(map(response => response.data!));
  }

  /**
   * Confirmar una inscripción (solo organizadores)
   */
  confirmarInscripcion(emprendedorId: number, planId: number, inscripcionId: number): Observable<Inscripcion> {
    return this.http.patch<ApiResponse<Inscripcion>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones/${inscripcionId}/confirmar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data!));
  }

  /**
   * Cancelar una inscripción (solo organizadores)
   */
  cancelarInscripcion(emprendedorId: number, planId: number, inscripcionId: number): Observable<Inscripcion> {
    return this.http.patch<ApiResponse<Inscripcion>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones/${inscripcionId}/cancelar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data!));
  }

  /**
   * Obtener resumen de todos los planes del emprendedor
   */
  getResumenPlanes(emprendedorId: number): Observable<ResumenPlanes> {
    return this.http.get<ApiResponse<ResumenPlanes>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes-resumen`
    ).pipe(map(response => response.data!));
  }

  // ==================== GESTIÓN DE EMPRENDEDORES EN PLANES ====================

  /**
   * Obtener todos los emprendedores de un plan
   */
  getEmprendedoresPlan(planId: number): Observable<{
    data: EmprendedorPlan[],
    meta: {
      plan: { id: number; nombre: string };
      total_emprendedores: number;
      organizadores: number;
      colaboradores: number;
    }
  }> {
    return this.http.get<ApiResponse<EmprendedorPlan[]>>(
      `${this.API_URL}/planes/${planId}/emprendedores`
    ).pipe(
      map(response => ({
        data: response.data || [],
        meta: (response as any).meta
      }))
    );
  }

  /**
   * Agregar un emprendedor al plan
   */
  agregarEmprendedorPlan(planId: number, data: AgregarEmprendedorPlanRequest): Observable<EmprendedorPlan> {
    return this.http.post<ApiResponse<EmprendedorPlan>>(
      `${this.API_URL}/planes/${planId}/emprendedores`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data!));
  }

  /**
   * Actualizar la participación de un emprendedor en el plan
   */
  updateEmprendedorPlan(
    planId: number,
    emprendedorId: number,
    data: Partial<AgregarEmprendedorPlanRequest>
  ): Observable<EmprendedorPlan> {
    return this.http.put<ApiResponse<EmprendedorPlan>>(
      `${this.API_URL}/planes/${planId}/emprendedores/${emprendedorId}`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data!));
  }

  /**
   * Remover un emprendedor del plan
   */
  removeEmprendedorPlan(planId: number, emprendedorId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_URL}/planes/${planId}/emprendedores/${emprendedorId}`
    );
  }

  /**
   * Cambiar el organizador principal del plan
   */
  cambiarOrganizadorPrincipal(planId: number, data: CambiarOrganizadorRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/planes/${planId}/emprendedores/cambiar-organizador`,
      data,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }

  /**
   * Obtener emprendedores disponibles para agregar al plan
   */
  getEmprendedoresDisponibles(planId: number): Observable<EmprendedorInfo[]> {
    return this.http.get<ApiResponse<EmprendedorInfo[]>>(
      `${this.API_URL}/planes/${planId}/emprendedores/disponibles`
    ).pipe(map(response => response.data || []));
  }

  // ==================== UTILIDADES ====================

  /**
   * Preparar FormData para envío de archivos
   */
  private prepareFormData(data: any): FormData {
    const formData = new FormData();
    
    // Procesar campos básicos
    Object.keys(data).forEach(key => {
      if (key !== 'sliders_principales' && key !== 'sliders_secundarios' && 
          key !== 'sliders' && key !== 'deleted_sliders' && 
          key !== 'administradores' && key !== 'servicios' && 
          key !== 'horarios' && key !== 'categorias') {
        
        if (data[key] !== null && data[key] !== undefined) {
          // Si es un array, convertirlo a JSON
          if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        }
      }
    });
    
    // Procesar sliders principales
    if (data.sliders_principales && Array.isArray(data.sliders_principales)) {
      data.sliders_principales.forEach((slider: any, index: number) => {
        if (slider.id) formData.append(`sliders_principales[${index}][id]`, slider.id);
        formData.append(`sliders_principales[${index}][nombre]`, slider.nombre);
        formData.append(`sliders_principales[${index}][orden]`, slider.orden);
        formData.append(`sliders_principales[${index}][es_principal]`, 'true');
        
        if (slider.imagen instanceof File) {
          formData.append(`sliders_principales[${index}][imagen]`, slider.imagen);
        }
      });
    }
    
    // Procesar sliders secundarios
    if (data.sliders_secundarios && Array.isArray(data.sliders_secundarios)) {
      data.sliders_secundarios.forEach((slider: any, index: number) => {
        if (slider.id) formData.append(`sliders_secundarios[${index}][id]`, slider.id);
        formData.append(`sliders_secundarios[${index}][nombre]`, slider.nombre);
        formData.append(`sliders_secundarios[${index}][orden]`, slider.orden);
        formData.append(`sliders_secundarios[${index}][es_principal]`, 'false');
        formData.append(`sliders_secundarios[${index}][titulo]`, slider.titulo || '');
        formData.append(`sliders_secundarios[${index}][descripcion]`, slider.descripcion || '');
        
        if (slider.imagen instanceof File) {
          formData.append(`sliders_secundarios[${index}][imagen]`, slider.imagen);
        }
      });
    }
    
    // Procesar sliders generales
    if (data.sliders && Array.isArray(data.sliders)) {
      data.sliders.forEach((slider: any, index: number) => {
        if (slider.id) formData.append(`sliders[${index}][id]`, slider.id);
        formData.append(`sliders[${index}][nombre]`, slider.nombre);
        formData.append(`sliders[${index}][orden]`, slider.orden);
        if (slider.es_principal !== undefined) {
          formData.append(`sliders[${index}][es_principal]`, slider.es_principal ? 'true' : 'false');
        }
        if (slider.titulo !== undefined) {
          formData.append(`sliders[${index}][titulo]`, slider.titulo || '');
        }
        if (slider.descripcion !== undefined) {
          formData.append(`sliders[${index}][descripcion]`, slider.descripcion || '');
        }
        
        if (slider.imagen instanceof File) {
          formData.append(`sliders[${index}][imagen]`, slider.imagen);
        }
      });
    }
    
    // Procesar horarios
    if (data.horarios && Array.isArray(data.horarios)) {
      data.horarios.forEach((horario: any, index: number) => {
        if (horario.id) formData.append(`horarios[${index}][id]`, horario.id);
        formData.append(`horarios[${index}][dia_semana]`, horario.dia_semana);
        formData.append(`horarios[${index}][hora_inicio]`, horario.hora_inicio);
        formData.append(`horarios[${index}][hora_fin]`, horario.hora_fin);
        if (horario.activo !== undefined) {
          formData.append(`horarios[${index}][activo]`, horario.activo ? 'true' : 'false');
        }
      });
    }
    
    // Procesar categorías
    // Procesar categorías
    if (data.categorias && Array.isArray(data.categorias)) {
      data.categorias.forEach((categoria: any) => {
        const id = typeof categoria === 'object' ? categoria.id : categoria;
        if (id !== undefined && id !== null) {
          formData.append('categorias[]', String(id));
        }
      });
    }

    
    // Procesar ids de sliders eliminados
    if (data.deleted_sliders && Array.isArray(data.deleted_sliders)) {
      data.deleted_sliders.forEach((id: number) => {
        formData.append('deleted_sliders[]', id.toString());
      });
    }
    
    return formData;
  }

  // ==================== MÉTODOS DE UTILIDAD PARA FILTROS Y BÚSQUEDAS ====================

  /**
   * Filtrar reservas por múltiples criterios
   */
  filterReservas(emprendimientoId: number, filters: {
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    servicio_id?: number;
    usuario_id?: number;
    page?: number;
  }): Observable<PaginatedResponse<Reserva>> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] !== undefined) {
        params = params.set(key, filters[key as keyof typeof filters]!.toString());
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<Reserva>>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/reservas`,
      { params }
    ).pipe(map(response => response.data!));
  }

  /**
   * Buscar planes por criterios
   */
  searchPlanes(emprendedorId: number, searchTerm: string): Observable<Plan[]> {
    const params = new HttpParams().set('q', searchTerm);
    
    return this.http.get<ApiResponse<Plan[]>>(
      `${this.API_URL}/emprendedores/${emprendedorId}/planes`,
      { params }
    ).pipe(map(response => response.data || []));
  }

  /**
   * Obtener estadísticas consolidadas del emprendimiento
   */
  getEstadisticasConsolidadas(emprendimientoId: number, periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  }): Observable<{
    reservas: {
      total: number;
      confirmadas: number;
      pendientes: number;
      canceladas: number;
      ingresos_totales: number;
    };
    planes: {
      total_activos: number;
      inscripciones_totales: number;
      ingresos_estimados: number;
    };
    servicios: {
      mas_solicitados: ServicioPopular[];
      ocupacion_promedio: number;
    };
  }> {
    const params = new HttpParams()
      .set('fecha_inicio', periodo.fecha_inicio)
      .set('fecha_fin', periodo.fecha_fin);

    return this.http.get<ApiResponse<any>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/estadisticas`,
      { params }
    ).pipe(map(response => response.data!));
  }

  /**
   * Exportar datos de reservas a CSV
   */
  exportReservasCSV(emprendimientoId: number, filters?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/reservas/export`,
      { params, responseType: 'blob' }
    );
  }

  /**
   * Obtener notificaciones pendientes del emprendimiento
   */
  getNotificaciones(emprendimientoId: number): Observable<{
    reservas_nuevas: number;
    inscripciones_pendientes: number;
    servicios_proximos: number;
    alertas: Array<{
      tipo: string;
      mensaje: string;
      fecha: string;
    }>;
  }> {
    return this.http.get<ApiResponse<any>>(
      `${this.API_URL}/mis-emprendimientos/${emprendimientoId}/notificaciones`
    ).pipe(map(response => response.data!));
  }

  /**
   * Método helper para manejar errores de forma consistente
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en EmprendimientoAdminService:', error);
    throw error;
  }
}
   