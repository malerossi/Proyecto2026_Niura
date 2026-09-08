import { createContext, type ReactNode, useContext, useState } from 'react';

interface contextoIPType {
    nombre: string;
    setNombre: (nombre:string) => void;
}

const ContextoIP = createContext <contextoIPType|(null)>(null);

interface ProviderProps {
    children: ReactNode;
}

export const InicioPacienteProvider = ({ children }: ProviderProps) => {
    const [nombre, setNombre] = useState<string>('');

    return (
        <ContextoIP.Provider value={{ nombre, setNombre }}>
          {children}
        </ContextoIP.Provider>
      );
}

export const useInicioPaciente = () => {
  const contexto = useContext (ContextoIP);
  if (!contexto) {
    throw ('Error al cargar el contexto. Revisar su implementación.')
  }
  return contexto;
}