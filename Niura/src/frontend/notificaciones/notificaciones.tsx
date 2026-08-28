export type TipoNotificacion = 
  | 'emergencia_ambulancia' 
  | 'solicitud_vinculo' 
  | 'mensaje_chat' 
  | 'alerta_racha';

export type PrioridadNotificacion = 'alta' | 'media' | 'baja';

export interface Remitente {
  nombre: string;
  apellido: string;
  avatar_url: string;
}

export interface Redireccion {
  ruta: string;
  id_referencia: number;
}

export interface DatosBackNotificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  titulo: string;
  mensaje: string;
  remitente: Remitente;
  fecha_envio: string; // ISO String al recibir del backend
  leida: boolean;
  redireccion?: Redireccion;
}