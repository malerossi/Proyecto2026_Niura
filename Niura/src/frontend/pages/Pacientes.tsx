
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import PatientCard from '../components/patientCard';
import { useMedico, type Paciente } from '../Contexts/contextoMedico';

const URL_PACIENTES =
    'https://mocki.io/v1/dbaf0763-1401-4edd-8363-81b4349392f5';

const PACIENTES_POR_PAGINA = 7;

interface RespuestaPacientes {
    pacientes: Paciente[];
}

export default function Pacientes() {
    const { setPacienteActivo } = useMedico();
    const navigate = useNavigate();

    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function cargarPacientes() {
            try {
                setCargando(true);
                setError('');

                const respuesta = await fetch(URL_PACIENTES, {
                    signal: controller.signal
                });

                if (!respuesta.ok) {
                    throw new Error('No se pudieron obtener los pacientes.');
                }

                const datos: RespuestaPacientes = await respuesta.json();
                setPacientes(datos.pacientes);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                setError('No se pudieron cargar los pacientes. Intentá nuevamente.');
            } finally {
                if (!controller.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarPacientes();

        return () => controller.abort();
    }, []);

    const pacientesFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es');

        return pacientes.filter((paciente) =>
            `${paciente.nombre} ${paciente.apellido}`
                .toLocaleLowerCase('es')
                .includes(texto)
        );
    }, [pacientes, busqueda]);

    const cantidadPaginas = Math.ceil(
        pacientesFiltrados.length / PACIENTES_POR_PAGINA
    );

    const pacientesVisibles = pacientesFiltrados.slice(
        paginaActual * PACIENTES_POR_PAGINA,
        (paginaActual + 1) * PACIENTES_POR_PAGINA
    );

    function cambiarBusqueda(valor: string) {
        setBusqueda(valor);
        setPaginaActual(0);
    }

    function seleccionarPaciente(paciente: Paciente) {
        setPacienteActivo(paciente);
        navigate(`/pacientes/${paciente.id}`);
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
            <div className="mx-auto max-w-[1600px]">
                <h1 className="mb-7 text-3xl font-bold text-slate-800">
                    Tus pacientes
                </h1>

                <div className="mb-8 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-sky-400">
                    <Icon
                        icon="mdi:magnify"
                        className="h-6 w-6 shrink-0 text-slate-400"
                    />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => cambiarBusqueda(e.target.value)}
                        placeholder="Buscar paciente..."
                        aria-label="Buscar paciente por nombre y apellido"
                        className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </div>

                {cargando ? (
                    <p className="py-12 text-center text-slate-500">
                        Cargando pacientes...
                    </p>
                ) : error ? (
                    <p role="alert" className="py-12 text-center text-red-600">
                        {error}
                    </p>
                ) : pacientesFiltrados.length === 0 ? (
                    <p className="py-12 text-center text-slate-500">
                        No se encontraron pacientes.
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
                            {pacientesVisibles.map((paciente) => (
                                <PatientCard
                                    key={paciente.id}
                                    paciente={paciente}
                                    onClick={() => seleccionarPaciente(paciente)}
                                />
                            ))}
                        </div>

                        {cantidadPaginas > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-5">
                                <button
                                    type="button"
                                    aria-label="Página anterior"
                                    disabled={paginaActual === 0}
                                    onClick={() =>
                                        setPaginaActual((actual) => actual - 1)
                                    }
                                    className="rounded-full p-2 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <Icon
                                        icon="mdi:chevron-left"
                                        className="h-7 w-7"
                                    />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from(
                                        { length: cantidadPaginas },
                                        (_, indice) => (
                                            <button
                                                key={indice}
                                                type="button"
                                                aria-label={`Ir a la página ${indice + 1}`}
                                                aria-current={
                                                    paginaActual === indice
                                                        ? 'page'
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    setPaginaActual(indice)
                                                }
                                                className={`h-2.5 w-2.5 rounded-full transition ${
                                                    paginaActual === indice
                                                        ? 'bg-sky-600'
                                                        : 'bg-sky-200 hover:bg-sky-400'
                                                }`}
                                            />
                                        )
                                    )}
                                </div>

                                <button
                                    type="button"
                                    aria-label="Página siguiente"
                                    disabled={paginaActual >= cantidadPaginas - 1}
                                    onClick={() =>
                                        setPaginaActual((actual) => actual + 1)
                                    }
                                    className="rounded-full p-2 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <Icon
                                        icon="mdi:chevron-right"
                                        className="h-7 w-7"
                                    />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
