export interface Slider {
  id?: number | null;
  imagen?: File | string | null;
  orden?: number | null;
  titulo?: string | null;
  descripcion?: string | null;
  nombre?: string | null;
  es_principal?: boolean | null;
  url_completa?: string;
}

export interface Horario {
  id?: number | null;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  hora_inicio: string;
  hora_fin: string;
  activo?: boolean;
}

export interface Evento {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo_evento?: string;
  idioma_principal?: string;
  fecha_inicio?: string;
  hora_inicio?: string;
  fecha_fin?: string;
  hora_fin?: string;
  duracion_horas?: number;
  coordenada_x?: number | string;
  coordenada_y?: number | string;
  id_emprendedor?: number;
  que_llevar?: string;
  sliders?: Slider[];
  horarios?: Horario[];
  emprendedor?: any; // Puedes definir una interfaz específica si es necesario
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedEvento {
  current_page: number;
  data: Evento[];
  first_page_url: string;
  from: number | null;
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
  to: number | null;
  total: number;
}

export interface EventoResponse {
  success: boolean;
  data: PaginatedEvento | Evento | string;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

// Interfaz para manejar errores de validación
export interface ValidationErrors {
  [key: string]: string[];
}