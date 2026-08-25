import * as React from 'react';

interface DiaRacha {
  fecha: Date;
  completado: boolean;
}

export const historialRacha: DiaRacha[] = [
  // Julio
  { fecha: new Date("2026-07-15T00:00:00"), completado: true },
  { fecha: new Date("2026-07-16T00:00:00"), completado: true },
  { fecha: new Date("2026-07-17T00:00:00"), completado: true },
  { fecha: new Date("2026-07-18T00:00:00"), completado: true },
  { fecha: new Date("2026-07-19T00:00:00"), completado: true },
  { fecha: new Date("2026-07-20T00:00:00"), completado: true },
  { fecha: new Date("2026-07-21T00:00:00"), completado: true },
  { fecha: new Date("2026-07-22T00:00:00"), completado: true },
  { fecha: new Date("2026-07-23T00:00:00"), completado: true },
  { fecha: new Date("2026-07-24T00:00:00"), completado: true },
  { fecha: new Date("2026-07-25T00:00:00"), completado: true },
  { fecha: new Date("2026-07-26T00:00:00"), completado: true },
  { fecha: new Date("2026-07-27T00:00:00"), completado: true },
  { fecha: new Date("2026-07-28T00:00:00"), completado: true },
  { fecha: new Date("2026-07-29T00:00:00"), completado: true },
  { fecha: new Date("2026-07-30T00:00:00"), completado: true },
  { fecha: new Date("2026-07-31T00:00:00"), completado: true },

  // Agosto
  { fecha: new Date("2026-08-01T00:00:00"), completado: true },
  { fecha: new Date("2026-08-02T00:00:00"), completado: true },
  { fecha: new Date("2026-08-03T00:00:00"), completado: true },
  { fecha: new Date("2026-08-04T00:00:00"), completado: true },
  { fecha: new Date("2026-08-05T00:00:00"), completado: true },
  { fecha: new Date("2026-08-06T00:00:00"), completado: true },
  { fecha: new Date("2026-08-07T00:00:00"), completado: true },
  { fecha: new Date("2026-08-08T00:00:00"), completado: true },
  { fecha: new Date("2026-08-09T00:00:00"), completado: false },
  { fecha: new Date("2026-08-10T00:00:00"), completado: true },
  { fecha: new Date("2026-08-11T00:00:00"), completado: true },
  { fecha: new Date("2026-08-12T00:00:00"), completado: true },
  { fecha: new Date("2026-08-13T00:00:00"), completado: true },
  { fecha: new Date("2026-08-14T00:00:00"), completado: true },
  { fecha: new Date("2026-08-15T00:00:00"), completado: true },
  { fecha: new Date("2026-08-16T00:00:00"), completado: true },
  { fecha: new Date("2026-08-17T00:00:00"), completado: true },
  { fecha: new Date("2026-08-18T00:00:00"), completado: true },
  { fecha: new Date("2026-08-19T00:00:00"), completado: true },
  { fecha: new Date("2026-08-20T00:00:00"), completado: true },
  { fecha: new Date("2026-08-21T00:00:00"), completado: true },
  { fecha: new Date("2026-08-22T00:00:00"), completado: true },
  { fecha: new Date("2026-08-23T00:00:00"), completado: true },
  { fecha: new Date("2026-08-24T00:00:00"), completado: true },
];

export const ListaRacha = () => {
  const [rachaActual,setrachaactual]=React.useState(0)
  let rachamaxima=0;
  for (let i = 0; i < historialRacha.length; i++) {
    if (historialRacha[i].completado) {
      () => setrachaactual((c) => c + 1)
      console.log(rachaActual)
      if (rachaActual>rachamaxima){
        rachamaxima=rachaActual
      }
  
    } else {
      () => setrachaactual((c) => c = 0)
    }
  }

  const [mes, setMes] = React.useState(new Date().getMonth() + 1);

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
        {historialRacha
          .filter((dia) => dia.fecha.getMonth() + 1 === mes)
          .map((dia, index) => (
            <React.Fragment key={index}>
              <div>
                <img
                  className="cuadrado-verde"
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
<p>{rachamaxima}</p>
    </div>
  );
};