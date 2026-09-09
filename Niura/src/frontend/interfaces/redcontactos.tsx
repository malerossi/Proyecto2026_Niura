export type TipoMensaje = 'texto' | 'imagen' | 'audio' | 'archivo' ;
export type EstadoEntrega = 'enviando' | 'enviado' | 'entregado' | 'leido' | 'error';
export interface AdjuntoMensaje {
  id_adjunto: string;
  tipo_mime: string;
  url: string;            
  nombre_archivo: string;
  tamano_bytes: number;
}
export interface Mensaje {
  id_mensaje: string;            
  id_conversacion: string;       
  id_emisor: number;
  id_receptor: number;
  tipo: TipoMensaje;
  contenido: string;             
  adjunto?: AdjuntoMensaje;
  estado_entrega: EstadoEntrega
  id_mensaje_referenciado?: string; 
  eliminado: boolean; 
  fecha_envio: string;}
export interface Conversacion {
  id_conversacion: string;
  id_contacto: number;
  nombre_contacto: string;
  avatar_contacto: string;
  estado_presencia: 'online' | 'offline';
  mensajes_no_leidos: number;
  mensajes: Mensaje[]
}