import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Slider {
  id?: number;
  url?: string;
  url_completa?: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad: string;
  entidad_id: number;
  orden: number;
  activo?: boolean;
  titulo?: string;
  descripcion?: string | {
    id?: number;
    slider_id?: number;
    titulo?: string;
    descripcion?: string;
    created_at?: string;
    updated_at?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface SliderDescription {
  id?: number;
  slider_id: number;
  titulo: string;
  descripcion: string;
  created_at?: string;
  updated_at?: string;
}

export interface Municipalidad {
  id?: number;
  nombre: string;
  descripcion: string;
  red_facebook?: string;
  red_instagram?: string;
  red_youtube?: string;
  coordenadas_x?: number;
  coordenadas_y?: number;
  frase?: string;
  comunidades?: string;
  historiafamilias?: string;
  historiacapachica?: string;
  comite?: string;
  mision?: string;
  vision?: string;
  valores?: string;
  ordenanzamunicipal?: string;
  alianzas?: string;
  correo?: string;
  horariodeatencion?: string;
  created_at?: string;
  updated_at?: string;
  asociaciones?: Asociacion[];
  sliders_principales?: Slider[];
  sliders_secundarios?: Slider[];
}

export interface Evento {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo_evento: string;
  idioma_principal: string;
  fecha_inicio: string;
  hora_inicio?: number;
  fecha_fin: string;
  hora_fin?: number;
  duracion_horas?: number;
  coordenada_x?: number;
  coordenada_y?: number;
  imagen_url: Slider[];
  id_emprendedor?: Emprendedor[];
  que_llevar: string;
}

export interface Asociacion {
  id?: number;
  nombre: string;
  descripcion: string;
  ubicacion?: string;
  telefono?: string;
  email?: string;
  municipalidad_id: number;
  estado?: boolean;
  latitud?: number;
  longitud?: number;
  imagen?: File | string | null;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
  municipalidad?: Municipalidad;
  emprendedores?: Emprendedor[];
}

export interface Emprendedor {
  id?: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  pagina_web?: string;
  horario_atencion?: string;
  precio_rango?: string;
  metodos_pago?: string[];
  capacidad_aforo?: number;
  numero_personas_atiende?: number;
  comentarios_resenas?: string;
  imagenes?: string[];
  categoria: string;
  certificaciones?: string[];
  idiomas_hablados?: string[];
  opciones_acceso?: string[];
  facilidades_discapacidad?: boolean;
  asociacion_id?: number;
  created_at?: string;
  updated_at?: string;
  asociacion?: Asociacion;
  servicios?: Servicio[];
  slidersPrincipales?: Slider[];
  slidersSecundarios?: Slider[];
  // Añadir propiedades en snake_case para compatibilidad con la API
  sliders_principales?: Slider[];
  sliders_secundarios?: Slider[];
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  emprendedor_id: number;
  estado?: boolean;
  // Nuevos campos
  capacidad?: string;
  latitud?: number;
  longitud?: number;
  ubicacion_referencia?: string;
  horarios?: ServicioHorario[];
  // Relaciones
  emprendedor?: Emprendedor;
  categorias?: Categoria[];
  sliders?: Slider[];
  created_at?: string;
  updated_at?: string;
}
// Nuevo modelo para los horarios
export interface ServicioHorario {
  id?: number;
  servicio_id?: number;
  dia_semana: string; // 'lunes', 'martes', etc.
  hora_inicio: string; // Formato 'HH:MM:SS'
  hora_fin: string;    // Formato 'HH:MM:SS'
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
  created_at?: string;
  updated_at?: string;
  servicios?: Servicio[];
}

export interface Reserva {
  id?: number;
  usuario_id: number;
  codigo_reserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  servicios?: ReservaServicio[];
  usuario?: User;
  created_at?: string;
  updated_at?: string;
  // Propiedades calculadas
  fecha_inicio?: string;
  fecha_fin?: string;
  total_servicios?: number;
}
export interface ReservaServicio {
  id?: number;
  reserva_id: number;
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
  servicio?: Servicio;
  emprendedor?: Emprendedor;
  reserva?: Reserva;
  created_at?: string;
  updated_at?: string;
}

export interface ReservaDetalle {
  id?: number;
  reserva_id: number;
  emprendedor_id: number;
  descripcion: string;
  cantidad: number;
  created_at?: string;
  updated_at?: string;
  reserva?: Reserva;
  emprendedor?: Emprendedor;
}

@Injectable({
  providedIn: 'root'
})
export class TurismoService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Método privado para manejar FormData con imágenes - corregido
  private prepareFormData(data: any): FormData {
    const formData = new FormData();
    
    // Añadir campos regulares
    Object.keys(data).forEach(key => {
      // Ignorar sliders, deleted_sliders, categorías, horarios, etc. que se manejarán por separado
      if (key !== 'sliders_principales' && key !== 'sliders_secundarios' && key !== 'sliders' && 
          key !== 'imagenes' && key !== 'categorias' && key !== 'deleted_sliders' && 
          key !== 'horarios' && key !== 'servicios') {
        
        // Solo enviar campo si tiene un valor válido
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          // Si es un array, añadir cada elemento con notación de array
          if (Array.isArray(data[key])) {
            data[key].forEach((item: any, index: number) => {
              formData.append(`${key}[]`, item.toString());
            });
          } else {
            formData.append(key, data[key]);
          }
        }
      }
    });
  
  // Manejar categorías (para servicios)
  if (data.categorias && Array.isArray(data.categorias) && data.categorias.length > 0) {
    data.categorias.forEach((cat: number) => {
      formData.append('categorias[]', cat.toString());
    });
  }
  // Manejar horarios (para servicios)
  if (data.horarios && Array.isArray(data.horarios) && data.horarios.length > 0) {
    data.horarios.forEach((horario: any, index: number) => {
      // Si tiene ID, incluirlo para actualización
      if (horario.id) {
        formData.append(`horarios[${index}][id]`, horario.id.toString());
      }
      
      // Incluir los campos obligatorios
      formData.append(`horarios[${index}][dia_semana]`, horario.dia_semana);
      formData.append(`horarios[${index}][hora_inicio]`, horario.hora_inicio);
      formData.append(`horarios[${index}][hora_fin]`, horario.hora_fin);
      
      // Incluir el campo activo solo si está definido
      if (horario.activo !== undefined) {
        formData.append(`horarios[${index}][activo]`, horario.activo.toString());
      }
    });
  }
  
  // Manejar IDs de sliders eliminados
  if (data.deleted_sliders && Array.isArray(data.deleted_sliders) && data.deleted_sliders.length > 0) {
    data.deleted_sliders.forEach((id: number) => {
      formData.append('deleted_sliders[]', id.toString());
    });
  }
  
  // Manejar sliders principales
  if (data.sliders_principales && Array.isArray(data.sliders_principales) && data.sliders_principales.length > 0) {
    data.sliders_principales.forEach((slider: any, index: number) => {
      // Si tiene ID, incluirlo para actualización
      if (slider.id) {
        formData.append(`sliders_principales[${index}][id]`, slider.id.toString());
      }
      
      // Siempre incluir nombre y orden - campos obligatorios
      if (slider.nombre) {
        formData.append(`sliders_principales[${index}][nombre]`, slider.nombre);
      }
      
      if (slider.orden) {
        formData.append(`sliders_principales[${index}][orden]`, slider.orden.toString());
      }
      
      // Incluir imagen solo si es un archivo nuevo
      if (slider.imagen instanceof File) {
        formData.append(`sliders_principales[${index}][imagen]`, slider.imagen);
      }
      
      // Asegurar que el campo es_principal esté establecido correctamente
      formData.append(`sliders_principales[${index}][es_principal]`, 'true');
    });
  }
  
  // Manejar sliders secundarios
  if (data.sliders_secundarios && Array.isArray(data.sliders_secundarios) && data.sliders_secundarios.length > 0) {
    data.sliders_secundarios.forEach((slider: any, index: number) => {
      // Si tiene ID, incluirlo para actualización
      if (slider.id) {
        formData.append(`sliders_secundarios[${index}][id]`, slider.id.toString());
      }
      
      // Siempre incluir nombre y orden - campos obligatorios
      if (slider.nombre) {
        formData.append(`sliders_secundarios[${index}][nombre]`, slider.nombre);
      }
      
      if (slider.orden) {
        formData.append(`sliders_secundarios[${index}][orden]`, slider.orden.toString());
      }
      
      // Incluir imagen solo si es un archivo nuevo
      if (slider.imagen instanceof File) {
        formData.append(`sliders_secundarios[${index}][imagen]`, slider.imagen);
      }
      
      // Asegurar que el campo es_principal esté establecido correctamente
      formData.append(`sliders_secundarios[${index}][es_principal]`, 'false');
      
      // SIEMPRE incluir título y descripción para sliders secundarios, aunque sean cadenas vacías
      // Esto es necesario para la validación del backend
      formData.append(`sliders_secundarios[${index}][titulo]`, slider.titulo || '');
      formData.append(`sliders_secundarios[${index}][descripcion]`, slider.descripcion || '');
    });
  }
  
  // Manejar sliders genéricos (para servicios)
  if (data.sliders && Array.isArray(data.sliders) && data.sliders.length > 0) {
    data.sliders.forEach((slider: any, index: number) => {
      // Si tiene ID, incluirlo para actualización
      if (slider.id) {
        formData.append(`sliders[${index}][id]`, slider.id.toString());
      }
      
      // Campos obligatorios
      if (slider.nombre) {
        formData.append(`sliders[${index}][nombre]`, slider.nombre);
      }
      
      if (slider.orden) {
        formData.append(`sliders[${index}][orden]`, slider.orden.toString());
      }
      
      // Incluir es_principal si existe
      if (slider.es_principal !== undefined) {
        formData.append(`sliders[${index}][es_principal]`, slider.es_principal.toString());
      }
      
      // Incluir imagen solo si es un archivo nuevo
      if (slider.imagen instanceof File) {
        formData.append(`sliders[${index}][imagen]`, slider.imagen);
      }
      
      // Incluir título y descripción si existen
      if (slider.titulo !== undefined) {
        formData.append(`sliders[${index}][titulo]`, slider.titulo || '');
      }
      
      if (slider.descripcion !== undefined) {
        formData.append(`sliders[${index}][descripcion]`, slider.descripcion || '');
      }
    });
  }
  
    return formData;
  }
  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }
  
  private getSimpleHeaders(): HttpHeaders {
    return this.getHeaders().set('Content-Type', 'application/json');
  }

  // Municipalidad
  getMunicipalidades(): Observable<Municipalidad[]> {
    return this.http.get<{ success: boolean, data: Municipalidad[] }>(`${this.API_URL}/municipalidad`, 
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getMunicipalidad(id: number): Observable<Municipalidad> {
    return this.http.get<{ success: boolean, data: Municipalidad }>(`${this.API_URL}/municipalidad/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getMunicipalidadWithAsociaciones(id: number): Observable<Municipalidad> {
    return this.http.get<{ success: boolean, data: Municipalidad }>(`${this.API_URL}/municipalidad/${id}/asociaciones`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getMunicipalidadWithAsociacionesAndEmprendedores(id: number): Observable<Municipalidad> {
    return this.http.get<{ success: boolean, data: Municipalidad }>(`${this.API_URL}/municipalidad/${id}/asociaciones/emprendedores`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createMunicipalidad(municipalidad: Municipalidad): Observable<Municipalidad> {
    const formData = this.prepareFormData(municipalidad);
    return this.http.post<{ success: boolean, data: Municipalidad }>(`${this.API_URL}/municipalidad`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateMunicipalidad(id: number, municipalidad: Municipalidad): Observable<Municipalidad> {
    const formData = this.prepareFormData(municipalidad);
    // Añadir el método PUT usando _method
    formData.append('_method', 'PUT');
    return this.http.post<{ success: boolean, data: Municipalidad }>(`${this.API_URL}/municipalidad/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteMunicipalidad(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/municipalidad/${id}`,
      { headers: this.getSimpleHeaders() });
  }
   // Evento
   getEventos(): Observable<Evento[]> {
    return this.http.get<{ success: boolean, data: Evento[] }>(`${this.API_URL}/evento`, 
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getEvento(id: number): Observable<Evento> {
    return this.http.get<{ success: boolean, data: Evento }>(`${this.API_URL}/evento/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  

  createEvento(evento: Evento): Observable<Evento> {
    const formData = this.prepareFormData(evento);
    return this.http.post<{ success: boolean, data: Evento }>(`${this.API_URL}/evento`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateEvento(id: number, evento: Evento): Observable<Evento> {
    const formData = this.prepareFormData(evento);
    // Añadir el método PUT usando _method
    formData.append('_method', 'PUT');
    return this.http.post<{ success: boolean, data: Evento }>(`${this.API_URL}/evento/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteEvento(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/evento/${id}`,
      { headers: this.getSimpleHeaders() });
  }

  // Asociaciones
  getAsociaciones(page: number = 1, perPage: number = 10): Observable<PaginatedResponse<Asociacion>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<{ success: boolean, data: PaginatedResponse<Asociacion> }>(`${this.API_URL}/asociaciones`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getAsociacion(id: number): Observable<Asociacion> {
    return this.http.get<{ success: boolean, data: Asociacion }>(`${this.API_URL}/asociaciones/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getAsociacionesByMunicipalidad(municipalidadId: number): Observable<Asociacion[]> {
    return this.http.get<{ success: boolean, data: Asociacion[] }>(`${this.API_URL}/asociaciones/municipalidad/${municipalidadId}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getEmprendedoresByAsociacion(asociacionId: number): Observable<Emprendedor[]> {
    return this.http.get<{ success: boolean, data: Emprendedor[] }>(`${this.API_URL}/asociaciones/${asociacionId}/emprendedores`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createAsociacion(asociacion: Asociacion): Observable<Asociacion> {
    const formData = new FormData();
    
    // Añadir todos los campos al FormData
    if (asociacion.nombre) formData.append('nombre', asociacion.nombre);
    if (asociacion.descripcion) formData.append('descripcion', asociacion.descripcion);
    if (asociacion.telefono) formData.append('telefono', asociacion.telefono);
    if (asociacion.email) formData.append('email', asociacion.email);
    if (asociacion.municipalidad_id) formData.append('municipalidad_id', asociacion.municipalidad_id.toString());
    if (asociacion.estado !== undefined) formData.append('estado', asociacion.estado ? '1' : '0');
    if (asociacion.latitud) formData.append('latitud', asociacion.latitud.toString());
    if (asociacion.longitud) formData.append('longitud', asociacion.longitud.toString());
    
    // Si hay una imagen como File, adjuntarla
    if (asociacion.imagen instanceof File) {
      formData.append('imagen', asociacion.imagen);
    }
    
    return this.http.post<{ success: boolean, data: Asociacion, message: string }>(`${this.API_URL}/asociaciones`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateAsociacion(id: number, asociacion: Asociacion): Observable<Asociacion> {
    const formData = new FormData();
    
    // Añadir método PUT
    formData.append('_method', 'PUT');
    
    // Añadir todos los campos al FormData
    if (asociacion.nombre) formData.append('nombre', asociacion.nombre);
    if (asociacion.descripcion) formData.append('descripcion', asociacion.descripcion);
    if (asociacion.telefono) formData.append('telefono', asociacion.telefono);
    if (asociacion.email) formData.append('email', asociacion.email);
    if (asociacion.municipalidad_id) formData.append('municipalidad_id', asociacion.municipalidad_id.toString());
    if (asociacion.estado !== undefined) formData.append('estado', asociacion.estado ? '1' : '0');
    if (asociacion.latitud) formData.append('latitud', asociacion.latitud.toString());
    if (asociacion.longitud) formData.append('longitud', asociacion.longitud.toString());
    
    // Si hay una imagen como File, adjuntarla
    if (asociacion.imagen instanceof File) {
      formData.append('imagen', asociacion.imagen);
    }
    
    return this.http.post<{ success: boolean, data: Asociacion, message: string }>(`${this.API_URL}/asociaciones/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteAsociacion(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/asociaciones/${id}`,
      { headers: this.getSimpleHeaders() });
  }

  // Emprendedores
  getEmprendedores(page: number = 1, perPage: number = 10): Observable<PaginatedResponse<Emprendedor>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<{ status: string, data: PaginatedResponse<Emprendedor> }>(`${this.API_URL}/emprendedores`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getEmprendedor(id: number): Observable<Emprendedor> {
    return this.http.get<{ status?: string, success?: boolean, data: any }>(`${this.API_URL}/emprendedores/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(
        map(response => {
          const data = response.data;
          // Mapear propiedades snake_case a camelCase
          if (data.sliders_principales) {
            data.slidersPrincipales = data.sliders_principales;
          }
          if (data.sliders_secundarios) {
            data.slidersSecundarios = data.sliders_secundarios;
          }
          return data as Emprendedor;
        })
      );
  }

  getEmprendedoresByCategoria(categoria: string): Observable<Emprendedor[]> {
    return this.http.get<{ status: string, data: Emprendedor[] }>(`${this.API_URL}/emprendedores/categoria/${categoria}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  searchEmprendedores(query: string): Observable<Emprendedor[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ status: string, data: Emprendedor[] }>(`${this.API_URL}/emprendedores/search`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getServiciosByEmprendedor(emprendedorId: number): Observable<Servicio[]> {
    return this.http.get<{ status: string, data: Servicio[] }>(`${this.API_URL}/emprendedores/${emprendedorId}/servicios`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  /*getReservasByEmprendedor(emprendedorId: number): Observable<Reserva[]> {
    return this.http.get<{ status: string, data: Reserva[] }>(`${this.API_URL}/emprendedores/${emprendedorId}/reservas`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }*/

  createEmprendedor(emprendedor: Emprendedor): Observable<Emprendedor> {
    const formData = this.prepareFormData(emprendedor);
    return this.http.post<{ success: boolean, data: Emprendedor, message: string }>(`${this.API_URL}/emprendedores`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateEmprendedor(id: number, emprendedor: Emprendedor): Observable<Emprendedor> {
    const formData = this.prepareFormData(emprendedor);
    formData.append('_method', 'PUT');
    return this.http.post<{ success: boolean, data: Emprendedor, message: string }>(`${this.API_URL}/emprendedores/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteEmprendedor(id: number): Observable<any> {
    return this.http.delete<{ status: string, message: string }>(`${this.API_URL}/emprendedores/${id}`,
      { headers: this.getSimpleHeaders() });
  }

  // Servicios
  getServicios(page: number = 1, perPage: number = 10, filters?: any): Observable<PaginatedResponse<Servicio>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    // Añadir filtros si existen
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<{ success: boolean, data: PaginatedResponse<Servicio> }>(`${this.API_URL}/servicios`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getServicio(id: number): Observable<Servicio> {
    return this.http.get<{ success: boolean, data: Servicio }>(`${this.API_URL}/servicios/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getServiciosByCategoria(categoriaId: number): Observable<Servicio[]> {
    return this.http.get<{ success: boolean, data: Servicio[] }>(`${this.API_URL}/servicios/categoria/${categoriaId}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createServicio(servicio: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(servicio);
    return this.http.post<{ success: boolean, data: Servicio, message: string }>(`${this.API_URL}/servicios`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateServicio(id: number, servicio: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(servicio);
    formData.append('_method', 'PUT');
    return this.http.post<{ success: boolean, data: Servicio, message: string }>(`${this.API_URL}/servicios/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteServicio(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/servicios/${id}`,
      { headers: this.getSimpleHeaders() });
  }
  verificarDisponibilidadServicio(servicioId: number, fecha: string, horaInicio: string, horaFin: string): Observable<{disponible: boolean}> {
    const params = new HttpParams()
      .set('servicio_id', servicioId.toString())
      .set('fecha', fecha)
      .set('hora_inicio', horaInicio)
      .set('hora_fin', horaFin);
    
    return this.http.get<{ success: boolean, disponible: boolean }>(`${this.API_URL}/servicios/verificar-disponibilidad`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => ({ disponible: response.disponible })));
  }
  
  getServiciosByUbicacion(latitud: number, longitud: number, distancia: number = 10): Observable<Servicio[]> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString())
      .set('distancia', distancia.toString());
    
    return this.http.get<{ success: boolean, data: Servicio[] }>(`${this.API_URL}/servicios/ubicacion`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  // Sliders
  getSliders(page: number = 1, perPage: number = 10, filters?: any): Observable<PaginatedResponse<Slider>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (filters) {
      if (filters.tipo_entidad) params = params.set('tipo_entidad', filters.tipo_entidad);
      if (filters.entidad_id) params = params.set('entidad_id', filters.entidad_id.toString());
      if (filters.es_principal !== undefined) params = params.set('es_principal', filters.es_principal.toString());
      if (filters.with_descripcion !== undefined) params = params.set('with_descripcion', filters.with_descripcion.toString());
    }

    return this.http.get<{ success: boolean, data: PaginatedResponse<Slider> }>(`${this.API_URL}/sliders`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getSlidersByEntidad(tipo: string, id: number, withDescripcion: boolean = true): Observable<{principales: Slider[], secundarios: Slider[]}> {
    const params = new HttpParams().set('with_descripcion', withDescripcion.toString());
    return this.http.get<{ success: boolean, data: {principales: Slider[], secundarios: Slider[]} }>(
      `${this.API_URL}/sliders/entidad/${tipo}/${id}`, { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getSlider(id: number): Observable<Slider> {
    return this.http.get<{ success: boolean, data: Slider }>(`${this.API_URL}/sliders/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createSlider(slider: Slider, file: File): Observable<Slider> {
    const formData = new FormData();
    Object.keys(slider).forEach(key => {
      if (key !== 'imagen') {
        formData.append(key, slider[key as keyof Slider]?.toString() || '');
      }
    });
    formData.append('imagen', file);

    return this.http.post<{ success: boolean, data: Slider, message: string }>(`${this.API_URL}/sliders`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  updateSlider(id: number, slider: Slider, file?: File): Observable<Slider> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    
    Object.keys(slider).forEach(key => {
      if (key !== 'imagen') {
        formData.append(key, slider[key as keyof Slider]?.toString() || '');
      }
    });
    
    if (file) {
      formData.append('imagen', file);
    }

    return this.http.post<{ success: boolean, data: Slider, message: string }>(`${this.API_URL}/sliders/${id}`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  deleteSlider(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/sliders/${id}`,
      { headers: this.getSimpleHeaders() });
  }

  createMultipleSliders(tipo_entidad: string, entidad_id: number, sliders: any[]): Observable<Slider[]> {
    const formData = new FormData();
    formData.append('tipo_entidad', tipo_entidad);
    formData.append('entidad_id', entidad_id.toString());
    
    sliders.forEach((slider, index) => {
      Object.keys(slider).forEach(key => {
        if (key === 'imagen' && slider[key] instanceof File) {
          formData.append(`sliders[${index}][imagen]`, slider[key]);
        } else if (key !== 'imagen') {
          formData.append(`sliders[${index}][${key}]`, slider[key]?.toString() || '');
        }
      });
    });

    return this.http.post<{ success: boolean, data: Slider[], message: string }>(`${this.API_URL}/sliders/multiple`, formData,
      { headers: this.getHeaders() })
      .pipe(map(response => response.data));
  }

  // Categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<{ success: boolean, data: Categoria[] }>(`${this.API_URL}/categorias`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getCategoria(id: number): Observable<Categoria> {
    return this.http.get<{ success: boolean, data: Categoria }>(`${this.API_URL}/categorias/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<{ success: boolean, data: Categoria, message: string }>(`${this.API_URL}/categorias`, categoria,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<{ success: boolean, data: Categoria, message: string }>(`${this.API_URL}/categorias/${id}`, categoria,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/categorias/${id}`,
      { headers: this.getSimpleHeaders() });
  }

  // Métodos para reservas
  getReservas(page: number = 1, perPage: number = 10, filters?: any): Observable<PaginatedResponse<Reserva>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    // Añadir filtros si existen
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key].toString());
        }
      });
    }

    return this.http.get<{ success: boolean, data: PaginatedResponse<Reserva> }>(`${this.API_URL}/reservas`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  getReserva(id: number): Observable<Reserva> {
    return this.http.get<{ success: boolean, data: Reserva }>(`${this.API_URL}/reservas/${id}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  createReserva(reserva: Reserva): Observable<Reserva> {
    return this.http.post<{ success: boolean, data: Reserva, message: string }>(`${this.API_URL}/reservas`, reserva,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  updateReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<{ success: boolean, data: Reserva, message: string }>(`${this.API_URL}/reservas/${id}`, reserva,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }

  deleteReserva(id: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.API_URL}/reservas/${id}`,
      { headers: this.getSimpleHeaders() });
  }
  
  cambiarEstadoReserva(id: number, estado: string): Observable<Reserva> {
    return this.http.put<{ success: boolean, data: Reserva, message: string }>(`${this.API_URL}/reservas/${id}/estado`, { estado },
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  getReservasByEmprendedor(emprendedorId: number): Observable<Reserva[]> {
    return this.http.get<{ success: boolean, data: Reserva[] }>(`${this.API_URL}/reservas/emprendedor/${emprendedorId}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  getReservasByServicio(servicioId: number): Observable<Reserva[]> {
    return this.http.get<{ success: boolean, data: Reserva[] }>(`${this.API_URL}/reservas/servicio/${servicioId}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  // Métodos para servicios de reserva
  getServiciosByReserva(reservaId: number): Observable<ReservaServicio[]> {
    return this.http.get<{ success: boolean, data: ReservaServicio[] }>(`${this.API_URL}/reserva-servicios/reserva/${reservaId}`,
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  cambiarEstadoServicioReserva(id: number, estado: string): Observable<ReservaServicio> {
    return this.http.put<{ success: boolean, data: ReservaServicio, message: string }>(`${this.API_URL}/reserva-servicios/${id}/estado`, { estado },
      { headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  getCalendarioReservas(fechaInicio: string, fechaFin: string, emprendedorId?: number): Observable<ReservaServicio[]> {
    let params = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    
    if (emprendedorId) {
      params = params.set('emprendedor_id', emprendedorId.toString());
    }
    
    return this.http.get<{ success: boolean, data: ReservaServicio[] }>(`${this.API_URL}/reserva-servicios/calendario`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => response.data));
  }
  
  verificarDisponibilidadReservaServicio(servicioId: number, fechaInicio: string, fechaFin: string | null, horaInicio: string, horaFin: string, reservaServicioId?: number): Observable<{disponible: boolean}> {
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
    
    return this.http.get<{ success: boolean, disponible: boolean }>(`${this.API_URL}/reserva-servicios/verificar-disponibilidad`, 
      { params, headers: this.getSimpleHeaders() })
      .pipe(map(response => ({ disponible: response.disponible })));
  }
}