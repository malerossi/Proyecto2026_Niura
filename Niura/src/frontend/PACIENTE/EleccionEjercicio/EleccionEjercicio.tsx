import { useNavigate } from "react-router-dom";
import './EleccionEjercicio.css';
import flechaImg from './flecha.png';
import audioImg from './audio.png';
import videoImg from './video.png';
import { useEffect, useState } from "react";

export default function EleccionEjercicio() {
    const navigate = useNavigate();
    
    // 1. Ponemos "cognitiva" por defecto para que NUNCA navegue a undefined
    const [tipoEjercicio, setTipoEjercicio] = useState();

    useEffect(() => {
        fetch("https://mocki.io/v1/3eb88bc4-9078-4d87-ad22-c46dac2de979")
            .then((response) => response.json())
            .then((data) => {
                console.log("Respuesta de Mocky:", data);
                if (data && data.type) {
                    setTipoEjercicio(data.type); // Actualiza si la API responde rápido
                }
            })
            .catch((error) => console.error("Error al cargar la API:", error));
    }, []);

    const handleNavigateAudio = () => {
        // CORREGIDO: Redirige a /seleccionAudio/:type (coincide con tu App.js)
        navigate(`/seleccionAudio/${tipoEjercicio}`);
    }

    const handleNavigateVideo = () => {
        // CORREGIDO: Redirige a /seleccionVideo/:type (coincide con tu App.js)
        navigate(`/seleccionVideo/${tipoEjercicio}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="CajaEleccion">
            <img src={flechaImg} alt="flecha" className="flecha" onClick={handleNavigateBack}/>
            <p>¿Qué quieres entrenar hoy?</p>
            <button className="audio" onClick={handleNavigateAudio}>
                <img src={audioImg} alt="audio" className="audioPic"/>
            </button>
            <button className="video" onClick={handleNavigateVideo}>
                <img src={videoImg} alt="video" className="videoPic" />
            </button>
        </div>
    );
}