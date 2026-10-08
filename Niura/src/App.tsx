import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegistroPaciente from './frontend/PACIENTE/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/MEDICO/registroMedico/registroMedico';
import { ListaRacha } from './frontend/racha/racha';
import RegistroCuidador from './frontend/CUIDADOR/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/MEDICO/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/PACIENTE/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/pages/inicioSesionCuidador/inicioSesionCuidador';
import Video from './frontend/PACIENTE/seleccionVIDEO/video';
import BotonNotificacion from './frontend/pages/notificaciones/notificaciones';
import PendientesMedico from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import ChatSimplificado from './frontend/reddecontactos/reddecontactos';
import ChatSimplificadomio from './frontend/reddecontactos/lomio/redcontactos';
import CrearEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/crearEjercicio';
import AsignarEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import QuieresAsignarlo from './frontend/MEDICO/asignarEjercicio/tsx/quieresAsignarlo';
import Header from './frontend/components/header';
// PROVIDERS
import { PacienteProvider } from './frontend/Contexts/contextPaciente';
import { MedicoProvider } from './frontend/Contexts/contextoMedico';
import { RachaProvider } from './frontend/Contexts/providerracha';

function App() {
  return (
    <RachaProvider>
    <MedicoProvider>
      <PacienteProvider>
        <div className="min-h-screen w-full bg-[#C5DCEE] flex flex-col justify-between m-0 p-0 overflow-x-hidden">
          {/* Header global conectado con react-router */}
          <Header />

          {/* Rutas de la aplicación */}
          <main className="flex-1 flex items-center justify-center p-4">
            <Routes>
              <Route path="/registroPaciente" element={<RegistroPaciente />} />
              <Route path="/racha" element={<ListaRacha />} />
              <Route path="/subirvideo" element={<Video />} />
              <Route path="/registroMedico" element={<RegistroMedico />} />
              <Route path="/registroCuidador" element={<RegistroCuidador />} />
              <Route path="/inicioSesionCuidador" element={<InicioSesionCuidador />} />
              <Route path="/inicioSesionPaciente" element={<InicioSesionPaciente />} />
              <Route path="/inicioSesionMedico" element={<InicioSesionMedico />} />
              <Route path="/notificaciones" element={<BotonNotificacion />} />
              <Route path="/pendientesmedico" element={<PendientesMedico />} />
              <Route path="/reddecontactos" element={<ChatSimplificado />} />
              <Route path="/reddecontactosmia" element={<ChatSimplificadomio />} />
              <Route path="/crearEjercicio" element={<CrearEjercicio />} />
              <Route path="/asignarEjercicio" element={<AsignarEjercicio />} />
              <Route path='/quieresAsignar' element={<QuieresAsignarlo />} />
            </Routes>
          </main>
        </div>
      </PacienteProvider>
    </MedicoProvider>
    </RachaProvider>
  );
}

export default App;