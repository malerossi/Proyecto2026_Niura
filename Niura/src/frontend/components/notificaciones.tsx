import { useEffect, useState } from "react";
import type { Tarea } from "../pendientes/pendientesMedico/pendientes";


export default function Notificaciones() {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    
    useEffect(() => {
        fetch("/api/mis-tareas")
            .then((res) => res.json())
            .then((data: Tarea[]) => setTareas(data))
            .catch(() => console.error("Sucedió un error con la conexión de la API. Verificar conexión."));
    }, []);
    return (
        <div className="notificacion">
            <h2>Notificaciones pendientes ({tareas.length})</h2>
            {tareas.length === 0 ? (
                <p>No tienes tareas pendientes</p>
            ) : (
                <p>{tareas.map((tarea) => (
                    <p key={tarea.id}>{tarea.titulo} {tarea.completada?}</p>
                ))}</p>
            )}
        </div>
    );
}