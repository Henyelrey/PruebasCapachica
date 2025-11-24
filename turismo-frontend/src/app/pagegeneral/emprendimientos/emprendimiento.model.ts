// src/app/features/emprendimientos/models/emprendimiento.model.ts

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
  metodos_pago: string[];
  capacidad_aforo: number;
  numero_personas_atiende: number;
  comentarios_resenas?: string;
  imagenes?: string | string[];
  categoria: string;
  certificaciones?: string;
  idiomas_hablados: string[];
  opciones_acceso?: string;
  facilidades_discapacidad: boolean;
  estado: boolean;
  asociacion_id?: number;
  created_at: string;
  updated_at: string;
  asociacion?: Asociacion;
  servicios?: ServicioEmprendimiento[];
  sliders_principales: SliderEmprendimiento[];
  sliders_secundarios: SliderEmprendimiento[];
  administradores?: AdministradorEmprendimiento[];
}

export interface Asociacion {
  id: number;
  nombre: string;
  descripcion: string;
  telefono: string;
  email: string;
  municipalidad_id: number;
  estado: boolean;
  latitud: number;
  longitud: number;
  imagen?: string;
  imagen_url?: string;
  municipalidad?: Municipalidad;
}

export interface Municipalidad {
  id: number;
  nombre: string;
  descripcion: string;
  red_facebook?: string;
  red_instagram?: string;
  red_youtube?: string;
  coordenadas_x: string;
  coordenadas_y: string;
  frase: string;
  comunidades: string;
  historiafamilias: string;
  historiacapachica: string;
  comite: string;
  mision: string;
  vision: string;
  valores: string;
  ordenanzamunicipal: string;
  alianzas: string;
  correo: string;
  horariodeatencion: string;
}

export interface ServicioEmprendimiento {
  id: number;
  nombre: string;
  descripcion: string;
  precio_referencial: string | number;
  emprendedor_id: number;
  estado: boolean;
  capacidad?: number;
  latitud?: string;
  longitud?: string;
  ubicacion_referencia?: string;
  created_at: string;
  updated_at: string;
  horarios?: HorarioServicio[];
  sliders?: SliderServicio[];
  categorias?: CategoriaServicio[];
}

export interface HorarioServicio {
  id: number;
  servicio_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
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
  descripcion?: DescripcionSlider;
}

export interface SliderServicio {
  id: number;
  url: string;
  url_completa: string;
  nombre: string;
  orden: number;
}

export interface DescripcionSlider {
  id: number;
  slider_id: number;
  titulo: string;
  descripcion: string;
}

export interface CategoriaServicio {
  id: number;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
}

export interface AdministradorEmprendimiento {
  id: number;
  name: string;
  email: string;
  phone?: string;
  pivot: {
    emprendedor_id: number;
    user_id: number;
    es_principal: boolean;
    rol: string;
  };
}
export interface PaginatedAsociaciones {
  current_page: number;
  data: Asociacion[];
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


export interface PaginatedEmprendimientos {
  current_page: number;
  data: Emprendimiento[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface FiltrosEmprendimientos {
  asociacion?: number;
  categoria?: string;
  tipo_servicio?: string;
  municipalidad?: number;
  busqueda?: string;
  facilidades_discapacidad?: boolean;
  metodos_pago?: string[];
  precio_rango?: {
    min?: number;
    max?: number;
  };
}