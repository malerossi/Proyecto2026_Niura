import { createContext, type ReactNode, useContext, useState } from 'react';

interface contextoIMType {
    nombre: string;
    setNombre: (nombre: string) => void;
}

const ContextoIM = createContext<contextoIMType|(null)>(null);

interface ProviderProps {
    children: ReactNode;
}

export const MedicoProvider = ({children} : ProviderProps) => {
    const [ nombre, setNombre ] = useState <string> ('');

    return (
        <ContextoIM.Provider value={{ nombre, setNombre }}>
            {children}
        </ContextoIM.Provider>
    )
}

export const useMedico = () => {
    const contexto = useContext (ContextoIM);
    if (!contexto){
        throw ('Error al cargar el contexto. Revisar su implementación.')
    }
    return contexto;
}