import * as React from 'react';

interface DiaRacha {
  fecha: string;
  completado: boolean;
}

const historialRacha: DiaRacha[] = [
  { fecha: "2026-08-10", completado: true },
  { fecha: "2026-08-11", completado: true },
  { fecha: "2026-08-12", completado: true },
  { fecha: "2026-08-13", completado: false }, // Este será rojo 🟥
  { fecha: "2026-08-14", completado: true },
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


  return (
    <div className="contenedor-racha">
      {historialRacha.map((dia, index) => (
        <> 
        <img 
          key={index} 
          className={"cuadrado-verde"} 
          src={`${dia.completado ? '/imagenes/Racha_prendida.png' : '/imagenes/Racha_apagada.png'}`}
          title={`${dia.fecha}: ${dia.completado ? 'Completado' : 'No completado'}`}
        />
        <p>
          
          {dia.fecha}
        </p>
       </>
      ))}
    </div>
  );
};