import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confirmar from '../confirmarSeleccionEjercicio/btn-confirmar.png';
import './audio.css';

export default function SeleccionAudio() {
  const { type, id } = useParams();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Revisa los permisos de tu navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveAudioFile = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `grabacion_${type}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    navigate(`/paciente/seleccionAUDIO/seleccionarArchivo/${type}/${id}`);
  };

  return (
    <div className="grabadora-container">
      <h2 className="grabadora-title">Grabadora de Audio - Tipo: {type}</h2>
  
      {!audioUrl && (
        <button 
          className="btn-grabar" 
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? '⏹️ Detener Grabación' : '🎙️ Comenzar a Grabar'}
        </button>
      )}
  
      {audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          <audio src={audioUrl} controls style={{ marginBottom: '30px', width: '300px' }} />
          
          <img src={confirmar} className="btn-confirmar" onClick={saveAudioFile}>Confirmar</img>
        </div>
      )}
    </div>
  );
}