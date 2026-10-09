import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
        navigate(`/video/${id}`);
    };

    const handleNavigateSeleccionarArchivo = () => {
        navigate(`/seleccionarArchivo/${id}`);
    };

    return (
        <div>
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
