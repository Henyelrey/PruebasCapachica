import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Emprendedor {
  id: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  telefono?: string;
  email?: string;
  ubicacion?: string;
}

export interface Slider {
  id: number;
  url: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad: string;
  entidad_id: number;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  url_completa: string;
  descripcion?: {
    id: number;
    slider_id: number;
    titulo: string;
    descripcion: string;
  };
}

export interface Evento {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora?: string;
  ubicacion?: string;
  mapaUrl?: string;
  tipo?: string;
  tipo_evento: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_horas: string;
  imagen: string;
  destacado?: boolean;
  precio?: number;
  precioIncluye?: string;
  organizador?: string;
  ticketUrl?: string;
  duracion?: string;
  restricciones?: string;
  que_llevar?: string;
  idioma_principal?: string;
  sliders_principales: Slider[];
  sliders: Slider[];
  emprendedor: Emprendedor;
}

interface ApiResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Evento[];
  };
}

export interface FiltrosEventos {
  busqueda?: string;
  nombre: string;
  descripcion: string;
  tipo_evento: string;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_fin: string;
  hora_fin: string;
  emprendedor: {
    nombre: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  obtenerEvento(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/eventos/${id}`);
  }

  obtenerEventos(): Observable<Evento[]> {
    return this.http.get<ApiResponse>(`${this.API_URL}/eventos`).pipe(
      map(response => response.success ? response.data.data : [])
    );
  }

  getEventos(): Observable<Evento[]> {
    return this.obtenerEventos();
  }

  getEventoById(id: number): Observable<Evento> {
    return this.http.get<{ success: boolean; data: Evento }>(`${this.API_URL}/eventos/${id}`)
      .pipe(map(response => response.data));
  }

  getImagenUrl(imagenPath: string | undefined): string {
    if (!imagenPath) {
      return 'assets/images/eventos/default.jpg';
    }
    
    if (imagenPath.startsWith('http')) {
      return imagenPath;
    }
    
    return `assets/images/eventos/${imagenPath}`;
  }

  getProximosEventos(): Observable<any> {
    return this.http.get(`${this.API_URL}/eventos/proximos`);
  }
}