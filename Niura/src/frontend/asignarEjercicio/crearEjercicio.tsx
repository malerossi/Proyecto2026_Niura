import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Asignar() {
    const [ nombre, setNombre ] = useState<string>('');
    const [ descripcion, setDescripcion ] = useState<string>('');
    const [ elementos, setElementos ] = useState<string>('');
    const [ video, setVideo ] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = e.target.files?.[0];
        setVideo(video)
    }

    const handleCrearEjercicio = () => {
        navigate('/asignarEjercicio')	
    }

    return (
        <div className='FormularioAgregarEjercicio'>
            <input type="text" value={nombre} required placeholder='Nombre' onChange={(e) => setNombre(e.target.value)}/>,
            <input type="text" value={descripcion} required placeholder='Descripción' onChange={(e) => setDescripcion(e.target.value)}/>
            <input type="text" value={elementos} required placeholder='Elementos' onChange={(e) => setElementos(e.target.value)}/>
            <input type="file" accept='video/*' onChange={handleSeleccionarArchivo}/>
            <button className='Crear Ejercicio' onClick={handleCrearEjercicio}>Crear Ejercicio</button>
        </div>
    )
}