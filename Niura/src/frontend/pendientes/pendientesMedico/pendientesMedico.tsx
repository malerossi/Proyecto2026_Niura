import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Ejercicio {
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
    
    const NavegaClick = (id:string|number) => {
        navigate (`/asignarEjercicio/${id}`)
    }

    return (
        <div className='PendientesMedico'>
            {ejercicios.map((ejercicio) => (
                <div 
                    key={ejercicio.id} 
                    className='CardPendiente'
                    onClick={() => NavegaClick(ejercicio.id)}
                >
                    <p><strong>Paciente:</strong> {ejercicio.paciente}</p>
                    <p><strong>Ejercicio:</strong> {ejercicio.name}</p>
                    <p>¡Asignar ejercicio del día/semana!</p>
                </div>
            ))}
        </div>
    )
}