import { useState, useRef } from 'react';

export default function SeleccionAudio () {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
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
    link.download = `grabacion_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Grabadora de Audio</h2>

      <div>
        {!isRecording ? (
          <button onClick={startRecording}>🎙️ Comenzar a Grabar</button>
        ) : (
          <button onClick={stopRecording}>⏹️ Detener Grabación</button>
        )}
      </div>

      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Audio grabado:</h3>
          <audio src={audioUrl} controls />
          <br />
          <button onClick={saveAudioFile} style={{ marginTop: '10px' }}>
            💾 Guardar Archivo
          </button>
        </div>
      )}
    </div>
  );
};