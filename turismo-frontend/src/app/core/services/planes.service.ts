import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { 
  Plan, 
  PlanInscripcion, 
  PlanFiltros, 
  PlanEstadisticas, 
  EstadisticasGenerales,
  InscripcionFiltros,
  PlanFormData,
  PlanEmprendedor,
  EmprendedorDisponible,
  PlanEmprendedorRequest,
  EmprendedorPlanesResponse,
  EmprendedorEstadisticasPlanes
} from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  constructor() { }

  // ========================
  // GESTIÓN DE PLANES
  // ========================

  /**
   * Obtener todos los planes con filtros opcionales
   */
  getPlanes(filtros: PlanFiltros = {}): Observable<PaginatedResponse<Plan>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<Plan>>>(`${this.API_URL}/planes`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener un plan específico por ID
   */
  getPlan(id: number): Observable<Plan> {
    return this.http.get<ApiResponse<Plan>>(`${this.API_URL}/planes/${id}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Crear un nuevo plan
   */
  createPlan(data: PlanFormData): Observable<Plan> {
    const formData = this.prepareFormData(data);
    return this.http.post<ApiResponse<Plan>>(`${this.API_URL}/planes`, formData)
      .pipe(map(response => response.data!));
  }

  /**
   * Actualizar un plan existente
   */
  updatePlan(id: number, data: PlanFormData): Observable<Plan> {
    const formData = this.prepareFormData(data);
    formData.append('_method', 'PUT');
    
    return this.http.post<ApiResponse<Plan>>(`${this.API_URL}/planes/${id}`, formData)
      .pipe(map(response => response.data!));
  }

  /**
   * Eliminar un plan
   */
  deletePlan(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/planes/${id}`);
  }

  /**
   * Cambiar estado de un plan
   */
  cambiarEstadoPlan(id: number, estado: string): Observable<Plan> {
    return this.http.patch<ApiResponse<Plan>>(`${this.API_URL}/planes/${id}/estado`, { estado })
      .pipe(map(response => response.data!));
  }

  /**
   * Buscar planes
   */
  buscarPlanes(termino: string, filtros: Partial<PlanFiltros> = {}): Observable<Plan[]> {
    let params = new HttpParams().set('q', termino);
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Plan[]>>(`${this.API_URL}/planes/search`, { params })
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener estadísticas de un plan específico
   */
  getEstadisticasPlan(id: number): Observable<PlanEstadisticas> {
    return this.http.get<ApiResponse<PlanEstadisticas>>(`${this.API_URL}/planes/${id}/estadisticas`)
      .pipe(map(response => response.data!));
  }

  // ========================
  // NUEVOS MÉTODOS: GESTIÓN DE EMPRENDEDORES EN PLANES
  // ========================

  /**
   * Obtener emprendedores de un plan
   */
  getEmprendedoresPlan(planId: number): Observable<{ data: PlanEmprendedor[], meta: any }> {
    return this.http.get<{
      success: boolean;
      data: PlanEmprendedor[];
      meta: any;
    }>(`${this.API_URL}/planes/${planId}/emprendedores`)
      .pipe(
        map(response => ({
          data: response.data,
          meta: response.meta
        }))
      );
  }

  /**
   * Agregar emprendedor a un plan
   */
  agregarEmprendedorAPlan(planId: number, data: PlanEmprendedorRequest): Observable<PlanEmprendedor> {
    return this.http.post<ApiResponse<PlanEmprendedor>>(`${this.API_URL}/planes/${planId}/emprendedores`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Actualizar emprendedor en un plan
   */
  actualizarEmprendedorEnPlan(planId: number, emprendedorId: number, data: Partial<PlanEmprendedorRequest>): Observable<PlanEmprendedor> {
    return this.http.put<ApiResponse<PlanEmprendedor>>(`${this.API_URL}/planes/${planId}/emprendedores/${emprendedorId}`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Remover emprendedor de un plan
   */
  removerEmprendedorDePlan(planId: number, emprendedorId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/planes/${planId}/emprendedores/${emprendedorId}`);
  }

  /**
   * Cambiar organizador principal de un plan
   */
  cambiarOrganizadorPrincipal(planId: number, nuevoOrganizadorId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/planes/${planId}/emprendedores/cambiar-organizador`, {
      nuevo_organizador_id: nuevoOrganizadorId
    }).pipe(map(response => response.data!));
  }

  /**
   * Obtener emprendedores disponibles para agregar a un plan
   */
  getEmprendedoresDisponibles(planId: number): Observable<{ data: EmprendedorDisponible[], meta: any }> {
    return this.http.get<ApiResponse<{ data: EmprendedorDisponible[], meta: any }>>(`${this.API_URL}/planes/${planId}/emprendedores/disponibles`)
      .pipe(map(response => response.data!));
  }

  // ========================
  // MÉTODOS PARA EMPRENDEDORES
  // ========================

  /**
   * Obtener planes de un emprendedor específico
   */
  getPlanesEmprendedor(emprendedorId: number, tipoRol?: string, soloActivos: boolean = false): Observable<EmprendedorPlanesResponse> {
    let params = new HttpParams();
    
    if (tipoRol) {
      params = params.set('tipo_rol', tipoRol);
    }
    
    if (soloActivos) {
      params = params.set('solo_activos', 'true');
    }

    return this.http.get<ApiResponse<EmprendedorPlanesResponse>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener plan específico de un emprendedor
   */
  getPlanEmprendedor(emprendedorId: number, planId: number): Observable<Plan> {
    return this.http.get<ApiResponse<Plan>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener resumen de planes de un emprendedor
   */
  getResumenPlanesEmprendedor(emprendedorId: number): Observable<EmprendedorEstadisticasPlanes> {
    return this.http.get<ApiResponse<EmprendedorEstadisticasPlanes>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes-resumen`)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener inscripciones de un plan desde emprendedor
   */
  getInscripcionesPlanEmprendedor(emprendedorId: number, planId: number, filtros: any = {}): Observable<{ data: PlanInscripcion[], meta: any }> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<{ data: PlanInscripcion[], meta: any }>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Confirmar inscripción desde emprendedor
   */
  confirmarInscripcionEmprendedor(emprendedorId: number, planId: number, inscripcionId: number, data: any = {}): Observable<PlanInscripcion> {
    return this.http.patch<ApiResponse<PlanInscripcion>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones/${inscripcionId}/confirmar`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Cancelar inscripción desde emprendedor
   */
  cancelarInscripcionEmprendedor(emprendedorId: number, planId: number, inscripcionId: number, data: any = {}): Observable<PlanInscripcion> {
    return this.http.patch<ApiResponse<PlanInscripcion>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/inscripciones/${inscripcionId}/cancelar`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener estadísticas de plan desde emprendedor
   */
  getEstadisticasPlanEmprendedor(emprendedorId: number, planId: number): Observable<PlanEstadisticas> {
    return this.http.get<ApiResponse<PlanEstadisticas>>(`${this.API_URL}/emprendedores/${emprendedorId}/planes/${planId}/estadisticas`)
      .pipe(map(response => response.data!));
  }

  // ========================
  // ADMINISTRACIÓN GENERAL (ACTUALIZADOS)
  // ========================

  /**
   * Obtener todos los planes (para administradores)
   */
  getAllPlanesAdmin(filtros: PlanFiltros = {}): Observable<PaginatedResponse<Plan>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<Plan>>>(`${this.API_URL}/admin/planes/todos`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener estadísticas generales del sistema (ACTUALIZADO)
   */
  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.http.get<ApiResponse<EstadisticasGenerales>>(`${this.API_URL}/admin/planes/estadisticas-generales`)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener todas las inscripciones (para administradores)
   */
  getAllInscripciones(filtros: InscripcionFiltros = {}): Observable<PaginatedResponse<PlanInscripcion>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<PlanInscripcion>>>(`${this.API_URL}/admin/planes/inscripciones/todas`, { params })
      .pipe(map(response => response.data!));
  }

  // ========================
  // GESTIÓN DE INSCRIPCIONES (SIN CAMBIOS)
  // ========================

  /**
   * Obtener mis inscripciones
   */
  getMisInscripciones(page: number = 1, estado?: string): Observable<PaginatedResponse<PlanInscripcion>> {
    let params = new HttpParams().set('page', page.toString());
    
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ApiResponse<PaginatedResponse<PlanInscripcion>>>(`${this.API_URL}/inscripciones/mis-inscripciones`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener próximas inscripciones
   */
  getProximasInscripciones(dias: number = 30): Observable<PlanInscripcion[]> {
    const params = new HttpParams().set('dias', dias.toString());
    
    return this.http.get<ApiResponse<PlanInscripcion[]>>(`${this.API_URL}/inscripciones/proximas`, { params })
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener inscripciones en progreso
   */
  getInscripcionesEnProgreso(): Observable<PlanInscripcion[]> {
    return this.http.get<ApiResponse<PlanInscripcion[]>>(`${this.API_URL}/inscripciones/en-progreso`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Inscribirse a un plan
   */
  inscribirseAPlan(data: {
    plan_id: number;
    numero_participantes: number;
    notas_usuario?: string;
    requerimientos_especiales?: string;
    metodo_pago?: string;
    comentarios_adicionales?: string;
  }): Observable<PlanInscripcion> {
    return this.http.post<ApiResponse<PlanInscripcion>>(`${this.API_URL}/inscripciones`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener una inscripción específica
   */
  getInscripcion(id: number): Observable<PlanInscripcion> {
    return this.http.get<ApiResponse<PlanInscripcion>>(`${this.API_URL}/inscripciones/${id}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Actualizar una inscripción
   */
  updateInscripcion(id: number, data: Partial<PlanInscripcion>): Observable<PlanInscripcion> {
    return this.http.put<ApiResponse<PlanInscripcion>>(`${this.API_URL}/inscripciones/${id}`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Cancelar una inscripción
   */
  cancelarInscripcion(id: number, motivo?: string): Observable<PlanInscripcion> {
    const data = motivo ? { motivo_cancelacion: motivo } : {};
    return this.http.patch<ApiResponse<PlanInscripcion>>(`${this.API_URL}/inscripciones/${id}/cancelar`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Marcar inscripción como completada
   */
  marcarCompletada(id: number, comentarios?: string): Observable<PlanInscripcion> {
    const data = comentarios ? { comentarios_finales: comentarios } : {};
    return this.http.patch<ApiResponse<PlanInscripcion>>(`${this.API_URL}/inscripciones/${id}/completar`, data)
      .pipe(map(response => response.data!));
  }

  /**
   * Eliminar una inscripción
   */
  deleteInscripcion(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/inscripciones/${id}`);
  }

  // ========================
  // MÉTODOS AUXILIARES (ACTUALIZADOS)
  // ========================

  /**
   * Obtener emprendedores para selección en formularios
   */
  getEmprendedoresParaPlanes(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/emprendedores`)
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener servicios de un emprendedor para selección
   */
  getServiciosEmprendedor(emprendedorId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/emprendedores/${emprendedorId}/servicios`)
      .pipe(map(response => response.data || []));
  }
  /**
   * Obtener planes públicos (para usuarios no autenticados)
   */
  getPlanesPublicos(filtros: PlanFiltros = {}): Observable<PaginatedResponse<Plan>> {
    let params = new HttpParams();
    
    // Forzar solo planes públicos
    filtros.es_publico = true;
    filtros.estado = 'activo';
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<PaginatedResponse<Plan>>>(`${this.API_URL}/planes/publicos`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Obtener plan público por ID (sin autenticación)
   */
  getPlanPublico(id: number): Observable<Plan> {
    return this.http.get<ApiResponse<Plan>>(`${this.API_URL}/planes/${id}`)
      .pipe(map(response => response.data!));
  }

  /**
   * Buscar planes públicos
   */
  buscarPlanesPublicos(termino: string, filtros: Partial<PlanFiltros> = {}): Observable<Plan[]> {
    let params = new HttpParams().set('q', termino);
    
    // Forzar solo planes públicos
    filtros.es_publico = true;
    filtros.estado = 'activo';
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Plan[]>>(`${this.API_URL}/planes/publicos/search`, { params })
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener planes destacados (para homepage)
   */
  getPlanesDestacados(limite: number = 6): Observable<Plan[]> {
    const params = new HttpParams().set('limite', limite.toString());
    
    return this.http.get<ApiResponse<Plan[]>>(`${this.API_URL}/planes/destacados`, { params })
      .pipe(map(response => response.data || []));
  }

  /**
   * Obtener filtros disponibles para planes públicos
   */
  getFiltrosDisponibles(): Observable<{
    dificultades: string[];
    duraciones: { min: number; max: number };
    precios: { min: number; max: number };
    organizadores: { id: number; nombre: string }[];
  }> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/planes/filtros-disponibles`)
      .pipe(map(response => response.data!));
  }

  /**
   * Verificar disponibilidad de cupos sin autenticación
   */
  verificarDisponibilidadCupos(planId: number, numeroParticipantes: number = 1): Observable<{
    disponible: boolean;
    cuposDisponibles: number;
    mensaje?: string;
  }> {
    const params = new HttpParams()
      .set('plan_id', planId.toString())
      .set('numero_participantes', numeroParticipantes.toString());
    
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/planes/verificar-cupos`, { params })
      .pipe(map(response => response.data!));
  }
  /**
   * Preparar FormData para envío de archivos (ACTUALIZADO)
   */
  private prepareFormData(data: PlanFormData): FormData {
    const formData = new FormData();
    
    // Campos básicos
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('capacidad', data.capacidad.toString());
    formData.append('duracion_dias', data.duracion_dias.toString());
    formData.append('es_publico', data.es_publico ? '1' : '0');
    formData.append('estado', data.estado);
    formData.append('dificultad', data.dificultad);
    
    // Campos opcionales
    if (data.que_incluye) formData.append('que_incluye', data.que_incluye);
    if (data.emprendedor_id) formData.append('emprendedor_id', data.emprendedor_id.toString()); // Legacy
    if (data.precio_total) formData.append('precio_total', data.precio_total.toString());
    if (data.requerimientos) formData.append('requerimientos', data.requerimientos);
    if (data.que_llevar) formData.append('que_llevar', data.que_llevar);
    
    // NUEVO: Emprendedores del plan
    if (data.emprendedores && data.emprendedores.length > 0) {
      data.emprendedores.forEach((emprendedor, index) => {
        formData.append(`emprendedores[${index}][emprendedor_id]`, emprendedor.emprendedor_id.toString());
        formData.append(`emprendedores[${index}][rol]`, emprendedor.rol);
        formData.append(`emprendedores[${index}][es_organizador_principal]`, emprendedor.es_organizador_principal ? '1' : '0');
        
        if (emprendedor.descripcion_participacion) {
          formData.append(`emprendedores[${index}][descripcion_participacion]`, emprendedor.descripcion_participacion);
        }
        if (emprendedor.porcentaje_ganancia !== undefined) {
          formData.append(`emprendedores[${index}][porcentaje_ganancia]`, emprendedor.porcentaje_ganancia.toString());
        }
      });
    }
    
    // Imagen principal
    if (data.imagen_principal instanceof File) {
      formData.append('imagen_principal', data.imagen_principal);
    }
    
    // Galería de imágenes
    if (data.imagenes_galeria && data.imagenes_galeria.length > 0) {
      data.imagenes_galeria.forEach((imagen, index) => {
        if (imagen instanceof File) {
          formData.append(`imagenes_galeria[${index}]`, imagen);
        }
      });
    }
    
    // Días del plan
    if (data.dias && data.dias.length > 0) {
      data.dias.forEach((dia, diaIndex) => {
        formData.append(`dias[${diaIndex}][numero_dia]`, dia.numero_dia.toString());
        formData.append(`dias[${diaIndex}][titulo]`, dia.titulo);
        formData.append(`dias[${diaIndex}][descripcion]`, dia.descripcion);
        
        if (dia.hora_inicio) formData.append(`dias[${diaIndex}][hora_inicio]`, dia.hora_inicio);
        if (dia.hora_fin) formData.append(`dias[${diaIndex}][hora_fin]`, dia.hora_fin);
        if (dia.duracion_estimada_minutos) formData.append(`dias[${diaIndex}][duracion_estimada_minutos]`, dia.duracion_estimada_minutos.toString());
        if (dia.notas_adicionales) formData.append(`dias[${diaIndex}][notas_adicionales]`, dia.notas_adicionales);
        if (dia.orden) formData.append(`dias[${diaIndex}][orden]`, dia.orden.toString());
        
        // Servicios del día
        if (dia.servicios && dia.servicios.length > 0) {
          dia.servicios.forEach((servicio, servicioIndex) => {
            formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][servicio_id]`, servicio.servicio_id.toString());
            
            if (servicio.hora_inicio) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][hora_inicio]`, servicio.hora_inicio);
            if (servicio.hora_fin) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][hora_fin]`, servicio.hora_fin);
            if (servicio.duracion_minutos) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][duracion_minutos]`, servicio.duracion_minutos.toString());
            if (servicio.notas) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][notas]`, servicio.notas);
            if (servicio.orden) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][orden]`, servicio.orden.toString());
            if (servicio.es_opcional !== undefined) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][es_opcional]`, servicio.es_opcional ? '1' : '0');
            if (servicio.precio_adicional) formData.append(`dias[${diaIndex}][servicios][${servicioIndex}][precio_adicional]`, servicio.precio_adicional.toString());
          });
        }
      });
    }
    
    return formData;
  }
}