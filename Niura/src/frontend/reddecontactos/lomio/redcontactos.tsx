import { useState } from 'react';
import type { Conversacion } from '../../interfaces/redcontactos';
import contactosMock from '../lomio/contactos.json';
import ContactoCard from './contactocard';

export default function ChatSimplificadomio() {
  const [contactos] = useState<Conversacion[]>(contactosMock as Conversacion[]);
  const [contactoActivo, setContactoActivo] = useState<Conversacion>(contactos[0]);
  const [texto, setTexto] = useState('');

  return (
    <div className="flex h-96 w-full max-w-2xl border border-gray-300 rounded-lg overflow-hidden bg-white">
      
      {/* Lista de contactos mediante ContactoCard */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-3 font-bold text-sm border-b bg-gray-100">
          Contactos ({contactos.length})
        </div>
        {contactos.map((contacto) => (
          <ContactoCard
            key={contacto.id_conversacion}
            contacto={contacto}
            esActivo={contactoActivo.id_conversacion === contacto.id_conversacion}
            onClick={() => setContactoActivo(contacto)}
          />
        ))}
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
            onClick={() => alert(`ID del contacto: ${contactoActivo.id_contacto}`)}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Ver Info
          </button>
        </div>

        {/* Espacio para mensajes */}
        <div className="flex-1 py-4 text-xs text-gray-400 italic flex items-center justify-center">
          Chat iniciado con {contactoActivo.nombre_contacto}
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
                if (!texto) return;
                alert(`Mensaje para ${contactoActivo.nombre_contacto}: "${texto}"`);
                setTexto('');
              }}}
          />
          <button
            onClick={() => {
              if (!texto) return;
              alert(`Mensaje para ${contactoActivo.nombre_contacto}: "${texto}"`);
              setTexto('');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs rounded font-bold"
          >
            Enviar
          </button>
        </div>

      </div>
    </div>
  );
}