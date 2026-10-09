import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegistroPaciente from './frontend/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/registroMedico/registroMedico';
import { ListaRacha } from './frontend/racha/racha';
import RegistroCuidador from './frontend/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/pages/inicioSesionCuidador/inicioSesionCuidador';
import Video from './frontend/seleccionVIDEO/video';
import BotonNotificacion from './frontend/pages/notificaciones/notificaciones';
import PendientesMedico from './frontend/asignarEjercicio/tsx/asignarEjercicio';
import ChatSimplificado from './frontend/reddecontactos/reddecontactos';
import ChatSimplificadomio from './frontend/reddecontactos/lomio/redcontactos';
import CrearEjercicio from './frontend/asignarEjercicio/tsx/crearEjercicio';
import AsignarEjercicio from './frontend/asignarEjercicio/tsx/asignarEjercicio';
import QuieresAsignarlo from './frontend/asignarEjercicio/tsx/quieresAsignarlo';
import Header from './frontend/components/header';
import PaginaGeneral from './frontend/pages/paginageneral/paginageneral';
import Elegirusuario from './frontend/pages/eleccion_de_usuario/elccion_de_usuario';
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
       
          <Header/>
          {/* Rutas de la aplicación */}
          <main className="flex-1 flex items-center justify-center p-4">
            <Routes>
              <Route path="/" element={<PaginaGeneral />} />
              <Route path="/elegirUsuario" element={<Elegirusuario/>} />
              <Route path="/registroPaciente" element={<RegistroPaciente />} />
              <Route path="/paciente/racha" element={<ListaRacha />} />
              <Route path="/paciente/subirvideo" element={<Video />} />
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