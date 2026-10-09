import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type Ejercicios = {
    id: number|string;
    nombre: string;
    descripcion: string;
    type: string;
    imagen: string;
}

export default function SeleccionDeEjercicios() {
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('igottawaitformrsmilesmorales')
            .then(response => response.json())
            .then(data => {setEjercicios(data)})
            .catch(error => {console.error('Error fetching ejercicios:', error)});
    }, []);

    const NavigateEjercicio = (id, tipo) => {
        navigate(`/ejercicio/${tipo}/${id}`);	
    }

    return (
        <div>
            <h1>Seleccion de Ejercicios</h1>
            <ul>
                {ejercicios.map((ejercicio, index) => (
                    <button className="CardEjercicio" onClick={NavigateEjercicio.bind(null, ejercicio.id, ejercicio.type)}>
                    <li key={index}>
                        <h2>{ejercicio.nombre}</h2>
                        <p>{ejercicio.descripcion}</p>
                        <p>Tipo: {ejercicio.type}</p>
                        <img src={ejercicio.imagen} alt={ejercicio.nombre} />
                        
                    </li>
                    </button>
                ))}
            </ul>
        </div>
    )
}