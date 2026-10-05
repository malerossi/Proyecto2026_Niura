import * as React from 'react';
import { useRacha } from '../Contexts/contextracha';

export const ListaRacha = () => {
  // Consumimos todo del contexto
  const { rachaActual, rachaMaxima, historial, toggleDia } = useRacha();

  const [mes, setMes] = React.useState(new Date().getMonth() + 1);

  React.useEffect(() => {
    const detectarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowLeft") {
        setMes((c) => c - 1);
      }

      if (evento.key === "ArrowRight") {
        setMes((c) => c + 1);
      }
    };

    window.addEventListener("keydown", detectarTecla);

    return () => {
      window.removeEventListener("keydown", detectarTecla);
    };
  }, []);

  return (
    <div className="relative min-h-screen">

      {/* BOTÓN ATRÁS */}
      <button
        onClick={() => setMes((c) => c - 1)}
        className="
          fixed left-4 top-1/2 -translate-y-1/2
          z-50
          flex h-16 w-16 items-center justify-center
          rounded-full
          bg-black/10
          text-4xl text-black/30
          backdrop-blur-sm
          transition-all duration-300
          hover:bg-black/20
          hover:text-black
          hover:scale-110
          cursor-pointer
        "
        aria-label="Mes anterior"
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* BOTÓN ADELANTE */}
      <button
        onClick={() => setMes((c) => c + 1)}
        className="
          fixed right-4 top-1/2 -translate-y-1/2
          z-50
          flex h-16 w-16 items-center justify-center
          rounded-full
          bg-black/10
          text-4xl text-black/30
          backdrop-blur-sm
          transition-all duration-300
          hover:bg-black/20
          hover:text-black
          hover:scale-110
          cursor-pointer
        "
        aria-label="Mes siguiente"
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* CONTENEDOR DE LA RACHA */}
      <div className="contenedor-racha">
        {historial
          .filter((dia) => dia.fecha.getMonth() + 1 === mes)
          .map((dia, index) => (
            <React.Fragment key={index}>
              <div>
                <img
                  className="cuadrado-verde cursor-pointer"
                  onClick={() => toggleDia(dia.fecha)}
                  src={
                    dia.completado
                      ? "/imagenes/Racha_prendida.png"
                      : "/imagenes/Racha_apagada.png"
                  }
                  title={`${dia.fecha.getDate()}/${dia.fecha.getMonth() + 1}: ${
                    dia.completado ? "Completado" : "No completado"
                  }`}
                />

                <p>{dia.fecha.getDate()}</p>
              </div>
            </React.Fragment>
          ))}
      </div>
      <p>la racha maxima es: {rachaMaxima}</p>
      <p>la racha actual es: {rachaActual}</p>
    </div>
  );
};