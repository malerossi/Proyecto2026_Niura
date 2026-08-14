import * as React from 'react';
// 1. Tipo para la información de un solo día 📅
interface DiaRacha {
    fecha: string;       // ej: "2026-08-14"
    completado: boolean; // true si cumplió la meta, false si no ❌/✅
  }
  
  // 2. Simulación de los datos que vendrían del backend 📦
  const historialRacha: DiaRacha[] = [
    { fecha: "2026-08-10", completado: true },
    { fecha: "2026-08-11", completado: true },
    { fecha: "2026-08-12", completado: true },
    { fecha: "2026-08-13", completado: false },
    { fecha: "2026-08-14", completado: true },
  ];
  export const ListaRacha = () => {
    return (
      <div className="contenedor-racha">
        {historialRacha.map((dia, index) => (
          <div 
            key={index} 
            className={dia.completado ? "clase-completado" : "clase-incompleto"}
          >
            {dia.fecha}
          </div>
        ))}
      </div>
    );
  };