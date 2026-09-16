import type { Conversacion } from '../../interfaces/redcontactos';
import {formatearFecha} from '../../utils/funcionparalafecha';
interface ContactoCardProps {
  contacto: Conversacion;
  esActivo: boolean;
  onClick: () => void;
}

export default function ContactoCard({ contacto, esActivo, onClick }: ContactoCardProps) {
  // Obtenemos el último mensaje del array si existe
  const ultimoMensaje = contacto.mensajes?.[contacto.mensajes.length - 1];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 border-b text-xs flex flex-col gap-1 ${
        esActivo
          ? 'bg-indigo-100 font-bold text-indigo-700'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {/* Fila superior: Nombre y hora del último mensaje */}
      <div className="flex justify-between items-center w-full">
        <span className="truncate">{contacto.nombre_contacto}</span>
        {ultimoMensaje && (
          <span className="text-[10px] font-normal opacity-70 shrink-0 ml-1">
            {formatearFecha(ultimoMensaje.fecha_envio) }
          </span>
        )}
      </div>

      {/* Fila inferior: Texto del mensaje truncado y contador */}
      <div className="flex justify-between items-center w-full font-normal">
        <p className="truncate text-gray-500 text-[11px] max-w-[80%]">
          {ultimoMensaje ? ultimoMensaje.contenido : 'Sin mensajes'}
        </p>
        
        {contacto.mensajes_no_leidos > 0 && (
          <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0">
            {contacto.mensajes_no_leidos}
          </span>
        )}
      </div>
    </button>
  );
}