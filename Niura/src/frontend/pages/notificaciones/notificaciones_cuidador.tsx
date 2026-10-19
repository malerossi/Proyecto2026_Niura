import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/* ================================================================== */
/* TIPOS: así llega cada notificación del back                         */
/* ================================================================== */
export type TipoNotificacion =
  | "emergencia_ambulancia"
  | "solicitud_vinculo"
  | "mensaje_chat"
  | "alerta_racha";

export type PrioridadNotificacion = "alta" | "media" | "baja";

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
  redireccion?: Redireccion; // por ahora no se usa en esta pantalla
}

/* ================================================================== */
/* BACK (mocki)                                                        */
/*                                                                     */
/* Formato propuesto para el back real:                                */
/*  GET notificaciones → DatosBackNotificacion[]                       */
/*  (todas las notificaciones, directamente la lista, sin objeto       */
/*   alrededor)                                                        */
/* ================================================================== */
// Pegá acá tu URL de mocki
const URL_NOTIFICACIONES = "https://mocki.io/v1/106ec522-2111-4490-805b-040b1e6e69a1";

async function pedirNotificaciones() {
  const respuesta = await fetch(URL_NOTIFICACIONES);
  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
  return respuesta.json();
}

/* ================================================================== */
/* PANTALLA                                                            */
/* ================================================================== */
const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

export default function Noticias() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [notificaciones, setNotificaciones] = useState<DatosBackNotificacion[]>([]);

  // Al entrar: pedir las notificaciones (una sola vez)
  useEffect(() => {
    pedirNotificaciones()
      .then((lista) => {
        // Tiene que ser una lista; si no, la pantalla se rompería
        if (!Array.isArray(lista)) throw new Error("El back no devolvió una lista de notificaciones");
        setNotificaciones(lista);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      })
      .finally(() => setCargando(false));
  }, []);

  // Las más nuevas arriba
  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime(),
  );

  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*903)] max-w-full font-[Helvetica,Arial,sans-serif]"
    >
      <div className="min-h-[calc(var(--u)*500)] rounded-[calc(var(--u)*10)] bg-[#b3d9e6] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:pb-[calc(var(--u)*40)] md:pl-[calc(var(--u)*47)] md:pt-[calc(var(--u)*68)]">
        {cargando && (
          <p className="text-[length:calc(var(--u)*22)] text-[#4b5c78]">Cargando notificaciones…</p>
        )}
        {error && (
          <p className="text-[length:calc(var(--u)*22)] text-[#a32020]">
            No pudimos cargar las notificaciones. Probá recargar la página.
          </p>
        )}
        {!cargando && !error && ordenadas.length === 0 && (
          <p className="text-[length:calc(var(--u)*22)] text-black">No hay notificaciones.</p>
        )}

        <ul className="flex w-[calc(var(--u)*655)] max-w-full flex-col gap-[calc(var(--u)*12)]">
          {ordenadas.map((n) => (
            <li
              key={n.id_notificacion}
              className="rounded-[calc(var(--u)*10)] bg-[#ddeafd] px-[calc(var(--u)*23)] py-[calc(var(--u)*10)] shadow-[0_3px_4px_rgba(0,0,0,0.3)]"
            >
              <p className="text-[length:calc(var(--u)*15)] font-bold uppercase leading-tight text-black">
                {n.remitente.nombre}
              </p>
              <p className="mt-[calc(var(--u)*6)] text-[length:calc(var(--u)*14)] leading-tight text-black">
                {n.mensaje}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}