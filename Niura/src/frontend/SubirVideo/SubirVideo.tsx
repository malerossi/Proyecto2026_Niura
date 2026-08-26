import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SubirVideo() {
    const [grabando, setGrabando] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const partesRef = useRef<Blob[]>([]);

    const handleGrabacion = async () => {

        if (!grabando) {
            try {
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

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "mi-video.webm";
                    a.click();

                    URL.revokeObjectURL(url);
                };

                recorder.start();

                setGrabando(true);

            } catch (error) {
                console.error(error);
                alert("No se pudo acceder a la cámara.");
            }
        } 
        
        else {
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

    return (
        <div className="GrabadorContainer">
            <video ref={videoRef} autoPlay playsInline muted className="previewVideo" />

            <button type="button" onClick={handleGrabacion} className="btnCamara">
                {grabando ? "⏹️ Terminar grabación" : "🎥 Empezar a grabar"}
            </button>
        </div>
    );
}

