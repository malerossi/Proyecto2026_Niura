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
  // 1. Registrar el Service Worker automáticamente al cargar el componente
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registrado con éxito:', reg.scope))
        .catch((err) => alert('Error registrando Service Worker: ' + err));
    }
  }, []);

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
    try {
      // 2. Validar soporte en el dispositivo
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('Este navegador no soporta Notificaciones o Service Worker.');
        return;
      }

      // 3. Solicitar permiso de forma sincrónica con el tap del usuario
      let permiso = Notification.permission;
      if (permiso !== 'granted') {
        permiso = await Notification.requestPermission();
      }

      if (permiso !== 'granted') {
        alert('Permiso denegado. Habilita las notificaciones en el navegador.');
        return;
      }

      // 4. Garantizar que el Service Worker esté 100% LISTO y ACTIVO en Android
      const registro = await navigator.serviceWorker.ready;

      // 5. Configurar opciones nativas para Android / Samsung
      const opciones: NotificationOptions & { vibrate?: number[] } = {
        body: notificacionRacha.mensaje,
        //icon: notificacionRacha.remitente.avatar_url,
        //badge: notificacionRacha.remitente.avatar_url,
        tag: 'alerta-racha',
        vibrate: [200, 100, 200], // Patrón de vibración hápico
        data: notificacionRacha.redireccion,
      };

      // 6. Lanzar la notificación desde el registro activo
      await registro.showNotification(notificacionRacha.titulo, opciones);
    } catch (error: any) {
      alert('Error en Android al mostrar notificación: ' + (error?.message || error));
    }
  };

  return (
    <button onClick={mandarNotificacion}>
      Probar notificación de racha 🔥
    </button>
  );
};

export default BotonNotificacion;