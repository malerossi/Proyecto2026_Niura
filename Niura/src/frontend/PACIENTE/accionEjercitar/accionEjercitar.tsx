import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import flecha from '../EleccionEjercicio/flecha.png';
import './accionEjercitar.css';	
import subir

export default function AccionEjercitar() {
    const { id } = useParams<{ id: string }>();
    
    const [ejercicio, setEjercicio] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`api/ejercicio/${id}`)
            .then((res) => res.json())
            .then((data) => setEjercicio(data))
            .catch((err) => console.error(`Error fetching ejercicio: ${err}`));
    }, [id]);

    const handleNavigateSubir = () => {
        navigate(`/paciente/video/${id}`);
    };

    const handleNavigateSeleccionarArchivo = () => {
        navigate(`/paciente/seleccionarArchivo/${id}`);
    };

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="contenedor-central">
            <img src={flecha} alt="flecha" onClick={handleNavigateBack}/>
            <div className="subir">
                <button className="btnSubir" onClick={handleNavigateSubir}>
                    <img src="" alt="imgSubir" className="imgSubir"/>
                </button>
            </div>
            <div className="seleccionarArchivo">
                <button className="btnSeleccionarArchivo" onClick={handleNavigateSeleccionarArchivo}>
                    <img src="" alt="imgSeleccionarArchivo" className="imgSeleccionarArchivo"/>
                </button>
            </div>
        </div>
    );
}
