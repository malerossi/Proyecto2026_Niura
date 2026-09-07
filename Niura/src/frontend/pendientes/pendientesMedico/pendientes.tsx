import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Tarea = {
    id: string;
    titulo: string;
    tipo: "motriz" | "cognitiva";
    completada: boolean;
};

export default function Pendientes () {

  type filter = 'all' | 'motriz' | 'cognitiva';

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch ("/api/mis-tareas martiiiiinn")
    .then((res) => res.json())
    .then((data: Tarea[]) => setTareas(data))
    .catch(() => console.error("Sucedió un error con la conexión de la API. Verificar conexión."));
  }, [])

  const tareaMotriz = tareas.find((t) => t.tipo === "motriz");
  const tareaCognitiva = tareas.find((t) => t.tipo === "cognitiva");

  const renderMotriz = tareas.filter((t) => t.tipo === 'motriz');
  const renderCognitiva = tareas.filter((t) => t.tipo === 'cognitiva')

  const todoCompletado = tareas.length > 0 && tareas.every((t) => t.completada === true);

  const irAEjercicio = (tarea: Tarea) => {
    navigate(`/ejercicio/${tarea.tipo}/${tarea.id}`);
  };

  const EjerciciosDiarios = () => {
    navigate('/ejercicios')
  }

  return (
    <div className="Pendientes">
      <div className="PopMotivacional" onClick={() => EjerciciosDiarios()}>
        {todoCompletado ? (
        <h2>🎉 ¡Felicitaciones! Completaste tus tareas de hoy.</h2>
        ) : (
          <h2>💪 ¡Hora de tu entrenamiento diario!</h2>
        )}
      </div>
    
      {tareaMotriz && !tareaMotriz.completada && (
        <div
          className="PendientesMotriz"
          onClick={() => irAEjercicio(tareaMotriz)}
        >
          <span>🖐️ Tarea Motriz Pendiente: {tareaMotriz.titulo}</span>
          <p>Toca para hacer el ejercicio</p>
        </div>
      )}
    
      {tareaCognitiva && !tareaCognitiva.completada && (
        <div
          className="PendientesCognitiva"
          onClick={() => irAEjercicio(tareaCognitiva)}
        >
          <span>🧠 Tarea Cognitiva Pendiente: {tareaCognitiva.titulo}</span>
          <p>Toca para hacer el ejercicio &rarr;</p>
        </div>
      )}
    </div>
  )
}