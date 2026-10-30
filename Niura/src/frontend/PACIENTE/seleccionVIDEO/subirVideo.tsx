import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png'
import type {Ejercicios} from '../seleccionEjercicio/seleccionDeEjercicios'
import './subirVideo.css'

export default function Video() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [ grabando, setGrabando ] = useState<boolean>(false);
    const [ videoPrevisualizado, setVideoPrevisualizado ] = useState<string>('');
    const [ videoArchivo, setVideoArchivo ] = useState<File | null>(null);
    const [ ejercicio, setEjercicio ] = useState<Ejercicios | null>(null);
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const partesRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (grabando && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [grabando]);


    const handleGrabacion = async () => {
        if (!grabando) {
            try {
                if (videoPrevisualizado) {
                    URL.revokeObjectURL(videoPrevisualizado);
                    setVideoPrevisualizado('');
                    setVideoArchivo(null);
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                partesRef.current = [];

                const recorder = new MediaRecorder(stream);
                recorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        partesRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const videoBlob = new Blob(partesRef.current, { type: "video/webm" });
                    const url = URL.createObjectURL(videoBlob);

                    const nombreArchivo = `grabacion_${Date.now()}.webm`;
                    const file = new File([videoBlob], nombreArchivo, { type: "video/webm" });

                    // Guardamos el archivo y la URL para la previsualización
                    setVideoArchivo(file);
                    setVideoPrevisualizado(url);
                    
                    // ELIMINÉ EL CÓDIGO QUE CREABA EL "a.download" AQUÍ
                };

                recorder.start();
                setGrabando(true);

            } catch (error) {
                console.error(error);
                alert("No se pudo acceder a la cámara.");
            }
        } else {
            if (recorderRef.current && recorderRef.current.state === "recording") {
                recorderRef.current.stop();
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setGrabando(false);
        }
    };

    const handleConfirmar = () => {
        if (!videoPrevisualizado) return;
    
        const a = document.createElement("a");
        a.href = videoPrevisualizado;
        
        a.download = videoArchivo ? videoArchivo.name : `grabacion_${Date.now()}.webm`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    
        navigate (`/paciente/seleccionVIDEO/seleccionarArchivo/${type}/${id}`)
    };

    return (
        <div className='cuadroVideo'>
            
            {!videoPrevisualizado && (
                <div className="estado-grabacion">
                    <video ref={videoRef} autoPlay muted className="video-vivo" />
                    <button onClick={handleGrabacion} className="btn-iniciar">
                        {grabando ? "Detener Grabación" : "Iniciar Grabación"}
                    </button>
                </div>
            )}
    
            {videoPrevisualizado && (
                <div className="estado-previsualizacion">
                    <div className="tarjeta-celeste">
                        <span className="titulo-seccion">video</span>
                        <video 
                            controls 
                            src={videoPrevisualizado} 
                            className="video-reproductor" 
                        />
                        
                        <img 
                            onClick={handleConfirmar} 
                            src={confirmar} 
                            alt="Confirmar" 
                            className="btn-confirmar-img" 
                        />
                    </div>
                </div>
            )}
    
        </div>
    )
}