import React, { useState } from 'react';

export default function SeleccionarArchivo () {
    const [ videoPrevisualizado, setAudioPrevisualizado] = useState<string>('');

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                if (videoPrevisualizado) {
                    URL.revokeObjectURL(videoPrevisualizado);
                }
                setAudioPrevisualizado(URL.createObjectURL(file));
        }
    };

    return (
        <div>
            <input type="file" accept="audio/*" onChange={handleSeleccionarArchivo} />
            {videoPrevisualizado && (
                <audio controls src={videoPrevisualizado} />
            )}
            <button></button>
        </div>
    )
}