import React, { useState, useEffect, useRef } from 'react';
import type { Conversacion, Mensaje } from '../interfaces/redcontactos';

const USUARIO_ACTUAL_ID = 109;

const CONVERSACIONES_MOCK: Conversacion[] = [

  {
    id_conversacion: 'conv_1',
    id_contacto: 1,
    nombre_contacto: 'Sofi',
    avatar_contacto: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sofi',
    estado_presencia: 'online',
    mensajes_no_leidos: 0,
    mensajes :[]
  },
  {
    id_conversacion: 'conv_3',
    id_contacto: 4,
    nombre_contacto: 'maxi',
    avatar_contacto: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fran',
    estado_presencia: 'online',
    mensajes_no_leidos: 1,
    mensajes :[]
  },
  {
    id_conversacion: 'conv_2',
    id_contacto: 2,
    nombre_contacto: 'Fran',
    avatar_contacto: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fran',
    estado_presencia: 'offline',
    mensajes_no_leidos: 3,
    mensajes :[]
  },
];

 const ChatSimplificado = () => {
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion>(CONVERSACIONES_MOCK[0]);
  const [historialMensajes, setHistorialMensajes] = useState<Record<string, Mensaje[]>>({
    conv_1: [
      {
        id_mensaje: 'm1',
        id_conversacion: 'conv_1',
        id_emisor: 1,
        id_receptor: USUARIO_ACTUAL_ID,
        tipo: 'texto',
        contenido: '¡Buenas! ¿Cómo viene eso?',
        estado_entrega: 'leido',
        eliminado: false,
        fecha_envio: '14:20',
      },
      {
        id_mensaje: 'm2',
        id_conversacion: 'conv_1',
        id_emisor: USUARIO_ACTUAL_ID,
        id_receptor: 1,
        tipo: 'texto',
        contenido: 'Todo joya, armando el chat.',
        estado_entrega: 'leido',
        eliminado: false,
        fecha_envio: '14:21',
      },
    ],
    conv_2: [
      {
        id_mensaje: 'm3',
        id_conversacion: 'conv_2',
        id_emisor: 2,
        id_receptor: USUARIO_ACTUAL_ID,
        tipo: 'texto',
        contenido: 'Avisame cuando esté listo el deploy',
        estado_entrega: 'entregado',
        eliminado: false,
        fecha_envio: 'Ayer',
      },
    ],
  });

  const [textoInput, setTextoInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const mensajesActuales = historialMensajes[conversacionActiva.id_conversacion] || [];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historialMensajes, conversacionActiva]);

  const enviarMensaje = () => {
    if (!textoInput.trim()) return;

    const idTmp = `tmp_${Date.now()}`;
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuevoMsg: Mensaje = {
      id_mensaje: idTmp,
      id_conversacion: conversacionActiva.id_conversacion,
      id_emisor: USUARIO_ACTUAL_ID,
      id_receptor: conversacionActiva.id_contacto,
      tipo: 'texto',
      contenido: textoInput,
      estado_entrega: 'enviando',
      eliminado: false,
      fecha_envio: horaActual,
    };

    // 1. Inserción optimista
    setHistorialMensajes((prev) => ({
      ...prev,
      [conversacionActiva.id_conversacion]: [...(prev[conversacionActiva.id_conversacion] || []), nuevoMsg],
    }));

    setTextoInput('');

    // 2. Simulación de confirmación del servidor
    setTimeout(() => {
      setHistorialMensajes((prev) => ({
        ...prev,
        [conversacionActiva.id_conversacion]: (prev[conversacionActiva.id_conversacion] || []).map((m) =>
          m.id_mensaje === idTmp ? { ...m, estado_entrega: 'enviado' } : m
        ),
      }));
    }, 600);

    // 3. Simulación de respuesta automática
    setTimeout(() => {
      const respuestaMsg: Mensaje = {
        id_mensaje: `res_${Date.now()}`,
        id_conversacion: conversacionActiva.id_conversacion,
        id_emisor: conversacionActiva.id_contacto,
        id_receptor: USUARIO_ACTUAL_ID,
        tipo: 'texto',
        contenido: 'Recibido 👍',
        estado_entrega: 'leido',
        eliminado: false,
        fecha_envio: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistorialMensajes((prev) => ({
        ...prev,
        [conversacionActiva.id_conversacion]: [...(prev[conversacionActiva.id_conversacion] || []), respuestaMsg],
      }));
    }, 2000);
  };

  return (
    <div className="flex h-[550px] w-full max-w-3xl border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden font-sans">
      
      {/* Columna Izquierda: Conversaciones */}
      <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200/60 bg-white">
          <h2 className="font-bold text-slate-800 text-base">Mensajes</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CONVERSACIONES_MOCK.map((conv) => {
            const esActiva = conv.id_conversacion === conversacionActiva.id_conversacion;
            return (
              <button
                key={conv.id_conversacion}
                onClick={() => setConversacionActiva(conv)}
                className={`w-full flex items-center gap-3 p-3 transition text-left border-b border-slate-100/50 ${
                  esActiva ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={conv.avatar_contacto} alt={conv.nombre_contacto} className="w-10 h-10 rounded-full bg-slate-200" />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      conv.estado_presencia === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{conv.nombre_contacto}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">
                    {conv.estado_presencia}
                  </p>
                </div>
                {conv.mensajes_no_leidos > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {conv.mensajes_no_leidos}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Chat */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        
        {/* Cabecera */}
        <div className="p-3 px-4 border-b border-slate-200/60 bg-white flex items-center gap-3">
          <img src={conversacionActiva.avatar_contacto} alt={conversacionActiva.nombre_contacto} className="w-8 h-8 rounded-full bg-slate-200" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">{conversacionActiva.nombre_contacto}</h3>
            <span className="text-[11px] text-emerald-600 font-medium capitalize">
              {conversacionActiva.estado_presencia}
            </span>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {mensajesActuales.map((msg) => {
            const esMio = msg.id_emisor === USUARIO_ACTUAL_ID;
            return (
              <div key={msg.id_mensaje} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.eliminado
                      ? 'bg-slate-100 text-slate-400 italic border border-slate-200'
                      : esMio
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/60 rounded-bl-xs'
                  }`}
                >
                  {msg.eliminado ? 'Este mensaje fue eliminado' : msg.contenido}

                  {msg.adjunto && !msg.eliminado && (
                    <div className="mt-2 text-xs bg-black/10 p-2 rounded-lg flex items-center gap-2">
                      <span>📎</span>
                      <span className="truncate">{msg.adjunto.nombre_archivo}</span>
                      <span className="opacity-70">({(msg.adjunto.tamano_bytes / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>

                {/* Metadata y Estados */}
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{msg.fecha_envio}</span>
                  {esMio && !msg.eliminado && (
                    <span className="text-[10px]">
                      {msg.estado_entrega === 'enviando' && '⏳'}
                      {msg.estado_entrega === 'enviado' && <span className="text-slate-400">✓</span>}
                      {msg.estado_entrega === 'entregado' && <span className="text-slate-400">✓✓</span>}
                      {msg.estado_entrega === 'leido' && <span className="text-indigo-500 font-bold">✓✓</span>}
                      {msg.estado_entrega === 'error' && <span className="text-rose-500 font-bold">⚠️</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
            className="flex-1 px-3.5 py-2 text-sm bg-slate-100/70 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 transition"
          />
          <button
            onClick={enviarMensaje}
            disabled={!textoInput.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition"
          >
            Enviar
          </button>
        </div>

      </div>
    </div>
  );
};
export default ChatSimplificado;