import { useState } from "react";
import arrowback from './flecha.png'; 
import iconoExito from './exito.png';
import iconoError from './error.png';
import './seleccionarArchivo.css'; 
import { useNavigate } from "react-router-dom";

type EstadoPantalla = 'seleccion' | 'exito' | 'error';

export default function SubirArchivo() {
    const [nombreArchivo, setNombreArchivo] = useState<string>("Seleccionar archivo...");
    const [videoPrevisualizado, setVideoPrevisualizado] = useState<string | null>(null);
    const [estado, setEstado] = useState<EstadoPantalla>('seleccion');
    const navigate = useNavigate();

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNombreArchivo(file.name); 
            const videoUrl = URL.createObjectURL(file);
            setVideoPrevisualizado(videoUrl);
        }
    };

    const handleNavigateBack = () => {
        navigate(-1);
    };

    const handleVolverInicio = () => {
        navigate('/'); 
    };

    const handleReintentar = () => {
        setEstado('seleccion');
    };

    const handleConfirmar = () => {
        setTimeout(() => {
            const subidaExitosa = Math.random() > 0.5; // 50% de probabilidad
            if (subidaExitosa) {
                setEstado('exito');
            } else {
                setEstado('error');
            }
        }, 1000);
    };

    return (
        <div className="pantalla-subida-contenedor">
            <div className={`card-confirmacion ${estado === 'error' ? 'card-error' : ''}`}>
                
                <button className="boton-volver" onClick={handleNavigateBack}>
                    <img src={arrowback} alt="Volver" className="atras" />
                </button>

                {estado === 'seleccion' && (
                    <>
                        <h2 className="titulo-confirmacion">¿Subir archivo seleccionado?</h2>
                        <label htmlFor="input-archivo" className="etiqueta-nombre-archivo">
                            {nombreArchivo}
                        </label>
                        <input 
                            id="input-archivo"
                            type="file" 
                            accept="video/*" 
                            onChange={handleSeleccionarArchivo} 
                            className="input-oculto"
                        />
                        {videoPrevisualizado && (
                            <video className="video-preview" controls src={videoPrevisualizado} />
                        )}
                        <button className="boton-principal" onClick={handleConfirmar}>Confirmar</button>
                    </>
                )}

                {estado === 'exito' && !videoPrevisualizado && !nombreArchivo && (
                    <>
                        <h2 className="titulo-confirmacion">Video subido con éxito</h2>
                        <img src={iconoExito} alt="Éxito" className="icono-estado" />
                        <button className="boton-principal" onClick={handleVolverInicio}>Volver al inicio</button>
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <h2 className="titulo-confirmacion">Hubo un error</h2>
                        <img src={iconoError} alt="Error" className="icono-estado" />
                        <div className="contenedor-botones-error">
                            <button className="boton-principal" onClick={handleReintentar}>Reintentar</button>
                            <button className="boton-secundario" onClick={handleVolverInicio}>Volver al inicio</button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}