import { useContext, createContext, type ReactNode, useState } from 'react';

interface contextoICType {
    nombre: string;
    setNombre: (nombre:string) => void;
}

const ContextoIC = createContext <contextoICType|(null)>(null);

interface ProviderProps {
    children: ReactNode;
}

export const CuidadorProvider = ({ children }: ProviderProps) => {
    const [nombre, setNombre] = useState<string>('');

    return (
        <ContextoIC.Provider value={{ nombre, setNombre }}>
          {children}
        </ContextoIC.Provider>
      );
}

export const useCuidador = () => {
  const contexto = useContext (ContextoIC);
  if (!contexto) {
    throw ('Error al cargar el contexto. Revisar su implementación.')
  }
  return contexto;
}