import { useEffect, useId, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
// Ajustá la ruta según dónde guardes este archivo
import { usePaciente } from "../../Contexts/contextPaciente";

/* ------------------------------------------------------------------ */
/* Escala: misma técnica que Elegirusuario. Todo se mide en "--u"      */
/* (1u = 1px del diseño de 1366x768) para que escale con la pantalla.  */
/* ------------------------------------------------------------------ */
const ESCALA = 1;
const estiloEscala = {
  "--u": `max(0.55px, calc(min(100vw / 1366, 100vh / 768) * ${ESCALA}))`,
} as CSSProperties;

/* Endpoint que devuelve el perfil. Debe responder un JSON así:
   { "correo": "alguien@mail.com", "imagen": "https://...jpg" }
   ("imagen" puede venir vacía o no venir si la persona no tiene foto). */
const URL_PERFIL = "https://mocki.io/v1/fd125f8b-20ed-4509-8051-f34005b873d8";

/* Endpoint que cambia el correo. */
const URL_CAMBIAR_CORREO =
  "https://mocki.io/v1/d42ede49-cf64-42f1-8da6-d7f40d7236b5";

/* SOLO PRUEBAS: mocki no acepta POST, así que usamos GET.
   Pasalo a false cuando tengas el back real. */
const USAR_GET_PRUEBA = true;

/* Validación simple de formato; la validación real la hace el back. */
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Usuario de prueba ----------
   Si no hay sesión iniciada, en desarrollo entramos con este usuario para
   poder probar la pantalla sin pasar por el login.
   import.meta.env.DEV es true con `npm run dev` y false en el build de
   producción, así que no hay que acordarse de apagarlo. */
const PERMITIR_USUARIO_PRUEBA = import.meta.env.DEV;
const NOMBRE_PRUEBA = "Usuario de prueba";
const PERFIL_PRUEBA = {
  correo: "usuario.prueba@niura.com",
  imagen: null as string | null, // null = círculo gris
};

type EstadoPerfil = "cargando" | "listo" | "error";
type EstadoEnvio = "reposo" | "enviando" | "exito" | "error";

function IconoCambiar(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h15" />
      <path d="M16 5l4 4-4 4" />
      <path d="M20 15H5" />
      <path d="M8 11l-4 4 4 4" />
    </svg>
  );
}

const CLASE_BOTON_PRIMARIO =
  "flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*8)] rounded-lg bg-[#0480cc] px-[calc(var(--u)*10)] text-[length:calc(var(--u)*22)] font-bold text-[#e8f1fc] transition-colors hover:bg-[#0670b3] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const CLASE_BOTON_SECUNDARIO =
  "flex h-[calc(var(--u)*48)] items-center rounded-lg border border-[#e8f1fc]/60 px-[calc(var(--u)*14)] text-[length:calc(var(--u)*20)] text-[#e8f1fc] transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const CLASE_TARJETA =
  "flex flex-col items-center gap-[calc(var(--u)*32)] rounded-[calc(var(--u)*10)] bg-[#18243b] px-[calc(var(--u)*24)] py-[calc(var(--u)*40)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] md:min-h-[calc(var(--u)*319)] md:flex-row md:items-center md:justify-between md:px-[calc(var(--u)*77)] md:py-[calc(var(--u)*40)]";

export default function PerfilPaciente() {
  const navigate = useNavigate();
  const { nombre: nombreSesion } = usePaciente();

  // Si no hay sesión y estamos en desarrollo, usamos el usuario de prueba.
  // `esPrueba` sirve para avisar en pantalla que NO es una persona real.
  const esPrueba = !nombreSesion && PERMITIR_USUARIO_PRUEBA;
  const nombre = nombreSesion || (esPrueba ? NOMBRE_PRUEBA : "");

  const idInput = useId();
  const idMensaje = useId();

  // Datos que vienen del back
  const [correoActual, setCorreoActual] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [estadoPerfil, setEstadoPerfil] = useState<EstadoPerfil>("cargando");
  const [intento, setIntento] = useState(0); // cambiarlo vuelve a disparar la carga

  // Edición de correo
  const [editando, setEditando] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>("reposo");
  const [mensaje, setMensaje] = useState("");

  const enviando = estadoEnvio === "enviando";

  /* ---------- Cargar perfil (correo + imagen) al entrar ---------- */
  useEffect(() => {
    if (!nombre) return; // sin usuario no hay nada que pedir

    // AbortController: si la persona se va de la página (o cambia el nombre)
    // antes de que responda el back, cancelamos y no actualizamos estado
    // de un componente que ya no existe.
    const controlador = new AbortController();
    setEstadoPerfil("cargando");

    (async () => {
      try {
        const respuesta = await fetch(
          `${URL_PERFIL}?usuario=${encodeURIComponent(nombre)}`,
          { signal: controlador.signal },
        );
        if (!respuesta.ok) throw new Error(`Estado ${respuesta.status}`);

        const datos: unknown = await respuesta.json();
        const { correo, imagen } = (datos ?? {}) as {
          correo?: unknown;
          imagen?: unknown;
        };

        // Si el back no mandó un correo válido, lo tratamos como error
        if (typeof correo !== "string" || !correo) {
          throw new Error("Respuesta sin correo");
        }

        setCorreoActual(correo);
        setFotoUrl(typeof imagen === "string" && imagen ? imagen : null);
        setEstadoPerfil("listo");
      } catch {
        if (controlador.signal.aborted) return; // cancelado a propósito, no es error

        // El back no conoce al usuario de prueba, así que si falla usamos
        // sus datos locales en vez de mostrar un error.
        if (esPrueba) {
          setCorreoActual(PERFIL_PRUEBA.correo);
          setFotoUrl(PERFIL_PRUEBA.imagen);
          setEstadoPerfil("listo");
          return;
        }
        setEstadoPerfil("error");
      }
    })();

    return () => controlador.abort();
  }, [nombre, esPrueba, intento]);

  /* ---------- Cambio de correo ---------- */
  function abrirEdicion() {
    setNuevoCorreo("");
    setEstadoEnvio("reposo");
    setMensaje("");
    setEditando(true);
  }

  function cancelarEdicion() {
    if (enviando) return;
    setEditando(false);
    setEstadoEnvio("reposo");
    setMensaje("");
  }

  async function guardarCorreo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return; // evita doble envío

    const correoLimpio = nuevoCorreo.trim();

    // Validamos ANTES de pegarle al back: ahorra una request inútil
    if (!REGEX_CORREO.test(correoLimpio)) {
      setEstadoEnvio("error");
      setMensaje("Ingresá un correo válido, por ejemplo nombre@dominio.com.");
      return;
    }
    if (correoLimpio.toLowerCase() === correoActual.toLowerCase()) {
      setEstadoEnvio("error");
      setMensaje("El nuevo correo es igual al actual.");
      return;
    }

    setEstadoEnvio("enviando");
    setMensaje("");

    try {
      const respuesta = USAR_GET_PRUEBA
        ? // Mocki solo acepta GET: mandamos los datos en la URL
          await fetch(
            `${URL_CAMBIAR_CORREO}?usuario=${encodeURIComponent(nombre)}&nuevoCorreo=${encodeURIComponent(correoLimpio)}`,
          )
        : // Back real: POST con los datos en el body
          await fetch(URL_CAMBIAR_CORREO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: nombre, nuevoCorreo: correoLimpio }),
          });

      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status}`);
      }

      // ---- SOLO PARA PRUEBAS: borrar este bloque cuando esté el back real ----
      // El mocki responde {"data":"ok"}; si no viene eso, lo tratamos como error.
      const cuerpo: unknown = await respuesta.json();
      if ((cuerpo as { data?: unknown } | null)?.data !== "ok") {
        throw new Error("Respuesta inesperada del servidor");
      }
      // ---- FIN BLOQUE DE PRUEBAS ----

      // Solo si el back confirmó, actualizamos lo que ve la persona
      setCorreoActual(correoLimpio);
      setEditando(false);
      setEstadoEnvio("exito");
      setMensaje("Correo actualizado.");
    } catch (error) {
      console.error("Error al cambiar el correo:", error); // mirá la consola (F12)
      setEstadoEnvio("error");
      setMensaje("No se pudo cambiar el correo. Probá de nuevo en un momento.");
    }
  }

  /* ---------- Sin usuario en el contexto ----------
     Pasa, por ejemplo, al recargar la página: el estado de React se pierde. */
  if (!nombre) {
    return (
      <section
        style={estiloEscala}
        className="mx-auto w-[calc(var(--u)*1026)] max-w-full font-[Helvetica,Arial,sans-serif]"
      >
        <div className={`${CLASE_TARJETA} md:justify-center`}>
          <div className="flex flex-col items-center gap-[calc(var(--u)*20)] text-center">
            <p className="text-[length:calc(var(--u)*26)] text-[#dbe7fb]">
              No encontramos tu sesión. Iniciá sesión para ver tu perfil.
            </p>
            <button
              type="button"
              onClick={() => navigate("/elegirinicio")}
              className={CLASE_BOTON_PRIMARIO}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Perfil ---------- */
  return (
    <section
      style={estiloEscala}
      className="mx-auto w-[calc(var(--u)*1026)] max-w-full font-[Helvetica,Arial,sans-serif]"
      aria-label="Perfil de paciente"
    >
      {esPrueba && (
        <p
          role="note"
          className="mb-[calc(var(--u)*12)] rounded-lg bg-[#f7e8bb] px-[calc(var(--u)*16)] py-[calc(var(--u)*8)] text-center text-[length:calc(var(--u)*18)] text-[#5c4a1e]"
        >
          Modo prueba: no hay sesión iniciada, estás viendo un usuario de prueba.
        </p>
      )}
      <div className={CLASE_TARJETA}>
        {/* ---------- Datos ---------- */}
        <div className="order-2 flex w-full flex-col items-center md:order-1 md:w-auto md:items-start">
          {/* Nombre y rol centrados entre sí, como en el diseño */}
          <div className="text-center md:w-[calc(var(--u)*246)]">
            <h1 className="text-[length:calc(var(--u)*36)] font-bold leading-tight text-[#dbe7fb]">
              {nombre}
            </h1>
            <p className="text-[length:calc(var(--u)*24)] leading-tight text-[#dbe7fb]">
              Paciente
            </p>
          </div>

          {/* Correo: cargando / error / listo */}
          {estadoPerfil === "cargando" && (
            <p
              role="status"
              className="mt-[calc(var(--u)*40)] text-[length:calc(var(--u)*24)] text-[#8fa6c7]"
            >
              Cargando tu perfil…
            </p>
          )}

          {estadoPerfil === "error" && (
            <div className="mt-[calc(var(--u)*40)] flex flex-col items-center gap-[calc(var(--u)*12)] md:items-start">
              <p
                role="alert"
                className="text-[length:calc(var(--u)*22)] text-[#ffb4b4]"
              >
                No pudimos cargar tu perfil.
              </p>
              <button
                type="button"
                onClick={() => setIntento((n) => n + 1)}
                className={CLASE_BOTON_SECUNDARIO}
              >
                Reintentar
              </button>
            </div>
          )}

          {estadoPerfil === "listo" && (
            <>
              <p className="mt-[calc(var(--u)*40)] break-all text-[length:calc(var(--u)*24)] text-[#dbe7fb] md:break-normal">
                <strong>Correo</strong>: {correoActual}
              </p>

              {/* Modo lectura / modo edición */}
              {editando ? (
                <form
                  onSubmit={guardarCorreo}
                  noValidate
                  className="mt-[calc(var(--u)*20)] flex w-full flex-col gap-[calc(var(--u)*12)]"
                >
                  <label htmlFor={idInput} className="sr-only">
                    Nuevo correo
                  </label>
                  <input
                    id={idInput}
                    type="email"
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Nuevo correo"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                    disabled={enviando}
                    aria-invalid={estadoEnvio === "error"}
                    aria-describedby={mensaje ? idMensaje : undefined}
                    className="h-[calc(var(--u)*48)] w-full rounded-lg border border-[#8fb2dd] bg-[#0f1a2e] px-[calc(var(--u)*14)] text-[length:calc(var(--u)*22)] text-[#dbe7fb] placeholder:text-[#8fa6c7] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  />
                  <div className="flex gap-[calc(var(--u)*12)]">
                    <button
                      type="submit"
                      disabled={enviando}
                      className={CLASE_BOTON_PRIMARIO}
                    >
                      {enviando ? "Guardando…" : "Guardar correo"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      disabled={enviando}
                      className={CLASE_BOTON_SECUNDARIO}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={abrirEdicion}
                  className={`${CLASE_BOTON_PRIMARIO} mt-[calc(var(--u)*20)]`}
                >
                  Cambiar correo
                  <IconoCambiar />
                </button>
              )}

              {/* role="status"/"alert": los lectores de pantalla lo anuncian */}
              {mensaje && (
                <p
                  id={idMensaje}
                  role={estadoEnvio === "error" ? "alert" : "status"}
                  className={`mt-[calc(var(--u)*12)] text-[length:calc(var(--u)*18)] ${
                    estadoEnvio === "error" ? "text-[#ffb4b4]" : "text-[#a9e6b8]"
                  }`}
                >
                  {mensaje}
                </p>
              )}
            </>
          )}
        </div>

        {/* ---------- Foto ---------- */}
        <div className="order-1 h-[calc(var(--u)*200)] w-[calc(var(--u)*200)] min-h-[100px] min-w-[100px] shrink-0 overflow-hidden rounded-full border border-black bg-[#d9d9d9] md:order-2">
          {fotoUrl && (
            <img
              src={fotoUrl}
              alt={`Foto de ${nombre}`}
              onError={() => setFotoUrl(null)} // si la URL está rota, vuelve al círculo gris
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}