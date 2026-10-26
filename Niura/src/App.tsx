import './App.css';
import { Routes, Route } from 'react-router-dom';
import RegistroPaciente from './frontend/PACIENTE/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/MEDICO/registroMedico/registroMedico';
import { ListaRacha } from './frontend/racha/racha';
import RegistroCuidador from './frontend/CUIDADOR/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/MEDICO/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/PACIENTE/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/pages/inicioSesionCuidador/inicioSesionCuidador';
import BotonNotificacion from './frontend/pages/notificaciones/notificaciones';
import PendientesMedico from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import ChatSimplificado from './frontend/reddecontactos/reddecontactos';
import ChatSimplificadomiopaciente from './frontend/reddecontactos/lomio/redcontactos';
import CrearEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/crearEjercicio';
import AsignarEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import QuieresAsignarlo from './frontend/MEDICO/asignarEjercicio/tsx/quieresAsignarlo';
import Header from './frontend/components/header';
import PaginaGeneral from './frontend/pages/paginageneral/paginageneral';
import Elegirusuario from './frontend/pages/eleccion_de_usuario/elccion_de_usuario';
import Ejercitar from './frontend/PACIENTE/Ejercitar/ejercitarInicio';
import EleccionEjercicio from './frontend/PACIENTE/EleccionEjercicio/EleccionEjercicio';
import SeleccionDeEjercicios from './frontend/PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import ConfirmarSeleccionEjercicio from './frontend/PACIENTE/confirmarSeleccionEjercicio/confirmar';
import Video from './frontend/PACIENTE/seleccionVIDEO/subirVideo';
import SeleccionarArchivo from './frontend/PACIENTE/seleccionVIDEO/seleccionarArchivo';
import SeleccionAudio from './frontend/PACIENTE/seleccionAUDIO/audio';
import SeleccionVideo from './frontend/PACIENTE/seleccionVIDEO/video';
import PerfilPaciente from './frontend/pages/usuario_paciente/usuario_paciente';
import PerfilCuidador from './frontend/pages/usuario_cuidador/usuario_cuidador';
import Noticias from './frontend/pages/notificaciones/notificaciones_cuidador';
import Pacientes from './frontend/pages/Pacientes';
import DetallePaciente from './frontend/pages/DetallePaciente';
import Elegirinicio from './frontend/pages/eleccion_de_usuario/elegirinicio';
import NoticiasPaciente from './frontend/pages/notificaciones/notificaciones';
import AccionEjercitar from './frontend/PACIENTE/accionEjercitar/accionEjercitar';

// PROVIDERS
import { PacienteProvider } from './frontend/Contexts/contextPaciente';
import { MedicoProvider } from './frontend/Contexts/contextoMedico';
import { RachaProvider } from './frontend/Contexts/providerracha';
import { CuidadorProvider } from './frontend/Contexts/contextoCuidador';

function App() {
  return (
    <CuidadorProvider>
    <RachaProvider>
    <MedicoProvider>
      <PacienteProvider>
        <div className="min-h-screen w-full bg-[#C5DCEE] flex flex-col justify-between m-0 p-0 overflow-x-hidden">
          {/* Header global conectado con react-router */}
       
          <Header/>
          {/* Rutas de la aplicación */}
          <main className="flex-1 flex items-center justify-center p-4">
            <Routes>
            <Route path="/medico/pacient" element={<Pacientes />} />
            <Route path="/medico/pacient/:id" element={<DetallePaciente />} />
              <Route path="/cuidador/noticias" element={<Noticias />} />
              <Route path="/elegirinicio" element={<Elegirinicio/>} />
              <Route path="/medico/noticias" element={<Noticias />} />
              <Route path="/paciente/noticias" element={<NoticiasPaciente />} />
              <Route path="/" element={<PaginaGeneral />} />
              <Route path="/elegirusuario" element ={<Elegirusuario/>} />
              <Route path="/registroPaciente" element={<RegistroPaciente />} />
              <Route path="/seleccionAudio/:type" element={<SeleccionAudio />} />
              <Route path="/seleccionVideo/:type" element={<SeleccionVideo />} />
              <Route path="/paciente/racha" element={<ListaRacha />} />
              <Route path="/subirvideo" element={<Video />} />
              <Route path="/registroMedico" element={<RegistroMedico />} />
              <Route path="/registroCuidador" element={<RegistroCuidador />} />
              <Route path="/inicioSesionCuidador" element={<InicioSesionCuidador />} />
              <Route path="/inicioSesionPaciente" element={<InicioSesionPaciente />} />
              <Route path="/inicioSesionMedico" element={<InicioSesionMedico />} />
              <Route path="/paciente/notificaciones" element={<BotonNotificacion />} />
              <Route path="/pendientesmedico" element={<PendientesMedico />} />
              <Route path="/reddecontactos" element={<ChatSimplificado />} />
              <Route path="/paciente/reddecontactosmia" element={<ChatSimplificadomiopaciente />} />
              <Route path="/medico/reddecontactosmia" element={<ChatSimplificado />} />
              <Route path="/crearEjercicio" element={<CrearEjercicio />} />
              <Route path="/asignarEjercicio" element={<AsignarEjercicio />} />
              <Route path='/quieresAsignar' element={<QuieresAsignarlo />} />
              <Route path="/paciente/video/:id" element={<Video />} />
              <Route path="/paciente/seleccionarArchivo/:id" element={<SeleccionarArchivo />} />
              <Route path="/paciente/perfil" element={<PerfilPaciente />} />
              <Route path="/paciente/ejercitar" element={<Ejercitar />} />
              <Route path="/paciente/eleccionEjercicio" element={<EleccionEjercicio />} />
              <Route path="/paciente/seleccionDeEjercicios/:type" element={<SeleccionDeEjercicios />} />
              <Route path="/paciente/ejercicio/:type/:id" element={<ConfirmarSeleccionEjercicio />} />
              <Route path="/paciente/accionEjercitar/:type/:id" element={<AccionEjercitar />} />
              <Route path="/cuidador/perfil" element={<PerfilCuidador />} />

              
            </Routes>
          </main>
        </div>
      </PacienteProvider>
    </MedicoProvider>
    </RachaProvider>
    </CuidadorProvider>
  );
}

export default App;