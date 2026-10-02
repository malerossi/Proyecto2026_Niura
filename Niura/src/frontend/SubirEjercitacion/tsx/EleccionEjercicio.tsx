import { useNavigate } from "react-router-dom";

export default function EleccionEjercicio() {
    const navigate = useNavigate();

    const handleNavigateAudio = () => {
        navigate('/audio');
    }

    const handleNavigateVideo = () => {
        navigate('/video');
    }

    return (
        <div className="CajaEleccion">
            <p>¿Que quieres entrenar hoy?</p>
            <button className="audio" onClick={handleNavigateAudio}>
                <img src="" className="audioPic"/>
            </button>
            <button className="video" onClick={handleNavigateVideo}>
                <img src="" className="videoPic" />
            </button>
        </div>
    )
}