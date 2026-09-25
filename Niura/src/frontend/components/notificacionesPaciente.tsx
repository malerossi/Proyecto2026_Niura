import type { Tarea } from "../pendientes/pendientesMedico/pendientesPaciente";

type NotificacionesProps = {
    tareas: Tarea[];
  };

export default function Notificaciones({tareas}: NotificacionesProps) {
    return (
        <div className="notificacion">
            <h2>Notificaciones pendientes ({tareas.length})</h2>
            {tareas.length === 0 ? (
                <p>No tienes tareas pendientes</p>
            ) : (
                <div>
                    {tareas.map((tarea) => (
                        <p> key={tarea.id} {tarea.titulo}</p>
                    ))}
                </div>
            )}
        </div>
    );
}