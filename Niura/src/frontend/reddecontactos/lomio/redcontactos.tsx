import { useEffect, useState, useRef } from 'react';
import type { Conversacion, Mensaje } from '../../interfaces/redcontactos';
import contactosMock from '../lomio/contactos.json';
import ContactoCard from './contactocard';
import {formatearFecha} from '../../utils/funcionparalafecha';
// Extendemos el tipo localmente para incluir la propiedad de ordenamiento
interface ConversacionConFecha extends Conversacion {
  updatedAt: number;
}

export default function ChatSimplificadomio() {
  // Inicializamos las conversaciones asignándoles un timestamp base según su orden en el JSON
  const [contactos, setContactos] = useState<ConversacionConFecha[]>(() => {
    const tiempoBase = Date.now();
    return (contactosMock as Conversacion[]).map((c, index) => ({
      ...c,
      // Restamos minutos según la posición inicial para mantener el orden base del JSON
      updatedAt: tiempoBase - index * 60000,
    }));
  });

  const [idActivo, setIdActivo] = useState<string>(
    (contactosMock as Conversacion[])[0]?.id_conversacion || ''
  );
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Derivamos la conversación activa y los mensajes directamente del estado
  const contactoActivo =
    contactos.find((c) => c.id_conversacion === idActivo) || contactos[0];
  const mensajes = contactoActivo?.mensajes || [];

  // Ordenamiento infalible: de mayor a menor por el campo updatedAt
// 1. Recorremos los contactos con un bucle 'for' para asignarle la puntuación a cada uno
const contactosConPuntuacion = [];

for (let i = 0; i < contactos.length; i++) {
  const contacto = contactos[i];
  
  // Obtenemos el último mensaje de la conversación
  const ultimoMensaje = contacto.mensajes[contacto.mensajes.length - 1];

  // Si tiene mensajes, la puntuación es el timestamp (.getTime()) de la fecha del mensaje.
  // Si no tiene mensajes, le asignamos 0 para que vaya al final de la lista.
  const puntuacion = ultimoMensaje ? new Date(ultimoMensaje.fecha_envio).getTime() : 0;

  // Guardamos el contacto con su nueva propiedad 'puntuacion'
  contactosConPuntuacion.push({
    ...contacto,
    puntuacion: puntuacion
  });
}

// 2. Filtramos por la búsqueda y ordenamos por la puntuación calculada
const contactosFiltradosYOrdenados = contactosConPuntuacion
  .filter((c) => c.nombre_contacto.toLowerCase().includes(busqueda.toLowerCase()))
  .sort((a, b) => b.puntuacion - a.puntuacion);

// Scroll automático al final del chat al cambiar mensajes o conversación activa
useEffect(() => {
  mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [mensajes.length, idActivo]);

  const enviarMensaje = () => {
    if (!texto.trim() || !contactoActivo) return;

    const ahora = Date.now();
    const nuevoMensaje: Mensaje = {
      id_mensaje: `msg_${ahora}`,
      id_conversacion: contactoActivo.id_conversacion,
      id_emisor: 999,
      id_receptor: contactoActivo.id_contacto,
      tipo: 'texto',
      contenido: texto,
      estado_entrega: 'enviando',
      eliminado: false,
      fecha_envio: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Actualizamos los mensajes Y actualizamos el updatedAt a Date.now()
    setContactos((prev) =>
      prev.map((c) =>
        c.id_conversacion === contactoActivo.id_conversacion
          ? {
              ...c,
              mensajes: [...(c.mensajes || []), nuevoMensaje],
              updatedAt: ahora, // <-- Esto garantiza que pase al primer lugar de inmediato
            }
          : c
      )
    );

    setTexto('');
  };

  return (
    <div className="flex h-96 w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Lista de contactos */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-3 font-bold text-sm border-b bg-gray-100">
          Contactos ({contactos.length})
        </div>
        <div className="p-2">
          <input
            type="text"
            placeholder="Buscar contacto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-1.5 text-xs border rounded bg-white outline-none focus:border-indigo-500 mb-2"
          />
          {contactosFiltradosYOrdenados.map((contacto) => (
            <ContactoCard
              key={contacto.id_conversacion}
              contacto={contacto}
              esActivo={contacto.id_conversacion === idActivo}
              onClick={() => {
                setIdActivo(contacto.id_conversacion);
                setContactos((prev) =>
                  prev.map((c) =>
                    c.id_conversacion === contacto.id_conversacion
                      ? { ...c, mensajes_no_leidos: 0 }
                      : c
                  )
                );
              }}
            />
          ))}
        </div>
      </div>

      {/* Pantalla del chat seleccionado */}
      <div className="w-2/3 flex flex-col justify-between p-4 bg-white">
        
        {/* Cabecera del contacto actual */}
        <div className="border-b pb-2 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">{contactoActivo?.nombre_contacto}</h3>
            <p className="text-xs text-gray-400">Estado: {contactoActivo?.estado_presencia}</p>
          </div>
          <button
            onClick={() => alert(`Nombre de contacto: ${contactoActivo?.nombre_contacto}`)}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Ver Info
          </button>
        </div>

        {/* Espacio para renderizar mensajes */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 my-2 p-2 bg-gray-50 rounded border border-gray-100">
          {mensajes && mensajes.length > 0 ? (
            mensajes.map((msg) => {
              const esMio = msg.id_emisor === 999;
              return (
                <div
                  key={msg.id_mensaje}
                  className={`p-2 rounded-lg text-xs max-w-[80%] ${
                    esMio
                      ? 'bg-indigo-600 text-white self-end rounded-br-none'
                      : 'bg-white border text-gray-800 self-start rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="break-words">{msg.contenido}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      esMio ? 'text-indigo-200' : 'text-gray-400'
                    }`}
                  >
                    <span> {formatearFecha(msg.fecha_envio) }</span>
                    {esMio && <span>• {msg.estado_entrega}</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="m-auto text-center text-xs text-gray-400 italic">
              No hay mensajes en esta conversación con {contactoActivo?.nombre_contacto}.
            </div>
          )}
          
          <div ref={mensajesEndRef} />
        </div>

        {/* Input y botón enviar */}
        <div className="flex gap-2 border-t pt-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="flex-1 border p-2 text-xs rounded outline-none focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                enviarMensaje();
              }
            }}
          />
          <button
            onClick={enviarMensaje}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs rounded font-bold transition-colors"
          >
            Enviar
          </button>
        </div>

      </div>
    </div>
  );
}