
export interface Emprendedor {
  id: number;
  nombre: string;
  tipo_servicio: string;
  descripcion: string;
  // ... otros campos
}

// Nuevas interfaces para sliders
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
  // Agregado:
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
  fecha: string; // Formato: YYYY-MM-DD
  hora?: string; // Formato: HH:mm
  ubicacion?: string;
  mapaUrl?: string;
  tipo?: string;
  imagen: string;
  destacado?: boolean;
  precio?: number;
  precioIncluye?: string; // Añade esta línea
  organizador?: string;
  ticketUrl?: string;
  duracion?: string;
  restricciones?: string;
  // Nuevos campos agregados:
    sliders_principales: Slider[];
  sliders: Slider[];  
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

export interface SliderEmprendimiento {
  id: number;
  url: string;
  url_completa: string;
  nombre: string;
  es_principal: boolean;
  tipo_entidad: string;
  entidad_id: number;
  orden: number;
  activo: boolean;
}