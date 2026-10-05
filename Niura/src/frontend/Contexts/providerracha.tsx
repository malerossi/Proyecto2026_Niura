import  { useState, useMemo, type ReactNode } from "react";
import { RachaContext, type DiaRacha } from "./contextracha";

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
  { fecha: new Date("2026-08-20T00:00:00"), completado: false },
  { fecha: new Date("2026-08-21T00:00:00"), completado: true },
  { fecha: new Date("2026-08-22T00:00:00"), completado: true },
  { fecha: new Date("2026-08-23T00:00:00"), completado: true },
  { fecha: new Date("2026-08-24T00:00:00"), completado: true },
];

const calcularRacha = (rachas: DiaRacha[]): [number, number] => {
  let rachamaxima = 0;
  let conteoRacha = 0;

  for (let i = 0; i < rachas.length; i++) {
    if (rachas[i].completado) {
      conteoRacha++;
      if (conteoRacha > rachamaxima) {
        rachamaxima = conteoRacha;
      }
    } else {
      conteoRacha = 0;
    }
  }

  return [conteoRacha, rachamaxima];
};

export function RachaProvider({ children }: { children: ReactNode }) {
  const [historial, setHistorial] = useState<DiaRacha[]>(historialRacha);

  // Calcula automáticamente la racha actual y máxima cada vez que cambia el historial
  const [rachaActual, rachaMaxima] = useMemo(
    () => calcularRacha(historial),
    [historial]
  );

  // Función para alternar el estado (completado/no completado) de un día
  const toggleDia = (fechaTarget: Date) => {
    setHistorial((prevHistorial) =>
      prevHistorial.map((dia) =>
        dia.fecha.getTime() === fechaTarget.getTime()
          ? { ...dia, completado: !dia.completado }
          : dia
      )
    );
  };

  return (
    <RachaContext.Provider
      value={{
        rachaActual,
        rachaMaxima,
        historial,
        toggleDia,
      }}
    >
      {children}
    </RachaContext.Provider>
  );
}