// src/app/core/models/plan.model.ts
export interface Plan {
  id?: number;
  nombre: string;
  descripcion: string;
  que_incluye?: string;
  capacidad: number;
  duracion_dias: number;
  es_publico?: boolean;
  estado: 'activo' | 'inactivo' | 'borrador';
  creado_por_usuario_id?: number;
  emprendedor_id?: number; // Legacy - mantener por compatibilidad
  precio_total?: number;
  dificultad: 'facil' | 'moderado' | 'dificil';
  requerimientos?: string;
  que_llevar?: string;
  imagen_principal?: string;
  imagen_principal_url?: string;
  imagenes_galeria?: string[];
  imagenes_galeria_urls?: string[];
  cupos_disponibles?: number;
  total_emprendedores?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  creado_por?: {
    id: number;
    name: string;
    email: string;
  };
  
  // Legacy - mantener por compatibilidad
  emprendedor?: {
    id: number;
    nombre: string;
    ubicacion: string;
    telefono?: string;
    email?: string;
  };
  
  // NUEVAS RELACIONES PARA MÚLTIPLES EMPRENDEDORES
  emprendedores?: PlanEmprendedor[];
  emprendedores_organizadores?: PlanEmprendedor[];
  emprendedores_colaboradores?: PlanEmprendedor[];
  organizador_principal?: {
    id: number;
    nombre: string;
    ubicacion: string;
    telefono?: string;
    email?: string;
  };
  
  // Información específica del emprendedor actual (cuando se consulta desde emprendedor)
  mi_rol?: {
    rol: 'organizador' | 'colaborador';
    es_organizador_principal: boolean;
    descripcion_participacion?: string;
    porcentaje_ganancia?: number;
    puede_gestionar_inscripciones: boolean;
    puede_editar_plan: boolean;
  };
  
  dias?: PlanDia[];
  inscripciones?: PlanInscripcion[];
  resumen?: {
    total_dias: number;
    total_servicios: number;
    precio_calculado: number;
    inscripciones_activas: number;
    cupos_disponibles: number;
    total_emprendedores: number;
    organizador_principal: string;
  };
}

// NUEVA INTERFAZ: Emprendedor en un plan con su rol
export interface PlanEmprendedor {
  id: number;
  nombre: string;
  ubicacion: string;
  telefono?: string;
  email?: string;
  rol: 'organizador' | 'colaborador';
  es_organizador_principal: boolean;
  descripcion_participacion?: string;
  porcentaje_ganancia?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlanDia {
  id?: number;
  plan_id?: number;
  numero_dia: number;
  titulo: string;
  descripcion: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_estimada_minutos?: number;
  notas_adicionales?: string;
  orden?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  servicios?: PlanDiaServicio[];
  duracion_total?: number;
  precio_servicios_opcionales?: number;
}

export interface PlanDiaServicio {
  id?: number;
  plan_dia_id?: number;
  servicio_id: number;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_minutos?: number;
  notas?: string;
  orden?: number;
  es_opcional?: boolean;
  precio_adicional?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relación con servicio
  servicio?: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    emprendedor?: {
      id: number;
      nombre: string;
    };
  };
  duracion_calculada?: number;
}

export interface PlanInscripcion {
  id?: number;
  plan_id: number;
  usuario_id: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'en_progreso';
  notas?: string;
  fecha_inscripcion?: string;
  fecha_inicio_plan?: string;
  fecha_fin_plan?: string;
  notas_usuario?: string;
  requerimientos_especiales?: string;
  numero_participantes: number;
  precio_pagado?: number;
  metodo_pago?: 'efectivo' | 'transferencia' | 'tarjeta' | 'yape' | 'plin';
  comentarios_adicionales?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones
  plan?: Plan;
  usuario?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  precio_total_calculado?: number;
  dias_para_inicio?: number;
}

export interface PlanFiltros {
  emprendedor_id?: number;
  organizador_id?: number; // NUEVO: filtrar por organizador principal
  estado?: string;
  es_publico?: boolean;
  dificultad?: string;
  buscar?: string;
  con_cupos?: boolean;
  duracion_min?: number;
  duracion_max?: number;
  precio_min?: number;
  precio_max?: number;
  todos?: boolean;
  per_page?: number;
  page?: number;
}

export interface PlanEstadisticas {
  total_inscripciones: number;
  inscripciones_confirmadas: number;
  inscripciones_pendientes: number;
  inscripciones_canceladas: number;
  total_participantes: number;
  ingresos_totales: number;
  promedio_participantes_por_inscripcion: number;
  cupos_disponibles: number;
  porcentaje_ocupacion: number;
  total_emprendedores: number; // NUEVO
  organizador_principal: string; // NUEVO
}

export interface EstadisticasGenerales {
  total_planes: number;
  planes_activos: number;
  planes_publicos: number;
  total_inscripciones: number;
  inscripciones_confirmadas: number;
  inscripciones_pendientes: number;
  ingresos_totales: number;
  emprendedores_con_planes: number;
  
  // NUEVAS ESTADÍSTICAS
  emprendedores_organizadores: number;
  emprendedores_colaboradores: number;
  planes_colaborativos: number;
  
  planes_por_dificultad: {
    facil: number;
    moderado: number;
    dificil: number;
  };
  planes_por_estado: {
    activos: number;
    inactivos: number;
    borradores: number;
  };
}

export interface InscripcionFiltros {
  estado?: string;
  plan_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  per_page?: number;
  page?: number;
}

// Interfaces para formularios
export interface PlanFormData {
  nombre: string;
  descripcion: string;
  que_incluye?: string;
  capacidad: number;
  duracion_dias: number;
  es_publico: boolean;
  estado: 'activo' | 'inactivo' | 'borrador';
  emprendedor_id?: number; // Legacy - mantener por compatibilidad
  precio_total?: number;
  dificultad: 'facil' | 'moderado' | 'dificil';
  requerimientos?: string;
  que_llevar?: string;
  imagen_principal?: File;
  imagenes_galeria?: File[];
  
  // NUEVOS CAMPOS PARA MÚLTIPLES EMPRENDEDORES
  emprendedores: PlanEmprendedorFormData[];
  
  dias: PlanDiaFormData[];
}

// NUEVA INTERFAZ: Datos de emprendedor para el formulario
export interface PlanEmprendedorFormData {
  emprendedor_id: number;
  rol: 'organizador' | 'colaborador';
  es_organizador_principal: boolean;
  descripcion_participacion?: string;
  porcentaje_ganancia?: number;
}

export interface PlanDiaFormData {
  numero_dia: number;
  titulo: string;
  descripcion: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_estimada_minutos?: number;
  notas_adicionales?: string;
  orden?: number;
  servicios: PlanDiaServicioFormData[];
}

export interface PlanDiaServicioFormData {
  servicio_id: number;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_minutos?: number;
  notas?: string;
  orden?: number;
  es_opcional?: boolean;
  precio_adicional?: number;
}

// NUEVAS INTERFACES PARA GESTIÓN DE EMPRENDEDORES EN PLANES

export interface EmprendedorDisponible {
  id: number;
  nombre: string;
  ubicacion: string;
  telefono?: string;
  email?: string;
}

export interface PlanEmprendedorRequest {
  emprendedor_id: number;
  rol: 'organizador' | 'colaborador';
  es_organizador_principal?: boolean;
  descripcion_participacion?: string;
  porcentaje_ganancia?: number;
}

export interface EmprendedorPlanesResponse {
  data: Plan[];
  meta: {
    total: number;
    emprendedor: {
      id: number;
      nombre: string;
    };
    estadisticas: EmprendedorEstadisticasPlanes;
  };
}

export interface EmprendedorEstadisticasPlanes {
  planes_organizando: number;
  planes_colaborando: number;
  total_planes_participando: number;
  planes_activos_organizando: number;
  planes_activos_colaborando: number;
  inscripciones_planes_organizando: number;
  ingresos_estimados_total: number;
}