// no entiedno nada y polo me lo va a explicar yuuupiiiii 
// (ayuda es una emergencia que yo entienda esto principalmente por lo usable que es jaaa muchos l o l)

import React, { createContext, useContext, useState } from "react";

interface TareasContextType {
  ejercicioHecho: boolean;
  marcarEjercicioComoHecho: () => void;
}

const TareasContext = createContext<TareasContextType | null>(null);

export function TareasProvider({ children }: { children: React.ReactNode }) {
  const [ejercicioHecho, setEjercicioHecho] = useState(false);

  const marcarEjercicioComoHecho = () => setEjercicioHecho(true);

  return (
    <TareasContext.Provider value={{ ejercicioHecho, marcarEjercicioComoHecho }}>
      {children}
    </TareasContext.Provider>
  );
}

export const useTareas = () => {
  const context = useContext(TareasContext);
  if (!context) throw new Error("useTareas debe usarse dentro de TareasProvider");
  return context;
};