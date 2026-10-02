import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuieresAsignarlo () {
    const [ confirmar, setConfirmar] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleConfirmar = async() => {
        setConfirmar(true);
        navigate('/');
        
        try {
            const res = await fetch('/api/asignarEjercicio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmar })
            });

            if (!res.ok) {
                console.error("Error al asignar el ejercicio en el servidor");
            }
        }

        catch (error){
            console.error("Error de red al asignar el ejercicio");
        }
    };

    return (
        <div className='quieresAsignarlo'>
            <h1>¿Deseas asignar este ejercicio?</h1>
            <button className='botonConfirmar' onClick={handleConfirmar}>Confirmar</button>
        </div>
    )
}