import React, { useState } from 'react';

export default function SeleccionarArchivo () {
    const [ videoPrevisualizado, setVideoPrevisualizado] = useState<string>('');
    const [videoArchivo, setVideoArchivo] = useState<File | null>(null);

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

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleSeleccionarArchivo} />
            {videoPrevisualizado && (
                <video controls src={videoPrevisualizado} />
            )}
        </div>
    )
}