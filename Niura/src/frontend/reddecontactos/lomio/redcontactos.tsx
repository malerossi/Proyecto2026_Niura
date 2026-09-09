import { useEffect, useState, useRef } from 'react';
import type { Conversacion, Mensaje } from '../../interfaces/redcontactos';
import contactosMock from '../lomio/contactos.json';
import ContactoCard from './contactocard';

export default function ChatSimplificadomio() {
  const [contactos, setContactos] = useState<Conversacion[]>(contactosMock as Conversacion[]);
  const [contactoActivo, setContactoActivo] = useState<Conversacion>(contactos[0]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  // 1. Crear la referencia para el scroll
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const contactosFiltrados = contactos.filter((c) =>
    c.nombre_contacto.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    setMensajes([]);
    setMensajes(contactoActivo.mensajes || []);
  }, [contactoActivo.id_conversacion]);

  // 2. Hacer scroll automáticamente cada vez que cambien los mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = () => {
    if (!texto.trim()) return;

    const nuevoMensaje: Mensaje = {
      id_mensaje: `${contactoActivo.id_conversacion}_m${(mensajes || []).length + 1}`,
      id_conversacion: contactoActivo.id_conversacion,
      id_emisor: 999,
      id_receptor: contactoActivo.id_contacto,
      tipo: 'texto',
      contenido: texto,
      estado_entrega: 'enviado',
      eliminado: false,
      fecha_envio: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nuevosMensajes = [...mensajes, nuevoMensaje];

    setMensajes(nuevosMensajes);

    const contactoActualizado = {
      ...contactoActivo,
      mensajes: nuevosMensajes,
    };

    setContactoActivo(contactoActualizado);
    setContactos((prev) =>
      prev.map((c) =>
        c.id_conversacion === contactoActivo.id_conversacion ? contactoActualizado : c
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
          {contactosFiltrados.map((contacto) => (
            <ContactoCard
              key={contacto.id_conversacion}
              contacto={contacto}
              esActivo={contactoActivo.id_conversacion === contacto.id_conversacion}
              onClick={() => {
                const contactoActualizado = { ...contacto, mensajes_no_leidos: 0 };
                setContactoActivo(contactoActualizado);
                setContactos((prev) =>
                  prev.map((c) =>
                    c.id_conversacion === contacto.id_conversacion ? contactoActualizado : c
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
            <h3 className="font-bold text-gray-800">{contactoActivo.nombre_contacto}</h3>
            <p className="text-xs text-gray-400">Estado: {contactoActivo.estado_presencia}</p>
          </div>
          <button
            onClick={() => alert(`Nombre de contacto: ${contactoActivo.nombre_contacto}`)}
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
                    <span>{msg.fecha_envio}</span>
                    {esMio && <span>• {msg.estado_entrega}</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="m-auto text-center text-xs text-gray-400 italic">
              No hay mensajes en esta conversación con {contactoActivo.nombre_contacto}.
            </div>
          )}
          
          {/* 3. Elemento ancla para el auto-scroll */}
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