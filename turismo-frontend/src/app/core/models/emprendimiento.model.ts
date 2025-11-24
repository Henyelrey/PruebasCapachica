// src/app/core/models/emprendimiento.model.ts

import { User, Slider } from './user.model';

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
  capacidad: number; // Campo agregado como requerido
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

export interface AdminRequest {
  email: string;
  rol: string;
  es_principal: boolean;
}

// Modelo para servicios populares en el dashboard
export interface ServicioPopular {
  servicio_id: number;
  total_reservas: number;
  ingresos_generados: string;
  ingresos_totales: string;
  nombre: string;
  servicio: {
    id: number;
    nombre: string;
    precio_referencial?: string;
  };
}

export interface CalendarioEmprendimiento {
  fecha_inicio: string;
  fecha_fin: string;
  eventos_por_dia: Record<string, EventoBackend[]>; // Más específico y type-safe
  total_reservas: number;
  ingresos_periodo: number;
}

// Modelo que coincide exactamente con la respuesta del backend
export interface EventoBackend {
  id: number;
  titulo: string;
  cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  precio: string;
  notas_cliente?: string;
  duracion_minutos: number;
}

// Modelo transformado para uso en el frontend
export interface EventoCalendario {
  id: number;
  titulo: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  cliente?: string;
  servicio?: string;
  precio?: string;
  tipo: 'reserva' | 'plan';
}

// Mantener estos modelos para compatibilidad (aunque no se usen actualmente)
export interface CalendarioEvento {
  fecha: string;
  eventos: EventoCalendario[];
  total_eventos: number;
  ingresos_dia: number;
}