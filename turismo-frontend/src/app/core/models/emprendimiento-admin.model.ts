import type {
  Emprendimiento,
  Servicio,
  AdminRequest,
  ServicioPopular,
  Horario,
  EventoBackend
} from './emprendimiento.model';

// Exportar interfaces de emprendimiento para uso externo
export type { Emprendimiento, Servicio, AdminRequest, ServicioPopular, Horario, EventoBackend } from './emprendimiento.model';

// Modelos base reutilizables
export interface Usuario {
  id: number;
  name: string;
  email: string;
  phone?: string;
  foto_perfil_url?: string | null;
  country?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
  preferred_language?: string;
  active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

// Modelos para Reservas
export interface Reserva {
  id: number;
  usuario_id: number;
  codigo_reserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  created_at: string;
  updated_at: string;
  usuario: Usuario;
  servicios: ReservaServicio[];
}

export interface ReservaServicio {
  id: number;
  reserva_id: number;
  servicio_id: number;
  emprendedor_id: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  cantidad: number;
  precio: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas_cliente?: string;
  notas_emprendedor?: string;
  created_at: string;
  updated_at: string;
  servicio?: ServicioInfo;
  emprendedor?: EmprendedorInfo;
}

export interface ServicioInfo {
  id: number;
  nombre: string;
  descripcion: string;
  precio_referencial: string;
  capacidad: number; // Campo agregado como requerido
  emprendedor_id?: number;
  estado?: boolean;
  latitud?: string;
  longitud?: string;
  ubicacion_referencia?: string;
}

export interface EmprendedorInfo {
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
  idiomas_hablados?: string;
  opciones_acceso?: string;
  facilidades_discapacidad?: boolean;
  estado?: boolean;
  asociacion_id?: number | null;
}

// Modelos para Planes
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  es_publico: boolean;
  estado: 'activo' | 'inactivo' | 'borrador';
  creado_por_usuario_id: number;
  duracion_dias: number;
  que_incluye: string;
  imagen_principal?: string;
  imagenes_galeria?: string[];
  emprendedor_id: number;
  precio_total: string;
  dificultad: 'facil' | 'moderado' | 'dificil';
  requerimientos?: string;
  que_llevar?: string;
  mi_rol?: RolPlan;
  imagen_principal_url?: string;
  imagenes_galeria_urls?: string[];
  cupos_disponibles?: number;
  organizador_principal?: EmprendedorInfo;
  total_emprendedores?: number;
  pivot?: PivotEmprendedorPlan;
  dias?: PlanDia[];
  inscripciones?: Inscripcion[];
  emprendedores?: EmprendedorPlan[];
  created_at: string;
  updated_at: string;
}

export interface RolPlan {
  rol: 'organizador' | 'colaborador';
  es_organizador_principal: boolean;
  descripcion_participacion: string;
  porcentaje_ganancia: string;
}

export interface PivotEmprendedorPlan {
  emprendedor_id: number;
  plan_id: number;
  rol: 'organizador' | 'colaborador';
  es_organizador_principal: boolean;
  descripcion_participacion: string;
  porcentaje_ganancia: string;
  created_at: string;
  updated_at: string;
}

export interface PlanDia {
  id: number;
  plan_id: number;
  numero_dia: number;
  titulo: string;
  descripcion: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_estimada_minutos?: number | null;
  notas_adicionales?: string;
  orden: number;
  servicios?: ServicioPlanDia[];
  created_at: string;
  updated_at: string;
}

export interface ServicioPlanDia {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_referencial: string;
  emprendedor_id?: number;
  pivot: {
    plan_dia_id: number;
    servicio_id: number;
    hora_inicio: string;
    hora_fin: string;
    duracion_minutos: number;
    notas: string;
    orden: number;
    es_opcional: boolean;
    precio_adicional: string;
    created_at: string;
    updated_at: string;
  };
  emprendedor?: EmprendedorInfo | null;
}

export interface Inscripcion {
  id: number;
  plan_id: number;
  user_id: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas?: string | null;
  fecha_inscripcion: string;
  fecha_inicio_plan?: string | null;
  fecha_fin_plan?: string | null;
  notas_usuario?: string | null;
  requerimientos_especiales?: string;
  numero_participantes: number;
  precio_pagado: string;
  metodo_pago: string;
  comentarios_adicionales?: string;
  usuario?: Usuario;
  created_at: string;
  updated_at: string;
}

export interface EmprendedorPlan {
  id: number;
  nombre: string;
  ubicacion: string;
  telefono?: string;
  email?: string;
  pivot: PivotEmprendedorPlan;
}

// Estadísticas y Dashboard
export interface EstadisticasPlan {
  total_inscripciones: number;
  inscripciones_confirmadas: number;
  inscripciones_pendientes: number;
  inscripciones_canceladas: number;
  total_participantes: number;
  ingresos_totales: number;
  promedio_participantes_por_inscripcion: number | null;
  cupos_disponibles: number;
  porcentaje_ocupacion: number;
  total_emprendedores: number;
  organizador_principal: string;
  mi_participacion: {
    rol: string;
    puede_gestionar_inscripciones: boolean;
    puede_editar_plan: boolean;
  };
}

export interface ResumenPlanes {
  total_planes_participando: number;
  planes_organizando: number;
  planes_colaborando: number;
  planes_activos_participando: number;
  planes_publicos_participando: number;
  total_inscripciones: number;
  inscripciones_confirmadas: number;
  ingresos_estimados: number;
  total_planes: number;
  planes_activos: number;
  planes_publicos: number;
  planes_activos_organizando: number;
  planes_activos_colaborando: number;
  inscripciones_planes_organizando: number;
  ingresos_estimados_total: number;
  planes_por_rol: {
    organizando: {
      total: number;
      activos: number;
      principales: number;
    };
    colaborando: {
      total: number;
      activos: number;
    };
  };
  planes_por_estado: {
    activos: number;
    inactivos: number;
    borradores: number;
  };
  planes_por_dificultad: {
    facil: number;
    moderado: number;
    dificil: number;
  };
}

export interface DashboardEmprendimiento {
  reservas_hoy: number;
  reservas_pendientes: number;
  ingresos_mes: number;
  servicios_activos: number;
  total_reservas_confirmadas: number;
  reservas_proximas: Reserva[];
  servicios_populares: ServicioPopular[];
}

export interface CalendarioEvento {
  fecha: string;
  eventos: EventoCalendario[];
  total_eventos: number;
  ingresos_dia: number;
}

export interface EventoCalendario {
  tipo: 'reserva' | 'plan';
  id: number;
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  cliente?: string;
  servicio?: string;
  precio?: string;
}

export interface CalendarioEmprendimiento {
  fecha_inicio: string;
  fecha_fin: string;
  eventos_por_dia: Record<string, EventoBackend[]>;
  total_reservas: number;
  ingresos_periodo: number;
}

// Requests
export interface UpdateReservaRequest {
  usuario_id?: number;
  codigo_reserva?: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas?: string;
  servicios?: UpdateReservaServicioRequest[];
}

export interface UpdateReservaServicioRequest {
  id?: number;
  servicio_id: number;
  emprendedor_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  cantidad: number;
  precio: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas_cliente?: string;
  notas_emprendedor?: string;
}

export interface UpdateEstadoServicioRequest {
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
}

export interface AgregarEmprendedorPlanRequest {
  emprendedor_id: number;
  rol: 'organizador' | 'colaborador';
  es_organizador_principal: boolean;
  descripcion_participacion: string;
  porcentaje_ganancia: number;
}

export interface CambiarOrganizadorRequest {
  nuevo_organizador_id: number;
}

// Respuestas paginadas
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PageLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PageLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Meta información
export interface MetaPlanResponse {
  plan: {
    id: number;
    nombre: string;
  };
  mi_rol: string;
}

export interface MetaEmprendedorResponse {
  total: number;
  emprendedor: {
    id: number;
    nombre: string;
  };
  estadisticas: {
    planes_organizando: number;
    planes_colaborando: number;
    total_planes_participando: number;
    planes_activos_organizando: number;
    planes_activos_colaborando: number;
    inscripciones_planes_organizando: number;
    ingresos_estimados_total: number;
  };
}