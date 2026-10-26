import './App.css';
import { Routes, Route } from 'react-router-dom';

// IMPORTS - AUTENTICACIÓN Y REGISTRO
import RegistroPaciente from './frontend/PACIENTE/registroPaciente/registroPaciente';
import RegistroMedico from './frontend/MEDICO/registroMedico/registroMedico';
import RegistroCuidador from './frontend/CUIDADOR/registroCuidador/registroCuidador';
import InicioSesionMedico from './frontend/MEDICO/inicioSesionMedico/inicioSesionMedico';
import InicioSesionPaciente from './frontend/PACIENTE/inicioSesionPaciente/inicioSesionPaciente';
import InicioSesionCuidador from './frontend/pages/inicioSesionCuidador/inicioSesionCuidador';
import Elegirusuario from './frontend/pages/eleccion_de_usuario/elccion_de_usuario';
import Elegirinicio from './frontend/pages/eleccion_de_usuario/elegirinicio';

// IMPORTS - MÉDICO
import AsignarEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/asignarEjercicio';
import CrearEjercicio from './frontend/MEDICO/asignarEjercicio/tsx/crearEjercicio';
import QuieresAsignarlo from './frontend/MEDICO/asignarEjercicio/tsx/quieresAsignarlo';
import Pacientes from './frontend/pages/Pacientes';
import DetallePaciente from './frontend/pages/DetallePaciente';

// IMPORTS - PACIENTE
import Ejercitar from './frontend/PACIENTE/Ejercitar/ejercitarInicio';
import EleccionEjercicio from './frontend/PACIENTE/EleccionEjercicio/EleccionEjercicio';
import SeleccionDeEjercicios from './frontend/PACIENTE/seleccionEjercicio/seleccionDeEjercicios';
import ConfirmarSeleccionEjercicio from './frontend/PACIENTE/confirmarSeleccionEjercicio/confirmar';
import AccionEjercitar from './frontend/PACIENTE/accionEjercitar/accionEjercitar';
import Video from './frontend/PACIENTE/seleccionVIDEO/subirVideo';
import SeleccionarArchivoVideo from './frontend/PACIENTE/seleccionVIDEO/seleccionarArchivo';
import SeleccionarArchivoAudio from './frontend/PACIENTE/seleccionAUDIO/seleccionarArchivoAudio';
import SeleccionAudio from './frontend/PACIENTE/seleccionAUDIO/audio';
import SeleccionVideo from './frontend/PACIENTE/seleccionVIDEO/video';
import PerfilPaciente from './frontend/pages/usuario_paciente/usuario_paciente';

// IMPORTS - CUIDADOR Y GENERAL
import PerfilCuidador from './frontend/pages/usuario_cuidador/usuario_cuidador';
import Noticias from './frontend/pages/notificaciones/notificaciones_cuidador';
import Pacientes from './frontend/pages/Pacientes';
import DetallePaciente from './frontend/pages/DetallePaciente';
import Elegirinicio from './frontend/pages/eleccion_de_usuario/elegirinicio';
import NoticiasPaciente from './frontend/pages/notificaciones/notificaciones';
import AccionEjercitar from './frontend/PACIENTE/accionEjercitar/accionEjercitar';
import GrabarVideo from './frontend/PACIENTE/seleccionVIDEO/subirVideo';
import GrabarAudio from './frontend/PACIENTE/seleccionAUDIO/audio';

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
              <Route path="/video" element={<Video />} />
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
              <Route path="/paciente/video/:type/:id" element={<Video />} />
              <Route path="/paciente/seleccionVIDEO/seleccionarArchivo/:type/:id" element={<SeleccionarArchivoVideo />} />
              <Route path="/paciente/seleccionAUDIO/seleccionarArchivo/:type/:id" element={<SeleccionarArchivoAudio />} />
              <Route path="/paciente/perfil" element={<PerfilPaciente />} />
              <Route path="/paciente/ejercitar" element={<Ejercitar />} />
              <Route path="/paciente/eleccionEjercicio" element={<EleccionEjercicio />} />
              <Route path="/paciente/seleccionDeEjercicios/:type" element={<SeleccionDeEjercicios />} />
              <Route path="/paciente/ejercicio/:type/:id" element={<ConfirmarSeleccionEjercicio />} />
              <Route path="/paciente/accionEjercitar/:type/:id" element={<AccionEjercitar />} />
              <Route path="/cuidador/perfil" element={<PerfilCuidador />} />
              <Route path="/paciente/seleccionVIDEO/grabarVideo/:type/:id" element={<GrabarVideo />} />
              <Route path="/paciente/seleccionAUDIO/grabarAudio/:type/:id" element={<GrabarAudio />} />
              
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