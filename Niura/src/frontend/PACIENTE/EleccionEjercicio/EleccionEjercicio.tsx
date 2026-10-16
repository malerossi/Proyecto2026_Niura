import { useNavigate, useParams } from "react-router-dom";
import './EleccionEjercicio.css';
import flechaImg from './flecha.png';
import audioImg from './audio.png';
import videoImg from './video.png';

export default function EleccionEjercicio() {
    const { type } = useParams();
    const navigate = useNavigate();

    const handleNavigateAudio = () => {
        navigate(`/seleccionEjercicio/${type}`);
    }

    const handleNavigateVideo = () => {
        navigate(`/seleccionEjercicio/${type}`);
    }

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="CajaEleccion">
            <img src={flechaImg} alt="flecha" className="flecha" onClick={handleNavigateBack}/>
            <p>¿Que quieres entrenar hoy?</p>
            <button className="audio" onClick={handleNavigateAudio}>
                <img src={audioImg} className="audioPic"/>
            </button>
            <button className="video" onClick={handleNavigateVideo}>
                <img src={videoImg} className="videoPic" />
            </button>
        </div>
    )
}