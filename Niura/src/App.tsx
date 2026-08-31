import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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



function App() {
  return (
    <BrowserRouter>
      {/* Encabezado con el icono integrado */}
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
        <Route path='/pendientesmedico' element= {<Pendientes/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;