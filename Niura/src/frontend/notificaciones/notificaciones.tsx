
import * as React from 'react';

export type TipoNotificacion =
  | 'emergencia_ambulancia'
  | 'solicitud_vinculo'
  | 'mensaje_chat'
  | 'alerta_racha';

export type PrioridadNotificacion =
  | 'alta'
  | 'media'
  | 'baja';

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
  fecha_envio: string;
  leida: boolean;
  redireccion?: Redireccion;
}


const Html = () => {

  // Esta función simula una notificación
  // que posteriormente vendría desde tu backend.
  const notificacionRacha: DatosBackNotificacion = {
    id_notificacion: 1,

    tipo: 'alerta_racha',

    prioridad: 'media',

    titulo: '¡No pierdas tu racha! 🔥',

    mensaje: 'Hoy todavía no completaste tu actividad.',

    remitente: {
      nombre: 'Sistema',
      apellido: '',
      avatar_url: '/logo.png'
    },

    fecha_envio: new Date().toISOString(),

    leida: false,

    redireccion: {
      ruta: '/racha',
      id_referencia: 1
    }
  };


  const mandarNotificacion = async () => {

    const permiso = await Notification.requestPermission();

    if (permiso !== 'granted') {
      console.log('El usuario no permitió las notificaciones');
      return;
    }


    // Creamos la notificación usando
    // los datos que tenemos en nuestro objeto.
    const notificacion = new Notification(
      notificacionRacha.titulo,
      {
        body: notificacionRacha.mensaje,

        icon: notificacionRacha.remitente.avatar_url,

        tag: 'alerta-racha',

        data: notificacionRacha.redireccion
      }
    );


    // Detectamos cuando el usuario toca
    // la notificación.
    notificacion.onclick = () => {

      if (notificacionRacha.redireccion) {

        window.location.href =
          notificacionRacha.redireccion.ruta;

      }

    };

  };


  return (
    <button onClick={mandarNotificacion}>
      Probar notificación de racha 🔥
    </button>
  );
};


export default Html;

