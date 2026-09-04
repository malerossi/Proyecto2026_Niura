import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createContext, useState } from 'react';
import RegistroPaciente from './frontend/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/registroMedico/registroMedico';
import { ListaRacha } from './frontend/racha/racha';
import { StreakIcon } from './frontend/racha/StreakIcon';
import RegistroCuidador from './frontend/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/inicioSesionCuidador/inicioSesionCuidador';
import SubirVideo from './frontend/SubirVideo/SubirVideo'
import BotonNotificacion from './frontend/notificaciones/notificaciones'
import Pendientes from './frontend/pendientes/pendientesMedico/pendientes'

interface ContextInicioPacienteType {
  nombre: string;
  setNombre: (nombre: string) => void;
}

export const ContextoInicioPaciente = createContext <ContextInicioPacienteType| null>(null);

function App() {

  const [nombre, setNombre] = useState<string>('');

  return (
    <ContextoInicioPaciente.Provider value={{nombre, setNombre}}>
      <BrowserRouter>
        <header className="flex items-center justify-between p-4 bg-slate-900">
          <StreakIcon count={Number(localStorage.getItem("rachaActual"))} />
        </header>

        <Routes>
          <Route path="/registroPaciente" element={<RegistroPaciente />} />
          <Route path="/racha" element={<ListaRacha />} />
          <Route path="/subirvideo" element={<SubirVideo />} />
          <Route path='/registroMedico' element={<RegistroMedico />} />
          <Route path='/registroCuidador' element= {<RegistroCuidador />} />
          <Route path='/inicioSesionCuidador' element= {<InicioSesionCuidador />} />
          <Route path='/inicioSesionPaciente' element= {<InicioSesionPaciente />} />
          <Route path='/inicioSesionMedico' element= {<InicioSesionMedico />} />
          <Route path='/notificaciones' element= {<BotonNotificacion />} />
          <Route path='/pendientespaciente' element= {<Pendientes/>} />
        </Routes>
      </BrowserRouter>
    </ContextoInicioPaciente.Provider>
  );
}

export default App;