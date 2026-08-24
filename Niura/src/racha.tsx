import * as React from 'react';
import { date } from 'zod';

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
  { fecha: new Date("2026-08-09T00:00:00"), completado: true },
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

  let rachaActual = 0;
  for (let i = 0; i < historialRacha.length; i++) {
    if (historialRacha[i].completado) {
      rachaActual++;
    } else {
      rachaActual = 0;
    }
  }

  const [mes, setMes] = React.useState(new Date().getMonth() + 1);
   return (
    <>
  <button onClick={() => setMes((c) => c - 1)}>-1</button>
      <div className="contenedor-racha">
        {historialRacha
          .filter((dia) => dia.fecha.getMonth() + 1 === mes)
          .map((dia, index) => (
            <React.Fragment key={index}>
              <img
                className="cuadrado-verde"
                src={dia.completado ? '/imagenes/Racha_prendida.png' : '/imagenes/Racha_apagada.png'}
                title={`${dia.fecha.getDate()}/${dia.fecha.getMonth() + 1}: ${
                  dia.completado ? 'Completado' : 'No completado'
                }`}
              />
              <p>mes {dia.fecha.getMonth() + 1}</p>
            </React.Fragment>
          ))}
      </div></>
    );
};