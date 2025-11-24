export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  google_id?: string;
  foto_perfil?: string;
  foto_perfil_url?: string | null;
  avatar?: string | null;
  email_verified_at?: string | null;
  roles?: Array<{
    id: number;
    name: string;
    permissions?: string[] | Permission[];
  }>;
  country?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
  preferred_language?: string;
  last_login?: string;
  permissions?: Permission[];
  pivot?: {
    user_id?: number;
    emprendedor_id?: number;
    es_principal?: boolean;
    rol?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface Role { 
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: string[] | Permission[];
  pivot?: any;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
  pivot?: any;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  foto_perfil?: File | null;
  country?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
  preferred_language?: string;
  [key: string]: string | File | null | undefined;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  email_verified?: boolean;
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyEmailRequest {
  id: number;
  hash: string;
}
export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    roles?: string[];
    permissions?: string[];
    administra_emprendimientos?: boolean;
    emprendimientos?: any[];
    email_verified?: boolean;
  };
}


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface UserPermissions {
  user: {
    id: number;
    name: string;
    email: string;
  };
  direct_permissions: string[];
  permissions_via_roles: string[];
  all_permissions: string[];
}

export interface RoleWithPermissions {
  role: {
    id: number;
    name: string;
  };
  permissions: string[];
}
export interface RoleInfo {
  id: number;
  name: string;
  display_name: string;
  permissions_count: number;
}

// Extensión del modelo User existente para incluir los nuevos campos
export interface ExtendedUser extends User {
  country?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
  preferred_language?: string;
  last_login?: string;
  roles_info?: RoleInfo[];
  is_admin?: boolean;
  has_permissions?: boolean;
  administra_emprendimientos?: boolean;
  emprendimientos_count?: number;
  emprendimientos?: UserEnterprise[];
}

export interface UserEnterprise {
  id: number;
  nombre: string;
  es_principal: boolean;
  rol: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    current_page: number;
    data: User[];
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
  };
  available_roles: {
    id: number;
    name: string;
  }[];
}

// extras

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