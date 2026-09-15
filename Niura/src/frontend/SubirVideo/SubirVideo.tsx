import React, { useState, useRef, useEffect } from 'react';

export default function SubirVideo() {
    const [grabando, setGrabando] = useState<boolean>(false);
    const [videoPrevisualizado, setVideoPrevisualizado] = useState<string>('');
    const [videoArchivo, setVideoArchivo] = useState<File | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const partesRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (grabando && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [grabando]);

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (videoPrevisualizado) {
                URL.revokeObjectURL(videoPrevisualizado);
            }
            setVideoArchivo(file);
            setVideoPrevisualizado(URL.createObjectURL(file));
        }
    };

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

                recorder.ondataavailable = (e: BlobEvent) => {
                    if (e.data.size > 0) {
                        partesRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const videoBlob = new Blob(partesRef.current, { type: "video/webm" });
                    const url = URL.createObjectURL(videoBlob);

                    const nombreArchivo = `grabacion_${Date.now()}.webm`;
                    const file = new File([videoBlob], nombreArchivo, { type: "video/webm" });

                    setVideoArchivo(file);
                    setVideoPrevisualizado(url);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = nombreArchivo;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
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

    const handleEnviarVideo = async () => {
        if (!videoArchivo) return;

        const formData = new FormData();
        formData.append('video', videoArchivo);

        try {
            console.log("Enviando archivo:", videoArchivo.name);
            alert("Video listo para subir al servidor.");
        } catch (error) {
            console.error("Error al subir el video:", error);
        }
    };

    return (
        <div className="GrabadorContainer">
            {grabando ? (
                <video ref={videoRef} autoPlay playsInline muted className="previewVideo" />
            ) : videoPrevisualizado ? (
                <video src={videoPrevisualizado} controls className="previewVideo" />
            ) : (
                <div className="videoPlaceholder">
                    <p>Graba un video o selecciona uno de tus archivos.</p>
                </div>
            )}

            <div className="acciones-container">
                <button type="button" onClick={handleGrabacion} className="btnCamara">
                    {grabando ? "⏹️ Terminar grabación" : "🎥 Empezar a grabar"}
                </button>

                {!grabando && (
                    <label className="btnArchivo">
                        Seleccionar del equipo
                        <input 
                            type="file" 
                            accept="video/*" 
                            onChange={handleSeleccionarArchivo} 
                            style={{ display: 'none' }} 
                        />
                    </label>
                )}

                {videoArchivo && !grabando && (
                    <button type="button" onClick={handleEnviarVideo} className="btnSubir">
                        Subir video ({videoArchivo.name})
                    </button>
                )}
            </div>
        </div>
    );
}