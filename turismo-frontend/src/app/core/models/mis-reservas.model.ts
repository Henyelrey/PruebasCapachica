import { Reserva, ReservaServicio, Emprendedor } from '../services/turismo.service';

export interface ReservaDetallada extends Reserva {
  // Propiedades calculadas adicionales
  proximaFecha?: string;
  tiempoRestante?: string;
  totalPrecio?: number;
  puedeSerCancelada?: boolean;
  puedeSerModificada?: boolean;
}

export interface ServicioReservaDetallado extends ReservaServicio {
  // Información adicional del servicio
  puedeEditarHorario?: boolean;
  hayConflictos?: boolean;
  sugerenciasHorario?: string[];
}

export interface EstadisticasReservas {
  total: number;
  pendientes: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  valorTotal?: number;
  proximasReservas?: number;
}

export interface FiltrosReservas {
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | '';
  fechaDesde?: string;
  fechaHasta?: string;
  emprendedor?: string;
  servicio?: string;
  busqueda?: string;
}

export interface EdicionHorario {
  servicioReservaId: number;
  servicioId: number;
  fechaOriginal: string;
  horaInicioOriginal: string;
  horaFinOriginal: string;
  fechaNueva: string;
  horaInicioNueva: string;
  horaFinNueva: string;
  duracionMinutos: number;
  verificandoDisponibilidad: boolean;
  disponible: boolean | null;
  mensajeDisponibilidad?: string;
}

export interface ChatReserva {
  reservaId: number;
  emprendedorId: number;
  emprendedorNombre: string;
  emprendedorAvatar?: string;
  mensajes: MensajeChatReserva[];
  noLeidos: number;
  activo: boolean;
}

export interface MensajeChatReserva {
  id: number;
  reservaId: number;
  usuarioId: number;
  emprendedorId: number;
  mensaje: string;
  emisor: 'usuario' | 'emprendedor';
  leido: boolean;
  fechaEnvio: string;
  tipo?: 'texto' | 'imagen' | 'archivo';
  archivo?: {
    nombre: string;
    url: string;
    tipo: string;
  };
}

export interface PagoReserva {
  reservaId: number;
  codigoReserva: string;
  montoTotal: number;
  metodoPago: 'yape' | 'visa' | 'mastercard' | 'efectivo';
  estadoPago: 'pendiente' | 'procesando' | 'completado' | 'fallido';
  transaccionId?: string;
  fechaPago?: string;
  comprobante?: string;
}

export interface NotificacionReserva {
  id: number;
  reservaId: number;
  tipo: 'recordatorio' | 'confirmacion' | 'cancelacion' | 'cambio_horario' | 'mensaje_emprendedor';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  accion?: {
    tipo: 'ver_reserva' | 'responder_chat' | 'confirmar_cambio';
    url?: string;
  };
}

export interface HistorialCambios {
  id: number;
  reservaId: number;
  servicioReservaId?: number;
  tipoCambio: 'estado_reserva' | 'estado_servicio' | 'horario' | 'notas' | 'pago';
  valorAnterior: any;
  valorNuevo: any;
  razon?: string;
  realizadoPor: 'usuario' | 'emprendedor' | 'sistema';
  fechaCambio: string;
}

export interface ConfiguracionNotificaciones {
  recordatorios: boolean;
  mensajesEmprendedor: boolean;
  cambiosHorario: boolean;
  confirmaciones: boolean;
  promociones: boolean;
  tiempoAnticipacion: number; // en horas
}

// Interfaces para respuestas del API
export interface ApiResponseReservas {
  success: boolean;
  data: ReservaDetallada[];
  meta?: {
    total: number;
    página: number;
    porPagina: number;
    totalPaginas: number;
  };
  message?: string;
}

export interface ApiResponseEstadisticas {
  success: boolean;
  data: EstadisticasReservas;
  message?: string;
}

export interface ApiResponseDisponibilidad {
  success: boolean;
  disponible: boolean;
  alternativas?: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }[];
  message?: string;
}

export interface ApiResponsePago {
  success: boolean;
  data: {
    transaccionId: string;
    urlPago?: string;
    qrCode?: string;
    instrucciones?: string;
  };
  message?: string;
}

// Tipos para validaciones
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
export type EstadoServicio = 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
export type MetodoPago = 'yape' | 'visa' | 'mastercard' | 'efectivo';
export type TipoNotificacion = 'recordatorio' | 'confirmacion' | 'cancelacion' | 'cambio_horario' | 'mensaje_emprendedor';

// Constantes
export const ESTADOS_RESERVA: { [key in EstadoReserva]: string } = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada'
};

export const ESTADOS_SERVICIO: { [key in EstadoServicio]: string } = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  completado: 'Completado'
};

export const METODOS_PAGO: { [key in MetodoPago]: string } = {
  yape: 'Yape',
  visa: 'Visa',
  mastercard: 'Mastercard',
  efectivo: 'Efectivo'
};

// Utilidades para validaciones
export class ReservaValidaciones {
  static puedeSerCancelada(reserva: ReservaDetallada): boolean {
    const ahora = new Date();
    const fechaServicio = new Date(reserva.fecha_inicio || '');
    const horasRestantes = (fechaServicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return ['pendiente', 'confirmada'].includes(reserva.estado) && horasRestantes > 24;
  }

  static puedeSerModificada(reserva: ReservaDetallada): boolean {
    const ahora = new Date();
    const fechaServicio = new Date(reserva.fecha_inicio || '');
    const horasRestantes = (fechaServicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return ['pendiente', 'confirmada'].includes(reserva.estado) && horasRestantes > 48;
  }

  static puedeEditarHorarioServicio(servicio: ServicioReservaDetallado): boolean {
    const ahora = new Date();
    const fechaServicio = new Date(servicio.fecha_inicio);
    const horasRestantes = (fechaServicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    return ['pendiente', 'confirmado'].includes(servicio.estado) && horasRestantes > 48;
  }

  static calcularTiempoRestante(fechaInicio: string): string {
    const ahora = new Date();
    const fecha = new Date(fechaInicio);
    const diferencia = fecha.getTime() - ahora.getTime();
    
    if (diferencia <= 0) {
      return 'Vencido';
    }
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (dias > 0) {
      return `${dias}d ${horas}h`;
    } else if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  static obtenerProximaFecha(servicios: ServicioReservaDetallado[]): string | undefined {
    const fechasValidas = servicios
      .filter(s => s.estado !== 'cancelado')
      .map(s => new Date(s.fecha_inicio))
      .filter(f => f > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    
    return fechasValidas.length > 0 ? fechasValidas[0].toISOString() : undefined;
  }
}

// Helpers para UI
export class ReservaUIHelpers {
  static getEstadoClasses(estado: EstadoReserva | EstadoServicio): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    const colorClasses = {
      pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      confirmada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      confirmado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completada: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completado: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    
    return `${baseClasses} ${colorClasses[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`;
  }

  static getEstadoIcon(estado: EstadoReserva | EstadoServicio): string {
    const icons = {
      pendiente: '⏳',
      confirmada: '✅',
      confirmado: '✅', 
      completada: '🎉',
      completado: '🎉',
      cancelada: '❌',
      cancelado: '❌'
    };
    
    return icons[estado] || '❓';
  }

  static getPrioridadUrgencia(fechaInicio: string): 'alta' | 'media' | 'baja' {
    const ahora = new Date();
    const fecha = new Date(fechaInicio);
    const horasRestantes = (fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    
    if (horasRestantes < 24) return 'alta';
    if (horasRestantes < 72) return 'media';
    return 'baja';
  }

  static formatearFecha(fecha: string, formato: 'completo' | 'corto' | 'relativo' = 'completo'): string {
    const date = new Date(fecha);
    const ahora = new Date();
    
    switch (formato) {
      case 'corto':
        return date.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      
      case 'relativo':
        const diferenciaDias = Math.floor((date.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
        if (diferenciaDias === 0) return 'Hoy';
        if (diferenciaDias === 1) return 'Mañana';
        if (diferenciaDias === -1) return 'Ayer';
        if (diferenciaDias > 1) return `En ${diferenciaDias} días`;
        if (diferenciaDias < -1) return `Hace ${Math.abs(diferenciaDias)} días`;
        return date.toLocaleDateString('es-PE');
      
      case 'completo':
      default:
        return date.toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    }
  }

  static formatearHora(hora: string): string {
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const periodo = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum > 12 ? horaNum - 12 : horaNum === 0 ? 12 : horaNum;
    
    return `${hora12}:${minutos} ${periodo}`;
  }
}