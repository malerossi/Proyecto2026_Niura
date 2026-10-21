import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import arrowback from './arrowback.png';

export type Ejercicios = {
    id: number | string;
    nombre: string;
    descripcion: string;
    type: string;
    imagen: string;
}

export default function SeleccionDeEjercicios() {
    const { type } = useParams<{ type: string }>();
    const [ejercicios, setEjercicios] = useState<Ejercicios[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!type) return;

        fetch(`https://mocki.io/v1/01d2461f-9555-4d5c-8684-6b085253be95/${type}`)
            .then(response => response.json())
            .then(data => {
                const filtrados = data.filter((ejercicio: Ejercicios) => ejercicio.type === type);
                setEjercicios(filtrados);
            })
            .catch(error => { console.error('Error fetching ejercicios:', error) });
            
    }, [type]);

    const handleNavigateEjercicio = (ejercicioId: number | string) => {
        navigate(`/ejercicio/${ejercicioId}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div>
            <h1>Tu selección de hoy</h1>
            <img src={arrowback} alt="arrowback" className="arrowback" onClick={handleNavigateBack}/>
            <ul>
                {ejercicios.map((ejercicio) => (
                    <li key={ejercicio.id}>
                        <button 
                            className="CardEjercicio" 
                            onClick={() => handleNavigateEjercicio(ejercicio.id)}>
                            <h2 className="nombreEjercicio">{ejercicio.nombre}</h2>
                            <p className="descripcionEjercicio">{ejercicio.descripcion}</p>
                            <p className="tipoEjercicio">Tipo: {ejercicio.type}</p>
                            <img src={ejercicio.imagen} alt={ejercicio.nombre} className="imagenEjercicio"/>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}