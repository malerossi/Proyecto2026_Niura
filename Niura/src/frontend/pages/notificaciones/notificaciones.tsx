
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const URL_NOTIFICACIONES =
  "https://mocki.io/v1/8c7eab71-c0cb-499a-a291-590838e46faf";

const URL_ELIMINAR_NOTIFICACION =
  "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

// Falta configurar el Mocki para responder solicitudes médicas.
const URL_RESPONDER_SOLICITUD = "";

type TipoNotificacion =
  | "mensaje"
  | "solicitud_medico"
  | "alerta_racha";

interface Notificacion {
  id_notificacion: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha_envio: string;
  leida: boolean;
  redireccion?: {
    ruta: string;
  };
  solicitud?: {
    id_solicitud: number;
  };
  racha?: {
    dias: number;
  };
}

export default function NoticiasPaciente() {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] =
    useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(
    null
  );

  // Cargar las notificaciones desde Mocki.
  useEffect(() => {
    async function cargarNotificaciones() {
      try {
        const respuesta = await fetch(URL_NOTIFICACIONES);

        if (!respuesta.ok) {
          throw new Error(
            `Error al cargar: ${respuesta.status}`
          );
        }

        const datos: unknown = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error(
            "El backend no devolvió una lista de notificaciones"
          );
        }

        setNotificaciones(datos as Notificacion[]);
      } catch (e) {
        console.error("Error al cargar notificaciones:", e);
        setError(true);
      } finally {
        setCargando(false);
      }
    }

    cargarNotificaciones();
  }, []);

  // Las más recientes aparecen primero.
  const ordenadas = [...notificaciones].sort(
    (a, b) =>
      new Date(b.fecha_envio).getTime() -
      new Date(a.fecha_envio).getTime()
  );

  // Consultar el Mocki que confirma la eliminación.
  async function eliminarEnBack(idNotificacion: number) {
    const respuesta = await fetch(URL_ELIMINAR_NOTIFICACION);

    if (!respuesta.ok) {
      throw new Error("No se pudo confirmar la eliminación");
    }

    const datos = await respuesta.json();

    if (datos?.data !== "ok") {
      throw new Error("El backend no confirmó la operación");
    }

    // Mocki devuelve una respuesta fija: el ID sirve para
    // identificar qué notificación sacar localmente de React.
    console.log(
      "Eliminación confirmada para la notificación:",
      idNotificacion
    );
  }

  // Abrir una notificación que tiene redirección.
  async function abrirNotificacion(n: Notificacion) {
    if (!n.redireccion || procesandoId !== null) return;

    setProcesandoId(n.id_notificacion);

    try {
      await eliminarEnBack(n.id_notificacion);

      setNotificaciones((anteriores) =>
        anteriores.filter(
          (x) => x.id_notificacion !== n.id_notificacion
        )
      );

      navigate(n.redireccion.ruta);
    } catch (e) {
      console.error("Error al abrir notificación:", e);
      window.alert(
        "No se pudo confirmar la operación. Probá de nuevo."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  // Aceptar o rechazar una solicitud médica.
  async function responderSolicitud(
    n: Notificacion,
    aceptada: boolean
  ) {
    if (!n.solicitud || procesandoId !== null) return;

    if (!URL_RESPONDER_SOLICITUD) {
      window.alert(
        "Todavía falta configurar el Mocki de solicitudes médicas."
      );
      return;
    }

    setProcesandoId(n.id_notificacion);

    try {
      const respuesta = await fetch(URL_RESPONDER_SOLICITUD, {
        method: "GET",
      });

      if (!respuesta.ok) {
        throw new Error("Falló la petición");
      }

      const datos = await respuesta.json();

      if (datos?.data !== "ok") {
        throw new Error("Respuesta inesperada del servidor");
      }

      console.log("Respuesta médica:", {
        id_solicitud: n.solicitud.id_solicitud,
        aceptada,
      });

      setNotificaciones((anteriores) =>
        anteriores.filter(
          (x) => x.id_notificacion !== n.id_notificacion
        )
      );
    } catch (e) {
      console.error("Error al responder solicitud:", e);
      window.alert(
        "No se pudo procesar la solicitud. Probá de nuevo."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-[904px] px-4 sm:mt-[60px] sm:px-0">
      <div className="h-[501px] max-h-[calc(100vh-140px)] min-h-[320px] rounded-[10px] bg-[#d9eafa] px-4 py-8 shadow-[0_3px_5px_rgba(0,0,0,0.25)] sm:px-[47px] sm:pt-[47px]">
        <div className="h-full overflow-y-auto pr-4 [scrollbar-color:#d9d9d9_#d9eafa] [scrollbar-width:thin]">
          {cargando && (
            <p className="py-4 text-lg text-[#4b5c78]">
              Cargando notificaciones...
            </p>
          )}

          {error && (
            <p className="py-4 text-lg text-red-700">
              No pudimos cargar las notificaciones.
              Probá recargar la página.
            </p>
          )}

          {!cargando && !error && ordenadas.length === 0 && (
            <p className="py-4 text-lg text-black">
              No hay notificaciones.
            </p>
          )}

          {!cargando && !error && (
            <ul className="flex flex-col gap-[14px] pb-4">
              {ordenadas.map((n) => (
                <li key={n.id_notificacion}>
                  {/* MENSAJE: red de contactos */}
                  {n.tipo === "mensaje" && (
                    <button
                      type="button"
                      disabled={
                        procesandoId !== null || !n.redireccion
                      }
                      onClick={() => abrirNotificacion(n)}
                      className="flex h-[70px] w-full items-center justify-between rounded-[12px] border border-black bg-[#eadca3] px-5 text-left text-[22px] text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#e2d294] disabled:opacity-50 sm:text-[29px]"
                    >
                      <span>{n.titulo}</span>

                      <Icon
                        icon="mdi:account-group"
                        className="h-9 w-9 shrink-0 text-[#176b9b]"
                        aria-label="Red de contactos"
                      />
                    </button>
                  )}

                  {/* SOLICITUD MÉDICA: aceptar o rechazar */}
                  {n.tipo === "solicitud_medico" && (
                    <div className="flex min-h-[70px] w-full items-center justify-between gap-3 rounded-[12px] border border-black bg-[#dceafa] px-4 py-2 text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)] sm:px-5">
                      <span className="min-w-0 flex-1 text-[19px] leading-tight sm:text-[29px]">
                        {n.mensaje}
                      </span>

                      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                        <button
                          type="button"
                          disabled={procesandoId !== null}
                          onClick={() =>
                            responderSolicitud(n, false)
                          }
                          aria-label="Rechazar solicitud"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d40000] text-white hover:bg-[#ad0000] disabled:opacity-50 sm:h-11 sm:w-11"
                        >
                          <Icon
                            icon="mdi:close"
                            className="h-8 w-8"
                          />
                        </button>

                        <button
                          type="button"
                          disabled={procesandoId !== null}
                          onClick={() =>
                            responderSolicitud(n, true)
                          }
                          aria-label="Aceptar solicitud"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#079f9e] text-white hover:bg-[#087f7e] disabled:opacity-50 sm:h-11 sm:w-11"
                        >
                          <Icon
                            icon="mdi:check"
                            className="h-8 w-8"
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* RACHA: llama y días */}
                  {n.tipo === "alerta_racha" && (
                    <button
                      type="button"
                      disabled={
                        procesandoId !== null || !n.redireccion
                      }
                      onClick={() => abrirNotificacion(n)}
                      className="flex h-[70px] w-full items-center justify-between gap-3 rounded-[12px] border border-black bg-[#dceafa] px-5 text-left text-[21px] text-black shadow-[0_3px_4px_rgba(0,0,0,0.3)] transition-colors hover:bg-[#cbdff8] disabled:opacity-50 sm:text-[29px]"
                    >
                      <span>{n.mensaje}</span>

                      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                        <Icon
                          icon="noto:fire"
                          className="absolute h-12 w-12"
                        />

                        <span className="absolute bottom-0 text-[23px] font-bold leading-none text-[#ffcf36] [text-shadow:-1px_-1px_0_#172d48,1px_-1px_0_#172d48,-1px_1px_0_#172d48,1px_1px_0_#172d48]">
                          {n.racha?.dias ?? 0}
                        </span>
                      </span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
