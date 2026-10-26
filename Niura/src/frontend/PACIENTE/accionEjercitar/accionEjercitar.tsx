import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import flecha from '../EleccionEjercicio/flecha.png';
import './accionEjercitar.css';

export default function AccionEjercitar() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [ejercicio, setEjercicio] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`https://mocki.io/v1/3fc5e5f3-1a7f-4eee-9a36-7409f15e255c`)
            .then((res) => res.json())
            .then((data) => {
                const encontrado = data.find((ej: any) => String(ej.id) === String(id));
                setEjercicio(encontrado);
            })
            .catch((err) => console.error(`Error fetching ejercicio: ${err}`));
    }, [id]);

    const handleNavigateSubir = () => {
        navigate(`/paciente/${type}/${id}`);
    };

    const handleNavigateSeleccionarArchivo = () => {
        navigate(`/paciente/seleccionarArchivo${type}/${id}`);
    };

    const handleNavigateBack = () => {
        navigate(-1);
    }

    return (
        <div className="contenedor-central">
            <img src={flecha} alt="flecha" onClick={handleNavigateBack} className="arrowback"/>
            <div className="subir">
                <button className="btnSubir" onClick={handleNavigateSubir}>
                    <img src="" alt={`Grabar ${type}`} className="imgSubir"/>
                </button>
            </div>
            <div className="seleccionarArchivo">
                <button className="btnSeleccionarArchivo" onClick={handleNavigateSeleccionarArchivo}>
                    <img src="" alt={`Subir archivo de ${type}`} className="imgSeleccionarArchivo"/>
                </button>
            </div>
        </div>
    );
}