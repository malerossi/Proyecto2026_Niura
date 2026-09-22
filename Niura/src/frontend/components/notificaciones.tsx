import { useEffect, useState } from "react";


export default function Notificaciones() {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    
    useEffect(() => {
        fetch("/api/notificaciones")
        .then((res) => res.json())
        .then((data: Tarea[]) => setTareas(data))
        .catch((err) => console.error("Error al obtener notificaciones:", err));
    }, []);
}