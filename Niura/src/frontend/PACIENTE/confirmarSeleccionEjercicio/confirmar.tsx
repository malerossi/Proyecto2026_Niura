import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { Ejercicios } from "../seleccionEjercicio/seleccionDeEjercicios";

export default function ConfirmarSeleccionEjercicio() {
    const { id } = useParams<{ id: string }>();
    const [ ejercicio, setEjercicio ] = useState<Ejercicios | null>(null);
    const navigate = useNavigate();

    useEffect  (() => {
        fetch(`api/ejercicio/${id}`)
        .then((res) => res.json())
        .then((data) => setEjercicio(data))
        .catch((err) => console.error(`Error fetching ejercicio: ${err}`))
    }, [id]);

    const handleNavigate = () => {
        navigate(`/accionEjercitar/${id}`);
    }

    return(
        <div>
            {ejercicio ? (
                <div>
                    <p className="tipoEjercicio"><strong>Tipo:</strong> {ejercicio.type}</p>
                    <p className="nombreEjercicio"><strong>Nombre:</strong> {ejercicio.nombre}</p>
                    <img className="imgEjercicio" src={ejercicio.imagen} alt={ejercicio.nombre} />
                    <button className="btnConfirmar" onClick={handleNavigate}>Confirmar</button>
                </div>
            ) : (
                <p className="loadingEjercicio">Cargando ejercicio...</p>
            )}
        </div>
    )
}