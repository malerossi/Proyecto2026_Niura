import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegistroPaciente from './frontend/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/registroMedico/registroMedico';
import { ListaRacha } from './frontend/racha/racha';
import RegistroCuidador from './frontend/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/inicioSesionCuidador/inicioSesionCuidador';
import SubirVideo from './frontend/SubirVideo/SubirVideo';
import BotonNotificacion from './frontend/notificaciones/notificaciones';
import PendientesMedico from './frontend/asignarEjercicio/tsx/asignarEjercicio';
import ChatSimplificado from './frontend/reddecontactos/reddecontactos';
import ChatSimplificadomio from './frontend/reddecontactos/lomio/redcontactos';
import CrearEjercicio from './frontend/asignarEjercicio/tsx/crearEjercicio';
import AsignarEjercicio from './frontend/asignarEjercicio/tsx/asignarEjercicio';
import Header from './frontend/components/header';
// PROVIDERS
import { PacienteProvider } from './frontend/Contexts/contextPaciente';
import { MedicoProvider } from './frontend/Contexts/contextoMedico';

function App() {
  return (
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
              <Route path="/subirvideo" element={<SubirVideo />} />
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
            </Routes>
          </main>
        </div>
      </PacienteProvider>
    </MedicoProvider>
  );
}

export default App;