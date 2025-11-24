// src/app/core/services/emprendimientos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../models/api.model';
import { User } from '../models/user.model';

export interface Emprendimiento {
  id: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  pagina_web?: string;
  horario_atencion?: string;
  precio_rango?: string;
  metodos_pago?: string[] | string;
  capacidad_aforo?: number;
  numero_personas_atiende?: number;
  comentarios_resenas?: string;
  imagenes?: string[] | string;
  categoria: string;
  certificaciones?: string;
  idiomas_hablados?: string[] | string;
  opciones_acceso?: string;
  facilidades_discapacidad?: boolean;
  estado?: boolean;
  asociacion_id?: number;
  asociacion?: any;
  servicios?: Servicio[];
  sliders_principales?: Slider[];
  sliders_secundarios?: Slider[];
  administradores?: User[];
  created_at?: string;
  updated_at?: string;
  pivot?: {
    user_id: number;
    emprendedor_id: number;
    es_principal: boolean;
    rol: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion: string;
  precio_referencial: number | string;
  emprendedor_id: number;
  estado?: boolean;
  latitud?: string | number;
  longitud?: string | number;
  ubicacion_referencia?: string;
  categorias?: any[];
  sliders?: Slider[];
  horarios?: Horario[];
  created_at?: string;
  updated_at?: string;
}

export interface Horario {
  id?: number;
  servicio_id?: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Slider {
  id?: number;
  url?: string;
  url_completa?: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad?: string;
  entidad_id?: number;
  orden: number;
  activo?: boolean;
  titulo?: string;
  descripcion?: string | { 
    id?: number; 
    slider_id?: number; 
    titulo?: string; 
    descripcion?: string; 
  };
  imagen?: File;
  created_at?: string;
  updated_at?: string;
}

export interface AdminRequest {
  email: string;
  rol: string;
  es_principal: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmprendimientosService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;
  
  constructor() { }
  
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json'
    });
  }
  
  // Obtener todos los emprendimientos del usuario actual
  getMisEmprendimientos(): Observable<Emprendimiento[]> {
    return this.http.get<ApiResponse<Emprendimiento[]>>(`${this.API_URL}/mis-emprendimientos`)
      .pipe(map(response => response.data || []));
  }
  
  // Obtener un emprendimiento específico
  getEmprendimiento(id: number): Observable<Emprendimiento> {
    return this.http.get<ApiResponse<Emprendimiento>>(`${this.API_URL}/mis-emprendimientos/${id}`)
      .pipe(map(response => response.data!));
  }
  
  // Actualizar un emprendimiento
  updateEmprendimiento(id: number, data: any): Observable<Emprendimiento> {
    const formData = this.prepareFormData(data);
    formData.append('_method', 'PUT');
    
    return this.http.post<ApiResponse<Emprendimiento>>(`${this.API_URL}/emprendedores/${id}`, formData)
      .pipe(map(response => response.data!));
  }
  
  // Agregar un administrador al emprendimiento
  addAdministrador(emprendimientoId: number, data: AdminRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/mis-emprendimientos/${emprendimientoId}/administradores`, data)
      .pipe(map(response => response.data));
  }
  
  // Eliminar un administrador del emprendimiento
  removeAdministrador(emprendimientoId: number, userId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/mis-emprendimientos/${emprendimientoId}/administradores/${userId}`);
  }
  
  // Obtener servicios de un emprendimiento
  getServicios(emprendimientoId: number): Observable<Servicio[]> {
    return this.http.get<ApiResponse<Servicio[]>>(`${this.API_URL}/emprendedores/${emprendimientoId}/servicios`)
      .pipe(map(response => response.data || []));
  }
  
  // Obtener un servicio específico por ID
  getServicio(id: number): Observable<Servicio> {
    return this.http.get<ApiResponse<Servicio>>(`${this.API_URL}/servicios/${id}`)
      .pipe(map(response => response.data!));
  }
  
  // Crear un servicio
  createServicio(data: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(data);
    return this.http.post<ApiResponse<Servicio>>(`${this.API_URL}/servicios`, formData)
      .pipe(map(response => response.data!));
  }
  
  // Actualizar un servicio
  updateServicio(id: number, data: Servicio): Observable<Servicio> {
    const formData = this.prepareFormData(data);
    formData.append('_method', 'PUT');
    
    return this.http.post<ApiResponse<Servicio>>(`${this.API_URL}/servicios/${id}`, formData)
      .pipe(map(response => response.data!));
  }
  
  // Eliminar un servicio
  deleteServicio(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/servicios/${id}`);
  }
  
  // Verificar disponibilidad de un servicio
  checkDisponibilidad(data: any): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/servicios/verificar-disponibilidad`, { params: data })
      .pipe(map(response => response.data));
  }
  
  // Método para preparar FormData para subir archivos
  private prepareFormData(data: any): FormData {
    const formData = new FormData();
    
    // Procesar campos básicos
    Object.keys(data).forEach(key => {
      if (key !== 'sliders_principales' && key !== 'sliders_secundarios' && 
          key !== 'sliders' && key !== 'deleted_sliders' && 
          key !== 'administradores' && key !== 'servicios' && 
          key !== 'horarios' && key !== 'categorias') {
        
        if (data[key] !== null && data[key] !== undefined) {
          // Campos que deben enviarse como arrays JSON
          if (key === 'metodos_pago' || key === 'idiomas_hablados' || key === 'certificaciones') {
            if (Array.isArray(data[key])) {
              formData.append(key, JSON.stringify(data[key]));
            } else if (typeof data[key] === 'string') {
              // Si viene como string, convertir a array
              const arrayValue = data[key].split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
              formData.append(key, JSON.stringify(arrayValue));
            }
          } else if (Array.isArray(data[key])) {
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
    if (data.categorias && Array.isArray(data.categorias)) {
      data.categorias.forEach((categoriaId: number) => {
        formData.append('categorias[]', categoriaId.toString());
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
}