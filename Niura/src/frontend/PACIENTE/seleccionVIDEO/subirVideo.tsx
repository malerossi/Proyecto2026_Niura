import React, { useState, useRef, useEffect } from 'react';

export default function Video() {
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
        <div>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '600px' }} />
            <div>
                <button onClick={handleGrabacion}>
                    {grabando ? "Detener Grabación" : "Iniciar Grabación"}
                </button>
                {videoPrevisualizado && (
                    <>
                        <video controls src={videoPrevisualizado} style={{ width: '100%', maxWidth: '600px' }} />
                        <button onClick={handleEnviarVideo}>Enviar Video</button>
                    </>
                )}
            </div>
        </div>
    )
}