import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export interface Ejercicio {
    id: string|number,
    name: string
    paciente: string
}

export default function PendientesMedico () {
    const [ ejercicios, setEjercicios ] = useState<Ejercicio[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('api/martinProgramaporfi')
        .then((res) => res.json())
        .then ((data:Ejercicio[]) => {setEjercicios(data)})
        .catch((err) => (`Hay un error en el almacenammiento de los ejercicios. Error: ${err}`))
    }, [])
    
    const NavegaClick = (id : number | string) => {
        navigate (`/quieresAsignarlo/${id}`)
    }

    const CrearEjercicio = () => {
        navigate('/crearEjercicio')
    }

    return (
        <div className='PendientesMedico'>
            {ejercicios.map((ejercicio) => (
                <div
                    key={ejercicio.id} 
                    className='CardPendiente'
                >
                    <p><strong>Ejercicio:</strong> {ejercicio.name}</p>
                    <button className='botonAsignar' onClick={() => NavegaClick(ejercicio.id)}>Asignar</button>
                    <p>¡Asignar ejercicio del día/semana!</p>
                </div>
            ))}
            <button className='CrearEjercicio' onClick={CrearEjercicio}>Crear ejercicio</button>
        </div>
    )
}
