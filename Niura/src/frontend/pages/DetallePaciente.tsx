
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useMedico } from '../Contexts/contextoMedico';

export default function DetallePaciente() {
    const { pacienteActivo } = useMedico();
    const navigate = useNavigate();

    if (!pacienteActivo) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
            <div className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate('/pacientes')}
                    className="mb-6 flex items-center gap-2 text-sky-700 hover:text-sky-900"
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                    Volver a pacientes
                </button>

                <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                    <div className="flex flex-col items-center gap-4 bg-sky-100 px-6 py-10 sm:flex-row sm:justify-start">
                        {pacienteActivo.avatar ? (
                            <img
                                src={pacienteActivo.avatar}
                                alt={`${pacienteActivo.nombre} ${pacienteActivo.apellido}`}
                                className="h-28 w-28 rounded-full object-cover"
                            />
                        ) : (
                            <Icon
                                icon="mdi:account-circle"
                                className="h-28 w-28 text-sky-600"
                            />
                        )}

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {pacienteActivo.nombre} {pacienteActivo.apellido}
                            </h1>
                            <p className="mt-2 text-slate-600">
                                {pacienteActivo.rol}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">
                            Información del paciente
                        </h2>

                        <p className="text-slate-600">
                            <span className="font-medium text-slate-800">
                                ID:
                            </span>{' '}
                            {pacienteActivo.id}
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
