
import { Icon } from '@iconify/react';
import type { Paciente } from '../Contexts/contextoMedico';

interface PatientCardProps {
    paciente: Paciente;
    onClick: () => void;
}

export default function PatientCard({
    paciente,
    onClick
}: PatientCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-w-0 flex-col overflow-hidden rounded-xl
                       border border-sky-100 bg-white text-left shadow-sm
                       transition duration-200 hover:-translate-y-1
                       hover:shadow-md focus:outline-none focus:ring-2
                       focus:ring-sky-400"
        >
            <div className="flex h-36 w-full items-center justify-center bg-sky-100">
                {paciente.avatar ? (
                    <img
                        src={paciente.avatar}
                        alt={`${paciente.nombre} ${paciente.apellido}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <Icon
                        icon="mdi:account-circle"
                        className="h-24 w-24 text-sky-500"
                    />
                )}
            </div>

            <div className="flex min-h-28 w-full flex-col items-center justify-center gap-2 p-3 text-center">
                <span className="text-base font-semibold text-slate-800">
                    {paciente.nombre}
                </span>

                <span className="text-sm text-slate-600">
                    {paciente.apellido}
                </span>

                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                    {paciente.rol}
                </span>
            </div>
        </button>
    );
}
