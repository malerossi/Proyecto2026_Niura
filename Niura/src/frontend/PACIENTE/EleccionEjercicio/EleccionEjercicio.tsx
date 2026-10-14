import { useNavigate, useParams } from "react-router-dom";

export default function EleccionEjercicio() {
    const { type } = useParams();
    const navigate = useNavigate();

    const handleNavigateAudio = () => {
        navigate(`/seleccionEjercicio/${type}`);
    }

    const handleNavigateVideo = () => {
        navigate(`/seleccionEjercicio/${type}`);
    }

    return (
        <div className="CajaEleccion">
            <p>¿Que quieres entrenar hoy?</p>
            <button className="audio" onClick={handleNavigateAudio}>
                AUDIO
                <img src="" className="audioPic"/>
            </button>
            <button className="video" onClick={handleNavigateVideo}>
                VIDEO
                <img src="" className="videoPic" />
            </button>
        </div>
    )
}