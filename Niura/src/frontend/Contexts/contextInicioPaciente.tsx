import { createContext, type ReactNode, useState } from 'react';

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