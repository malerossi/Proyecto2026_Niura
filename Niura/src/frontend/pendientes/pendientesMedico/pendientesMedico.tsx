import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Ejercicio {
    id: string|number,
    name: string
}

export default function PendientesMedico () {
    const [ ejercicio, setEjercicio ] = useState<Ejercicio[]>([]);
    const [ asignarEjercicios, setAsignar ] = useState<boolean> (false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('api/martinProgramaporfi')
        .then((res) => res.json())
        .then ((data:Ejercicio[]) => {setEjercicio(ejercicio)})
    })
    
    const NavegaClick = (id:string|number) => {
        navigate (`/asignarEjercicio/${id}`)
    }
}