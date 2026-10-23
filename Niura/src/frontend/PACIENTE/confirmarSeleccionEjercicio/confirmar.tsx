import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { Ejercicios } from "../seleccionEjercicio/seleccionDeEjercicios";
import flecha from '../EleccionEjercicio/flecha.png';
import './confirmar.css';

export default function ConfirmarSeleccionEjercicio() {
    const { id } = useParams<{ id: string }>();
    const [ ejercicio, setEjercicio ] = useState<Ejercicios | null>(null);
    const navigate = useNavigate();

    useEffect  (() => {
        fetch(`https://mocki.io/v1/3fc5e5f3-1a7f-4eee-9a36-7409f15e255c`)
        .then((res) => res.json())
        .then((data) => setEjercicio(data.find(ej => String(ej.id) === String(id))))
        .catch((err) => console.error(`Error fetching ejercicio: ${err}`))
    }, [id]);

    const handleNavigate = () => {
        navigate(`/paciente/accionEjercitar/${id}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return(
        <div className="contenedor-central">
            <img src={flecha} alt="arrowback" className="arrowback" onClick={handleNavigateBack}/>
            {ejercicio ? (
                <div className="cardEjercicio">
                    <p className="nombreEjercicio">{ejercicio.nombre}</p>
                    <img className="imgEjercicio" src={ejercicio.imagen} alt={ejercicio.nombre} />
                    <button className="btnConfirmar" onClick={handleNavigate}>Confirmar</button>
                </div>
            ) : (
                <p className="loadingEjercicio">Cargando ejercicio...</p>
            )}
        </div>
    )
}