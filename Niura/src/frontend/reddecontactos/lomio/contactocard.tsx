import type { Conversacion } from '../../interfaces/redcontactos';

interface ContactoCardProps {
  contacto: Conversacion;
  esActivo: boolean;
  onClick: () => void;
}

export default function ContactoCard({ contacto, esActivo, onClick }: ContactoCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 border-b text-xs flex justify-between items-center ${
        esActivo
          ? 'bg-indigo-100 font-bold text-indigo-700'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <span className="truncate">{contacto.nombre_contacto}</span>
      {contacto.mensajes_no_leidos > 0 && (
        <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
          {contacto.mensajes_no_leidos}
        </span>
      )}
    </button>
  );
}