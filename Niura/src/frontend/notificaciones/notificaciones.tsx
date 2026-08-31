import * as React from 'react';

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
  fecha_envio: string;
  leida: boolean;
  redireccion?: Redireccion;
}

const BotonNotificacion = () => {
  const notificacionRacha: DatosBackNotificacion = {
    id_notificacion: 1,
    tipo: 'alerta_racha',
    prioridad: 'media',
    titulo: '¡No pierdas tu racha! 🔥',
    mensaje: 'Hoy todavía no completaste tu actividad.',
    remitente: {
      nombre: 'Sistema',
      apellido: '',
      avatar_url: '/logo.png',
    },
    fecha_envio: new Date().toISOString(),
    leida: false,
    redireccion: {
      ruta: '/racha',
      id_referencia: 1,
    },
  };

  const mandarNotificacion = async () => {
    // 1. Validar soporte de notificaciones
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones');
      return;
    }

    // 2. Pedir permisos
    const permiso = await Notification.requestPermission();

    if (permiso !== 'granted') {
      console.log('El usuario no permitió las notificaciones');
      return;
    }

    const opciones: NotificationOptions = {
      body: notificacionRacha.mensaje,
      icon: notificacionRacha.remitente.avatar_url,
      tag: 'alerta-racha',
      data: notificacionRacha.redireccion,
    };

    // 3. Método para celulares (a través de Service Worker)
    if ('serviceWorker' in navigator) {
      const registro = await navigator.serviceWorker.ready;
      if (registro && registro.showNotification) {
        await registro.showNotification(notificacionRacha.titulo, opciones);
        return;
      }
    }

    // 4. Fallback para PC si no hay Service Worker activo
    const notificacion = new Notification(notificacionRacha.titulo, opciones);

    notificacion.onclick = () => {
      if (notificacionRacha.redireccion) {
        window.location.href = notificacionRacha.redireccion.ruta;
      }
    };
  };

  return (
    <button onClick={mandarNotificacion}>
      Probar notificación de racha 🔥
    </button>
  );
};

export default BotonNotificacion;